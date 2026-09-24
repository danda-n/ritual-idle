import { ACTION_DEFS, type ActionId } from "../content/actions";
import { BUFF_DEFS } from "../content/buffs";
import type { ItemId } from "../content/items";
import { SHOP } from "../content/shop";
import type { UpgradeEffect } from "../content/types";
import type { GameState } from "./state";

// Every bonus in the game is computed here, so balance lives in one place.
// Sources so far: sanctum upgrades and timed buffs (released omens, minor rites).
// Followers and grimoire effects join later. `now` is the sim clock; it defaults to the last tick.

const HOUR = 60 * 60 * 1000;
export const BASE_OFFLINE_CAP_MS = 24 * HOUR;
export const BASE_OMEN_CAPACITY = 1;

function effects(state: GameState): UpgradeEffect[] {
  return state.upgrades.map((id) => SHOP[id].effect);
}

export function activeBuffs(state: GameState, now: number = state.lastTickAt) {
  return state.buffs.filter((b) => b.endsAt > now);
}

/** Speed multiplier for an action (1 = normal, 1.15 = 15% faster). Bonuses add up. */
export function speedMultiplier(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  const skill = ACTION_DEFS[id].skill;
  let bonus = 0;
  for (const e of effects(state)) if (e.kind === "speed" && e.skill === skill) bonus += e.bonus;
  for (const b of activeBuffs(state, now)) {
    bonus += BUFF_DEFS[b.id].speed?.[skill] ?? 0;
  }
  return 1 + bonus;
}

/** Time one repetition takes, after speed bonuses. */
export function actionDurationMs(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  return (ACTION_DEFS[id].seconds * 1000) / speedMultiplier(state, id, now);
}

/** Multiplier on an item's drop chance from active buffs (e.g. Still Night doubles burnt pages). */
export function chanceMultiplier(state: GameState, item: ItemId, now: number = state.lastTickAt): number {
  let mult = 1;
  for (const b of activeBuffs(state, now)) {
    mult *= BUFF_DEFS[b.id].chanceMultiplier?.[item] ?? 1;
  }
  return mult;
}

/** Chance of one extra unit on each guaranteed output (e.g. the drying rack). */
export function extraYieldChance(state: GameState, id: ActionId): number {
  const skill = ACTION_DEFS[id].skill;
  let chance = 0;
  for (const e of effects(state)) if (e.kind === "extra_yield" && e.skill === skill) chance += e.chance;
  return chance;
}

export function offlineCapMs(state: GameState): number {
  let cap = BASE_OFFLINE_CAP_MS;
  for (const e of effects(state)) if (e.kind === "offline_cap") cap = Math.max(cap, e.hours * HOUR);
  return cap;
}

export function omenCapacity(state: GameState): number {
  let cap = BASE_OMEN_CAPACITY;
  for (const e of effects(state)) if (e.kind === "omen_capacity") cap = Math.max(cap, e.capacity);
  return cap;
}
