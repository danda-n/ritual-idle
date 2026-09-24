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

export type GoalDef<A extends string> =
  | { kind: "complete"; action: A; count: number }
  | { kind: "requests"; count: number };

/** Places (tabs) that open during the chapter. The House is always open. */
export type Feature = "grimoire" | "village" | "circle";

export interface NoteDef<S extends string, A extends string> {
  /** Grandmother's margin note, in her voice. */
  text: string;
  /** Plain-language pointer so nobody needs a wiki. */
  hint?: string;
  /** Skills that become available when this note appears. */
  unlocks: S[];
  /** Places that open when this note appears. */
  opens?: Feature[];
  /** Completing the goal reveals the next note. The last note may have none. */
  goal?: GoalDef<A>;
}

export interface PageDef<A extends string> {
  title: string;
  text: string;
  /** Recipes this page teaches. */
  unlocks: A[];
}

export interface RequestDef<I extends string> {
  /** Who is asking. Used for flavour and for people-specific effects (e.g. Hana's soup). */
  from: string;
  text: string;
  needs: Partial<Record<I, number>>;
  coin: number;
  trust: number;
  /** Trust needed before this request can appear on the board. */
  minTrust: number;
}

export type UpgradeEffect =
  | { kind: "speed"; skill: string; bonus: number }
  | { kind: "extra_yield"; skill: string; chance: number }
  | { kind: "omen_capacity"; capacity: number }
  | { kind: "offline_cap"; hours: number };

export type ShopEntry<I extends string> =
  | { kind: "item"; name: string; description: string; cost: number; item: I; qty: number }
  | { kind: "upgrade"; name: string; description: string; cost: number; effect: UpgradeEffect };
