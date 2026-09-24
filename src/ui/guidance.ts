import { GRIMOIRE_DEFS, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { ExperimentOutcome } from "../engine/commands";
import { plainNamesShown, progressOf } from "../engine/grimoire";
import { isFeatureOpen } from "../engine/progress";
import type { GameState } from "../engine/state";

// Plain "what now?" guidance for the Grimoire and the Circle. Gameplay, not lore.

export interface RecipeKnowledge {
  size: number;
  /** Ingredients the player knows belong (proven at the Circle, or named by a hint). */
  belongs: ItemId[];
  ruledOut: ItemId[];
  /** Things the player holds that could still be ingredients. */
  stillPossible: ItemId[];
  attempts: number;
}

export function recipeKnowledge(state: GameState, id: GrimoireId): RecipeKnowledge {
  const def = GRIMOIRE_DEFS[id];
  const p = progressOf(state, id);
  const named = (def.hints?.plain ?? []).slice(0, plainNamesShown(id, p.insight));
  const belongs = [...new Set<ItemId>([...p.provenRight, ...named])];
  const held = (Object.entries(state.inventory) as [ItemId, number][]).filter(([, n]) => n > 0).map(([i]) => i);
  const stillPossible = held.filter((i) => !belongs.includes(i) && !p.provenWrong.includes(i));
  return { size: def.ingredients.length, belongs, ruledOut: p.provenWrong, stillPossible, attempts: p.attempts.length };
}

export interface Guide {
  headline: string;
  detail: string;
  /** Label for the Circle button, or null if the Circle isn't open yet. */
  action: string | null;
}

export function recipeGuide(state: GameState, id: GrimoireId): Guide {
  const k = recipeKnowledge(state, id);
  const left = k.size - k.belongs.length;
  if (!isFeatureOpen(state, "experiments")) {
    return { headline: "Experiments open with grandmother's next note", detail: "That's where you test guesses at the Circle. Until then, collect hints: they sharpen on their own.", action: null };
  }
  if (left === 0) {
    return { headline: `You know all ${k.size}: make it at the Circle`, detail: "Place exactly these in the Circle to discover it.", action: "Make it at the Circle" };
  }
  if (k.attempts === 0 && k.belongs.length === 0) {
    return {
      headline: `Try any ${k.size} things at the Circle`,
      detail: `Use the riddle as a guide. The Circle glows once for each right thing. Wrong tries still give +${INSIGHT_GAIN.failedAttempt} insight toward clearer hints.`,
      action: "Try at the Circle",
    };
  }
  return {
    headline: k.belongs.length > 0 ? `${k.belongs.length} of ${k.size} known: find the last ${left === 1 ? "one" : left}` : `Narrow it down: ${k.size} things to find`,
    detail: "Keep what belongs, and swap the rest for things not crossed out yet.",
    action: "Keep trying at the Circle",
  };
}

/** Where insight comes from, as short labels. */
export const INSIGHT_SOURCES = [
  `Wrong try +${INSIGHT_GAIN.failedAttempt}`,
  `Burnt page +${INSIGHT_GAIN.page}`,
  `Curio +${INSIGHT_GAIN.curio}`,
  `Some villagers +${INSIGHT_GAIN.request}`,
];

export type CircleStep = 1 | 2 | 3;

/** Which step the player is on: 1 choose what to work on, 2 pick things, 3 place them. */
export function circleStep(attuned: boolean, hasSilhouettes: boolean, placed: number, slots: number): CircleStep {
  if (!attuned && hasSilhouettes && placed === 0) return 1;
  return placed >= slots ? 3 : 2;
}

/** What an experiment's result means, and what to do next. */
export function outcomeHelp(o: ExperimentOutcome): string {
  switch (o.kind) {
    case "discovered":
      return `Discovered. ${GRIMOIRE_DEFS[o.recipe].rewardText}`;
    case "glow":
      if (o.glows === 0) return `None of these belong. They're crossed out and hidden from your list.`;
      if (o.glows === o.of - 1) return `${o.glows} of ${o.of} right, but not which. Swap one thing at a time to find the odd one out.`;
      return `${o.glows} of ${o.of} right, but not which. Swap one thing at a time and watch the count.`;
    case "almost":
      return "Two of those match a secret. Swap the third.";
    case "nothing":
      return "No secret matches that set. A secret answers only its exact 3.";
  }
}
