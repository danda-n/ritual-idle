import { describe, expect, it } from "vitest";
import { GRIMOIRE, INSIGHT_COST, INSIGHT_GAIN, type GrimoireId } from "../content/grimoire";
import { ITEMS, type ItemId } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { REQUESTS } from "../content/requests";
import { attune, bindCharm, buyHint, experiment, deliver, setSetting, useCharm, type Result, type Success } from "./commands";
import { charmFor } from "../content/charms";
import { producingSkill } from "./estimates";
import { addInsight, deduce, hintCost, isDiscovered, isSilhouetteVisible, progressOf } from "./grimoire";
import { actionDurationMs, chanceMultiplier, offlineBonus, requestCoin, riteQualitySteps, saveChance, speedMultiplier, trustMultiplier, xpBonus } from "./modifiers";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";

const T0 = 1_000_000;

function open(extra: Partial<GameState> = {}): GameState {
  const base = newGame(T0, 5);
  return { ...base, notesRevealed: NOTES.length, experimentsOpen: true, stats: { ...base.stats, completed: { decipher_page: PAGES.length } }, ...extra };
}

function okay(r: Result): Success {
  if (!r.ok) throw new Error(r.reason);
  return r;
}

const plenty = (items: readonly ItemId[]) => Object.fromEntries(items.map((i) => [i, 10])) as Partial<Record<ItemId, number>>;
const withInsight = (s: GameState, _id: GrimoireId, n: number) => {
  addInsight(s, n, "page");
  return s;
};

describe("content", () => {
  it("uses real, distinct items and plain hints drawn from the ingredients", () => {
    for (const [id, g] of Object.entries(GRIMOIRE)) {
      expect(new Set(g.ingredients).size, id).toBe(g.ingredients.length);
      for (const i of g.ingredients) expect(ITEMS[i], `${id}: ${i}`).toBeDefined();
      if ("hints" in g) {
        expect(g.hints.category).toHaveLength(g.ingredients.length);
        for (const p of g.hints.plain) expect(g.ingredients as readonly string[]).toContain(p);
      }
    }
  });
});

describe("spending insight on hints", () => {
  it("buys a recipe's categories, then its names one at a time, for their cost", () => {
    const s = open({ insight: INSIGHT_COST.category + 2 * INSIGHT_COST.name });
    const a = okay(buyHint(s, "dream_pillow", "category")).state;
    expect(progressOf(a, "dream_pillow").bought.category).toBe(true);
    expect(a.insight).toBe(2 * INSIGHT_COST.name);
    expect(buyHint(a, "dream_pillow", "category").ok).toBe(false); // already bought
    const b = okay(buyHint(okay(buyHint(a, "dream_pillow", "name")).state, "dream_pillow", "name")).state;
    expect(progressOf(b, "dream_pillow").bought.named).toEqual(GRIMOIRE.dream_pillow.hints.plain);
    expect(b.insight).toBe(0);
    expect(hintCost(b, "dream_pillow", "name")).toBeNull(); // the last one is yours to find
  });

  it("refuses when short, and says how short", () => {
    const r = buyHint(open({ insight: 1 }), "dream_pillow", "name");
    expect(!r.ok && r.reason).toMatch(/Needs 6 insight/);
  });

  it("reads a secret's clues in order", () => {
    const s = okay(buyHint(open({ insight: 99 }), "honey_light", "clue")).state;
    expect(progressOf(s, "honey_light").clues).toBe(1);
    expect(hintCost(s, "dream_pillow", "clue")).toBeNull(); // hidden recipes have no clues
    let t = s;
    for (let i = 1; i < GRIMOIRE.honey_light.clues.length; i++) t = okay(buyHint(t, "honey_light", "clue")).state;
    expect(hintCost(t, "honey_light", "clue")).toBeNull();
  });

  it("Grimoire assist doubles insight gains", () => {
    const s = open({ settings: { ...newGame().settings, grimoireAssist: true } });
    addInsight(s, 3, "page");
    expect(s.insight).toBe(6);
  });
});

describe("older saves", () => {
  it("pool each recipe's old insight, and keep the hints it had shown as bought", () => {
    const old = { ...open(), version: 6, insight: undefined, grimoire: { dream_pillow: { insight: 13, discovered: false, attempts: [], provenWrong: [], provenRight: [], marks: {} }, hearth_mark: { insight: 4, discovered: false, attempts: [], provenWrong: [], provenRight: [], marks: {} } } };
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.insight).toBe(17);
    expect(loaded.grimoire.dream_pillow?.bought).toEqual({ category: true, named: ["mugwort"] });
    expect(loaded.grimoire.hearth_mark?.bought).toEqual({ category: false, named: [] });
    expect("insight" in loaded.grimoire.dream_pillow!).toBe(false);
  });
});

