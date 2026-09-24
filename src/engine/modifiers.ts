import { ACTION_DEFS, type ActionId } from "../content/actions";
import { BUFF_DEFS } from "../content/buffs";
import { FOLLOWERS } from "../content/followers";
import type { ItemId } from "../content/items";
import { SHOP } from "../content/shop";
import type { RequestDef, UpgradeEffect } from "../content/types";
import type { SkillId } from "../content/skills";
import { discoveredRewards } from "./grimoire";
import type { GameState } from "./state";
import { branchBonus, keystoneEffect } from "./talents";
import { levelForXp } from "./xp";

// Every bonus in the game is computed here, so balance lives in one place.
// Sources: skill levels, talents, sanctum upgrades, timed buffs (released omens, minor rites),
// followers and Grimoire rewards. `now` is the sim clock; it defaults to the last tick.

const HOUR = 60 * 60 * 1000;
export const BASE_OFFLINE_CAP_MS = 24 * HOUR;
export const BASE_OMEN_CAPACITY = 1;
/** Each level past 1 makes its skill's actions this much faster, compounding (1.01 = 1%). */
export const LEVEL_SPEED = 1.01;

function effects(state: GameState): UpgradeEffect[] {
  return state.upgrades.map((id) => SHOP[id].effect);
}

export function activeBuffs(state: GameState, now: number = state.lastTickAt) {
  return state.buffs.filter((b) => b.endsAt > now);
}

/** Speed from the skill's own level: 1% per level past 1, compounding. */
export function levelSpeed(state: GameState, skill: SkillId): number {
  return LEVEL_SPEED ** (levelForXp(state.skills[skill].xp, state.levelCap) - 1);
}

/**
 * Speed multiplier for an action (1 = normal, 1.15 = 15% faster). Bonuses add up, then the
 * skill's level speed multiplies the total.
 */
export function speedMultiplier(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  const skill = ACTION_DEFS[id].skill;
  let bonus = branchBonus(state, skill, "swift");
  for (const e of effects(state)) if (e.kind === "speed" && e.skill === skill) bonus += e.bonus;
  for (const b of activeBuffs(state, now)) {
    bonus += BUFF_DEFS[b.id].speed?.[skill] ?? 0;
  }
  // Followers "assist me": they help with whatever you're doing.
  for (const f of state.followers) {
    const def = FOLLOWERS[f];
    bonus += def.assist + (def.trait.skill === skill ? def.trait.bonus : 0);
  }
  return (1 + bonus) * levelSpeed(state, skill);
}

/** Time one repetition takes, after speed bonuses. */
export function actionDurationMs(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  return (ACTION_DEFS[id].seconds * 1000) / speedMultiplier(state, id, now);
}

/**
 * Multiplier on an item's drop chance from active buffs (e.g. Still Night doubles burnt pages),
 * and from the skill's Keen eye keystone when `skill` is given.
 */
export function chanceMultiplier(state: GameState, item: ItemId, now: number = state.lastTickAt, skill?: SkillId): number {
  const keystone = skill ? keystoneEffect(state, skill) : null;
  let mult = keystone?.kind === "find_chance" ? keystone.multiplier : 1;
  for (const b of activeBuffs(state, now)) {
    mult *= BUFF_DEFS[b.id].chanceMultiplier?.[item] ?? 1;
  }
  return mult;
}

/** Chance of one extra unit on each guaranteed output (the drying rack, the Plenty talent). */
export function extraYieldChance(state: GameState, id: ActionId): number {
  const skill = ACTION_DEFS[id].skill;
  let chance = branchBonus(state, skill, "plenty");
  for (const e of effects(state)) if (e.kind === "extra_yield" && e.skill === skill) chance += e.chance;
  return chance;
}

/** Chance of a critical (double output and XP), from the Fortune talent. */
export function criticalChance(state: GameState, id: ActionId): number {
  return branchBonus(state, ACTION_DEFS[id].skill, "fortune");
}

/** Extra XP as a fraction (the Devout keystone). */
export function xpBonus(state: GameState, id: ActionId): number {
  const k = keystoneEffect(state, ACTION_DEFS[id].skill);
  return k?.kind === "xp_bonus" ? k.bonus : 0;
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

// Grimoire rewards (docs/GRIMOIRE.md §8)

/** Extra speed while away, as a fraction (the Dream pillow: 0.1 = 10% faster offline). */
export function offlineBonus(state: GameState): number {
  let bonus = 0;
  for (const r of discoveredRewards(state)) if (r.kind === "offline_bonus") bonus += r.bonus;
  return bonus;
}

/** Extra rite outcome steps (the Hearth mark). */
export function riteQualitySteps(state: GameState): number {
  let steps = 0;
  for (const r of discoveredRewards(state)) if (r.kind === "rite_quality") steps += r.steps;
  return steps;
}

export function trustMultiplier(state: GameState): number {
  let mult = 1;
  for (const r of discoveredRewards(state)) if (r.kind === "trust_multiplier") mult *= r.multiplier;
  return mult;
}

/** Coin a request pays, after person-specific bonuses (Hana's soup lasts until the chapter ends). */
export function requestCoin(state: GameState, req: RequestDef<string>): number {
  let mult = 1;
  const chapterOver = state.rite.completed !== null;
  for (const r of discoveredRewards(state)) if (r.kind === "patron_coin" && r.from === req.from && !chapterOver) mult *= r.multiplier;
  return Math.round(req.coin * mult);
}
