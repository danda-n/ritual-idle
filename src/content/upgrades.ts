import type { ItemId } from "./items";
import type { UpgradeDef } from "./types";

// House projects (docs/CHAPTER1.md §4): side work you build with your own hands, from things you
// make. Each is built once and helps for good. Nothing on the main path needs them; they give the
// deeper recipes (the midden, the chest, iron wards) and the attic's odds and ends a use.
export const UPGRADES = {
  omen_shelf: {
    name: "Omen shelf",
    description: "A place to keep omens. They start to turn up while you work (two fit), and the first comes with the shelf.",
    items: { tallow_candle: 10, beeswax_candle: 4 },
    effect: { kind: "omen_capacity", capacity: 2 },
  },
  reading_lamp: {
    name: "Reading lamp",
    description: "+15% Scholarship speed.",
    items: { beeswax_candle: 6, glass: 8 },
    effect: { kind: "speed", skill: "scholarship", bonus: 0.15 },
  },
  drying_rack: {
    name: "Herb drying rack",
    description: "+10% Herbalism yield.",
    items: { iron_nail: 12, rags: 10 },
    effect: { kind: "extra_yield", skill: "herbalism", chance: 0.1 },
  },
  mended_shutters: {
    name: "Mended shutters",
    description: "The house keeps working for 36 hours while you're away, instead of 24.",
    items: { iron_nail: 20, rags: 15, salt_line: 10 },
    effect: { kind: "offline_cap", hours: 36 },
  },
  carved_shelf: {
    name: "Carved omen shelf",
    description: "Room for 3 omens instead of 2.",
    items: { chalk: 6, iron_ward: 2 },
    effect: { kind: "omen_capacity", capacity: 3 },
    requires: "omen_shelf",
  },
} as const satisfies Record<string, UpgradeDef<ItemId>>;

export type UpgradeId = keyof typeof UPGRADES;
export const UPGRADE_IDS = Object.keys(UPGRADES) as UpgradeId[];
/** Widened view for engine code that reads optional fields generically. */
export const UPGRADE_DEFS: Record<UpgradeId, UpgradeDef<ItemId>> = UPGRADES;
