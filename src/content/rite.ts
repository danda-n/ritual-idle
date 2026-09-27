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
    items: { tallow_candle: 40, beeswax_candle: 8 },
  },
  ward: {
    name: "The Ward",
    skill: "sigilcraft",
    items: { salt_line: 40, ash_sigil: 12 },
  },
  smoke: {
    name: "The Smoke",
    skill: "herbalism",
    items: { smudge: 16, mugwort_incense: 6 },
  },
  words: {
    name: "The Words",
    skill: "scholarship",
    items: { deciphered_page: 21, litany: 1 },
  },
  offering: {
    name: "The Offering",
    skill: "ritualism",
    items: { bread: 2, salt: 3, consecrated_salt: 15 },
  },
} as const satisfies Record<string, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>> }>;

export type PartId = keyof typeof KINDLING_PARTS;
export const PART_IDS = Object.keys(KINDLING_PARTS) as PartId[];
export const PART_DEFS: Record<PartId, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>> }> = KINDLING_PARTS;

// The Chapter 1 Major Rite (docs/CHAPTER1.md §8): a short rite that runs by itself (offline too).
// It needs every part placed and Ritualism 3. Five phases, one per part. It never fails. Its quality
// comes from optional offerings chosen before it begins: a better rite adds keepsakes to choose
// (content/keepsakes.ts) and a cosmetic, never the story rewards.
// The log lines, finale and lore are story: they're read in the Grimoire journal's Kindling entry.
export const HEARTH_RITE = {
  name: "Kindling of the Hearth-Circle",
  skills: { ritualism: 3 } as Partial<Record<SkillId, number>>,
  /** Length of each phase (five phases: about 3 minutes in all). */
  phaseMs: 36_000,
  /** One phase per part, in order, each with its story line (the journal). */
  phases: [
    { part: "light", log: "You kneel at the edge, by the bread and salt, and light the first candle." },
    { part: "ward", log: "Salt closes the ring. The draught along the floor stops." },
    { part: "smoke", log: "Mugwort smoke crawls along the chalk. It will not cross the salt." },
    { part: "words", log: "You read the Litany aloud. Your voice sounds older than it is." },
    { part: "offering", log: "A voice that is not grandmother's says your name, pleased, as if it had been waiting." },
  ] as const satisfies readonly { part: PartId; log: string }[],
  finale: "The circle wakes. The cellar door, nailed shut for years, stands open.",
  rewards: {
    levelCap: 40,
    follower: "janko",
    lore: "Under the floor, the circle goes deeper than the house. Grandmother's notes stop here, mid-sentence.",
  },
  /** Extra story for a Resplendent rite (the journal). */
  resplendentLore: "In the cellar dark, a second circle, older than hers, answers the first.",
  /** The Resplendent cosmetic, as the chapter-end ledger names it. */
  resplendentCosmetic: "embroidered circle cloth",
} as const;

/** The whole rite's length. */
export const RITE_MS = HEARTH_RITE.phaseMs * HEARTH_RITE.phases.length;

/**
 * Optional offerings, each one quality step. `item` offerings are chosen (and used) when the rite
 * begins; the others count by themselves if they're true when it runs.
 */
export const OFFERINGS = [
  { id: "hearth_candle", label: "Hearth candle (uses 1)", item: "hearth_candle" },
  { id: "hearth_mark", label: "Hearth mark discovered (hidden recipe)" },
  { id: "still_night", label: "Still Night active during the rite" },
] as const satisfies readonly { id: string; label: string; item?: ItemId }[];
export type OfferingId = (typeof OFFERINGS)[number]["id"];

/**
 * Outcome quality, from offerings: none → Sound, 1–2 → Fine, all 3 → Resplendent.
 * The rite always succeeds with the same story rewards; Fine adds a keepsake to choose, and
 * Resplendent two, plus the embroidered cloth.
 */
export const QUALITIES = ["Sound", "Fine", "Resplendent"] as const;
export type Quality = (typeof QUALITIES)[number];
/** Offerings needed for Fine and Resplendent. */
export const QUALITY_AT = { fine: 1, resplendent: 3 } as const;
