import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { BUFFS } from "../content/buffs";
import { NOTES } from "../content/notes";
import { OMENS } from "../content/omens";
import { placePart, releaseOmen } from "./commands";
import { PART_DEFS, type PartId } from "../content/rite";
import { rewind } from "./devtools";
import { actionDurationMs, chanceMultiplier } from "./modifiers";
import { catchUp } from "./offline";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { xpForLevel } from "./xp";
import { newGame, type GameState } from "./state";

const T0 = 1_000_000;
const MIN = 60_000;

function open(extra: Partial<GameState> = {}): GameState {
  return { ...newGame(T0, 11), notesRevealed: NOTES.length, stats: { completed: { decipher_page: 6 }, requestsFilled: 1, omensSeen: 0, curiosRead: 0 }, ...extra };
}

function released(s: GameState): GameState {
  const r = releaseOmen(s, "still_night");
  if (!r.ok) throw new Error(r.reason);
  return r.state;
}

describe("content", () => {
  it("every action buff exists", () => {
    for (const a of Object.values(ACTION_DEFS)) if (a.buff) expect(BUFFS[a.buff as keyof typeof BUFFS]).toBeDefined();
  });
});

describe("omen drops", () => {
  it("drop at roughly 1 in 400 actions", () => {
    const s = open({ upgrades: ["omen_shelf"] });
    const { state, report } = advance(startAction(s, "pick_nettle"), 3000 * 8000);
    const seen = state.stats.omensSeen;
    expect(seen).toBeGreaterThan(8000 / 400 / 2);
    expect(seen).toBeLessThan((8000 / 400) * 2);
    expect(report.omensFound.length + report.omensLost).toBe(seen);
  });

  it("respect the shelf capacity; extras pass unseen", () => {
    const { state, report } = advance(startAction(open(), "pick_nettle"), 3000 * 8000);
    expect(state.omens.still_night).toBe(1);
    expect(report.omensLost).toBeGreaterThan(0);
  });

  it("the note that opens Scholarship gives the first Still Night", () => {
    const giftNote = NOTES.findIndex((n) => "gift" in n);
    expect(NOTES[giftNote]!.unlocks).toEqual(["scholarship"]);
    const prev = NOTES[giftNote - 1]!;
    if (!("goal" in prev) || prev.goal.kind !== "place") throw new Error("expected a place goal");
    const part = prev.goal.part as PartId;
    const s: GameState = { ...newGame(T0, 11), notesRevealed: giftNote, inventory: { ...PART_DEFS[part].items } };
    const r = placePart(s, part);
    if (!r.ok) throw new Error(r.reason);
    expect(r.gifts).toEqual(["still_night"]);
    expect(r.state.omens.still_night).toBe(1);
  });
});

describe("releasing Still Night", () => {
  it("speeds Scholarship and Ritualism by 50% for 15 minutes", () => {
    const s = released(open({ omens: { still_night: 1 } }));
    expect(s.omens.still_night).toBe(0);
    expect(actionDurationMs(s, "decipher_page")).toBeCloseTo(6000 / 1.5);
    expect(actionDurationMs(s, "bless_threshold")).toBeCloseTo(10000 / 1.5);
    expect(actionDurationMs(s, "pick_nettle")).toBe(3000);
    expect(actionDurationMs(s, "decipher_page", T0 + 15 * MIN)).toBe(6000);
  });

  it("doubles the burnt-page chance", () => {
    const s = released(open({ omens: { still_night: 1 } }));
    expect(chanceMultiplier(s, "burnt_page")).toBe(2);
    expect(chanceMultiplier(s, "rags")).toBe(1);
  });

  it("stacks duration when released twice", () => {
    const s = released(released(open({ omens: { still_night: 2 } })));
    expect(s.buffs).toEqual([{ id: "still_night", endsAt: T0 + 30 * MIN }]);
  });

  it("refuses with an empty shelf", () => {
    expect(releaseOmen(open(), "still_night").ok).toBe(false);
  });

  it("expires during offline catch-up", () => {
    const s = released(open({ omens: { still_night: 1 } }));
    expect(catchUp(s, T0 + 20 * MIN).state.buffs).toEqual([]);
  });

  it("is shifted by the dev time skip", () => {
    const s = released(open({ omens: { still_night: 1 } }));
    expect(rewind(s, 5 * MIN).buffs[0]!.endsAt).toBe(T0 + 10 * MIN);
  });
});

describe("Blessing (Smoke the rooms)", () => {
  const withSmudge = () => open({ inventory: { smudge: 10, tallow_candle: 10 }, skills: { ...newGame().skills, ritualism: { xp: xpForLevel(3) } } });

  it("applies a 15-minute speed buff instead of producing an item", () => {
    const took = actionDurationMs(withSmudge(), "smoke_rooms"); // a little under 12s at Ritualism 3
    const { state } = advance(startAction(withSmudge(), "smoke_rooms"), took);
    expect(state.buffs).toEqual([{ id: "blessing", endsAt: T0 + took + 15 * MIN }]);
    expect(actionDurationMs(state, "pick_nettle")).toBeCloseTo(3000 / 1.1);
  });

  it("refreshes rather than stacks when repeated", () => {
    const { state } = advance(startAction(withSmudge(), "smoke_rooms"), 3 * actionDurationMs(withSmudge(), "smoke_rooms"));
    expect(state.buffs).toHaveLength(1);
    expect(state.buffs[0]!.endsAt).toBeLessThanOrEqual(state.lastTickAt + BUFFS.blessing.durationMs);
  });
});

describe("saves", () => {
  it("drop items that no longer exist", () => {
    const old = { ...newGame(T0, 11), inventory: { ash: 3, blessing: 2 } };
    expect(deserialize(JSON.stringify(old)).inventory).toEqual({ ash: 3 });
  });

  it("keep omens and buffs", () => {
    const s = released(open({ omens: { still_night: 2 } }));
    const loaded = deserialize(JSON.stringify(s));
    expect(loaded.omens).toEqual({ still_night: 1 });
    expect(loaded.buffs).toEqual(s.buffs);
    expect(OMENS.still_night.buff).toBe("still_night");
  });
});
