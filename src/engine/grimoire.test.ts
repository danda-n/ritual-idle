import { describe, expect, it } from "vitest";
import { GRIMOIRE, INSIGHT, type GrimoireId } from "../content/grimoire";
import { ITEMS, type ItemId } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { REQUESTS } from "../content/requests";
import { attune, experiment, fillRequest, setSetting, type Result, type Success } from "./commands";
import { addInsight, deduce, fragmentTarget, hintTier, isDiscovered, isSilhouetteVisible, nextHintAt, plainNamesShown, progressOf } from "./grimoire";
import { offlineBonus, requestCoin, riteQualitySteps, trustMultiplier } from "./modifiers";
import { catchUp } from "./offline";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";

const T0 = 1_000_000;
const HOUR = 60 * 60 * 1000;

function open(extra: Partial<GameState> = {}): GameState {
  const base = newGame(T0, 5);
  return { ...base, notesRevealed: NOTES.length, stats: { ...base.stats, completed: { decipher_page: PAGES.length } }, ...extra };
}

function okay(r: Result): Success {
  if (!r.ok) throw new Error(r.reason);
  return r;
}

const plenty = (items: readonly ItemId[]) => Object.fromEntries(items.map((i) => [i, 10])) as Partial<Record<ItemId, number>>;
const withInsight = (s: GameState, id: GrimoireId, n: number) => {
  addInsight(s, id, n, "page");
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

describe("hint tiers", () => {
  it("escalate at 6 and 12 insight, then name one more ingredient every 6", () => {
    expect(hintTier(0)).toBe("riddle");
    expect(hintTier(INSIGHT.category)).toBe("category");
    expect(hintTier(INSIGHT.plain)).toBe("plain");
    expect(plainNamesShown("dream_pillow", 11)).toBe(0);
    expect(plainNamesShown("dream_pillow", 12)).toBe(1);
    expect(plainNamesShown("dream_pillow", 18)).toBe(2);
    expect(plainNamesShown("dream_pillow", 99)).toBe(2);
    expect(nextHintAt("dream_pillow", 0)).toBe(6);
    expect(nextHintAt("dream_pillow", 12)).toBe(18);
    expect(nextHintAt("dream_pillow", 18)).toBeNull();
  });

  it("Grimoire assist doubles insight", () => {
    const s = open({ settings: { grimoireAssist: true } });
    addInsight(s, "dream_pillow", 3, "page");
    expect(progressOf(s, "dream_pillow").insight).toBe(6);
  });
});

describe("fragments", () => {
  it("silhouettes appear with the first fragment, and go to the neediest recipe", () => {
    const s = open();
    expect(isSilhouetteVisible(s, "dream_pillow")).toBe(false);
    expect(fragmentTarget(s)).toBe("dream_pillow");
    withInsight(s, "dream_pillow", 3);
    expect(isSilhouetteVisible(s, "dream_pillow")).toBe(true);
    expect(fragmentTarget(s)).toBe("hearth_mark");
  });

  it("pages past the story ones carry fragments", () => {
    const s = open({ inventory: { burnt_page: 5, tallow_candle: 5 } });
    const { state, report } = advance(startAction(s, "decipher_page"), 3 * 6000);
    expect(report.fragments.map((f) => f.recipe)).toEqual(["dream_pillow", "hearth_mark", "threshold_nail"]);
    for (const id of ["dream_pillow", "hearth_mark", "threshold_nail"] as const) expect(progressOf(state, id).insight).toBe(3);
  });

  it("curios are read automatically and carry a fragment", () => {
    const s = open({ skills: { ...newGame().skills, scavenging: { xp: 5000 } } });
    const { state, report } = advance(startAction(s, "open_chest"), 5000 * 1000);
    expect(report.curioStories.length).toBeGreaterThan(0);
    expect(state.stats.curiosRead).toBe(report.curioStories.length);
    expect(report.fragments.every((f) => f.source === "curio")).toBe(true);
  });

  it("requests that mention a recipe carry a fragment and an aside", () => {
    const s = open({ trust: 0, inventory: { nettle: 10 } });
    s.board = [{ request: "hana_soup", refillAt: 0 }];
    const r = okay(fillRequest(s, 0));
    expect(r.aside).toBe(REQUESTS.hana_soup.mentions.aside);
    expect(progressOf(r.state, "dream_pillow").insight).toBe(2);
  });
});

describe("attuned experiments", () => {
  const attuned = (extra: Partial<GameState> = {}) =>
    okay(attune(withInsight(open({ inventory: plenty(["mugwort", "chamomile", "rags", "salt", "ash", "nettle"]), ...extra }), "dream_pillow", 3), "dream_pillow")).state;

  it("can't attune to a silhouette not yet seen", () => {
    expect(attune(open(), "dream_pillow").ok).toBe(false);
  });

  it("shows how many items glow, uses one of each, and gives consolation", () => {
    const r = okay(experiment(attuned(), ["mugwort", "nettle", "salt"]));
    expect(r.outcome).toEqual({ kind: "glow", recipe: "dream_pillow", glows: 1, of: 3 });
    expect(r.state.inventory.mugwort).toBe(9);
    expect(r.state.skills.ritualism.xp).toBeGreaterThan(0);
    expect(progressOf(r.state, "dream_pillow").insight).toBe(4);
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

  it("needs the circle to be open", () => {
    const s = { ...attuned(), notesRevealed: 3 };
    expect(experiment(s, ["mugwort", "chamomile", "rags"]).ok).toBe(false);
  });
});

describe("free experiments", () => {
  it("find secrets that have no hints", () => {
    const s = open({ inventory: plenty(["nettle", "salt", "bread"]) });
    const r = okay(experiment(s, ["bread", "nettle", "salt"]));
    expect(r.outcome).toEqual({ kind: "discovered", recipe: "hanas_soup" });
  });

  it("flicker when two items match a secret, and say nothing otherwise", () => {
    const s = open({ inventory: plenty(["nettle", "salt", "ash", "rags"]) });
    expect(okay(experiment(s, ["nettle", "salt", "ash"])).outcome).toEqual({ kind: "almost" });
    expect(okay(experiment(s, ["rags", "ash"])).outcome).toEqual({ kind: "nothing" });
  });

  it("also find hidden recipes on an exact match", () => {
    const s = open({ inventory: plenty(["ash", "charcoal", "salt"]) });
    expect(okay(experiment(s, ["ash", "charcoal", "salt"])).outcome).toEqual({ kind: "discovered", recipe: "hearth_mark" });
  });
});

describe("rewards", () => {
  const discover = (s: GameState, id: GrimoireId) => ({ ...s, grimoire: { ...s.grimoire, [id]: { ...progressOf(s, id), discovered: true } } });

  it("Dream pillow makes time away count 10% extra", () => {
    const s = discover(startAction(open(), "pick_nettle"), "dream_pillow");
    expect(offlineBonus(s)).toBeCloseTo(0.1);
    expect(catchUp(s, T0 + HOUR).report.elapsedMs).toBeCloseTo(1.1 * HOUR);
  });

  it("Hearth mark adds a rite quality step", () => {
    expect(riteQualitySteps(discover(open(), "hearth_mark"))).toBe(1);
  });

  it("Threshold nail multiplies trust gains", () => {
    const s = discover(open({ inventory: { nettle: 10 } }), "threshold_nail");
    expect(trustMultiplier(s)).toBe(1.5);
    s.board = [{ request: "hana_soup", refillAt: 0 }];
    expect(okay(fillRequest(s, 0)).state.trust).toBe(1.5);
  });

  it("Hana's soup doubles Hana's pay only", () => {
    const s = discover(open(), "hanas_soup");
    expect(requestCoin(s, REQUESTS.hana_soup)).toBe(12);
    expect(requestCoin(s, REQUESTS.millers_cough)).toBe(12);
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
