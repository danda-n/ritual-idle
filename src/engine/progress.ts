import type { ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import type { SkillId } from "../content/skills";
import type { Feature, GoalDef } from "../content/types";
import type { GameState } from "./state";

// Chapter 1 onboarding: grandmother's notes unlock skills, deciphered pages unlock recipes.
// Everything here is derived from `notesRevealed` and lifetime action counts,
// so editing the notes or pages data never needs a save migration.

export type Note = (typeof NOTES)[number];
export type Page = (typeof PAGES)[number];

export function completedCount(state: GameState, id: ActionId): number {
  return state.stats.completed[id] ?? 0;
}

export function revealedNotes(state: GameState): readonly Note[] {
  return NOTES.slice(0, state.notesRevealed);
}

/** The newest note, whose goal the player is working on. */
export function currentNote(state: GameState): Note {
  return NOTES[Math.min(state.notesRevealed, NOTES.length) - 1]!;
}

export function goalProgress(state: GameState, note: Note): { done: number; target: number } | null {
  if (!("goal" in note)) return null;
  const goal: GoalDef<ActionId> = note.goal;
  const done = goal.kind === "complete" ? completedCount(state, goal.action) : state.stats.requestsFilled;
  return { done: Math.min(done, goal.count), target: goal.count };
}

export function isFeatureOpen(state: GameState, feature: Feature): boolean {
  return revealedNotes(state).some((n) => "opens" in n && (n.opens as readonly Feature[]).includes(feature));
}

export function isSkillUnlocked(state: GameState, skill: SkillId): boolean {
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

/**
 * Reveal every note whose predecessor's goal is now met. Mutates `state`
 * (called from inside `advance` on its private copy); returns the new notes.
 */
export function revealNotes(state: GameState): Note[] {
  const revealed: Note[] = [];
  while (state.notesRevealed < NOTES.length) {
    const progress = goalProgress(state, currentNote(state));
    if (!progress || progress.done < progress.target) break;
    state.notesRevealed++;
    revealed.push(currentNote(state));
  }
  return revealed;
}
