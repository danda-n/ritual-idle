import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import type { SkillId } from "../content/skills";
import { OMENS, type OmenId } from "../content/omens";
import type { BuffId } from "../content/buffs";
import { INSIGHT_GAIN } from "../content/grimoire";
import { PAGES } from "../content/pages";
import { addInsight, readCurio, type Fragment } from "./grimoire";
import { actionDurationMs, actionInputs, buffLength, bulkExtra, byproducts, chanceMultiplier, doubleChance, everyNth, extraYieldChance, insightPerRep, omenChanceMultiplier, saveChance, xpBonus } from "./modifiers";
import { applyBuff, giveNoteGifts, grantOmen, pruneBuffs } from "./omens";
import { isRecipeKnown, isSkillUnlocked, pagesRead, revealNotes, type Note, type Page, type Step } from "./progress";
import { nextRandom } from "./rng";
import type { GameState } from "./state";
import { stepRite } from "./rite";
import { refillBoard } from "./village";
import { levelForXp, xpForLevel } from "./xp";

export type StopReason =
  | { kind: "rite_in_progress" }
  | { kind: "skill_locked" }
  | { kind: "recipe_unknown" }
  | { kind: "level_too_low"; level: number }
  | { kind: "missing_input"; item: ItemId };

/** What happened during an `advance` call — drives the "while you were away" summary. */
export interface Report {
  elapsedMs: number;
  actionsCompleted: number;
  xpGained: Partial<Record<SkillId, number>>;
  itemsGained: Partial<Record<ItemId, number>>;
  itemsUsed: Partial<Record<ItemId, number>>;
  levelUps: { skill: SkillId; from: number; to: number }[];
  notesRevealed: Note[];
  pagesRead: Page[];
  omensFound: OmenId[];
  /** Omens that appeared while the shelf was full. */
  omensLost: number;
  /** Insight toward hidden recipes (from pages past the story ones, and curios). */
  fragments: Fragment[];
  curioStories: string[];
  /** Repetitions that came up doubled (a talent). */
  doubled: number;
  /** Time spent performing the rite. */
  riteMs: number;
  /** Quality index if the rite finished during this span. */
  riteCompleted: number | null;
  /** Actions switched to by the fallback rule when work stopped. */
  fellBackTo: ActionId[];
  /** Stage steps claimed (rewards given). */
  stepsDone: Step[];
  stopped?: { action: ActionId; reason: StopReason };
}

export function emptyReport(): Report {
  return { elapsedMs: 0, actionsCompleted: 0, xpGained: {}, itemsGained: {}, itemsUsed: {}, levelUps: [], notesRevealed: [], pagesRead: [], omensFound: [], omensLost: 0, fragments: [], curioStories: [], doubled: 0, riteMs: 0, riteCompleted: null, fellBackTo: [], stepsDone: [] };
}

export function skillLevel(state: GameState, skill: SkillId): number {
  return levelForXp(state.skills[skill].xp, state.levelCap);
}

/** Why the action can't run right now, or null if it can. */
export function blockReason(state: GameState, id: ActionId): StopReason | null {
  const def = ACTION_DEFS[id];
  if (state.rite.performing) return { kind: "rite_in_progress" };
  if (!isSkillUnlocked(state, def.skill)) return { kind: "skill_locked" };
  if (!isRecipeKnown(state, id)) return { kind: "recipe_unknown" };
  if (skillLevel(state, def.skill) < def.level) return { kind: "level_too_low", level: def.level };
  for (const [item, qty] of Object.entries(actionInputs(state, id)) as [ItemId, number][]) {
    if ((state.inventory[item] ?? 0) < qty) return { kind: "missing_input", item };
  }
  return null;
}

/**
 * The action to switch to when `stopped` can't continue, or null to go idle.
 * Only ever an action that can run right now, and never the one that just stopped.
 */
export function fallbackFor(state: GameState, stopped: ActionId | null): ActionId | null {
  const f = state.settings.fallback;
  if (f === "stop") return null;
  const target = f === "last_gathering" ? state.lastGathering : f;
  if (!target || target === stopped || blockReason(state, target) !== null) return null;
  return target;
}

