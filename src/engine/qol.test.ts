import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { PART_DEFS } from "../content/rite";
import { ITEM_CATEGORIES, ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { setSetting, start, type Result } from "./commands";
import { chanceBreakdown, effectiveOutputs, shortfall, revealedRecipes, bestXpAction, inputsLastMs, lookupItem, nextTrustAt, outputPerHour, producerAction, producingSkill, repsPerHour, timeToCapMs, timeToNextLevelMs, xpPerHour } from "./estimates";
import { catchUp } from "./offline";
import { actionDurationMs } from "./modifiers";
import { deserialize } from "./save";
import { advance, blockReason, fallbackFor, startAction } from "./simulate";
import { xpForLevel } from "./xp";
import { newGame, type GameState } from "./state";
import type { Step } from "./progress";

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

describe("salt relief", () => {
  const scav = (lvl: number, extra: Partial<GameState> = {}) => ({ ...open(), skills: { ...open().skills, scavenging: { xp: xpForLevel(lvl) } }, ...extra }) as GameState;
  const perRep = (s: GameState, id: "search_pantry" | "salt_barrel", item: string) => {
    const reps = repsPerHour(s, id);
    return outputPerHour(s, id).find((o) => o.item === item)!.perHour / reps;
  };

  it("the salt barrel gives salt every time, some tallow, and now and then bread", () => {
    expect(perRep(scav(7), "salt_barrel", "salt")).toBeCloseTo(1);
    expect(perRep(scav(7), "salt_barrel", "tallow")).toBeCloseTo(0.4);
    expect(perRep(scav(7), "salt_barrel", "bread")).toBeCloseTo(0.05);
    const { state } = advance(startAction(scav(7), "salt_barrel"), 4000 * 10);
    expect(state.inventory.salt).toBe(10);
  });

  it("the salt crock raises the pantry's salt from 50% to 75%; past 100% it's one for sure plus a chance of another", () => {
    expect(perRep(scav(1), "search_pantry", "salt")).toBeCloseTo(0.5);
    expect(perRep(scav(1, { upgrades: ["salt_crock"] }), "search_pantry", "salt")).toBeCloseTo(0.75);
    // With Deep shelves (×1.5) as well: 112.5%, so 1 salt and a 12.5% chance of a 2nd.
    const both = scav(3, { upgrades: ["salt_crock"], talents: { ...open().talents, scavenging: { 3: "b" } } } as Partial<GameState>);
    expect(perRep(both, "search_pantry", "salt")).toBeCloseTo(1.125);
    // 200 searches at 112.5%: never less than 1 each, about 225 in all.
    const { state } = advance(startAction(both, "search_pantry"), actionDurationMs(both, "search_pantry") * 200 + 1);
    expect(state.inventory.salt).toBeGreaterThanOrEqual(200);
    expect(state.inventory.salt).toBeLessThan(260);
  });
});

describe("what a recipe really gives", () => {
  it("applies find talents, projects and blessings to chances, bulk to quantities, and says what changed them", () => {
    const base = { ...open(), skills: { ...open().skills, scavenging: { xp: xpForLevel(6) } } } as GameState;
    expect(effectiveOutputs(base, "search_pantry")).toEqual([
      { item: "tallow", qty: 1, baseQty: 1, changedBy: [] },
      { item: "salt", qty: 1, baseQty: 1, chance: 0.5, baseChance: 0.5, changedBy: [] },
    ]);
    const built = { ...base, upgrades: ["salt_crock"], talents: { scavenging: { 3: "b", 6: "a" } } } as GameState;
    const [tallow, salt] = effectiveOutputs(built, "search_pantry");
    expect(tallow).toMatchObject({ qty: 2, changedBy: ["Full arms"] });
    expect(salt).toMatchObject({ chance: 1.125, changedBy: ["Deep shelves", "Sealed salt crock"] });
    const blessed = { ...base, buffs: [{ id: "still_night", endsAt: T0 + 60_000, skill: "scavenging" }] } as GameState;
    expect(effectiveOutputs(blessed, "search_pantry", T0)[1]).toMatchObject({ chance: 1, changedBy: ["Still Night"] });
  });
});

describe("chance bonuses apply to every chance find", () => {
  const charmed = (s: GameState) => ({ ...s, buffs: [{ id: "charm_window", endsAt: T0 + 60_000 }] }) as GameState;

  it("a charm on all finds raises charcoal (10% -> 15%), and names itself", () => {
    const s = charmed(open());
    const charcoal = effectiveOutputs(s, "sweep_hearth", T0).find((o) => o.item === "charcoal")!;
    expect(charcoal.chance).toBeCloseTo(0.15);
    expect(charcoal.changedBy).toEqual(["Window charm"]);
    expect(chanceBreakdown(s, "sweep_hearth", "charcoal", T0)).toEqual({ base: 0.1, factors: [{ source: "Window charm", mult: 1.5 }], chance: expect.closeTo(0.15) });
  });

  it("byproducts are chance finds too (Wick ash), shown on the recipe", () => {
    const s = { ...open(), skills: { ...open().skills, chandlery: { xp: xpForLevel(6) } }, talents: { chandlery: { 6: "b" } } } as GameState;
    const ash = effectiveOutputs(s, "tallow_candle").find((o) => o.item === "ash")!;
    expect(ash).toMatchObject({ baseChance: 0.33, byproductOf: "Wick ash" });
    expect(effectiveOutputs(charmed(s), "tallow_candle", T0).find((o) => o.item === "ash")!.chance).toBeCloseTo(0.495);
  });
});

describe("a part's checklist (shortfall)", () => {
  const ward = (extra: Partial<GameState> = {}) => ({ ...open(), skills: { ...open().skills, sigilcraft: { xp: xpForLevel(3) } }, ...extra }) as GameState;
  const shortOf = (s: GameState, item: string) => shortfall(s, "ward").short.find((l) => l.item === item)?.qty ?? 0;

  it("lists the part's items with have/need, and everything further down still to make", () => {
    const r = shortfall(ward(), "ward");
    expect(r.items.map((i) => [i.item, i.have, i.need, i.maker])).toEqual([
      ["salt_line", 0, 40, "salt_line"],
      ["ash_sigil", 0, 12, "ash_sigil"],
    ]);
    // 40 salt lines + 12 sigils: 52 salt; 12 sigils × 2 ash.
    expect(shortOf(ward(), "salt")).toBe(52);
    expect(shortOf(ward(), "ash")).toBe(24);
  });

  it("follows your talents: Fine ash halves the ash, Long lines halves the salt-line work", () => {
    expect(shortOf(ward({ talents: { sigilcraft: { 3: "b" } } }), "ash")).toBe(12);
    const long = { ...ward(), skills: { ...open().skills, sigilcraft: { xp: xpForLevel(6) } }, talents: { sigilcraft: { 3: "a", 6: "a" } } } as GameState;
    expect(shortOf(long, "salt")).toBe(20 + 12);
  });

  it("counts what you hold once, however many recipes want it", () => {
    const s = ward({ inventory: { salt_line: 10, salt: 30, ash: 4 } });
    expect(shortfall(s, "ward").items[0]).toMatchObject({ have: 10, need: 40 });
    expect(shortOf(s, "salt")).toBe(30 + 12 - 30);
    expect(shortOf(s, "ash")).toBe(20);
  });

  it("names the levels a recipe on the way still needs", () => {
    const s = { ...open(), skills: { ...open().skills, sigilcraft: { xp: 0 } } } as GameState;
    expect(shortfall(s, "ward").levels).toEqual([{ skill: "sigilcraft", level: 3, for: "ash_sigil" }]);
  });
});

describe("starting work", () => {
  it("refuses a recipe you haven't reached, even through a shortcut", () => {
    // Scavenging 1 with the drying rack wanting nails: the midden (level 6) can't start.
    const s = { ...newGame(T0, 21), notesRevealed: 2 };
    const r = start(s, "sift_midden");
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toContain("level 6");
    expect(producerAction(s, "iron_nail", () => true)).toBeNull();
  });

  it("refuses a recipe that's not on the list yet (not revealed), and starts one that is", () => {
    const s = { ...newGame(T0, 21), notesRevealed: 2, upgrades: ["drying_rack", "mended_shutters"], skills: { ...newGame().skills, scavenging: { xp: xpForLevel(8) } } } as GameState;
    expect(start(s, "sift_midden").ok).toBe(false);
    expect(okay(start(s, "search_pantry")).active?.id).toBe("search_pantry");
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
    // Tier 1 reached, tier 2 (level 3) next.
    expect(revealedRecipes(s, "chandlery")).toEqual(["tallow_candle", "beeswax_candle"]);
    // Sigilcraft has two tier-1 recipes; both show, and the tier-2 one after.
    expect(revealedRecipes(s, "sigilcraft")).toEqual(["salt_line", "sweep_hearth", "ash_sigil"]);
    const lvl5 = { ...s, skills: { ...s.skills, chandlery: { xp: xpForLevel(5) } } };
    expect(revealedRecipes(lvl5, "chandlery")).toEqual(["tallow_candle", "beeswax_candle", "hearth_candle"]);
    expect(revealedRecipes({ ...s, notesRevealed: 1 }, "chandlery")).toEqual([]);
  });

  it("hides recipes that need an ingredient from a skill not open yet", () => {
    // Chandlery 6 before Herbalism: hearth candles (St John's wort) wait for the Smoke.
    const s = { ...open(), notesRevealed: 3, skills: { ...open().skills, chandlery: { xp: xpForLevel(6) } } };
    expect(revealedRecipes(s, "chandlery")).toEqual(["tallow_candle", "beeswax_candle"]);
    expect(revealedRecipes({ ...s, notesRevealed: 4 }, "chandlery")).toEqual(["tallow_candle", "beeswax_candle", "hearth_candle", "juniper_incense"]);
  });

  it("always shows what the current stage asks for (a fresh game shows the pantry)", () => {
    expect(revealedRecipes(newGame(T0, 21), "scavenging")).toEqual(["search_pantry"]);
    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i]!;
      const maxed = { ...newGame(T0, 21), notesRevealed: i + 1, skills: Object.fromEntries(Object.keys(newGame().skills).map((k) => [k, { xp: xpForLevel(20) }])) as GameState["skills"] };
      for (const st of ("steps" in note ? note.steps : []) as readonly Step[]) {
        if (st.goal.kind === "complete") expect(revealedRecipes(maxed, ACTION_DEFS[st.goal.action].skill), st.id).toContain(st.goal.action);
      }
    }
  });

  it("hides a gatherer until something you can see uses what it finds", () => {
    // During the Light, with the projects that want nails built, nothing wants iron nails: the midden stays out of sight.
    const light = { ...newGame(T0, 21), notesRevealed: 2, upgrades: ["drying_rack", "mended_shutters"], skills: { ...newGame().skills, scavenging: { xp: xpForLevel(8) } } } as GameState;
    expect(revealedRecipes(light, "scavenging")).not.toContain("sift_midden");
  });

  it("a House project's needs give a gatherer a use (the drying rack wants iron nails)", () => {
    const light = { ...newGame(T0, 21), notesRevealed: 2, skills: { ...newGame().skills, scavenging: { xp: xpForLevel(6) } } };
    expect(revealedRecipes(light, "scavenging")).toContain("sift_midden");
  });

  it("lists recipes in level order: pantry, hives, midden, then the salt barrel (level 7)", () => {
    const s = { ...open(), skills: { ...open().skills, scavenging: { xp: xpForLevel(9) } } };
    expect(revealedRecipes(s, "scavenging").slice(0, 4)).toEqual(["search_pantry", "rob_hives", "sift_midden", "salt_barrel"]);
  });

  it("recipes can open between the usual every-3-levels steps (the salt barrel at 7)", () => {
    const at6 = { ...open(), skills: { ...open().skills, scavenging: { xp: xpForLevel(6) } } };
    // At 6 the barrel is the next recipe: it shows, but can't start yet.
    expect(revealedRecipes(at6, "scavenging")).toContain("salt_barrel");
    expect(blockReason(at6, "salt_barrel")).toEqual({ kind: "level_too_low", level: 7 });
  });

  it("skips recipes still in burnt pages", () => {
    const s = { ...open(), stats: { ...open().stats, completed: {} }, skills: { ...open().skills, sigilcraft: { xp: xpForLevel(5) } } };
    // Iron ward, chalk and the hearth ward are all in pages, so nothing is next yet.
    expect(revealedRecipes(s, "sigilcraft")).toEqual(["salt_line", "sweep_hearth", "ash_sigil"]);
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
    // Bread is bought, but the salt barrel sometimes turns some up too.
    expect(producingSkill("bread")).toBe("scavenging");
    expect(producingSkill("coin" as never)).toBeNull();
  });

  it("offers an action that can run, and only ones the player knows", () => {
    const s = open();
    // The hives need Scavenging 3: still offered, so the menu can say why it can't start yet.
    expect(producerAction(s, "beeswax", (id) => blockReason(s, id) === null)).toBe("rob_hives");
    expect(blockReason(s, "rob_hives")).toEqual({ kind: "level_too_low", level: ACTION_DEFS.rob_hives.level });
    const levelled = { ...s, skills: { ...s.skills, scavenging: { xp: xpForLevel(3) } } };
    expect(producerAction(levelled, "beeswax", (id) => blockReason(levelled, id) === null)).toBe("rob_hives");
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
