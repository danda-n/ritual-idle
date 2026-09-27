import type { ActionId } from "../content/actions";
import type { BuffId } from "../content/buffs";
import type { FollowerId } from "../content/followers";
import type { GrimoireId } from "../content/grimoire";
import type { ItemId } from "../content/items";
import type { OmenId } from "../content/omens";
import type { OfferingId, PartId } from "../content/rite";
import type { Side, TalentLevel } from "../content/talents";
import type { Feature } from "../content/types";
import type { RequestId } from "../content/requests";
import type { UpgradeId } from "../content/upgrades";
import type { KeepsakeId } from "../content/keepsakes";
import type { CharmId } from "../content/charms";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { randomSeed } from "./rng";

export const SAVE_VERSION = 11;
/**
 * The playtest reset number. Raise it by one to wipe every player's save on their next load
 * (after big changes, when old saves would give a misleading playtest). Saves from an older
 * reset start a new game with a notice. Decided at the end of each session (CLAUDE.md).
 */
export const SAVE_EPOCH = 3; // 2: playtest round 2 · 3: playtest round 3 (2026-09-27)

export interface ActiveAction {
  id: ActionId;
  /**
   * How far through the current repetition (0–1). A fraction, not milliseconds, so a speed
   * change (Tend, a buff, a level) speeds up only what's left.
   */
  progress: number;
}

/**
 * One slot on the village board: a contract, or empty until `refillAt` (sim clock). Contracts can
 * be delivered in parts; `delivered` is what they've had so far.
 */
/** A contract as it stands on the board: its template scaled to the trust level and the slot. */
export interface Offer {
  needs: Partial<Record<ItemId, number>>;
  coin: number;
  trust: number;
}

export interface BoardSlot {
  request: RequestId | null;
  refillAt: number;
  delivered: Partial<Record<ItemId, number>>;
  /** The scaled contract (v11); older saves get one on load. */
  offer?: Offer;
}

export interface GameState {
  version: number;
  /** The playtest reset this save belongs to (see SAVE_EPOCH). */
  epoch: number;
  /** Total XP per skill. Levels are derived from XP and the chapter cap. */
  skills: Record<SkillId, { xp: number }>;
  inventory: Partial<Record<ItemId, number>>;
  active: ActiveAction | null;
  /** Level cap for every skill; raised by Major Rites (20 → 40 → 60 → 80 → 99). */
  levelCap: number;
  rngSeed: number;
  /** Wall-clock time (ms) the simulation has been advanced to. Also the sim clock for timers. */
  lastTickAt: number;
  /** How many of grandmother's notes have appeared (the first shows at the start), along the order chosen. */
  notesRevealed: number;
  /** The free-order middle parts, in the order the player chose them. */
  middleOrder: PartId[];
  /** Lifetime action counts when the current stage began (so steps count from there). */
  stageStart: Partial<Record<ActionId, number>>;
  coin: number;
  trust: number;
  /** Empty until the village opens; then one slot per board place (boardSlots). */
  board: BoardSlot[];
  upgrades: UpgradeId[];
  /** Omens waiting on the shelf. */
  omens: Partial<Record<OmenId, number>>;
  /** Active timed effects, ending at a time on the sim clock. */
  buffs: ActiveBuff[];
  /** Charms in use: how many actions, crafts or contracts each has left (content/charms.ts). */
  charms: Partial<Record<CharmId, number>>;
  /** Insight: one pool, spent on the hints you choose. */
  insight: number;
  /** Progress on each hidden recipe or secret. Missing = never seen. */
  grimoire: Partial<Record<GrimoireId, RecipeProgress>>;
  /** The silhouette the circle is attuned to, or null for free experiments. */
  attunedTo: GrimoireId | null;
  settings: Settings;
  /** The Kindling's parts placed in the Circle so far. */
  kindling: PartId[];
  /** Experiments (their own tab) open with the first hint toward a hidden recipe. */
  experimentsOpen: boolean;
  /** The side taken at each talent level, per skill (docs/CHAPTER1.md §11). */
  talents: Partial<Record<SkillId, Talents>>;
  /** Stage steps already done (their goals met). */
  stepsDone: string[];
  /** Steps whose reward waits for the player to claim it. */
  rewardsWaiting: string[];
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
  };
  /** Keepsakes chosen after a Fine or Resplendent rite (docs/CHAPTER1.md §8). */
  keepsakes: KeepsakeId[];
}

export interface Attempt {
  items: ItemId[];
  glows: number;
}

export interface RecipeProgress {
  discovered: boolean;
  attempts: Attempt[];
  provenWrong: ItemId[];
  provenRight: ItemId[];
  /** The player's own pencil marks. */
  marks: Partial<Record<ItemId, "suspect" | "doubt">>;
  /** Hints bought with insight (hidden recipes). */
  bought: { category: boolean; named: ItemId[]; close?: boolean };
  /** Clues read (secrets). */
  clues: number;
  /** A villager mentioned it (their words stay on the recipe's page). */
  heard?: boolean;
}

export interface RiteState {
  /**
   * The rite under way: which phase, how far into it, the offerings made, and whether an omen was
   * active. `tendedMs` is the time tending has taken off so far (capped); `bankMs` is tended time
   * not yet applied (the next simulation step adds it).
   */
  performing: { phase: number; phaseMs: number; offered: OfferingId[]; omen: boolean; tendedMs: number; bankMs: number } | null;
  /** The rite done: its quality, the offerings that counted (saves before v10 lack them), and whether its ending was seen. */
  completed: { quality: number; endingSeen: boolean; offered?: OfferingId[] } | null;
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
  /** One-time pointers already shown (e.g. "omen_shelf_ready", the shelf's ready toast), so they never repeat. Older saves may also hold "omen_shelf" (the retired shelf card); it's harmless. */
  introsSeen: string[];
  /** Row density: roomy 46px rows (the default), comfortable 36px, compact 32px. */
  density: Density;
  /** Glossary words whose explanation has been read: they show as plain text, and the Guide lists them. */
  termsSeen: string[];
}

export type Density = "roomy" | "comfortable" | "compact";

/** The side taken at each talent level. */
export type Talents = Partial<Record<TalentLevel, Side>>;

export interface ActiveBuff {
  id: BuffId;
  endsAt: number;
  /** For buffs that bless one chosen skill (Still Night). */
  skill?: SkillId;
}

export function newGame(now: number = Date.now(), seed: number = randomSeed()): GameState {
  return {
    version: SAVE_VERSION,
    epoch: SAVE_EPOCH,
    skills: Object.fromEntries(SKILL_IDS.map((id) => [id, { xp: 0 }])) as GameState["skills"],
    inventory: {},
    active: null,
    levelCap: 20,
    rngSeed: seed,
    lastTickAt: now,
    notesRevealed: 1,
    middleOrder: [],
    stageStart: {},
    coin: 0,
    trust: 0,
    board: [],
    upgrades: [],
    omens: {},
    buffs: [],
    charms: {},
    insight: 0,
    grimoire: {},
    attunedTo: null,
    settings: { grimoireAssist: false, fallback: "last_gathering", reducedMotion: false, toastSeconds: 8, seenTabs: ["house"], introsSeen: [], density: "roomy", termsSeen: [] },
    lastGathering: null,
    kindling: [],
    experimentsOpen: false,
    talents: {},
    stepsDone: [],
    rewardsWaiting: [],
    kept: { skills: [], features: [] },
    rite: { performing: null, completed: null },
    keepsakes: [],
    followers: [],
    stats: { completed: {}, requestsFilled: 0, omensSeen: 0, curiosRead: 0 },
  };
}
