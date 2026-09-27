import { EXPERIMENT_CONSOLATION_XP, GRIMOIRE_DEFS, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import { REQUESTS } from "../content/requests";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import { isRecipeRevealed } from "./estimates";
import { blockReason, startAction } from "./simulate";
import { SHOP, type ShopId } from "../content/shop";
import { UPGRADE_DEFS, type UpgradeId } from "../content/upgrades";
import { ITEM_DEFS, type ItemId } from "../content/items";
import { CHARM_DEFS, CHARMS, type CharmId } from "../content/charms";
import { OMENS, type OmenId } from "../content/omens";
import { addInsight, buyHintInto, deduce, GRIMOIRE_IDS, glowCount, hintCost, isDiscovered, isSilhouetteVisible, markDiscovered, matches, progressOf, type Fragment, type HintKind } from "./grimoire";
import { requestCoin, spendCharms, trustMultiplier } from "./modifiers";
import { applyBuff, grantOmen } from "./omens";
import { beginRite as startRite, canBeginRite, tendRite as tendRiteInto } from "./rite";
import { PART_DEFS, type OfferingId, type PartId } from "../content/rite";
import { SKILL_IDS, SKILLS, type SkillId } from "../content/skills";
import type { Side, TalentLevel } from "../content/talents";
import { canChoose } from "./talents";
import type { KeepsakeId } from "../content/keepsakes";
import { keepsakePicksLeft } from "./keepsakes";
import { BUFF_DEFS } from "../content/buffs";
import { isSkillUnlocked } from "./progress";
import { enterNextStage, grantXp, isFeatureOpen, middleParts, MIDDLE_AT, revealNotes, stageChoices, stepById, type Note, type Step } from "./progress";
import type { GameState, Settings } from "./state";
import { xpForLevel } from "./xp";
import { deliverable, emptySlot, offerOf, stillNeeded } from "./village";

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
  /** Omens this command gave (the omen shelf comes with one). */
  gifts?: OmenId[];
  /** Stage steps this command completed. */
  steps?: Step[];
}

export type Result = Success | { ok: false; reason: string };

function ok(state: GameState, notes: Note[] = [], extra: Partial<Success> = {}): Result {
  return { ok: true, state, notes, ...extra };
}
function no(reason: string): Result {
  return { ok: false, reason };
}

/**
 * Start working on a recipe. Refused for anything not on its skill's recipe list yet (not revealed,
 * too high a level, still in a burnt page, skill locked) and while the rite runs. Missing inputs
 * are allowed: the work stops or falls back on its own, as it would mid-run.
 */
export function start(input: GameState, id: ActionId): Result {
  const block = blockReason(input, id);
  if (block?.kind === "rite_in_progress") return no("The rite is under way.");
  if (block?.kind === "skill_locked") return no("That skill hasn't opened yet.");
  if (block?.kind === "recipe_unknown") return no("That recipe is still in a burnt page.");
  if (block?.kind === "level_too_low") return no(`Needs ${SKILLS[ACTION_DEFS[id].skill].name} level ${block.level}.`);
  if (!isRecipeRevealed(input, id)) return no("You haven't found that recipe yet.");
  return ok(startAction(input, id));
}

export function hasItems(state: GameState, needs: Partial<Record<ItemId, number>>): boolean {
  return (Object.entries(needs) as [ItemId, number][]).every(([item, qty]) => (state.inventory[item] ?? 0) >= qty);
}

/**
 * Deliver to a contract: hand over as much of what it still needs as you hold. When the last of
 * it arrives, it pays and the slot empties; until then what's delivered stays delivered.
 */
export function deliver(input: GameState, slotIndex: number): Result {
  const slot = input.board[slotIndex];
  if (!isFeatureOpen(input, "village") || !slot?.request) return no("Nobody is knocking there.");
  const give = deliverable(input, slot);
  if (Object.keys(give).length === 0) return no("You have nothing they need yet.");
  const state = structuredClone(input);
  const s = state.board[slotIndex]!;
  for (const [item, qty] of Object.entries(give) as [ItemId, number][]) {
    state.inventory[item] = (state.inventory[item] ?? 0) - qty;
    s.delivered[item] = (s.delivered[item] ?? 0) + qty;
  }
  if (Object.keys(stillNeeded(s)).length > 0) return ok(state);
  const req = REQUESTS[s.request!];
  const offer = offerOf(s)!;
  // Paid as it stands on the board (scaled to the trust level and the slot).
  state.coin += requestCoin(state, { ...req, coin: offer.coin });
  state.trust += offer.trust * trustMultiplier(state);
  spendCharms(state, "contract");
  state.stats.requestsFilled++;
  emptySlot(state, slotIndex, state.lastTickAt);
  const mention: { recipe: string; aside: string } | undefined = "mentions" in req ? req.mentions : undefined;
  const fragment = mention ? addInsight(state, INSIGHT_GAIN.request, "request") : null;
  // Keep what they said on the recipe's page, so the hint can't be missed.
  if (mention && mention.recipe in GRIMOIRE_DEFS) {
    const id = mention.recipe as GrimoireId;
    state.grimoire[id] = { ...progressOf(state, id), heard: true };
  }
  // After the insight, so a first hint can open experiments.
  const steps: Step[] = [];
  const notes = revealNotes(state, steps);
  return ok(state, notes, { fragments: fragment ? [fragment] : [], aside: fragment ? mention?.aside : undefined, steps });
}

