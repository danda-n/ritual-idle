import { describe, expect, it } from "vitest";
import { BASE, FOES, GIFTS, PIECES, type Affix, type PieceId } from "../content/combat";
import { beginFight, setStopRule, dismissFightSummary, chooseAffix, craftPiece, deleteLoadout, reforge, saveLoadout, setCharm, setHealAt, setRemedy, start, stopFight, useRemedy, wear, wearLastFor, wearLoadout, upgradePiece, type Result } from "./commands";
import { canFight, combatStats, mastery, matchup, readiness, weaknessKnown } from "./combat";
import { openProjects, revealedRecipes } from "./estimates";
import { loadoutSlots, speedMultiplier } from "./modifiers";
import { catchUp } from "./offline";
import { isSkillUnlocked } from "./progress";
import { deserialize, serialize } from "./save";
import { advance } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";
import { ACTION_DEFS } from "../content/actions";
import { CELLAR_TERMS, GLOSSARY } from "../content/glossary";
import { ITEM_DEFS } from "../content/items";
import { KEEPSAKES } from "../content/keepsakes";
import { EXPERIMENTS_NOTE, NOTES } from "../content/notes";
import { SKILL_DEFS, SKILLS } from "../content/skills";
import { UPGRADE_DEFS } from "../content/upgrades";

const MIN = 60_000;

function must(r: Result): GameState {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
}

/** A game just past the Kindling: the cellar open, caps at 40. */
function afterRite(seed = 7): GameState {
  const s = newGame(0, seed);
  s.rite.completed = { quality: 0, endingSeen: true, offered: [] };
  s.levelCap = 40;
  s.notesRevealed = 99;
  s.kept = { skills: ["scavenging", "chandlery", "sigilcraft", "herbalism", "scholarship", "ritualism"], features: ["grimoire", "village", "circle"] };
  s.settings.fallback = "stop";
  return s;
}

function level(s: GameState, skill: "warding" | "crafting" | "herbalism", l: number): GameState {
  s.skills[skill].xp = xpForLevel(l);
  return s;
}

/** Hand a piece over as if made, with one chosen affix. */
function give(s: GameState, id: PieceId, affix: Affix = PIECES[id].slot === "belt" ? { kind: "beltCap", value: 2 } : { kind: "health", value: 5 }): GameState {
  s.cellar.pieces.push({ id, tier: 1, affixes: [affix] });
  s.cellar.gear.worn[PIECES[id].slot] = id;
  return s;
}

/** Strong cellar gear: Grandmother's set, a knife and a censer. */
function geared(seed = 7): GameState {
  const s = level(afterRite(seed), "warding", 12);
  for (const p of ["salt_pouch", "iron_knife", "censer", "embroidered_shirt", "herb_belt"] as PieceId[]) give(s, p);
  return s;
}

