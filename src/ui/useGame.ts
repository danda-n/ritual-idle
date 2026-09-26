import { useCallback, useEffect, useRef, useState } from "react";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import { CURIO_STORIES, type GrimoireId } from "../content/grimoire";
import type { Result, Success } from "../engine/commands";
import { NOTES } from "../content/notes";
import { ITEMS, type ItemId } from "../content/items";
import { SKILL_IDS, SKILLS } from "../content/skills";
import { stepById } from "../engine/progress";
import { isRecipeKnown } from "../engine/progress";
import { emitFx } from "./fx";
import { isRareDrop, rewardText, unlockedByLevel } from "./tasks";
import type { Note } from "../engine/progress";
import { rewind } from "../engine/devtools";
import { OMENS } from "../content/omens";
import { buffDuration, buffEffects, upgradeEffectFor } from "./effects";
import { UPGRADE_DEFS } from "../content/upgrades";
import { PART_DEFS } from "../content/rite";
import { TALENT_LEVELS, TALENTS, type TalentLevel } from "../content/talents";
import { catchUp, type CatchUp } from "../engine/offline";
import { clearLocal, loadLocal, saveLocal } from "../engine/save";
import { advance, startAction, stopAction, type Report } from "../engine/simulate";
import { newGame, type GameState } from "../engine/state";

const TICK_MS = 100;
const AUTOSAVE_MS = 10_000;

/** Absences shorter than this don't get a "while you were away" summary. */
const SUMMARY_THRESHOLD_MS = 60_000;

const TOAST_MS = 8_000;
/** A beat between completing a step and its note appearing. */
const STORY_DELAY_MS = 800;

export interface Toast {
  id: number;
  title: string;
  text: string;
}

/** A line in the activity feed: the routine things that happen (steps, levels, omens, claims). */
export interface FeedEntry {
  id: number;
  text: string;
  at: number;
}

/** How many feed lines are kept (this session only; they aren't saved). */
const FEED_SIZE = 30;

/** Gaps longer than this (sleeping laptop, hidden tab) go through the offline path so the cap applies. */
const OFFLINE_GAP_MS = 5 * 60_000;

/**
 * Feedback for a player command, worked out from what changed. Two channels: `toast` for the big
 * moments (a part placed, a project built, a contract done), `log` for the rest (the feed).
 */
function celebrateCommand(before: GameState, after: GameState, toast: (t: Omit<Toast, "id">[]) => void, log: (lines: string[]) => void) {
  const coin = Math.floor(after.coin) - Math.floor(before.coin);
  if (coin > 0) emitFx({ kind: "float", text: `+${coin} coin`, anchors: [".purse"], tone: "coin" });
  const trust = Math.floor(after.trust) - Math.floor(before.trust);
  if (trust > 0) emitFx({ kind: "float", text: `+${trust} trust`, anchors: [".village .panel-aside"], tone: "good" });
  if (after.stats.requestsFilled > before.stats.requestsFilled) {
    const slot = after.board.findIndex((b, i) => b.request === null && before.board[i]?.request !== null);
    if (slot >= 0) emitFx({ kind: "helped", slot });
    toast([{ title: "Contract done", text: `+${coin} coin, and the village trusts you a little more.` }]);
  } else if (after.board.some((b, i) => JSON.stringify(b.delivered) !== JSON.stringify(before.board[i]?.delivered ?? {}))) {
    log(["Delivered part of a contract"]);
  }
  const bought = after.upgrades.filter((u) => !before.upgrades.includes(u));
  if (bought.length > 0) toast(bought.map((u) => ({ title: `${UPGRADE_DEFS[u].name} is built`, text: upgradeEffectFor(u) })));
  // A claimed step reward: say what it gave (and where an XP choice went).
  for (const id of before.rewardsWaiting.filter((r) => !after.rewardsWaiting.includes(r))) {
    const step = stepById(id);
    if (!step) continue;
    const into = SKILL_IDS.find((k) => after.skills[k].xp > before.skills[k].xp);
    const text = step.reward && "xpChoice" in step.reward && into ? `+${step.reward.xpChoice.amount} ${SKILLS[into].name} XP` : rewardText(step);
    log([`Claimed: ${text}`]);
    emitFx({ kind: "float", text, anchors: [".tracker"], tone: "good" });
  }
  const placed = after.kindling.filter((p) => !before.kindling.includes(p));
  for (const p of placed) emitFx({ kind: "placed", part: p });
  if (placed.length > 0) {
    toast(placed.map((p) => ({ title: `${PART_DEFS[p].name} is placed · ${after.kindling.length} of 5`, text: "" })));
  }
  if (after.rite.performing && !before.rite.performing) toast([{ title: "The rite begins", text: "It runs by itself, about three minutes. Stay or step away." }]);
  for (const k of SKILL_IDS) {
    for (const [lvl, side] of Object.entries(after.talents[k] ?? {})) {
      if (before.talents[k]?.[Number(lvl) as TalentLevel] !== side) log([`${SKILLS[k].name} talent: ${TALENTS[k][Number(lvl) as TalentLevel][side].name}`]);
    }
  }
}

