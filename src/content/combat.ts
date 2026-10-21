import type { ItemId } from "./items";

// The cellar: foes, gear, remedies and the boss (docs/COMBAT.md). Numbers are starting points; the
// cellar playthrough (src/engine/playthrough.test.ts) checks they still make a 45–75 minute cellar.

const S = 1000;

// ---------- Your side ----------

/** What you are before any gear: Health 40 at Warding 1, +2 a level, and a blow with your bare hands. */
export const BASE = {
  health: 40,
  healthPerLevel: 2,
  strike: 2,
  /** A blow every 3 s at first; Warding levels, Speed affixes and talents make it quicker. */
  blowMs: 3 * S,
  /** 5% of your blows land ×2. */
  telling: 0.05,
  tellingMult: 2,
  /** Between foes you catch your breath: this share of your Health comes back. */
  breath: 0.1,
  /** Out of a fight, Health comes back in full in about 2 minutes of any other work (online or off). */
  regenFullMs: 120 * S,
  /** Your blows ×1.5 when the Hand or Lantern carries the foe's feared tag; its blows ×0.5 when the Amulet does. */
  weaknessStrike: 1.5,
  weaknessWard: 0.5,
  /** A few foes shrug off one tag: blows of that tag ×0.75. */
  resisted: 0.75,
  /** Each blow is rolled between 75% and 125% of its size. */
  rollLow: 0.75,
  rollHigh: 1.25,
  /** The healing rule's default line, and its limits (steps of 5). */
  healAt: 40,
  healAtMin: 10,
  healAtMax: 80,
  /** Named loadouts you can save (the Warded cellar door adds one). */
  loadouts: 2,
  /** Options to choose from when a random affix rolls (the Workbench and Keen eye add one each). */
  rollOptions: 2,
} as const;

/** Weakness and readiness: a foe's feared tag shows after this many are beaten (Grave-sense lowers it). */
export const WEAKNESS_SHOWS_AFTER = 10;

export const TAGS = { salt: "salt", iron: "iron", fire: "fire", smoke: "smoke", hearth: "hearth" } as const;
export type Tag = keyof typeof TAGS;

export const SLOTS = ["amulet", "hand", "lantern", "garment", "belt"] as const;
export type Slot = (typeof SLOTS)[number];

export const SLOT_DEFS: Record<Slot, { name: string; gives: string }> = {
  amulet: { name: "Amulet", gives: "gives Ward and a tag" },
  hand: { name: "Hand", gives: "gives Strike and a tag" },
  lantern: { name: "Lantern", gives: "gives Strike and a tag" },
  garment: { name: "Garment", gives: "gives Health and softens special attacks" },
  belt: { name: "Belt", gives: "holds your remedies" },
};

// ---------- Affixes ----------

/**
 * What an affix can do. Fixed affixes are a piece's identity; random ones roll from the slot's pool
 * when the piece is made, and you choose one of the options (docs/COMBAT.md §4).
 */
export type AffixKind =
  | "ward" // + Ward
  | "health" // + Health
  | "strike" // + Strike
  | "speed" // % faster blows
  | "telling" // + telling blow chance (percentage points)
  | "specials" // special attacks hit this much softer (%)
  | "loot" // loot chances ×(1 + n%)
  | "xp" // + Warding XP (%)
  | "perFoe" // + Health per foe beaten
  | "beltCap" // the Belt holds more remedies
  | "remedyHeal"; // remedies heal more (%)

export interface Affix {
  kind: AffixKind;
  value: number;
}

/** Each slot's pool of random affixes at tier 1, with each option's range (whole numbers). */
export const AFFIX_POOLS: Record<Slot, { kind: AffixKind; min: number; max: number }[]> = {
  amulet: [
    { kind: "ward", min: 3, max: 5 },
    { kind: "health", min: 5, max: 8 },
    { kind: "specials", min: 10, max: 15 },
  ],
  hand: [
    { kind: "strike", min: 1, max: 2 },
    { kind: "speed", min: 3, max: 5 },
    { kind: "telling", min: 2, max: 3 },
  ],
  lantern: [
    { kind: "strike", min: 1, max: 2 },
    { kind: "loot", min: 10, max: 15 },
    { kind: "xp", min: 5, max: 10 },
  ],
  garment: [
    { kind: "health", min: 4, max: 8 },
    { kind: "ward", min: 2, max: 4 },
    { kind: "perFoe", min: 1, max: 1 },
  ],
  belt: [
    { kind: "beltCap", min: 2, max: 4 },
    { kind: "remedyHeal", min: 10, max: 20 },
  ],
};

