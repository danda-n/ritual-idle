import type { ActionId } from "../content/actions";
import { CHARM_DEFS, type CharmId } from "../content/charms";
import { AFFIX_POOLS, BASE, BREAD_AND_SALT, FOE_DEFS, FOE_IDS, GIFTS, PIECE_DEFS, REMEDIES, SETS, SLOTS, WEAKNESS_SHOWS_AFTER, type Affix, type AffixKind, type FoeDef, type FoeId, type PieceId, type SetId, type Slot, type Tag } from "../content/combat";
import { OMENS, type OmenId } from "../content/omens";
import { ITEM_DEFS, type ItemId } from "../content/items";
import { activeCharms, chanceMultiplier, omenCapacity, omenChanceMultiplier, rollOptionCount, skillSpeed, skillXpBonus, spendCharms, talents } from "./modifiers";
import { grantOmen } from "./omens";
import { readCurio } from "./grimoire";
import { isFeatureOpen, isSkillUnlocked } from "./progress";
import { nextRandom } from "./rng";
import type { BlowLine, FightState, FightSummary, Gear, GameState, Piece } from "./state";
import { levelForXp, xpForLevel } from "./xp";

// Combat in the cellar (docs/COMBAT.md). Pure and seeded like the rest of the engine: a fight runs
// inside `advance()` in the action slot, one foe at a time, until you stop or you're driven off.
// The same fight rules drive the readiness tag, played out in the background with a fixed seed.

// ---------- Your stats ----------

/** Everything a fight needs to know about you, worked out from your level, gear and talents. */
export interface CombatStats {
  maxHealth: number;
  ward: number;
  strike: number;
  /** Time between your blows (ms). */
  blowMs: number;
  telling: number;
  /** Special attacks hit this much (1 = full; the shirt makes it 0.8, a red thread knot halves it). */
  specialMult: number;
  /** The set's "first special attack of each foe misses". */
  firstSpecialMisses: boolean;
  tags: Partial<Record<Slot, Tag>>;
  beltCap: number;
  /** Remedies heal ×this. */
  remedyHeal: number;
  /** Share of your Health that comes back between foes, and Health per foe beaten. */
  breath: number;
  perFoe: number;
  /** Your blows ×this when the right tag is worn (×1.5, Counter-craft ×1.75). */
  counter: number;
  /** Loot chances ×this (the Lantern's affix; other find bonuses come from chanceMultiplier). */
  loot: number;
  /** Warding XP ×this. */
  xp: number;
  /** How many pieces of each set are worn. */
  sets: Partial<Record<SetId, number>>;
  /** Where each stat comes from, for the "Your stats" tab. */
  parts: Record<"health" | "ward" | "strike" | "speed", { source: string; value: number }[]>;
  /** What multiplies them (the set, talents, your level and help), for the same tab. */
  mults: Record<"ward" | "strike" | "speed", { source: string; mult: number }[]>;
}

export function wardingLevel(state: GameState): number {
  return levelForXp(state.skills.warding.xp, state.levelCap);
}

export function pieceOf(state: GameState, id: PieceId): Piece | undefined {
  return state.cellar.pieces.find((p) => p.id === id);
}

/** Every affix a piece has: its fixed trait and the random ones you chose. */
export function pieceAffixes(piece: Piece): Affix[] {
  const def = PIECE_DEFS[piece.id];
  return [...(def.fixed ? [def.fixed] : []), ...piece.affixes];
}

/** The pieces worn, slot by slot (only pieces you still hold). */
export function wornPieces(state: GameState, gear: Gear = state.cellar.gear): { slot: Slot; piece: Piece }[] {
  return SLOTS.flatMap((slot) => {
    const id = gear.worn[slot];
    const piece = id ? pieceOf(state, id) : undefined;
    return piece && PIECE_DEFS[piece.id].slot === slot ? [{ slot, piece }] : [];
  });
}

