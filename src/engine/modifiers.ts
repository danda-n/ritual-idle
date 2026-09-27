import { ACTION_DEFS, type ActionId } from "../content/actions";
import { BUFF_DEFS } from "../content/buffs";
import { FOLLOWERS } from "../content/followers";
import type { ItemId } from "../content/items";
import { UPGRADE_DEFS } from "../content/upgrades";
import type { RequestDef, UpgradeEffect } from "../content/types";
import type { SkillId } from "../content/skills";
import { discoveredRewards } from "./grimoire";
import type { GameState } from "./state";
import { TALENT_LEVELS, TALENTS, type TalentEffect } from "../content/talents";
import { talentEffects } from "./talents";
import { keepsakeEffects } from "./keepsakes";
import { levelForXp } from "./xp";

// Every bonus in the game is computed here, so balance lives in one place.
// Sources: skill levels, talents, sanctum upgrades, timed buffs (released omens, minor rites),
// followers and Grimoire rewards. `now` is the sim clock; it defaults to the last tick.

const HOUR = 60 * 60 * 1000;
export const BASE_OFFLINE_CAP_MS = 24 * HOUR;
/** Each level past 1 makes its skill's actions this much faster, compounding (1.01 = 1%). */
export const LEVEL_SPEED = 1.01;

function effects(state: GameState): UpgradeEffect[] {
  return state.upgrades.map((id) => UPGRADE_DEFS[id].effect);
}

/** Taken talent effects of one kind that reach this skill (its own, or aimed at it from another). */
function talents<K extends TalentEffect["kind"]>(state: GameState, kind: K, skill: SkillId): Extract<TalentEffect, { kind: K }>[] {
  return talentEffects(state)
    .filter(({ from, effect }) => effect.kind === kind && ("skill" in effect && effect.skill ? effect.skill === skill : from === skill))
    .map(({ effect }) => effect as Extract<TalentEffect, { kind: K }>);
}

/** Talent effects of one kind that name this action. */
function talentsOn<K extends "bulk" | "save" | "byproduct" | "thrift" | "insight">(state: GameState, kind: K, id: ActionId): Extract<TalentEffect, { kind: K }>[] {
  return talents(state, kind, ACTION_DEFS[id].skill).filter((e) => ("actions" in e ? (e.actions as readonly ActionId[]).includes(id) : "action" in e && e.action === id));
}

export function activeBuffs(state: GameState, now: number = state.lastTickAt) {
  return state.buffs.filter((b) => b.endsAt > now);
}

/** Speed from the skill's own level: 1% per level past 1, compounding. */
export function levelSpeed(state: GameState, skill: SkillId): number {
  return LEVEL_SPEED ** (levelForXp(state.skills[skill].xp, state.levelCap) - 1);
}

/**
 * Speed multiplier for an action (1 = normal, 1.15 = 15% faster). Bonuses add up, then the
 * skill's level speed multiplies the total.
 */
export function speedMultiplier(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  const skill = ACTION_DEFS[id].skill;
  let bonus = 0;
  for (const t of talents(state, "speed", skill)) bonus += t.bonus;
  for (const e of effects(state)) if (e.kind === "speed" && e.skill === skill) bonus += e.bonus;
  // Discovered recipes (the Window charm: all skills; the Hearth mark: Sigilcraft).
  for (const r of discoveredRewards(state)) if (r.kind === "speed_all" || (r.kind === "speed" && r.skill === skill)) bonus += r.bonus;
  for (const b of activeBuffs(state, now)) {
    bonus += BUFF_DEFS[b.id].speed?.[skill] ?? 0;
    if (b.skill === skill) bonus += BUFF_DEFS[b.id].blessSkill?.speed ?? 0;
  }
  // Followers "assist me": they help with whatever you're doing.
  for (const f of state.followers) {
    const def = FOLLOWERS[f];
    bonus += def.assist + (def.trait.skill === skill ? def.trait.bonus : 0);
  }
  return (1 + bonus) * levelSpeed(state, skill);
}

/** Time one repetition takes, after speed bonuses (and the slower pace of a bulk talent). */
export function actionDurationMs(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  const slower = talentsOn(state, "bulk", id).reduce((n, t) => n + t.slower, 0);
  return (ACTION_DEFS[id].seconds * 1000 * (1 + slower)) / speedMultiplier(state, id, now);
}

