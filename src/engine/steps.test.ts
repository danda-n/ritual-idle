import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { claimReward, type Result } from "./commands";
import { BUFFS } from "../content/buffs";
import { actionDurationMs } from "./modifiers";
import { currentSteps, revealNotes, stepById, type Step } from "./progress";
import { PART_DEFS, type PartId } from "../content/rite";
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
    const place = stepById("light.place")!;
    if (!place.reward || !("xpChoice" in place.reward)) throw new Error("expected an XP choice");
    const s = { ...newGame(T0, 1), notesRevealed: 2, stepsDone: ["light.place"], rewardsWaiting: ["light.place"] };
    expect(claimReward(s, "light.place").ok).toBe(false);
    expect(claimReward(s, "light.place", "herbalism").ok).toBe(false); // not open yet
    const claimed = okay(claimReward(s, "light.place", "scavenging"));
    expect(claimed.skills.scavenging.xp).toBe(place.reward.xpChoice.amount);
    expect(claimed.rewardsWaiting).toEqual([]);
    expect(claimReward(claimed, "light.place", "scavenging").ok).toBe(false);
  });

  it("a Surge doubles speed on everything for its few seconds", () => {
    const s = okay(claimReward({ ...startAction(newGame(T0, 1), "search_pantry"), stepsDone: ["start.pantry"], rewardsWaiting: ["start.pantry"] }, "start.pantry"));
    const base = ACTION_DEFS.search_pantry.seconds * 1000;
    expect(actionDurationMs(s, "search_pantry")).toBeCloseTo(base / 2);
    expect(actionDurationMs(s, "search_pantry", T0 + BUFFS.surge.durationMs)).toBe(base);
  });

  it("rewards come only with a stage's first or last step, not every step", () => {
    for (const n of NOTES) {
      const steps = ("steps" in n ? n.steps : []) as readonly Step[];
      const rewarded = steps.filter((st) => st.reward);
      expect(rewarded.length, n.quote).toBeLessThanOrEqual(1);
    }
  });

  it("waiting rewards never hold the chapter up", () => {
    const s = startAction(newGame(T0, 1), "search_pantry");
    const { state } = advance(s, NOTES[0].goal.count * actionDurationMs(s, "search_pantry") + 10);
    expect(state.rewardsWaiting.length).toBeGreaterThan(0);
    expect(state.notesRevealed).toBe(2);
  });

  it("count from the stage's start, so earlier work doesn't count twice", () => {
    const need = NOTES[1].steps[0].goal.count;
    // 99 candles poured before this stage began (and none held): the step isn't done.
    const s: GameState = { ...newGame(T0, 1), notesRevealed: 2, stageStart: { tallow_candle: 99 }, stats: { ...newGame().stats, completed: { tallow_candle: 99 + need - 1 } } };
    const claimed: Step[] = [];
    revealNotes(s, claimed);
    expect(claimed.map((x) => x.id)).toEqual([]);
    s.stats.completed.tallow_candle = 99 + need;
    revealNotes(s, claimed);
    expect(claimed.map((x) => x.id)).toEqual(["light.candles"]);
  });

  it("a craft step is also met by holding enough already (no pouring 10 more when you have 200)", () => {
    const need = NOTES[1].steps[0].goal.count;
    const s: GameState = { ...newGame(T0, 1), notesRevealed: 2, stageStart: { tallow_candle: 500 }, stats: { ...newGame().stats, completed: { tallow_candle: 500 } }, inventory: { tallow_candle: need } };
    const claimed: Step[] = [];
    revealNotes(s, claimed);
    expect(claimed.map((x) => x.id)).toEqual(["light.candles"]);
  });

  it("step counts match what the part needs, plus what later steps of the stage use", () => {
    for (const n of NOTES) {
      if (!("goal" in n) || n.goal.kind !== "place" || !("steps" in n)) continue;
      const part = PART_DEFS[n.goal.part as PartId];
      const steps = n.steps as readonly Step[];
      steps.forEach((st, i) => {
        if (st.goal.kind !== "complete") return;
        const made = ACTION_DEFS[st.goal.action].outputs[0]!.item;
        if (!(made in part.items)) return;
        const usedLater = steps.slice(i + 1).reduce((sum, later) => (later.goal.kind === "complete" ? sum + (ACTION_DEFS[later.goal.action].inputs[made as never] ?? 0) * later.goal.count : sum), 0);
        expect(st.goal.count, st.id).toBe((part.items[made as keyof typeof part.items] ?? 0) + usedLater);
      });
    }
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
  it("drop Tend and the old talent ranks (talents are pairs now: choose again)", () => {
    const old = { ...newGame(T0, 1), version: 7, tend: { endsAt: 5, streak: 3, lastAt: 1 }, talents: { scavenging: { ranks: { tending: 2, swift: 1 } } } };
    const loaded = deserialize(JSON.stringify(old));
    expect("tend" in loaded).toBe(false);
    expect(loaded.talents).toEqual({});
  });
});
