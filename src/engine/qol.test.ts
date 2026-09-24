import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { PART_DEFS } from "../content/rite";
import { ITEM_CATEGORIES, ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { setSetting, type Result } from "./commands";
import { revealedRecipes, bestXpAction, inputsLastMs, lookupItem, nextTrustAt, outputPerHour, producerAction, producingSkill, repsPerHour, timeToCapMs, timeToNextLevelMs, xpPerHour } from "./estimates";
import { catchUp } from "./offline";
import { deserialize } from "./save";
import { advance, blockReason, fallbackFor, startAction } from "./simulate";
import { xpForLevel } from "./xp";
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
    let s = advance(startAction(open(), "pick_nettle"), 3000).state;
    s = { ...s, inventory: { ...s.inventory, tallow: 4 } };
    const { state, report } = advance(startAction(s, "tallow_candle"), 3000 * 4);
    expect(report.stopped?.reason).toEqual({ kind: "missing_input", item: "tallow" });
    expect(report.fellBackTo).toEqual(["pick_nettle"]);
    expect(state.active?.id).toBe("pick_nettle");
  });

  it("keeps working through a whole offline stretch", () => {
    let s = advance(startAction(open(), "pick_nettle"), 3000).state;
    s = startAction({ ...s, inventory: { tallow: 2 } }, "tallow_candle");
    const { state } = catchUp(s, T0 + 3000 + 60 * 60_000);
    expect(state.active?.id).toBe("pick_nettle");
    expect(state.inventory.nettle ?? 0).toBeGreaterThan(1000);
  });

  it("can be set to stop, or to a specific action", () => {
    const s = advance(startAction(open(), "pick_nettle"), 3000).state;
    expect(fallbackFor(s, "tallow_candle")).toBe("pick_nettle");
    expect(fallbackFor(okay(setSetting(s, "fallback", "stop")), "tallow_candle")).toBeNull();
    expect(fallbackFor(okay(setSetting(s, "fallback", "search_pantry")), "tallow_candle")).toBe("search_pantry");
  });

  it("never falls back to something that can't run", () => {
    const s = okay(setSetting(open(), "fallback", "pick_mugwort")); // needs Herbalism 4
    expect(fallbackFor(s, "tallow_candle")).toBeNull();
  });
});

describe("estimates", () => {
  it("rates follow action time and bonuses", () => {
    const s = open();
    expect(repsPerHour(s, "pick_nettle")).toBe(3_600_000 / (ACTION_DEFS.pick_nettle.seconds * 1000));
    expect(xpPerHour(s, "pick_nettle")).toBe((3_600_000 / (ACTION_DEFS.pick_nettle.seconds * 1000)) * ACTION_DEFS.pick_nettle.xp);
    expect(outputPerHour(s, "sweep_hearth")).toEqual([
      { item: "ash", perHour: 1200 },
      { item: "charcoal", perHour: 120 },
    ]);
  });

  it("knows how long inputs last and when the next level comes", () => {
    const s = open({ inventory: { tallow: 7 } });
    expect(inputsLastMs(s, "tallow_candle")).toBe(3 * ACTION_DEFS.tallow_candle.seconds * 1000);
    expect(inputsLastMs(s, "pick_nettle")).toBeNull();
    expect(timeToNextLevelMs(s, "pick_nettle")).toBe(Math.ceil(xpForLevel(2) / ACTION_DEFS.pick_nettle.xp) * (ACTION_DEFS.pick_nettle.seconds * 1000));
  });

  it("picks the best action for time-to-cap", () => {
    const s = open({ skills: { ...newGame().skills, herbalism: { xp: xpForLevel(8) } } });
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
    expect(lookupItem(open(), "tallow_candle").inKindling).toBe(PART_DEFS.light.items.tallow_candle);
    expect(lookupItem({ ...open(), kindling: ["light"] }, "tallow_candle").inKindling).toBe(0);
  });

  it("hides recipes the player hasn't learned, or can't see yet", () => {
    const s = { ...open(), stats: { ...open().stats, completed: {} } };
    expect(lookupItem(s, "iron_nail").usedBy).not.toContain("iron_ward"); // still in a burnt page
    expect(lookupItem(open(), "stjohns").usedBy).not.toContain("hearth_candle"); // Chandlery 12, not next
  });
});