/** Your stats with this gear (the gear you're wearing, by default). */
export function combatStats(state: GameState, gear: Gear = state.cellar.gear): CombatStats {
  const level = wardingLevel(state);
  const parts: CombatStats["parts"] = { health: [], ward: [], strike: [], speed: [] };
  parts.health.push({ source: `Warding ${level}`, value: BASE.health + BASE.healthPerLevel * (level - 1) });
  parts.strike.push({ source: "Your own hands", value: BASE.strike });
  let speedBonus = 0;
  let telling: number = BASE.telling;
  let specialSoft = 0;
  let beltCap = 0;
  let remedyHeal = 0;
  let perFoe = 0;
  let loot = 0;
  let xp = 0;
  const tags: CombatStats["tags"] = {};
  const sets: CombatStats["sets"] = {};
  const add = (kind: AffixKind, value: number, source: string) => {
    switch (kind) {
      case "ward": parts.ward.push({ source, value }); break;
      case "health": parts.health.push({ source, value }); break;
      case "strike": parts.strike.push({ source, value }); break;
      case "speed": speedBonus += value / 100; parts.speed.push({ source, value }); break;
      case "telling": telling += value / 100; break;
      case "specials": specialSoft += value / 100; break;
      case "loot": loot += value / 100; break;
      case "xp": xp += value / 100; break;
      case "perFoe": perFoe += value; break;
      case "beltCap": beltCap += value; break;
      case "remedyHeal": remedyHeal += value / 100; break;
    }
  };
  for (const { slot, piece } of wornPieces(state, gear)) {
    const def = PIECE_DEFS[piece.id];
    if (def.base.ward) add("ward", def.base.ward, def.name);
    if (def.base.strike) add("strike", def.base.strike, def.name);
    if (def.base.health) add("health", def.base.health, def.name);
    if (def.base.beltCap) add("beltCap", def.base.beltCap, def.name);
    for (const a of pieceAffixes(piece)) add(a.kind, a.value, def.name);
    if (def.tag) tags[slot] = def.tag;
    if (def.set) sets[def.set] = (sets[def.set] ?? 0) + 1;
  }
  const sum = (xs: { value: number }[]) => xs.reduce((n, x) => n + x.value, 0);
  let wardMult = 1;
  let strikeMult = 1;
  let health = 0;
  let breath: number = BASE.breath;
  let counter: number = BASE.weaknessStrike;
  for (const t of talents(state, "ward", "warding")) wardMult += t.bonus;
  for (const t of talents(state, "strike", "warding")) strikeMult += t.bonus;
  for (const t of talents(state, "health", "warding")) health += t.amount;
  for (const t of talents(state, "breath", "warding")) breath += t.bonus;
  for (const t of talents(state, "remedyHeal", "warding")) remedyHeal += t.bonus;
  for (const t of talents(state, "telling", "warding")) telling += t.chance;
  for (const t of talents(state, "counter", "warding")) counter = Math.max(counter, t.mult);
  if (health > 0) parts.health.push({ source: "Talents", value: health });
  const mults: CombatStats["mults"] = { ward: [], strike: [], speed: [] };
  if (wardMult !== 1) mults.ward.push({ source: "Talents", mult: wardMult });
  if (strikeMult !== 1) mults.strike.push({ source: "Talents", mult: strikeMult });
  if ((sets.grandmother ?? 0) >= 2) {
    wardMult += SETS.grandmother.ward2;
    mults.ward.push({ source: "Set", mult: 1 + SETS.grandmother.ward2 });
  }
  const ward = Math.max(0, sum(parts.ward) * wardMult);
  // Charms that soften special attacks (a red thread knot): those on, and the one worn if you hold one.
  const charms = new Set<CharmId>(activeCharms(state));
  if (gear.charm && (state.inventory[gear.charm] ?? 0) > 0) charms.add(gear.charm);
  const knotMult = Math.min(1, ...[...charms].map((c) => CHARM_DEFS[c].effect.specialMult ?? 1));
  const speed = skillSpeed(state, "warding") * (1 + speedBonus);
  if (skillSpeed(state, "warding") !== 1) mults.speed.push({ source: "Level and help", mult: skillSpeed(state, "warding") });
  return {
    maxHealth: Math.round(sum(parts.health)),
    ward,
    strike: sum(parts.strike) * strikeMult,
    blowMs: BASE.blowMs / speed,
    telling,
    specialMult: Math.max(0, 1 - specialSoft) * knotMult,
    firstSpecialMisses: (sets.grandmother ?? 0) >= 3,
    tags,
    beltCap,
    remedyHeal: 1 + remedyHeal,
    breath,
    perFoe,
    counter,
    loot: 1 + loot,
    xp: 1 + xp,
    sets,
    parts,
    mults,
  };
}

