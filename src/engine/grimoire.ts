import { CURIO_STORIES, GRIMOIRE_DEFS, INSIGHT, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { GameState, RecipeProgress } from "./state";

// The Grimoire's discovery model (docs/GRIMOIRE.md). Helpers here mutate `state`;
// callers pass a private copy.

export const GRIMOIRE_IDS = Object.keys(GRIMOIRE_DEFS) as GrimoireId[];

export type HintTier = "riddle" | "category" | "plain";

export interface Fragment {
  recipe: GrimoireId;
  amount: number;
  source: "page" | "curio" | "request" | "attempt";
}

export function progressOf(state: GameState, id: GrimoireId): RecipeProgress {
  return state.grimoire[id] ?? { insight: 0, discovered: false, attempts: [], provenWrong: [], provenRight: [], marks: {} };
}

function entry(state: GameState, id: GrimoireId): RecipeProgress {
  return (state.grimoire[id] ??= progressOf(state, id));
}

export function isDiscovered(state: GameState, id: GrimoireId): boolean {
  return state.grimoire[id]?.discovered ?? false;
}

/** A hidden recipe's silhouette shows once its first fragment of insight arrives. */
export function isSilhouetteVisible(state: GameState, id: GrimoireId): boolean {
  return GRIMOIRE_DEFS[id].kind === "hidden" && (state.grimoire[id] !== undefined || isDiscovered(state, id));
}

export function hintTier(insight: number): HintTier {
  return insight >= INSIGHT.plain ? "plain" : insight >= INSIGHT.category ? "category" : "riddle";
}

/** How many ingredients the plain tier names at this insight (one at 12, another every 6 after). */
export function plainNamesShown(id: GrimoireId, insight: number): number {
  const plain = GRIMOIRE_DEFS[id].hints?.plain ?? [];
  if (insight < INSIGHT.plain) return 0;
  return Math.min(plain.length, 1 + Math.floor((insight - INSIGHT.plain) / INSIGHT.perExtraName));
}

/** Insight needed for the next hint, or null when every hint is showing. */
export function nextHintAt(id: GrimoireId, insight: number): number | null {
  const plain = GRIMOIRE_DEFS[id].hints?.plain ?? [];
  if (insight < INSIGHT.category) return INSIGHT.category;
  if (insight < INSIGHT.plain) return INSIGHT.plain;
  const shown = plainNamesShown(id, insight);
  return shown < plain.length ? INSIGHT.plain + shown * INSIGHT.perExtraName : null;
}

/** Unsolved hidden recipe with the least insight: where loose fragments land. */
export function fragmentTarget(state: GameState): GrimoireId | null {
  let best: GrimoireId | null = null;
  for (const id of GRIMOIRE_IDS) {
    if (GRIMOIRE_DEFS[id].kind !== "hidden" || isDiscovered(state, id)) continue;
    if (best === null || progressOf(state, id).insight < progressOf(state, best).insight) best = id;
  }
  return best;
}

/** Add insight (doubled by Grimoire assist). Returns the fragment, or null if nothing to add to. */
export function addInsight(state: GameState, id: GrimoireId | null, amount: number, source: Fragment["source"]): Fragment | null {
  if (id === null || isDiscovered(state, id)) return null;
  const gained = state.settings.grimoireAssist ? amount * 2 : amount;
  entry(state, id).insight += gained;
  return { recipe: id, amount: gained, source };
}

/** A curio drops: read its story and pass a fragment to the neediest recipe. */
export function readCurio(state: GameState): { story: string; fragment: Fragment | null } {
  const story = CURIO_STORIES[state.stats.curiosRead % CURIO_STORIES.length]!;
  state.stats.curiosRead++;
  return { story, fragment: addInsight(state, fragmentTarget(state), INSIGHT_GAIN.curio, "curio") };
}

/**
 * Work out what the attempt log proves. An attempt with no glow proves every item wrong;
 * an attempt whose unproven items number exactly its glows proves those items right.
 */
export function deduce(progress: RecipeProgress): void {
  const wrong = new Set(progress.provenWrong);
  const right = new Set(progress.provenRight);
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of progress.attempts) {
      const open = a.items.filter((i) => !wrong.has(i) && !right.has(i));
      const knownRight = a.items.filter((i) => right.has(i)).length;
      const glowsLeft = a.glows - knownRight;
      if (open.length === 0) continue;
      if (glowsLeft === 0) open.forEach((i) => wrong.add(i));
      else if (glowsLeft === open.length) open.forEach((i) => right.add(i));
      else continue;
      changed = true;
    }
  }
  progress.provenWrong = [...wrong];
  progress.provenRight = [...right];
}

export function glowCount(id: GrimoireId, items: readonly ItemId[]): number {
  const ingredients = new Set<ItemId>(GRIMOIRE_DEFS[id].ingredients);
  return items.filter((i) => ingredients.has(i)).length;
}

export function matches(id: GrimoireId, items: readonly ItemId[]): boolean {
  const ing = GRIMOIRE_DEFS[id].ingredients;
  return items.length === ing.length && glowCount(id, items) === ing.length;
}

export function markDiscovered(state: GameState, id: GrimoireId): void {
  entry(state, id).discovered = true;
}

export function discoveredRewards(state: GameState) {
  return GRIMOIRE_IDS.filter((id) => isDiscovered(state, id)).map((id) => GRIMOIRE_DEFS[id].reward);
}
