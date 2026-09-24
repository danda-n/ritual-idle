import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { SKILL_IDS } from "../content/skills";
import { deserialize, serialize } from "./save";
import { advance, blockReason, startAction } from "./simulate";
import { currentNote, isFeatureOpen, isRecipeKnown, isSkillUnlocked, pageFor, pagesRead, revealNotes } from "./progress";
import { EXPERIMENTS_NOTE } from "../content/notes";
import { PART_DEFS, type PartId } from "../content/rite";
import { addInsight } from "./grimoire";
import { newGame, type GameState } from "./state";

const T0 = 1_000_000;
const START_COUNT = NOTES[0].goal.count;

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
    const { state, report } = run(newGame(T0, 1), "search_pantry", START_COUNT);
    expect(state.notesRevealed).toBe(2);
    expect(report.notesRevealed).toEqual([NOTES[1]]);
    expect(isSkillUnlocked(state, "chandlery")).toBe(true);
    expect(currentNote(state)).toBe(NOTES[1]);
  });

  it("does not reveal early", () => {
    const { state } = run(newGame(T0, 1), "search_pantry", START_COUNT - 1);
    expect(state.notesRevealed).toBe(1);
  });

  it("stops a locked action instead of running it", () => {
    const { state, report } = run(newGame(T0, 1), "pick_nettle", 3);
    expect(state.inventory.nettle ?? 0).toBe(0);
    expect(report.stopped?.reason).toEqual({ kind: "skill_locked" });
  });
});

describe("the chapter's shape", () => {
  it("no stage asks for anything from a skill that isn't open yet", () => {
    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i]!;
      if (!("goal" in note) || note.goal.kind !== "place") continue;
      const open = new Set(NOTES.slice(0, i + 1).flatMap((n) => [...n.unlocks]));
      for (const item of Object.keys(PART_DEFS[note.goal.part as PartId].items)) {
        if (item === "bread") continue;
        const makers = Object.values(ACTION_DEFS).filter((a) => a.outputs.some((o) => o.item === item));
        expect(makers.some((a) => open.has(a.skill) && Object.keys(a.inputs).every((input) => input === "bread" || Object.values(ACTION_DEFS).some((b) => open.has(b.skill) && b.outputs.some((o) => o.item === input)))), `${note.goal.part}: ${item}`).toBe(true);
      }
    }
  });

  it("no part needs a recipe hidden in a burnt page", () => {
    for (const part of Object.values(PART_DEFS)) {
      for (const item of Object.keys(part.items)) {
        const makers = (Object.keys(ACTION_DEFS) as ActionId[]).filter((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
        if (makers.length > 0) expect(makers.some((a) => pageFor(a) === null), item).toBe(true);
      }
    }
  });

  it("each stage note brings exactly one new skill", () => {
    const stages = NOTES.filter((n) => "goal" in n && n.goal.kind === "place");
    for (const n of stages) expect(n.unlocks).toHaveLength(1);
  });

  it("opens experiments with the first hint, once the Grimoire is open, with its own note", () => {
    const s = { ...newGame(T0, 1), notesRevealed: 5 };
    addInsight(s, "dream_pillow", 2, "request");
    const notes = revealNotes(s);
    expect(notes).toEqual([EXPERIMENTS_NOTE]);
    expect(isFeatureOpen(s, "experiments")).toBe(true);
    expect(revealNotes(s)).toEqual([]);
  });

  it("keeps experiments closed before the Grimoire, even with a hint", () => {
    const s = { ...newGame(T0, 1), notesRevealed: 3 };
    addInsight(s, "dream_pillow", 2, "curio");
    expect(revealNotes(s)).toEqual([]);
    expect(s.experimentsOpen).toBe(false);
  });
});

describe("burnt pages", () => {
  const withScholarship = (): GameState => ({
    ...newGame(T0, 1),
    notesRevealed: 5,
    inventory: { burnt_page: 10, tallow_candle: 10 },
  });

  it("keeps gated recipes unknown until their page is read", () => {
    const s = withScholarship();
    expect(pageFor("iron_ward")).toBe(PAGES[0]);
    expect(isRecipeKnown(s, "iron_ward")).toBe(false);
    expect(isRecipeKnown(s, "tallow_candle")).toBe(true);
  });

  it("reads pages in order, one per decipher", () => {
    const { state, report } = run(withScholarship(), "decipher_page", 2);
    expect(report.pagesRead).toEqual([PAGES[0], PAGES[1]]);
    expect(pagesRead(state)).toHaveLength(2);
    expect(isRecipeKnown(state, "iron_ward")).toBe(true);
    expect(isRecipeKnown(state, "chalk_segment")).toBe(true);
    expect(isRecipeKnown(state, "hearth_candle")).toBe(false);
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
    for (const id of SKILL_IDS) expect(isSkillUnlocked(loaded, id)).toBe(true);
    expect(isRecipeKnown(loaded, "hearth_ward")).toBe(true);
  });

  it("keeps note progress in current saves", () => {
    const { state } = run(newGame(T0, 1), "search_pantry", START_COUNT);
    expect(deserialize(serialize(state)).notesRevealed).toBe(2);
  });
});
