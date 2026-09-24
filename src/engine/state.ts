import type { ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import type { RequestId } from "../content/requests";
import type { UpgradeId } from "../content/shop";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { randomSeed } from "./rng";

export const SAVE_VERSION = 3;

export interface ActiveAction {
  id: ActionId;
  /** Time already spent on the current repetition. */
  elapsedMs: number;
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
  stats: {
    /** Lifetime completions per action. Drives note goals and which burnt pages have been read. */
    completed: Partial<Record<ActionId, number>>;
    requestsFilled: number;
  };
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
    stats: { completed: {}, requestsFilled: 0 },
  };
}