/** Turn a request away. No penalty; someone else knocks after the usual wait. */
export function declineRequest(input: GameState, slotIndex: number): Result {
  if (!input.board[slotIndex]?.request) return no("Nobody is knocking there.");
  const state = structuredClone(input);
  emptySlot(state, slotIndex, state.lastTickAt);
  return ok(state);
}

/** Whether the shop sells this now: always, or once the House project that stocks it is built. */
export function shopStocks(state: GameState, id: ShopId): boolean {
  const req = (SHOP[id] as { requires?: string }).requires;
  return !req || state.upgrades.includes(req as UpgradeId);
}

export function canBuy(state: GameState, id: ShopId): string | null {
  if (!isFeatureOpen(state, "village")) return "The village isn't open to you yet.";
  if (!shopStocks(state, id)) return "Not sold yet.";
  if (state.coin < SHOP[id].cost) return "Not enough coin.";
  return null;
}

export function buy(input: GameState, id: ShopId): Result {
  const reason = canBuy(input, id);
  if (reason) return no(reason);
  const entry = SHOP[id];
  const state = structuredClone(input);
  state.coin -= entry.cost;
  state.inventory[entry.item] = (state.inventory[entry.item] ?? 0) + entry.qty;
  return ok(state);
}

/** Why a house project can't be built now, or null if it can. */
export function canBuild(state: GameState, id: UpgradeId): string | null {
  const def = UPGRADE_DEFS[id];
  if (state.upgrades.includes(id)) return "Already built.";
  if (def.requires && !state.upgrades.includes(def.requires as UpgradeId)) return `Build the ${UPGRADE_DEFS[def.requires as UpgradeId].name.toLowerCase()} first.`;
  if (def.requiresFeature && !isFeatureOpen(state, def.requiresFeature)) return "Opens with the Village.";
  if (!hasItems(state, def.items)) return "Not enough materials yet.";
  return null;
}

/** Build a house project from its materials. The omen shelf comes with its first omen. */
export function build(input: GameState, id: UpgradeId): Result {
  const reason = canBuild(input, id);
  if (reason) return no(reason);
  const state = structuredClone(input);
  for (const [item, qty] of Object.entries(UPGRADE_DEFS[id].items) as [ItemId, number][]) state.inventory[item] = (state.inventory[item] ?? 0) - qty;
  state.upgrades.push(id);
  const gifts: OmenId[] = [];
  if (id === "omen_shelf" && grantOmen(state, "still_night", true)) gifts.push("still_night");
  return ok(state, [], { gifts });
}

/**
 * Release a stored omen: its buff starts now, or lengthens if it's already running.
 * Omens that bless one skill (Still Night) need `skill`, an open one.
 */
export function releaseOmen(input: GameState, id: OmenId, skill?: SkillId): Result {
  if ((input.omens[id] ?? 0) < 1) return no("There's no such omen on the shelf.");
  const blesses = BUFF_DEFS[OMENS[id].buff].blessSkill !== undefined;
  if (blesses && (!skill || !isSkillUnlocked(input, skill))) return no("Choose an open skill to bless.");
  const state = structuredClone(input);
  state.omens[id] = (state.omens[id] ?? 0) - 1;
  applyBuff(state, OMENS[id].buff, state.lastTickAt, true, blesses ? skill : undefined);
  if (state.rite.performing && OMENS[id].buff === "still_night") state.rite.performing.omen = true;
  return ok(state);
}

// The circle and the Grimoire (docs/GRIMOIRE.md §4–5)

/** Attune the circle to a visible, unsolved silhouette, or pass null for free experiments. */
export function attune(input: GameState, id: GrimoireId | null): Result {
  if (!isFeatureOpen(input, "experiments")) return no("Experiments open later.");
  if (id !== null && (!isSilhouetteVisible(input, id) || isDiscovered(input, id))) return no("Recipe not available yet");
  return ok({ ...input, attunedTo: id });
}

/** How many things a free experiment takes: the size of the chapter's secrets (3 in Chapter 1). */
export const FREE_SLOTS = Math.max(...Object.values(GRIMOIRE_DEFS).filter((g) => g.kind === "secret").map((g) => g.ingredients.length));