/** True if the Hand or the Lantern carries this tag (your blows ×1.5). */
export function strikesWith(stats: CombatStats, tag: Tag): boolean {
  return stats.tags.hand === tag || stats.tags.lantern === tag;
}

/** How many of a foe must be beaten before its weakness shows (10; Grave-sense: 3). */
export function weaknessAfter(state: GameState): number {
  return talents(state, "weaknessAfter", "warding").reduce((n, t) => Math.min(n, t.n), WEAKNESS_SHOWS_AFTER);
}

/** Whether you know what a foe fears: a boss always shows it; others after enough are beaten. */
export function weaknessKnown(state: GameState, foe: FoeId): boolean {
  return FOE_DEFS[foe].boss === true || (state.cellar.beaten[foe] ?? 0) >= weaknessAfter(state);
}

// ---------- The fight rules (shared by the real fight and the readiness tag) ----------

/** A fight's numbers worked out once: your blow and its blow before the roll. */
export interface Matchup {
  foe: FoeDef;
  stats: CombatStats;
  /** Your blow before the roll and telling blows. */
  yourBlow: number;
  /** Its blow before the roll, specials and telling blows. */
  itsBlow: number;
  heals: number;
  healAt: number;
}

export function matchup(state: GameState, foeId: FoeId, gear: Gear = state.cellar.gear): Matchup {
  const foe = FOE_DEFS[foeId];
  const stats = combatStats(state, gear);
  let strike = stats.strike;
  if (strikesWith(stats, foe.weakness)) strike *= stats.counter;
  if (foe.resists && strikesWith(stats, foe.resists)) strike *= BASE.resisted;
  // Bread and salt, the old welcome: bread as your remedy against the house spirit.
  if (foeId === BREAD_AND_SALT.foe && gear.remedy === BREAD_AND_SALT.remedy) strike *= 1 + BREAD_AND_SALT.strike;
  const yourBlow = (strike * 100) / (100 + foe.ward);
  let itsBlow = (foe.strike * 100) / (100 + stats.ward);
  if (stats.tags.amulet === foe.weakness) itsBlow *= BASE.weaknessWard;
  const heals = gear.remedy ? REMEDIES[gear.remedy].heals * stats.remedyHeal : 0;
  return { foe, stats, yourBlow, itsBlow, heals, healAt: gear.healAt };
}

/** The live numbers of one fight against one foe after another. */
interface Bout {
  health: number;
  foeHealth: number;
  youMs: number;
  foeMs: number;
  foeBlows: number;
  specialSpent: boolean;
  belt: number;
}

type Event =
  | { kind: "you"; amount: number; telling: boolean; down: boolean }
  | { kind: "foe"; amount: number; telling: boolean; special?: string; missed?: boolean; heal?: number; driven: boolean };

/**
 * The next blow, yours or its, whichever comes first (you on a tie). Mutates `b`. Returns the time
 * it took, or null if it doesn't come within `limitMs`.
 */
function nextBlow(m: Matchup, b: Bout, roll: () => number, limitMs: number): { ms: number; event: Event } | null {
  const ms = Math.min(b.youMs, b.foeMs);
  if (ms > limitMs) {
    b.youMs -= limitMs;
    b.foeMs -= limitMs;
    return null;
  }
  b.youMs -= ms;
  b.foeMs -= ms;
  const size = () => BASE.rollLow + roll() * (BASE.rollHigh - BASE.rollLow);
  if (b.youMs <= 0) {
    b.youMs += m.stats.blowMs;
    const telling = roll() < m.stats.telling;
    const amount = m.yourBlow * size() * (telling ? BASE.tellingMult : 1);
    b.foeHealth -= amount;
    return { ms, event: { kind: "you", amount, telling, down: b.foeHealth <= 0 } };
  }
  b.foeMs += m.foe.blowMs;
  b.foeBlows++;
  const sp = m.foe.special && b.foeBlows % m.foe.special.every === 0 ? m.foe.special : undefined;
  if (sp && m.stats.firstSpecialMisses && !b.specialSpent) {
    b.specialSpent = true;
    return { ms, event: { kind: "foe", amount: 0, telling: false, special: sp.name, missed: true, driven: false } };
  }
  const telling = m.foe.telling !== undefined && roll() < m.foe.telling;
  const amount = m.itsBlow * size() * (sp ? sp.mult * m.stats.specialMult : 1) * (telling ? BASE.tellingMult : 1);
  b.health -= amount;
  let heal: number | undefined;
  // The healing rule: a remedy when Health falls below the line (and you're still standing).
  if (b.health > 0 && b.belt > 0 && m.heals > 0 && b.health < (m.healAt / 100) * m.stats.maxHealth) {
    heal = Math.min(m.heals, m.stats.maxHealth - b.health);
    b.health += heal;
    b.belt--;
  }
  return { ms, event: { kind: "foe", amount, telling, special: sp?.name, heal, driven: b.health <= 0 } };
}