describe("the cellar opens after the Kindling, and not before", () => {
  it("before the rite: no Warding, no Crafting, no fights, no poultice, no cellar projects", () => {
    const s = level(newGame(0, 1), "herbalism", 12);
    s.kept = { skills: ["herbalism", "scavenging", "chandlery"], features: [] };
    expect(isSkillUnlocked(s, "warding")).toBe(false);
    expect(isSkillUnlocked(s, "crafting")).toBe(false);
    expect(canFight(s, "skrzat")).toMatch(/isn't open/);
    expect(revealedRecipes(s, "herbalism")).not.toContain("yarrow_poultice");
    expect(openProjects(s)).not.toContain("workbench");
  });

  it("after it: both skills, the poultice at Herbalism 9, and the cellar projects", () => {
    const s = level(afterRite(), "herbalism", 12);
    expect(isSkillUnlocked(s, "warding")).toBe(true);
    expect(isSkillUnlocked(s, "crafting")).toBe(true);
    expect(revealedRecipes(s, "herbalism")).toContain("yarrow_poultice");
    expect(openProjects(s)).toEqual(expect.arrayContaining(["workbench", "cellar_door"]));
    expect(canFight(s, "skrzat")).toBeNull();
  });
});

describe("your stats", () => {
  it("Health 40 at Warding 1 and +2 a level; bare hands strike 2", () => {
    const s = afterRite();
    expect(combatStats(s).maxHealth).toBe(40);
    expect(combatStats(s).strike).toBe(BASE.strike);
    expect(combatStats(level(s, "warding", 7)).maxHealth).toBe(52);
  });

  it("gear adds its base and affixes; Grandmother's set gives +10% Ward at 2 and the missed special at 3", () => {
    const s = afterRite();
    give(s, "salt_pouch", { kind: "ward", value: 4 });
    expect(combatStats(s).ward).toBe(14);
    give(s, "herb_belt");
    expect(combatStats(s).ward).toBeCloseTo(14 * 1.1);
    expect(combatStats(s).firstSpecialMisses).toBe(false);
    give(s, "embroidered_shirt");
    expect(combatStats(s).firstSpecialMisses).toBe(true);
    expect(combatStats(s).specialMult).toBeCloseTo(0.8);
    expect(combatStats(s).beltCap).toBe(12);
  });

  it("the right tag: your blows ×1.5 from the Hand or Lantern, its blows halved by the Amulet", () => {
    const s = afterRite();
    give(s, "iron_knife");
    const plain = matchup(s, "skrzat");
    const vsZmora = matchup(s, "zmora");
    // Strike 2 + 5, iron against the Zmora's fear of iron ×1.5, through its Ward 20.
    expect(vsZmora.yourBlow).toBeCloseTo(((2 + 5) * 1.5 * 100) / 120);
    expect(plain.yourBlow).toBeCloseTo(7);
    give(s, "salt_pouch");
    expect(matchup(s, "skrzat").itsBlow).toBeCloseTo(((3 * 100) / 110) * 0.5);
  });

  it("bread and salt: bread as the remedy against the Domovoi gives +20% Strike", () => {
    const s = afterRite();
    const without = matchup(s, "domovoi").yourBlow;
    s.cellar.gear.remedy = "bread";
    expect(matchup(s, "domovoi").yourBlow).toBeCloseTo(without * 1.2);
    expect(matchup(s, "skrzat").yourBlow).toBeCloseTo(BASE.strike);
  });
});

describe("a fight", () => {
  it("runs in the action slot: foes beaten, Warding XP, loot, and the count kept", () => {
    let s = must(beginFight(geared(), "skrzat"));
    const { state, report } = advance(s, 10 * MIN);
    s = state;
    expect(s.fight).not.toBeNull();
    expect(report.fight.beaten.skrzat).toBeGreaterThan(20);
    expect(s.cellar.beaten.skrzat).toBe(report.fight.beaten.skrzat);
    expect(report.xpGained.warding).toBeGreaterThan(0);
    expect((report.itemsGained.lost_button ?? 0) + (report.itemsGained.rags ?? 0)).toBeGreaterThan(0);
    expect(s.fight!.log.length).toBeGreaterThan(0);
  });

  it("is the same every time from the same save", () => {
    const a = advance(must(beginFight(geared(3), "kikimora")), 5 * MIN).state;
    const b = advance(must(beginFight(geared(3), "kikimora")), 5 * MIN).state;
    expect(a.cellar).toEqual(b.cellar);
  });

  it("driven off: the fight ends at 0 Health, and work goes back to what ran before", () => {
    let s = afterRite();
    s.kept.skills.push("herbalism");
    s = must(start(s, "pick_nettle"));
    s = must(beginFight(s, "skrzat"));
    s.cellar.health = 3;
    const { state, report } = advance(s, 5 * MIN);
    expect(report.fight.drivenOff?.foe).toBe("skrzat");
    expect(state.fight).toBeNull();
    expect(state.active?.id).toBe("pick_nettle");
  });

  it("keeps a summary of how it ended: driven off by what, the loot, the remedies; stopping too", () => {
    let s = must(beginFight(geared(), "kikimora"));
    s = advance(s, 3 * MIN).state;
    const stopped = must(stopFight(s));
    expect(stopped.cellar.lastFight).toMatchObject({ foe: "kikimora", end: "stopped", beaten: s.fight!.beaten, loot: s.fight!.loot });
    expect(must(dismissFightSummary(stopped)).cellar.lastFight).toBeNull();
    let weak = must(beginFight(level(afterRite(), "warding", 6), "zmora"));
    weak = advance(weak, 10 * MIN).state;
    expect(weak.cellar.lastFight).toMatchObject({ foe: "zmora", end: "driven" });
    expect(must(beginFight({ ...weak, cellar: { ...weak.cellar, health: 40 } }, "skrzat")).cellar.lastFight).toBeNull();
  });

  it("Health comes back out of a fight, in full in about 2 minutes", () => {
    const s = afterRite();
    s.cellar.health = 0;
    expect(advance(s, MIN).state.cellar.health).toBeCloseTo(20);
    expect(advance(s, 2 * MIN).state.cellar.health).toBe(40);
  });

  it("the healing rule uses remedies from the Belt below the line", () => {
    let s = geared();
    s.inventory.chamomile = 30;
    s = must(setRemedy(s, "chamomile"));
    s = must(setHealAt(s, 80));
    s = must(beginFight(s, "zmora"));
    const { state, report } = advance(s, 3 * MIN);
    expect(report.fight.remediesUsed).toBeGreaterThan(0);
    expect(state.inventory.chamomile).toBe(30 - report.fight.remediesUsed);
    expect(report.fight.remediesUsed).toBeLessThanOrEqual(combatStats(s).beltCap);
  });

  it("gear is locked while it runs; Stop ends it, and starting other work does too", () => {
    let s = must(beginFight(geared(), "skrzat"));
    expect(wear(s, "hand", null).ok).toBe(false);
    expect(setHealAt(s, 50).ok).toBe(false);
    expect(must(stopFight(s)).fight).toBeNull();
    s.kept.skills.push("herbalism");
    expect(must(start(s, "pick_nettle")).fight).toBeNull();
  });

  it("a foe's weakness shows after 10 beaten; a boss's always", () => {
    const s = geared();
    expect(weaknessKnown(s, "skrzat")).toBe(false);
    expect(weaknessKnown(s, "domovoi")).toBe(true);
    s.cellar.beaten.skrzat = 10;
    expect(weaknessKnown(s, "skrzat")).toBe(true);
  });

  it("foes past your level are refused", () => {
    expect(canFight(afterRite(), "zmora")).toBe(`Needs Warding ${FOES.zmora.level}.`);
  });
});

describe("readiness", () => {
  it("bare hands against the Domovoi is Hopeless; good gear against the Skrzat is Safe", () => {
    expect(readiness(afterRite(), "domovoi").tag).toBe("Hopeless");
    const r = readiness(geared(), "skrzat");
    expect(r.tag).toBe("Safe");
    expect(r.longRun).toBe(true);
  });

  it("never flickers: the same gear always gives the same tag", () => {
    const s = level(afterRite(), "warding", 6);
    give(s, "iron_knife");
    expect(readiness(s, "kikimora")).toEqual(readiness(structuredClone(s), "kikimora"));
  });

  it("Safe needs long runs, not just one foe won", () => {
    // Bare hands beat a Skrzat almost always from full Health, but lose ground foe after foe.
    const s = level(afterRite(), "warding", 3);
    const r = readiness(s, "skrzat");
    expect(r.wins).toBeGreaterThan(900);
    expect(r.tag).not.toBe("Safe");
  });
});

describe("away", () => {
  it("only Safe fights go on while you're away; others stop when you leave", () => {
    const safe = must(beginFight(geared(), "skrzat"));
    expect(safe.fight!.safe).toBe(true);
    const away = catchUp(safe, safe.lastTickAt + 60 * MIN);
    expect(away.state.fight).not.toBeNull();
    expect(away.report.fight.beaten.skrzat).toBeGreaterThan(100);

    const risky = must(beginFight(level(afterRite(), "warding", 3), "skrzat"));
    expect(risky.fight!.safe).toBe(false);
    const back = catchUp(risky, risky.lastTickAt + 60 * MIN);
    expect(back.state.fight).toBeNull();
    expect(back.report.fight.stoppedAway).toBe("skrzat");
  });
});

describe("the Domovoi", () => {
  it("calming him once leaves his gift: every skill faster, Health back twice as fast; no second fight", () => {
    let s = geared();
    give(s, "hearth_poker", { kind: "strike", value: 2 });
    s = level(s, "warding", 40);
    // Janko, from the Kindling, helps every player who reaches the cellar.
    s.followers = ["janko"];
    s.talents.warding = { 3: "a", 6: "b", 9: "a", 12: "b" };
    s.inventory.yarrow_poultice = 10;
    s = must(setRemedy(s, "yarrow_poultice"));
    const before = speedMultiplier(s, "pick_nettle");
    s = must(beginFight(s, "domovoi"));
    const { state, report } = advance(s, 10 * MIN);
    expect(report.fight.calmed).toBe("domovoi");
    expect(state.fight).toBeNull();
    expect(state.cellar.gifts).toContain("domovoi");
    expect(speedMultiplier(state, "pick_nettle")).toBeCloseTo(before + GIFTS.domovoi.speedAll);
    expect(canFight(state, "domovoi")).toMatch(/calmed/);
    state.cellar.health = 0;
    expect(advance(state, MIN).state.cellar.health).toBe(combatStats(state).maxHealth);
  });
});

describe("charms in a fight", () => {
  it("the worn charm is used when none is on; a red thread knot counts foes and halves special attacks", () => {
    let s = geared();
    s.inventory.red_thread_knot = 1;
    s = must(setCharm(s, "red_thread_knot"));
    expect(combatStats(s).specialMult).toBeCloseTo(0.4);
    s = must(beginFight(s, "skrzat"));
    expect(s.charms.red_thread_knot).toBe(25);
    expect(s.inventory.red_thread_knot).toBe(0);
    const { state, report } = advance(s, MIN);
    expect(state.charms.red_thread_knot).toBe(25 - report.fight.beaten.skrzat!);
  });
});

describe("Crafting pieces", () => {
  it("a piece takes the action slot; its materials go at the start; then its options wait for a choice", () => {
    let s = level(afterRite(), "crafting", 2);
    s.inventory.iron_blank = 2;
    s = must(craftPiece(s, "iron_knife"));
    expect(s.inventory.iron_blank).toBe(0);
    expect(s.job?.piece).toBe("iron_knife");
    const { state, report } = advance(s, 30_000);
    expect(report.pieceReady).toBe("iron_knife");
    expect(report.xpGained.crafting).toBe(PIECES.iron_knife.xp);
    expect(state.cellar.pending?.options).toHaveLength(2);
    const kinds = state.cellar.pending!.options.map((o) => o.kind);
    expect(new Set(kinds).size).toBe(2);
    const done = must(chooseAffix(state, 1));
    expect(done.cellar.pieces[0]).toEqual({ id: "iron_knife", tier: 1, affixes: [state.cellar.pending!.options[1]] });
    // An empty slot takes the new piece at once.
    expect(done.cellar.gear.worn.hand).toBe("iron_knife");
    expect(craftPiece({ ...done, inventory: { iron_blank: 2 } }, "iron_knife").ok).toBe(false);
  });

  it("the Workbench adds a third option", () => {
    let s = level(afterRite(), "crafting", 2);
    s.upgrades.push("workbench");
    s.inventory.iron_blank = 2;
    s = advance(must(craftPiece(s, "iron_knife")), 30_000).state;
    expect(s.cellar.pending?.options).toHaveLength(3);
  });

  it("values roll inside their ranges", () => {
    for (let seed = 1; seed < 30; seed++) {
      let s = level(afterRite(seed), "crafting", 2);
      s.inventory.iron_blank = 2;
      s = advance(must(craftPiece(s, "iron_knife")), 30_000).state;
      for (const o of s.cellar.pending!.options) {
        const range = { strike: [1, 2], speed: [3, 5], telling: [2, 3] }[o.kind as "strike"]!;
        expect(o.value).toBeGreaterThanOrEqual(range[0]!);
        expect(o.value).toBeLessThanOrEqual(range[1]!);
      }
    }
  });

  it("stopping a piece gives its materials back", () => {
    let s = level(afterRite(), "crafting", 2);
    s.kept.skills.push("herbalism");
    s.inventory.iron_blank = 2;
    s = must(craftPiece(s, "iron_knife"));
    s = must(start(s, "pick_nettle"));
    expect(s.inventory.iron_blank).toBe(2);
    expect(s.job).toBeNull();
  });

  it("reforging: new options, its components used, and you may keep the old one", () => {
    let s = afterRite();
    give(s, "iron_knife", { kind: "strike", value: 1 });
    expect(reforge(s, "iron_knife").ok).toBe(false);
    s.inventory.iron_blank = 1;
    s = must(reforge(s, "iron_knife"));
    expect(s.inventory.iron_blank).toBe(0);
    expect(s.cellar.pending?.kind).toBe("reforge");
    const kept = must(chooseAffix(s, null));
    expect(kept.cellar.pieces[0]!.affixes).toEqual([{ kind: "strike", value: 1 }]);
    const changed = must(chooseAffix(s, 0));
    expect(changed.cellar.pieces[0]!.affixes).toEqual([s.cellar.pending!.options[0]]);
  });

  it("upgrading waits for Chapter II", () => {
    expect(upgradePiece(give(afterRite(), "iron_knife"), "iron_knife")).toEqual({ ok: false, reason: "Tier 2 needs Chapter II's materials." });
  });
});

describe("loadouts", () => {
  it("two named loadouts, three with the Warded cellar door; wear one, delete one", () => {
    let s = geared();
    expect(loadoutSlots(s)).toBe(2);
    s = must(saveLoadout(s, 0, "Cellar iron"));
    s = must(wear(s, "hand", null));
    s = must(wearLoadout(s, 0));
    expect(s.cellar.gear.worn.hand).toBe("iron_knife");
    s = must(saveLoadout(s, 1, "Boss"));
    expect(saveLoadout(s, 2, "More").ok).toBe(false);
    s.upgrades.push("cellar_door");
    s = must(saveLoadout(s, 2, "More"));
    s = must(deleteLoadout(s, 0));
    expect(s.cellar.loadouts.map((l) => l.name)).toEqual(["Boss", "More"]);
  });

  it("each foe remembers the gear last used against it", () => {
    let s = must(beginFight(geared(), "skrzat"));
    s = must(stopFight(s));
    s = must(wear(s, "hand", null));
    s = must(wearLastFor(s, "skrzat"));
    expect(s.cellar.gear.worn.hand).toBe("iron_knife");
  });
});

describe("remedies out of a fight", () => {
  it("heal at once", () => {
    let s = afterRite();
    s.cellar.health = 10;
    s.inventory.bread = 1;
    s = must(useRemedy(s, "bread"));
    expect(s.cellar.health).toBe(18);
    expect(useRemedy(s, "bread").ok).toBe(false);
  });
});

describe("saves", () => {
  it("the cellar survives a save and load", () => {
    const s = advance(must(beginFight(geared(), "kikimora")), MIN).state;
    expect(deserialize(serialize(s))).toEqual(s);
  });

  it("a save from before the cellar loads with it empty, and open if the rite is done", () => {
    const old = JSON.parse(serialize(afterRite())) as Record<string, unknown>;
    delete old.cellar;
    delete old.fight;
    delete old.job;
    old.version = 11;
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.cellar.pieces).toEqual([]);
    expect(loaded.cellar.health).toBe(40);
    expect(isSkillUnlocked(loaded, "warding")).toBe(true);
  });
});

