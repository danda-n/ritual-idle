import type { ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { randomSeed } from "./rng";

export const SAVE_VERSION = 2;

/** Offline progress cap before any sanctum upgrades (docs/CONCEPT.md, Q1). */
export const BASE_OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;

export interface ActiveAction {
  id: ActionId;
  /** Time already spent on the current repetition. */
  elapsedMs: number;
}

export interface GameState {
  version: number;
  /** Total XP per skill. Levels are derived from XP and the chapter cap. */
  skills: Record<SkillId, { xp: number }>;
  inventory: Partial<Record<ItemId, number>>;
  active: ActiveAction | null;
  /** Level cap for every skill; raised by Major Rites (20 → 40 → 60 → 80 → 99). */
  levelCap: number;
  offlineCapMs: number;
  rngSeed: number;
  /** Wall-clock time (ms) the simulation has been advanced to. */
  lastTickAt: number;
  /** How many of grandmother's notes have appeared (the first shows at the start). */
  notesRevealed: number;
  stats: {
    /** Lifetime completions per action. Drives note goals and which burnt pages have been read. */
    completed: Partial<Record<ActionId, number>>;
  };
}

export function newGame(now: number = Date.now(), seed: number = randomSeed()): GameState {
  return {
    version: SAVE_VERSION,
    skills: Object.fromEntries(SKILL_IDS.map((id) => [id, { xp: 0 }])) as GameState["skills"],
    inventory: {},
    active: null,
    levelCap: 20,
    offlineCapMs: BASE_OFFLINE_CAP_MS,
    rngSeed: seed,
    lastTickAt: now,
    notesRevealed: 1,
    stats: { completed: {} },
  };
}