/** Between foes: catch your breath, and the next one steps up at once. */
function nextFoe(m: Matchup, b: Bout): void {
  b.health = Math.min(m.stats.maxHealth, b.health + m.stats.breath * m.stats.maxHealth + m.stats.perFoe);
  b.foeHealth = m.foe.health;
  b.foeMs = m.foe.blowMs;
  b.foeBlows = 0;
  b.specialSpent = false;
}

// ---------- Readiness ----------

export const READINESS = ["Hopeless", "Deadly", "Risky", "Likely", "Safe"] as const;
export type Readiness = (typeof READINESS)[number];

export interface ReadinessResult {
  tag: Readiness;
  /** Fights won out of 1,000 against one foe (one attempt, for a boss), from full Health. */
  wins: number;
  /** A long run of foes, no remedies: survived every time without dropping below a fifth of your Health. */
  longRun: boolean;
  /** About how many foes the remedies last (null without remedies). */
  remediesLast: number | null;
}

const READINESS_SEED = 0x5eed;
const SAMPLES = 1000;
/** Safe means safe to leave: this many runs of this many foes in a row (Health carried over). */
const LONG_RUNS = 5;
const LONG_RUN_FOES = 1000;
const LONG_RUN_FLOOR = 0.2;

function seededRoll(seed: number): () => number {
  let s = seed;
  return () => {
    const [v, next] = nextRandom(s);
    s = next;
    return v;
  };
}

/** One foe, from `health`, to the end: true if you win. */
function playOne(m: Matchup, roll: () => number, health: number, belt: number): { won: boolean; belt: number } {
  const b: Bout = { health, foeHealth: m.foe.health, youMs: m.stats.blowMs, foeMs: m.foe.blowMs, foeBlows: 0, specialSpent: false, belt };
  for (let i = 0; i < 5000; i++) {
    const r = nextBlow(m, b, roll, Infinity)!;
    if (r.event.kind === "you" && r.event.down) return { won: true, belt: b.belt };
    if (r.event.kind === "foe" && r.event.driven) return { won: false, belt: b.belt };
  }
  return { won: false, belt: b.belt };
}

function survivesLongRun(m: Matchup, roll: () => number): boolean {
  const b: Bout = { health: m.stats.maxHealth, foeHealth: m.foe.health, youMs: m.stats.blowMs, foeMs: m.foe.blowMs, foeBlows: 0, specialSpent: false, belt: 0 };
  const floor = LONG_RUN_FLOOR * m.stats.maxHealth;
  let beaten = 0;
  for (let i = 0; beaten < LONG_RUN_FOES; i++) {
    if (i > LONG_RUN_FOES * 500) return false;
    const r = nextBlow(m, b, roll, Infinity)!;
    if (r.event.kind === "you" && r.event.down) {
      beaten++;
      nextFoe(m, b);
    } else if (r.event.kind === "foe" && b.health < floor) return false;
  }
  return true;
}

const readinessCache = new Map<string, ReadinessResult>();

/**
 * How ready you are for a foe with this gear (docs/COMBAT.md §6): the fight played out 1,000
 * times from full Health with a fixed seed, so the tag never flickers. Safe is stricter: it also
 * needs long runs of foes, no remedies, to never bring you below a fifth of your Health, so a Safe
 * fight can be left running for hours. A boss is one attempt.
 */
