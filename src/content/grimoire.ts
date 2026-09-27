import type { ItemId } from "./items";
import type { GrimoireEntryDef } from "./types";

// Hidden recipes and secrets for Chapter 1 (docs/GRIMOIRE.md §8).
// Discovering one at the circle *is* making it: the reward applies at once and stays forever, and a
// hidden recipe can then be bound again as a charm for a timed boost (content/charms.ts).
export const GRIMOIRE = {
  // The first one, made from what every path has by the time experiments open (the Words stage).
  window_charm: {
    name: "Window charm",
    kind: "hidden",
    ingredients: ["tallow_candle", "glass", "salt"],
    hints: {
      riddle: "…a light for the window, glass to hold it, salt along the sill.",
      category: ["Something from the chandler", "Something from the attic", "Something from the pantry"],
      plain: ["tallow_candle", "salt"],
      close: "It's sharp, and it catches the light.",
    },
    reward: { kind: "speed_all", bonus: 0.1 },
    rewardText: "+10% speed, all skills",
    reveal: "Candlelight in the glass, salt on the sill. The house feels watched over, and the work goes quicker.",
  },
  dream_pillow: {
    name: "Dream pillow",
    kind: "hidden",
    ingredients: ["mugwort", "chamomile", "rags"],
    hints: {
      riddle: "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth.",
      category: ["A herb from the forest edge", "A herb from the garden", "Something from the attic"],
      plain: ["mugwort", "chamomile"],
      close: "It's soft, and it was torn from something old.",
    },
    reward: { kind: "xp_all", bonus: 0.1 },
    rewardText: "+10% XP, all skills",
    reveal: "The pillow smells of her. You sleep, and wake knowing things you didn't learn.",
  },
  hearth_mark: {
    name: "Hearth mark",
    kind: "hidden",
    ingredients: ["ash", "charcoal", "salt"],
    hints: {
      riddle: "…where the fire lived, draw its name in what it left behind, and salt to keep it.",
      category: ["Something from the hearth", "Something from the hearth", "Something from the pantry"],
      plain: ["charcoal", "salt"],
      close: "It's grey and fine, and there's always more of it in the grate.",
    },
    reward: [
      { kind: "rite_quality", steps: 1 },
      { kind: "speed", skill: "sigilcraft", bonus: 0.1 },
    ],
    rewardText: "+1 rite quality · +10% Sigilcraft speed",
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
      close: "It keeps things in. The pantry is full of it.",
    },
    reward: { kind: "trust_multiplier", multiplier: 2 },
    rewardText: "Trust gains ×2",
    reveal: "Under the threshold, where the nail goes in, a folded note: \"There was a child I could not keep. Find her, if the circle lets you.\"",
    // A plot thread (the hidden fifth follower): say so on the page, even with the story collapsed.
    opens: "Opens: grandmother's hidden note (journal)",
  },
  honey_light: {
    name: "Honey-light",
    kind: "secret",
    ingredients: ["beeswax_candle", "chamomile", "glass"],
    clues: ["She kept bees for the light, not the honey.", "Something from the garden, gentle and yellow.", "Something that holds light, found broken in the attic."],
    reward: { kind: "cosmetic", id: "honey_light" },
    rewardText: "Cosmetic: honey jar in the window",
    reveal: "She kept bees for the light, not the honey. The jar hums when you hold it.",
  },
  hanas_soup: {
    name: "Hana's soup",
    kind: "secret",
    ingredients: ["nettle", "salt", "bread"],
    clues: ["A soup for a widow, the way grandmother made it.", "Something from the ditch by the lane. It stings.", "A loaf from the village, and what keeps things in."],
    reward: { kind: "patron_coin", from: "Widow Hana", multiplier: 2 },
    rewardText: "Widow Hana's contracts pay ×2 (this chapter)",
    reveal: "Hana tastes it and cries. \"She made it for me the winter my husband died.\"",
  },
} as const satisfies Record<string, GrimoireEntryDef<ItemId>>;

export type GrimoireId = keyof typeof GRIMOIRE;
export const GRIMOIRE_DEFS: Record<GrimoireId, GrimoireEntryDef<ItemId>> = GRIMOIRE;

/**
 * Insight is one pool, spent on the hint you want (docs/GRIMOIRE.md §6): a hidden recipe's
 * categories, one of its ingredients named, a nudge toward the one that's never named, or a
 * secret's next clue.
 */
export const INSIGHT_COST = { category: 4, name: 6, close: 6, clue: 4 } as const;

/** Insight from each source. */
export const INSIGHT_GAIN = { failedAttempt: 1, page: 2, curio: 3, request: 2 } as const;

/** Ritualism XP for any experiment that doesn't discover something. */
export const EXPERIMENT_CONSOLATION_XP = 4;

// Curios are read automatically when they drop: some insight, and a story for the journal
// (Grimoire › Curios lists the name; the story opens under it).
export const CURIOS = [
  { name: "Wooden horse", story: "A child's wooden horse, one leg whittled shorter than the others. Someone was learning." },
  { name: "Horn button", story: "A button of black horn, with a thread of red wool still knotted through it." },
  { name: "Pressed flower", story: "A pressed flower in a folded letter. The letter is blank; the flower is not from any garden here." },
  { name: "Tin whistle", story: "A tin whistle. When you blow it, the dogs in the lane go quiet." },
  { name: "Warm key", story: "A key that fits no door in the house. It is warm." },
] as const;
export const CURIO_STORIES = CURIOS.map((c) => c.story);
