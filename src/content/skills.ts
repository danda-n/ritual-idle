import type { SkillDef } from "./types";

// Chapter 1 skills, in the order the chapter brings them. Later chapters add the rest (see docs/CHAPTER1.md §1).
export const SKILLS = {
  scavenging: { name: "Scavenging", about: "Gathering, no inputs needed. The pantry first, then the hives, the village midden and grandmother's chest. Almost every other skill starts from what you find here.", blurb: "Search the house and village for raw stores: tallow, salt, wax, nails.", category: "gathering", chapter: 1 },
  chandlery: { name: "Chandlery", about: "Crafting from tallow and beeswax. Candles light the Circle, pay for deciphering pages, and go into offerings and minor rites.", blurb: "Pour candles from tallow and wax.", category: "crafting", chapter: 1 },
  sigilcraft: { name: "Sigilcraft", about: "Crafting wards. Sweep the hearth for ash, then lay salt lines and draw ash sigils; later iron wards and chalk. Salt-hungry: the pantry works hard for it. Villagers ask for wards often.", blurb: "Draw wards: salt lines and ash sigils. Sweep the hearth for ash.", category: "crafting", chapter: 1 },
  herbalism: { name: "Herbalism", about: "Gathering from the garden, then binding what you pick: nettle, chamomile and mugwort into smudge bundles and incense. Herbs feed hidden recipes and several contracts.", blurb: "Pick herbs in the garden and bind them into smudge and incense.", category: "gathering", chapter: 1 },
  scholarship: { name: "Scholarship", about: "Search the attic for grandmother's burnt pages and decipher them by candlelight (uses tallow candles). Each page read teaches something, and it opens the Grimoire, where hidden recipes and Experiments begin.", blurb: "Search the attic for her burnt pages and read them. Opens the Grimoire.", category: "knowledge", chapter: 1 },
  ritualism: { name: "Ritualism", about: "Minor rites at the threshold, from salt lines and candles, and the Major Rite that ends the chapter.", blurb: "Minor rites at the threshold, and the Major Rite at the end.", category: "ritual", chapter: 1 },
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];