export function readiness(state: GameState, foeId: FoeId, gear: Gear = state.cellar.gear): ReadinessResult {
  const m = matchup(state, foeId, gear);
  const held = gear.remedy ? state.inventory[gear.remedy] ?? 0 : 0;
  const belt = Math.min(m.stats.beltCap, held);
  const key = JSON.stringify([foeId, m.yourBlow, m.itsBlow, m.heals, m.healAt, m.stats.maxHealth, m.stats.blowMs, m.stats.telling, m.stats.specialMult, m.stats.firstSpecialMisses, m.stats.breath, m.stats.perFoe, belt]);
  const hit = readinessCache.get(key);
  if (hit) return hit;
  const roll = seededRoll(READINESS_SEED);
  let wins = 0;
  let beltUsed = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const r = playOne(m, roll, m.stats.maxHealth, belt);
    if (r.won) wins++;
    beltUsed += belt - r.belt;
  }
  const perFoe = beltUsed / SAMPLES;
  const remediesLast = belt > 0 ? (perFoe > 0 ? Math.max(1, Math.floor(belt / perFoe)) : null) : null;
  let longRun = false;
  if (!m.foe.boss && wins >= SAMPLES * 0.999) {
    const runRoll = seededRoll(READINESS_SEED + 1);
    longRun = true;
    for (let r = 0; r < LONG_RUNS && longRun; r++) longRun = survivesLongRun(m, runRoll);
  }
  const share = wins / SAMPLES;
  const safe = m.foe.boss ? share >= 0.999 : longRun;
  const tag: Readiness = safe ? "Safe" : share >= 0.9 ? "Likely" : share >= 0.5 ? "Risky" : share >= 0.05 ? "Deadly" : "Hopeless";
  const result = { tag, wins, longRun, remediesLast };
  if (readinessCache.size > 500) readinessCache.clear();
  readinessCache.set(key, result);
  return result;
}

/** The rough chance in words, never the exact result ("about 3 in 4"). */
export function roughChance(wins: number): string {
  const p = wins / SAMPLES;
  if (p >= 0.999) return "almost certain";
  if (p >= 0.95) return "about 19 in 20";
  if (p >= 0.85) return "about 9 in 10";
  if (p >= 0.7) return "about 3 in 4";
  if (p >= 0.6) return "about 2 in 3";
  if (p >= 0.4) return "about even";
  if (p >= 0.3) return "about 1 in 3";
  if (p >= 0.2) return "about 1 in 4";
  if (p >= 0.08) return "about 1 in 10";
  if (p >= 0.03) return "about 1 in 20";
  return "a long shot";
}

// ---------- Fighting, inside advance() ----------

/** Why a fight can't begin, or null if it can. */
export function canFight(state: GameState, foeId: FoeId): string | null {
  const foe = FOE_DEFS[foeId];
  if (!isFeatureOpen(state, "cellar")) return "The cellar isn't open yet.";
  if (state.rite.performing) return "The rite is under way.";
  if (foe.boss && state.cellar.gifts.includes(foeId as keyof typeof GIFTS)) return `${foe.name} is calmed.`;
  if (wardingLevel(state) < foe.level) return `Needs Warding ${foe.level}.`;
  if (state.cellar.health < 1) return "Catch your breath first: Health comes back while you do other work.";
  return null;
}

/** What one fight reports, for the away summary and the feed. */
export interface FightReport {
  beaten: Partial<Record<FoeId, number>>;
  remediesUsed: number;
  drivenOff?: { foe: FoeId; by: string | null };
  /** It stopped when you left: only Safe fights go on while you're away. */
  stoppedAway?: FoeId;
  calmed?: FoeId;
}

export function emptyFightReport(): FightReport {
  return { beaten: {}, remediesUsed: 0 };
}

