import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import type { SkillId } from "../content/skills";
import { BRANCHES, KEYSTONES } from "../content/talents";
import { resetTalents, spendTalent, type Result } from "./commands";
import { actionDurationMs, levelSpeed } from "./modifiers";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState, type Talents } from "./state";
import { canSpend, keystoneEffect, keystoneOpen, pointsFree, talentPoints } from "./talents";
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
  return { ...b, notesRevealed: NOTES.length, stats: { ...b.stats, completed: { decipher_page: PAGES.length } }, skills, talents: talents ? { [skill]: talents } : {} };
}

/** Run an action for `reps` repetitions' worth of base time and count what it made. */
function made(s: GameState, id: keyof typeof ACTION_DEFS, reps: number) {
  return advance(startAction(s, id), reps * actionDurationMs(s, id)).state;
}

describe("level speed", () => {
  it("each level makes its skill 1% faster, compounding", () => {
    expect(levelSpeed(at(1), "herbalism")).toBe(1);
    expect(levelSpeed(at(11), "herbalism")).toBeCloseTo(1.01 ** 10);
    expect(actionDurationMs(at(11), "pick_nettle")).toBeCloseTo((ACTION_DEFS.pick_nettle.seconds * 1000) / 1.01 ** 10);
  });

  it("only speeds up its own skill", () => {
    const s = { ...at(1), skills: { ...at(1).skills, herbalism: { xp: xpForLevel(20) } } };
    expect(actionDurationMs(s, "pick_nettle")).toBeLessThan((ACTION_DEFS.pick_nettle.seconds * 1000));
    expect(actionDurationMs(s, "sweep_hearth")).toBe(ACTION_DEFS.sweep_hearth.seconds * 1000);
  });
});

describe("points", () => {
  it("arrive every 3 levels: 6 at the Chapter 1 cap", () => {
    expect(talentPoints(at(1), "herbalism")).toBe(0);
    expect(talentPoints(at(2), "herbalism")).toBe(0);
    expect(talentPoints(at(3), "herbalism")).toBe(1);
    expect(talentPoints(at(20), "herbalism")).toBe(6);
  });

  it("are spent a rank at a time, up to each branch's cap", () => {
    let s = at(12); // 4 points
    for (let i = 0; i < BRANCHES.swift.maxRank; i++) s = okay(spendTalent(s, "herbalism", "swift"));
    expect(s.talents.herbalism?.ranks.swift).toBe(3);
    expect(spendTalent(s, "herbalism", "swift").ok).toBe(false);
    expect(pointsFree(s, "herbalism")).toBe(1);
  });

  it("refuse without a free point", () => {
    const r = spendTalent(at(2), "herbalism", "swift");
    expect(!r.ok && r.reason).toMatch(/No talent points/);
  });

  it("refuse in a skill that isn't open", () => {
    expect(spendTalent({ ...at(9), notesRevealed: 1 }, "herbalism", "swift").ok).toBe(false);
  });

  it("bloom the keystone for free once one branch is full, not with 3 spread out", () => {
    let spread = at(15); // 5 points
    for (const b of ["swift", "plenty", "fortune"] as const) spread = okay(spendTalent(spread, "herbalism", b));
    expect(keystoneOpen(spread, "herbalism")).toBe(false);

    // The playtest case: level 9, all 3 points in Fortune.
    let deep = at(9);
    for (let i = 0; i < 3; i++) deep = okay(spendTalent(deep, "herbalism", "fortune"));
    expect(keystoneOpen(deep, "herbalism")).toBe(true);
    expect(keystoneEffect(deep, "herbalism")).toEqual(KEYSTONES.herbalism.effect);
    expect(pointsFree(deep, "herbalism")).toBe(0);
    expect(canSpend(deep, "herbalism", "fortune")).not.toBeNull();
  });

  it("reset for free, and every point comes back", () => {
    let s = okay(spendTalent(okay(spendTalent(at(6), "herbalism", "swift")), "herbalism", "fortune"));
    expect(pointsFree(s, "herbalism")).toBe(0);
    s = okay(resetTalents(s, "herbalism"));
    expect(pointsFree(s, "herbalism")).toBe(2);
    expect(s.talents.herbalism).toBeUndefined();
  });

  it("follow the level cap: XP past the cap earns nothing", () => {
    expect(talentPoints({ ...at(1), skills: { ...at(1).skills, herbalism: { xp: xpForLevel(40) } } }, "herbalism")).toBe(6);
  });
});

