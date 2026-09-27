import { BASE_BOARD_SLOTS, LEVEL_SCALE, REFILL_MS, REQUESTS, SLOT_DIFFICULTY, type RequestId } from "../content/requests";
import { UPGRADE_DEFS } from "../content/upgrades";
import { isFeatureOpen } from "./progress";
import { nextRandom } from "./rng";
import type { ItemId } from "../content/items";
import type { BoardSlot, GameState, Offer } from "./state";

// The village board (docs/CHAPTER1.md §4). Contracts are templates (content/requests.ts), scaled
// to your trust level and to each slot's quiet difficulty, so there's always work, and it grows.

const REQUEST_IDS = Object.keys(REQUESTS) as RequestId[];

/** Total trust needed to reach a trust level: level L needs L + 2 more than L - 1 (3, 7, 12, 18…). */
export function trustForLevel(level: number): number {
  return (level * (level + 5)) / 2;
}

/** Your trust level: no end. */
export function trustLevel(state: GameState): number {
  let level = 0;
  while (trustForLevel(level + 1) <= state.trust) level++;
  return level;
}

/** How many contracts fit on the board: two, plus what House projects add. */
export function boardSlots(state: GameState): number {
  let n = BASE_BOARD_SLOTS;
  for (const u of state.upgrades) {
    const e = UPGRADE_DEFS[u].effect;
    if (e.kind === "board_slots") n += e.extra;
  }
  return n;
}

/** Templates that could appear right now: your trust level reached, and not already on the board. */
export function eligibleRequests(state: GameState): RequestId[] {
  const onBoard = new Set(state.board.map((s) => s.request));
  const level = trustLevel(state);
  return REQUEST_IDS.filter((id) => REQUESTS[id].minLevel <= level && !onBoard.has(id));
}

/** A slot's quiet difficulty, by its place on the board: easy, medium, then hard. */
export function slotDifficulty(index: number): number {
  return SLOT_DIFFICULTY[Math.min(index, SLOT_DIFFICULTY.length - 1)]!;
}

/**
 * A template scaled to a trust level and a slot: needs and coin ×(1 + 0.2·level)×difficulty
 * (at least 1 of each), trust as written, +1 on a hard slot.
 */
export function scaleOffer(id: RequestId, level: number, slotIndex: number): Offer {
  const req = REQUESTS[id];
  const d = slotDifficulty(slotIndex);
  const f = (1 + LEVEL_SCALE * level) * d;
  const needs: Partial<Record<ItemId, number>> = {};
  for (const [item, qty] of Object.entries(req.needs) as [ItemId, number][]) needs[item] = Math.max(1, Math.round(qty * f));
  return { needs, coin: Math.max(1, Math.round(req.coin * f)), trust: req.trust + (d > 1 ? 1 : 0) };
}

/** The contract as it stands on a slot (older saves without an offer read the template, unscaled). */
export function offerOf(slot: BoardSlot): Offer | null {
  if (!slot.request) return null;
  const req = REQUESTS[slot.request];
  return slot.offer ?? { needs: { ...req.needs }, coin: req.coin, trust: req.trust };
}

/**
 * Fill empty board slots whose knock is due, and add slots when a project makes room. Mutates
 * `state` (callers pass a private copy). The board is created the first time the village is open.
 */
export function refillBoard(state: GameState, now: number): void {
  if (!isFeatureOpen(state, "village")) return;
  while (state.board.length < boardSlots(state)) state.board.push({ request: null, refillAt: now, delivered: {} });
  state.board.forEach((slot, index) => {
    if (slot.request !== null || slot.refillAt > now) return;
    const pool = eligibleRequests(state);
    if (pool.length === 0) {
      slot.refillAt = now + REFILL_MS;
      return;
    }
    const [roll, seed] = nextRandom(state.rngSeed);
    state.rngSeed = seed;
    slot.request = pool[Math.floor(roll * pool.length)]!;
    slot.offer = scaleOffer(slot.request, trustLevel(state), index);
    slot.delivered = {};
  });
}

/** What a contract still needs, after what's been delivered. */
export function stillNeeded(slot: BoardSlot): Partial<Record<ItemId, number>> {
  const offer = offerOf(slot);
  if (!offer) return {};
  const out: Partial<Record<ItemId, number>> = {};
  for (const [item, qty] of Object.entries(offer.needs) as [ItemId, number][]) {
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