describe("insight sources", () => {
  it("hidden recipes show once experiments are open", () => {
    expect(isSilhouetteVisible({ ...open(), experimentsOpen: false }, "dream_pillow")).toBe(false);
    expect(isSilhouetteVisible(open(), "dream_pillow")).toBe(true);
    expect(isSilhouetteVisible(open(), "honey_light")).toBe(false); // secrets never show as shapes
  });

  it("pages past the story ones bring insight", () => {
    const s = open({ inventory: { burnt_page: 5, tallow_candle: 5 }, skills: { ...newGame().skills, scholarship: { xp: xpForLevel(3) } } });
    const { state, report } = advance(startAction(s, "decipher_page"), 3 * actionDurationMs(s, "decipher_page") + 1);
    expect(report.fragments.map((f) => f.source)).toEqual(["page", "page", "page"]);
    expect(state.insight).toBe(3 * INSIGHT_GAIN.page);
  });

  it("curios are read automatically and carry a fragment", () => {
    const s = open({ skills: { ...newGame().skills, scavenging: { xp: xpForLevel(20) } } });
    const { state, report } = advance(startAction(s, "open_chest"), 5000 * 1000);
    expect(report.curioStories.length).toBeGreaterThan(0);
    expect(state.stats.curiosRead).toBe(report.curioStories.length);
    expect(report.fragments.every((f) => f.source === "curio")).toBe(true);
  });

  it("requests that mention a recipe carry a fragment and an aside", () => {
    const s = open({ trust: 0, inventory: { ...REQUESTS.hana_soup.needs } });
    s.board = [{ request: "hana_soup", refillAt: 0, delivered: {} }];
    const r = okay(deliver(s, 0));
    expect(r.aside).toBe(REQUESTS.hana_soup.mentions.aside);
    expect(r.state.insight).toBe(INSIGHT_GAIN.request);
  });

  it("keeps what the villager said on the recipe's page", () => {
    const s = open({ trust: 0, inventory: { ...REQUESTS.hana_soup.needs } });
    s.board = [{ request: "hana_soup", refillAt: 0, delivered: {} }];
    const r = okay(deliver(s, 0));
    expect(r.state.grimoire.dream_pillow?.heard).toBe(true);
    expect(deserialize(JSON.stringify(r.state)).grimoire.dream_pillow?.heard).toBe(true);
  });
});

describe("attuned experiments", () => {
  const attuned = (extra: Partial<GameState> = {}) =>
    okay(attune(withInsight(open({ inventory: plenty(["mugwort", "chamomile", "rags", "salt", "ash", "nettle"]), ...extra }), "dream_pillow", 3), "dream_pillow")).state;

  it("can't attune before experiments open", () => {
    expect(attune({ ...open(), experimentsOpen: false }, "dream_pillow").ok).toBe(false);
  });

  it("shows how many items glow, uses one of each, and gives consolation", () => {
    const r = okay(experiment(attuned(), ["mugwort", "nettle", "salt"]));
    expect(r.outcome).toEqual({ kind: "glow", recipe: "dream_pillow", glows: 1, of: 3 });
    expect(r.state.inventory.mugwort).toBe(9);
    expect(r.state.skills.ritualism.xp).toBeGreaterThan(0);
    expect(r.state.insight).toBe(3 + INSIGHT_GAIN.failedAttempt);
    expect(progressOf(r.state, "dream_pillow").attempts).toEqual([{ items: ["mugwort", "nettle", "salt"], glows: 1 }]);
  });

  it("crosses out every item in a zero-glow attempt", () => {
    const r = okay(experiment(attuned(), ["salt", "ash", "nettle"]));
    expect(progressOf(r.state, "dream_pillow").provenWrong.sort()).toEqual(["ash", "nettle", "salt"]);
  });

  it("proves items right when the logic forces it", () => {
    const s1 = okay(experiment(attuned(), ["salt", "ash", "nettle"])).state;
    const s2 = okay(experiment(s1, ["mugwort", "chamomile", "salt"])).state;
    expect(progressOf(s2, "dream_pillow").provenRight.sort()).toEqual(["chamomile", "mugwort"]);
  });

  it("discovers the recipe on an exact match, in any order", () => {
    const r = okay(experiment(attuned(), ["rags", "mugwort", "chamomile"]));
    expect(r.outcome).toEqual({ kind: "discovered", recipe: "dream_pillow" });
    expect(isDiscovered(r.state, "dream_pillow")).toBe(true);
    expect(r.state.attunedTo).toBeNull();
  });

  it("rejects wrong counts, repeats and missing items", () => {
    const s = attuned();
    expect(experiment(s, ["mugwort", "rags"]).ok).toBe(false);
    expect(experiment(s, ["mugwort", "mugwort", "rags"]).ok).toBe(false);
    expect(experiment(s, ["mugwort", "rags", "glass"]).ok).toBe(false);
  });

  it("needs experiments to be open", () => {
    const s = { ...attuned(), experimentsOpen: false };
    expect(experiment(s, ["mugwort", "chamomile", "rags"]).ok).toBe(false);
    expect(attune(s, "dream_pillow").ok).toBe(false);
  });
});

