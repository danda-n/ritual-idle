import type { ItemId } from "./items";
import type { SkillId } from "./skills";

const MIN = 60_000;

// The Chapter 1 Major Rite (docs/CHAPTER1.md §8). The recipe is fully listed; it never fails.
export const HEARTH_RITE = {
  name: "Kindling of the Hearth-Circle",
  description: "Wake the circle grandmother drew in the floor. It has been waiting for you.",
  items: {
    hearth_candle: 7,
    mugwort_incense: 3,
    hearth_ward: 1,
    litany: 1,
    consecrated_salt: 3,
    bread: 1,
    salt: 1,
  } as Partial<Record<ItemId, number>>,
  skills: { ritualism: 5 } as Partial<Record<SkillId, number>>,
  durationMs: 30 * MIN,
  /** Lines of the rite, revealed as it runs (fraction of the duration, text). */
  log: [
    [0, "You set the bread and salt at the circle's edge, the way she wrote it."],
    [0.12, "The first hearth candle takes the flame. Then the second. The room holds its breath."],
    [0.3, "Mugwort smoke crawls along the chalk. It will not cross the ward."],
    [0.5, "You read the Litany aloud. Your voice sounds older than it is."],
    [0.7, "The seventh candle. The circle is warm under your palms, then hot."],
    [0.88, "A voice that is not grandmother's says your name, pleased, as if it had been waiting."],
  ] as const,
  finale: "The circle wakes. The cellar door, nailed shut for years, stands open.",
  rewards: {
    levelCap: 40,
    follower: "janko",
    lore: "Under the floor, the circle goes deeper than the house. Grandmother's notes stop here, mid-sentence.",
  },
  /** Extra lore for a Resplendent rite. */
  resplendentLore: "In the cellar dark, a second circle, older than hers, answers the first.",
  resplendentCosmetic: "An embroidered circle cloth, red on bone, appears on the table.",
} as const;

/**
 * Outcome quality, by how many of the three preparation factors were met.
 * 0 → Sound, 1–2 → Fine, all 3 → Resplendent. The rite always succeeds.
 */
export const QUALITIES = ["Sound", "Fine", "Resplendent"] as const;
export type Quality = (typeof QUALITIES)[number];
/** Ritualism level that makes the rite one step better. */
export const SKILLED_RITUALIST = 10;
