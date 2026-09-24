import { BASE_QUALITY, HEARTH_RITE, QUALITIES, SKILLED_RITUALIST } from "../content/rite";
import type { ItemId } from "../content/items";
import type { SkillId } from "../content/skills";
import { activeBuffs, riteQualitySteps } from "./modifiers";
import { isRiteRevealed } from "./progress";
import type { GameState } from "./state";
import { levelForXp } from "./xp";

// The Chapter 1 Major Rite. It takes the action slot for 30 minutes of sim time, runs offline,
// and always succeeds; preparation only sets the outcome quality. Helpers mutate `state`.

export interface Shortfall {
  items: { item: ItemId; have: number; need: number }[];
  skills: { skill: SkillId; have: number; need: number }[];
}

export function riteShortfall(state: GameState): Shortfall {
  const items = (Object.entries(HEARTH_RITE.items) as [ItemId, number][])
    .map(([item, need]) => ({ item, have: state.inventory[item] ?? 0, need }))
    .filter((x) => x.have < x.need);
  const skills = (Object.entries(HEARTH_RITE.skills) as [SkillId, number][])
    .map(([skill, need]) => ({ skill, have: levelForXp(state.skills[skill].xp, state.levelCap), need }))
    .filter((x) => x.have < x.need);
  return { items, skills };
}

export function canBeginRite(state: GameState): string | null {
  if (!isRiteRevealed(state)) return "Grandmother's notes haven't reached the circle yet.";
  if (state.rite.completed) return "The circle is already awake.";
  if (state.rite.performing) return "The rite is already under way.";
  const s = riteShortfall(state);
  if (s.items.length > 0 || s.skills.length > 0) return "Something the rite needs is still missing.";
  return null;
}

const stillNightActive = (state: GameState, now: number) => activeBuffs(state, now).some((b) => b.id === "still_night");

/** Consume the components and start the rite (it replaces whatever you were doing). */
export function beginRite(state: GameState, now: number): void {
  for (const [item, qty] of Object.entries(HEARTH_RITE.items) as [ItemId, number][]) {
    state.inventory[item] = (state.inventory[item] ?? 0) - qty;
  }
  state.active = null;
  state.rite.performing = { elapsedMs: 0, stillNight: stillNightActive(state, now) };
}

/** If the rite is primed and everything is ready, begin it. Returns true if it began. */
export function beginIfPrimed(state: GameState, now: number): boolean {
  if (!state.rite.primed || canBeginRite(state) !== null) return false;
  beginRite(state, now);
  return true;
}

/** Quality index into QUALITIES for the rite as it stands. */
export function riteQuality(state: GameState, stillNight: boolean): number {
  let q = BASE_QUALITY + riteQualitySteps(state);
  if (stillNight) q++;
  if (levelForXp(state.skills.ritualism.xp, state.levelCap) >= SKILLED_RITUALIST) q++;
  return Math.min(q, QUALITIES.length - 1);
}

export function riteFactors(state: GameState, stillNight: boolean) {
  return [
    { label: "Still Night active during the rite", met: stillNight },
    { label: "The Hearth mark is discovered", met: riteQualitySteps(state) > 0 },
    { label: `Ritualism ${SKILLED_RITUALIST} or higher`, met: levelForXp(state.skills.ritualism.xp, state.levelCap) >= SKILLED_RITUALIST },
  ];
}

/**
 * Run the rite for up to `ms`. Returns the time it used and, if it finished, its quality.
 * Rewards are applied here.
 */
export function stepRite(state: GameState, ms: number, now: number): { used: number; completedQuality: number | null } {
  const p = state.rite.performing!;
  if (stillNightActive(state, now)) p.stillNight = true;
  const used = Math.min(ms, HEARTH_RITE.durationMs - p.elapsedMs);
  p.elapsedMs += used;
  if (p.elapsedMs < HEARTH_RITE.durationMs) return { used, completedQuality: null };

  const quality = riteQuality(state, p.stillNight);
  state.rite.performing = null;
  state.rite.primed = false;
  state.rite.completed = { quality, endingSeen: false };
  state.levelCap = Math.max(state.levelCap, HEARTH_RITE.rewards.levelCap);
  if (!state.followers.includes(HEARTH_RITE.rewards.follower)) state.followers.push(HEARTH_RITE.rewards.follower);
  return { used, completedQuality: quality };
}

/** Log lines revealed so far (for the running rite, or all of them once it's done). */
export function riteLog(state: GameState): string[] {
  if (state.rite.completed) return [...HEARTH_RITE.log.map(([, t]) => t), HEARTH_RITE.finale];
  const p = state.rite.performing;
  if (!p) return [];
  const f = p.elapsedMs / HEARTH_RITE.durationMs;
  return HEARTH_RITE.log.filter(([at]) => at <= f).map(([, t]) => t);
}
