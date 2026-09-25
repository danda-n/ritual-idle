import { describe, expect, it } from "vitest";
import { PART_IDS } from "../content/rite";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { beginRite, build, deliver, type Result } from "./commands";
import { UPGRADES } from "../content/upgrades";
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
    let s = startAction(open({ inventory: { burnt_page: 5, tallow_candle: 3 }, skills: { ...newGame().skills, scholarship: { xp: xpForLevel(3) } } }), "decipher_page");
    s = advance(s, 3000).state;
    s.board = [{ request: "grave_candles", refillAt: 0, delivered: {} }];
    s = okay(deliver(s, 0));
    const { state, report } = advance(s, 4000);
    expect(state.inventory.tallow_candle).toBe(0);
    expect(state.inventory.deciphered_page ?? 0).toBe(0);
    expect(report.stopped?.reason).toEqual({ kind: "missing_input", item: "tallow_candle" });
  });
});

describe("after the rite", () => {
  it("the house goes back to work (the fallback), also offline", () => {
    let s = open({
      kindling: [...PART_IDS],
      skills: { ...newGame().skills, ritualism: { xp: xpForLevel(5) } },
    });
    s = advance(startAction(s, "search_pantry"), 3000).state; // remember a gathering action
    s = okay(beginRite(s));
    const { state, report } = catchUp(s, s.lastTickAt + 60 * MIN);
    expect(state.rite.completed).not.toBeNull();
    expect(state.active?.id).toBe("search_pantry");
    expect(report.actionsCompleted).toBeGreaterThan(500);
  });
});

describe("omens and curios", () => {
  it("the Still Night that comes with the omen shelf lands even on a full shelf", () => {
    const s: GameState = { ...newGame(T0, 11), omens: { still_night: 2 }, inventory: { ...UPGRADES.omen_shelf.items } };
    const r = build(s, "omen_shelf");
    const state = okay(r);
    expect(r.ok && r.gifts).toContain("still_night");
    expect(state.omens.still_night).toBe(3);
  });

  it("curios go to the collection, not the pantry", () => {
    const s = open({ skills: { ...newGame().skills, scavenging: { xp: xpForLevel(20) } } });
    const { state, report } = advance(startAction(s, "open_chest"), 5000 * 1000);
    expect(report.curioStories.length).toBeGreaterThan(0);
    expect(state.inventory.curio ?? 0).toBe(0);
  });
});
