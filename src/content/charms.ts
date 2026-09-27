import type { GrimoireId } from "./grimoire";
import type { ItemId } from "./items";

// Charms (docs/GRIMOIRE.md): each hidden recipe, once discovered, can be bound again and again on
// the Experiments tab from its own bind cost (it happens at once), and used for a boost that lasts
// a number of actions, crafts or contracts, never a clock: there's nothing to time, and time away
// counts the same. Using one while it's on adds its uses. The active side of experiments: never
// required.

export type CharmPer = "action" | "craft" | "contract";

export interface CharmDef {
  /** The hidden recipe that teaches it. */
  from: GrimoireId;
  /** What binding one uses. */
  cost: Partial<Record<ItemId, number>>;
  /** How many actions, crafts or contracts one lasts. */
  uses: number;
  per: CharmPer;
  /** What it does while it has uses left. */
  effect: { findMultiplier?: number; xpBonus?: number; saveChance?: number; coinBonus?: number; trustBonus?: number };
}

export const CHARMS = {
  charm_window: { from: "window_charm", cost: { tallow_candle: 3, glass: 2, salt: 4 }, uses: 100, per: "action", effect: { findMultiplier: 1.5 } },
  charm_pillow: { from: "dream_pillow", cost: { mugwort: 4, chamomile: 3, rags: 2 }, uses: 100, per: "action", effect: { xpBonus: 0.25 } },
  charm_mark: { from: "hearth_mark", cost: { ash: 6, charcoal: 2, salt: 3 }, uses: 40, per: "craft", effect: { saveChance: 0.25 } },
  charm_nail: { from: "threshold_nail", cost: { iron_nail: 3, stjohns: 2, salt: 3 }, uses: 3, per: "contract", effect: { coinBonus: 0.5, trustBonus: 0.5 } },
} as const satisfies Partial<Record<ItemId, CharmDef>>;

export type CharmId = keyof typeof CHARMS;
export const CHARM_IDS = Object.keys(CHARMS) as CharmId[];
/** Widened view for code that reads optional fields generically. */
export const CHARM_DEFS: Record<CharmId, CharmDef> = CHARMS;

/** The charm a hidden recipe teaches, if any. */
export function charmFor(recipe: GrimoireId): CharmId | null {
  return CHARM_IDS.find((c) => CHARMS[c].from === recipe) ?? null;
}
