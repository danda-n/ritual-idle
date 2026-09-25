import type { ItemId } from "./items";
import type { SkillId } from "./skills";


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

// The Chapter 1 Major Rite (docs/CHAPTER1.md §8): a short ceremony you play. It needs every
// part placed and Ritualism 2. Five phases, one per part; each has one moment to answer.
// It never fails: answering well only makes it better.
export const HEARTH_RITE = {
  name: "Kindling of the Hearth-Circle",
  description: "Wake the circle grandmother drew in the floor. It has been waiting for you.",
  skills: { ritualism: 2 } as Partial<Record<SkillId, number>>,
  /** Length of each phase. */
  phaseMs: 60_000,
  /** How long a moment stays open once it comes. */
  momentMs: 12_000,
  /** One phase per part, in order: its log line, and the moment that comes partway through. */
  phases: [
    { part: "light", log: "You kneel at the edge, by the bread and salt, and light the first candle.", moment: { at: 0.35, prompt: "A candle gutters.", button: "Tend the flame" } },
    { part: "ward", log: "Salt closes the ring. The draught along the floor stops.", moment: { at: 0.45, prompt: "The salt line breaks where the floor dips.", button: "Close the line" } },
    { part: "smoke", log: "Mugwort smoke crawls along the chalk. It will not cross the salt.", moment: { at: 0.3, prompt: "The smoke drifts toward the door.", button: "Call it back" } },
    { part: "words", log: "You read the Litany aloud. Your voice sounds older than it is.", moment: { at: 0.5, prompt: "You lose your place on the page.", button: "Find the line" } },
    { part: "offering", log: "A voice that is not grandmother's says your name, pleased, as if it had been waiting.", moment: { at: 0.4, prompt: "Something reaches for the bread.", button: "Hold the offering" } },
  ] as const satisfies readonly { part: PartId; log: string; moment: { at: number; prompt: string; button: string } }[],
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

/** The whole ceremony's length. */
export const RITE_MS = HEARTH_RITE.phaseMs * HEARTH_RITE.phases.length;

/**
 * Outcome quality, from quality steps: one per moment answered (5), one for the Hearth mark,
 * one for an omen active during the rite (7 in all). 0–2 → Sound, 3–5 → Fine, 6–7 → Resplendent.
 * The rite always succeeds.
 */
export const QUALITIES = ["Sound", "Fine", "Resplendent"] as const;
export type Quality = (typeof QUALITIES)[number];
/** Steps needed for Fine and Resplendent. */
export const QUALITY_AT = { fine: 3, resplendent: 6 } as const;