describe("recipe reveal", () => {
  it("shows what's reached plus whatever comes at the next level", () => {
    const s = open();
    // Beeswax candles and smudge bundles share level 2, so both show.
    expect(revealedRecipes(s, "chandlery")).toEqual(["tallow_candle", "smudge_bundle", "beeswax_candle"]);
    const lvl5 = { ...s, skills: { ...s.skills, chandlery: { xp: xpForLevel(5) } } };
    expect(revealedRecipes(lvl5, "chandlery")).toEqual(["tallow_candle", "smudge_bundle", "beeswax_candle", "mugwort_incense", "hearth_candle"]);
    expect(revealedRecipes({ ...s, notesRevealed: 1 }, "chandlery")).toEqual([]);
  });

  it("hides recipes that need an ingredient from a skill not open yet", () => {
    // Chandlery 6 before Herbalism: smudge (nettle), mugwort incense and hearth candles wait for the Smoke.
    const s = { ...open(), notesRevealed: 3, skills: { ...open().skills, chandlery: { xp: xpForLevel(6) } } };
    expect(revealedRecipes(s, "chandlery")).toEqual(["tallow_candle", "beeswax_candle"]);
    expect(revealedRecipes({ ...s, notesRevealed: 4 }, "chandlery")).toEqual(["tallow_candle", "smudge_bundle", "beeswax_candle", "mugwort_incense", "hearth_candle"]);
  });

  it("hides a gatherer until something you can see uses what it finds", () => {
    // During the Light, nothing wants ash yet, so sweeping stays out of sight; the Ward brings it.
    const light = { ...newGame(T0, 21), notesRevealed: 2, skills: { ...newGame().skills, scavenging: { xp: xpForLevel(5) } } };
    expect(revealedRecipes(light, "scavenging")).not.toContain("sweep_hearth");
    expect(revealedRecipes(light, "scavenging")).not.toContain("search_attic");
    expect(revealedRecipes({ ...light, notesRevealed: 3 }, "scavenging")).toContain("sweep_hearth");
    expect(revealedRecipes({ ...light, notesRevealed: 5 }, "scavenging")).toContain("search_attic");
  });

  it("skips recipes still in burnt pages", () => {
    const s = { ...open(), stats: { ...open().stats, completed: {} }, skills: { ...open().skills, sigilcraft: { xp: xpForLevel(5) } } };
    // Iron ward, chalk and the hearth ward are all in pages, so nothing is next yet.
    expect(revealedRecipes(s, "sigilcraft")).toEqual(["salt_line", "ash_sigil"]);
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
    // Sweeping needs Scavenging 3: still offered, so the menu can say why it can't start yet.
    expect(producerAction(s, "ash", (id) => blockReason(s, id) === null)).toBe("sweep_hearth");
    expect(blockReason(s, "sweep_hearth")).toEqual({ kind: "level_too_low", level: ACTION_DEFS.sweep_hearth.level });
    const levelled = { ...s, skills: { ...s.skills, scavenging: { xp: xpForLevel(3) } } };
    expect(producerAction(levelled, "ash", (id) => blockReason(levelled, id) === null)).toBe("sweep_hearth");
    const early = { ...open(), notesRevealed: 1 };
    expect(producerAction(early, "nettle", () => true)).toBeNull(); // Herbalism not unlocked yet
  });
});

describe("lookup teases and trust", () => {
  it("says when an unfound recipe uses an item, without naming it", () => {
    expect(lookupItem(open(), "glass").inUnfound).toBe(true);
    expect(lookupItem(open(), "juniper").inUnfound).toBe(false);
  });

  it("knows when better requests start, and hides gated ones", () => {
    expect(nextTrustAt(open({ trust: 0 }))).toBe(2);
    expect(nextTrustAt(open({ trust: 5 }))).toBeNull();
    expect(lookupItem(open({ trust: 0 }), "iron_ward").wantedBy).toEqual([]);
  });
});