export function startAction(state: GameState, id: ActionId): GameState {
  return { ...state, active: { id, progress: 0 } };
}

export function stopAction(state: GameState): GameState {
  return { ...state, active: null };
}

function add<K extends string>(bag: Partial<Record<K, number>>, key: K, n: number) {
  bag[key] = (bag[key] ?? 0) + n;
}

/** A save talent (Steady hand…): a chance that this repetition uses no inputs. */
function savesInputs(state: GameState, id: ActionId, roll: () => number): boolean {
  const chance = saveChance(state, id);
  return chance > 0 && Object.keys(actionInputs(state, id)).length > 0 && roll() < chance;
}

/**
 * Roll one repetition's outputs, with every yield bonus: drop chances (buffs, find talents),
 * bulk (+1 of the main output), extra units on sure outputs (drying rack, Green thumb), every nth
 * (Dew-picked), byproducts (Wick ash) and doubles (outputs and XP). Rolls happen only for bonuses
 * the player has, so the random sequence is unchanged without them.
 */
export function rollOutputs(state: GameState, id: ActionId, now: number, roll: () => number): { items: Partial<Record<ItemId, number>>; doubled: boolean } {
  const def = ACTION_DEFS[id];
  const extra = extraYieldChance(state, id);
  const double = doubleChance(state, id);
  const doubled = double > 0 && roll() < double;
  const bulk = bulkExtra(state, id);
  const n = everyNth(state, id);
  const nth = n > 0 && ((state.stats.completed[id] ?? 0) + 1) % n === 0;
  const items: Partial<Record<ItemId, number>> = {};
  def.outputs.forEach((out, i) => {
    const sure = out.chance === undefined;
    if (!sure && roll() >= Math.min(1, out.chance! * chanceMultiplier(state, out.item, now, def.skill))) return;
    let qty = out.qty;
    if (sure) {
      if (i === 0) qty += bulk;
      if (extra > 0 && roll() < extra) qty += 1;
      if (nth) qty += 1;
    }
    if (doubled) qty *= 2;
    add(items, out.item, qty);
  });
  for (const b of byproducts(state, id)) if (roll() < b.chance) add(items, b.item, 1);
  return { items, doubled };
}

/**
 * Advance the simulation by `ms`. Pure: returns a new state plus a report.
 * The active action repeats until time runs out or it can no longer run.
 */
export interface AdvanceOptions {
  /** Extra speed while the player is away (the Dream pillow). 0.1 = 10% faster. */
  offlineSpeedBonus?: number;
}

