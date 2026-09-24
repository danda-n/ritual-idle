import type { SkillDef } from "./types";

// Chapter 1 skills. Later chapters add the rest (see docs/CHAPTER1.md §1).
export const SKILLS = {
  herbalism: { name: "Herbalism", category: "gathering", chapter: 1 },
  scavenging: { name: "Scavenging", category: "gathering", chapter: 1 },
  chandlery: { name: "Chandlery", category: "crafting", chapter: 1 },
  sigilcraft: { name: "Sigilcraft", category: "crafting", chapter: 1 },
  scholarship: { name: "Scholarship", category: "knowledge", chapter: 1 },
  ritualism: { name: "Ritualism", category: "ritual", chapter: 1 },
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;
export const SKILL_IDS = Object.keys(SKILLS) as SkillId[];
