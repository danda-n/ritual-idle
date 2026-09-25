import type { SkillId } from "../content/skills";
import { SKILL_IDS } from "../content/skills";
import { TALENT_LEVELS, TALENTS, type Side, type TalentDef, type TalentEffect, type TalentLevel } from "../content/talents";
import type { GameState, Talents } from "./state";
import { levelForXp } from "./xp";

// Talents: at each talent level a skill offers a pair; the choice is all that's saved.
// A choice counts only while the skill is at that level (it always is, levels never drop).

const NONE: Talents = {};

export function talentsOf(state: GameState, skill: SkillId): Talents {
  return state.talents[skill] ?? NONE;
}

export function choiceAt(state: GameState, skill: SkillId, level: TalentLevel): Side | undefined {
  return talentsOf(state, skill)[level];
}

function level(state: GameState, skill: SkillId): number {
  return levelForXp(state.skills[skill].xp, state.levelCap);
}

/** The talent levels this skill has reached. */
export function openLevels(state: GameState, skill: SkillId): TalentLevel[] {
  return TALENT_LEVELS.filter((l) => l <= level(state, skill));
}

/** Reached talent levels where no side is chosen yet. */
export function choicesWaiting(state: GameState, skill: SkillId): TalentLevel[] {
  return openLevels(state, skill).filter((l) => !choiceAt(state, skill, l));
}

/** The talents this skill has taken. */
export function takenTalents(state: GameState, skill: SkillId): TalentDef[] {
  return openLevels(state, skill).flatMap((l) => {
    const side = choiceAt(state, skill, l);
    return side ? [TALENTS[skill][l][side]] : [];
  });
}

type Taken = { from: SkillId; effect: TalentEffect }[];
const cache = new WeakMap<GameState["talents"], Taken>();

/**
 * Every taken talent effect in the game, with the skill it belongs to. A choice can only be made
 * at its level, and levels never drop, so the choices alone decide it (cached: it's read on every
 * repetition, and a new choice is always a new state).
 */
export function talentEffects(state: GameState): Taken {
  let taken = cache.get(state.talents);
  if (!taken) {
    taken = SKILL_IDS.flatMap((from) =>
      TALENT_LEVELS.flatMap((l) => {
        const side = state.talents[from]?.[l];
        return side ? TALENTS[from][l][side].effects.map((effect) => ({ from, effect })) : [];
      }),
    );
    cache.set(state.talents, taken);
  }
  return taken;
}

/** Why this side can't be taken, or null if it can. */
export function canChoose(state: GameState, skill: SkillId, at: TalentLevel): string | null {
  if (level(state, skill) < at) return `Opens at level ${at}.`;
  return null;
}
