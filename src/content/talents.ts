import type { ActionId } from "./actions";
import type { ItemId } from "./items";
import type { SkillId } from "./skills";

// Skill talents (docs/CHAPTER1.md §11): builds, not small percentages. Every 3 levels up to 30,
// each skill offers a pair, and you take one side of each pair. The sides pull different ways,
// and some help another skill. A pick is fixed until the next talent level (nextTalentLevel);
// then it can be changed again.

/** The levels at which a skill offers a pair (one per tier). */
export const TALENT_LEVELS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] as const;
/** Past the last talent level, later chapters space pairs out this far apart. */
export const TALENT_SPACING_AFTER = 5;

/** The talent level after `at`: a pick made at `at` can be changed again from there. */
export function nextTalentLevel(at: number): number {
  const next = (TALENT_LEVELS as readonly number[]).find((l) => l > at);
  return next ?? at + TALENT_SPACING_AFTER;
}
export type TalentLevel = (typeof TALENT_LEVELS)[number];
export type Side = "a" | "b";

export type TalentEffect =
  /** This skill is faster (or another skill, with `skill`). */
  | { kind: "speed"; bonus: number; skill?: SkillId }
  /** More XP in this skill (or another, with `skill`). */
  | { kind: "xp"; bonus: number; skill?: SkillId }
  /** This skill's chance finds are more likely (all of them, or one item). */
  | { kind: "find"; multiplier: number; item?: ItemId }
  /** These actions make +1 of their main output, and its XP, but take longer. */
  | { kind: "bulk"; actions: ActionId[]; slower: number }
  /** A chance that a repetition comes doubled: outputs and XP. */
  | { kind: "double"; chance: number }
  /** A chance of 1 extra of each sure output. */
  | { kind: "extra"; chance: number }
  /** Every nth repetition of an action gives 1 extra of its sure outputs. */
  | { kind: "everyNth"; n: number }
  /** This action uses fewer of an input. */
  | { kind: "thrift"; action: ActionId; item: ItemId; less: number }
  /** A chance that these actions use no inputs at all. */
  | { kind: "save"; actions: ActionId[]; chance: number }
  /** These actions also give an item, sometimes. */
  | { kind: "byproduct"; actions: ActionId[]; item: ItemId; chance: number }
  /** Insight from each repetition of this action. */
  | { kind: "insight"; action: ActionId; amount: number }
  /** Buffs from this skill's actions last longer. */
  | { kind: "buffLength"; multiplier: number }
  /** Omens turn up more often, from any work. */
  | { kind: "omenChance"; multiplier: number };

export interface TalentDef {
  name: string;
  /**
   * Optional flavour, shown on hover. What a talent does is never written here: it's generated
   * from `effects` (src/ui/effects.ts talentText), so the words always match the numbers.
   */
  flavour?: string;
  effects: TalentEffect[];
}

export type TalentPair = { a: TalentDef; b: TalentDef };

