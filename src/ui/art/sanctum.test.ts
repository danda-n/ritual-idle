import { describe, expect, it } from "vitest";
import { newGame, type GameState } from "../../engine/state";
import { describeSanctum, sanctumView } from "./Sanctum";

const base = () => newGame(1_000_000, 1);
const withDone = (s: GameState, done: Record<string, number>) => ({ ...s, stats: { ...s.stats, completed: { ...s.stats.completed, ...done } } });

describe("the sanctum follows real progress", () => {
  it("starts cold and dark", () => {
    const v = sanctumView(base());
    expect(v.lit || v.salted || v.circleAwake || v.cellarOpen).toBe(false);
    expect(describeSanctum(v)).toMatch(/cold and dark/);
  });

  it("lights up with the first candle, then wards and wakes in order", () => {
    expect(sanctumView(withDone(base(), { tallow_candle: 1 })).lit).toBe(true);
    const warded = sanctumView(withDone(base(), { tallow_candle: 1, salt_line: 1 }));
    expect(describeSanctum(warded)).toMatch(/salt/);
    expect(sanctumView({ ...base(), kindling: ["light"] }).circleAwake).toBe(false);
    expect(sanctumView({ ...base(), kindling: ["light", "ward"] }).circleAwake).toBe(true);
  });

  it("opens the cellar and seats Janko after the rite", () => {
    const s = { ...base(), rite: { primed: false, performing: null, completed: { quality: 2, endingSeen: true } }, followers: ["janko" as const] };
    const v = sanctumView(s);
    expect(v.cellarOpen && v.janko && v.cloth).toBe(true);
    expect(describeSanctum(v)).toMatch(/cellar/);
  });

  it("shows upgrades and stored omens", () => {
    const v = sanctumView({ ...base(), upgrades: ["drying_rack", "reading_lamp", "omen_shelf"], omens: { still_night: 2 } });
    expect([v.rack, v.lamp, v.shelf, v.omens]).toEqual([true, true, true, 2]);
  });
});