/** Start a fight (the command checks canFight). Mutates `state`. */
export function startFight(state: GameState, foeId: FoeId): void {
  const gear = state.cellar.gear;
  const m = matchup(state, foeId, gear);
  const held = gear.remedy ? state.inventory[gear.remedy] ?? 0 : 0;
  useCharmIfNeeded(state);
  const r = readiness(state, foeId, gear);
  const returnTo: ActionId | null = state.active?.id ?? state.job?.returnTo ?? state.fight?.returnTo ?? null;
  state.active = null;
  state.job = null;
  state.cellar.lastFor[foeId] = structuredClone(gear);
  state.cellar.lastFight = null;
  state.fight = {
    foe: foeId,
    foeHealth: m.foe.health,
    youMs: m.stats.blowMs,
    foeMs: m.foe.blowMs,
    foeBlows: 0,
    specialSpent: false,
    belt: Math.min(m.stats.beltCap, held),
    beaten: 0,
    loot: {},
    remediesUsed: 0,
    safe: r.tag === "Safe",
    returnTo,
    log: [],
    seq: 0,
  };
}

/** The charm worn: use one when none of it is on (a red thread knot, a Window charm…). */
function useCharmIfNeeded(state: GameState): void {
  const c = state.cellar.gear.charm;
  if (!c || (state.charms[c] ?? 0) > 0 || (state.inventory[c] ?? 0) < 1) return;
  state.inventory[c] = state.inventory[c]! - 1;
  state.charms[c] = (state.charms[c] ?? 0) + CHARM_DEFS[c].uses;
}

const LOG_LINES = 8;

function log(f: FightState, line: Omit<BlowLine, "n">): void {
  f.seq++;
  f.log.push({ n: f.seq, ...line });
  if (f.log.length > LOG_LINES) f.log.shift();
}

export interface FightHooks {
  roll: () => number;
  now: () => number;
  report: FightReport;
  /** Loot and curios found (into the advance report). */
  gained: (item: ItemId, qty: number) => void;
  curio: (story: string, fragment: ReturnType<typeof readCurio>["fragment"]) => void;
  omen: (omen: OmenId, kept: boolean) => void;
  xp: (amount: number, from: number, to: number) => void;
}

/**
 * Run the fight for up to `ms`. Returns the time used; the fight is over (state.fight null) if it
 * ended inside that time. Mutates `state`.
 */
export function stepFight(state: GameState, ms: number, h: FightHooks): number {
  const f = state.fight!;
  // Recomputed per step: gear is locked, but buffs and charms can change between steps.
  let m = matchup(state, f.foe, state.cellar.gear);
  const b: Bout = { health: Math.min(state.cellar.health, m.stats.maxHealth), foeHealth: f.foeHealth, youMs: f.youMs, foeMs: f.foeMs, foeBlows: f.foeBlows, specialSpent: f.specialSpent, belt: f.belt };
  let used = 0;
  let ended: "driven" | "calmed" | null = null;
  let drivenBy: string | null = null;
  while (used < ms) {
    const r = nextBlow(m, b, h.roll, ms - used);
    if (!r) {
      used = ms;
      break;
    }
    used += r.ms;
    const e = r.event;
    if (e.kind === "foe") {
      log(f, { who: "foe", amount: e.amount, telling: e.telling || undefined, special: e.special, missed: e.missed, heal: e.heal });
      if (e.heal !== undefined && state.cellar.gear.remedy) {
        state.inventory[state.cellar.gear.remedy] = Math.max(0, (state.inventory[state.cellar.gear.remedy] ?? 0) - 1);
        h.report.remediesUsed++;
        f.remediesUsed++;
      }
      if (e.driven) {
        // Driven off: the fight ends. Only the remedies used and this foe's loot are lost.
        b.health = 0;
        h.report.drivenOff = { foe: f.foe, by: e.special ?? null };
        ended = "driven";
        drivenBy = e.special ?? null;
        break;
      }
      continue;
    }
    log(f, { who: "you", amount: e.amount, telling: e.telling || undefined, down: e.down || undefined });
    if (!e.down) continue;
    // A foe warded off: its loot, Warding XP, and the next one steps up.
    foeBeaten(state, f, m, h);
    if (m.foe.boss) {
      ended = "calmed";
      break;
    }
    nextFoe(m, b);
    // Charms run out and buffs end between foes: work the numbers out again.
    useCharmIfNeeded(state);
    m = matchup(state, f.foe, state.cellar.gear);
    b.health = Math.min(b.health, m.stats.maxHealth);
  }
  state.cellar.health = Math.max(0, b.health);
  f.foeHealth = b.foeHealth;
  f.youMs = b.youMs;
  f.foeMs = b.foeMs;
  f.foeBlows = b.foeBlows;
  f.specialSpent = b.specialSpent;
  f.belt = b.belt;
  if (ended) endFight(state, ended, drivenBy);
  return used;
}

