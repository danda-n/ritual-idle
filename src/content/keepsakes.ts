// Keepsakes (docs/CHAPTER1.md §8): what a better rite leaves behind. A Fine Kindling lets you
// choose one of these, a Resplendent one two. They last for good (swapping them comes with
// Ascension, later). Small on purpose: a plain rite still gives the whole story and its rewards.

export type KeepsakeEffect =
  /** The house works this much faster while you're away (0.1 = 10%). */
  | { kind: "offline_bonus"; bonus: number }
  /** The omen shelf holds this many more omens (once it's built). */
  | { kind: "omen_slot"; extra: number }
  /** Insight from every page deciphered. */
  | { kind: "page_insight"; amount: number };

export interface KeepsakeDef {
  name: string;
  /** What it does, numbers first. */
  text: string;
  /** One line of lore: the card's hover title. */
  flavour: string;
  effect: KeepsakeEffect;
}

export const KEEPSAKES = {
  quilt: {
    name: "Grandmother's quilt",
    text: "+10% offline speed",
    flavour: "Patched a hundred times. It still smells of her stove.",
    effect: { kind: "offline_bonus", bonus: 0.1 },
  },
  embers: {
    name: "A jar of embers",
    text: "+1 omen slot",
    flavour: "Taken from the circle as it woke. They haven't gone out.",
    effect: { kind: "omen_slot", extra: 1 },
  },
  glasses: {
    name: "Her reading glasses",
    text: "+1 insight per page deciphered",
    flavour: "One lens cracked. Through it, the burnt lines almost read themselves.",
    effect: { kind: "page_insight", amount: 1 },
  },
} as const satisfies Record<string, KeepsakeDef>;

export type KeepsakeId = keyof typeof KEEPSAKES;
export const KEEPSAKE_IDS = Object.keys(KEEPSAKES) as KeepsakeId[];
export const KEEPSAKE_DEFS: Record<KeepsakeId, KeepsakeDef> = KEEPSAKES;

/** Keepsakes to choose, by rite quality (Sound, Fine, Resplendent). */
export const KEEPSAKE_PICKS = [0, 1, 2] as const;
