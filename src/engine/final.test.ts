import { describe, expect, it } from "vitest";
import { HEARTH_RITE } from "../content/rite";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { attune, beginRite, experiment, fillRequest, releaseOmen, setSetting, type Result } from "./commands";
import { addInsight } from "./grimoire";
import { catchUp } from "./offline";
import { deserialize, exportSave, importSave, serialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, SAVE_VERSION, type GameState } from "./state";
import { refillBoard } from "./village";

const T0 = 1_000_000;
const HOUR = 3_600_000;
const okay = (r: Result) => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};

/** A save with every system in use: notes, village, upgrades, omens, buffs, grimoire, rite. */
function everything(): GameState {
  const base = newGame(T0, 77);
  let s: GameState = {
    ...base,
    notesRevealed: NOTES.length - 1, // the rite note is current
    coin: 90,
    trust: 4.5,
    upgrades: ["omen_shelf", "reading_lamp"],
    omens: { still_night: 2 },
    stats: { ...base.stats, completed: { decipher_page: PAGES.length + 1, tallow_candle: 3 }, requestsFilled: 3 },
    inventory: { ...(HEARTH_RITE.items as Record<string, number>), nettle: 12, salt: 5, ash: 5, rags: 3 },
    skills: { ...base.skills, ritualism: { xp: 2000 } },
  };
  refillBoard(s, T0);
  addInsight(s, "dream_pillow", 6, "page");
  s = okay(attune(s, "dream_pillow"));
  s = okay(experiment(s, ["salt", "ash", "nettle"]));
  s = okay(releaseOmen(s, "still_night"));
  s = okay(setSetting(s, "grimoireAssist", true));
  s = okay(beginRite(s));
  return advance(s, 5 * 60_000).state;
}

describe("saves", () => {
  it("round-trip through an export string with every system populated", () => {
    const s = everything();
    expect(importSave(exportSave(s))).toEqual(s);
    expect(deserialize(serialize(s))).toEqual(s);
  });

  it("load from every older version and keep playing", () => {
    const current = everything();
    for (const version of [1, 2, 3]) {
      const old = { ...current, version } as Partial<GameState>;
      if (version < 3) {
        delete old.board;
        delete old.upgrades;
        delete old.omens;
        delete old.buffs;
        delete old.grimoire;
        delete old.rite;
        delete old.followers;
        delete old.settings;
      }
      const loaded = deserialize(JSON.stringify(old));
      expect(loaded.version).toBe(SAVE_VERSION);
      expect(() => catchUp(loaded, T0 + HOUR)).not.toThrow();
    }
  });

  it("refuse saves from a newer version", () => {
    expect(() => deserialize(JSON.stringify({ ...newGame(T0, 1), version: SAVE_VERSION + 1 }))).toThrow(/newer/);
  });
});

describe("performance", () => {
  it("catches up 36 hours offline in well under a second", () => {
    const base = newGame(T0, 5);
    let s: GameState = {
      ...base,
      notesRevealed: NOTES.length - 1,
      upgrades: ["mended_shutters"],
      stats: { ...base.stats, completed: { decipher_page: PAGES.length } },
      followers: ["janko"],
      inventory: { tallow: 500 },
    };
    s = advance(startAction(s, "sweep_hearth"), 3000).state; // so the fallback has somewhere to go
    s = startAction(s, "tallow_candle");
    const t = performance.now();
    const { report } = catchUp(s, T0 + 3000 + 40 * HOUR);
    const took = performance.now() - t;
    expect(report.elapsedMs).toBe(36 * HOUR);
    expect(report.actionsCompleted).toBeGreaterThan(40_000);
    expect(took).toBeLessThan(1000);
  });
});

describe("the village never jams", () => {
  it("a request the player can't fill can always be turned away and replaced", () => {
    const s = { ...newGame(T0, 3), notesRevealed: NOTES.length };
    refillBoard(s, T0);
    for (let i = 0; i < s.board.length; i++) expect(fillRequest(s, i).ok).toBe(false);
    const after = catchUp(s, T0 + 60_000).state;
    expect(after.board.every((b) => b.request !== null)).toBe(true);
  });
});
