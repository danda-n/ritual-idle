import { describe, expect, it } from "vitest";
import { ACTION_DEFS } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { HEARTH_RITE, PART_DEFS, PART_IDS, QUALITIES, RITE_MS } from "../content/rite";
import { beginRite, chooseKeepsake, chooseStage, dismissEnding, placePart, releaseOmen, type Result } from "./commands";
import { progressOf } from "./grimoire";
import { actionDurationMs, insightPerRep, offlineBonus, omenCapacity, requestCoin } from "./modifiers";
import { keepsakePicksLeft } from "./keepsakes";
import { catchUp } from "./offline";
import { currentNote, isFeatureOpen, isRiteRevealed, isSkillUnlocked, stageChoices } from "./progress";
import { REQUESTS } from "../content/requests";
import { canBeginRite, canOffer, offeringsMet, qualityFor, riteJournal, riteLog, ritePhases, riteShortfall } from "./rite";
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

  it("says why it can't begin, in a label", () => {
    expect(canBeginRite(ready({ skills: { ...newGame().skills } }))).toBe(`Needs Ritualism ${HEARTH_RITE.skills.ritualism}`);
    expect(canBeginRite({ ...ready(), notesRevealed: RITE_NOTE })).toBe("Not unlocked yet");
  });
});

describe("the phase checklist and the journal entry", () => {
  it("lists the five phases as done, current or later", () => {
    expect(ritePhases(ready()).map((p) => p.status)).toEqual(["later", "later", "later", "later", "later"]);
    const mid = advance(okay(beginRite(ready())), 2.5 * HEARTH_RITE.phaseMs).state;
    expect(ritePhases(mid)).toEqual(HEARTH_RITE.phases.map((ph, i) => ({ part: ph.part, status: i < 2 ? "done" : i === 2 ? "current" : "later" })));
    const done = advance(okay(beginRite(ready())), RITE_MS).state;
    expect(ritePhases(done).every((p) => p.status === "done")).toBe(true);
  });

  it("the journal gets the log so far, then the finale and lore, and the second-circle line only for Resplendent", () => {
    expect(riteJournal(ready())).toEqual([]);
    const mid = advance(okay(beginRite(ready())), 2.5 * HEARTH_RITE.phaseMs).state;
    expect(riteJournal(mid)).toEqual(riteLog(mid));
    const done = advance(okay(beginRite(ready())), RITE_MS).state;
    expect(riteJournal(done)).toEqual([...HEARTH_RITE.phases.map((ph) => ph.log), HEARTH_RITE.finale, HEARTH_RITE.rewards.lore]);
    const resplendent = { ...done, rite: { ...done.rite, completed: { quality: QUALITIES.indexOf("Resplendent"), endingSeen: false } } };
    expect(riteJournal(resplendent).at(-1)).toBe(HEARTH_RITE.resplendentLore);
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

  it("after the Light, you choose which part comes next, and it brings its skill", () => {
    const s = { ...early(), inventory: { ...PART_DEFS.light.items } };
    const r = placePart(s, "light");
    expect(r.ok && r.notes).toEqual([]);
    const placed = okay(r);
    expect(stageChoices(placed)).toEqual(["ward", "smoke", "words"]);
    expect(chooseStage(placed, "light").ok).toBe(false);
    const chose = chooseStage(placed, "words");
    const words = NOTES.find((n) => "goal" in n && n.goal.kind === "place" && n.goal.part === "words")!;
    expect(chose.ok && chose.notes).toEqual([words]);
    expect(isSkillUnlocked(okay(chose), "scholarship")).toBe(true);
    expect(isSkillUnlocked(okay(chose), "sigilcraft")).toBe(false);
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

  it("runs five phases, one log line each, and finishes (without moments) even offline", () => {
    const s = okay(beginRite(ready()));
    const mid = advance(s, 2.5 * HEARTH_RITE.phaseMs).state;
    expect(mid.rite.performing?.phase).toBe(2);
    expect(riteLog(mid)).toHaveLength(3);
    expect(mid.rite.completed).toBeNull();
    const { state, report } = catchUp(s, T0 + RITE_MS + MIN);
    expect(report.riteCompleted).toBe(0); // Sound: nothing answered
    expect(report.riteMs).toBe(RITE_MS);
    expect(state.rite.completed?.quality).toBe(0);
    expect(riteLog(state)).toHaveLength(HEARTH_RITE.phases.length + 1);
  });

  it("rewards: caps to 40, Janko, and the bridge note", () => {
    const { state, report } = advance(okay(beginRite(ready())), RITE_MS);
    expect(state.levelCap).toBe(40);
    expect(state.followers).toEqual(["janko"]);
    expect(report.notesRevealed).toEqual([NOTES[RITE_NOTE + 1]]);
    expect(currentNote(state)).toBe(NOTES[RITE_NOTE + 1]);
  });

  it("cannot be performed twice", () => {
    const { state } = advance(okay(beginRite(ready())), RITE_MS);
    expect(beginRite(state).ok).toBe(false);
  });
});

describe("offerings", () => {
  const withCandle = (extra: Partial<GameState> = {}) => ready({ inventory: { hearth_candle: 1 }, ...extra });

  it("the rite runs by itself; nothing to answer", () => {
    const { state } = advance(okay(beginRite(ready())), RITE_MS);
    expect(state.rite.completed).not.toBeNull();
  });

  it("a hearth candle is offered only when chosen, and used when the rite begins", () => {
    const plain = okay(beginRite(withCandle()));
    expect(plain.inventory.hearth_candle).toBe(1);
    expect(offeringsMet(plain)).toEqual([]);
    const offered = okay(beginRite(withCandle(), ["hearth_candle"]));
    expect(offered.inventory.hearth_candle).toBe(0);
    expect(offeringsMet(offered)).toEqual(["hearth_candle"]);
  });

  it("a candle you don't have isn't offered", () => {
    const s = okay(beginRite(ready(), ["hearth_candle"]));
    expect(offeringsMet(s)).toEqual([]);
    expect(canOffer(ready(), "hearth_candle")).not.toBeNull();
  });

  it("none is Sound, one or two Fine, all three Resplendent", () => {
    const mark = { hearth_mark: { ...progressOf(ready(), "hearth_mark"), discovered: true } };
    const night = [{ id: "still_night" as const, endsAt: T0 + MIN, skill: "ritualism" as const }];
    const finish = (s: GameState, offer: ("hearth_candle")[] = []) => QUALITIES[advance(okay(beginRite(s, offer)), RITE_MS).state.rite.completed!.quality];
    expect(finish(ready())).toBe("Sound");
    expect(finish(withCandle(), ["hearth_candle"])).toBe("Fine");
    expect(finish(withCandle({ grimoire: mark }), ["hearth_candle"])).toBe("Fine");
    expect(finish(withCandle({ grimoire: mark, buffs: night }), ["hearth_candle"])).toBe("Resplendent");
  });

  it("quality never changes the story rewards: the level cap and Janko are the same", () => {
    const sound = advance(okay(beginRite(ready())), RITE_MS).state;
    const mark = { hearth_mark: { ...progressOf(ready(), "hearth_mark"), discovered: true } };
    const best = advance(okay(beginRite(withCandle({ grimoire: mark, buffs: [{ id: "still_night", endsAt: T0 + MIN, skill: "ritualism" }] }), ["hearth_candle"])), RITE_MS).state;
    expect([sound.levelCap, sound.followers]).toEqual([best.levelCap, best.followers]);
  });
});

describe("keepsakes", () => {
  const mark = { hearth_mark: { ...progressOf(ready(), "hearth_mark"), discovered: true } };
  const night = [{ id: "still_night" as const, endsAt: T0 + MIN, skill: "ritualism" as const }];
  const sound = () => advance(okay(beginRite(ready())), RITE_MS).state;
  const fine = () => advance(okay(beginRite(ready({ inventory: { hearth_candle: 1 } }), ["hearth_candle"])), RITE_MS).state;
  const resplendent = () => advance(okay(beginRite(ready({ inventory: { hearth_candle: 1 }, grimoire: mark, buffs: night }), ["hearth_candle"])), RITE_MS).state;

  it("none to choose before the rite, or after a Sound one", () => {
    expect(keepsakePicksLeft(ready())).toBe(0);
    expect(keepsakePicksLeft(sound())).toBe(0);
    expect(chooseKeepsake(sound(), "quilt").ok).toBe(false);
  });

  it("a Fine rite lets you choose one, a Resplendent one two, each only once", () => {
    const f = okay(chooseKeepsake(fine(), "quilt"));
    expect(f.keepsakes).toEqual(["quilt"]);
    expect(keepsakePicksLeft(f)).toBe(0);
    expect(chooseKeepsake(f, "glasses").ok).toBe(false);
    let r = resplendent();
    expect(keepsakePicksLeft(r)).toBe(2);
    r = okay(chooseKeepsake(r, "embers"));
    expect(chooseKeepsake(r, "embers").ok).toBe(false);
    r = okay(chooseKeepsake(r, "glasses"));
    expect(keepsakePicksLeft(r)).toBe(0);
  });

  it("the quilt speeds up time away by 10%", () => {
    const s = okay(chooseKeepsake(fine(), "quilt"));
    expect(offlineBonus(s) - offlineBonus(fine())).toBeCloseTo(0.1);
  });

  it("the jar of embers adds an omen place, once there's a shelf", () => {
    const s = okay(chooseKeepsake(fine(), "embers"));
    expect(omenCapacity(s)).toBe(0);
    expect(omenCapacity({ ...s, upgrades: ["omen_shelf"] })).toBe(3);
  });

  it("her reading glasses add insight to every page deciphered", () => {
    const s = okay(chooseKeepsake(fine(), "glasses"));
    expect(insightPerRep(s, "decipher_page")).toBe(1);
    expect(insightPerRep(s, "search_attic")).toBe(0);
  });

  it("keepsakes round-trip, and older saves have none", () => {
    const s = okay(chooseKeepsake(fine(), "quilt"));
    expect(deserialize(JSON.stringify(s)).keepsakes).toEqual(["quilt"]);
    const old = { ...ready(), version: 8 } as Partial<GameState>;
    delete old.keepsakes;
    expect(deserialize(JSON.stringify(old)).keepsakes).toEqual([]);
  });
});

describe("quality", () => {
  it("bands by offerings", () => {
    expect([0, 1, 2, 3].map((n) => QUALITIES[qualityFor(n)])).toEqual(["Sound", "Fine", "Fine", "Resplendent"]);
  });

  it("counts Still Night released while the rite runs", () => {
    const s = okay(beginRite(ready({ omens: { still_night: 1 } })));
    const released = okay(releaseOmen(s, "still_night", "ritualism"));
    expect(released.rite.performing?.omen).toBe(true);
    expect(offeringsMet(released)).toEqual(["still_night"]);
  });
});

describe("after the chapter", () => {
  const done = () => advance(okay(beginRite(ready())), RITE_MS).state;

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
    const s = advance(okay(beginRite(ready())), 2 * MIN).state;
    expect(deserialize(JSON.stringify(s)).rite).toEqual(s.rite);
  });
});

describe("save v5", () => {
  // Old-format saves, so plain objects (the shapes no longer match today's types).
  const v4 = (extra: Record<string, unknown>) => JSON.stringify({ ...newGame(T0, 9), version: 4, kindling: undefined, kept: undefined, experimentsOpen: undefined, talents: undefined, ...extra });

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
    // 1 of the old 30 minutes is the first phase of five, about a sixth of the way in.
    expect(loaded.rite.performing).toEqual({ phase: 0, phaseMs: expect.closeTo(HEARTH_RITE.phaseMs / 6, 0), offered: [], omen: false });
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
