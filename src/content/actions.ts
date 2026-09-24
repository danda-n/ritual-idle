import type { ActionDef } from "./types";
import type { ItemId } from "./items";
import type { SkillId } from "./skills";

type Action = ActionDef<SkillId, ItemId>;

// Chapter 1 actions — mirrors docs/CHAPTER1.md §3 and tools/ch1_sim.py.
// Keep all three in sync when tuning.
export const ACTIONS = {
  // Herbalism
  pick_nettle: { name: "Pick nettle", skill: "herbalism", level: 1, seconds: 3, xp: 5, inputs: {}, outputs: [{ item: "nettle", qty: 1 }] },
  pick_chamomile: { name: "Pick chamomile", skill: "herbalism", level: 3, seconds: 3, xp: 7, inputs: {}, outputs: [{ item: "chamomile", qty: 1 }] },
  pick_yarrow: { name: "Pick yarrow", skill: "herbalism", level: 6, seconds: 4, xp: 10, inputs: {}, outputs: [{ item: "yarrow", qty: 1 }] },
  pick_mugwort: { name: "Pick mugwort", skill: "herbalism", level: 10, seconds: 4, xp: 13, inputs: {}, outputs: [{ item: "mugwort", qty: 1 }] },
  pick_stjohns: { name: "Pick St John's wort", skill: "herbalism", level: 14, seconds: 5, xp: 17, inputs: {}, outputs: [{ item: "stjohns", qty: 1 }] },
  cut_juniper: { name: "Cut juniper", skill: "herbalism", level: 18, seconds: 5, xp: 21, inputs: {}, outputs: [{ item: "juniper", qty: 1 }] },

  // Scavenging
  sweep_hearth: {
    name: "Sweep the hearth", skill: "scavenging", level: 1, seconds: 3, xp: 5, inputs: {},
    outputs: [{ item: "ash", qty: 1 }, { item: "charcoal", qty: 1, chance: 0.1 }],
  },
  search_pantry: {
    name: "Search the pantry", skill: "scavenging", level: 2, seconds: 3, xp: 6, inputs: {},
    outputs: [{ item: "tallow", qty: 1 }, { item: "salt", qty: 1, chance: 0.5 }],
  },
  search_attic: {
    name: "Search the attic", skill: "scavenging", level: 5, seconds: 4, xp: 9, inputs: {},
    outputs: [
      { item: "burnt_page", qty: 1, chance: 0.35 },
      { item: "rags", qty: 1, chance: 0.5 },
      { item: "glass", qty: 1, chance: 0.3 },
      { item: "curio", qty: 1, chance: 0.005 },
    ],
  },
  rob_hives: { name: "Rob the old hives", skill: "scavenging", level: 9, seconds: 4, xp: 12, inputs: {}, outputs: [{ item: "beeswax", qty: 1 }] },
  sift_midden: {
    name: "Sift the village midden", skill: "scavenging", level: 13, seconds: 5, xp: 16, inputs: {},
    outputs: [{ item: "iron_nail", qty: 1 }, { item: "rags", qty: 1, chance: 0.3 }],
  },
  open_chest: {
    name: "Open grandmother's chest", skill: "scavenging", level: 17, seconds: 5, xp: 20, inputs: {},
    outputs: [{ item: "chalk", qty: 1 }, { item: "curio", qty: 1, chance: 0.01 }],
  },

  // Chandlery
  tallow_candle: { name: "Tallow candle", skill: "chandlery", level: 1, seconds: 3, xp: 6, inputs: { tallow: 2 }, outputs: [{ item: "tallow_candle", qty: 1 }] },
  smudge_bundle: { name: "Smudge bundle", skill: "chandlery", level: 4, seconds: 4, xp: 9, inputs: { chamomile: 2, yarrow: 1 }, outputs: [{ item: "smudge", qty: 1 }] },
  beeswax_candle: { name: "Beeswax candle", skill: "chandlery", level: 8, seconds: 4, xp: 12, inputs: { beeswax: 2 }, outputs: [{ item: "beeswax_candle", qty: 1 }] },
  mugwort_incense: { name: "Mugwort incense", skill: "chandlery", level: 10, seconds: 5, xp: 15, inputs: { mugwort: 2, ash: 1 }, outputs: [{ item: "mugwort_incense", qty: 1 }] },
  hearth_candle: { name: "Hearth candle", skill: "chandlery", level: 14, seconds: 5, xp: 19, inputs: { beeswax: 2, stjohns: 1 }, outputs: [{ item: "hearth_candle", qty: 1 }] },
  juniper_incense: { name: "Juniper incense", skill: "chandlery", level: 18, seconds: 6, xp: 23, inputs: { juniper: 2, ash: 1 }, outputs: [{ item: "juniper_incense", qty: 1 }] },

  // Sigilcraft
  salt_line: { name: "Salt line", skill: "sigilcraft", level: 1, seconds: 3, xp: 6, inputs: { salt: 1 }, outputs: [{ item: "salt_line", qty: 1 }] },
  ash_sigil: { name: "Ash sigil", skill: "sigilcraft", level: 4, seconds: 4, xp: 9, inputs: { ash: 2, nettle: 1 }, outputs: [{ item: "ash_sigil", qty: 1 }] },
  iron_ward: { name: "Iron ward", skill: "sigilcraft", level: 8, seconds: 4, xp: 12, inputs: { iron_nail: 2, salt: 1 }, outputs: [{ item: "iron_ward", qty: 1 }] },
  chalk_segment: { name: "Chalk segment", skill: "sigilcraft", level: 12, seconds: 5, xp: 16, inputs: { chalk: 1, salt: 1 }, outputs: [{ item: "chalk_segment", qty: 1 }] },
  hearth_ward: {
    name: "Hearth ward", skill: "sigilcraft", level: 15, seconds: 6, xp: 22,
    inputs: { chalk_segment: 2, iron_ward: 1, stjohns: 1 }, outputs: [{ item: "hearth_ward", qty: 1 }],
  },

  // Scholarship
  decipher_page: {
    name: "Decipher a burnt page", skill: "scholarship", level: 1, seconds: 6, xp: 14,
    inputs: { burnt_page: 1, tallow_candle: 1 }, outputs: [{ item: "deciphered_page", qty: 1 }],
  },
  copy_litany: {
    name: "Copy the Litany", skill: "scholarship", level: 8, seconds: 6, xp: 20,
    inputs: { deciphered_page: 3, beeswax_candle: 1 }, outputs: [{ item: "litany", qty: 1 }],
  },

  // Ritualism (minor rites)
  bless_threshold: {
    name: "Bless the threshold", skill: "ritualism", level: 1, seconds: 10, xp: 25,
    inputs: { salt_line: 1, tallow_candle: 1 }, outputs: [{ item: "consecrated_salt", qty: 1 }],
  },
  smoke_rooms: {
    name: "Smoke the rooms", skill: "ritualism", level: 4, seconds: 12, xp: 35,
    inputs: { smudge: 1, tallow_candle: 1 }, outputs: [], buff: "blessing",
  },
} as const satisfies Record<string, Action>;

export type ActionId = keyof typeof ACTIONS;

/** Widened view for engine code that iterates generically. */
export const ACTION_DEFS: Record<ActionId, Action> = ACTIONS;