/** Extra units of the main output per repetition from bulk talents (they bring their XP too). */
export function bulkExtra(state: GameState, id: ActionId): number {
  return talentsOn(state, "bulk", id).length;
}

/** What one repetition uses, after thrift talents (an input can drop out entirely). */
export function actionInputs(state: GameState, id: ActionId): Partial<Record<ItemId, number>> {
  const inputs: Partial<Record<ItemId, number>> = { ...ACTION_DEFS[id].inputs };
  for (const t of talentsOn(state, "thrift", id)) inputs[t.item] = Math.max(0, (inputs[t.item] ?? 0) - t.less);
  for (const [item, qty] of Object.entries(inputs) as [ItemId, number][]) if (qty <= 0) delete inputs[item];
  return inputs;
}

/** Chance a repetition uses no inputs (Steady hand, By one candle…; a Hearth mark charm). */
export function saveChance(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  let chance = talentsOn(state, "save", id).reduce((n, t) => n + t.chance, 0);
  for (const b of activeBuffs(state, now)) chance += BUFF_DEFS[b.id].saveChance ?? 0;
  return Math.min(1, chance);
}

/** Items an action sometimes gives besides its own (Wick ash). */
export function byproducts(state: GameState, id: ActionId): { item: ItemId; chance: number }[] {
  return talentsOn(state, "byproduct", id).map((t) => ({ item: t.item, chance: t.chance }));
}

/** Insight from each repetition (Marginalia, Footnotes, her reading glasses). */
export function insightPerRep(state: GameState, id: ActionId): number {
  let amount = talentsOn(state, "insight", id).reduce((n, t) => n + t.amount, 0);
  if (id === "decipher_page") for (const k of keepsakeEffects(state)) if (k.kind === "page_insight") amount += k.amount;
  return amount;
}

/** Chance a repetition comes doubled, outputs and XP (Scavenger's luck, Steady flame…). */
export function doubleChance(state: GameState, id: ActionId): number {
  return talents(state, "double", ACTION_DEFS[id].skill).reduce((n, t) => n + t.chance, 0);
}

/** Every nth repetition gives 1 extra of each sure output (Dew-picked), or 0 for none. */
export function everyNth(state: GameState, id: ActionId): number {
  return talents(state, "everyNth", ACTION_DEFS[id].skill)[0]?.n ?? 0;
}

/** How much longer the buffs from a skill's actions last (Long blessing). */
export function buffLength(state: GameState, skill: SkillId): number {
  return talents(state, "buffLength", skill).reduce((m, t) => m * t.multiplier, 1);
}

/** Omens turn up this much more often (Omen-sense). */
export function omenChanceMultiplier(state: GameState): number {
  let mult = 1;
  for (const { effect } of talentEffects(state)) if (effect.kind === "omenChance") mult *= effect.multiplier;
  return mult;
}

/**
 * Everything that multiplies an item's chance find, by name (docs/CHAPTER1.md "Chances"). The rule:
 * chance-find bonuses apply to **every** chance find, outputs and byproducts alike: the skill's find
 * talents (when `skill` is given), House projects (the salt crock), buffs that name the item, buffs
 * on all finds (charms), and a blessed skill (Still Night). Omens, doubles, extras and saves are
 * their own kinds and never use these.
 */
export function chanceFactors(state: GameState, item: ItemId, now: number = state.lastTickAt, skill?: SkillId): { source: string; mult: number }[] {
  const out: { source: string; mult: number }[] = [];
  if (skill) {
    for (const l of TALENT_LEVELS) {
      const side = state.talents[skill]?.[l];
      if (!side) continue;
      const t = TALENTS[skill][l][side];
      for (const e of t.effects) if (e.kind === "find" && (!e.item || e.item === item)) out.push({ source: t.name, mult: e.multiplier });
    }
  }
  for (const u of state.upgrades) {
    const e = UPGRADE_DEFS[u].effect;
    if (e.kind === "find" && e.item === item) out.push({ source: UPGRADE_DEFS[u].name, mult: e.multiplier });
  }
  for (const b of activeBuffs(state, now)) {
    const d = BUFF_DEFS[b.id];
    const m = (d.chanceMultiplier?.[item] ?? 1) * (d.findMultiplier ?? 1) * (skill && b.skill === skill ? (d.blessSkill?.chanceMultiplier ?? 1) : 1);
    if (m !== 1) out.push({ source: d.name, mult: m });
  }
  for (const f of charmFindFactors(state)) out.push(f);
  return out;
}

