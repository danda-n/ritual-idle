import { describe, expect, it } from "vitest";
import { ITEM_CATEGORIES, ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { setSetting, type Result } from "./commands";
import { bestXpAction, inputsLastMs, lookupItem, outputPerHour, producerAction, producingSkill, repsPerHour, timeToCapMs, timeToNextLevelMs, xpPerHour } from "./estimates";
import { catchUp } from "./offline";
import { deserialize } from "./save";
import { advance, blockReason, fallbackFor, startAction } from "./simulate";
import { newGame, type GameState } from "./state";

const T0 = 1_000_000;

function open(extra: Partial<GameState> = {}): GameState {
  const base = newGame(T0, 21);
  return { ...base, notesRevealed: NOTES.length, stats: { ...base.stats, completed: { decipher_page: PAGES.length } }, ...extra };
}
const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};

describe("content", () => {
  it("every item has a known category", () => {
    for (const [id, item] of Object.entries(ITEMS)) expect(item.category in ITEM_CATEGORIES, id).toBe(true);
  });
});

describe("fallback when work stops", () => {
  it("goes back to the last gathering action by default", () => {
    let s = advance(startAction(open(), "sweep_hearth"), 3000).state;
    s = { ...s, inventory: { ...s.inventory, tallow: 4 } };
    const { state, report } = advance(startAction(s, "tallow_candle"), 3000 * 4);
    expect(report.stopped?.reason).toEqual({ kind: "missing_input", item: "tallow" });
    expect(report.fellBackTo).toEqual(["sweep_hearth"]);
    expect(state.active?.id).toBe("sweep_hearth");
  });

  it("keeps working through a whole offline stretch", () => {
    let s = advance(startAction(open(), "sweep_hearth"), 3000).state;
    s = startAction({ ...s, inventory: { tallow: 2 } }, "tallow_candle");
    const { state } = catchUp(s, T0 + 3000 + 60 * 60_000);
    expect(state.active?.id).toBe("sweep_hearth");
    expect(state.inventory.ash ?? 0).toBeGreaterThan(1000);
  });

  it("can be set to stop, or to a specific action", () => {
    const s = advance(startAction(open(), "sweep_hearth"), 3000).state;
    expect(fallbackFor(s, "tallow_candle")).toBe("sweep_hearth");
    expect(fallbackFor(okay(setSetting(s, "fallback", "stop")), "tallow_candle")).toBeNull();
    expect(fallbackFor(okay(setSetting(s, "fallback", "pick_nettle")), "tallow_candle")).toBe("pick_nettle");
  });

  it("never falls back to something that can't run", () => {
    const s = okay(setSetting(open(), "fallback", "pick_mugwort")); // needs Herbalism 10
    expect(fallbackFor(s, "tallow_candle")).toBeNull();
  });
});

describe("estimates", () => {
  it("rates follow action time and bonuses", () => {
    const s = open();
    expect(repsPerHour(s, "pick_nettle")).toBe(1200);
    expect(xpPerHour(s, "pick_nettle")).toBe(6000);
    expect(outputPerHour(s, "sweep_hearth")).toEqual([
      { item: "ash", perHour: 1200 },
      { item: "charcoal", perHour: 120 },
    ]);
  });

  it("knows how long inputs last and when the next level comes", () => {
    const s = open({ inventory: { tallow: 7 } });
    expect(inputsLastMs(s, "tallow_candle")).toBe(3 * 3000);
    expect(inputsLastMs(s, "pick_nettle")).toBeNull();
    expect(timeToNextLevelMs(s, "pick_nettle")).toBe(5 * 3000); // 25 xp at 5 per nettle
  });

  it("picks the best action for time-to-cap", () => {
    const s = open({ skills: { ...newGame().skills, herbalism: { xp: 700 } } });
    expect(bestXpAction(s, "herbalism")).not.toBe("pick_nettle");
    expect(timeToCapMs(s, "herbalism")).toBeGreaterThan(0);
  });
});

describe("item lookup", () => {
  it("shows where an item comes from and where it goes", () => {
    const l = lookupItem(open(), "tallow");
    expect(l.madeBy).toEqual(["search_pantry"]);
    expect(l.usedBy).toEqual(["tallow_candle"]);
    expect(l.sold).toBe(true);
  });

  it("knows the rite and the village want things", () => {
    const l = lookupItem(open(), "tallow_candle");
    expect(l.wantedBy).toContain("Old Tomas");
    expect(lookupItem(open(), "hearth_candle").inRite).toBe(7);
  });

  it("hides recipes the player hasn't learned", () => {
    const s = { ...open(), stats: { ...open().stats, completed: {} } };
    expect(lookupItem(s, "chamomile").usedBy).not.toContain("smudge_bundle");
  });
});

describe("settings", () => {
  it("fill in for older saves", () => {
    const old = { ...newGame(T0, 21), settings: { grimoireAssist: true } };
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.settings).toEqual({ ...newGame().settings, grimoireAssist: true });
  });
});

describe("producers (for item chips)", () => {
  it("knows which skill makes an item", () => {
    expect(producingSkill("tallow")).toBe("scavenging");
    expect(producingSkill("tallow_candle")).toBe("chandlery");
    expect(producingSkill("bread")).toBeNull();
  });

  it("offers an action that can run, and only ones the player knows", () => {
    const s = open();
    // The pantry needs Scavenging 2: still offered, so the menu can say why it can't start yet.
    expect(producerAction(s, "tallow", (id) => blockReason(s, id) === null)).toBe("search_pantry");
    expect(blockReason(s, "search_pantry")).toEqual({ kind: "level_too_low", level: 2 });
    const levelled = { ...s, skills: { ...s.skills, scavenging: { xp: 100 } } };
    expect(producerAction(levelled, "tallow", (id) => blockReason(levelled, id) === null)).toBe("search_pantry");
    const early = { ...open(), notesRevealed: 1 };
    expect(producerAction(early, "nettle", () => true)).toBeNull(); // Herbalism not unlocked yet
  });
});