/** End the fight under way, keeping a summary for the Cellar. Mutates `state`. */
export function endFight(state: GameState, end: FightSummary["end"], by: string | null = null): void {
  const f = state.fight;
  if (!f) return;
  state.cellar.lastFight = { foe: f.foe, end, beaten: f.beaten, loot: f.loot, remediesUsed: f.remediesUsed, by, returnTo: f.returnTo };
  state.fight = null;
}

function foeBeaten(state: GameState, f: FightState, m: Matchup, h: FightHooks): void {
  const now = h.now();
  f.beaten++;
  state.cellar.beaten[f.foe] = (state.cellar.beaten[f.foe] ?? 0) + 1;
  h.report.beaten[f.foe] = (h.report.beaten[f.foe] ?? 0) + 1;
  for (const l of m.foe.loot) {
    const c = l.chance * m.stats.loot * (l.item === "curio" ? 1 : chanceMultiplier(state, l.item, now, "warding"));
    const times = Math.floor(c) + (h.roll() < c - Math.floor(c) ? 1 : 0);
    for (let i = 0; i < times; i++) {
      if (l.item === "curio") {
        const { story, fragment } = readCurio(state);
        h.curio(story, fragment);
      } else {
        state.inventory[l.item] = (state.inventory[l.item] ?? 0) + l.qty;
        f.loot[l.item] = (f.loot[l.item] ?? 0) + l.qty;
        h.gained(l.item, l.qty);
      }
    }
  }
  const skill = state.skills.warding;
  const before = levelForXp(skill.xp, state.levelCap);
  const xp = Math.round(m.foe.xp * m.stats.xp * (1 + skillXpBonus(state, "warding", now)));
  const after = Math.min(skill.xp + xp, xpForLevel(state.levelCap));
  h.xp(after - skill.xp, before, levelForXp(after, state.levelCap));
  skill.xp = after;
  // A foe beaten counts as one action for charms, and omens turn up from it like any work.
  spendCharms(state, "action");
  spendCharms(state, "foe");
  rollOmens(state, h);
  if (m.foe.boss) {
    const gift = f.foe as keyof typeof GIFTS;
    if (gift in GIFTS && !state.cellar.gifts.includes(gift)) state.cellar.gifts.push(gift);
    h.report.calmed = f.foe;
  }
}

/** Omens from a completed piece of work, once the omen shelf is built. Mutates `state`. */
export function rollOmens(state: GameState, h: Pick<FightHooks, "roll" | "omen">): void {
  if (omenCapacity(state) <= 0) return;
  for (const omen of Object.keys(OMENS) as OmenId[]) {
    if (h.roll() >= OMENS[omen].dropChance * omenChanceMultiplier(state)) continue;
    h.omen(omen, grantOmen(state, omen));
  }
}

/** Health comes back out of a fight: in full in about 2 minutes of any other work (twice as fast with the Domovoi's favour). */
export function regenHealth(state: GameState, ms: number): void {
  if (!isFeatureOpen(state, "cellar")) return;
  const max = combatStats(state).maxHealth;
  if (state.cellar.health >= max) {
    state.cellar.health = max;
    return;
  }
  const mult = state.cellar.gifts.reduce((n, g) => n * GIFTS[g].regen, 1);
  state.cellar.health = Math.min(max, state.cellar.health + (ms / BASE.regenFullMs) * max * mult);
}

/** Time until your Health is full again, out of a fight (ms). */
export function timeToFullMs(state: GameState): number {
  const max = combatStats(state).maxHealth;
  const mult = state.cellar.gifts.reduce((n, g) => n * GIFTS[g].regen, 1);
  return Math.max(0, ((max - state.cellar.health) / max) * (BASE.regenFullMs / mult));
}

// ---------- Crafting pieces ----------

