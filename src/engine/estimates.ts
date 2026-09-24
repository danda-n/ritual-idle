import { ACTION_DEFS, type ActionId } from "../content/actions";
import { HEARTH_RITE } from "../content/rite";
import { REQUESTS } from "../content/requests";
import { SHOP } from "../content/shop";
import { GRIMOIRE_DEFS } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { SkillId } from "../content/skills";
import { actionDurationMs, chanceMultiplier, extraYieldChance } from "./modifiers";
import { isDiscovered } from "./grimoire";
import { isRecipeKnown, isSkillUnlocked } from "./progress";
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
  return repsPerHour(state, id) * ACTION_DEFS[id].xp;
}

/** Expected output per hour, counting drop chances and yield bonuses. */
export function outputPerHour(state: GameState, id: ActionId): { item: ItemId; perHour: number }[] {
  const reps = repsPerHour(state, id);
  const extra = extraYieldChance(state, id);
  return ACTION_DEFS[id].outputs.map((o) => {
    const chance = o.chance === undefined ? 1 : Math.min(1, o.chance * chanceMultiplier(state, o.item));
    const qty = o.qty + (o.chance === undefined ? extra : 0);
    return { item: o.item, perHour: reps * chance * qty };
  });
}

/** How long the inputs on hand last at this action, or null if it needs none. */
export function inputsLastMs(state: GameState, id: ActionId): number | null {
  const inputs = Object.entries(ACTION_DEFS[id].inputs) as [ItemId, number][];
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
  inRite: number;
  /** Village requests that ask for it (by who is asking). */
  wantedBy: string[];
  /** Discovered grimoire recipes that use it. */
  inRecipes: string[];
}

export function lookupItem(state: GameState, item: ItemId): ItemLookup {
  const visible = (id: ActionId) => isSkillUnlocked(state, ACTION_DEFS[id].skill) && isRecipeKnown(state, id);
  return {
    madeBy: ACTION_IDS.filter((id) => visible(id) && ACTION_DEFS[id].outputs.some((o) => o.item === item)),
    usedBy: ACTION_IDS.filter((id) => visible(id) && item in ACTION_DEFS[id].inputs),
    sold: Object.values(SHOP).some((e) => e.kind === "item" && e.item === item),
    inRite: (HEARTH_RITE.items[item] ?? 0),
    wantedBy: Object.values(REQUESTS).filter((r) => item in r.needs).map((r) => r.from),
    inRecipes: (Object.keys(GRIMOIRE_DEFS) as (keyof typeof GRIMOIRE_DEFS)[])
      .filter((id) => isDiscovered(state, id) && (GRIMOIRE_DEFS[id].ingredients as string[]).includes(item))
      .map((id) => GRIMOIRE_DEFS[id].name),
  };
}

/** The skill that makes an item (its first producing action), or null for bought/found things. */
export function producingSkill(item: ItemId): SkillId | null {
  const id = ACTION_IDS.find((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
  return id ? ACTION_DEFS[id].skill : null;
}

/** An action the player knows that makes this item, preferring one that can run right now. */
export function producerAction(state: GameState, item: ItemId, canRun: (id: ActionId) => boolean): ActionId | null {
  const known = ACTION_IDS.filter((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item) && isSkillUnlocked(state, ACTION_DEFS[a].skill) && isRecipeKnown(state, a));
  return known.find(canRun) ?? known[0] ?? null;
}
