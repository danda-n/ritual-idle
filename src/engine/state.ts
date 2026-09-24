import type { ActionId } from "../content/actions";
import type { BuffId } from "../content/buffs";
import type { FollowerId } from "../content/followers";
import type { GrimoireId } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { OmenId } from "../content/omens";
import type { PartId } from "../content/rite";
import type { BranchId } from "../content/talents";
import type { Feature } from "../content/types";
import type { RequestId } from "../content/requests";
import type { UpgradeId } from "../content/shop";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { randomSeed } from "./rng";

export const SAVE_VERSION = 7;

export interface ActiveAction {
  id: ActionId;
  /**
   * How far through the current repetition (0–1). A fraction, not milliseconds, so a speed
   * change (Tend, a buff, a level) speeds up only what's left.
   */
  progress: number;
}

/** One slot on the village board: a request, or empty until `refillAt` (sim clock). */
export interface BoardSlot {
  request: RequestId | null;
  refillAt: number;
}

export interface GameState {
  version: number;
  /** Total XP per skill. Levels are derived from XP and the chapter cap. */
  skills: Record<SkillId, { xp: number }>;
  inventory: Partial<Record<ItemId, number>>;
  active: ActiveAction | null;
  /** Level cap for every skill; raised by Major Rites (20 → 40 → 60 → 80 → 99). */
  levelCap: number;
  rngSeed: number;
  /** Wall-clock time (ms) the simulation has been advanced to. Also the sim clock for timers. */
  lastTickAt: number;
  /** How many of grandmother's notes have appeared (the first shows at the start). */
  notesRevealed: number;
  coin: number;
  trust: number;
  /** Empty until the village opens; then always BOARD_SLOTS long. */
  board: BoardSlot[];
  upgrades: UpgradeId[];
  /** Omens waiting on the shelf. */
  omens: Partial<Record<OmenId, number>>;
  /** Active timed effects, ending at a time on the sim clock. */
  buffs: ActiveBuff[];
  /** Progress on each hidden recipe or secret. Missing = never seen. */
  grimoire: Partial<Record<GrimoireId, RecipeProgress>>;
  /** The silhouette the circle is attuned to, or null for free experiments. */
  attunedTo: GrimoireId | null;
  settings: Settings;
  /** The Kindling's parts placed in the Circle so far. */
  kindling: PartId[];
  /** Experiments at the Circle open with the first hint toward a hidden recipe. */
  experimentsOpen: boolean;
  /** Talent ranks spent per skill. Points come from levels, so only spending is stored. */
  talents: Partial<Record<SkillId, Talents>>;
  /** Stage steps already claimed (their rewards given). */
  stepsDone: string[];
  /** The Tend meter (sim clock): lit until `endsAt`; `streak` counts tended repetitions in a row. */
  tend: { endsAt: number; streak: number; lastAt: number };
  /** Skills and places an older save's notes had opened, kept so nothing earned is taken away. */
  kept: { skills: SkillId[]; features: Feature[] };
  rite: RiteState;
  followers: FollowerId[];
  /** The last gathering action that ran; the default fallback. */
  lastGathering: ActionId | null;
  stats: {
    /** Lifetime completions per action. Drives note goals and which burnt pages have been read. */
    completed: Partial<Record<ActionId, number>>;
    requestsFilled: number;
    omensSeen: number;
    curiosRead: number;
    /** Repetitions finished while tended. */
    tended: number;
  };
}

export interface Attempt {
  items: ItemId[];
  glows: number;
}

export interface RecipeProgress {
  insight: number;
  discovered: boolean;
  attempts: Attempt[];
  provenWrong: ItemId[];
  provenRight: ItemId[];
  /** The player's own pencil marks. */
  marks: Partial<Record<ItemId, "suspect" | "doubt">>;
}

export interface RiteState {
  /** Begin automatically as soon as every requirement is met. */
  primed: boolean;
  performing: { elapsedMs: number; stillNight: boolean } | null;
  completed: { quality: number; endingSeen: boolean } | null;
}

/** What to do when the current action can't continue (e.g. out of tallow). */
export type Fallback = "last_gathering" | "stop" | ActionId;

export interface Settings {
  /** Accessibility: doubles Insight gains (docs/GRIMOIRE.md §6). */
  grimoireAssist: boolean;
  fallback: Fallback;
  reducedMotion: boolean;
  toastSeconds: number;
  /** Tabs the player has visited (for the "new" dot). */
  seenTabs: string[];
}

export interface Talents {
  ranks: Partial<Record<BranchId, number>>;
}

export interface ActiveBuff {
  id: BuffId;
  endsAt: number;
  /** For buffs that bless one chosen skill (Still Night). */
  skill?: SkillId;
}

export function newGame(now: number = Date.now(), seed: number = randomSeed()): GameState {
  return {
    version: SAVE_VERSION,
    skills: Object.fromEntries(SKILL_IDS.map((id) => [id, { xp: 0 }])) as GameState["skills"],
    inventory: {},
    active: null,
    levelCap: 20,
    rngSeed: seed,
    lastTickAt: now,
    notesRevealed: 1,
    coin: 0,
    trust: 0,
    board: [],
    upgrades: [],
    omens: {},
    buffs: [],
    grimoire: {},
    attunedTo: null,
    settings: { grimoireAssist: false, fallback: "last_gathering", reducedMotion: false, toastSeconds: 8, seenTabs: ["house"] },
    lastGathering: null,
    kindling: [],
    experimentsOpen: false,
    talents: {},
    stepsDone: [],
    tend: { endsAt: 0, streak: 0, lastAt: 0 },
    kept: { skills: [], features: [] },
    rite: { primed: false, performing: null, completed: null },
    followers: [],
    stats: { completed: {}, requestsFilled: 0, omensSeen: 0, curiosRead: 0, tended: 0 },
  };
}