function boot(): { state: GameState; away: CatchUp | null; fresh: boolean } {
  const saved = loadLocal();
  if (!saved) return { state: newGame(), away: null, fresh: true };
  const result = catchUp(saved, Date.now());
  return { state: result.state, away: result.awayMs >= SUMMARY_THRESHOLD_MS ? result : null, fresh: false };
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
  // Grandmother's notes appear as story beats, one at a time, a moment after the step that earned
  // them (so the step's own celebration can land first). A new game opens with the first.
  const [story, setStory] = useState<{ note: Note; at: number }[]>(() => (initial.fresh ? [{ note: NOTES[0] as Note, at: 0 }] : []));
  const nextToastId = useRef(0);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const nextFeedId = useRef(0);

  const log = useCallback((lines: string[]) => {
    if (lines.length === 0) return;
    const at = Date.now();
    const fresh = lines.map((text) => ({ id: nextFeedId.current++, text, at }));
    setFeed((f) => [...fresh.reverse(), ...f].slice(0, FEED_SIZE));
  }, []);

  const pushToasts = useCallback((items: Omit<Toast, "id">[]) => {
    if (items.length === 0) return;
    const fresh = items.map((t) => ({ ...t, id: nextToastId.current++ }));
    setToasts((t) => [...t, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => setToasts((t) => t.filter((x) => !ids.has(x.id))), (ref.current.settings.toastSeconds ?? TOAST_MS / 1000) * 1000);
  }, []);

  // New notes and pages pop up while playing; after an absence they appear in the summary instead.
  const announce = useCallback(
    (report: Partial<Pick<Report, "notesRevealed" | "pagesRead" | "omensFound" | "omensLost" | "fragments" | "curioStories" | "fellBackTo" | "itemsGained" | "levelUps" | "doubled" | "stepsDone">>) => {
      const notes = report.notesRevealed ?? [];
      if (notes.length > 0) setStory((q) => [...q, ...notes.map((note) => ({ note, at: Date.now() }))]);

      // Floating feedback: items from the running row, level-ups from the skill's tile.
      const fromWork = [".action-row.running .action-io", ".working"];
      for (const [item, n] of (Object.entries(report.itemsGained ?? {}) as [ItemId, number][]).slice(0, 3)) {
        if (n > 0) emitFx({ kind: "float", text: `+${n} ${ITEMS[item].name}`, anchors: fromWork, tone: isRareDrop(item) ? "rare" : "item" });
      }
      // Insight never toasts: a quiet float on the Grimoire tab, where it's spent.
      const insight = (report.fragments ?? []).reduce((n, f) => n + f.amount, 0);
      if (insight > 0) emitFx({ kind: "float", text: `+${insight} insight`, anchors: ["#tab-grimoire", ".tabs"], tone: "good" });
      if (report.doubled) emitFx({ kind: "float", text: "Doubled! ×2", anchors: fromWork, tone: "rare" });
      // Routine things go to the feed; toasts are kept for the big moments.
      const lines: string[] = [];
      for (const st of (report.stepsDone ?? []).filter((st) => st.goal.kind !== "place")) lines.push(`Step done: ${st.label}${st.reward ? ` · reward to claim: ${rewardText(st)}` : ""}`);
      const levelToasts: Omit<Toast, "id">[] = [];
      for (const l of report.levelUps ?? []) {
        emitFx({ kind: "float", text: `Level ${l.to}`, anchors: [`.skill-tile[data-skill="${l.skill}"]`, ".working"], tone: "level" });
        const opened = unlockedByLevel(l.skill, l.from, l.to, (id) => isRecipeKnown(ref.current, id));
        const points = TALENT_LEVELS.filter((t) => t > l.from && t <= l.to).length;
        const news = [
          ...(opened.length > 0 ? [`New: ${opened.map((id) => ACTION_DEFS[id].name).join(", ")}`] : []),
          ...(points > 0 ? [points > 1 ? `${points} talents to choose` : "A talent to choose"] : []),
        ];
        if (opened.length > 0) emitFx({ kind: "unlocked", ids: opened });
        // A new tier or a talent is a big moment; a plain level is a feed line.
        if (news.length > 0) levelToasts.push({ title: `${SKILLS[l.skill].name} ${l.to}`, text: news.join(" · ") });
        else lines.push(`${SKILLS[l.skill].name} reached level ${l.to}`);
      }
      const rareToasts = (Object.keys(report.itemsGained ?? {}) as ItemId[])
        .filter((item) => isRareDrop(item, 0.01))
        .map((item) => ({ title: `Rare find: ${ITEMS[item].name}`, text: "" }));
      for (const id of (report.fellBackTo ?? []).slice(0, 1)) lines.push(`Out of an ingredient: back to ${ACTION_DEFS[id].name.toLowerCase()}`);
      for (const p of report.pagesRead ?? []) if (p.unlocks.length === 0) lines.push(`Page deciphered: ${p.title}`);
      for (const o of report.omensFound ?? []) lines.push(`An omen: ${OMENS[o].name}, on the shelf (bless a skill: ${buffEffects(OMENS[o].buff).join(", ")}, ${buffDuration(OMENS[o].buff)})`);
      if (report.omensLost) lines.push("An omen passed unseen: the shelf was full");
      log(lines);
      pushToasts([
        ...levelToasts,
        ...rareToasts,
        ...(report.curioStories ?? []).map(() => ({ title: `Curio found (${ref.current.stats.curiosRead}/${CURIO_STORIES.length})`, text: "Read it in the Grimoire." })),
        ...(report.pagesRead ?? [])
          .filter((p) => p.unlocks.length > 0)
          .map((p) => ({ title: `Page deciphered: ${p.title}`, text: `New recipe: ${p.unlocks.map((a) => ACTION_DEFS[a].name).join(", ")}.` })),
      ]);
    },
    [pushToasts, log],
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
        // Commit first, so announcements read the new state.
        commit(result.state);
        if (result.awayMs >= SUMMARY_THRESHOLD_MS) setAway(result);
        else announce(result.report);
        return;
      }
      const { state: next, report } = advance(s, dt);
      commit(next);
      if (report.stopped) setLastStop(report.stopped);
      announce(report);
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
        pushToasts([{ title: r.reason, text: "" }]);
        return null;
      }
      const before = ref.current;
      commit(r.state);
      saveLocal(r.state); // choices are saved at once, not on the next autosave
      celebrateCommand(before, r.state, pushToasts, log);
      if (r.aside) pushToasts([{ title: "They tell you something", text: r.aside }]);
      announce({ notesRevealed: r.notes, fragments: r.fragments, omensFound: r.gifts, stepsDone: r.steps });
      if (r.outcome?.kind === "discovered") setDiscovery(r.outcome.recipe);
      return r;
    },
    [commit, announce, pushToasts, log],
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
  const dismissStory = useCallback(() => setStory((q) => q.slice(1)), []);

  return { state, away, dismissAway, discovery, dismissDiscovery, story: story[0] && Date.now() - story[0].at >= STORY_DELAY_MS ? story[0].note : null, dismissStory, lastStop, toasts, dismissToast, notify: pushToasts, feed, start, stop, act, load, reset, dev };
}
