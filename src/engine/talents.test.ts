import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { OMENS } from "../content/omens";
import { PAGES } from "../content/pages";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { TALENT_LEVELS, TALENTS, type TalentLevel } from "../content/talents";
import { chooseTalent, type Result } from "./commands";
import { actionDurationMs, actionInputs, levelSpeed, omenChanceMultiplier, speedMultiplier, xpBonus } from "./modifiers";
import { deserialize } from "./save";
import { advance, blockReason, startAction } from "./simulate";
import { newGame, type GameState, type Talents } from "./state";
import { choicesWaiting, takenTalents, unlocksAt } from "./talents";
import { xpForLevel } from "./xp";

const T0 = 1_000_000;
const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};

/** Every skill open, at `level`, with these talents in one skill. */
function at(level: number, skill: SkillId = "herbalism", talents?: Talents): GameState {
  const b = newGame(T0, 31);
  const skills = Object.fromEntries(Object.keys(b.skills).map((k) => [k, { xp: xpForLevel(level) }])) as GameState["skills"];
  return { ...b, levelCap: 20, notesRevealed: NOTES.length, stats: { ...b.stats, completed: { decipher_page: PAGES.length } }, skills, talents: talents ? { [skill]: talents } : {} };
}

/** A state with one talent taken, at level 12 so every pair is open. */
function taking(skill: SkillId, level: TalentLevel, side: "a" | "b"): GameState {
  return at(12, skill, { [level]: side });
}

/** Run an action for `reps` repetitions' worth of time. */
function run(s: GameState, id: ActionId, reps: number) {
  return advance(startAction(s, id), reps * actionDurationMs(s, id) + 1);
}

const BASE = (id: ActionId) => ACTION_DEFS[id].seconds * 1000;

describe("level speed", () => {
  it("each level makes its skill 1% faster, compounding", () => {
    expect(levelSpeed(at(1), "herbalism")).toBe(1);
    expect(levelSpeed(at(11), "herbalism")).toBeCloseTo(1.01 ** 10);
  });

  it("only speeds up its own skill", () => {
    const s = { ...at(1), skills: { ...at(1).skills, herbalism: { xp: xpForLevel(20) } } };
    expect(actionDurationMs(s, "pick_nettle")).toBeLessThan(BASE("pick_nettle"));
    expect(actionDurationMs(s, "sweep_hearth")).toBe(BASE("sweep_hearth"));
  });
});

describe("talent pairs", () => {
  it("every skill has a pair at levels 3, 6, 9 and 12, each side with a name and an effect", () => {
    for (const skill of SKILL_IDS)
      for (const level of TALENT_LEVELS)
        for (const t of [TALENTS[skill][level].a, TALENTS[skill][level].b]) {
          expect(t.name.length, `${skill} ${level}`).toBeGreaterThan(0);
          expect(t.effects.length).toBeGreaterThan(0);
        }
  });

  it("open as the skill reaches each level", () => {
    expect(choicesWaiting(at(2), "herbalism")).toEqual([]);
    expect(choicesWaiting(at(3), "herbalism")).toEqual([3]);
    expect(choicesWaiting(at(10), "herbalism")).toEqual([3, 6, 9]);
    expect(chooseTalent(at(5), "herbalism", 6, "a").ok).toBe(false);
  });

  it("take one side only; the pick is fixed until the next tier", () => {
    let s = okay(chooseTalent(at(3), "herbalism", 3, "a"));
    expect(takenTalents(s, "herbalism")).toEqual([TALENTS.herbalism[3].a]);
    expect(choicesWaiting(s, "herbalism")).toEqual([]);
    const refused = chooseTalent(s, "herbalism", 3, "b");
    expect(!refused.ok && refused.reason).toMatch(/Locked until level 6/);
    expect(unlocksAt(s, "herbalism", 3)).toBe(6);
  });

  it("can be changed again from the next tier on", () => {
    const s = okay(chooseTalent(at(3), "herbalism", 3, "a"));
    const later = { ...s, skills: { ...s.skills, herbalism: { xp: xpForLevel(6) } } };
    expect(unlocksAt(later, "herbalism", 3)).toBeNull();
    expect(takenTalents(okay(chooseTalent(later, "herbalism", 3, "b")), "herbalism")[0]).toBe(TALENTS.herbalism[3].b);
    // The newest pick (level 6) is still fixed once taken.
    const six = okay(chooseTalent(later, "herbalism", 6, "a"));
    expect(chooseTalent(six, "herbalism", 6, "b").ok).toBe(false);
  });

  it("the level-12 pick opens again at 15", () => {
    const s = okay(chooseTalent(at(12), "herbalism", 12, "a"));
    expect(unlocksAt(s, "herbalism", 12)).toBe(15);
    expect(chooseTalent({ ...s, skills: { ...s.skills, herbalism: { xp: xpForLevel(15) } } }, "herbalism", 12, "b").ok).toBe(true);
  });

  it("choosing the side you already hold changes nothing", () => {
    const s = okay(chooseTalent(at(3), "herbalism", 3, "a"));
    expect(okay(chooseTalent(s, "herbalism", 3, "a"))).toBe(s);
  });

  it("refuse in a skill that isn't open", () => {
    expect(chooseTalent({ ...at(9), notesRevealed: 1 }, "herbalism", 3, "a").ok).toBe(false);
  });
});

