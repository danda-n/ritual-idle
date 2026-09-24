import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { SKILL_IDS } from "../content/skills";
import { deserialize, serialize } from "./save";
import { advance, blockReason, startAction } from "./simulate";
import { currentNote, isRecipeKnown, isSkillUnlocked, pageFor, pagesRead } from "./progress";
import { newGame, type GameState } from "./state";

const T0 = 1_000_000;

function run(state: GameState, id: ActionId, times: number) {
  return advance(startAction(state, id), times * ACTION_DEFS[id].seconds * 1000);
}

describe("content", () => {
  it("unlocks every Chapter 1 skill through the notes", () => {
    const unlocked = new Set(NOTES.flatMap((n) => [...n.unlocks]));
    for (const id of SKILL_IDS) expect(unlocked.has(id), id).toBe(true);
  });

  it("teaches each gated recipe on exactly one page", () => {
    const taught = PAGES.flatMap((p) => [...p.unlocks]);
    expect(new Set(taught).size).toBe(taught.length);
  });
});

describe("grandmother's notes", () => {
  it("starts with only Scavenging available", () => {
    const s = newGame(T0, 1);
    expect(isSkillUnlocked(s, "scavenging")).toBe(true);
    expect(isSkillUnlocked(s, "chandlery")).toBe(false);
    expect(blockReason(s, "pick_nettle")).toEqual({ kind: "skill_locked" });
  });

  it("reveals the next note and its skill when the goal is met", () => {
    const { state, report } = run(newGame(T0, 1), "sweep_hearth", 5);
    expect(state.notesRevealed).toBe(2);
    expect(report.notesRevealed).toEqual([NOTES[1]]);
    expect(isSkillUnlocked(state, "chandlery")).toBe(true);
    expect(currentNote(state)).toBe(NOTES[1]);
  });

  it("does not reveal early", () => {
    const { state } = run(newGame(T0, 1), "sweep_hearth", 4);
    expect(state.notesRevealed).toBe(1);
  });

  it("stops a locked action instead of running it", () => {
    const { state, report } = run(newGame(T0, 1), "pick_nettle", 3);
    expect(state.inventory.nettle ?? 0).toBe(0);
    expect(report.stopped?.reason).toEqual({ kind: "skill_locked" });
  });
});

describe("burnt pages", () => {
  const withScholarship = (): GameState => ({
    ...newGame(T0, 1),
    notesRevealed: 4,
    inventory: { burnt_page: 10, tallow_candle: 10 },
  });

  it("keeps gated recipes unknown until their page is read", () => {
    const s = withScholarship();
    expect(pageFor("smudge_bundle")).toBe(PAGES[0]);
    expect(isRecipeKnown(s, "smudge_bundle")).toBe(false);
    expect(isRecipeKnown(s, "tallow_candle")).toBe(true);
  });

  it("reads pages in order, one per decipher", () => {
    const { state, report } = run(withScholarship(), "decipher_page", 2);
    expect(report.pagesRead).toEqual([PAGES[0], PAGES[1]]);
    expect(pagesRead(state)).toHaveLength(2);
    expect(isRecipeKnown(state, "smudge_bundle")).toBe(true);
    expect(isRecipeKnown(state, "iron_ward")).toBe(true);
    expect(isRecipeKnown(state, "mugwort_incense")).toBe(false);
  });

  it("stops quietly after the last page", () => {
    const s = { ...withScholarship(), inventory: { burnt_page: 20, tallow_candle: 20 } };
    const { state } = run(s, "decipher_page", PAGES.length + 3);
    expect(pagesRead(state)).toHaveLength(PAGES.length);
    expect(state.inventory.deciphered_page).toBe(PAGES.length + 3);
  });
});

describe("save migration", () => {
  it("opens everything for v1 saves so no progress is locked away", () => {
    const v1 = { ...newGame(T0, 1), version: 1 } as Partial<GameState>;
    delete v1.notesRevealed;
    delete v1.stats;
    const loaded = deserialize(JSON.stringify(v1));
    expect(loaded.notesRevealed).toBe(NOTES.length);
    for (const id of SKILL_IDS) expect(isSkillUnlocked(loaded, id)).toBe(true);
    expect(isRecipeKnown(loaded, "hearth_ward")).toBe(true);
  });

  it("keeps note progress in current saves", () => {
    const { state } = run(newGame(T0, 1), "sweep_hearth", 5);
    expect(deserialize(serialize(state)).notesRevealed).toBe(2);
  });
});
