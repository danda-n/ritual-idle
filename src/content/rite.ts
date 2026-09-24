import type { ItemId } from "./items";
import type { SkillId } from "./skills";

const MIN = 60_000;

/**
 * The Kindling's five parts, in the order grandmother's notes ask for them (docs/CHAPTER1.md §2).
 * Each is made mostly from the recipes its stage teaches, plus one stretch item, and placed in the
 * Circle once. `skill` is the skill that stage introduces.
 */
export const KINDLING_PARTS = {
  light: {
    name: "The Light",
    skill: "chandlery",
    items: { tallow_candle: 25, beeswax_candle: 6 },
    placed: "Candles at the four quarters. The chalk under them remembers being warm.",
  },
  ward: {
    name: "The Ward",
    skill: "sigilcraft",
    items: { salt_line: 25, ash_sigil: 10 },
    placed: "Salt closes the ring. The draught along the floor stops.",
  },
  smoke: {
    name: "The Smoke",
    skill: "herbalism",
    items: { smudge: 13, mugwort_incense: 4 },
    placed: "Smoke settles in the circle and stays there, as if the room had walls inside it.",
  },
  words: {
    name: "The Words",
    skill: "scholarship",
    items: { deciphered_page: 7, litany: 1 },
    placed: "You lay the Litany open in the middle. The ink looks fresher than it did.",
  },
  offering: {
    name: "The Offering",
    skill: "ritualism",
    items: { bread: 2, salt: 3, consecrated_salt: 10 },
    placed: "Bread and salt at the circle's edge, the way she wrote it. Now it only needs waking.",
  },
} as const satisfies Record<string, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>>; placed: string }>;

export type PartId = keyof typeof KINDLING_PARTS;
export const PART_IDS = Object.keys(KINDLING_PARTS) as PartId[];
export const PART_DEFS: Record<PartId, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>>; placed: string }> = KINDLING_PARTS;

// The Chapter 1 Major Rite (docs/CHAPTER1.md §8). It needs every part placed; it never fails.
export const HEARTH_RITE = {
  name: "Kindling of the Hearth-Circle",
  description: "Wake the circle grandmother drew in the floor. It has been waiting for you.",
  skills: { ritualism: 2 } as Partial<Record<SkillId, number>>,
  durationMs: 30 * MIN,
  /** Lines of the rite, revealed as it runs (fraction of the duration, text). */
  log: [
    [0, "You kneel at the edge, by the bread and salt, and light the first candle."],
    [0.12, "One by one the quarters take the flame. The room holds its breath."],
    [0.3, "Mugwort smoke crawls along the chalk. It will not cross the salt."],
    [0.5, "You read the Litany aloud. Your voice sounds older than it is."],
    [0.7, "The circle is warm under your palms, then hot."],
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
