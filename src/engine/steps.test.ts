import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { claimReward, type Result } from "./commands";
import { BUFFS } from "../content/buffs";
import { actionDurationMs } from "./modifiers";
import { currentSteps, revealNotes, type Step } from "./progress";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";

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
    const s = okay(claimReward({ ...startAction(newGame(T0, 1), "search_pantry"), notesRevealed: 7, stepsDone: ["perform.smoke"], rewardsWaiting: ["perform.smoke"] }, "perform.smoke"));
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

  it("the stage moves on when its goal is met, whatever steps are left", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state } = advance(s, NOTES[0].goal.count * actionDurationMs(s, "search_pantry") + 10);
    expect(state.notesRevealed).toBe(2);
    expect(currentSteps(state)[0]!.id).toBe("light.candles");
  });

  it("older saves count every step of stages already passed", () => {
    const old = { ...newGame(T0, 1), version: 5, notesRevealed: 3, stepsDone: undefined };
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.stepsDone).toContain("light.beeswax");
    expect(loaded.stepsDone).not.toContain("ward.lines");
  });
});

describe("older saves (v8)", () => {
  it("drop Tend and its talent ranks, keeping the rest", () => {
    const old = { ...newGame(T0, 1), version: 7, tend: { endsAt: 5, streak: 3, lastAt: 1 }, talents: { scavenging: { ranks: { tending: 2, swift: 1 } } } };
    const loaded = deserialize(JSON.stringify(old));
    expect("tend" in loaded).toBe(false);
    expect(loaded.talents.scavenging?.ranks).toEqual({ swift: 1 });
  });
});
