import { describe, expect, it } from "vitest";
import { BUFFS } from "../content/buffs";
import { GLOSSARY } from "../content/glossary";
import { SKILLS } from "../content/skills";
import { FOLLOWERS } from "../content/followers";
import { CURIO_STORIES, CURIOS, GRIMOIRE, GRIMOIRE_DEFS, INSIGHT_GAIN } from "../content/grimoire";
import { ITEMS } from "../content/items";
import { KEEPSAKES } from "../content/keepsakes";
import { EXPERIMENTS_NOTE, NOTES } from "../content/notes";
import { OMENS } from "../content/omens";
import { REQUESTS } from "../content/requests";
import { HEARTH_RITE, KINDLING_PARTS } from "../content/rite";
import { SHOP } from "../content/shop";
import { UPGRADES } from "../content/upgrades";
import { attune } from "./commands";
import { markDiscovered } from "./grimoire";
import { newGame } from "./state";

// Text in the spreadsheet style (docs/research/TEXT_AUDIT.md): screens say numbers and verbs; story
// lives in the Grimoire journal; puzzle text (riddles, clues, asides, item bridges) stays.

describe("contracts", () => {
  it("every request has a short label, and its full line as the hover title", () => {
    for (const [id, r] of Object.entries(REQUESTS)) {
      expect(r.label.length, id).toBeGreaterThan(0);
      expect(r.label.split(" ").length, id).toBeLessThanOrEqual(3);
      expect(r.text.length, id).toBeGreaterThan(r.label.length);
    }
  });

  it("Hana's contract keeps its label and name: the Hana's soup secret leans on them", () => {
    expect(REQUESTS.hana_soup.label).toBe("Nettle soup");
    expect(REQUESTS.hana_soup.from).toBe("Widow Hana");
    expect(GRIMOIRE.hanas_soup.reward).toMatchObject({ from: REQUESTS.hana_soup.from });
  });

  it("villager asides still point at their recipe's ingredients", () => {
    expect(REQUESTS.hana_soup.mentions.aside).toMatch(/pillow/);
    expect(REQUESTS.hana_soup.mentions.aside).toMatch(/bitter/i);
    expect(REQUESTS.stable_mark.mentions.aside).toMatch(/ash/);
    expect(REQUESTS.stable_mark.mentions.aside).toMatch(/salt/i);
    expect(REQUESTS.iron_cradle.mentions.aside).toMatch(/nail/);
    expect(REQUESTS.iron_cradle.mentions.aside).toMatch(/yellow flower/);
  });
});

describe("grandmother's notes", () => {
  it("have no task-card quote; their text is story for the journal", () => {
    for (const n of [...NOTES, EXPERIMENTS_NOTE]) {
      expect("quote" in n).toBe(false);
      expect(n.text.length).toBeGreaterThan(0);
    }
  });

  it("keep a hint only where it's shown: notes without steps", () => {
    for (const n of [...NOTES, EXPERIMENTS_NOTE]) {
      if ("steps" in n) expect("hint" in n, n.text.slice(0, 30)).toBe(false);
      else expect("hint" in n && n.hint.length > 0, n.text.slice(0, 30)).toBe(true);
    }
  });

  it("the experiments note still says how experiments work, and the last note Janko's real bonus", () => {
    expect(EXPERIMENTS_NOTE.hint).toMatch(/3 items/);
    expect(EXPERIMENTS_NOTE.hint).toMatch(/1 glow per right item/);
    const last = NOTES[NOTES.length - 1]!;
    expect("hint" in last && last.hint).toContain(`+${Math.round(FOLLOWERS.janko.assist * 100)}%`);
  });
});

