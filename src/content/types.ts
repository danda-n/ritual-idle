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
  /** Where it comes from (a key of ITEM_CATEGORIES). */
  category: string;
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
  /** A buff applied each time the action completes (refreshes, never stacks). */
  buff?: string;
}

export type GoalDef<A extends string> =
  | { kind: "complete"; action: A; count: number }
  | { kind: "requests"; count: number }
  /** Place one of the Kindling's parts in the Circle. */
  | { kind: "place"; part: string }
  | { kind: "rite" };

/** Places (tabs) that open during the chapter, plus experiments at the Circle. The House is always open. */
export type Feature = "grimoire" | "village" | "circle" | "experiments";

export interface NoteDef<S extends string, A extends string> {
  /** Grandmother's margin note, in her voice. */
  text: string;
  /** Plain-language pointer so nobody needs a wiki. */
  hint?: string;
  /** Skills that become available when this note appears. */
  unlocks: S[];
  /** Places that open when this note appears. */
  opens?: Feature[];
  /** An omen given when this note appears (the scripted first Still Night). */
  gift?: string;
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
  /** An aside when filled, carrying a hint fragment toward a hidden recipe. */
  mentions?: { recipe: string; aside: string };
}

export type UpgradeEffect =
  | { kind: "speed"; skill: string; bonus: number }
  | { kind: "extra_yield"; skill: string; chance: number }
  | { kind: "omen_capacity"; capacity: number }
  | { kind: "offline_cap"; hours: number };

export type ShopEntry<I extends string> =
  | { kind: "item"; name: string; description: string; cost: number; item: I; qty: number }
  | { kind: "upgrade"; name: string; description: string; cost: number; effect: UpgradeEffect };

export interface BuffDef<S extends string, I extends string> {
  name: string;
  description: string;
  durationMs: number;
  /** Speed bonus per skill (0.5 = 50% faster). */
  speed?: Partial<Record<S, number>>;
  /** Multiplies the drop chance of these items (2 = twice as likely). */
  chanceMultiplier?: Partial<Record<I, number>>;
}

export interface OmenDef<B extends string> {
  name: string;
  description: string;
  /** Chance per completed action that this omen appears. */
  dropChance: number;
  /** The buff it gives when released. */
  buff: B;
}

export type GrimoireReward =
  | { kind: "offline_bonus"; bonus: number }
  | { kind: "rite_quality"; steps: number }
  | { kind: "trust_multiplier"; multiplier: number }
  | { kind: "cosmetic"; id: string }
  | { kind: "patron_coin"; from: string; multiplier: number };

export interface GrimoireEntryDef<I extends string> {
  name: string;
  /** "hidden" recipes have silhouettes and hints; "secret" ones are found only by free experiments. */
  kind: "hidden" | "secret";
  /** Unordered; each ingredient is distinct. */
  ingredients: I[];
  hints?: { riddle: string; category: string[]; plain: I[] };
  reward: GrimoireReward;
  /** What the reward does, in plain words. */
  rewardText: string;
  /** Lore line shown when discovered. */
  reveal: string;
}
