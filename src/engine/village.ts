import { BOARD_SLOTS, REFILL_MS, REQUESTS, type RequestId } from "../content/requests";
import { isFeatureOpen } from "./progress";
import { nextRandom } from "./rng";
import type { GameState } from "./state";

const REQUEST_IDS = Object.keys(REQUESTS) as RequestId[];

/** Requests that could appear right now: trusted enough, and not already on the board. */
export function eligibleRequests(state: GameState): RequestId[] {
  const onBoard = new Set(state.board.map((s) => s.request));
  return REQUEST_IDS.filter((id) => REQUESTS[id].minTrust <= state.trust && !onBoard.has(id));
}

/**
 * Fill empty board slots whose knock is due. Mutates `state` (callers pass a private copy).
 * The board is created the first time the village is open.
 */
export function refillBoard(state: GameState, now: number): void {
  if (!isFeatureOpen(state, "village")) return;
  if (state.board.length === 0) {
    state.board = Array.from({ length: BOARD_SLOTS }, () => ({ request: null, refillAt: now }));
  }
  for (const slot of state.board) {
    if (slot.request !== null || slot.refillAt > now) continue;
    const pool = eligibleRequests(state);
    if (pool.length === 0) {
      slot.refillAt = now + REFILL_MS;
      continue;
    }
    const [roll, seed] = nextRandom(state.rngSeed);
    state.rngSeed = seed;
    slot.request = pool[Math.floor(roll * pool.length)]!;
  }
}

export function emptySlot(state: GameState, index: number, now: number): void {
  state.board[index] = { request: null, refillAt: now + REFILL_MS };
}
