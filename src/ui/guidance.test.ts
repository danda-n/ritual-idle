import { describe, expect, it } from "vitest";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { attune, experiment, type Result } from "../engine/commands";
import { addInsight, progressOf } from "../engine/grimoire";
import { newGame, type GameState } from "../engine/state";
import { circleStep, outcomeHelp, recipeGuide, recipeKnowledge } from "./guidance";

const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};
function open(extra: Partial<GameState> = {}): GameState {
  const b = newGame(1, 1);
  const s = { ...b, notesRevealed: NOTES.length, experimentsOpen: true, stats: { ...b.stats, completed: { decipher_page: PAGES.length } }, ...extra };
  addInsight(s, 3, "page");
  return s;
}

describe("Grimoire guidance", () => {
  it("before experiments open, says so", () => {
    const g = recipeGuide({ ...open(), experimentsOpen: false }, "dream_pillow");
    expect(g.action).toBeNull();
    expect(g.headline).toBe("Opens with experiments");
  });

  it("first step: try anything at the Circle", () => {
    expect(recipeGuide(open(), "dream_pillow").headline).toBe("Try any 3 things at the Circle, or buy a hint");
    expect(recipeGuide(open(), "dream_pillow").detail).toBe("1 glow per right item · wrong try +1 ✦");
  });

  it("after tries, tracks what's known and what's still possible", () => {
    let s = okay(attune(open({ inventory: { mugwort: 5, chamomile: 5, salt: 5, ash: 5, nettle: 5 } }), "dream_pillow"));
    s = okay(experiment(s, ["salt", "ash", "nettle"]));
    s = okay(experiment(s, ["mugwort", "chamomile", "salt"]));
    const k = recipeKnowledge(s, "dream_pillow");
    expect(k.belongs.sort()).toEqual(["chamomile", "mugwort"]);
    expect(k.stillPossible).not.toContain("salt");
    expect(recipeGuide(s, "dream_pillow").headline).toBe("2 of 3 known: find the last one");
    expect(recipeGuide(s, "dream_pillow").detail).toMatch(/swap one at a time/i);
  });

  it("when all are known, says to make it", () => {
    const s = open();
    s.grimoire.dream_pillow = { ...progressOf(s, "dream_pillow"), bought: { category: true, named: ["mugwort", "chamomile"] } };
    s.grimoire.dream_pillow!.provenRight = ["rags"];
    expect(recipeGuide(s, "dream_pillow").action).toBe("Make it at the Circle");
  });
});

describe("Circle guidance", () => {
  it("steps follow the player", () => {
    expect(circleStep(false, true, 0, 3)).toBe(1);
    expect(circleStep(true, true, 1, 3)).toBe(2);
    expect(circleStep(true, true, 3, 3)).toBe(3);
    expect(circleStep(false, false, 3, 3)).toBe(3);
    expect(circleStep(false, false, 2, 3)).toBe(2);
  });

  it("explains results", () => {
    expect(outcomeHelp({ kind: "glow", recipe: "dream_pillow", glows: 0, of: 3 })).toMatch(/crossed out/);
    // The glow count's honesty ("not which") and the advice to swap one at a time are logged choices (GRIMOIRE §9.2).
    expect(outcomeHelp({ kind: "glow", recipe: "dream_pillow", glows: 2, of: 3 })).toMatch(/2 of 3 right \(not which\) · swap one at a time/);
    expect(outcomeHelp({ kind: "glow", recipe: "dream_pillow", glows: 1, of: 3 })).toMatch(/not which.*swap one at a time/);
    expect(outcomeHelp({ kind: "almost" })).toBe("Two of those match a secret. Swap the third.");
    expect(outcomeHelp({ kind: "discovered", recipe: "dream_pillow" })).toMatch(/\+10% XP, all skills/);
  });
});
