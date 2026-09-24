import { ACTION_DEFS, type ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { HEARTH_RITE, PART_DEFS, type PartId } from "../content/rite";
import { SKILLS } from "../content/skills";
import type { GoalDef } from "../content/types";
import type { Note } from "../engine/progress";
import type { GameState } from "../engine/state";

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
    case "place":
      return `Make ${PART_DEFS[goal.part as PartId].name.replace(/^The /, "the ")}`;
    case "rite":
      return `Perform the ${HEARTH_RITE.name}`;
  }
}

/** What a note opens, stated plainly (for the story modal). */
export function noteUnlocks(note: Note): string[] {
  const out: string[] = [];
  for (const s of note.unlocks as readonly (keyof typeof SKILLS)[]) out.push(`New skill: ${SKILLS[s].name}`);
  const places: Record<string, string> = { grimoire: "the Grimoire", village: "the Village", circle: "the Circle", experiments: "experiments at the Circle" };
  if ("opens" in note) for (const f of note.opens as readonly string[]) out.push(`Opens ${places[f] ?? f}`);
  if ("gift" in note) out.push("An omen for the shelf: Still Night");
  return out;
}

export type Place = { tab: "house"; skill: keyof typeof SKILLS } | { tab: "village" } | { tab: "circle" };

/** Where a task is done, so a "Go" button can take the player there. */
export function taskPlace(goal: GoalDef<ActionId>): Place {
  switch (goal.kind) {
    case "complete":
      return { tab: "house", skill: ACTION_DEFS[goal.action].skill };
    case "requests":
      return { tab: "village" };
    case "place":
      // The work starts in the skill this stage brings; the part is placed from the tracker or the Circle.
      return { tab: "house", skill: PART_DEFS[goal.part as PartId].skill };
    case "rite":
      return { tab: "circle" };
  }
}

/** Recipes a level-up just opened in a skill (known ones, at a level in (from, to]). */
export function unlockedByLevel(skill: keyof typeof SKILLS, from: number, to: number, known: (id: ActionId) => boolean): ActionId[] {
  return (Object.keys(ACTION_DEFS) as ActionId[]).filter((id) => {
    const a = ACTION_DEFS[id];
    return a.skill === skill && a.level > from && a.level <= to && known(id);
  });
}

/** True if this item drops by chance, at `threshold` or rarer (default 10%). */
export function isRareDrop(item: string, threshold = 0.1): boolean {
  return (Object.values(ACTION_DEFS) as { outputs: readonly { item: string; chance?: number }[] }[]).some((a) =>
    a.outputs.some((o) => o.item === item && o.chance !== undefined && o.chance <= threshold),
  );
}

/**
 * Where a Kindling part stands: placed, open (its stage's note has arrived, so it can be made
 * and placed), or later (only its name and the skill it brings show).
 */
export function partState(state: GameState, part: PartId): "placed" | "open" | "later" {
  if (state.kindling.includes(part)) return "placed";
  const at = NOTES.findIndex((n) => "goal" in n && n.goal.kind === "place" && n.goal.part === part);
  return at >= 0 && at < state.notesRevealed ? "open" : "later";
}
