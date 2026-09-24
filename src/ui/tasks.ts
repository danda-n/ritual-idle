import { ACTION_DEFS, type ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { HEARTH_RITE } from "../content/rite";
import { SKILLS } from "../content/skills";
import type { GoalDef } from "../content/types";
import type { Note } from "../engine/progress";

// Chapter steps, derived from grandmother's notes: each note with a goal is one step.

export const STEPS = NOTES.map((n, i) => ({ note: n as Note, index: i })).filter((s) => "goal" in s.note);

/** Short, plain task name for a note's goal. */
export function taskName(goal: GoalDef<ActionId>): string {
  switch (goal.kind) {
    case "complete": {
      const a = ACTION_DEFS[goal.action];
      return goal.count > 1 ? `${a.name} ×${goal.count}` : a.name;
    }
    case "requests":
      return goal.count > 1 ? `Help ${goal.count} villagers` : "Help a villager";
    case "rite":
      return `Perform the ${HEARTH_RITE.name}`;
  }
}

/** What a note opens, stated plainly (for the story modal). */
export function noteUnlocks(note: Note): string[] {
  const out: string[] = [];
  for (const s of note.unlocks as readonly (keyof typeof SKILLS)[]) out.push(`New skill: ${SKILLS[s].name}`);
  const places: Record<string, string> = { grimoire: "the Grimoire", village: "the Village", circle: "the Circle" };
  if ("opens" in note) for (const f of note.opens as readonly string[]) out.push(`Opens ${places[f] ?? f}`);
  if ("gift" in note) out.push("An omen for the shelf: Still Night");
  return out;
}
