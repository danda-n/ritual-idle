import type { SkillDef } from "./types";

// Chapter 1 skills, in the order the chapter brings them. Later chapters add the rest (see docs/CHAPTER1.md §1).
export const SKILLS = {
  scavenging: { name: "Scavenging", blurb: "Search the house and village for raw stores: tallow, salt, wax, nails.", category: "gathering", chapter: 1 },
  chandlery: { name: "Chandlery", blurb: "Pour candles from tallow and wax.", category: "crafting", chapter: 1 },
  sigilcraft: { name: "Sigilcraft", blurb: "Draw wards: salt lines and ash sigils. Sweep the hearth for ash.", category: "crafting", chapter: 1 },
  herbalism: { name: "Herbalism", blurb: "Pick herbs in the garden and bind them into smudge and incense.", category: "gathering", chapter: 1 },
  scholarship: { name: "Scholarship", blurb: "Search the attic for her burnt pages and read them. Opens the Grimoire.", category: "knowledge", chapter: 1 },
  ritualism: { name: "Ritualism", blurb: "Minor rites at the threshold, and the Major Rite at the end.", category: "ritual", chapter: 1 },
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];
