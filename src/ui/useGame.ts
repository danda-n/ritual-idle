import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionId } from "../content/actions";
import { catchUp, type CatchUp } from "../engine/offline";
import { clearLocal, loadLocal, saveLocal } from "../engine/save";
import { advance, startAction, stopAction, type Report } from "../engine/simulate";
import { newGame, type GameState } from "../engine/state";

const TICK_MS = 100;
const AUTOSAVE_MS = 10_000;

/** Absences shorter than this don't get a "while you were away" summary. */
const SUMMARY_THRESHOLD_MS = 60_000;

const TOAST_MS = 8_000;

export interface Toast {
  id: number;
  title: string;
  text: string;
}

/** Gaps longer than this (sleeping laptop, hidden tab) go through the offline path so the cap applies. */
const OFFLINE_GAP_MS = 5 * 60_000;

function boot(): { state: GameState; away: CatchUp | null } {
  const saved = loadLocal();
  if (!saved) return { state: newGame(), away: null };
  const result = catchUp(saved, Date.now());
  return { state: result.state, away: result.awayMs >= SUMMARY_THRESHOLD_MS ? result : null };
}

/**
 * Owns the live game state: runs the tick loop on real elapsed time
 * (so throttled background tabs still progress correctly), autosaves,
 * and exposes the player's commands.
 */
export function useGame() {
  const [initial] = useState(boot);
  const [state, setState] = useState<GameState>(initial.state);
  const [away, setAway] = useState<CatchUp | null>(initial.away);
  const [lastStop, setLastStop] = useState<Report["stopped"]>();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  // New notes and pages pop up while playing; after an absence they appear in the summary instead.
  const announce = useCallback((report: Report) => {
    const fresh: Toast[] = [
      ...report.notesRevealed.map((n) => ({ id: nextToastId.current++, title: "A new note in the margin", text: n.text })),
      ...report.pagesRead.map((p) => ({ id: nextToastId.current++, title: `Page deciphered: ${p.title}`, text: p.text })),
    ];
    if (fresh.length === 0) return;
    setToasts((t) => [...t, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => setToasts((t) => t.filter((x) => !ids.has(x.id))), TOAST_MS);
  }, []);

  // The ref is the source of truth; React state mirrors it for rendering.
  const ref = useRef(initial.state);
  const commit = useCallback((next: GameState) => {
    ref.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const s = ref.current;
      const now = Date.now();
      const dt = now - s.lastTickAt;
      if (dt <= 0) return;
      if (dt > OFFLINE_GAP_MS) {
        const result = catchUp(s, now);
        if (result.awayMs >= SUMMARY_THRESHOLD_MS) setAway(result);
        else announce(result.report);
        commit(result.state);
        return;
      }
      const { state: next, report } = advance(s, dt);
      if (report.stopped) setLastStop(report.stopped);
      announce(report);
      commit(next);
    }, TICK_MS);
    const saveNow = () => saveLocal(ref.current);
    const autosave = setInterval(saveNow, AUTOSAVE_MS);
    const onVisibility = () => document.visibilityState === "hidden" && saveNow();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", saveNow);
    return () => {
      clearInterval(tick);
      clearInterval(autosave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", saveNow);
    };
  }, [commit, announce]);

  const start = useCallback((id: ActionId) => {
    setLastStop(undefined);
    commit(startAction(ref.current, id));
  }, [commit]);

  const stop = useCallback(() => commit(stopAction(ref.current)), [commit]);

  const load = useCallback((loaded: GameState) => {
    const result = catchUp(loaded, Date.now());
    commit(result.state);
    saveLocal(result.state);
  }, [commit]);

  const reset = useCallback(() => {
    clearLocal();
    const fresh = newGame();
    commit(fresh);
    saveLocal(fresh);
    setAway(null);
    setLastStop(undefined);
  }, [commit]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  // Stable identity so dialogs don't re-run their focus handling on every tick.
  const dismissAway = useCallback(() => setAway(null), []);

  return { state, away, dismissAway, lastStop, toasts, dismissToast, start, stop, load, reset };
}
