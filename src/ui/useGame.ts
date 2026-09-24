import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionId } from "../content/actions";
import { GRIMOIRE_DEFS, type GrimoireId } from "../content/grimoire";
import type { Result, Success } from "../engine/commands";
import { nextHintAt, progressOf, type Fragment } from "../engine/grimoire";
import { rewind } from "../engine/devtools";
import { OMENS } from "../content/omens";
import { HEARTH_RITE } from "../content/rite";
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

/** "A fragment for the Dream pillow", noting when it unlocked a clearer hint. */
function fragmentToast(state: GameState, f: Fragment): Omit<Toast, "id"> & { clearer: boolean } {
  const now = progressOf(state, f.recipe).insight;
  const threshold = nextHintAt(f.recipe, now - f.amount);
  const clearer = threshold !== null && now >= threshold;
  return {
    clearer,
    title: `A fragment: ${GRIMOIRE_DEFS[f.recipe].name}`,
    text: clearer ? "A clearer hint is waiting in the Grimoire." : `Insight ${now}${nextHintAt(f.recipe, now) ? ` of ${nextHintAt(f.recipe, now)}` : ""}.`,
  };
}

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
  const [discovery, setDiscovery] = useState<GrimoireId | null>(null);
  const nextToastId = useRef(0);

  const pushToasts = useCallback((items: Omit<Toast, "id">[]) => {
    if (items.length === 0) return;
    const fresh = items.map((t) => ({ ...t, id: nextToastId.current++ }));
    setToasts((t) => [...t, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => setToasts((t) => t.filter((x) => !ids.has(x.id))), TOAST_MS);
  }, []);

  // New notes and pages pop up while playing; after an absence they appear in the summary instead.
  const announce = useCallback(
    (report: Partial<Pick<Report, "notesRevealed" | "pagesRead" | "omensFound" | "omensLost" | "fragments" | "curioStories" | "riteStarted">>) =>
      pushToasts([
        ...(report.riteStarted ? [{ title: "The rite begins", text: `Everything was ready. The ${HEARTH_RITE.name} has begun.` }] : []),
        ...(report.curioStories ?? []).map((text) => ({ title: "A curio, read", text })),
        // Insight from the player's own attempts only toasts when it opens a clearer hint.
        ...(report.fragments ?? []).flatMap((f) => {
          const t = fragmentToast(ref.current, f);
          return f.source === "attempt" && !t.clearer ? [] : [t];
        }),
        ...(report.notesRevealed ?? []).map((n) => ({ title: "A new note in the margin", text: n.text })),
        ...(report.pagesRead ?? []).map((p) => ({ title: `Page deciphered: ${p.title}`, text: p.text })),
        ...(report.omensFound ?? []).map((o) => ({ title: `An omen: ${OMENS[o].name}`, text: "It waits on the shelf until you release it." })),
        ...(report.omensLost ? [{ title: "An omen passed unseen", text: "The shelf was full. A bigger shelf would hold more." }] : []),
      ]),
    [pushToasts],
  );

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

  /** Run a player command; refusals show as a toast instead of failing silently. */
  const act = useCallback(
    (command: (s: GameState) => Result): Success | null => {
      const r = command(ref.current);
      if (!r.ok) {
        pushToasts([{ title: "Not yet", text: r.reason }]);
        return null;
      }
      commit(r.state);
      saveLocal(r.state); // choices are saved at once, not on the next autosave
      if (r.aside) pushToasts([{ title: "They tell you something", text: r.aside }]);
      announce({ notesRevealed: r.notes, fragments: r.fragments });
      if (r.outcome?.kind === "discovered") setDiscovery(r.outcome.recipe);
      return r;
    },
    [commit, announce, pushToasts],
  );

  // Dev tools: pretend time passed (goes through the real offline path), or edit the state directly.
  const dev = {
    skip: (ms: number) => commit(rewind(ref.current, ms)),
    mutate: (fn: (s: GameState) => GameState) => commit(fn(structuredClone(ref.current))),
  };

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  // Stable identity so dialogs don't re-run their focus handling on every tick.
  const dismissAway = useCallback(() => setAway(null), []);
  const dismissDiscovery = useCallback(() => setDiscovery(null), []);

  return { state, away, dismissAway, discovery, dismissDiscovery, lastStop, toasts, dismissToast, start, stop, act, load, reset, dev };
}