/** How many items the circle takes right now. */
export function circleSlots(state: GameState): number {
  return state.attunedTo ? GRIMOIRE_DEFS[state.attunedTo].ingredients.length : FREE_SLOTS;
}

/**
 * Place items in the circle. Instant; uses one of each. Attuned: the glow count shows how many
 * are right, and a failed attempt adds insight. Free: only an exact match to any undiscovered
 * recipe or secret answers, with a flicker when two items match a secret.
 */
export function experiment(input: GameState, items: ItemId[]): Result {
  if (!isFeatureOpen(input, "experiments")) return no("Experiments open later.");
  const attuned = input.attunedTo;
  const need = circleSlots(input);
  if (items.length !== need) return no(`The Circle takes ${need} things.`);
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
    const f = addInsight(state, INSIGHT_GAIN.failedAttempt, "attempt");
    return ok(state, [], { outcome: { kind: "glow", recipe: attuned, glows, of: items.length }, fragments: [f] });
  }
  const almost = GRIMOIRE_IDS.some((id) => GRIMOIRE_DEFS[id].kind === "secret" && !isDiscovered(state, id) && glowCount(id, items) === 2);
  return ok(state, [], { outcome: almost ? { kind: "almost" } : { kind: "nothing" } });
}

function consolation(state: GameState): void {
  const skill = state.skills.ritualism;
  skill.xp = Math.min(skill.xp + EXPERIMENT_CONSOLATION_XP, xpForLevel(state.levelCap));
}

/** Spend insight on a hint: a hidden recipe's categories, one more ingredient named, or a secret's next clue. */
/** Why a charm can't be bound now, or null if it can: its recipe must be discovered, its bind cost held. */
export function canBindCharm(state: GameState, charm: CharmId): string | null {
  if (!isDiscovered(state, CHARMS[charm].from)) return "Discover its recipe first.";
  const short = (Object.entries(CHARM_DEFS[charm].cost) as [ItemId, number][]).find(([i, n]) => (state.inventory[i] ?? 0) < n);
  return short ? `Needs ${short[1]} ${ITEM_DEFS[short[0]].name.toLowerCase()}.` : null;
}

/** Bind a charm at once from its discovered recipe: uses its bind cost, gives 1 charm. */
export function bindCharm(input: GameState, charm: CharmId): Result {
  const reason = canBindCharm(input, charm);
  if (reason) return no(reason);
  const state = structuredClone(input);
  for (const [i, n] of Object.entries(CHARM_DEFS[charm].cost) as [ItemId, number][]) state.inventory[i] = (state.inventory[i] ?? 0) - n;
  state.inventory[charm] = (state.inventory[charm] ?? 0) + 1;
  return ok(state);
}

/** Use a charm: it's on for its uses (actions, crafts or contracts); one already on gets more. */
export function useCharm(input: GameState, charm: CharmId): Result {
  if ((input.inventory[charm] ?? 0) < 1) return no(`No ${ITEM_DEFS[charm].name.toLowerCase()} to use.`);
  const state = structuredClone(input);
  state.inventory[charm] = state.inventory[charm]! - 1;
  state.charms[charm] = (state.charms[charm] ?? 0) + CHARM_DEFS[charm].uses;
  return ok(state);
}