describe("branch effects", () => {
  it("Swift adds 5% speed per rank", () => {
    const s = at(1, "herbalism", { ranks: { swift: 2 } });
    expect(actionDurationMs(s, "pick_nettle")).toBeCloseTo((ACTION_DEFS.pick_nettle.seconds * 1000) / 1.1);
  });

  it("Plenty adds about 5% per rank to sure outputs", () => {
    const plain = made(at(1), "pick_nettle", 4000).inventory.nettle!;
    // 2 ranks (3 would also bloom the keystone)
    const plenty = made(at(1, "herbalism", { ranks: { plenty: 2 } }), "pick_nettle", 4000).inventory.nettle!;
    expect(plenty / plain).toBeGreaterThan(1.07);
    expect(plenty / plain).toBeLessThan(1.13);
  });

  it("Fortune crits double both output and XP, about 3% per rank", () => {
    const s = at(1, "chandlery", { ranks: { fortune: 2 } });
    s.levelCap = 99; // keep XP from capping during the run
    const { state, report } = advance(startAction({ ...s, inventory: { tallow: 99_999 } }, "tallow_candle"), 4000 * 3000);
    const rate = report.criticals / report.actionsCompleted;
    expect(rate).toBeGreaterThan(0.045);
    expect(rate).toBeLessThan(0.075);
    expect(state.inventory.tallow_candle).toBe(report.actionsCompleted + report.criticals);
    expect(report.xpGained.chandlery).toBe((report.actionsCompleted + report.criticals) * ACTION_DEFS.tallow_candle.xp);
  });

  it("are deterministic for the same seed", () => {
    const s = at(1, "herbalism", { ranks: { plenty: 2, fortune: 2 } });
    expect(made(s, "pick_nettle", 500).inventory).toEqual(made(s, "pick_nettle", 500).inventory);
  });
});

describe("keystones", () => {
  const key = (_skill: SkillId): Talents => ({ ranks: { swift: 3 } });

  it("every skill has one", () => {
    for (const skill of Object.keys(newGame().skills) as SkillId[]) expect(KEYSTONES[skill].text.length).toBeGreaterThan(0);
  });

  it("Long-burning: about 10% of candles come in pairs", () => {
    const s = { ...at(1, "chandlery", key("chandlery")), inventory: { tallow: 99_999 } };
    const { state, report } = advance(startAction(s, "tallow_candle"), 3000 * 3000);
    const extra = state.inventory.tallow_candle! / report.actionsCompleted - 1;
    expect(extra).toBeGreaterThan(0.07);
    expect(extra).toBeLessThan(0.13);
  });

  it("Keen eye: chance finds are 50% more likely", () => {
    const plain = made(at(8), "search_attic", 4000).inventory.burnt_page!;
    const keen = made(at(8, "scavenging", key("scavenging")), "search_attic", 4000).inventory.burnt_page!;
    expect(keen / plain).toBeGreaterThan(1.35);
    expect(keen / plain).toBeLessThan(1.65);
  });

  it("Dew-picked: every 5th pick gives 1 extra", () => {
    const s = at(1, "herbalism", key("herbalism"));
    const { state, report } = advance(startAction(s, "pick_nettle"), 10 * actionDurationMs(s, "pick_nettle") + 1);
    expect(report.actionsCompleted).toBe(10);
    expect(state.inventory.nettle).toBe(12);
  });

  it("Steady hand: about 15% of workings use no materials", () => {
    const s = { ...at(1, "sigilcraft", key("sigilcraft")), inventory: { salt: 3000 } };
    const { report } = advance(startAction(s, "salt_line"), 2000 * actionDurationMs(s, "salt_line"));
    const saved = 1 - report.itemsUsed.salt! / report.actionsCompleted;
    expect(saved).toBeGreaterThan(0.12);
    expect(saved).toBeLessThan(0.18);
  });

  it("Marginalia: each page deciphered gives +1 insight", () => {
    const s = { ...at(1, "scholarship", key("scholarship")), stats: { ...at(1).stats, completed: { decipher_page: 0 } }, inventory: { burnt_page: 2, tallow_candle: 2 } };
    const { state } = advance(startAction(s, "decipher_page"), 2 * actionDurationMs(s, "decipher_page"));
    expect(state.insight).toBe(2);
  });

  it("Devout: minor rites give 25% more XP", () => {
    const s = { ...at(1, "ritualism", key("ritualism")), inventory: { salt_line: 1, tallow_candle: 1 } };
    const { report } = advance(startAction(s, "bless_threshold"), actionDurationMs(s, "bless_threshold"));
    expect(report.xpGained.ritualism).toBe(Math.round(ACTION_DEFS.bless_threshold.xp * 1.25));
  });
});

describe("saves", () => {
  it("talents round-trip, and older saves start with none", () => {
    const s = okay(spendTalent(at(6), "herbalism", "swift"));
    expect(deserialize(JSON.stringify(s)).talents).toEqual(s.talents);
    const old = { ...newGame(T0, 1), version: 4 } as Partial<GameState>;
    delete old.talents;
    expect(deserialize(JSON.stringify(old)).talents).toEqual({});
  });
});
