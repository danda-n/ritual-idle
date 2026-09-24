import { EXPERIMENT_CONSOLATION_XP, GRIMOIRE_DEFS, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import { REQUESTS } from "../content/requests";
import { SHOP, type ShopId, type UpgradeId } from "../content/shop";
import type { ItemId } from "../content/items";
import { OMENS, type OmenId } from "../content/omens";
import { addInsight, deduce, GRIMOIRE_IDS, glowCount, isDiscovered, isSilhouetteVisible, markDiscovered, matches, progressOf, type Fragment } from "./grimoire";
import { requestCoin, trustMultiplier } from "./modifiers";
import { applyBuff, giveNoteGifts } from "./omens";
import { beginRite as startRite, canBeginRite } from "./rite";
import { isFeatureOpen, revealNotes, type Note } from "./progress";
import type { GameState, Settings } from "./state";
import { xpForLevel } from "./xp";
import { emptySlot, refillBoard } from "./village";

// Player commands. Each is pure: it returns a new state, or says why it can't be done.
// The sim clock for timers is `state.lastTickAt` (the UI ticks it to real time).

export type ExperimentOutcome =
  | { kind: "discovered"; recipe: GrimoireId }
  | { kind: "glow"; recipe: GrimoireId; glows: number; of: number }
  | { kind: "almost" }
  | { kind: "nothing" };

export interface Success {
  ok: true;
  state: GameState;
  notes: Note[];
  fragments?: Fragment[];
  /** A villager's aside when a request is filled. */
  aside?: string;
  outcome?: ExperimentOutcome;
}

export type Result = Success | { ok: false; reason: string };

function ok(state: GameState, notes: Note[] = [], extra: Partial<Success> = {}): Result {
  return { ok: true, state, notes, ...extra };
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
  state.coin += requestCoin(state, req);
  state.trust += req.trust * trustMultiplier(state);
  state.stats.requestsFilled++;
  emptySlot(state, slotIndex, state.lastTickAt);
  const notes = revealNotes(state);
  giveNoteGifts(state, notes);
  const mention: { recipe: string; aside: string } | undefined = "mentions" in req ? req.mentions : undefined;
  const fragment = mention ? addInsight(state, mention.recipe as GrimoireId, INSIGHT_GAIN.request, "request") : null;
  return ok(state, notes, { fragments: fragment ? [fragment] : [], aside: fragment ? mention?.aside : undefined });
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
  if (state.rite.performing && OMENS[id].buff === "still_night") state.rite.performing.stillNight = true;
  return ok(state);
}

// The circle and the Grimoire (docs/GRIMOIRE.md §4–5)

/** Attune the circle to a visible, unsolved silhouette, or pass null for free experiments. */
export function attune(input: GameState, id: GrimoireId | null): Result {
  if (id !== null && (!isSilhouetteVisible(input, id) || isDiscovered(input, id))) return no("The circle can't find that shape yet.");
  return ok({ ...input, attunedTo: id });
}

/** How many items the circle takes right now. */
export function circleSlots(state: GameState): number {
  return state.attunedTo ? GRIMOIRE_DEFS[state.attunedTo].ingredients.length : 3;
}

/**
 * Place items in the circle. Instant; uses one of each. Attuned: the glow count shows how many
 * are right, and a failed attempt adds insight. Free: only an exact match to any undiscovered
 * recipe or secret answers, with a flicker when two items match a secret.
 */
export function experiment(input: GameState, items: ItemId[]): Result {
  if (!isFeatureOpen(input, "circle")) return no("The circle is still cold.");
  const attuned = input.attunedTo;
  const need = attuned ? GRIMOIRE_DEFS[attuned].ingredients.length : null;
  if (need !== null && items.length !== need) return no(`The circle wants ${need} things.`);
  if (need === null && (items.length < 2 || items.length > 3)) return no("Place two or three things in the circle.");
  if (new Set(items).size !== items.length) return no("Each thing can go in the circle only once.");
  if (!items.every((i) => (input.inventory[i] ?? 0) >= 1)) return no("You don't have all of those.");

  const state = structuredClone(input);
  for (const i of items) state.inventory[i] = (state.inventory[i] ?? 0) - 1;

  const found = GRIMOIRE_IDS.find((id) => !isDiscovered(state, id) && (attuned === null || id === attuned) && matches(id, items));
  if (found) {
    markDiscovered(state, found);
    if (state.attunedTo === found) state.attunedTo = null;
    return ok(state, [], { outcome: { kind: "discovered", recipe: found } });
  }

  consolation(state);
  if (attuned) {
    const glows = glowCount(attuned, items);
    const p = (state.grimoire[attuned] ??= progressOf(state, attuned));
    p.attempts.push({ items: [...items], glows });
    deduce(p);
    const f = addInsight(state, attuned, INSIGHT_GAIN.failedAttempt, "attempt");
    return ok(state, [], { outcome: { kind: "glow", recipe: attuned, glows, of: items.length }, fragments: f ? [f] : [] });
  }
  const almost = items.length === 3 && GRIMOIRE_IDS.some((id) => GRIMOIRE_DEFS[id].kind === "secret" && !isDiscovered(state, id) && glowCount(id, items) === 2);
  return ok(state, [], { outcome: almost ? { kind: "almost" } : { kind: "nothing" } });
}

function consolation(state: GameState): void {
  const skill = state.skills.ritualism;
  skill.xp = Math.min(skill.xp + EXPERIMENT_CONSOLATION_XP, xpForLevel(state.levelCap));
}

/** The player's own pencil marks on a silhouette (purely notes). */
export function setMark(input: GameState, id: GrimoireId, item: ItemId, mark: "suspect" | "doubt" | null): Result {
  const state = structuredClone(input);
  const p = (state.grimoire[id] ??= progressOf(state, id));
  if (mark === null) delete p.marks[item];
  else p.marks[item] = mark;
  return ok(state);
}

export function setSetting<K extends keyof Settings>(input: GameState, key: K, value: Settings[K]): Result {
  return ok({ ...input, settings: { ...input.settings, [key]: value } });
}

// The Major Rite

export function beginRite(input: GameState): Result {
  const reason = canBeginRite(input);
  if (reason) return no(reason);
  const state = structuredClone(input);
  startRite(state, state.lastTickAt);
  return ok(state);
}

/** Prime the rite to begin by itself the moment everything is ready (even offline). */
export function primeRite(input: GameState, primed: boolean): Result {
  if (input.rite.completed) return no("The circle is already awake.");
  return ok({ ...input, rite: { ...input.rite, primed } });
}

export function dismissEnding(input: GameState): Result {
  if (!input.rite.completed) return no("Not yet.");
  return ok({ ...input, rite: { ...input.rite, completed: { ...input.rite.completed, endingSeen: true } } });
}
