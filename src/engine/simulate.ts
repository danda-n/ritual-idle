import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import type { SkillId } from "../content/skills";
import { OMENS, type OmenId } from "../content/omens";
import type { BuffId } from "../content/buffs";
import { actionDurationMs, chanceMultiplier, extraYieldChance } from "./modifiers";
import { applyBuff, giveNoteGifts, grantOmen, pruneBuffs } from "./omens";
import { isRecipeKnown, isSkillUnlocked, pagesRead, revealNotes, type Note, type Page } from "./progress";
import { nextRandom } from "./rng";
import type { GameState } from "./state";
import { refillBoard } from "./village";
import { levelForXp, xpForLevel } from "./xp";

export type StopReason =
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
  stopped?: { action: ActionId; reason: StopReason };
}

export function emptyReport(): Report {
  return { elapsedMs: 0, actionsCompleted: 0, xpGained: {}, itemsGained: {}, itemsUsed: {}, levelUps: [], notesRevealed: [], pagesRead: [], omensFound: [], omensLost: 0 };
}

export function skillLevel(state: GameState, skill: SkillId): number {
  return levelForXp(state.skills[skill].xp, state.levelCap);
}

/** Why the action can't run right now, or null if it can. */
export function blockReason(state: GameState, id: ActionId): StopReason | null {
  const def = ACTION_DEFS[id];
  if (!isSkillUnlocked(state, def.skill)) return { kind: "skill_locked" };
  if (!isRecipeKnown(state, id)) return { kind: "recipe_unknown" };
  if (skillLevel(state, def.skill) < def.level) return { kind: "level_too_low", level: def.level };
  for (const [item, qty] of Object.entries(def.inputs) as [ItemId, number][]) {
    if ((state.inventory[item] ?? 0) < qty) return { kind: "missing_input", item };
  }
  return null;
}

export function startAction(state: GameState, id: ActionId): GameState {
  return { ...state, active: { id, elapsedMs: 0 } };
}

export function stopAction(state: GameState): GameState {
  return { ...state, active: null };
}

function add<K extends string>(bag: Partial<Record<K, number>>, key: K, n: number) {
  bag[key] = (bag[key] ?? 0) + n;
}

/**
 * Advance the simulation by `ms`. Pure: returns a new state plus a report.
 * The active action repeats until time runs out or it can no longer run.
 */
export function advance(input: GameState, ms: number): { state: GameState; report: Report } {
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
  while (state.active && remaining > 0) {
    const { id } = state.active;
    const def = ACTION_DEFS[id];

    if (state.active.elapsedMs === 0) {
      const reason = blockReason(state, id);
      if (reason) {
        report.stopped = { action: id, reason };
        state.active = null;
        break;
      }
    }

    const needed = actionDurationMs(state, id, clock()) - state.active.elapsedMs;
    if (remaining < needed) {
      state.active.elapsedMs += remaining;
      remaining = 0;
      break;
    }
    remaining -= needed;
    state.active.elapsedMs = 0;

    // Complete one repetition: consume inputs, roll outputs, grant XP.
    for (const [item, qty] of Object.entries(def.inputs) as [ItemId, number][]) {
      state.inventory[item] = (state.inventory[item] ?? 0) - qty;
      add(report.itemsUsed, item, qty);
    }
    const extra = extraYieldChance(state, id);
    const now = clock();
    for (const out of def.outputs) {
      if (out.chance !== undefined && roll() >= Math.min(1, out.chance * chanceMultiplier(state, out.item, now))) continue;
      // Yield bonuses (e.g. the drying rack) only apply to guaranteed outputs.
      const qty = out.qty + (out.chance === undefined && extra > 0 && roll() < extra ? 1 : 0);
      add(state.inventory, out.item, qty);
      add(report.itemsGained, out.item, qty);
    }
    const skill = state.skills[def.skill];
    const before = levelForXp(skill.xp, state.levelCap);
    // XP past the chapter cap is not banked, so raising the cap never causes a sudden jump.
    const newXp = Math.min(skill.xp + def.xp, xpForLevel(state.levelCap));
    add(report.xpGained, def.skill, newXp - skill.xp);
    skill.xp = newXp;
    const after = levelForXp(skill.xp, state.levelCap);
    if (after > before) {
      const last = report.levelUps.find((l) => l.skill === def.skill);
      if (last) last.to = after;
      else report.levelUps.push({ skill: def.skill, from: before, to: after });
    }
    report.actionsCompleted++;
    if (def.buff) applyBuff(state, def.buff as BuffId, now, false);
    for (const omen of Object.keys(OMENS) as OmenId[]) {
      if (roll() >= OMENS[omen].dropChance) continue;
      if (grantOmen(state, omen)) report.omensFound.push(omen);
      else report.omensLost++;
    }

    const pagesBefore = pagesRead(state).length;
    add(state.stats.completed, id, 1);
    report.pagesRead.push(...pagesRead(state).slice(pagesBefore));
    const notes = revealNotes(state);
    report.notesRevealed.push(...notes);
    report.omensFound.push(...giveNoteGifts(state, notes));
    refillBoard(state, clock());
  }

  state.lastTickAt = input.lastTickAt + ms;
  refillBoard(state, state.lastTickAt);
  pruneBuffs(state, state.lastTickAt);
  return { state, report };
}
