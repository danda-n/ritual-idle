import type { ItemId } from "./items";
import type { UpgradeDef } from "./types";

// House projects (docs/CHAPTER1.md §4): side work you build with your own hands, from things you
// make. Each is built once and helps for good. Nothing on the main path needs them; they give the
// deeper recipes (the midden, the chest, iron wards) and the attic's odds and ends a use.
// What each does is generated from `effect` (src/ui/effects.ts); `extra` adds one fact it can't say.
export const UPGRADES = {
  omen_shelf: {
    blurb: "Somewhere to keep omens: rare finds from any work. Use one to bless a skill for a while.",
    name: "Omen shelf",
    extra: "1st omen included · omens drop from any work",
    items: { tallow_candle: 10, beeswax_candle: 4 },
    effect: { kind: "omen_capacity", capacity: 2 },
  },
  salt_crock: {
    blurb: "More salt from the pantry, for the Ward and the Offering.",
    name: "Sealed salt crock",
    extra: "Pantry salt 50% → 75%",
    items: { beeswax: 8, tallow_candle: 6 },
    effect: { kind: "find", item: "salt", multiplier: 1.5 },
  },
  reading_lamp: {
    blurb: "Quicker work in the attic and over the pages.",
    name: "Reading lamp",
    items: { beeswax_candle: 6, glass: 8 },
    effect: { kind: "speed", skill: "scholarship", bonus: 0.15 },
  },
  drying_rack: {
    blurb: "Now and then an extra herb or bundle from Herbalism.",
    name: "Herb drying rack",
    items: { iron_nail: 12, rags: 10 },
    effect: { kind: "extra_yield", skill: "herbalism", chance: 0.1 },
  },
  notice_board: {
    blurb: "A board by the gate: one more villager can leave work at once.",
    name: "Notice board",
    items: { iron_nail: 10, salt_line: 6, tallow_candle: 6 },
    effect: { kind: "board_slots", extra: 1 },
    requiresFeature: "village",
  },
  second_board: {
    blurb: "Room for one more contract, and the bigger jobs that come with it.",
    name: "Covered board",
    items: { chalk: 6, iron_ward: 2, beeswax_candle: 4 },
    effect: { kind: "board_slots", extra: 1 },
    requires: "notice_board",
    requiresFeature: "village",
  },
  herb_stall: {
    blurb: "A stall for the herbwife: the shop sells herbs.",
    name: "Herb stall",
    items: { rags: 8, iron_nail: 6 },
    effect: { kind: "shop", entries: ["nettle_bundle", "chamomile_bundle", "mugwort_bundle"] },
    requiresFeature: "village",
  },
  wax_trader: {
    blurb: "A standing order with the beekeeper: the shop sells beeswax.",
    name: "Wax trader",
    items: { tallow_candle: 8, salt_line: 4 },
    effect: { kind: "shop", entries: ["beeswax_bundle"] },
    requiresFeature: "village",
  },
  carved_shelf: {
    blurb: "Room for one more omen on the shelf.",
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
