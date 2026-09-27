import { ACTION_DEFS, type ActionId } from "../content/actions";
import { PART_DEFS, PART_IDS, type PartId } from "../content/rite";
import { REQUESTS } from "../content/requests";
import { SHOP } from "../content/shop";
import { GRIMOIRE_DEFS } from "../content/grimoire";
import { UPGRADE_DEFS, UPGRADE_IDS, type UpgradeId } from "../content/upgrades";
import type { ItemId } from "../content/items";
import type { SkillId } from "../content/skills";
import { actionDurationMs, actionInputs, activeBuffs, bulkExtra, chanceMultiplier, doubleChance, extraYieldChance, xpBonus } from "./modifiers";
import { TALENT_LEVELS, TALENTS, type TalentEffect } from "../content/talents";
import { BUFF_DEFS } from "../content/buffs";
import { isDiscovered } from "./grimoire";
import { currentNote, isRecipeKnown, isSkillUnlocked, revealedNotes, type Step } from "./progress";
import { skillLevel } from "./simulate";
import type { GameState } from "./state";
import { xpForLevel } from "./xp";

// Read-only estimates for the UI: rates, ETAs and item lookups. Nothing here changes state.

const HOUR = 3_600_000;
const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];

export function repsPerHour(state: GameState, id: ActionId): number {
  return HOUR / actionDurationMs(state, id);
}

export function xpPerHour(state: GameState, id: ActionId): number {
  return repsPerHour(state, id) * ACTION_DEFS[id].xp * (1 + xpBonus(state, id)) * (1 + bulkExtra(state, id)) * (1 + doubleChance(state, id));
}

/** True if every input comes from a skill that's open (so nothing it needs is out of reach). */
function inputsInReach(state: GameState, id: ActionId): boolean {
  return (Object.keys(ACTION_DEFS[id].inputs) as ItemId[]).every((item) => {
    const skill = producingSkill(item);
    return skill === null || isSkillUnlocked(state, skill);
  });
}

/**
 * True if a gatherer's finds have a use you can see: an open Kindling part, a known recipe in an
 * open skill (whose own inputs are in reach), a request on the board, or a House project you can
 * work toward. Crafts always count.
 * So sweeping (ash) waits until Sigilcraft wants ash; the attic waits for Scholarship's pages.
 */
function outputWanted(state: GameState, id: ActionId): boolean {
  const def = ACTION_DEFS[id];
  if (Object.keys(def.inputs).length > 0) return true;
  // Whatever the current stage asks for always shows.
  const note = currentNote(state);
  if ("goal" in note && note.goal.kind === "complete" && note.goal.action === id) return true;
  if ("steps" in note && (note.steps as readonly Step[]).some((st) => st.goal.kind === "complete" && st.goal.action === id)) return true;
  const openParts = PART_IDS.filter((p) => !state.kindling.includes(p) && partOpen(state, p));
  const sure = def.outputs.filter((o) => o.chance === undefined || o.chance >= 0.3).map((o) => o.item);
  return sure.some(
    (item) =>
      openParts.some((p) => (PART_DEFS[p].items[item] ?? 0) > 0) ||
      ACTION_IDS.some((a) => a !== id && item in ACTION_DEFS[a].inputs && isSkillUnlocked(state, ACTION_DEFS[a].skill) && isRecipeKnown(state, a) && inputsInReach(state, a)) ||
      state.board.some((b) => b.request && item in REQUESTS[b.request].needs) ||
      openProjects(state).some((u) => (UPGRADE_DEFS[u].items[item] ?? 0) > 0),
  );
}

/** House projects on the board: not built, their prerequisite built (shown once Chandlery opens). */
export function openProjects(state: GameState): UpgradeId[] {
  if (!isSkillUnlocked(state, "chandlery")) return [];
  return UPGRADE_IDS.filter((id) => !state.upgrades.includes(id) && (!UPGRADE_DEFS[id].requires || state.upgrades.includes(UPGRADE_DEFS[id].requires as UpgradeId)));
}

/** A part is open once the note that asks for it has appeared. */
function partOpen(state: GameState, part: PartId): boolean {
  return revealedNotes(state).some((n) => "goal" in n && n.goal.kind === "place" && n.goal.part === part);
}

/**
 * Recipes the player can see in a skill: everything reached, plus the single next one.
 * Recipes further up stay out of sight until they're next, and so does anything needing an
 * ingredient from a skill that hasn't opened yet, or a gatherer whose finds have no use yet.
 */
