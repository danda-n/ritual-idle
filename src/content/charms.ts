import type { BuffId } from "./buffs";
import type { GrimoireId } from "./grimoire";
import type { ItemId } from "./items";

// Charms (docs/GRIMOIRE.md): each hidden recipe, once discovered, can be bound again and again at
// Experiments from the same ingredients (it happens at once), and used for a timed boost. They're
// the active side of experiments: for players who want to come back to the Circle, never required.
export const CHARMS = {
  charm_window: { from: "window_charm", buff: "charm_window" },
  charm_pillow: { from: "dream_pillow", buff: "charm_pillow" },
  charm_mark: { from: "hearth_mark", buff: "charm_mark" },
  charm_nail: { from: "threshold_nail", buff: "charm_nail" },
} as const satisfies Partial<Record<ItemId, { from: GrimoireId; buff: BuffId }>>;

export type CharmId = keyof typeof CHARMS;
export const CHARM_IDS = Object.keys(CHARMS) as CharmId[];

/** The charm a hidden recipe teaches, if any. */
export function charmFor(recipe: GrimoireId): CharmId | null {
  return CHARM_IDS.find((c) => CHARMS[c].from === recipe) ?? null;
}
