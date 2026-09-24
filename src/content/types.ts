// Shapes of game content. Content itself lives in the sibling data files,
// so design changes (numbers, names, recipes) never need engine changes.

export type SkillCategory = "gathering" | "crafting" | "knowledge" | "ritual" | "support";

export interface SkillDef {
  name: string;
  category: SkillCategory;
  /** Chapter in which the skill first becomes available. */
  chapter: number;
}

export interface ItemDef {
  name: string;
  description?: string;
}

export interface OutputDef<I extends string> {
  item: I;
  qty: number;
  /** 0–1. Omitted means the output always drops. */
  chance?: number;
}

export interface ActionDef<S extends string, I extends string> {
  name: string;
  skill: S;
  /** Skill level required. */
  level: number;
  seconds: number;
  xp: number;
  inputs: Partial<Record<I, number>>;
  outputs: OutputDef<I>[];
}