// ---------- Pieces ----------

export interface PieceDef {
  name: string;
  slot: Slot;
  /** Crafting level needed to make it. */
  level: number;
  /** Base stats at tier 1. */
  base: { ward?: number; strike?: number; health?: number; beltCap?: number };
  /** The piece's tag, if it carries one (Amulet, Hand and Lantern pieces do). */
  tag?: Tag;
  /** Its fixed trait besides the tag, if any. */
  fixed?: Affix;
  /** What making it uses. */
  items: Partial<Record<ItemId, number>>;
  /** Making it takes this long in the action slot, and gives this much Crafting XP. */
  seconds: number;
  xp: number;
  /** What a reforge (re-rolling its random affix) uses. */
  reforge: Partial<Record<ItemId, number>>;
  /** Pieces of the same set count toward its bonus. */
  set?: SetId;
}

export const PIECES = {
  salt_pouch: { name: "Salt pouch", slot: "amulet", level: 1, base: { ward: 10 }, tag: "salt", items: { stitched_linen: 1, salt: 4 }, seconds: 12, xp: 15, reforge: { salt: 4 }, set: "grandmother" },
  iron_knife: { name: "Iron knife", slot: "hand", level: 2, base: { strike: 5 }, tag: "iron", items: { iron_blank: 2 }, seconds: 12, xp: 20, reforge: { iron_blank: 1 } },
  tallow_lantern: { name: "Tallow lantern", slot: "lantern", level: 3, base: { strike: 3 }, tag: "fire", items: { lantern_frame: 1, tallow_candle: 3 }, seconds: 15, xp: 28, reforge: { tallow_candle: 3 } },
  herb_belt: { name: "Herb belt", slot: "belt", level: 4, base: { beltCap: 10 }, fixed: { kind: "remedyHeal", value: 10 }, items: { stitched_linen: 2, nettle: 4 }, seconds: 15, xp: 35, reforge: { stitched_linen: 1, nettle: 2 }, set: "grandmother" },
  censer: { name: "Censer", slot: "lantern", level: 6, base: { strike: 4 }, tag: "smoke", items: { lantern_frame: 1, mugwort_incense: 2 }, seconds: 18, xp: 50, reforge: { mugwort_incense: 1 } },
  embroidered_shirt: { name: "Embroidered shirt", slot: "garment", level: 8, base: { health: 15 }, fixed: { kind: "specials", value: 20 }, items: { stitched_linen: 3, red_thread: 2 }, seconds: 20, xp: 70, reforge: { red_thread: 1 }, set: "grandmother" },
  iron_amulet: { name: "Iron amulet", slot: "amulet", level: 10, base: { ward: 22 }, tag: "iron", items: { iron_blank: 2, tangled_lock: 1 }, seconds: 20, xp: 90, reforge: { iron_blank: 1 } },
  hearth_poker: { name: "Hearth poker", slot: "hand", level: 12, base: { strike: 8 }, tag: "hearth", items: { iron_blank: 2, hearth_ward: 1 }, seconds: 24, xp: 120, reforge: { iron_blank: 1 } },
} as const satisfies Record<string, PieceDef>;

export type PieceId = keyof typeof PIECES;
export const PIECE_IDS = Object.keys(PIECES) as PieceId[];
export const PIECE_DEFS: Record<PieceId, PieceDef> = PIECES;

/** Sets: matching pieces give a bonus, chosen by which pieces you make, never rolled. */
export const SETS = {
  grandmother: {
    name: "Grandmother's set",
    /** 2 pieces: +10% Ward. 3 pieces: the first special attack of each foe misses. */
    ward2: 0.1,
    firstSpecialMisses3: true,
  },
} as const;
export type SetId = keyof typeof SETS;

