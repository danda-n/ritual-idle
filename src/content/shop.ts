import type { ItemId } from "./items";
import type { ShopEntry } from "./types";

// What village coin buys in Chapter 1 (docs/CHAPTER1.md §4). Upgrades are bought once.
export const SHOP = {
  bread: { kind: "item", name: "Bread", description: "A round loaf, for the offering of bread and salt.", cost: 5, item: "bread", qty: 1 },
  tallow_bundle: { kind: "item", name: "Tallow ×10", description: "From the butcher, for when the pantry runs short.", cost: 8, item: "tallow", qty: 10 },
  drying_rack: {
    kind: "upgrade", name: "Herb drying rack", description: "+10% Herbalism yield.", cost: 60,
    effect: { kind: "extra_yield", skill: "herbalism", chance: 0.1 },
  },
  reading_lamp: {
    kind: "upgrade", name: "Reading lamp", description: "+15% Scholarship speed.", cost: 80,
    effect: { kind: "speed", skill: "scholarship", bonus: 0.15 },
  },
  omen_shelf: {
    kind: "upgrade", name: "Omen shelf", description: "Store up to 3 omens instead of 2.", cost: 50,
    effect: { kind: "omen_capacity", capacity: 3 },
  },
  mended_shutters: {
    kind: "upgrade", name: "Mended shutters", description: "The house keeps working for 36 hours while you're away, instead of 24.", cost: 120,
    effect: { kind: "offline_cap", hours: 36 },
  },
} as const satisfies Record<string, ShopEntry<ItemId>>;

export type ShopId = keyof typeof SHOP;
export type UpgradeId = { [K in ShopId]: (typeof SHOP)[K]["kind"] extends "upgrade" ? K : never }[ShopId];
