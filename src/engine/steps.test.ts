import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { TEND } from "../content/talents";
import { claimReward, tend, type Result } from "./commands";
import { BUFFS } from "../content/buffs";
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
  it("complete when met, and their reward waits for a claim", () => {
    const first = NOTES[0].steps[0];
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state, report } = advance(s, first.goal.count * actionDurationMs(s, "search_pantry") + 1);
    expect(report.stepsDone.map((x) => x.id)).toEqual(["start.pantry"]);
    expect(state.stepsDone).toEqual(["start.pantry"]);
    expect(state.rewardsWaiting).toEqual(["start.pantry"]);
    expect(advance(state, 1000).report.stepsDone).toEqual([]);
  });

  it("an XP choice goes to the skill you pick (an open one), once", () => {
    const first = NOTES[0].steps[0];
    const s = { ...newGame(T0, 1), stepsDone: ["start.pantry"], rewardsWaiting: ["start.pantry"] };
    expect(claimReward(s, "start.pantry").ok).toBe(false);
    expect(claimReward(s, "start.pantry", "herbalism").ok).toBe(false); // not open yet
    const claimed = okay(claimReward(s, "start.pantry", "scavenging"));
    expect(claimed.skills.scavenging.xp).toBe(first.reward.xpChoice.amount);
    expect(claimed.rewardsWaiting).toEqual([]);
    expect(claimReward(claimed, "start.pantry", "scavenging").ok).toBe(false);
  });

  it("a Surge doubles speed on everything for its few seconds", () => {
    const s = okay(claimReward({ ...startAction(newGame(T0, 1), "search_pantry"), stepsDone: ["start.tend"], rewardsWaiting: ["start.tend"] }, "start.tend"));
    const base = ACTION_DEFS.search_pantry.seconds * 1000;
    expect(actionDurationMs(s, "search_pantry")).toBeCloseTo(base / 2);
    expect(actionDurationMs(s, "search_pantry", T0 + BUFFS.surge.durationMs)).toBe(base);
  });

  it("an omen reward lands on the shelf even when it's full", () => {
    const s = { ...newGame(T0, 1), notesRevealed: 2, omens: { still_night: 9 }, stepsDone: ["light.beeswax"], rewardsWaiting: ["light.beeswax"] };
    expect(okay(claimReward(s, "light.beeswax")).omens.still_night).toBe(10);
  });

  it("waiting rewards never hold the chapter up", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state } = advance(s, NOTES[0].goal.count * actionDurationMs(s, "search_pantry") + 10);
    expect(state.rewardsWaiting.length).toBeGreaterThan(0);
    expect(state.notesRevealed).toBe(2);
  });

  it("use lifetime counts, so steps already done claim at once when their stage arrives", () => {
    const s: GameState = { ...newGame(T0, 1), notesRevealed: 2, stats: { ...newGame().stats, completed: { tallow_candle: NOTES[1].steps[0].goal.count } } };
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

  it("an XP choice only ever suggests a skill that's open by then", () => {
    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i]!;
      const open = new Set(NOTES.slice(0, i + 1).flatMap((n) => [...n.unlocks]));
      for (const st of ("steps" in note ? note.steps : []) as readonly Step[]) {
        if (st.reward && "xpChoice" in st.reward) expect(open.has(st.reward.xpChoice.suggest), st.id).toBe(true);
      }
    }
  });

  it("step ids are unique", () => {
    const ids = NOTES.flatMap((n) => ("steps" in n ? n.steps.map((s) => s.id) : []));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the Tend step is optional: the stage moves on without it", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state } = advance(s, NOTES[0].goal.count * actionDurationMs(s, "search_pantry") + 10);
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

  it("tending mid-repetition keeps the progress and only speeds up what's left", () => {
    const half = advance(running(), base / 2).state;
    expect(half.active!.progress).toBeCloseTo(0.5);
    const tended = okay(tend(half));
    expect(tended.active!.progress).toBeCloseTo(0.5);
    // Half a repetition left at 1.5× speed: it finishes after base / 2 / 1.5, not at once.
    expect(advance(tended, base / 2 / 1.5 - 5).report.actionsCompleted).toBe(0);
    expect(advance(tended, base / 2 / 1.5 + 5).report.actionsCompleted).toBe(1);
  });

  it("older saves turn elapsed time into a fraction", () => {
    const old = { ...running(), version: 6, active: { id: "search_pantry", elapsedMs: base / 4 } };
    expect(deserialize(JSON.stringify(old)).active).toEqual({ id: "search_pantry", progress: 0.25 });
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