export function revealedRecipes(state: GameState, skill: SkillId): ActionId[] {
  if (!isSkillUnlocked(state, skill)) return [];
  const level = skillLevel(state, skill);
  const known = ACTION_IDS.filter((id) => ACTION_DEFS[id].skill === skill && isRecipeKnown(state, id) && inputsInReach(state, id) && outputWanted(state, id)).sort((a, b) => ACTION_DEFS[a].level - ACTION_DEFS[b].level);
  // Everything reached, plus whatever comes at the next level (recipes can share a level).
  const next = known.find((id) => ACTION_DEFS[id].level > level);
  return known.filter((id) => ACTION_DEFS[id].level <= level || (next !== undefined && ACTION_DEFS[id].level === ACTION_DEFS[next].level));
}

export function isRecipeRevealed(state: GameState, id: ActionId): boolean {
  return revealedRecipes(state, ACTION_DEFS[id].skill).includes(id);
}

/**
 * What one repetition really gives, with every bonus applied: each output's chance (find talents,
 * projects, buffs; capped at 100%) and its sure quantity (bulk talents), plus what changed it.
 * `baseChance`/`baseQty` are the recipe's own numbers, so the UI can mark what a bonus changed.
 */
export interface EffectiveOutput {
  item: ItemId;
  qty: number;
  baseQty: number;
  chance?: number;
  baseChance?: number;
  /** Names of what changed this output ("Deep shelves", "Sealed salt crock", "Still Night"). */
  changedBy: string[];
}

export function effectiveOutputs(state: GameState, id: ActionId, now: number = state.lastTickAt): EffectiveOutput[] {
  const def = ACTION_DEFS[id];
  const bulk = bulkExtra(state, id);
  return def.outputs.map((o, i) => {
    if (o.chance === undefined) {
      const qty = o.qty + (i === 0 ? bulk : 0);
      return { item: o.item, qty, baseQty: o.qty, changedBy: qty !== o.qty ? talentNames(state, def.skill, (e) => e.kind === "bulk" && e.actions.includes(id)) : [] };
    }
    const chance = Math.min(1, o.chance * chanceMultiplier(state, o.item, now, def.skill));
    return { item: o.item, qty: o.qty, baseQty: o.qty, chance, baseChance: o.chance, changedBy: chance !== o.chance ? chanceSources(state, o.item, def.skill, now) : [] };
  });
}

/** Names of this skill's taken talents whose effects match. */
function talentNames(state: GameState, skill: SkillId, match: (e: TalentEffect) => boolean): string[] {
  return TALENT_LEVELS.flatMap((l) => {
    const side = state.talents[skill]?.[l];
    const t = side ? TALENTS[skill][l][side] : null;
    return t && t.effects.some(match) ? [t.name] : [];
  });
}

/** What makes an item's chance differ from the recipe's: find talents, projects, buffs. */
function chanceSources(state: GameState, item: ItemId, skill: SkillId, now: number): string[] {
  const out = talentNames(state, skill, (e) => e.kind === "find" && (!e.item || e.item === item));
  for (const u of state.upgrades) {
    const e = UPGRADE_DEFS[u].effect;
    if (e.kind === "find" && e.item === item) out.push(UPGRADE_DEFS[u].name);
  }
  for (const b of activeBuffs(state, now)) {
    const d = BUFF_DEFS[b.id];
    if (d.chanceMultiplier?.[item] || (b.skill === skill && d.blessSkill?.chanceMultiplier)) out.push(d.name);
  }
  return out;
}

/** Expected output per hour, counting drop chances and yield bonuses (every-nth and byproducts aside). */
export function outputPerHour(state: GameState, id: ActionId): { item: ItemId; perHour: number }[] {
  const reps = repsPerHour(state, id);
  const extra = extraYieldChance(state, id);
  const double = 1 + doubleChance(state, id);
  return effectiveOutputs(state, id).map((o) => {
    const qty = o.qty + (o.chance === undefined ? extra : 0);
    return { item: o.item, perHour: reps * (o.chance ?? 1) * qty * double };
  });
}

/** How long the inputs on hand last at this action, or null if it needs none. */
export function inputsLastMs(state: GameState, id: ActionId): number | null {
  const inputs = Object.entries(actionInputs(state, id)) as [ItemId, number][];
  if (inputs.length === 0) return null;
  const reps = Math.min(...inputs.map(([item, qty]) => Math.floor((state.inventory[item] ?? 0) / qty)));
  return reps * actionDurationMs(state, id);
}

