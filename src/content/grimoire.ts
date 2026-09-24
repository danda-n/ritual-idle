import type { ItemId } from "./items";
import type { GrimoireEntryDef } from "./types";

// Hidden recipes and secrets for Chapter 1 (docs/GRIMOIRE.md §8).
// Discovering one at the circle *is* making it: the reward applies at once and stays forever.
export const GRIMOIRE = {
  dream_pillow: {
    name: "Dream pillow",
    kind: "hidden",
    ingredients: ["mugwort", "chamomile", "rags"],
    hints: {
      riddle: "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth.",
      category: ["A herb from the forest edge", "A herb from the garden", "Something from the attic"],
      plain: ["mugwort", "chamomile"],
    },
    reward: { kind: "offline_bonus", bonus: 0.1 },
    rewardText: "+10% speed on everything while you're away.",
    reveal: "The pillow smells of her. You sleep, and the house keeps working in your dreams.",
  },
  hearth_mark: {
    name: "Hearth mark",
    kind: "hidden",
    ingredients: ["ash", "charcoal", "salt"],
    hints: {
      riddle: "…where the fire lived, draw its name in what it left behind, and salt to keep it.",
      category: ["Something from the hearth", "Something from the hearth", "Something from the pantry"],
      plain: ["charcoal", "salt"],
    },
    reward: { kind: "rite_quality", steps: 1 },
    rewardText: "Your rites turn out one step better.",
    reveal: "The mark on the hearthstone was always there, under the soot. Now it is yours.",
  },
  threshold_nail: {
    name: "Threshold nail",
    kind: "hidden",
    ingredients: ["iron_nail", "stjohns", "salt"],
    hints: {
      riddle: "…cold iron under the door, and the Kupala herb to make it sing.",
      category: ["Something from the midden", "A herb from the forest edge", "Something from the pantry"],
      plain: ["iron_nail", "stjohns"],
    },
    reward: { kind: "trust_multiplier", multiplier: 1.5 },
    rewardText: "Village trust grows half again as fast.",
    reveal: "Under the threshold, where the nail goes in, a folded note: \"There was a child I could not keep. Find her, if the circle lets you.\"",
  },
  honey_light: {
    name: "Honey-light",
    kind: "secret",
    ingredients: ["beeswax_candle", "chamomile", "glass"],
    reward: { kind: "cosmetic", id: "honey_light" },
    rewardText: "A jar of soft light now glows in the window.",
    reveal: "She kept bees for the light, not the honey. The jar hums when you hold it.",
  },
  hanas_soup: {
    name: "Hana's soup",
    kind: "secret",
    ingredients: ["nettle", "salt", "bread"],
    reward: { kind: "patron_coin", from: "Widow Hana", multiplier: 2 },
    rewardText: "Widow Hana's requests pay double for the rest of the chapter.",
    reveal: "Hana tastes it and cries. \"She made it for me the winter my husband died.\"",
  },
} as const satisfies Record<string, GrimoireEntryDef<ItemId>>;

export type GrimoireId = keyof typeof GRIMOIRE;
export const GRIMOIRE_DEFS: Record<GrimoireId, GrimoireEntryDef<ItemId>> = GRIMOIRE;

/** Insight needed for each hint tier (docs/GRIMOIRE.md §6). */
export const INSIGHT = { category: 6, plain: 12, perExtraName: 6 } as const;

/** Insight from each source. */
export const INSIGHT_GAIN = { failedAttempt: 1, page: 3, curio: 3, request: 2 } as const;

/** Ritualism XP for any experiment that doesn't discover something. */
export const EXPERIMENT_CONSOLATION_XP = 4;

// Curios are read automatically when they drop: a story line and a fragment of insight.
export const CURIO_STORIES = [
  "A child's wooden horse, one leg whittled shorter than the others. Someone was learning.",
  "A button of black horn, with a thread of red wool still knotted through it.",
  "A pressed flower in a folded letter. The letter is blank; the flower is not from any garden here.",
  "A tin whistle. When you blow it, the dogs in the lane go quiet.",
  "A key that fits no door in the house. It is warm.",
] as const;
