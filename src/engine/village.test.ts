import { describe, expect, it } from "vitest";
import { NOTES } from "../content/notes";
import { ACTION_DEFS } from "../content/actions";
import { PART_DEFS } from "../content/rite";
import { BOARD_SLOTS, REFILL_MS, REQUESTS } from "../content/requests";
import { build, buy, canBuild, canBuy, declineRequest, deliver } from "./commands";
import { actionDurationMs, offlineCapMs, omenCapacity } from "./modifiers";
import { UPGRADES } from "../content/upgrades";
import { omenShelfSuggested, projectsReady } from "./projects";
import { catchUp } from "./offline";
import { isFeatureOpen } from "./progress";
import { deserialize } from "./save";
import { advance, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { eligibleRequests, refillBoard } from "./village";

const T0 = 1_000_000;
const HOUR = 60 * 60 * 1000;
const VILLAGE_NOTE = NOTES.findIndex((n) => "opens" in n && (n.opens as readonly string[]).includes("village"));

/** A game where the village note has just appeared. */
function villageOpen(extra: Partial<GameState> = {}): GameState {
  const s: GameState = { ...newGame(T0, 3), notesRevealed: VILLAGE_NOTE + 1, ...extra };
  refillBoard(s, s.lastTickAt);
  return s;
}

function expectOk(r: ReturnType<typeof deliver>): GameState {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
}

describe("village board", () => {
  it("stays closed until the village note", () => {
    const s = newGame(T0, 3);
    refillBoard(s, T0);
    expect(isFeatureOpen(s, "village")).toBe(false);
    expect(s.board).toEqual([]);
  });

  it("opens with two contracts, only ones the player is trusted for", () => {
    const s = villageOpen();
    expect(s.board).toHaveLength(BOARD_SLOTS);
    expect(BOARD_SLOTS).toBe(2);
    for (const slot of s.board) {
      expect(slot.request).not.toBeNull();
      expect(REQUESTS[slot.request!].minTrust).toBe(0);
    }
    expect(new Set(s.board.map((b) => b.request)).size).toBe(2);
  });

  it("pays coin and trust, consumes the items, and empties the slot", () => {
    const base = villageOpen();
    const id = base.board[0]!.request!;
    const needs = REQUESTS[id].needs as Record<string, number>;
    const s = expectOk(deliver({ ...base, inventory: { ...needs } }, 0));
    expect(s.coin).toBe(REQUESTS[id].coin);
    expect(s.trust).toBe(REQUESTS[id].trust);
    for (const item of Object.keys(needs)) expect(s.inventory[item as keyof typeof s.inventory]).toBe(0);
    expect(s.board[0]).toEqual({ request: null, refillAt: T0 + REFILL_MS, delivered: {} });
  });

  it("refuses when the player has none of what they need", () => {
    expect(deliver(villageOpen(), 0).ok).toBe(false);
  });

  it("takes deliveries in parts, and pays only when the last part arrives", () => {
    const base = villageOpen();
    base.board[0] = { request: "stable_mark", refillAt: T0, delivered: {} };
    // Part one: some salt lines, no sigils yet.
    let s = expectOk(deliver({ ...base, inventory: { salt_line: 4 } }, 0));
    expect(s.board[0]!.delivered).toEqual({ salt_line: 4 });
    expect(s.inventory.salt_line).toBe(0);
    expect(s.coin).toBe(0);
    // Part two: more than enough; only what's still needed is taken.
    s = expectOk(deliver({ ...s, inventory: { salt_line: 10, ash_sigil: 4 } }, 0));
    expect(s.inventory.salt_line).toBe(8);
    expect(s.coin).toBe(REQUESTS.stable_mark.coin);
    expect(s.stats.requestsFilled).toBe(1);
    expect(s.board[0]!.request).toBeNull();
  });

  it("keeps what was delivered through a save", () => {
    const base = villageOpen();
    base.board[0] = { request: "stable_mark", refillAt: T0, delivered: {} };
    const s = expectOk(deliver({ ...base, inventory: { salt_line: 2 } }, 0));
    expect(deserialize(JSON.stringify(s)).board[0]!.delivered).toEqual({ salt_line: 2 });
  });

  it("older saves: three request slots become two contracts", () => {
    const old = { ...villageOpen(), version: 7, board: [{ request: "hana_soup", refillAt: T0 }, { request: "lye_ash", refillAt: T0 }, { request: null, refillAt: T0 }] };
    const loaded = deserialize(JSON.stringify(old));
    expect(loaded.board).toEqual([{ request: "hana_soup", refillAt: T0, delivered: {} }, { request: "lye_ash", refillAt: T0, delivered: {} }]);
  });

  it("refills an emptied slot after the wait, including while offline", () => {
    const s = expectOk(declineRequest(villageOpen(), 1));
    expect(s.board[1]!.request).toBeNull();
    expect(advance(s, REFILL_MS - 1).state.board[1]!.request).toBeNull();
    expect(catchUp(s, T0 + REFILL_MS).state.board[1]!.request).not.toBeNull();
  });

  it("offers better requests as trust grows", () => {
    expect(eligibleRequests(villageOpen({ trust: 0 }))).not.toContain("iron_cradle");
    const trusted = villageOpen({ trust: 5 });
    trusted.board = [];
    expect(eligibleRequests(trusted)).toContain("iron_cradle");
  });

  it("opens with the Offering, whose bread the village sells", () => {
    const note = NOTES[VILLAGE_NOTE]!;
    expect("goal" in note && note.goal).toEqual({ kind: "place", part: "offering" });
    expect(PART_DEFS.offering.items.bread).toBeGreaterThan(0);
    // Every request the board opens with can be made from skills open by then.
    const open = new Set(NOTES.slice(0, VILLAGE_NOTE + 1).flatMap((n) => [...n.unlocks]));
    for (const r of Object.values(REQUESTS).filter((r) => r.minTrust === 0)) {
      for (const item of Object.keys(r.needs)) expect(Object.values(ACTION_DEFS).some((a) => open.has(a.skill) && a.outputs.some((o) => o.item === item)), item).toBe(true);
    }
  });
});

describe("shop", () => {
  it("sells items for coin", () => {
    const r = buy(villageOpen({ coin: 10 }), "bread");
    if (!r.ok) throw new Error(r.reason);
    expect(r.state.coin).toBe(5);
    expect(r.state.inventory.bread).toBe(1);
  });

  it("is short of coin when it's short", () => {
    expect(canBuy(villageOpen({ coin: 1 }), "bread")).toBe("Not enough coin.");
  });

  it("is closed before the village opens", () => {
    expect(canBuy({ ...newGame(T0, 3), coin: 100 }, "bread")).not.toBeNull();
  });
});

describe("house projects", () => {
  it("need their materials, and use them", () => {
    const s = newGame(T0, 3);
    expect(canBuild(s, "reading_lamp")).toBe("Not enough materials yet.");
    const r = build({ ...s, inventory: { beeswax_candle: 7, glass: 8 } }, "reading_lamp");
    if (!r.ok) throw new Error(r.reason);
    expect(r.state.upgrades).toEqual(["reading_lamp"]);
    expect(r.state.inventory).toEqual({ beeswax_candle: 1, glass: 0 });
    expect(canBuild(r.state, "reading_lamp")).toBe("Already built.");
  });

  it("need no coin and no village: they're side work from the start", () => {
    expect(build({ ...newGame(T0, 3), inventory: { ...UPGRADES.omen_shelf.items } }, "omen_shelf").ok).toBe(true);
  });

  it("some need another first: the carved shelf after the omen shelf", () => {
    const s = { ...newGame(T0, 3), inventory: { ...UPGRADES.carved_shelf.items } };
    expect(canBuild(s, "carved_shelf")).toMatch(/omen shelf first/);
    expect(canBuild({ ...s, upgrades: ["omen_shelf" as const] }, "carved_shelf")).toBeNull();
  });
});

describe("pointing to projects", () => {
  it("suggests the omen shelf once the Light is placed, until it's built", () => {
    const s = newGame(T0, 3);
    expect(omenShelfSuggested(s)).toBe(false);
    const lit = { ...s, kindling: ["light" as const] };
    expect(omenShelfSuggested(lit)).toBe(true);
    expect(omenShelfSuggested({ ...lit, upgrades: ["omen_shelf" as const] })).toBe(false);
  });

  it("lists the projects that could be built right now", () => {
    const s = newGame(T0, 3);
    expect(projectsReady(s)).toEqual([]);
    expect(projectsReady({ ...s, inventory: { ...UPGRADES.omen_shelf.items } })).toEqual(["omen_shelf"]);
  });

  it("older saves start with no one-time pointers seen", () => {
    const old = { ...newGame(T0, 3), settings: { ...newGame().settings } } as GameState;
    delete (old.settings as Partial<GameState["settings"]>).introsSeen;
    expect(deserialize(JSON.stringify(old)).settings.introsSeen).toEqual([]);
  });
});

describe("omens and the shelf", () => {
  const working = (extra: Partial<GameState> = {}): GameState => ({ ...newGame(T0, 5), levelCap: 20, ...extra });

  it("no omens turn up before the omen shelf is built", () => {
    const { state, report } = advance(startAction(working(), "search_pantry"), 3000 * 3000);
    expect(report.actionsCompleted).toBeGreaterThan(2000);
    expect(report.omensFound).toEqual([]);
    expect(report.omensLost).toBe(0);
    expect(state.stats.omensSeen).toBe(0);
  });

  it("building the shelf brings the first omen, and then they turn up from work", () => {
    const r = build(working({ inventory: { ...UPGRADES.omen_shelf.items } }), "omen_shelf");
    if (!r.ok) throw new Error(r.reason);
    expect(r.gifts).toEqual(["still_night"]);
    expect(r.state.omens.still_night).toBe(1);
    expect(omenCapacity(r.state)).toBe(2);
    const { report } = advance(startAction(r.state, "search_pantry"), 3000 * 3000);
    expect(report.omensFound.length + report.omensLost).toBeGreaterThan(5);
  });

  it("older saves: whoever met omens keeps a shelf, and the old 3-omen shelf becomes the carved one", () => {
    const met = deserialize(JSON.stringify({ ...newGame(T0, 3), version: 7, omens: { still_night: 1 }, stats: { ...newGame().stats, omensSeen: 2 } }));
    expect(met.upgrades).toEqual(["omen_shelf"]);
    const bought = deserialize(JSON.stringify({ ...newGame(T0, 3), version: 7, upgrades: ["omen_shelf", "reading_lamp"], stats: { ...newGame().stats, omensSeen: 4 } }));
    expect(bought.upgrades).toEqual(["omen_shelf", "reading_lamp", "carved_shelf"]);
    expect(omenCapacity(bought)).toBe(3);
    const none = deserialize(JSON.stringify({ ...newGame(T0, 3), version: 7 }));
    expect(none.upgrades).toEqual([]);
  });
});

describe("upgrade effects", () => {
  it("reading lamp speeds up Scholarship by 15%", () => {
    const s = villageOpen();
    expect(actionDurationMs(s, "decipher_page")).toBe(ACTION_DEFS.decipher_page.seconds * 1000);
    expect(actionDurationMs({ ...s, upgrades: ["reading_lamp"] }, "decipher_page")).toBeCloseTo((ACTION_DEFS.decipher_page.seconds * 1000) / 1.15);
    expect(actionDurationMs({ ...s, upgrades: ["reading_lamp"] }, "pick_nettle")).toBe((ACTION_DEFS.pick_nettle.seconds * 1000));
  });

  it("drying rack adds about 10% to Herbalism yield", () => {
    const s = { ...villageOpen(), notesRevealed: NOTES.length };
    const plain = advance(startAction(s, "pick_nettle"), 3000 * 2000).state.inventory.nettle!;
    const racked = advance(startAction({ ...s, upgrades: ["drying_rack" as const] }, "pick_nettle"), 3000 * 2000).state.inventory.nettle!;
    expect(racked / plain).toBeGreaterThan(1.07);
    expect(racked / plain).toBeLessThan(1.13);
  });

  it("mended shutters raise the offline cap to 36 hours", () => {
    const s = villageOpen();
    expect(offlineCapMs(s)).toBe(24 * HOUR);
    expect(offlineCapMs({ ...s, upgrades: ["mended_shutters"] })).toBe(36 * HOUR);
    expect(catchUp({ ...s, upgrades: ["mended_shutters"] }, T0 + 48 * HOUR).report.elapsedMs).toBe(36 * HOUR);
  });
});

describe("save migration to v3", () => {
  it("shifts note progress past the inserted village note", () => {
    const v2 = { ...newGame(T0, 3), version: 2, notesRevealed: 6, offlineCapMs: 24 * HOUR } as Partial<GameState>;
    delete v2.stats;
    const loaded = deserialize(JSON.stringify(v2));
    // Old note 7 (after the shift) had opened the village and the Circle, and Ritualism; v5 keeps them.
    expect(loaded.kept.features).toEqual(["grimoire", "village", "circle"]);
    expect(loaded.kept.skills).toContain("ritualism");
    expect(loaded.stats.requestsFilled).toBe(0);
    expect("offlineCapMs" in loaded).toBe(false);
  });

  it("leaves early v2 saves alone", () => {
    const v2 = { ...newGame(T0, 3), version: 2, notesRevealed: 3 };
    const loaded = deserialize(JSON.stringify(v2));
    expect(loaded.kept.skills.sort()).toEqual(["chandlery", "herbalism", "scavenging"]);
    expect(loaded.kept.features).toEqual([]);
  });
});
