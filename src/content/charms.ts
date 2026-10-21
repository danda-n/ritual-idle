import type { GrimoireId } from "./grimoire";
import type { ItemId } from "./items";

// Charms (docs/GRIMOIRE.md): each hidden recipe, once discovered, can be bound again and again on
// the Experiments tab from its own bind cost (it happens at once), and used for a boost that lasts
// a number of actions, crafts or contracts, never a clock: there's nothing to time, and time away
// counts the same. Using one while it's on adds its uses. The active side of experiments: never
// required.

export type CharmPer = "action" | "craft" | "contract" | "foe";

export interface CharmDef {
  /** The hidden recipe that teaches it (bound on the Experiments tab). Charms without one are made elsewhere (the red thread knot, by Crafting). */
  from?: GrimoireId;
  /** What binding one uses. */
  cost: Partial<Record<ItemId, number>>;
  /** How many actions, crafts (actions that use inputs), contracts or foes one lasts. */
  uses: number;
  per: CharmPer;
  /** What it does while it has uses left. */
  effect: { findMultiplier?: number; xpBonus?: number; saveChance?: number; coinBonus?: number; trustBonus?: number; specialMult?: number };
}

export const CHARMS = {
  charm_window: { from: "window_charm", cost: { tallow_candle: 3, glass: 2, salt: 4 }, uses: 100, per: "action", effect: { findMultiplier: 1.5 } },
  charm_pillow: { from: "dream_pillow", cost: { mugwort: 4, chamomile: 3, rags: 2 }, uses: 100, per: "action", effect: { xpBonus: 0.25 } },
  charm_mark: { from: "hearth_mark", cost: { ash: 6, charcoal: 2, salt: 3 }, uses: 40, per: "craft", effect: { saveChance: 0.25 } },
  charm_nail: { from: "threshold_nail", cost: { iron_nail: 3, stjohns: 2, salt: 3 }, uses: 3, per: "contract", effect: { coinBonus: 0.5, trustBonus: 0.5 } },
  // Made with Crafting, not bound: the next 25 foes' special attacks hit half as hard (docs/COMBAT.md §3).
  red_thread_knot: { cost: {}, uses: 25, per: "foe", effect: { specialMult: 0.5 } },
} as const satisfies Partial<Record<ItemId, CharmDef>>;

export type CharmId = keyof typeof CHARMS;
export const CHARM_IDS = Object.keys(CHARMS) as CharmId[];
/** Widened view for code that reads optional fields generically. */
export const CHARM_DEFS: Record<CharmId, CharmDef> = CHARMS;

/** The charm a hidden recipe teaches, if any. */
export function charmFor(recipe: GrimoireId): CharmId | null {
  return CHARM_IDS.find((c) => CHARM_DEFS[c].from === recipe) ?? null;
}

/** Charms bound on the Experiments tab, from a discovered hidden recipe. */
export const BOUND_CHARM_IDS = CHARM_IDS.filter((c) => CHARM_DEFS[c].from !== undefined);
