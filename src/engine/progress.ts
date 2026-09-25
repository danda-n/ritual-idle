import type { ActionId } from "../content/actions";
import { EXPERIMENTS_NOTE, NOTES } from "../content/notes";
import type { PartId } from "../content/rite";
import { PAGES } from "../content/pages";
import type { SkillId } from "../content/skills";
import type { Feature, GoalDef, StepDef } from "../content/types";
import { levelForXp, xpForLevel } from "./xp";
import type { GameState } from "./state";

// Chapter 1 onboarding: grandmother's notes unlock skills, deciphered pages unlock recipes.
// Everything here is derived from `notesRevealed` and lifetime action counts,
// so editing the notes or pages data never needs a save migration.

export type Note = (typeof NOTES)[number] | typeof EXPERIMENTS_NOTE;
export type Page = (typeof PAGES)[number];

export function completedCount(state: GameState, id: ActionId): number {
  return state.stats.completed[id] ?? 0;
}

export function revealedNotes(state: GameState): readonly (typeof NOTES)[number][] {
  return NOTES.slice(0, state.notesRevealed);
}

/** The newest note, whose goal the player is working on. */
export function currentNote(state: GameState): (typeof NOTES)[number] {
  return NOTES[Math.min(state.notesRevealed, NOTES.length) - 1]!;
}

export function goalProgress(state: GameState, note: Note): { done: number; target: number } | null {
  if (!("goal" in note)) return null;
  const goal: GoalDef<ActionId> = note.goal;
  if (goal.kind === "rite") return { done: state.rite.completed ? 1 : 0, target: 1 };
  if (goal.kind === "place") return { done: state.kindling.includes(goal.part as PartId) ? 1 : 0, target: 1 };
  const done = goal.kind === "complete" ? completedCount(state, goal.action) : state.stats.requestsFilled;
  return { done: Math.min(done, goal.count), target: goal.count };
}

export function isFeatureOpen(state: GameState, feature: Feature): boolean {
  if (feature === "experiments") return state.experimentsOpen;
  if (state.kept.features.includes(feature)) return true;
  return revealedNotes(state).some((n) => "opens" in n && (n.opens as readonly Feature[]).includes(feature));
}

export function isSkillUnlocked(state: GameState, skill: SkillId): boolean {
  if (state.kept.skills.includes(skill)) return true;
  return revealedNotes(state).some((n) => (n.unlocks as readonly SkillId[]).includes(skill));
}

export function pagesRead(state: GameState): readonly Page[] {
  return PAGES.slice(0, completedCount(state, "decipher_page"));
}

/** The page that teaches this recipe, or null if it needs no page. */
export function pageFor(id: ActionId): Page | null {
  return PAGES.find((p) => (p.unlocks as readonly ActionId[]).includes(id)) ?? null;
}

export function isRecipeKnown(state: GameState, id: ActionId): boolean {
  const page = pageFor(id);
  return page === null || pagesRead(state).includes(page);
}

export type Step = StepDef<SkillId, ActionId>;

/** The current stage's steps (empty for notes without them). */
export function currentSteps(state: GameState): readonly Step[] {
  const note = currentNote(state);
  return "steps" in note ? (note.steps as readonly Step[]) : [];
}

export function isStepMet(state: GameState, step: Step): boolean {
  const g = step.goal;
  switch (g.kind) {
    case "complete":
      return completedCount(state, g.action) >= g.count;
    case "level":
      return levelForXp(state.skills[g.skill].xp, state.levelCap) >= g.level;
    case "tended":
      return state.stats.tended >= g.count;
    case "requests":
      return state.stats.requestsFilled >= g.count;
    case "place":
      return state.kindling.includes(g.part as PartId);
  }
}

/**
 * Mark every met step of the current stage done; its reward (if any) waits to be claimed.
 * Mutates `state`; returns the steps done. Steps can be met in any order.
 */
export function claimSteps(state: GameState): Step[] {
  const claimed: Step[] = [];
  for (const step of currentSteps(state)) {
    if (state.stepsDone.includes(step.id) || !isStepMet(state, step)) continue;
    state.stepsDone.push(step.id);
    if (step.reward) state.rewardsWaiting.push(step.id);
    claimed.push(step);
  }
  return claimed;
}

const ALL_STEPS: Step[] = NOTES.flatMap((n) => ("steps" in n ? (n.steps as readonly Step[]) : []));

export function stepById(id: string): Step | undefined {
  return ALL_STEPS.find((s) => s.id === id);
}

/** Add XP to a skill, not past the level cap. Mutates `state`. */
export function grantXp(state: GameState, skill: SkillId, amount: number): void {
  const s = state.skills[skill];
  s.xp = Math.min(s.xp + amount, xpForLevel(state.levelCap));
}

/**
 * Reveal every note whose predecessor's goal is now met, and the Experiments note once its time
 * has come. Steps of each stage are claimed first (into `claimed`, if given).
 * Mutates `state` (callers pass a private copy); returns the new notes.
 */
export function revealNotes(state: GameState, claimed: Step[] = []): Note[] {
  const revealed: Note[] = [];
  claimed.push(...claimSteps(state));
  while (state.notesRevealed < NOTES.length) {
    const progress = goalProgress(state, currentNote(state));
    if (!progress || progress.done < progress.target) break;
    state.notesRevealed++;
    revealed.push(currentNote(state));
    claimed.push(...claimSteps(state));
  }
  if (experimentsDue(state)) {
    state.experimentsOpen = true;
    revealed.push(EXPERIMENTS_NOTE);
  }
  return revealed;
}

/** Experiments open with the first insight, once the Grimoire is open. */
function experimentsDue(state: GameState): boolean {
  return !state.experimentsOpen && isFeatureOpen(state, "grimoire") && state.insight > 0;
}

/** The Major Rite is revealed by the note whose goal is to perform it. */
export function isRiteRevealed(state: GameState): boolean {
  return revealedNotes(state).some((n) => "goal" in n && n.goal.kind === "rite");
}
