import { HEARTH_RITE, PART_IDS, QUALITY_AT, RITE_MS, type PartId } from "../content/rite";
import type { SkillId } from "../content/skills";
import { activeBuffs, riteQualitySteps } from "./modifiers";
import { isRiteRevealed } from "./progress";
import type { GameState } from "./state";
import { levelForXp } from "./xp";

// The Chapter 1 Major Rite, a short played ceremony. Its parts are placed in the Circle one by one
// (see `placePart`); once all are placed and Ritualism is high enough, it takes the action slot
// for five phases. Each phase has one moment the player can answer; answered moments, the Hearth
// mark and an omen active during it set the quality. It never fails, and if you leave it finishes
// offline without the moments. Helpers mutate `state`.

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

/** Start the rite (it replaces whatever you were doing). The parts are already in the Circle. */
export function beginRite(state: GameState, now: number): void {
  state.active = null;
  state.rite.performing = { phase: 0, phaseMs: 0, moments: [], omen: omenActive(state, now) };
}

/** The current phase's moment, if it's open right now (and not yet answered). */
export function openMoment(state: GameState): { phase: number; leftMs: number } | null {
  const p = state.rite.performing;
  if (!p) return null;
  const def = HEARTH_RITE.phases[p.phase];
  if (!def || p.moments[p.phase]) return null;
  const from = def.moment.at * HEARTH_RITE.phaseMs;
  if (p.phaseMs < from || p.phaseMs >= from + HEARTH_RITE.momentMs) return null;
  return { phase: p.phase, leftMs: from + HEARTH_RITE.momentMs - p.phaseMs };
}

/** Answer the open moment: one quality step. Returns false if none is open. */
export function answerMomentInto(state: GameState): boolean {
  const m = openMoment(state);
  if (!m) return false;
  state.rite.performing!.moments[m.phase] = true;
  return true;
}

/** What counts toward the quality, and whether each is met. */
export function riteFactors(state: GameState) {
  const p = state.rite.performing;
  const answered = p ? p.moments.filter(Boolean).length : 0;
  return [
    { label: `Moments answered (${answered} of ${HEARTH_RITE.phases.length})`, steps: answered, of: HEARTH_RITE.phases.length },
    { label: "The Hearth mark is discovered", steps: riteQualitySteps(state) > 0 ? 1 : 0, of: 1 },
    { label: "Still Night active during the rite", steps: p?.omen || omenActive(state, state.lastTickAt) ? 1 : 0, of: 1 },
  ];
}

/** Quality steps so far (0–7). */
export function qualitySteps(state: GameState): number {
  return riteFactors(state).reduce((n, f) => n + f.steps, 0);
}

/** Quality index into QUALITIES: 0–2 steps → Sound, 3–5 → Fine, 6–7 → Resplendent. */
export function qualityFor(steps: number): number {
  return steps >= QUALITY_AT.resplendent ? 2 : steps >= QUALITY_AT.fine ? 1 : 0;
}

export function riteQuality(state: GameState): number {
  return qualityFor(qualitySteps(state));
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
