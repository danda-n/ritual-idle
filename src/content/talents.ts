import type { ActionId } from "./actions";
import type { ItemId } from "./items";
import type { SkillId } from "./skills";

// Skill talents (docs/CHAPTER1.md §11): builds, not small percentages. At levels 3, 6, 9 and 12
// each skill offers a pair, and you take one side of each pair. The sides pull different ways,
// and some help another skill. Switching sides is free, any time.

/** The levels at which a skill offers a pair (one per tier). */
export const TALENT_LEVELS = [3, 6, 9, 12] as const;
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
  /** What it does, in plain words, trade-off included. */
  text: string;
  effects: TalentEffect[];
}

export type TalentPair = { a: TalentDef; b: TalentDef };

export const TALENTS: Record<SkillId, Record<TalentLevel, TalentPair>> = {
  scavenging: {
    3: {
      a: { name: "Quick fingers", text: "+15% Scavenging speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Deep shelves", text: "Scavenging chance finds ×1.5", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    6: {
      a: { name: "Full arms", text: "Pantry & hives: ×2 output & XP · +80% time", effects: [{ kind: "bulk", actions: ["search_pantry", "rob_hives"], slower: 0.8 }] },
      b: { name: "For the chandler", text: "+12% Chandlery speed", effects: [{ kind: "speed", bonus: 0.12, skill: "chandlery" }] },
    },
    9: {
      a: { name: "Scavenger's luck", text: "10% chance a search comes doubled, XP too.", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "Busy hands", text: "+25% Scavenging XP.", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    12: {
      a: { name: "Grandmother's eye", text: "Curios are three times as likely.", effects: [{ kind: "find", multiplier: 3, item: "curio" }] },
      b: { name: "Well stocked", text: "The pantry always turns up salt.", effects: [{ kind: "find", multiplier: 2, item: "salt" }] },
    },
  },
  chandlery: {
    3: {
      a: { name: "Quick pour", text: "+15% Chandlery speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Thin wicks", text: "Tallow candles take 1 tallow instead of 2.", effects: [{ kind: "thrift", action: "tallow_candle", item: "tallow", less: 1 }] },
    },
    6: {
      a: { name: "Double moulds", text: "Candles: ×2 output & XP · +80% time", effects: [{ kind: "bulk", actions: ["tallow_candle", "beeswax_candle"], slower: 0.8 }] },
      b: { name: "Wick ash", text: "33% of candles: +1 ash", effects: [{ kind: "byproduct", actions: ["tallow_candle", "beeswax_candle"], item: "ash", chance: 0.33 }] },
    },
    9: {
      a: { name: "Steady flame", text: "10% chance a pour comes doubled, XP too.", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "A light to read by", text: "+12% Scholarship speed", effects: [{ kind: "speed", bonus: 0.12, skill: "scholarship" }] },
    },
    12: {
      a: { name: "Hearth-light", text: "Hearth candles come in pairs, at no extra time.", effects: [{ kind: "bulk", actions: ["hearth_candle"], slower: 0 }] },
      b: { name: "Chandler's pride", text: "+30% Chandlery XP.", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
  },
  sigilcraft: {
    3: {
      a: { name: "Sure strokes", text: "+15% Sigilcraft speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Fine ash", text: "Ash sigils take 1 ash instead of 2.", effects: [{ kind: "thrift", action: "ash_sigil", item: "ash", less: 1 }] },
    },
    6: {
      a: { name: "Long lines", text: "Salt lines: ×2 output & XP · +80% time", effects: [{ kind: "bulk", actions: ["salt_line"], slower: 0.8 }] },
      b: { name: "Warded rooms", text: "+12% Ritualism speed", effects: [{ kind: "speed", bonus: 0.12, skill: "ritualism" }] },
    },
    9: {
      a: { name: "Steady hand", text: "Sigilcraft: 15% chance of no inputs", effects: [{ kind: "save", actions: ["salt_line", "ash_sigil", "iron_ward", "chalk_segment", "hearth_ward"], chance: 0.15 }] },
      b: { name: "Practised", text: "+25% Sigilcraft XP.", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    12: {
      a: { name: "Charcoal eye", text: "Sweeping turns up charcoal three times as often.", effects: [{ kind: "find", multiplier: 3, item: "charcoal" }] },
      b: { name: "Iron will", text: "Iron wards come in pairs, at no extra time.", effects: [{ kind: "bulk", actions: ["iron_ward"], slower: 0 }] },
    },
  },
  herbalism: {
    3: {
      a: { name: "Light step", text: "+15% Herbalism speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Green thumb", text: "20% chance of an extra herb or bundle.", effects: [{ kind: "extra", chance: 0.2 }] },
    },
    6: {
      a: { name: "Tight bundles", text: "Smudge: ×2 output & XP · +80% time", effects: [{ kind: "bulk", actions: ["smudge_bundle"], slower: 0.8 }] },
      b: { name: "Pure smoke", text: "Mugwort incense needs no tallow.", effects: [{ kind: "thrift", action: "mugwort_incense", item: "tallow", less: 1 }] },
    },
    9: {
      a: { name: "Dew-picked", text: "Every 5th pick gives 1 extra.", effects: [{ kind: "everyNth", n: 5 }] },
      b: { name: "Herb-wise", text: "+12% Chandlery speed", effects: [{ kind: "speed", bonus: 0.12, skill: "chandlery" }] },
    },
    12: {
      a: { name: "Wild harvest", text: "10% chance a pick comes doubled, XP too.", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "Herbwife", text: "+30% Herbalism XP.", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
  },
  scholarship: {
    3: {
      a: { name: "Quick eyes", text: "+15% Scholarship speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Keen search", text: "The attic's finds (pages, rags, curios) are 50% more likely.", effects: [{ kind: "find", multiplier: 1.5 }] },
    },
    6: {
      a: { name: "By one candle", text: "Decipher: 50% chance of no inputs", effects: [{ kind: "save", actions: ["decipher_page"], chance: 0.5 }] },
      b: { name: "Marginalia", text: "+1 insight from every page deciphered.", effects: [{ kind: "insight", action: "decipher_page", amount: 1 }] },
    },
    9: {
      a: { name: "Well read", text: "+25% Scholarship XP.", effects: [{ kind: "xp", bonus: 0.25 }] },
      b: { name: "The rite's words", text: "+20% Ritualism XP.", effects: [{ kind: "xp", bonus: 0.2, skill: "ritualism" }] },
    },
    12: {
      a: { name: "Footnotes", text: "+2 insight from every page deciphered.", effects: [{ kind: "insight", action: "decipher_page", amount: 2 }] },
      b: { name: "Copyist", text: "Scholarship: 10% chance ×2 output & XP", effects: [{ kind: "double", chance: 0.1 }] },
    },
  },
  ritualism: {
    3: {
      a: { name: "Practised rites", text: "+15% Ritualism speed.", effects: [{ kind: "speed", bonus: 0.15 }] },
      b: { name: "Devout", text: "+25% Ritualism XP.", effects: [{ kind: "xp", bonus: 0.25 }] },
    },
    6: {
      a: { name: "Long blessing", text: "Blessing lasts ×2 (30m)", effects: [{ kind: "buffLength", multiplier: 2 }] },
      b: { name: "Consecrated hands", text: "Minor rites: 30% chance of no inputs", effects: [{ kind: "save", actions: ["bless_threshold", "smoke_rooms"], chance: 0.3 }] },
    },
    9: {
      a: { name: "Omen-sense", text: "Omens turn up twice as often, from any work.", effects: [{ kind: "omenChance", multiplier: 2 }] },
      b: { name: "Circle-keeper", text: "+12% Sigilcraft speed", effects: [{ kind: "speed", bonus: 0.12, skill: "sigilcraft" }] },
    },
    12: {
      a: { name: "Blessed work", text: "Ritualism: 10% chance ×2 output & XP", effects: [{ kind: "double", chance: 0.1 }] },
      b: { name: "High rites", text: "+30% Ritualism XP.", effects: [{ kind: "xp", bonus: 0.3 }] },
    },
  },
};