describe("nothing of combat before the cellar opens (docs/COMBAT.md §10)", () => {
  const COMBAT_WORDS = /\b(warding|crafting|fight|fights|foe|foes|gear|remedy|remedies|heals?|health|cellar|affix|loadout|readiness|domovoi|skrzat|kikimora|zmora)\b/i;

  it("Chapter 1's own words never name it: skills, items, notes, projects, keepsakes, glossary", () => {
    const texts: [string, string][] = [];
    for (const [id, sk] of Object.entries(SKILLS)) if (!SKILL_DEFS[id as keyof typeof SKILLS].opensWith) texts.push([`skill ${id}`, `${sk.about} ${sk.blurb}`]);
    for (const [id, it] of Object.entries(ITEM_DEFS)) if (!["leavings", "components"].includes(it.category) && !["yarrow_poultice", "red_thread_knot"].includes(id)) texts.push([`item ${id}`, `${it.name} ${it.description ?? ""}`]);
    for (const n of [...NOTES, EXPERIMENTS_NOTE]) texts.push(["note", n.text]);
    for (const [id, u] of Object.entries(UPGRADE_DEFS)) if (u.requiresFeature !== "cellar") texts.push([`project ${id}`, `${u.name} ${u.blurb} ${u.extra ?? ""}`]);
    for (const [id, k] of Object.entries(KEEPSAKES)) texts.push([`keepsake ${id}`, `${k.name} ${k.text} ${k.flavour}`]);
    for (const [id, g] of Object.entries(GLOSSARY)) if (!(CELLAR_TERMS as readonly string[]).includes(id)) texts.push([`term ${id}`, `${g.name} ${g.text}`]);
    for (const [where, text] of texts) expect(text, where).not.toMatch(COMBAT_WORDS);
  });

  it("no recipe, project or skill of the cellar shows before the rite, at any level", () => {
    const s = newGame(0, 1);
    s.notesRevealed = 99;
    s.experimentsOpen = true;
    for (const k of Object.keys(s.skills) as (keyof typeof s.skills)[]) s.skills[k].xp = xpForLevel(20);
    s.inventory = { iron_nail: 50, glass: 50, rags: 50, spun_thread: 5, stjohns: 5, yarrow: 9 };
    for (const k of ["warding", "crafting"] as const) expect(isSkillUnlocked(s, k)).toBe(false);
    for (const k of ["herbalism", "scavenging", "chandlery", "sigilcraft", "scholarship", "ritualism"] as const) {
      for (const id of revealedRecipes(s, k)) expect(ACTION_DEFS[id].requires, id).toBeUndefined();
    }
    expect(openProjects(s).filter((u) => UPGRADE_DEFS[u].requiresFeature === "cellar")).toEqual([]);
  });
});

