import { REQUESTS } from "../content/requests";
import { SHOP, type ShopId, type UpgradeId } from "../content/shop";
import type { ItemId } from "../content/items";
import { OMENS, type OmenId } from "../content/omens";
import { applyBuff, giveNoteGifts } from "./omens";
import { isFeatureOpen, revealNotes, type Note } from "./progress";
import type { GameState } from "./state";
import { emptySlot, refillBoard } from "./village";

// Player commands. Each is pure: it returns a new state, or says why it can't be done.
// The sim clock for timers is `state.lastTickAt` (the UI ticks it to real time).

export type Result = { ok: true; state: GameState; notes: Note[] } | { ok: false; reason: string };

function ok(state: GameState, notes: Note[] = []): Result {
  return { ok: true, state, notes };
}
function no(reason: string): Result {
  return { ok: false, reason };
}

export function hasItems(state: GameState, needs: Partial<Record<ItemId, number>>): boolean {
  return (Object.entries(needs) as [ItemId, number][]).every(([item, qty]) => (state.inventory[item] ?? 0) >= qty);
}

export function fillRequest(input: GameState, slotIndex: number): Result {
  const slot = input.board[slotIndex];
  if (!isFeatureOpen(input, "village") || !slot?.request) return no("Nobody is knocking there.");
  const req = REQUESTS[slot.request];
  if (!hasItems(input, req.needs)) return no("You don't have what they need yet.");
  const state = structuredClone(input);
  for (const [item, qty] of Object.entries(req.needs) as [ItemId, number][]) state.inventory[item] = (state.inventory[item] ?? 0) - qty;
  state.coin += req.coin;
  state.trust += req.trust;
  state.stats.requestsFilled++;
  emptySlot(state, slotIndex, state.lastTickAt);
  const notes = revealNotes(state);
  giveNoteGifts(state, notes);
  return ok(state, notes);
}

/** Turn a request away. No penalty; someone else knocks after the usual wait. */
export function declineRequest(input: GameState, slotIndex: number): Result {
  if (!input.board[slotIndex]?.request) return no("Nobody is knocking there.");
  const state = structuredClone(input);
  emptySlot(state, slotIndex, state.lastTickAt);
  return ok(state);
}

export function canBuy(state: GameState, id: ShopId): string | null {
  if (!isFeatureOpen(state, "village")) return "The village isn't open to you yet.";
  const entry = SHOP[id];
  if (entry.kind === "upgrade" && state.upgrades.includes(id as UpgradeId)) return "Already done.";
  if (state.coin < entry.cost) return "Not enough coin.";
  return null;
}

export function buy(input: GameState, id: ShopId): Result {
  const reason = canBuy(input, id);
  if (reason) return no(reason);
  const entry = SHOP[id];
  const state = structuredClone(input);
  state.coin -= entry.cost;
  if (entry.kind === "item") state.inventory[entry.item] = (state.inventory[entry.item] ?? 0) + entry.qty;
  else state.upgrades.push(id as UpgradeId);
  refillBoard(state, state.lastTickAt);
  return ok(state);
}

/** Release a stored omen: its buff starts now, or lengthens if it's already running. */
export function releaseOmen(input: GameState, id: OmenId): Result {
  if ((input.omens[id] ?? 0) < 1) return no("There's no such omen on the shelf.");
  const state = structuredClone(input);
  state.omens[id] = (state.omens[id] ?? 0) - 1;
  applyBuff(state, OMENS[id].buff, state.lastTickAt, true);
  return ok(state);
}
