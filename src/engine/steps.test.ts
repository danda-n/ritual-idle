import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { TEND } from "../content/talents";
import { tend, type Result } from "./commands";
import { rewind } from "./devtools";
import { actionDurationMs } from "./modifiers";
import { catchUp } from "./offline";
import { currentSteps, revealNotes, type Step } from "./progress";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { tendBonusChance, tendMeterMs } from "./talents";

const T0 = 1_000_000;
const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};

describe("stage steps", () => {
  it("claim when met, grant their reward once, in any order", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state, report } = advance(s, 4 * actionDurationMs(s, "search_pantry"));
    expect(report.stepsDone.map((x) => x.id)).toEqual(["start.pantry"]);
    expect(state.stepsDone).toEqual(["start.pantry"]);
    // 4 searches of tallow, plus the reward's 2
    expect(state.inventory.tallow).toBe(4 + 2);
    const again = advance(state, 1000);
    expect(again.report.stepsDone).toEqual([]);
  });

  it("use lifetime counts, so steps already done claim at once when their stage arrives", () => {
    const s: GameState = { ...newGame(T0, 1), notesRevealed: 2, stats: { ...newGame().stats, completed: { tallow_candle: 5 } } };
    const claimed: Step[] = [];
    revealNotes(s, claimed);
    expect(claimed.map((x) => x.id)).toEqual(["light.candles"]);
  });

  it("every stage ends with placing its part, and names only open skills' actions", () => {
    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i]!;
      if (!("goal" in note) || note.goal.kind !== "place" || !("steps" in note)) continue;
      const steps = note.steps as readonly Step[];
      expect(steps[steps.length - 1]!.goal).toEqual({ kind: "place", part: note.goal.part });
      const open = new Set(NOTES.slice(0, i + 1).flatMap((n) => [...n.unlocks]));
      for (const st of steps) if (st.goal.kind === "complete") expect(open.has(ACTION_DEFS[st.goal.action].skill), st.id).toBe(true);
    }
  });

  it("step ids are unique", () => {
    const ids = NOTES.flatMap((n) => ("steps" in n ? n.steps.map((s) => s.id) : []));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the Tend step is optional: the stage moves on without it", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state } = advance(s, 8 * actionDurationMs(s, "search_pantry") + 10);
    expect(state.notesRevealed).toBe(2);
    expect(state.stepsDone).not.toContain("start.tend");
    expect(currentSteps(state)[0]!.id).toBe("light.candles");
  });

  it("older saves count every step of stages already passed", () => {
    const old = { ...newGame(T0, 1), version: 5, notesRevealed: 3, stepsDone: undefined, tend: undefined };
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.stepsDone).toContain("light.beeswax");
    expect(loaded.stepsDone).not.toContain("ward.lines");
    expect(loaded.tend).toEqual({ endsAt: 0, streak: 0, lastAt: 0 });
  });
});

describe("tending", () => {
  const running = () => startAction({ ...newGame(T0, 3), levelCap: 99 }, "search_pantry");
  const base = ACTION_DEFS.search_pantry.seconds * 1000;

  it("lights the meter for 15s: +50% speed while lit, normal after", () => {
    const s = okay(tend(running()));
    expect(s.tend.endsAt).toBe(T0 + TEND.meterMs);
    expect(actionDurationMs(s, "search_pantry")).toBeCloseTo(base / (1 + TEND.speed));
    expect(actionDurationMs(s, "search_pantry", T0 + TEND.meterMs)).toBe(base);
  });

  it("needs something running, and can't be spammed", () => {
    expect(tend(newGame(T0, 1)).ok).toBe(false);
    const s = okay(tend(running()));
    expect(tend(s).ok).toBe(false);
    expect(tend({ ...s, lastTickAt: s.lastTickAt + TEND.minGapMs }).ok).toBe(true);
  });

  it("does more work in 15 seconds than untended, and splits a repetition fairly at the end", () => {
    const tended = advance(okay(tend(running())), TEND.meterMs).report.actionsCompleted;
    const idle = advance(running(), TEND.meterMs).report.actionsCompleted;
    expect(tended).toBe(Math.floor((TEND.meterMs / base) * 1.5));
    expect(idle).toBe(Math.floor(TEND.meterMs / base));
  });

  it("builds a streak that grows a bonus-find chance, capped", () => {
    const s = okay(tend(running()));
    const after = advance(s, 5 * actionDurationMs(s, "search_pantry")).state;
    expect(after.tend.streak).toBe(5);
    expect(tendBonusChance(after, "scavenging")).toBeCloseTo(5 * TEND.streakPerRep);
    expect(tendBonusChance({ ...after, tend: { ...after.tend, streak: 99 } }, "scavenging")).toBe(TEND.streakCap);
    expect(after.stats.tended).toBe(5);
  });

  it("the streak resets when the meter goes out, or on switching actions", () => {
    const s = okay(tend(running()));
    expect(advance(s, TEND.meterMs + 10_000).state.tend.streak).toBe(0);
    const lit = advance(s, 3 * actionDurationMs(s, "search_pantry")).state;
    expect(startAction(lit, "sweep_hearth").tend.streak).toBe(0);
    expect(startAction(lit, "search_pantry").tend.streak).toBe(lit.tend.streak);
  });

  it("gives bonus finds at about the streak's chance", () => {
    // Keep the meter lit and the streak high for many repetitions.
    const s = { ...okay(tend(running())), tend: { endsAt: T0 + 10_000_000, streak: 999, lastAt: T0 } };
    const { report } = advance(s, 2000 * actionDurationMs(s, "search_pantry"));
    const rate = report.tendFinds / report.actionsCompleted;
    expect(rate).toBeGreaterThan(TEND.streakCap - 0.04);
    expect(rate).toBeLessThan(TEND.streakCap + 0.04);
  });

  it("the Tending talent lengthens the meter", () => {
    const s = { ...running(), talents: { scavenging: { ranks: { tending: 2 }, keystone: false } } };
    expect(tendMeterMs(s, "scavenging")).toBe(TEND.meterMs + 2 * TEND.rankMeterMs);
  });

  it("simply runs out while you're away, and the dev skip moves it", () => {
    const s = okay(tend(running()));
    expect(catchUp(s, T0 + 60 * 60_000).state.tend.streak).toBe(0);
    expect(rewind(s, 5000).tend.endsAt).toBe(T0 + TEND.meterMs - 5000);
  });
});