export function buyHint(input: GameState, id: GrimoireId, kind: HintKind): Result {
  if (!isFeatureOpen(input, "experiments")) return no("Experiments open later.");
  const cost = hintCost(input, id, kind);
  if (cost === null) return no("Nothing more to learn there.");
  if (input.insight < cost) return no(`Needs ${cost} insight (you have ${input.insight}).`);
  const state = structuredClone(input);
  buyHintInto(state, id, kind);
  return ok(state);
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

// The chapter

/** Choose which free-order part to make next (the Ward, the Smoke or the Words): its stage opens. */
export function chooseStage(input: GameState, part: PartId): Result {
  if (!stageChoices(input).includes(part)) return no("That isn't a choice right now.");
  const state = structuredClone(input);
  // Earlier middle stages (from an older save, before choosing existed) keep their order.
  state.middleOrder = [...middleParts(state).slice(0, state.notesRevealed - MIDDLE_AT[0]), part];
  const steps: Step[] = [];
  const notes = [enterNextStage(state), ...revealNotes(state, steps)];
  return ok(state, notes, { steps });
}

// The Kindling

/** Why this part can't be placed yet, or null if it can. */
export function canPlace(state: GameState, part: PartId): string | null {
  if (!isFeatureOpen(state, "circle")) return "The Circle isn't open yet.";
  if (state.kindling.includes(part)) return "Already in the Circle.";
  if (!hasItems(state, PART_DEFS[part].items)) return `${PART_DEFS[part].name} isn't ready yet.`;
  return null;
}

/** Place one of the Kindling's parts in the Circle: its items are used, and it stays there. */
export function placePart(input: GameState, part: PartId): Result {
  const reason = canPlace(input, part);
  if (reason) return no(reason);
  const state = structuredClone(input);
  for (const [item, qty] of Object.entries(PART_DEFS[part].items) as [ItemId, number][]) state.inventory[item] = (state.inventory[item] ?? 0) - qty;
  state.kindling.push(part);
  const steps: Step[] = [];
  const notes = revealNotes(state, steps);
  return ok(state, notes, { steps });
}

// Step rewards

/**
 * Claim a done step's reward. An XP choice needs `skill`, an open one. Rewards never block
 * progress; they just wait here until claimed.
 */
/** A skill at the chapter's level cap (XP past it isn't banked). */
export function atCap(state: GameState, skill: SkillId): boolean {
  return state.skills[skill].xp >= xpForLevel(state.levelCap);
}

export function claimReward(input: GameState, stepId: string, skill?: SkillId): Result {
  const step = stepById(stepId);
  if (!step?.reward || !input.rewardsWaiting.includes(stepId)) return no("Nothing to claim there.");
  const r = step.reward;
  if ("xpChoice" in r && (!skill || !isSkillUnlocked(input, skill))) return no("Choose an open skill.");
  // XP into a skill at the cap would be lost (unless every open skill is capped).
  if ("xpChoice" in r && skill && atCap(input, skill) && SKILL_IDS.some((k) => isSkillUnlocked(input, k) && !atCap(input, k))) return no("Already at the level cap.");
  const state = structuredClone(input);
  state.rewardsWaiting = state.rewardsWaiting.filter((id) => id !== stepId);
  if ("items" in r) for (const [item, qty] of Object.entries(r.items)) state.inventory[item as ItemId] = (state.inventory[item as ItemId] ?? 0) + qty;
  if ("xp" in r) grantXp(state, r.xp.skill, r.xp.amount);
  if ("xpChoice" in r) grantXp(state, skill!, r.xpChoice.amount);
  if ("surge" in r) applyBuff(state, "surge", state.lastTickAt, true);
  if ("omen" in r) grantOmen(state, r.omen as OmenId, true);
  return ok(state);
}

// Talents

/** Take one side of a talent pair. It's fixed until the next tier, then it can be changed. */
export function chooseTalent(input: GameState, skill: SkillId, level: TalentLevel, side: Side): Result {
  if (!isSkillUnlocked(input, skill)) return no("That skill isn't open yet.");
  if (input.talents[skill]?.[level] === side) return ok(input);
  const reason = canChoose(input, skill, level);
  if (reason) return no(reason);
  const state = structuredClone(input);
  state.talents[skill] = { ...state.talents[skill], [level]: side };
  return ok(state);
}

/** Choose a keepsake after a Fine or Resplendent rite. It's kept for good. */
/**
 * Keep the keepsakes chosen on the chapter-end screen (or the tracker's), all at once: the screen
 * lets you change your mind freely, and this commits the choice when you leave it.
 */
export function chooseKeepsakes(input: GameState, ids: readonly KeepsakeId[]): Result {
  const left = keepsakePicksLeft(input);
  if (left < 1) return no("There's no keepsake to choose.");
  if (ids.length === 0) return no("Choose a keepsake first.");
  if (new Set(ids).size !== ids.length || ids.some((id) => input.keepsakes.includes(id))) return no("You already keep that one.");
  if (ids.length > left) return no(left === 1 ? "Choose just one." : `Choose up to ${left}.`);
  return ok({ ...input, keepsakes: [...input.keepsakes, ...ids] });
}

// The Major Rite

/** Begin the rite, with any item offerings chosen on its card (they're used now). */
export function beginRite(input: GameState, offer: readonly OfferingId[] = []): Result {
  const reason = canBeginRite(input);
  if (reason) return no(reason);
  const state = structuredClone(input);
  startRite(state, state.lastTickAt, offer);
  return ok(state);
}


/**
 * Tend the running rite once (the Circle's small clicks): it takes a few seconds off, up to half
 * the rite. Nothing happens once tending has done all it can, and nothing is lost by not tending.
 */
export function tendRite(input: GameState): Result {
  if (!input.rite.performing) return no("No rite is under way.");
  const state = structuredClone(input);
  tendRiteInto(state);
  return ok(state);
}

export function dismissEnding(input: GameState): Result {
  if (!input.rite.completed) return no("Not yet.");
  return ok({ ...input, rite: { ...input.rite, completed: { ...input.rite.completed, endingSeen: true } } });
}