/** Why a piece can't be made now, or null if it can. */
export function canCraftPiece(state: GameState, id: PieceId): string | null {
  const def = PIECE_DEFS[id];
  if (!isSkillUnlocked(state, "crafting")) return "Crafting hasn't opened yet.";
  if (state.rite.performing) return "The rite is under way.";
  if (pieceOf(state, id)) return "You have it already. Reforge it to change its bonus.";
  if (state.cellar.pending) return "Choose the last piece's bonus first.";
  if (state.job) return "A piece is already being made.";
  if (levelForXp(state.skills.crafting.xp, state.levelCap) < def.level) return `Needs Crafting ${def.level}.`;
  const short = (Object.entries(def.items) as [ItemId, number][]).find(([i, n]) => (state.inventory[i] ?? 0) < n);
  return short ? `Short of ${ITEM_DEFS[short[0]].name.toLowerCase()}.` : null;
}

/** Time to make a piece (ms), with Crafting's speed. */
export function pieceDurationMs(state: GameState, id: PieceId): number {
  return (PIECE_DEFS[id].seconds * 1000) / skillSpeed(state, "crafting");
}

/** Start making a piece: its materials go now, and it takes the action slot. Mutates `state`. */
export function startPiece(state: GameState, id: PieceId): void {
  for (const [i, n] of Object.entries(PIECE_DEFS[id].items) as [ItemId, number][]) state.inventory[i] = (state.inventory[i] ?? 0) - n;
  const returnTo = state.active?.id ?? state.fight?.returnTo ?? null;
  state.active = null;
  endFight(state, "stopped");
  state.job = { piece: id, progress: 0, returnTo };
}

/** Stop making a piece: its materials come back. Mutates `state`. */
export function cancelPiece(state: GameState): void {
  const job = state.job;
  if (!job) return;
  for (const [i, n] of Object.entries(PIECE_DEFS[job.piece].items) as [ItemId, number][]) state.inventory[i] = (state.inventory[i] ?? 0) + n;
  state.job = null;
}

/** Roll the options for a piece's random affix: distinct kinds from the slot's pool, values in their ranges. */
export function rollAffixOptions(state: GameState, id: PieceId, count: number, roll: () => number): Affix[] {
  const pool = [...AFFIX_POOLS[PIECE_DEFS[id].slot]];
  // Shuffle, then take distinct kinds first; past the pool's size, kinds repeat with new values.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(roll() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const top = talents(state, "rollTop", "crafting").length > 0;
  const out: Affix[] = [];
  for (let i = 0; i < count; i++) {
    const a = pool[i % pool.length]!;
    const low = top ? a.min + Math.ceil((a.max - a.min) / 2) : a.min;
    out.push({ kind: a.kind, value: low + Math.floor(roll() * (a.max - low + 1)) });
  }
  return out;
}

/** A roll in the top quarter of its range ("▲ High roll"). */
export function isHighRoll(id: PieceId, affix: Affix): boolean {
  const a = AFFIX_POOLS[PIECE_DEFS[id].slot].find((p) => p.kind === affix.kind);
  if (!a || a.max === a.min) return false;
  return affix.value >= a.max - (a.max - a.min) * 0.25;
}

/**
 * Run the piece being made for up to `ms`. When it's done it gives Crafting XP and its options
 * roll, waiting for you to choose. Returns the time used. Mutates `state`.
 */
export function stepJob(state: GameState, ms: number, h: Pick<FightHooks, "roll" | "omen" | "xp">): { used: number; done: boolean } {
  const job = state.job!;
  const duration = pieceDurationMs(state, job.piece);
  const needed = (1 - job.progress) * duration;
  if (ms < needed) {
    job.progress += ms / duration;
    return { used: ms, done: false };
  }
  const def = PIECE_DEFS[job.piece];
  const skill = state.skills.crafting;
  const before = levelForXp(skill.xp, state.levelCap);
  const xp = Math.round(def.xp * (1 + skillXpBonus(state, "crafting")));
  const after = Math.min(skill.xp + xp, xpForLevel(state.levelCap));
  h.xp(after - skill.xp, before, levelForXp(after, state.levelCap));
  skill.xp = after;
  state.cellar.pending = { piece: job.piece, kind: "craft", options: rollAffixOptions(state, job.piece, rollOptionCount(state, false), h.roll) };
  spendCharms(state, "craft");
  rollOmens(state, h);
  state.job = null;
  return { used: needed, done: true };
}

/** The foes in order, for screens and the bot. */
export const CELLAR_FOES = FOE_IDS;