describe("free experiments", () => {
  it("find secrets that have no hints", () => {
    const s = open({ inventory: plenty(["nettle", "salt", "bread"]) });
    const r = okay(experiment(s, ["bread", "nettle", "salt"]));
    expect(r.outcome).toEqual({ kind: "discovered", recipe: "hanas_soup" });
  });

  it("flicker when two items match a secret, and say nothing otherwise", () => {
    const s = open({ inventory: plenty(["nettle", "salt", "ash", "rags", "glass"]) });
    expect(okay(experiment(s, ["nettle", "salt", "ash"])).outcome).toEqual({ kind: "almost" });
    expect(okay(experiment(s, ["rags", "ash", "glass"])).outcome).toEqual({ kind: "nothing" });
    expect(experiment(s, ["rags", "ash"]).ok).toBe(false); // free experiments take exactly 3
  });

  it("also find hidden recipes on an exact match", () => {
    const s = open({ inventory: plenty(["ash", "charcoal", "salt"]) });
    expect(okay(experiment(s, ["ash", "charcoal", "salt"])).outcome).toEqual({ kind: "discovered", recipe: "hearth_mark" });
  });
});

describe("rewards", () => {
  const discover = (s: GameState, id: GrimoireId) => ({ ...s, grimoire: { ...s.grimoire, [id]: { ...progressOf(s, id), discovered: true } } });

  it("the Window charm speeds up every skill; the Dream pillow adds XP everywhere (no longer offline)", () => {
    const base = open();
    const w = discover(base, "window_charm");
    expect(speedMultiplier(w, "pick_nettle") / speedMultiplier(base, "pick_nettle")).toBeCloseTo(1.1);
    expect(speedMultiplier(w, "tallow_candle") / speedMultiplier(base, "tallow_candle")).toBeCloseTo(1.1);
    const d = discover(base, "dream_pillow");
    expect(xpBonus(d, "pick_nettle")).toBeCloseTo(0.1);
    expect(offlineBonus(d)).toBe(0);
  });

  it("the Hearth mark also speeds up Sigilcraft", () => {
    const base = open();
    const m = discover(base, "hearth_mark");
    expect(speedMultiplier(m, "salt_line") / speedMultiplier(base, "salt_line")).toBeCloseTo(1.1);
    expect(speedMultiplier(m, "pick_nettle")).toBe(speedMultiplier(base, "pick_nettle"));
  });

  it("Hearth mark adds a rite quality step", () => {
    expect(riteQualitySteps(discover(open(), "hearth_mark"))).toBe(1);
  });

  it("Threshold nail multiplies trust gains", () => {
    const s = discover(open({ inventory: { ...REQUESTS.hana_soup.needs } }), "threshold_nail");
    expect(trustMultiplier(s)).toBe(2);
    s.board = [{ request: "hana_soup", refillAt: 0, delivered: {} }];
    expect(okay(deliver(s, 0)).state.trust).toBe(2);
  });

  it("Hana's soup doubles Hana's pay only", () => {
    const s = discover(open(), "hanas_soup");
    expect(requestCoin(s, REQUESTS.hana_soup)).toBe(REQUESTS.hana_soup.coin * 2);
    expect(requestCoin(s, REQUESTS.millers_cough)).toBe(REQUESTS.millers_cough.coin);
  });
});

describe("settings and saves", () => {
  it("setSetting changes one setting", () => {
    expect(okay(setSetting(open(), "grimoireAssist", true)).state.settings.grimoireAssist).toBe(true);
  });

  it("grimoire progress round-trips", () => {
    const s = okay(experiment(okay(attune(withInsight(open({ inventory: plenty(["salt", "ash", "nettle"]) }), "dream_pillow", 3), "dream_pillow")).state, ["salt", "ash", "nettle"])).state;
    const loaded = deserialize(JSON.stringify(s));
    expect(loaded.grimoire).toEqual(s.grimoire);
    expect(loaded.attunedTo).toBe("dream_pillow");
  });

  it("deduce is stable on an empty log", () => {
    const p = progressOf(open(), "dream_pillow");
    deduce(p);
    expect(p.provenWrong).toEqual([]);
  });
});

