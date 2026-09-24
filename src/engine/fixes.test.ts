import { describe, expect, it } from "vitest";
import { HEARTH_RITE } from "../content/rite";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { beginRite, fillRequest, type Result } from "./commands";
import { catchUp } from "./offline";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";

const T0 = 1_000_000;
const MIN = 60_000;
const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};
function open(extra: Partial<GameState> = {}): GameState {
  const b = newGame(T0, 4);
  return { ...b, notesRevealed: NOTES.length - 1, stats: { ...b.stats, completed: { decipher_page: PAGES.length } }, ...extra };
}

describe("inputs used mid-repetition", () => {
  it("never makes something for free or goes negative", () => {
    // Deciphering needs a tallow candle; hand the last candles to Old Tomas halfway through.
    let s = startAction(open({ inventory: { burnt_page: 5, tallow_candle: 3 } }), "decipher_page");
    s = advance(s, 3000).state;
    s.board = [{ request: "grave_candles", refillAt: 0 }];
    s = okay(fillRequest(s, 0));
    const { state, report } = advance(s, 4000);
    expect(state.inventory.tallow_candle).toBe(0);
    expect(state.inventory.deciphered_page ?? 0).toBe(0);
    expect(report.stopped?.reason).toEqual({ kind: "missing_input", item: "tallow_candle" });
  });
});

describe("after the rite", () => {
  it("the house goes back to work (the fallback), also offline", () => {
    let s = open({
      inventory: { ...(HEARTH_RITE.items as Record<string, number>) },
      skills: { ...newGame().skills, ritualism: { xp: xpForLevel(5) } },
    });
    s = advance(startAction(s, "sweep_hearth"), 3000).state; // remember a gathering action
    s = okay(beginRite(s));
    const { state, report } = catchUp(s, s.lastTickAt + 60 * MIN);
    expect(state.rite.completed).not.toBeNull();
    expect(state.active?.id).toBe("sweep_hearth");
    expect(report.actionsCompleted).toBeGreaterThan(500);
  });
});

describe("omens and curios", () => {
  it("the scripted Still Night lands even on a full shelf", () => {
    const giftNote = NOTES.findIndex((n) => "gift" in n);
    const prev = NOTES[giftNote - 1]!;
    if (!("goal" in prev) || prev.goal.kind !== "complete") throw new Error("expected an action goal");
    const b = newGame(T0, 11);
    const s: GameState = { ...b, notesRevealed: giftNote, omens: { still_night: 1 }, inventory: { tallow: 99, salt: 9 }, stats: { ...b.stats, completed: { [prev.goal.action]: prev.goal.count - 1 } } };
    const { state, report } = advance(startAction(s, prev.goal.action), 6000);
    expect(report.omensFound).toContain("still_night");
    expect(state.omens.still_night).toBe(2);
  });

  it("curios go to the collection, not the pantry", () => {
    const s = open({ skills: { ...newGame().skills, scavenging: { xp: 5000 } } });
    const { state, report } = advance(startAction(s, "open_chest"), 5000 * 1000);
    expect(report.curioStories.length).toBeGreaterThan(0);
    expect(state.inventory.curio ?? 0).toBe(0);
  });
});
