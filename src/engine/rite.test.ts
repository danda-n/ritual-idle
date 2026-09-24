import { describe, expect, it } from "vitest";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { HEARTH_RITE, QUALITIES } from "../content/rite";
import type { ItemId } from "../content/items";
import { beginRite, dismissEnding, primeRite, releaseOmen, type Result } from "./commands";
import { progressOf } from "./grimoire";
import { actionDurationMs, requestCoin } from "./modifiers";
import { catchUp } from "./offline";
import { currentNote, isRiteRevealed } from "./progress";
import { REQUESTS } from "../content/requests";
import { riteLog, riteQuality, riteShortfall } from "./rite";
import { deserialize } from "./save";
import { advance, blockReason, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";

const T0 = 1_000_000;
const MIN = 60_000;
const RITE_NOTE = NOTES.findIndex((n) => "goal" in n && n.goal.kind === "rite");

function ready(extra: Partial<GameState> = {}): GameState {
  const base = newGame(T0, 9);
  return {
    ...base,
    notesRevealed: RITE_NOTE + 1,
    stats: { ...base.stats, completed: { decipher_page: PAGES.length } },
    inventory: { ...(HEARTH_RITE.items as Record<string, number>) },
    skills: { ...base.skills, ritualism: { xp: xpForLevel(5) } },
    ...extra,
  };
}

function okay(r: Result): GameState {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
}

describe("requirements", () => {
  it("is revealed by the rite note, not before", () => {
    expect(isRiteRevealed(ready())).toBe(true);
    expect(isRiteRevealed({ ...ready(), notesRevealed: RITE_NOTE })).toBe(false);
  });

  it("lists exactly what is missing", () => {
    const s = ready({ inventory: { hearth_candle: 5 }, skills: { ...newGame().skills } });
    const short = riteShortfall(s);
    expect(short.items.find((x) => x.item === "hearth_candle")).toEqual({ item: "hearth_candle", have: 5, need: 7 });
    expect(short.skills).toEqual([{ skill: "ritualism", have: 1, need: 5 }]);
    expect(beginRite(s).ok).toBe(false);
  });
});

describe("performing", () => {
  it("consumes the components and takes the action slot", () => {
    const s = okay(beginRite(startAction(ready(), "pick_nettle")));
    expect(s.active).toBeNull();
    for (const [item, qty] of Object.entries(HEARTH_RITE.items) as [ItemId, number][]) expect(s.inventory[item]).toBe(0 * qty);
    expect(blockReason(s, "pick_nettle")).toEqual({ kind: "rite_in_progress" });
  });

  it("reveals its log as it runs and finishes after 30 minutes, even offline", () => {
    const s = okay(beginRite(ready()));
    const mid = advance(s, 16 * MIN).state;
    expect(riteLog(mid).length).toBeGreaterThan(1);
    expect(mid.rite.completed).toBeNull();
    const { state, report } = catchUp(s, T0 + 31 * MIN);
    expect(report.riteCompleted).toBe(0); // Sound: no factors met
    expect(report.riteMs).toBe(30 * MIN);
    expect(state.rite.completed?.quality).toBe(0);
    expect(riteLog(state)).toHaveLength(HEARTH_RITE.log.length + 1);
  });

  it("rewards: caps to 40, Janko, and the bridge note", () => {
    const { state, report } = advance(okay(beginRite(ready())), 30 * MIN);
    expect(state.levelCap).toBe(40);
    expect(state.followers).toEqual(["janko"]);
    expect(report.notesRevealed).toEqual([NOTES[RITE_NOTE + 1]]);
    expect(currentNote(state)).toBe(NOTES[RITE_NOTE + 1]);
  });

  it("cannot be performed twice", () => {
    const { state } = advance(okay(beginRite(ready())), 30 * MIN);
    expect(beginRite({ ...state, inventory: ready().inventory }).ok).toBe(false);
  });
});

describe("quality", () => {
  it("is Sound with no factors, and never fails", () => {
    expect(QUALITIES[riteQuality(ready(), false)]).toBe("Sound");
  });

  it("one or two factors make it Fine; all three make it Resplendent", () => {
    const mark = { hearth_mark: { ...progressOf(ready(), "hearth_mark"), discovered: true } };
    const skilled = { ...newGame().skills, ritualism: { xp: xpForLevel(10) } };
    expect(QUALITIES[riteQuality(ready({ grimoire: mark }), false)]).toBe("Fine");
    expect(QUALITIES[riteQuality(ready({ grimoire: mark }), true)]).toBe("Fine");
    expect(QUALITIES[riteQuality(ready({ grimoire: mark, skills: skilled }), true)]).toBe("Resplendent");
  });

  it("counts Still Night released while the rite runs", () => {
    const s = okay(beginRite(ready({ omens: { still_night: 1 } })));
    const released = okay(releaseOmen(s, "still_night"));
    expect(advance(released, 30 * MIN).state.rite.completed?.quality).toBe(1); // Fine
  });
});

describe("priming", () => {
  it("begins by itself the moment the last component is made", () => {
    const inv = { ...ready().inventory, consecrated_salt: 2, salt_line: 1, tallow_candle: 1 };
    const s = okay(primeRite(startAction(ready({ inventory: inv }), "bless_threshold"), true));
    const { state, report } = advance(s, 10_000 + 1000);
    expect(report.riteStarted).toBe(true);
    expect(state.rite.performing).not.toBeNull();
  });

  it("does nothing while unprimed", () => {
    const inv = { ...ready().inventory, consecrated_salt: 2, salt_line: 1, tallow_candle: 1 };
    const { state } = advance(startAction(ready({ inventory: inv }), "bless_threshold"), 11_000);
    expect(state.rite.performing).toBeNull();
  });
});

describe("after the chapter", () => {
  const done = () => advance(okay(beginRite(ready())), 30 * MIN).state;

  it("Janko speeds up whatever you're doing, more on Chandlery", () => {
    const s = done();
    expect(actionDurationMs(s, "pick_nettle")).toBeCloseTo(3000 / 1.3);
    expect(actionDurationMs(s, "tallow_candle")).toBeCloseTo(3000 / 1.5);
  });

  it("Hana's double pay ends with the chapter", () => {
    const s = done();
    s.grimoire.hanas_soup = { ...progressOf(s, "hanas_soup"), discovered: true };
    expect(requestCoin(s, REQUESTS.hana_soup)).toBe(REQUESTS.hana_soup.coin);
  });

  it("the ending is shown once", () => {
    expect(okay(dismissEnding(done())).rite.completed?.endingSeen).toBe(true);
  });

  it("rite state round-trips", () => {
    const s = advance(okay(beginRite(ready())), 5 * MIN).state;
    expect(deserialize(JSON.stringify(s)).rite).toEqual(s.rite);
  });
});

describe("save v4", () => {
  it("renames old qualities and drops curio items", () => {
    const old = { ...newGame(T0, 9), version: 3, inventory: { curio: 2, ash: 1 }, rite: { primed: false, performing: null, completed: { quality: 1, endingSeen: true } } };
    const loaded = deserialize(JSON.stringify(old));
    expect(QUALITIES[loaded.rite.completed!.quality]).toBe("Sound");
    expect(loaded.inventory).toEqual({ ash: 1 });
    const res = { ...old, rite: { ...old.rite, completed: { quality: 2, endingSeen: true } } };
    expect(QUALITIES[deserialize(JSON.stringify(res)).rite.completed!.quality]).toBe("Resplendent");
  });
});