/** Charms that raise every chance find (filled in by the charms: see charmFindFactors). */
function charmFindFactors(_state: GameState): { source: string; mult: number }[] {
  return [];
}

/** The product of chanceFactors: past 1 it's one for sure plus a chance of another (rollOutputs). */
export function chanceMultiplier(state: GameState, item: ItemId, now: number = state.lastTickAt, skill?: SkillId): number {
  return chanceFactors(state, item, now, skill).reduce((m, f) => m * f.mult, 1);
}

/** Chance of one extra unit on each guaranteed output (the drying rack, Green thumb). */
export function extraYieldChance(state: GameState, id: ActionId): number {
  const skill = ACTION_DEFS[id].skill;
  let chance = 0;
  for (const t of talents(state, "extra", skill)) chance += t.chance;
  for (const e of effects(state)) if (e.kind === "extra_yield" && e.skill === skill) chance += e.chance;
  return chance;
}

/** Extra XP as a fraction (Devout, Busy hands…; the Dream pillow, found or bound). */
export function xpBonus(state: GameState, id: ActionId, now: number = state.lastTickAt): number {
  let bonus = talents(state, "xp", ACTION_DEFS[id].skill).reduce((n, t) => n + t.bonus, 0);
  for (const r of discoveredRewards(state)) if (r.kind === "xp_all") bonus += r.bonus;
  for (const b of activeBuffs(state, now)) bonus += BUFF_DEFS[b.id].xpBonus ?? 0;
  return bonus;
}

export function offlineCapMs(state: GameState): number {
  let cap = BASE_OFFLINE_CAP_MS;
  for (const e of effects(state)) if (e.kind === "offline_cap") cap = Math.max(cap, e.hours * HOUR);
  return cap;
}

/** Omens need somewhere to go: none turn up until the omen shelf is built. */
export function omenCapacity(state: GameState): number {
  let cap = 0;
  for (const e of effects(state)) if (e.kind === "omen_capacity") cap = Math.max(cap, e.capacity);
  // A jar of embers (a keepsake) adds a place, once there's a shelf to put it on.
  if (cap > 0) for (const k of keepsakeEffects(state)) if (k.kind === "omen_slot") cap += k.extra;
  return cap;
}

// Grimoire rewards (docs/GRIMOIRE.md §8)

/** Extra speed while away, as a fraction (the Dream pillow: 0.1 = 10% faster offline). */
export function offlineBonus(state: GameState): number {
  let bonus = 0;
  for (const r of discoveredRewards(state)) if (r.kind === "offline_bonus") bonus += r.bonus;
  for (const k of keepsakeEffects(state)) if (k.kind === "offline_bonus") bonus += k.bonus;
  return bonus;
}

/** Extra rite outcome steps (the Hearth mark). */
export function riteQualitySteps(state: GameState): number {
  let steps = 0;
  for (const r of discoveredRewards(state)) if (r.kind === "rite_quality") steps += r.steps;
  return steps;
}

export function trustMultiplier(state: GameState): number {
  let mult = 1;
  for (const r of discoveredRewards(state)) if (r.kind === "trust_multiplier") mult *= r.multiplier;
  return mult;
}

/** Coin a request pays, after person-specific bonuses (Hana's soup lasts until the chapter ends). */
export function requestCoin(state: GameState, req: RequestDef<string>): number {
  let mult = 1;
  const chapterOver = state.rite.completed !== null;
  for (const r of discoveredRewards(state)) if (r.kind === "patron_coin" && r.from === req.from && !chapterOver) mult *= r.multiplier;
  // A Threshold nail charm: contracts pay more while it lasts.
  for (const b of activeBuffs(state)) mult *= 1 + (BUFF_DEFS[b.id].coinBonus ?? 0);
  return Math.round(req.coin * mult);
}
