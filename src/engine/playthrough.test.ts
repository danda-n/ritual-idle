import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import { NOTES } from "../content/notes";
import { REQUESTS } from "../content/requests";
import { HEARTH_RITE } from "../content/rite";
import { SHOP } from "../content/shop";
import type { SkillId } from "../content/skills";
import { beginRite, buy, declineRequest, fillRequest, setSetting, type Result } from "./commands";
import { actionDurationMs } from "./modifiers";
import { currentNote, isRecipeKnown, isSkillUnlocked } from "./progress";
import { advance, blockReason, skillLevel, startAction } from "./simulate";
import { newGame, type GameState } from "./state";

// A scripted player that finishes Chapter 1 using only the real engine and commands:
// follow grandmother's notes, decipher pages to learn recipes, fill requests for coin,
// buy bread, make the rite's components and perform it. Active play only (no offline).
// It's the pacing check for Chapter 1 (docs/CHAPTER1.md §10).

const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];
const MAX_STEPS = 200_000;

class Bot {
  state: GameState;
  activeMs = 0;
  steps = 0;

  constructor(seed: number) {
    this.state = this.must(setSetting(newGame(0, seed), "fallback", "stop"));
  }

  must(r: Result): GameState {
    if (!r.ok) throw new Error(r.reason);
    return r.state;
  }

  guard() {
    if (++this.steps > MAX_STEPS) throw new Error(`Soft-lock: stuck at note ${this.state.notesRevealed} ("${currentNote(this.state).text.slice(0, 40)}…")`);
  }

  /** Do one repetition of an action (its inputs must already be on hand). */
  once(id: ActionId) {
    this.guard();
    const s = startAction(this.state, id);
    const ms = actionDurationMs(s, id);
    this.state = advance(s, ms).state;
    this.activeMs += ms;
  }

  wait(ms: number) {
    this.guard();
    this.state = advance(this.state, ms).state;
    this.activeMs += ms;
  }

  producer(item: ItemId): ActionId {
    const id = ACTION_IDS.find((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
    if (!id) throw new Error(`Nothing makes ${item}`);
    return id;
  }

  /** Make sure an action can run: its skill unlocked, recipe known, level reached. */
  enable(id: ActionId) {
    const def = ACTION_DEFS[id];
    if (!isSkillUnlocked(this.state, def.skill)) throw new Error(`${def.skill} is not unlocked yet (needed for ${id})`);
    while (!isRecipeKnown(this.state, id)) this.run("decipher_page");
    this.train(def.skill, def.level);
  }

  /** Perform an action once, gathering its inputs first. */
  run(id: ActionId) {
    this.enable(id);
    for (const [item, qty] of Object.entries(ACTION_DEFS[id].inputs) as [ItemId, number][]) this.ensure(item, qty);
    this.once(id);
  }

  train(skill: SkillId, level: number) {
    while (skillLevel(this.state, skill) < level) {
      // Best XP per second among actions the player can run, preferring ones without inputs.
      const options = ACTION_IDS.filter((a) => {
        const d = ACTION_DEFS[a];
        return d.skill === skill && d.level <= skillLevel(this.state, skill) && isRecipeKnown(this.state, a);
      });
      const score = (a: ActionId) => (ACTION_DEFS[a].xp / ACTION_DEFS[a].seconds) * (Object.keys(ACTION_DEFS[a].inputs).length ? 0.6 : 1);
      this.run(options.sort((a, b) => score(b) - score(a))[0]!);
    }
  }

  ensure(item: ItemId, qty: number) {
    if (item === "bread") {
      while ((this.state.inventory.bread ?? 0) < qty) {
        this.earn(SHOP.bread.cost);
        this.state = this.must(buy(this.state, "bread"));
      }
      return;
    }
    const id = this.producer(item);
    while ((this.state.inventory[item] ?? 0) < qty) this.run(id);
  }

  /** Earn coin by filling whatever request the bot can make; turn away the rest. */
  earn(coin: number) {
    while (this.state.coin < coin) this.fillOne();
  }

  fillOne() {
    const makeable = (id: keyof typeof REQUESTS) =>
      (Object.keys(REQUESTS[id].needs) as ItemId[]).every((item) => {
        if (item === "bread") return false;
        // Only requests it can make at its current levels (a real player wouldn't grind for one).
        const p = ACTION_IDS.find((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
        return p !== undefined && isSkillUnlocked(this.state, ACTION_DEFS[p].skill) && ACTION_DEFS[p].level <= skillLevel(this.state, ACTION_DEFS[p].skill);
      });
    const slot = this.state.board.findIndex((b) => b.request && makeable(b.request));
    if (slot < 0) {
      const busy = this.state.board.findIndex((b) => b.request);
      if (busy >= 0) this.state = this.must(declineRequest(this.state, busy));
      this.wait(31_000);
      return;
    }
    const req = REQUESTS[this.state.board[slot]!.request!];
    for (const [item, qty] of Object.entries(req.needs) as [ItemId, number][]) this.ensure(item, qty);
    this.state = this.must(fillRequest(this.state, slot));
  }

  /** Work toward the current note's goal. Returns false when the next goal is the rite. */
  followNote(): boolean {
    const note = currentNote(this.state);
    if (!("goal" in note)) return false;
    const goal = note.goal;
    if (goal.kind === "rite") return false;
    if (goal.kind === "requests") this.fillOne();
    else this.run(goal.action);
    return true;
  }

  performRite() {
    for (const [item, qty] of Object.entries(HEARTH_RITE.items) as [ItemId, number][]) this.ensure(item, qty);
    for (const [skill, level] of Object.entries(HEARTH_RITE.skills) as [SkillId, number][]) this.train(skill, level);
    // Making later components can use up earlier ones (salt), so top up until it can begin.
    let r = beginRite(this.state);
    while (!r.ok) {
      for (const [item, qty] of Object.entries(HEARTH_RITE.items) as [ItemId, number][]) this.ensure(item, qty);
      r = beginRite(this.state);
      this.guard();
    }
    this.state = r.state;
    this.wait(HEARTH_RITE.durationMs);
  }

  play() {
    while (this.followNote());
    this.performRite();
    return this;
  }
}

describe("Chapter 1 playthrough", () => {
  const seeds = [1, 2, 3, 4, 5];
  const runs = seeds.map((seed) => new Bot(seed).play());

  it("can be finished from a fresh game, with every note reached", () => {
    for (const bot of runs) {
      expect(bot.state.rite.completed).not.toBeNull();
      expect(bot.state.notesRevealed).toBe(NOTES.length);
      expect(bot.state.followers).toContain("janko");
      expect(bot.state.levelCap).toBe(HEARTH_RITE.rewards.levelCap);
      expect(blockReason(bot.state, "pick_nettle")).toBeNull();
    }
  });

  it("takes an efficient player ~60 min of preparation plus the 30-min rite (band 45–150 min)", () => {
    const minutes = runs.map((b) => Math.round(b.activeMs / 60_000));
    console.log(`Chapter 1 active time by seed: ${minutes.join(", ")} min (rite included)`);
    for (const m of minutes) {
      expect(m).toBeGreaterThanOrEqual(45);
      expect(m).toBeLessThanOrEqual(150);
    }
  });
});
