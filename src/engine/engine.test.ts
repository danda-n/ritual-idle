import { describe, expect, it } from "vitest";
import { ACTION_DEFS, ACTIONS } from "../content/actions";
import { ITEMS } from "../content/items";
import { SKILLS } from "../content/skills";
import { catchUp } from "./offline";
import { exportSave, importSave } from "./save";
import { advance, blockReason, skillLevel, startAction } from "./simulate";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { newGame as freshGame, type GameState } from "./state";
import { EARLY_RAMP, levelForXp, XP_BASE, xpForLevel, xpToNext } from "./xp";

/** A game past the Chapter 1 onboarding: every skill and recipe open. */
function newGame(now: number, seed: number): GameState {
  const s = freshGame(now, seed);
  return { ...s, notesRevealed: NOTES.length, stats: { completed: { decipher_page: PAGES.length }, requestsFilled: 0, omensSeen: 0, curiosRead: 0, tended: 0 } };
}

const T0 = 1_000_000;
const HOUR = 60 * 60 * 1000;

describe("content", () => {
  it("only references items and skills that exist", () => {
    for (const [id, a] of Object.entries(ACTION_DEFS)) {
      expect(SKILLS[a.skill], id).toBeDefined();
      for (const item of Object.keys(a.inputs)) expect(ITEMS[item as keyof typeof ITEMS], `${id} input ${item}`).toBeDefined();
      for (const o of a.outputs) expect(ITEMS[o.item], `${id} output ${o.item}`).toBeDefined();
    }
  });
});

describe("xp curve", () => {
  it("matches the Chapter 1 design numbers", () => {
    expect(xpToNext(1)).toBe(Math.floor(XP_BASE * EARLY_RAMP[0]));
    expect(xpForLevel(2)).toBe(xpToNext(1));
    expect(xpForLevel(20)).toBeGreaterThan(xpForLevel(10) * 4);
  });

  it("respects the level cap", () => {
    expect(levelForXp(1_000_000, 20)).toBe(20);
    expect(levelForXp(1_000_000, 40)).toBe(40);
  });
});

describe("advance", () => {
  it("repeats an action and grants items and XP", () => {
    const s = startAction(newGame(T0, 1), "pick_nettle");
    const { state, report } = advance(s, 10 * (ACTION_DEFS.pick_nettle.seconds * 1000));
    expect(report.actionsCompleted).toBe(10);
    expect(state.inventory.nettle).toBe(10);
    expect(state.skills.herbalism.xp).toBe(10 * ACTION_DEFS.pick_nettle.xp);
  });

  it("carries partial progress between calls", () => {
    const s = startAction(newGame(T0, 1), "pick_nettle");
    const a = advance(s, 0.75 * (ACTION_DEFS.pick_nettle.seconds * 1000)).state;
    expect(a.inventory.nettle ?? 0).toBe(0);
    expect(advance(a, 0.25 * (ACTION_DEFS.pick_nettle.seconds * 1000)).state.inventory.nettle).toBe(1);
  });

  it("stops when inputs run out", () => {
    let s = newGame(T0, 1);
    s = { ...s, inventory: { tallow: 5 } };
    const { state, report } = advance(startAction(s, "tallow_candle"), 60_000);
    expect(state.inventory.tallow_candle).toBe(2);
    expect(state.inventory.tallow).toBe(1);
    expect(state.active).toBeNull();
    expect(report.stopped?.reason).toEqual({ kind: "missing_input", item: "tallow" });
  });

  it("refuses actions above the player's level", () => {
    expect(blockReason(newGame(T0, 1), "pick_mugwort")).toEqual({ kind: "level_too_low", level: ACTIONS.pick_mugwort.level });
  });

  it("does not bank XP past the level cap", () => {
    const s = startAction(newGame(T0, 1), "pick_nettle");
    const { state } = advance(s, 10 * HOUR);
    expect(skillLevel(state, "herbalism")).toBe(20);
    expect(state.skills.herbalism.xp).toBe(xpForLevel(20));
  });

  it("is deterministic for the same seed", () => {
    const s = startAction(newGame(T0, 42), "search_attic");
    expect(advance(s, HOUR).state.inventory).toEqual(advance(s, HOUR).state.inventory);
  });
});

describe("offline catch-up", () => {
  it("simulates time away up to the cap", () => {
    const s = startAction(newGame(T0, 1), "pick_nettle");
    const short = catchUp(s, T0 + HOUR);
    expect(short.capped).toBe(false);
    // An hour's worth at the base time, and a little more as Herbalism levels speed it up.
    const base = HOUR / (ACTION_DEFS.pick_nettle.seconds * 1000);
    expect(short.report.actionsCompleted).toBeGreaterThan(base);
    expect(short.report.actionsCompleted).toBeLessThan(base * 1.25);

    const long = catchUp(s, T0 + 48 * HOUR);
    expect(long.capped).toBe(true);
    expect(long.report.elapsedMs).toBe(24 * HOUR);
    expect(long.state.lastTickAt).toBe(T0 + 48 * HOUR);
  });
});

describe("save", () => {
  it("round-trips through an export string", () => {
    const { state } = advance(startAction(newGame(T0, 7), "sweep_hearth"), 60_000);
    expect(importSave(exportSave(state))).toEqual(state);
  });

  it("rejects garbage", () => {
    expect(() => importSave("not a save")).toThrow();
  });
});