describe("puzzle text stays", () => {
  it("riddles and item bridges", () => {
    expect(GRIMOIRE.dream_pillow.hints.riddle).toBe("…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth.");
    expect(GRIMOIRE.hearth_mark.hints.riddle).toBe("…where the fire lived, draw its name in what it left behind, and salt to keep it.");
    expect(GRIMOIRE.threshold_nail.hints.riddle).toBe("…cold iron under the door, and the Kupala herb to make it sing.");
    expect(ITEMS.mugwort.description).toBe("The dream-herb.");
    expect(ITEMS.stjohns.description).toBe("The Kupala herb.");
  });

  it("every hidden recipe has category hints, every secret three clues", () => {
    for (const g of Object.values(GRIMOIRE_DEFS)) {
      if (g.kind === "hidden") expect(g.hints?.category).toHaveLength(g.ingredients.length);
      else expect(g.clues).toHaveLength(3);
    }
  });

  it("the Threshold nail's plot thread shows on its page, not only in the collapsed story", () => {
    expect(GRIMOIRE_DEFS.threshold_nail.opens).toBe("Opens: grandmother's hidden note (journal)");
    expect(GRIMOIRE_DEFS.threshold_nail.reveal).toMatch(/child/);
  });
});

describe("numbers first", () => {
  it("rewards are short and lead with the number or the kind", () => {
    for (const [id, g] of Object.entries(GRIMOIRE_DEFS)) {
      expect(g.rewardText.length, id).toBeLessThanOrEqual(48);
      expect(g.rewardText.endsWith("."), id).toBe(false);
    }
    expect(GRIMOIRE.dream_pillow.rewardText).toBe("+10% XP, all skills");
  });

  it("keepsakes: a short effect, with the lore line kept for the hover title", () => {
    for (const k of Object.values(KEEPSAKES)) {
      expect(k.text.length).toBeLessThanOrEqual(32);
      expect(k.flavour.length).toBeGreaterThan(0);
    }
  });

  it("curios: a name for the list, and the story behind it", () => {
    expect(CURIOS.length).toBe(CURIO_STORIES.length);
    for (const c of CURIOS) expect(c.name.split(" ").length).toBeLessThanOrEqual(2);
    expect(ITEMS.curio.description).toContain(`+${INSIGHT_GAIN.curio} insight`);
  });
});

describe("no dead text", () => {
  it("fields no screen shows are gone", () => {
    for (const b of Object.values(BUFFS)) expect("description" in b).toBe(false);
    for (const o of Object.values(OMENS)) expect("description" in o).toBe(false);
    for (const s of Object.values(SHOP)) expect("description" in s).toBe(false);
    for (const u of Object.values(UPGRADES)) expect("description" in u).toBe(false);
    for (const p of Object.values(KINDLING_PARTS)) expect("placed" in p).toBe(false);
    expect("description" in HEARTH_RITE).toBe(false);
    expect("description" in FOLLOWERS.janko.trait).toBe(false);
  });

  it("the rite's story lines are kept (for the journal)", () => {
    for (const ph of HEARTH_RITE.phases) expect(ph.log.length).toBeGreaterThan(0);
    expect(HEARTH_RITE.finale.length).toBeGreaterThan(0);
    expect(HEARTH_RITE.rewards.lore.length).toBeGreaterThan(0);
    expect(HEARTH_RITE.resplendentLore.length).toBeGreaterThan(0);
  });
});

describe("refusals are labels", () => {
  it("attuning to a recipe that's already discovered", () => {
    const s = { ...newGame(1, 1), notesRevealed: NOTES.length, experimentsOpen: true };
    markDiscovered(s, "dream_pillow");
    const r = attune(s, "dream_pillow");
    expect(!r.ok && r.reason).toBe("Recipe not available yet");
  });
});

describe("new terms are explained", () => {
  it("every glossary entry has a name and a short plain explanation", () => {
    for (const [id, t] of Object.entries(GLOSSARY)) {
      expect(t.name.length, id).toBeGreaterThan(0);
      expect(t.text.length, id).toBeGreaterThan(20);
      expect(t.text.length, id).toBeLessThanOrEqual(200);
    }
  });
});

describe("choices talk only about what you already know", () => {
  it("no skill description names a place or system that isn't open when you choose", () => {
    const unknown = /villag|contract|trust|hidden recipe|experiment|charm|grimoire|insight|coin/i;
    for (const [id, sk] of Object.entries(SKILLS)) {
      expect(sk.about, id).not.toMatch(unknown);
      expect(sk.blurb, id).not.toMatch(unknown);
    }
  });
});
