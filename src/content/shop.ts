import type { ItemId } from "./items";
import type { ShopEntry } from "./types";

// What village coin buys in Chapter 1 (docs/CHAPTER1.md §4). Some provisions come with a House
// project (`requires`). House projects are built, not bought: see upgrades.ts. The shop shows what each is for (generated), so there's no description.
export const SHOP = {
  bread: { name: "Bread", cost: 5, item: "bread", qty: 1 },
  tallow_bundle: { name: "Tallow ×10", cost: 8, item: "tallow", qty: 10 },
  // Stocked by House projects (content/upgrades.ts):
  nettle_bundle: { name: "Nettle ×10", cost: 6, item: "nettle", qty: 10, requires: "herb_stall" },
  chamomile_bundle: { name: "Chamomile ×5", cost: 8, item: "chamomile", qty: 5, requires: "herb_stall" },
  mugwort_bundle: { name: "Mugwort ×5", cost: 12, item: "mugwort", qty: 5, requires: "herb_stall" },
  beeswax_bundle: { name: "Beeswax ×5", cost: 10, item: "beeswax", qty: 5, requires: "wax_trader" },
} as const satisfies Record<string, ShopEntry<ItemId>>;

export type ShopId = keyof typeof SHOP;
