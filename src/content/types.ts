// Shapes of game content. Content itself lives in the sibling data files,
// so design changes (numbers, names, recipes) never need engine changes.

export type SkillCategory = "gathering" | "crafting" | "knowledge" | "ritual" | "support";

export interface SkillDef {
  name: string;
  category: SkillCategory;
  /** Chapter in which the skill first becomes available. */
  chapter: number;
  /** What the skill is, in one plain line. */
  blurb: string;
  /** A little more, for the choice at the Circle: what you do in it, what it makes, what it's for later. */
  about: string;
}

export interface ItemDef {
  name: string;
  /** Where it comes from (a key of ITEM_CATEGORIES). */
  category: string;
  /** Shown in the item lookup and the chip tooltip. Some are puzzle bridges ("The dream-herb."): keep those. */
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

/** A small step inside a stage. Checked against lifetime counts and levels, so it never un-completes. */
export type StepGoal<S extends string, A extends string> =
  | { kind: "complete"; action: A; count: number }
  | { kind: "level"; skill: S; level: number }
  | { kind: "requests"; count: number }
  | { kind: "place"; part: string };

export type StepReward<S extends string> =
  | { items: Record<string, number> }
  | { xp: { skill: S; amount: number } }
  /** XP into a skill the player picks when claiming; `suggest` is the one the next step needs. */
  | { xpChoice: { amount: number; suggest: S } }
  /** A short burst of speed on everything (the Surge buff). */
  | { surge: true }
  | { omen: string };

export interface StepDef<S extends string, A extends string> {
  /** Unique across all notes (it's saved). */
  id: string;
  label: string;
  goal: StepGoal<S, A>;
  /** Something small, aimed at the next step. Claimed with a button; progress never waits on it. */
  reward?: StepReward<S>;
}

export interface NoteDef<S extends string, A extends string> {
  /** Grandmother's margin note, in her voice. Story only: shown in the Grimoire journal (collapsed) and behind the task card's "Story" link. */
  text: string;
  /** Small steps toward the goal, each with a reward. Any order; the first unclaimed one is "current". */
  steps?: StepDef<S, A>[];
  /** A short gameplay line, shown only for a note without steps (the task card and the tracker). */
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
  /** Short label on the contract card ("Nettle soup"). */
  label: string;
  /** Their full line, in their voice: the card's hover title. */
  text: string;
  needs: Partial<Record<I, number>>;
  coin: number;
  trust: number;
  /** Trust level needed before this contract can appear on the board (content/requests.ts scales it to your level). */
  minLevel: number;
  /** An aside when filled (a free hint toward a hidden recipe), and some insight. */
  mentions?: { recipe: string; aside: string };
}

export type UpgradeEffect =
  | { kind: "speed"; skill: string; bonus: number }
  | { kind: "extra_yield"; skill: string; chance: number }
  /** An item turns up more often wherever it's a chance find (the salt crock: salt ×1.5). */
  | { kind: "find"; item: string; multiplier: number }
  | { kind: "omen_capacity"; capacity: number }
  | { kind: "offline_cap"; hours: number }
  /** More contracts on the village board at once. */
  | { kind: "board_slots"; extra: number }
  /** New provisions in the village shop. */
  | { kind: "shop"; entries: string[] };

export interface ShopEntry<I extends string> {
  name: string;
  cost: number;
  item: I;
  qty: number;
  /** A House project that has to be built before the shop sells it. */
  requires?: string;
}

/** A house project: built once from items you make, then it helps for good. */
export interface UpgradeDef<I extends string> {
  name: string;
  /** One extra fact shown after the generated effect, where the effect alone doesn't say it all. */
  extra?: string;
  /** What it's for, in a plain line (shown under the effect). */
  blurb: string;
  items: Partial<Record<I, number>>;
  effect: UpgradeEffect;
  /** Another project that has to be built first. */
  requires?: string;
  /** A place that has to be open first (a village project waits for the Village). */
  requiresFeature?: Feature;
}

export interface BuffDef<S extends string, I extends string> {
  name: string;
  durationMs: number;
  /** Speed bonus per skill (0.5 = 50% faster). */
  speed?: Partial<Record<S, number>>;
  /** Multiplies the drop chance of these items (2 = twice as likely). */
  chanceMultiplier?: Partial<Record<I, number>>;
  /** For a buff that blesses one skill chosen on release: its speed bonus and chance-find multiplier. */
  blessSkill?: { speed: number; chanceMultiplier: number };
  /** Every chance find, in every skill, is this much more likely (a charm). */
  findMultiplier?: number;
  /** More XP in every skill (0.25 = +25%). */
  xpBonus?: number;
  /** A chance that any craft uses no inputs. */
  saveChance?: number;
  /** Contracts pay this much more coin. */
  coinBonus?: number;
}

export interface OmenDef<B extends string> {
  name: string;
  /** Chance per completed action that this omen appears. */
  dropChance: number;
  /** The buff it gives when released. */
  buff: B;
}

export type GrimoireReward =
  /** Every skill works faster. */
  | { kind: "speed_all"; bonus: number }
  /** One skill works faster. */
  | { kind: "speed"; skill: string; bonus: number }
  /** More XP in every skill. */
  | { kind: "xp_all"; bonus: number }
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
  /**
   * Hidden recipes: a free riddle, categories and names you buy with insight. `close` narrows the
   * one ingredient that's never named (a nudge, not its name), so every ingredient has a hint.
   */
  hints?: { riddle: string; category: string[]; plain: I[]; close?: string };
  /** Secrets: written clues you buy with insight, one at a time. */
  clues?: string[];
  /** What discovering it gives, for good (one reward or several). */
  reward: GrimoireReward | readonly GrimoireReward[];
  /** What the reward does, numbers first ("+10% speed, all skills"). */
  rewardText: string;
  /** Story line: shown collapsed on the discovered page and in the Grimoire journal. */
  reveal: string;
  /** A visible line on the discovered page when the reveal starts a plot thread. */
  opens?: string;
}
