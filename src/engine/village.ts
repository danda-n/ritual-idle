import { BOARD_SLOTS, REFILL_MS, REQUESTS, type RequestId } from "../content/requests";
import { isFeatureOpen } from "./progress";
import { nextRandom } from "./rng";
import type { ItemId } from "../content/items";
import type { BoardSlot, GameState } from "./state";

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
    state.board = Array.from({ length: BOARD_SLOTS }, () => ({ request: null, refillAt: now, delivered: {} }));
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
    slot.delivered = {};
  }
}

/** What a contract still needs, after what's been delivered. */
export function stillNeeded(slot: BoardSlot): Partial<Record<ItemId, number>> {
  if (!slot.request) return {};
  const out: Partial<Record<ItemId, number>> = {};
  for (const [item, qty] of Object.entries(REQUESTS[slot.request].needs) as [ItemId, number][]) {
    const left = qty - (slot.delivered[item] ?? 0);
    if (left > 0) out[item] = left;
  }
  return out;
}

/** What delivering now would hand over: as much of each need as you hold. */
export function deliverable(state: GameState, slot: BoardSlot): Partial<Record<ItemId, number>> {
  const out: Partial<Record<ItemId, number>> = {};
  for (const [item, left] of Object.entries(stillNeeded(slot)) as [ItemId, number][]) {
    const give = Math.min(left, state.inventory[item] ?? 0);
    if (give > 0) out[item] = give;
  }
  return out;
}

export function emptySlot(state: GameState, index: number, now: number): void {
  state.board[index] = { request: null, refillAt: now + REFILL_MS, delivered: {} };
}