describe("talent effects", () => {
  it("speed: +15% for the skill's own actions", () => {
    expect(speedMultiplier(taking("herbalism", 3, "a"), "pick_nettle")).toBeCloseTo(1.15 * levelSpeed(at(12), "herbalism"));
  });

  it("speed for another skill: Herb-wise speeds Chandlery, not Herbalism", () => {
    const s = taking("herbalism", 9, "b");
    expect(speedMultiplier(s, "tallow_candle")).toBeCloseTo(1.12 * levelSpeed(s, "chandlery"));
    expect(speedMultiplier(s, "pick_nettle")).toBeCloseTo(levelSpeed(s, "herbalism"));
  });

  it("xp for another skill: The rite's words raises Ritualism XP", () => {
    const s = taking("scholarship", 9, "b");
    expect(xpBonus(s, "bless_threshold")).toBeCloseTo(0.2);
    expect(xpBonus(s, "decipher_page")).toBe(0);
  });

  it("bulk: two at a time with twice the XP, but slower", () => {
    const s = { ...taking("chandlery", 6, "a"), inventory: { tallow: 20 } };
    expect(actionDurationMs(s, "tallow_candle")).toBeCloseTo((BASE("tallow_candle") * 1.8) / speedMultiplier(s, "tallow_candle"));
    const { state, report } = run(s, "tallow_candle", 3);
    expect(report.actionsCompleted).toBe(3);
    expect(state.inventory.tallow_candle).toBe(6);
    expect(report.xpGained.chandlery).toBe(6 * ACTION_DEFS.tallow_candle.xp);
  });

  it("thrift: Thin wicks makes a tallow candle from 1 tallow", () => {
    const s = { ...taking("chandlery", 3, "b"), inventory: { tallow: 1 } };
    expect(actionInputs(s, "tallow_candle")).toEqual({ tallow: 1 });
    expect(blockReason(s, "tallow_candle")).toBeNull();
    expect(run(s, "tallow_candle", 1).state.inventory.tallow_candle).toBe(1);
  });

  it("thrift can drop an input entirely: Pure smoke needs no tallow", () => {
    expect(actionInputs(taking("herbalism", 6, "b"), "mugwort_incense")).toEqual({ mugwort: 2 });
  });

  it("find: Deep shelves makes salt from the pantry 50% more likely", () => {
    const plain = run(at(12), "search_pantry", 3000).state.inventory.salt!;
    const deep = run(taking("scavenging", 3, "b"), "search_pantry", 3000).state.inventory.salt!;
    expect(deep / plain).toBeGreaterThan(1.35);
    expect(deep / plain).toBeLessThan(1.65);
  });

  it("find for one item: Well stocked makes pantry salt certain, and nothing else", () => {
    const { state, report } = run(taking("scavenging", 12, "b"), "search_pantry", 50);
    expect(state.inventory.salt).toBe(report.actionsCompleted);
  });

  it("double: about 10% of repetitions come doubled, XP too", () => {
    const s = { ...taking("chandlery", 9, "a"), inventory: { tallow: 99_999 } };
    const { state, report } = run(s, "tallow_candle", 3000);
    const rate = report.doubled / report.actionsCompleted;
    expect(rate).toBeGreaterThan(0.08);
    expect(rate).toBeLessThan(0.12);
    expect(state.inventory.tallow_candle).toBe(report.actionsCompleted + report.doubled);
  });

  it("extra: Green thumb gives an extra herb about 20% of the time", () => {
    const { state, report } = run(taking("herbalism", 3, "b"), "pick_nettle", 3000);
    const extra = state.inventory.nettle! / report.actionsCompleted - 1;
    expect(extra).toBeGreaterThan(0.17);
    expect(extra).toBeLessThan(0.23);
  });

  it("every nth: Dew-picked gives 1 extra every 5th pick", () => {
    const { state, report } = run(taking("herbalism", 9, "a"), "pick_nettle", 10);
    expect(report.actionsCompleted).toBe(10);
    expect(state.inventory.nettle).toBe(12);
  });

  it("save: Steady hand uses no materials about 15% of the time", () => {
    const s = { ...taking("sigilcraft", 9, "a"), inventory: { salt: 3000 } };
    const { report } = run(s, "salt_line", 2000);
    const saved = 1 - report.itemsUsed.salt! / report.actionsCompleted;
    expect(saved).toBeGreaterThan(0.12);
    expect(saved).toBeLessThan(0.18);
  });

  it("byproduct: Wick ash leaves ash from about a third of the candles", () => {
    const s = { ...taking("chandlery", 6, "b"), inventory: { tallow: 99_999 } };
    const { state, report } = run(s, "tallow_candle", 3000);
    const rate = state.inventory.ash! / report.actionsCompleted;
    expect(rate).toBeGreaterThan(0.29);
    expect(rate).toBeLessThan(0.37);
  });

  it("insight: Marginalia gives +1 insight per page deciphered", () => {
    const base = taking("scholarship", 6, "b");
    const s = { ...base, stats: { ...base.stats, completed: { decipher_page: 0 } }, inventory: { burnt_page: 2, tallow_candle: 2 } };
    expect(run(s, "decipher_page", 2).state.insight).toBe(2);
  });

  it("buff length: Long blessing makes the rooms' blessing last twice as long", () => {
    const s = { ...taking("ritualism", 6, "a"), inventory: { smudge: 1, tallow_candle: 1 } };
    const plain = { ...at(12), inventory: { smudge: 1, tallow_candle: 1 } };
    const long = run(s, "smoke_rooms", 1).state.buffs.find((b) => b.id === "blessing")!;
    const short = run(plain, "smoke_rooms", 1).state.buffs.find((b) => b.id === "blessing")!;
    expect(long.endsAt - T0).toBeGreaterThan(1.9 * (short.endsAt - T0));
  });

  it("omen chance: Omen-sense doubles it, from any skill's work", () => {
    expect(omenChanceMultiplier(taking("ritualism", 9, "a"))).toBe(2);
    expect(OMENS.still_night.dropChance).toBeGreaterThan(0);
  });

  it("are deterministic for the same seed", () => {
    const s = taking("herbalism", 3, "b");
    expect(run(s, "pick_nettle", 500).state.inventory).toEqual(run(s, "pick_nettle", 500).state.inventory);
  });
});

describe("saves", () => {
  it("talents round-trip, and older saves start with none", () => {
    const s = okay(chooseTalent(at(6), "herbalism", 6, "b"));
    expect(deserialize(JSON.stringify(s)).talents).toEqual(s.talents);
    const old = { ...newGame(T0, 1), version: 4 } as Partial<GameState>;
    delete old.talents;
    expect(deserialize(JSON.stringify(old)).talents).toEqual({});
  });

  it("drop anything that isn't a side at a talent level (the old branch ranks)", () => {
    const old = { ...newGame(T0, 1), talents: { herbalism: { ranks: { swift: 2 } }, chandlery: { 3: "a", 4: "b", 6: "x" } } };
    expect(deserialize(JSON.stringify(old)).talents).toEqual({ chandlery: { 3: "a" } });
  });
});
