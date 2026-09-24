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

export type GoalDef<A extends string> = { kind: "complete"; action: A; count: number };

export interface NoteDef<S extends string, A extends string> {
  /** Grandmother's margin note, in her voice. */
  text: string;
  /** Plain-language pointer so nobody needs a wiki. */
  hint?: string;
  /** Skills that become available when this note appears. */
  unlocks: S[];
  /** Completing the goal reveals the next note. The last note may have none. */
  goal?: GoalDef<A>;
}

export interface PageDef<A extends string> {
  title: string;
  text: string;
  /** Recipes this page teaches. */
  unlocks: A[];
}
