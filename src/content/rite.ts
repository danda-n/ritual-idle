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
    placed: "Candles at the four quarters. The chalk under them remembers being warm.",
  },
  ward: {
    name: "The Ward",
    skill: "sigilcraft",
    items: { salt_line: 40, ash_sigil: 12 },
    placed: "Salt closes the ring. The draught along the floor stops.",
  },
  smoke: {
    name: "The Smoke",
    skill: "herbalism",
    items: { smudge: 16, mugwort_incense: 6 },
    placed: "Smoke settles in the circle and stays there, as if the room had walls inside it.",
  },
  words: {
    name: "The Words",
    skill: "scholarship",
    items: { deciphered_page: 21, litany: 1 },
    placed: "You lay the Litany open in the middle. The ink looks fresher than it did.",
  },
  offering: {
    name: "The Offering",
    skill: "ritualism",
    items: { bread: 2, salt: 3, consecrated_salt: 15 },
    placed: "Bread and salt at the circle's edge, the way she wrote it. Now it only needs waking.",
  },
} as const satisfies Record<string, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>>; placed: string }>;

export type PartId = keyof typeof KINDLING_PARTS;
export const PART_IDS = Object.keys(KINDLING_PARTS) as PartId[];
export const PART_DEFS: Record<PartId, { name: string; skill: SkillId; items: Partial<Record<ItemId, number>>; placed: string }> = KINDLING_PARTS;

// The Chapter 1 Major Rite (docs/CHAPTER1.md §8): a short rite that runs by itself (offline too).
// It needs every part placed and Ritualism 3. Five phases, one per part, each with a log line.
// It never fails. Its quality comes from optional offerings chosen before it begins: a better rite
// adds lore, a cosmetic and keepsakes to choose (content/keepsakes.ts), never the story rewards.
export const HEARTH_RITE = {
  name: "Kindling of the Hearth-Circle",
  description: "Wake the circle grandmother drew in the floor. It has been waiting for you.",
  skills: { ritualism: 3 } as Partial<Record<SkillId, number>>,
  /** Length of each phase (five phases: about 3 minutes in all). */
  phaseMs: 36_000,
  /** One phase per part, in order, each with the line it adds to the log. */
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
  /** Extra lore for a Resplendent rite. */
  resplendentLore: "In the cellar dark, a second circle, older than hers, answers the first.",
  resplendentCosmetic: "An embroidered circle cloth, red on bone, appears on the table.",
} as const;

/** The whole rite's length. */
export const RITE_MS = HEARTH_RITE.phaseMs * HEARTH_RITE.phases.length;

/**
 * Optional offerings, each one quality step. `item` offerings are chosen (and used) when the rite
 * begins; the others count by themselves if they're true when it runs.
 */
export const OFFERINGS = [
  { id: "hearth_candle", label: "A hearth candle at the heart of the circle", item: "hearth_candle" },
  { id: "hearth_mark", label: "The Hearth mark (a hidden recipe) is yours" },
  { id: "still_night", label: "A Still Night blessing active while it runs" },
] as const satisfies readonly { id: string; label: string; item?: ItemId }[];
export type OfferingId = (typeof OFFERINGS)[number]["id"];

/**
 * Outcome quality, from offerings: none → Sound, 1–2 → Fine, all 3 → Resplendent.
 * The rite always succeeds with the same story rewards; Fine adds a keepsake to choose, and
 * Resplendent two, plus lore and the embroidered cloth.
 */
export const QUALITIES = ["Sound", "Fine", "Resplendent"] as const;
export type Quality = (typeof QUALITIES)[number];
/** Offerings needed for Fine and Resplendent. */
export const QUALITY_AT = { fine: 1, resplendent: 3 } as const;