// ---------- Remedies ----------

/** Remedies, used by the healing rule (or eaten at once out of a fight). */
export const REMEDIES = {
  chamomile: { heals: 4 },
  bread: { heals: 8 },
  yarrow_poultice: { heals: 15 },
} as const satisfies Partial<Record<ItemId, { heals: number }>>;
export type RemedyId = keyof typeof REMEDIES;
export const REMEDY_IDS = Object.keys(REMEDIES) as RemedyId[];

/** Bread and salt, the old welcome: bread as your remedy against the house spirit gives +20% Strike. */
export const BREAD_AND_SALT = { remedy: "bread" as RemedyId, foe: "domovoi" as FoeId, strike: 0.2 };

// ---------- Foes ----------

export interface SpecialDef {
  name: string;
  /** Every nth of its blows is the special. */
  every: number;
  mult: number;
}

export interface FoeDef {
  name: string;
  /** One short line, what it is (folklore: docs/research/combat_research/folklore.md). */
  line: string;
  health: number;
  strike: number;
  ward: number;
  /** A blow every this many ms. */
  blowMs: number;
  weakness: Tag;
  resists?: Tag;
  special?: SpecialDef;
  /** Its own telling blows (×2), if any. */
  telling?: number;
  loot: { item: ItemId | "curio"; qty: number; chance: number }[];
  xp: number;
  /** Warding level before it can be faced. */
  level: number;
  /** A boss: one attempt at a time, beaten once, and it leaves a gift. Its bar reads Temper. */
  boss?: boolean;
}

export const FOES = {
  skrzat: {
    name: "Skrzat",
    line: "A small house imp. Mischief more than harm.",
    health: 20, strike: 3, ward: 0, blowMs: 3.5 * S, weakness: "salt",
    loot: [{ item: "lost_button", qty: 1, chance: 0.3 }, { item: "rags", qty: 1, chance: 0.2 }],
    xp: 5, level: 1,
  },
  kikimora: {
    name: "Kikimora",
    line: "She spins behind the stove, and breaks what's left untidy.",
    health: 45, strike: 5, ward: 10, blowMs: 3 * S, weakness: "smoke",
    special: { name: "the Clatter", every: 5, mult: 2 },
    loot: [{ item: "spun_thread", qty: 1, chance: 0.35 }, { item: "curio", qty: 1, chance: 0.01 }],
    xp: 12, level: 3,
  },
  zmora: {
    name: "Zmora",
    line: "The nightmare that sits on a sleeper's chest.",
    health: 70, strike: 7, ward: 20, blowMs: 3.5 * S, weakness: "iron",
    special: { name: "the Press", every: 4, mult: 2.5 }, telling: 0.1,
    loot: [{ item: "tangled_lock", qty: 1, chance: 0.4 }],
    xp: 22, level: 6,
  },
  domovoi: {
    name: "The sour Domovoi",
    line: "The house spirit, sulking since grandmother died. You calm him; you don't banish him.",
    health: 800, strike: 12, ward: 40, blowMs: 3 * S, weakness: "hearth",
    special: { name: "Pots off the shelf", every: 3, mult: 2 },
    loot: [],
    xp: 150, level: 1, boss: true,
  },
} as const satisfies Record<string, FoeDef>;

export type FoeId = keyof typeof FOES;
export const FOE_IDS = Object.keys(FOES) as FoeId[];
export const FOE_DEFS: Record<FoeId, FoeDef> = FOES;

/** A boss's lasting gift: a fixed passive bonus, shown before you try, kept for good (docs/COMBAT.md §9). */
export const GIFTS = {
  domovoi: {
    name: "The Domovoi's favour",
    /** Every skill works this much faster. */
    speedAll: 0.05,
    /** Health comes back this many times as fast out of a fight. */
    regen: 2,
    /** What calming him opens. */
    opens: "The loose flagstone: the way down to the old crypt (Chapter II).",
  },
} as const satisfies Partial<Record<FoeId, unknown>>;
export type GiftId = keyof typeof GIFTS;

/** The foe's log line for a special that the set made miss. */
export const MISSED = "missed";
