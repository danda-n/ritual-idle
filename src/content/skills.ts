import type { SkillDef } from "./types";

// Chapter 1 skills, in the order the chapter brings them. `about` and `blurb` are read when you
// choose the next part: they talk only about what you already know (the house, candles, the
// Circle and its parts), never a place or system not yet open (the choice card's "Opens" row
// names those, explained). Later chapters add the rest (see docs/CHAPTER1.md §1).
export const SKILLS = {
  scavenging: { name: "Scavenging", about: "Gathering, no inputs needed. The pantry first, then the hives and further afield. Most of what the other skills use starts here.", blurb: "Search the house for raw stores: tallow, salt, wax, nails.", category: "gathering", chapter: 1 },
  chandlery: { name: "Chandlery", about: "Pour candles from tallow and beeswax. Makes the Light, and candles go into much of what comes after.", blurb: "Pour candles from tallow and wax.", category: "making", chapter: 1 },
  sigilcraft: { name: "Sigilcraft", about: "Sweep the hearth for ash, then lay salt lines and draw ash sigils. Hungry for salt from the pantry. Makes the Ward.", blurb: "Draw wards: salt lines and ash sigils. Sweep the hearth for ash.", category: "making", chapter: 1 },
  herbalism: { name: "Herbalism", about: "Pick nettle, chamomile and mugwort in the garden, then bind them into smudge bundles and incense. No inputs to start. Makes the Smoke.", blurb: "Pick herbs in the garden and bind them into smudge and incense.", category: "gathering", chapter: 1 },
  scholarship: { name: "Scholarship", about: "Search the attic for grandmother's burnt pages and decipher them by candlelight (each uses a tallow candle). Makes the Words.", blurb: "Search the attic for her burnt pages and read them.", category: "knowledge", chapter: 1 },
  ritualism: { name: "Ritualism", about: "Minor rites at the threshold, from salt lines and candles, and the rite that wakes the Circle.", blurb: "Minor rites at the threshold, and the Major Rite at the end.", category: "ritual", chapter: 1 },
  // The cellar's two skills (docs/COMBAT.md §2). They open with the cellar, after the Kindling, and
  // are never named before then (combat.test.ts checks it).
  warding: { name: "Warding", about: "Drive off what has gathered in the cellar. It fights by itself, in the gear you make with Crafting.", blurb: "Drive off the spirits in the cellar.", category: "combat", chapter: 1, opensWith: "cellar" },
  crafting: { name: "Crafting", about: "Make components, then the gear itself: pieces with a tag and a bonus you choose.", blurb: "Make gear: components, then pieces.", category: "making", chapter: 1, opensWith: "cellar" },
} as const satisfies Record<string, SkillDef>;
export const SKILL_DEFS: Record<SkillId, SkillDef> = SKILLS;

export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];
