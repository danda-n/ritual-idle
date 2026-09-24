import type { SkillId } from "../content/skills";
import { BRANCHES, BRANCH_IDS, KEYSTONE_NEEDS, KEYSTONES, POINT_EVERY, TEND, type BranchId, type KeystoneEffect } from "../content/talents";
import type { GameState, Talents } from "./state";
import { levelForXp } from "./xp";

// Talents: points come from levels (one every POINT_EVERY), so only spending is saved.

const NONE: Talents = { ranks: {} };

export function talentsOf(state: GameState, skill: SkillId): Talents {
  return state.talents[skill] ?? NONE;
}

export function rankOf(state: GameState, skill: SkillId, branch: BranchId): number {
  return talentsOf(state, skill).ranks[branch] ?? 0;
}

export function talentPoints(state: GameState, skill: SkillId): number {
  return Math.floor(levelForXp(state.skills[skill].xp, state.levelCap) / POINT_EVERY);
}

export function pointsSpent(state: GameState, skill: SkillId): number {
  const t = talentsOf(state, skill);
  return BRANCH_IDS.reduce((n, b) => n + (t.ranks[b] ?? 0), 0);
}

export function pointsFree(state: GameState, skill: SkillId): number {
  return talentPoints(state, skill) - pointsSpent(state, skill);
}

/** The keystone blooms, free, once any one branch holds KEYSTONE_NEEDS points. */
export function keystoneOpen(state: GameState, skill: SkillId): boolean {
  return BRANCH_IDS.some((b) => rankOf(state, skill, b) >= KEYSTONE_NEEDS);
}

/** The skill's keystone effect, once it has bloomed. */
export function keystoneEffect(state: GameState, skill: SkillId): KeystoneEffect | null {
  return keystoneOpen(state, skill) ? KEYSTONES[skill].effect : null;
}

/** A branch's total effect for a skill (e.g. 0.1 for Swift rank 2). */
export function branchBonus(state: GameState, skill: SkillId, branch: BranchId): number {
  return BRANCHES[branch].perRank * rankOf(state, skill, branch);
}

/** Why this rank can't be taken, or null if it can. */
export function canSpend(state: GameState, skill: SkillId, branch: BranchId): string | null {
  if (pointsFree(state, skill) < 1) return "No talent points to spend.";
  if (rankOf(state, skill, branch) >= BRANCHES[branch].maxRank) return "That branch is full.";
  return null;
}

// Tending (the hands-on bonus). The meter lives on the sim clock, like buffs.

/** How long one Tend keeps the meter lit, for this skill. */
export function tendMeterMs(state: GameState, skill: SkillId): number {
  return TEND.meterMs + TEND.rankMeterMs * rankOf(state, skill, "tending");
}

export function isTended(state: GameState, now: number = state.lastTickAt): boolean {
  return now < state.tend.endsAt;
}

/** Chance of a bonus find on the next tended repetition, from the streak so far. */
export function tendBonusChance(state: GameState, skill: SkillId): number {
  const perRep = TEND.streakPerRep + TEND.rankStreak * rankOf(state, skill, "tending");
  return Math.min(TEND.streakCap, state.tend.streak * perRep);
}
