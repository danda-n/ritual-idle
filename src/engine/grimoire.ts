import { CURIO_STORIES, GRIMOIRE_DEFS, INSIGHT_COST, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { GameState, RecipeProgress } from "./state";

// The Grimoire's discovery model (docs/GRIMOIRE.md). Helpers here mutate `state`;
// callers pass a private copy.

export const GRIMOIRE_IDS = Object.keys(GRIMOIRE_DEFS) as GrimoireId[];

export interface Fragment {
  amount: number;
  source: "page" | "curio" | "request" | "attempt";
}

export function progressOf(state: GameState, id: GrimoireId): RecipeProgress {
  return state.grimoire[id] ?? { discovered: false, attempts: [], provenWrong: [], provenRight: [], marks: {}, bought: { category: false, named: [] }, clues: 0 };
}

function entry(state: GameState, id: GrimoireId): RecipeProgress {
  return (state.grimoire[id] ??= progressOf(state, id));
}

export function isDiscovered(state: GameState, id: GrimoireId): boolean {
  return state.grimoire[id]?.discovered ?? false;
}

/** Hidden recipes show in the Grimoire (and at the Circle) once experiments are open. */
export function isSilhouetteVisible(state: GameState, id: GrimoireId): boolean {
  return GRIMOIRE_DEFS[id].kind === "hidden" && (state.experimentsOpen || isDiscovered(state, id));
}

/** Add insight to the pool (doubled by Grimoire assist). Returns what was gained. */
export function addInsight(state: GameState, amount: number, source: Fragment["source"]): Fragment {
  const gained = state.settings.grimoireAssist ? amount * 2 : amount;
  state.insight += gained;
  return { amount: gained, source };
}

/** A curio drops: read its story, and it brings some insight. */
export function readCurio(state: GameState): { story: string; fragment: Fragment } {
  const story = CURIO_STORIES[state.stats.curiosRead % CURIO_STORIES.length]!;
  state.stats.curiosRead++;
  return { story, fragment: addInsight(state, INSIGHT_GAIN.curio, "curio") };
}

// Hints you buy (docs/GRIMOIRE.md §6)

export type HintKind = "category" | "name" | "clue";

/** The ingredient names a hidden recipe's hints can reveal, in order. */
export function nameable(id: GrimoireId): ItemId[] {
  return GRIMOIRE_DEFS[id].hints?.plain ?? [];
}

/** What this hint costs, or null if there's nothing left of that kind to buy. */
export function hintCost(state: GameState, id: GrimoireId, kind: HintKind): number | null {
  const def = GRIMOIRE_DEFS[id];
  const p = progressOf(state, id);
  if (isDiscovered(state, id)) return null;
  if (kind === "category") return def.hints && !p.bought.category ? INSIGHT_COST.category : null;
  if (kind === "name") return p.bought.named.length < nameable(id).length ? INSIGHT_COST.name : null;
  return p.clues < (def.clues?.length ?? 0) ? INSIGHT_COST.clue : null;
}

/** Buy a hint: mutates `state`. Callers check `hintCost` and the pool first. */
export function buyHintInto(state: GameState, id: GrimoireId, kind: HintKind): void {
  const cost = hintCost(state, id, kind)!;
  state.insight -= cost;
  const p = entry(state, id);
  if (kind === "category") p.bought.category = true;
  else if (kind === "name") p.bought.named.push(nameable(id)[p.bought.named.length]!);
  else p.clues++;
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
