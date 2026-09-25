import type { ItemId } from "./items";
import type { ShopEntry } from "./types";

// What village coin buys in Chapter 1 (docs/CHAPTER1.md §4). House upgrades are built, not
// bought: see upgrades.ts.
export const SHOP = {
  bread: { name: "Bread", description: "A round loaf, for the offering of bread and salt.", cost: 5, item: "bread", qty: 1 },
  tallow_bundle: { name: "Tallow ×10", description: "From the butcher, for when the pantry runs short.", cost: 8, item: "tallow", qty: 10 },
} as const satisfies Record<string, ShopEntry<ItemId>>;

export type ShopId = keyof typeof SHOP;