describe("a fight's numbers and records", () => {
  it("counts time, XP and the biggest blows, and keeps them in the summary and the foe's records", () => {
    let s = must(beginFight(geared(), "kikimora"));
    s = advance(s, 2 * MIN).state;
    const f = s.fight!;
    expect(f.ms).toBe(2 * MIN);
    expect(f.xp).toBeGreaterThan(0);
    expect(f.bestDealt).toBeGreaterThan(0);
    expect(f.worstTaken).toBeGreaterThan(0);
    s = must(stopFight(s));
    expect(s.cellar.lastFight).toMatchObject({ ms: f.ms, xp: f.xp, bestDealt: f.bestDealt, worstTaken: f.worstTaken });
    expect(s.cellar.records.kikimora).toEqual({ bestDealt: f.bestDealt, worstTaken: f.worstTaken, longestRun: f.beaten });
    // A shorter fight never lowers a record.
    s = must(stopFight(advance(must(beginFight(s, "kikimora")), 5_000).state));
    expect(s.cellar.records.kikimora!.longestRun).toBe(f.beaten);
  });
});

describe("stop rules", () => {
  it("stop after N foes, at N of an item, or when the Belt is empty; work goes back to what ran before", () => {
    let s = geared();
    s.kept.skills.push("herbalism");
    s = must(start(s, "pick_nettle"));
    s = must(setStopRule(s, { kind: "foes", n: 5 }));
    let r = advance(must(beginFight(s, "skrzat")), 10 * MIN);
    expect(r.state.fight).toBeNull();
    expect(r.state.cellar.lastFight).toMatchObject({ end: "rule", beaten: 5 });
    expect(r.state.active?.id).toBe("pick_nettle");

    s = must(setStopRule(geared(), { kind: "item", item: "lost_button", n: 3 }));
    r = advance(must(beginFight(s, "skrzat")), 30 * MIN);
    expect(r.state.cellar.lastFight?.end).toBe("rule");
    expect(r.state.inventory.lost_button).toBe(3);

    s = geared();
    s.inventory.chamomile = 3;
    s = must(setRemedy(s, "chamomile"));
    s = must(setHealAt(s, 80));
    s = must(setStopRule(s, { kind: "remedies" }));
    r = advance(must(beginFight(s, "zmora")), 30 * MIN);
    expect(r.state.cellar.lastFight?.end).toBe("rule");
    expect(r.state.inventory.chamomile).toBe(0);
  });

  it("refuses silly numbers", () => {
    expect(setStopRule(geared(), { kind: "foes", n: 0 }).ok).toBe(false);
    expect(setStopRule(afterRite(), { kind: "never" }).ok).toBe(true);
  });
});

describe("foe mastery", () => {
  it("25, 100 and 250 beaten: more loot, more XP, harder blows against that foe; never for a boss", () => {
    const s = geared();
    expect(mastery(s, "skrzat")).toMatchObject({ tier: 0, next: 25 });
    const blow = matchup(s, "skrzat").yourBlow;
    s.cellar.beaten.skrzat = 250;
    expect(mastery(s, "skrzat")).toMatchObject({ tier: 3, loot: 1.25, xp: 0.25, strike: 0.1, next: null });
    expect(matchup(s, "skrzat").yourBlow).toBeCloseTo(blow * 1.1);
    s.cellar.beaten.domovoi = 300;
    expect(mastery(s, "domovoi").tier).toBe(0);
  });

  it("the XP bonus shows up in a fight", () => {
    const base = geared(5);
    const mastered = geared(5);
    mastered.cellar.beaten.skrzat = 100;
    const a = advance(must(beginFight(base, "skrzat")), 5 * MIN).report.xpGained.warding!;
    const b = advance(must(beginFight(mastered, "skrzat")), 5 * MIN).report.xpGained.warding!;
    expect(b).toBeGreaterThan(a * 1.15);
  });
});
