import type { ItemId } from "./items";
import type { UpgradeDef } from "./types";

// House projects (docs/CHAPTER1.md §4): side work you build with your own hands, from things you
// make. Each is built once and helps for good. Nothing on the main path needs them; they give the
// deeper recipes (the midden, the chest, iron wards) and the attic's odds and ends a use.
// What each does is generated from `effect` (src/ui/effects.ts); `extra` adds one fact it can't say.
export const UPGRADES = {
  omen_shelf: {
    name: "Omen shelf",
    extra: "1st omen included · omens drop from any work",
    items: { tallow_candle: 10, beeswax_candle: 4 },
    effect: { kind: "omen_capacity", capacity: 2 },
  },
  reading_lamp: {
    name: "Reading lamp",
    items: { beeswax_candle: 6, glass: 8 },
    effect: { kind: "speed", skill: "scholarship", bonus: 0.15 },
  },
  drying_rack: {
    name: "Herb drying rack",
    items: { iron_nail: 12, rags: 10 },
    effect: { kind: "extra_yield", skill: "herbalism", chance: 0.1 },
  },
  mended_shutters: {
    name: "Mended shutters",
    items: { iron_nail: 20, rags: 15, salt_line: 10 },
    effect: { kind: "offline_cap", hours: 36 },
  },
  carved_shelf: {
    name: "Carved omen shelf",
    items: { chalk: 6, iron_ward: 2 },
    effect: { kind: "omen_capacity", capacity: 3 },
    requires: "omen_shelf",
  },
} as const satisfies Record<string, UpgradeDef<ItemId>>;

export type UpgradeId = keyof typeof UPGRADES;
export const UPGRADE_IDS = Object.keys(UPGRADES) as UpgradeId[];
/** Widened view for engine code that reads optional fields generically. */
export const UPGRADE_DEFS: Record<UpgradeId, UpgradeDef<ItemId>> = UPGRADES;