export function advance(input: GameState, ms: number, opts: AdvanceOptions = {}): { state: GameState; report: Report } {
  const awaySpeed = 1 + (opts.offlineSpeedBonus ?? 0);
  const state = structuredClone(input);
  const report = emptyReport();
  report.elapsedMs = ms;
  let remaining = ms;
  /** The sim clock: wall-clock time the simulation has reached inside this call. */
  const clock = () => input.lastTickAt + (ms - remaining);
  const roll = () => {
    const [value, seed] = nextRandom(state.rngSeed);
    state.rngSeed = seed;
    return value;
  };


  refillBoard(state, clock());
  while ((state.active || state.rite.performing) && remaining > 0) {
    // The rite takes the whole action slot while it runs.
    if (state.rite.performing) {
      const { used, completedQuality } = stepRite(state, remaining, clock());
      remaining -= used;
      report.riteMs += used;
      if (completedQuality !== null) {
        report.riteCompleted = completedQuality;
        report.notesRevealed.push(...revealNotes(state, report.stepsDone));
        // The house keeps working: go back to the fallback action.
        const next = fallbackFor(state, null);
        if (next) {
          state.active = { id: next, progress: 0 };
          report.fellBackTo.push(next);
        }
      }
      continue;
    }
    const { id } = state.active!;
    const def = ACTION_DEFS[id];

    const active = state.active!;
    if (active.progress === 0) {
      const reason = blockReason(state, id);
      if (reason) {
        report.stopped = { action: id, reason };
        const next = fallbackFor(state, id);
        state.active = next ? { id: next, progress: 0 } : null;
        if (next) report.fellBackTo.push(next);
        continue;
      }
      if (ACTION_DEFS[id].skill === "herbalism" || ACTION_DEFS[id].skill === "scavenging") state.lastGathering = id;
    }

    const duration = actionDurationMs(state, id, clock()) / awaySpeed;
    const needed = (1 - active.progress) * duration;
    if (remaining < needed) {
      active.progress += remaining / duration;
      remaining = 0;
      break;
    }
    remaining -= needed;
    active.progress = 0;

    // The inputs may have been used elsewhere during the repetition (a request, the Circle).
    // Then this repetition makes nothing, and work moves on as if it had just stopped.
    const inputs = actionInputs(state, id);
    const missing = (Object.entries(inputs) as [ItemId, number][]).find(([item, qty]) => (state.inventory[item] ?? 0) < qty);
    if (missing) {
      report.stopped = { action: id, reason: { kind: "missing_input", item: missing[0] } };
      const next = fallbackFor(state, id);
      state.active = next ? { id: next, progress: 0 } : null;
      if (next) report.fellBackTo.push(next);
      continue;
    }

    // Complete one repetition: consume inputs, roll outputs, grant XP.
    const now = clock();
    const saved = savesInputs(state, id, roll);
    if (!saved) {
      for (const [item, qty] of Object.entries(inputs) as [ItemId, number][]) {
        state.inventory[item] = (state.inventory[item] ?? 0) - qty;
        add(report.itemsUsed, item, qty);
      }
    }
    const { items, doubled } = rollOutputs(state, id, now, roll);
    if (doubled) report.doubled++;
    for (const [item, qty] of Object.entries(items) as [ItemId, number][]) {
      // Curios go into the collection, not the pantry.
      if (item === "curio") {
        for (let i = 0; i < qty; i++) {
          const { story, fragment } = readCurio(state);
          report.curioStories.push(story);
          report.fragments.push(fragment);
        }
        continue;
      }
      add(state.inventory, item, qty);
      add(report.itemsGained, item, qty);
    }
    const skill = state.skills[def.skill];
    const before = levelForXp(skill.xp, state.levelCap);
    // XP past the chapter cap is not banked, so raising the cap never causes a sudden jump.
    // A bulk talent makes more at once and brings their XP; a double doubles it.
    const xp = Math.round(def.xp * (1 + xpBonus(state, id)) * (1 + bulkExtra(state, id)) * (doubled ? 2 : 1));
    const newXp = Math.min(skill.xp + xp, xpForLevel(state.levelCap));
    add(report.xpGained, def.skill, newXp - skill.xp);
    skill.xp = newXp;
    const after = levelForXp(skill.xp, state.levelCap);
    if (after > before) {
      const last = report.levelUps.find((l) => l.skill === def.skill);
      if (last) last.to = after;
      else report.levelUps.push({ skill: def.skill, from: before, to: after });
    }
    report.actionsCompleted++;
    if (def.buff) applyBuff(state, def.buff as BuffId, now, false, undefined, buffLength(state, def.skill));
    for (const omen of Object.keys(OMENS) as OmenId[]) {
      if (roll() >= OMENS[omen].dropChance * omenChanceMultiplier(state)) continue;
      if (grantOmen(state, omen)) report.omensFound.push(omen);
      else report.omensLost++;
    }

    const pagesBefore = pagesRead(state).length;
    add(state.stats.completed, id, 1);
    report.pagesRead.push(...pagesRead(state).slice(pagesBefore));
    // Past the story pages, each deciphered page carries a hint fragment.
    if (id === "decipher_page" && (state.stats.completed.decipher_page ?? 0) > PAGES.length) {
      report.fragments.push(addInsight(state, INSIGHT_GAIN.page, "page"));
    }
    // Marginalia and Footnotes (Scholarship talents): every page deciphered carries insight.
    const insight = insightPerRep(state, id);
    if (insight > 0) report.fragments.push(addInsight(state, insight, "page"));
    const notes = revealNotes(state, report.stepsDone);
    report.notesRevealed.push(...notes);
    report.omensFound.push(...giveNoteGifts(state, notes));
    refillBoard(state, clock());
    }

  state.lastTickAt = input.lastTickAt + ms;
  refillBoard(state, state.lastTickAt);
  pruneBuffs(state, state.lastTickAt);
  return { state, report };
}