/** Time to the next level doing this action, or null at the cap. */
export function timeToNextLevelMs(state: GameState, id: ActionId): number | null {
  const skill = ACTION_DEFS[id].skill;
  const level = skillLevel(state, skill);
  if (level >= state.levelCap) return null;
  const need = xpForLevel(level + 1) - state.skills[skill].xp;
  return Math.ceil(need / ACTION_DEFS[id].xp) * actionDurationMs(state, id);
}

/** The best XP-per-hour action the player can do in a skill right now (ignoring inputs). */
export function bestXpAction(state: GameState, skill: SkillId): ActionId | null {
  let best: ActionId | null = null;
  for (const id of ACTION_IDS) {
    const a = ACTION_DEFS[id];
    if (a.skill !== skill || a.level > skillLevel(state, skill) || !isRecipeKnown(state, id) || !isSkillUnlocked(state, skill)) continue;
    if (best === null || xpPerHour(state, id) > xpPerHour(state, best)) best = id;
  }
  return best;
}

/** Rough time to reach the level cap in a skill, doing its best action throughout. */
export function timeToCapMs(state: GameState, skill: SkillId): number | null {
  if (skillLevel(state, skill) >= state.levelCap) return null;
  const best = bestXpAction(state, skill);
  if (!best) return null;
  return ((xpForLevel(state.levelCap) - state.skills[skill].xp) / xpPerHour(state, best)) * HOUR;
}

export interface ItemLookup {
  madeBy: ActionId[];
  usedBy: ActionId[];
  sold: boolean;
  /** How many the Kindling's unplaced parts still ask for. */
  inKindling: number;
  /** Village requests that ask for it (by who is asking). */
  wantedBy: string[];
  /** Discovered grimoire recipes that use it. */
  inRecipes: string[];
  /** True if a hidden recipe or secret not yet found uses it (a tease, not a spoiler). */
  inUnfound: boolean;
}

export function lookupItem(state: GameState, item: ItemId): ItemLookup {
  const visible = (id: ActionId) => isRecipeRevealed(state, id);
  return {
    madeBy: ACTION_IDS.filter((id) => visible(id) && ACTION_DEFS[id].outputs.some((o) => o.item === item)),
    usedBy: ACTION_IDS.filter((id) => visible(id) && item in ACTION_DEFS[id].inputs),
    sold: Object.values(SHOP).some((e) => e.item === item),
    inKindling: PART_IDS.filter((p) => !state.kindling.includes(p)).reduce((n, p) => n + (PART_DEFS[p].items[item] ?? 0), 0),
    wantedBy: Object.values(REQUESTS).filter((r) => item in r.needs && r.minTrust <= state.trust).map((r) => r.from),
    inRecipes: (Object.keys(GRIMOIRE_DEFS) as (keyof typeof GRIMOIRE_DEFS)[])
      .filter((id) => isDiscovered(state, id) && (GRIMOIRE_DEFS[id].ingredients as string[]).includes(item))
      .map((id) => GRIMOIRE_DEFS[id].name),
    inUnfound: (Object.keys(GRIMOIRE_DEFS) as (keyof typeof GRIMOIRE_DEFS)[]).some(
      (id) => !isDiscovered(state, id) && (GRIMOIRE_DEFS[id].ingredients as string[]).includes(item),
    ),
  };
}

/** The trust at which the next, better requests start knocking, or null if none are left. */
export function nextTrustAt(state: GameState): number | null {
  const gates = Object.values(REQUESTS).map((r) => r.minTrust).filter((t) => t > state.trust);
  return gates.length > 0 ? Math.min(...gates) : null;
}

/** The skill that makes an item (its first producing action), or null for bought/found things. */
export function producingSkill(item: ItemId): SkillId | null {
  const id = ACTION_IDS.find((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
  return id ? ACTION_DEFS[id].skill : null;
}

/**
 * An action the player can see (on its skill's recipe list) that makes this item, preferring one
 * that can run right now. Recipes not yet revealed never count, so no shortcut starts them.
 */
export function producerAction(state: GameState, item: ItemId, canRun: (id: ActionId) => boolean): ActionId | null {
  const known = ACTION_IDS.filter((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item) && isRecipeRevealed(state, a));
  return known.find(canRun) ?? known[0] ?? null;
}
