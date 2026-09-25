import { HEARTH_RITE, OFFERINGS, PART_IDS, QUALITY_AT, RITE_MS, type OfferingId, type PartId } from "../content/rite";
import type { SkillId } from "../content/skills";
import { activeBuffs, riteQualitySteps } from "./modifiers";
import { isRiteRevealed } from "./progress";
import type { GameState } from "./state";
import { levelForXp } from "./xp";

// The Chapter 1 Major Rite. Its parts are placed in the Circle one by one (see `placePart`); once
// all are placed and Ritualism is high enough, it takes the action slot for five short phases and
// runs by itself, offline too. Optional offerings set its quality, which changes only cosmetics
// and lore. It never fails. Helpers mutate `state`.

export interface Shortfall {
  /** Kindling parts not yet placed in the Circle. */
  parts: PartId[];
  skills: { skill: SkillId; have: number; need: number }[];
}

export function riteShortfall(state: GameState): Shortfall {
  const parts = PART_IDS.filter((p) => !state.kindling.includes(p));
  const skills = (Object.entries(HEARTH_RITE.skills) as [SkillId, number][])
    .map(([skill, need]) => ({ skill, have: levelForXp(state.skills[skill].xp, state.levelCap), need }))
    .filter((x) => x.have < x.need);
  return { parts, skills };
}

export function canBeginRite(state: GameState): string | null {
  if (!isRiteRevealed(state)) return "Grandmother's notes haven't reached the circle yet.";
  if (state.rite.completed) return "The circle is already awake.";
  if (state.rite.performing) return "The rite is already under way.";
  const s = riteShortfall(state);
  if (s.parts.length > 0) return "Every part of the Kindling must be placed first.";
  if (s.skills.length > 0) return "Your Ritualism isn't high enough yet.";
  return null;
}

const omenActive = (state: GameState, now: number) => activeBuffs(state, now).some((b) => b.id === "still_night");

/** Offerings that count for this rite right now (for the card before it begins, or while it runs). */
export function offeringsMet(state: GameState, chosen: readonly OfferingId[] = state.rite.performing?.offered ?? []): OfferingId[] {
  const p = state.rite.performing;
  return OFFERINGS.filter((o) => {
    if (o.id === "hearth_candle") return chosen.includes("hearth_candle");
    if (o.id === "hearth_mark") return riteQualitySteps(state) > 0;
    return p?.omen || omenActive(state, state.lastTickAt);
  }).map((o) => o.id);
}

/** Why an item offering can't be made right now, or null if it can. */
export function canOffer(state: GameState, id: OfferingId): string | null {
  const o = OFFERINGS.find((x) => x.id === id)!;
  if (!("item" in o)) return "That one counts by itself.";
  return (state.inventory[o.item] ?? 0) >= 1 ? null : `Needs a ${o.item.replace(/_/g, " ")}.`;
}

/** Start the rite (it replaces whatever you were doing), using any chosen item offerings. */
export function beginRite(state: GameState, now: number, offer: readonly OfferingId[] = []): void {
  const offered = offer.filter((id) => canOffer(state, id) === null);
  for (const id of offered) {
    const o = OFFERINGS.find((x) => x.id === id)!;
    if ("item" in o) state.inventory[o.item] = (state.inventory[o.item] ?? 0) - 1;
  }
  state.active = null;
  state.rite.performing = { phase: 0, phaseMs: 0, offered, omen: omenActive(state, now) };
}

/** Quality index into QUALITIES: no offerings → Sound, 1–2 → Fine, all 3 → Resplendent. */
export function qualityFor(offerings: number): number {
  return offerings >= QUALITY_AT.resplendent ? 2 : offerings >= QUALITY_AT.fine ? 1 : 0;
}

export function riteQuality(state: GameState, chosen?: readonly OfferingId[]): number {
  return qualityFor(offeringsMet(state, chosen).length);
}

/**
 * Run the rite for up to `ms`. Returns the time it used and, if it finished, its quality.
 * Rewards are applied here.
 */
export function stepRite(state: GameState, ms: number, now: number): { used: number; completedQuality: number | null } {
  const p = state.rite.performing!;
  if (omenActive(state, now)) p.omen = true;
  const done = p.phase * HEARTH_RITE.phaseMs + p.phaseMs;
  const used = Math.min(ms, RITE_MS - done);
  const total = done + used;
  p.phase = Math.min(HEARTH_RITE.phases.length, Math.floor(total / HEARTH_RITE.phaseMs));
  p.phaseMs = total - p.phase * HEARTH_RITE.phaseMs;
  if (total < RITE_MS) return { used, completedQuality: null };

  const quality = riteQuality(state);
  state.rite.performing = null;
  state.rite.completed = { quality, endingSeen: false };
  state.levelCap = Math.max(state.levelCap, HEARTH_RITE.rewards.levelCap);
  if (!state.followers.includes(HEARTH_RITE.rewards.follower)) state.followers.push(HEARTH_RITE.rewards.follower);
  return { used, completedQuality: quality };
}

/** Log lines so far: one per phase reached (all of them, and the finale, once it's done). */
export function riteLog(state: GameState): string[] {
  if (state.rite.completed) return [...HEARTH_RITE.phases.map((ph) => ph.log), HEARTH_RITE.finale];
  const p = state.rite.performing;
  if (!p) return [];
  return HEARTH_RITE.phases.slice(0, p.phase + 1).map((ph) => ph.log);
}
