import { HEARTH_RITE, OFFERINGS, PART_IDS, QUALITIES, QUALITY_AT, RITE_MS, TEND_MAX_MS, TEND_MS, type OfferingId, type PartId } from "../content/rite";
import { SKILLS, type SkillId } from "../content/skills";
import { activeBuffs, riteQualitySteps } from "./modifiers";
import { isRiteRevealed } from "./progress";
import type { GameState } from "./state";
import { levelForXp } from "./xp";

const QUALITY_RESPLENDENT = QUALITIES.indexOf("Resplendent");

// The Chapter 1 Major Rite. Its parts are placed in the Circle one by one (see `placePart`); once
// all are placed and Ritualism is high enough, it takes the action slot for five short phases and
// runs by itself, offline too. Optional offerings set its quality, which changes only keepsakes
// and a cosmetic. It never fails. Helpers mutate `state`.

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
  if (!isRiteRevealed(state)) return "Not unlocked yet";
  if (state.rite.completed) return "The circle is already awake.";
  if (state.rite.performing) return "The rite is already under way.";
  const s = riteShortfall(state);
  if (s.parts.length > 0) return "Every part of the Kindling must be placed first.";
  if (s.skills.length > 0) return s.skills.map((x) => `Needs ${SKILLS[x.skill].name} ${x.need}`).join(" · ");
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
  state.rite.performing = { phase: 0, phaseMs: 0, offered, omen: omenActive(state, now), tendedMs: 0, bankMs: 0 };
}

/** Tend the rite once: take TEND_MS off, up to TEND_MAX_MS in all. Returns the time taken off. */
export function tendRite(state: GameState): number {
  const p = state.rite.performing;
  if (!p) return 0;
  const done = p.phase * HEARTH_RITE.phaseMs + p.phaseMs + p.bankMs;
  const add = Math.max(0, Math.min(TEND_MS, TEND_MAX_MS - p.tendedMs, RITE_MS - done));
  p.tendedMs += add;
  p.bankMs += add;
  return add;
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
  // Tended time goes first (it costs no real time), then the real time of this step.
  const fromBank = Math.min(p.bankMs ?? 0, RITE_MS - done);
  p.bankMs = 0;
  const used = Math.min(ms, RITE_MS - done - fromBank);
  const total = done + fromBank + used;
  p.phase = Math.min(HEARTH_RITE.phases.length, Math.floor(total / HEARTH_RITE.phaseMs));
  p.phaseMs = total - p.phase * HEARTH_RITE.phaseMs;
  if (total < RITE_MS) return { used, completedQuality: null };

  const offered = offeringsMet(state);
  const quality = qualityFor(offered.length);
  state.rite.performing = null;
  state.rite.completed = { quality, endingSeen: false, offered };
  state.levelCap = Math.max(state.levelCap, HEARTH_RITE.rewards.levelCap);
  if (!state.followers.includes(HEARTH_RITE.rewards.follower)) state.followers.push(HEARTH_RITE.rewards.follower);
  // A Resplendent rite leaves grandmother's embroidered cloth: a real thing, kept for Chapter II.
  if (quality === QUALITY_RESPLENDENT) state.inventory.circle_cloth = Math.max(1, state.inventory.circle_cloth ?? 0);
  return { used, completedQuality: quality };
}

/** Log lines so far: one per phase reached (all of them, and the finale, once it's done). */
export function riteLog(state: GameState): string[] {
  if (state.rite.completed) return [...HEARTH_RITE.phases.map((ph) => ph.log), HEARTH_RITE.finale];
  const p = state.rite.performing;
  if (!p) return [];
  return HEARTH_RITE.phases.slice(0, p.phase + 1).map((ph) => ph.log);
}

/**
 * The Grimoire journal's Kindling entry: the log so far, then (once it's done) the lore, and the
 * second-circle line for a Resplendent rite. Story only; the Circle shows the phase checklist.
 */
export function riteJournal(state: GameState): string[] {
  const done = state.rite.completed;
  if (!done) return riteLog(state);
  return [...riteLog(state), HEARTH_RITE.rewards.lore, ...(done.quality === QUALITY_RESPLENDENT ? [HEARTH_RITE.resplendentLore] : [])];
}

export type PhaseStatus = "done" | "current" | "later";

/** The rite's phase checklist, one row per part: done, the one running now, or later. */
export function ritePhases(state: GameState): { part: PartId; status: PhaseStatus }[] {
  const p = state.rite.performing;
  return HEARTH_RITE.phases.map((ph, i) => ({
    part: ph.part,
    status: state.rite.completed || (p && i < p.phase) ? "done" : p && i === p.phase ? "current" : "later",
  }));
}
