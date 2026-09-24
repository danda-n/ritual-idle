import { describe, expect, it } from "vitest";
import { NOTES } from "../content/notes";
import { ACTION_DEFS } from "../content/actions";
import { PART_DEFS } from "../content/rite";
import { REFILL_MS, REQUESTS } from "../content/requests";
import { buy, canBuy, declineRequest, fillRequest } from "./commands";
import { actionDurationMs, offlineCapMs } from "./modifiers";
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

function expectOk(r: ReturnType<typeof fillRequest>): GameState {
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

  it("opens with three requests, only ones the player is trusted for", () => {
    const s = villageOpen();
    expect(s.board).toHaveLength(3);
    for (const slot of s.board) {
      expect(slot.request).not.toBeNull();
      expect(REQUESTS[slot.request!].minTrust).toBe(0);
    }
    expect(new Set(s.board.map((b) => b.request)).size).toBe(3);
  });

  it("pays coin and trust, consumes the items, and empties the slot", () => {
    const base = villageOpen();
    const id = base.board[0]!.request!;
    const needs = REQUESTS[id].needs as Record<string, number>;
    const s = expectOk(fillRequest({ ...base, inventory: { ...needs } }, 0));
    expect(s.coin).toBe(REQUESTS[id].coin);
    expect(s.trust).toBe(REQUESTS[id].trust);
    for (const item of Object.keys(needs)) expect(s.inventory[item as keyof typeof s.inventory]).toBe(0);
    expect(s.board[0]).toEqual({ request: null, refillAt: T0 + REFILL_MS });
  });

  it("refuses when the player lacks the items", () => {
    expect(fillRequest(villageOpen(), 0).ok).toBe(false);
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

  it("sells each upgrade once, and only with enough coin", () => {
    expect(canBuy(villageOpen({ coin: 10 }), "reading_lamp")).toBe("Not enough coin.");
    const r = buy(villageOpen({ coin: 200 }), "reading_lamp");
    if (!r.ok) throw new Error(r.reason);
    expect(canBuy(r.state, "reading_lamp")).toBe("Already done.");
  });

  it("is closed before the village opens", () => {
    expect(canBuy({ ...newGame(T0, 3), coin: 100 }, "bread")).not.toBeNull();
  });
});

describe("upgrade effects", () => {
  it("reading lamp speeds up Scholarship by 15%", () => {
    const s = villageOpen();
    expect(actionDurationMs(s, "decipher_page")).toBe(4000);
    expect(actionDurationMs({ ...s, upgrades: ["reading_lamp"] }, "decipher_page")).toBeCloseTo(4000 / 1.15);
    expect(actionDurationMs({ ...s, upgrades: ["reading_lamp"] }, "pick_nettle")).toBe(2000);
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
