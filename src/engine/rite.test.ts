import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { HEARTH_RITE, PART_DEFS, PART_IDS, QUALITIES } from "../content/rite";
import { beginRite, dismissEnding, placePart, primeRite, releaseOmen, type Result } from "./commands";
import { progressOf } from "./grimoire";
import { actionDurationMs, requestCoin } from "./modifiers";
import { catchUp } from "./offline";
import { currentNote, isFeatureOpen, isRiteRevealed, isSkillUnlocked } from "./progress";
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
    kindling: [...PART_IDS],
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

  it("lists exactly what is missing: unplaced parts and levels", () => {
    const s = ready({ kindling: ["light", "ward"], skills: { ...newGame().skills } });
    const short = riteShortfall(s);
    expect(short.parts).toEqual(["smoke", "words", "offering"]);
    expect(short.skills).toEqual([{ skill: "ritualism", have: 1, need: HEARTH_RITE.skills.ritualism }]);
    expect(beginRite(s).ok).toBe(false);
    expect(beginRite(ready({ kindling: ["light"] })).ok).toBe(false);
  });
});

describe("placing parts", () => {
  const early = () => ({ ...ready(), kindling: [], notesRevealed: 2 });

  it("uses the part's items and keeps it in the Circle", () => {
    const s = { ...early(), inventory: { tallow_candle: PART_DEFS.light.items.tallow_candle! + 2, beeswax_candle: PART_DEFS.light.items.beeswax_candle! } };
    const placed = okay(placePart(s, "light"));
    expect(placed.kindling).toEqual(["light"]);
    expect(placed.inventory).toEqual({ tallow_candle: 2, beeswax_candle: 0 });
  });

  it("refuses when short, or when already placed", () => {
    const s = { ...early(), inventory: { tallow_candle: 99 } };
    const r = placePart(s, "light");
    expect(!r.ok && r.reason).toMatch(/isn't ready/);
    const full = { ...early(), inventory: { tallow_candle: 99, beeswax_candle: 99 } };
    const once = okay(placePart(full, "light"));
    expect(placePart(once, "light").ok).toBe(false);
  });

  it("completes the stage's note and brings the next skill", () => {
    const s = { ...early(), inventory: { ...PART_DEFS.light.items } };
    const r = placePart(s, "light");
    expect(r.ok && r.notes).toEqual([NOTES[2]]);
    expect(okay(r).notesRevealed).toBe(3);
  });

  it("needs the Circle to be open", () => {
    const closed = { ...newGame(T0, 1), notesRevealed: 0, inventory: { ...PART_DEFS.light.items } };
    expect(placePart(closed, "light").ok).toBe(false);
  });
});

describe("performing", () => {
  it("takes the action slot; the parts already sit in the Circle", () => {
    const s = okay(beginRite(startAction(ready({ inventory: { salt: 4 } }), "pick_nettle")));
    expect(s.active).toBeNull();
    expect(s.inventory).toEqual({ salt: 4 });
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
    expect(beginRite(state).ok).toBe(false);
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
    const released = okay(releaseOmen(s, "still_night", "scavenging"));
    expect(advance(released, 30 * MIN).state.rite.completed?.quality).toBe(1); // Fine
  });
});

describe("priming", () => {
  // One bless short of Ritualism 5.
  const almost = () => ready({ inventory: { salt_line: 1, tallow_candle: 1 }, skills: { ...newGame().skills, ritualism: { xp: xpForLevel(5) - 1 } } });

  it("begins by itself the moment Ritualism reaches the level", () => {
    const s = okay(primeRite(startAction(almost(), "bless_threshold"), true));
    const { state, report } = advance(s, 10_000 + 1000);
    expect(report.riteStarted).toBe(true);
    expect(state.rite.performing).not.toBeNull();
  });

  it("begins by itself when the last part is placed", () => {
    const s = okay(primeRite(ready({ kindling: PART_IDS.filter((p) => p !== "offering"), inventory: { ...PART_DEFS.offering.items } }), true));
    expect(okay(placePart(s, "offering")).rite.performing).not.toBeNull();
  });

  it("does nothing while unprimed", () => {
    const { state } = advance(startAction(almost(), "bless_threshold"), 11_000);
    expect(state.rite.performing).toBeNull();
  });
});

describe("after the chapter", () => {
  const done = () => advance(okay(beginRite(ready())), 30 * MIN).state;

  it("Janko speeds up whatever you're doing, more on Chandlery", () => {
    const s = done(); // Herbalism and Chandlery are still level 1 here
    expect(actionDurationMs(s, "pick_nettle")).toBeCloseTo((ACTION_DEFS.pick_nettle.seconds * 1000) / 1.3);
    expect(actionDurationMs(s, "tallow_candle")).toBeCloseTo((ACTION_DEFS.tallow_candle.seconds * 1000) / 1.5);
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

describe("save v5", () => {
  const v4 = (extra: Partial<GameState>) => JSON.stringify({ ...newGame(T0, 9), version: 4, kindling: undefined, kept: undefined, experimentsOpen: undefined, talents: undefined, ...extra });

  it("a finished chapter counts every part as placed", () => {
    const loaded = deserialize(v4({ notesRevealed: 9, rite: { primed: false, performing: null, completed: { quality: 2, endingSeen: true } } }));
    expect(loaded.kindling).toEqual(PART_IDS);
    expect(loaded.notesRevealed).toBe(NOTES.length);
    expect(loaded.experimentsOpen).toBe(true);
  });

  it("a rite under way counts every part as placed and keeps running", () => {
    const loaded = deserialize(v4({ notesRevealed: 8, rite: { primed: false, performing: { elapsedMs: 60_000, stillNight: false }, completed: null } }));
    expect(loaded.kindling).toEqual(PART_IDS);
    expect(currentNote(loaded)).toBe(NOTES[RITE_NOTE]);
    expect(advance(loaded, 30 * MIN).state.rite.completed).not.toBeNull();
  });

  it("mid-chapter keeps every skill and place, and starts the Kindling at the Light", () => {
    // Old note 5 was Sigilcraft: Scavenging, Chandlery, Herbalism, Scholarship and Sigilcraft were open, and the Grimoire.
    const loaded = deserialize(v4({ notesRevealed: 5, inventory: { ...PART_DEFS.light.items } }));
    expect(loaded.kindling).toEqual([]);
    expect(loaded.kept.skills.sort()).toEqual(["chandlery", "herbalism", "scavenging", "scholarship", "sigilcraft"]);
    expect(isFeatureOpen(loaded, "grimoire")).toBe(true);
    expect(isSkillUnlocked(loaded, "ritualism")).toBe(false);
    expect(currentNote(loaded)).toBe(NOTES[1]);
    // What they already made can go straight in.
    expect(placePart(loaded, "light").ok).toBe(true);
  });

  it("a brand-new v4 game starts the new chapter from the top", () => {
    const loaded = deserialize(v4({ notesRevealed: 1 }));
    expect(loaded.notesRevealed).toBe(1);
    expect(loaded.kept.skills).toEqual(["scavenging"]);
    expect(isFeatureOpen(loaded, "circle")).toBe(true);
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