export const TALENTS: Record<SkillId, Record<TalentLevel, TalentPair>> = {
  scavenging: {
    3: {
      a: { name: "Quick fingers", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Deep shelves", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    6: {
      a: { name: "Full arms", effects: [{ kind: "bulk", actions: ["search_pantry", "rob_hives"], slower: 0.8 }] },
      b: { name: "For the chandler", effects: [{ kind: "speed", bonus: 0.12, skill: "chandlery" }] },
    },
    9: {
      a: { name: "Scavenger's luck", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "Busy hands", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    12: {
      a: { name: "Grandmother's eye", effects: [{ kind: "find", multiplier: 3, item: "curio" }] },
      b: { name: "Well stocked", effects: [{ kind: "find", multiplier: 2, item: "salt" }] },
    },
    15: {
      a: { name: "Long strides", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "Keen nose", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    18: {
      a: { name: "Heavy sacks", effects: [{ kind: "bulk", actions: ["sift_midden", "open_chest"], slower: 0.8 }] },
      b: { name: "Barrel scraper", effects: [{ kind: "bulk", actions: ["salt_barrel"], slower: 0 }] },
    },
    21: {
      a: { name: "Lucky hands", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Busier hands", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
    24: {
      a: { name: "Pack mule", effects: [{ kind: "extra", chance: 0.2 }] },
      b: { name: "Stock for the chandler", effects: [{ kind: "speed", bonus: 0.2, skill: "chandlery" }] },
    },
    27: {
      a: { name: "Old pockets", effects: [{ kind: "find", multiplier: 2, item: "curio" }] },
      b: { name: "Omen-seeker", effects: [{ kind: "omenChance", multiplier: 1.5 }] },
    },
    30: {
      a: { name: "Master scavenger", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "Every fifth shelf", effects: [{ kind: "everyNth", n: 5 }] },
    },
  },
  chandlery: {
    3: {
      a: { name: "Quick pour", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Thin wicks", effects: [{ kind: "thrift", action: "tallow_candle", item: "tallow", less: 1 }] },
    },
    6: {
      a: { name: "Double moulds", effects: [{ kind: "bulk", actions: ["tallow_candle", "beeswax_candle"], slower: 0.8 }] },
      b: { name: "Wick ash", effects: [{ kind: "byproduct", actions: ["tallow_candle", "beeswax_candle"], item: "ash", chance: 0.33 }] },
    },
    9: {
      a: { name: "Steady flame", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "A light to read by", effects: [{ kind: "speed", bonus: 0.12, skill: "scholarship" }] },
    },
    12: {
      a: { name: "Hearth-light", effects: [{ kind: "bulk", actions: ["hearth_candle"], slower: 0 }] },
      b: { name: "Chandler's pride", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
    15: {
      a: { name: "Steady pour", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "Frugal wax", effects: [{ kind: "thrift", action: "beeswax_candle", item: "beeswax", less: 1 }] },
    },
    18: {
      a: { name: "Wax to spare", effects: [{ kind: "byproduct", actions: ["beeswax_candle", "hearth_candle"], item: "beeswax", chance: 0.25 }] },
      b: { name: "Incense moulds", effects: [{ kind: "bulk", actions: ["juniper_incense"], slower: 0.5 }] },
    },
    21: {
      a: { name: "Candle luck", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Chandler's craft", effects: [{ kind: "xp", bonus: 0.35 }] },
    },
    24: {
      a: { name: "Thrifty flame", effects: [{ kind: "save", actions: ["tallow_candle", "beeswax_candle", "hearth_candle", "juniper_incense"], chance: 0.15 }] },
      b: { name: "Light for the sigils", effects: [{ kind: "speed", bonus: 0.2, skill: "sigilcraft" }] },
    },
    27: {
      a: { name: "Extra wicks", effects: [{ kind: "extra", chance: 0.2 }] },
      b: { name: "Every sixth candle", effects: [{ kind: "everyNth", n: 6 }] },
    },
    30: {
      a: { name: "Master chandler", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "Hearth-keeper", effects: [{ kind: "xp", bonus: 0.4 }] },
    },
  },
  sigilcraft: {
    3: {
      a: { name: "Sure strokes", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Fine ash", effects: [{ kind: "thrift", action: "ash_sigil", item: "ash", less: 1 }] },
    },
    6: {
      a: { name: "Long lines", effects: [{ kind: "bulk", actions: ["salt_line"], slower: 0.8 }] },
      b: { name: "Warded rooms", effects: [{ kind: "speed", bonus: 0.12, skill: "ritualism" }] },
    },
    9: {
      a: { name: "Steady hand", effects: [{ kind: "save", actions: ["salt_line", "ash_sigil", "iron_ward", "chalk_segment", "hearth_ward"], chance: 0.15 }] },
      b: { name: "Practised", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    12: {
      a: { name: "Charcoal eye", effects: [{ kind: "find", multiplier: 3, item: "charcoal" }] },
      b: { name: "Iron will", effects: [{ kind: "bulk", actions: ["iron_ward"], slower: 0 }] },
    },
    15: {
      a: { name: "Quick lines", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "One nail short", effects: [{ kind: "thrift", action: "iron_ward", item: "iron_nail", less: 1 }] },
    },
    18: {
      a: { name: "Heavy sigils", effects: [{ kind: "bulk", actions: ["ash_sigil"], slower: 0.8 }] },
      b: { name: "Chalk dust", effects: [{ kind: "byproduct", actions: ["chalk_segment"], item: "chalk", chance: 0.25 }] },
    },
    21: {
      a: { name: "Sure mark", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Sigil lore", effects: [{ kind: "xp", bonus: 0.35 }] },
    },
    24: {
      a: { name: "Salt keeper", effects: [{ kind: "save", actions: ["salt_line", "ash_sigil"], chance: 0.2 }] },
      b: { name: "Warding the rites", effects: [{ kind: "speed", bonus: 0.2, skill: "ritualism" }] },
    },
    27: {
      a: { name: "Deep sweeps", effects: [{ kind: "extra", chance: 0.2 }] },
      b: { name: "Soot-reader", effects: [{ kind: "find", multiplier: 2, item: "charcoal" }] },
    },
    30: {
      a: { name: "Master of wards", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "Grand wards", effects: [{ kind: "bulk", actions: ["hearth_ward"], slower: 0 }] },
    },
  },
  herbalism: {
    3: {
      a: { name: "Light step", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Green thumb", effects: [{ kind: "extra", chance: 0.2 }] },
    },
    6: {
      a: { name: "Tight bundles", effects: [{ kind: "bulk", actions: ["smudge_bundle"], slower: 0.8 }] },
      b: { name: "Pure smoke", effects: [{ kind: "thrift", action: "mugwort_incense", item: "tallow", less: 1 }] },
    },
    9: {
      a: { name: "Dew-picked", effects: [{ kind: "everyNth", n: 5 }] },
      b: { name: "Herb-wise", effects: [{ kind: "speed", bonus: 0.12, skill: "chandlery" }] },
    },
    12: {
      a: { name: "Wild harvest", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "Herbwife", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
    15: {
      a: { name: "Swift picking", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "Rich soil", effects: [{ kind: "extra", chance: 0.15 }] },
    },
    18: {
      a: { name: "Bundles of plenty", effects: [{ kind: "bulk", actions: ["mugwort_incense"], slower: 0.8 }] },
      b: { name: "Loose flowers", effects: [{ kind: "byproduct", actions: ["smudge_bundle"], item: "chamomile", chance: 0.3 }] },
    },
    21: {
      a: { name: "Good harvest", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Herb lore", effects: [{ kind: "xp", bonus: 0.35 }] },
    },
    24: {
      a: { name: "Gentle binding", effects: [{ kind: "save", actions: ["smudge_bundle", "mugwort_incense"], chance: 0.2 }] },
      b: { name: "Herbs for the attic", effects: [{ kind: "speed", bonus: 0.2, skill: "scholarship" }] },
    },
    27: {
      a: { name: "Every third pick", effects: [{ kind: "everyNth", n: 3 }] },
      b: { name: "Bitter gift", effects: [{ kind: "thrift", action: "smudge_bundle", item: "nettle", less: 1 }] },
    },
    30: {
      a: { name: "Master herbwife", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "Wild bounty", effects: [{ kind: "double", chance: 0.2 }] },
    },
  },
  scholarship: {
    3: {
      a: { name: "Quick eyes", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Keen search", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    6: {
      a: { name: "By one candle", effects: [{ kind: "save", actions: ["decipher_page"], chance: 0.5 }] },
      b: { name: "Marginalia", effects: [{ kind: "insight", action: "decipher_page", amount: 1 }] },
    },
    9: {
      a: { name: "Well read", effects: [{ kind: "xp", bonus: 0.25 }] },
      b: { name: "The rite's words", effects: [{ kind: "xp", bonus: 0.2, skill: "ritualism" }] },
    },
    12: {
      a: { name: "Footnotes", effects: [{ kind: "insight", action: "decipher_page", amount: 2 }] },
      b: { name: "Copyist", effects: [{ kind: "double", chance: 0.1 }] },
    },
    15: {
      a: { name: "Fast reader", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "Sharp search", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    18: {
      a: { name: "By moonlight", effects: [{ kind: "thrift", action: "decipher_page", item: "tallow_candle", less: 1 }] },
      b: { name: "Scribe's hand", effects: [{ kind: "bulk", actions: ["copy_litany"], slower: 0 }] },
    },
    21: {
      a: { name: "Lucky pages", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Deep study", effects: [{ kind: "xp", bonus: 0.35 }] },
    },
    24: {
      a: { name: "Glosses", effects: [{ kind: "insight", action: "decipher_page", amount: 2 }] },
      b: { name: "Words for the rites", effects: [{ kind: "speed", bonus: 0.2, skill: "ritualism" }] },
    },
    27: {
      a: { name: "Rag picker", effects: [{ kind: "find", multiplier: 2, item: "rags" }] },
      b: { name: "Ink economy", effects: [{ kind: "save", actions: ["decipher_page", "copy_litany"], chance: 0.25 }] },
    },
    30: {
      a: { name: "Master scholar", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "The whole book", effects: [{ kind: "insight", action: "decipher_page", amount: 3 }] },
    },
  },
  ritualism: {
    3: {
      a: { name: "Practised rites", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Devout", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    6: {
      a: { name: "Long blessing", effects: [{ kind: "buffLength", multiplier: 2 }] },
      b: { name: "Consecrated hands", effects: [{ kind: "save", actions: ["bless_threshold", "smoke_rooms"], chance: 0.3 }] },
    },
    9: {
      a: { name: "Omen-sense", effects: [{ kind: "omenChance", multiplier: 2 }] },
      b: { name: "Circle-keeper", effects: [{ kind: "speed", bonus: 0.12, skill: "sigilcraft" }] },
    },
    12: {
      a: { name: "Blessed work", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "High rites", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
    15: {
      a: { name: "Steady rites", effects: [{ kind: "speed", bonus: 0.25 }] },
      b: { name: "Spare salt", effects: [{ kind: "save", actions: ["bless_threshold"], chance: 0.25 }] },
    },
    18: {
      a: { name: "Lingering blessing", effects: [{ kind: "buffLength", multiplier: 1.5 }] },
      b: { name: "Blessed hands", effects: [{ kind: "xp", bonus: 0.35 }] },
    },
    21: {
      a: { name: "Rite luck", effects: [{ kind: "double", chance: 0.15 }] },
      b: { name: "Omen-reader", effects: [{ kind: "omenChance", multiplier: 1.5 }] },
    },
    24: {
      a: { name: "Consecrated work", effects: [{ kind: "speed", bonus: 0.2, skill: "chandlery" }] },
      b: { name: "Salt of the earth", effects: [{ kind: "extra", chance: 0.2 }] },
    },
    27: {
      a: { name: "Circle-bound", effects: [{ kind: "speed", bonus: 0.2, skill: "herbalism" }] },
      b: { name: "Every seventh rite", effects: [{ kind: "everyNth", n: 7 }] },
    },
    30: {
      a: { name: "Master of rites", effects: [{ kind: "speed", bonus: 0.35 }] },
      b: { name: "High devotion", effects: [{ kind: "xp", bonus: 0.5 }] },
    },
  },
};