describe("charms (bound again and again from a discovered recipe)", () => {
  const discover = (s: GameState, id: GrimoireId) => ({ ...s, grimoire: { ...s.grimoire, [id]: { ...progressOf(s, id), discovered: true } } });
  const found = (id: GrimoireId, inventory: Partial<Record<ItemId, number>> = {}) => ({ ...discover(open(), id), inventory }) as GameState;
  const ok = (r: Result) => {
    if (!r.ok) throw new Error(r.reason);
    return r.state;
  };

  it("bind at once from its bind cost, only once its recipe is discovered", () => {
    const cost = { tallow_candle: 3, glass: 2, salt: 4 };
    expect(bindCharm({ ...open(), inventory: cost }, "charm_window").ok).toBe(false);
    const s = ok(bindCharm(found("window_charm", { ...cost, tallow_candle: 4 }), "charm_window"));
    expect(s.inventory).toMatchObject({ tallow_candle: 1, glass: 0, salt: 0, charm_window: 1 });
    expect(bindCharm(s, "charm_window").ok).toBe(false);
  });

  it("a charm lasts a number of actions, not a time; using another adds its uses", () => {
    let s = ok(useCharm(found("dream_pillow", { charm_pillow: 2 }), "charm_pillow"));
    expect(s.charms.charm_pillow).toBe(100);
    expect(xpBonus(s, "pick_nettle")).toBeCloseTo(0.1 + 0.25);
    // Ten nettles: ten uses spent. Time alone spends nothing.
    s = advance(startAction(s, "pick_nettle"), actionDurationMs(s, "pick_nettle") * 10 + 1).state;
    expect(s.charms.charm_pillow).toBe(90);
    s = ok(useCharm(s, "charm_pillow"));
    expect(s.charms.charm_pillow).toBe(190);
    expect(useCharm(s, "charm_pillow").ok).toBe(false);
  });

  it("each charm's boost: finds, inputs saved on crafts only, contracts (counted per contract)", () => {
    const w = ok(useCharm(found("window_charm", { charm_window: 1 }), "charm_window"));
    expect(chanceMultiplier(w, "salt", T0)).toBeCloseTo(1.5);
    const m = ok(useCharm(found("hearth_mark", { charm_mark: 1 }), "charm_mark"));
    expect(saveChance(m, "tallow_candle", T0)).toBeCloseTo(0.25);
    // A gathering action doesn't spend a craft charm.
    const swept = advance(startAction(m, "sweep_hearth"), actionDurationMs(m, "sweep_hearth") * 3 + 1).state;
    expect(swept.charms.charm_mark).toBe(40);
    const n = ok(useCharm(found("threshold_nail", { charm_nail: 1 }), "charm_nail"));
    expect(requestCoin(n, REQUESTS.grave_candles)).toBe(Math.round(REQUESTS.grave_candles.coin * 1.5));
    expect(trustMultiplier(n)).toBeCloseTo(2 * 1.5);
    expect(n.charms.charm_nail).toBe(3);
  });

  it("the nail's uses go one per finished contract", () => {
    const n = ok(useCharm(found("threshold_nail", { charm_nail: 1, tallow_candle: 12 }), "charm_nail"));
    const s = { ...n, notesRevealed: NOTES.length, board: [{ request: "grave_candles", refillAt: 0, delivered: {} }] } as GameState;
    const r = deliver(s, 0);
    if (!r.ok) throw new Error(r.reason);
    expect(r.state.charms.charm_nail).toBe(2);
  });

  it("every hidden recipe teaches a charm", () => {
    for (const id of Object.keys(GRIMOIRE) as GrimoireId[]) if (GRIMOIRE[id].kind === "hidden") expect(charmFor(id), id).not.toBeNull();
  });
});

describe("the first experiment", () => {
  it("the Window charm is made from what every path has when experiments open (the Words stage)", () => {
    // The Light (Chandlery), the Words (Scholarship) and Scavenging are open by then, in any order.
    for (const i of GRIMOIRE.window_charm.ingredients) expect(["scavenging", "chandlery", "scholarship"], i).toContain(producingSkill(i));
  });

  it("the one ingredient never named gets a nudge you can buy, not its name", () => {
    const s = { ...open(), insight: 20 };
    for (const id of Object.keys(GRIMOIRE) as GrimoireId[]) {
      const h = (GRIMOIRE[id] as { hints?: { close?: string; plain: readonly string[] } }).hints;
      if (!h) continue;
      expect(h.close, id).toBeTruthy();
      const unnamed = GRIMOIRE[id].ingredients.find((i) => !h.plain.includes(i))!;
      expect(h.close!.toLowerCase(), id).not.toContain(ITEMS[unnamed].name.toLowerCase());
    }
    expect(hintCost(s, "window_charm", "close")).toBe(INSIGHT_COST.close);
    const bought = buyHint(s, "window_charm", "close");
    if (!bought.ok) throw new Error(bought.reason);
    expect(progressOf(bought.state, "window_charm").bought.close).toBe(true);
    expect(hintCost(bought.state, "window_charm", "close")).toBeNull();
  });
});
