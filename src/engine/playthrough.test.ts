import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import { NOTES } from "../content/notes";
import { REQUESTS } from "../content/requests";
import { HEARTH_RITE, PART_DEFS, type PartId } from "../content/rite";
import { BRANCHES } from "../content/talents";
import { SHOP } from "../content/shop";
import type { SkillId } from "../content/skills";
import { beginRite, buy, declineRequest, fillRequest, placePart, setSetting, spendTalent, type Result } from "./commands";
import { actionDurationMs } from "./modifiers";
import { currentNote, isRecipeKnown, isSkillUnlocked, type Step } from "./progress";
import { advance, blockReason, skillLevel, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";
import { pointsFree, rankOf } from "./talents";
import { SKILL_IDS } from "../content/skills";

// A scripted player that finishes Chapter 1 using only the real engine and commands. It follows
// each stage's steps literally (make exactly what the step says), places each part, spends talent
// points, fills requests for bread, then performs the rite. Idle play: it never tends or releases
// omens. It's the pacing check for Chapter 1 (docs/CHAPTER1.md §10), and the no-grind check:
// if anything needs a level the steps didn't earn, that's recorded as grinding and the test fails.

const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];
const MAX_STEPS = 200_000;

class Bot {
  state: GameState;
  activeMs = 0;
  steps = 0;
  /** Active time (ms) at which each note appeared, by note index. */
  noteAt: number[] = [0];
  /** Times it had to train a level the steps hadn't earned. */
  grinds: { at: string; action: ActionId; need: number; had: number; short: number }[] = [];
  /** The step being worked on (for grind reports and the step table). */
  doing = "start";
  stepLog: { id: string; minutes: number }[] = [];

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
    this.after();
  }

  wait(ms: number) {
    this.guard();
    this.state = advance(this.state, ms).state;
    this.activeMs += ms;
    this.after();
  }

  /** Note the time of new notes, and spend any talent points. */
  after() {
    while (this.noteAt.length < this.state.notesRevealed) this.noteAt.push(this.activeMs);
    for (const skill of SKILL_IDS) {
      while (isSkillUnlocked(this.state, skill) && pointsFree(this.state, skill) > 0) {
        // Swift first (filling it blooms the keystone), then Plenty and Fortune.
        const branch = rankOf(this.state, skill, "swift") < BRANCHES.swift.maxRank ? "swift" : rankOf(this.state, skill, "plenty") < BRANCHES.plenty.maxRank ? "plenty" : "fortune";
        this.state = this.must(spendTalent(this.state, skill, branch));
      }
    }
  }

  producer(item: ItemId): ActionId {
    const id = ACTION_IDS.find((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
    if (!id) throw new Error(`Nothing makes ${item}`);
    return id;
  }

  /** Make sure an action can run: its skill unlocked, recipe known, level reached (else it's grinding). */
  enable(id: ActionId) {
    const def = ACTION_DEFS[id];
    if (!isSkillUnlocked(this.state, def.skill)) throw new Error(`${def.skill} is not unlocked yet (needed for ${id})`);
    while (!isRecipeKnown(this.state, id)) this.run("decipher_page");
    const had = skillLevel(this.state, def.skill);
    if (had < def.level) {
      this.grinds.push({ at: this.doing, action: id, need: def.level, had, short: xpForLevel(def.level) - this.state.skills[def.skill].xp });
      this.train(def.skill, def.level);
    }
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

  /** Do the current stage's steps in order, then its goal. Returns false when the next goal is the rite. */
  followNote(): boolean {
    const note = currentNote(this.state);
    if (!("goal" in note)) return false;
    const at = this.state.notesRevealed;
    for (const step of ("steps" in note ? note.steps : []) as readonly Step[]) {
      if (this.state.notesRevealed !== at) break;
      this.doing = step.id;
      const g = step.goal;
      if (g.kind === "complete") while ((this.state.stats.completed[g.action] ?? 0) < g.count) this.run(g.action);
      else if (g.kind === "requests") while (this.state.stats.requestsFilled < g.count) this.fillOne();
      else if (g.kind === "place") this.place(g.part as PartId);
      this.stepLog.push({ id: step.id, minutes: this.activeMs / MIN });
    }
    if (this.state.notesRevealed !== at) return true;
    const goal = note.goal;
    if (goal.kind === "rite") return false;
    this.doing = `${at}.goal`;
    if (goal.kind === "place") this.place(goal.part);
    else if (goal.kind === "complete") while ((this.state.stats.completed[goal.action] ?? 0) < goal.count) this.run(goal.action);
    return true;
  }

  /** Make a Kindling part's items and place it. Making later items can use up earlier ones (salt), so top up. */
  place(part: PartId) {
    const items = Object.entries(PART_DEFS[part].items) as [ItemId, number][];
    // Every item a part needs must come from a skill that's already open (the complaint this fixes).
    for (const [item] of items) {
      if (item !== "bread" && !isSkillUnlocked(this.state, ACTION_DEFS[this.producer(item)].skill)) throw new Error(`${part} needs ${item}, from a skill not yet open`);
    }
    while (!items.every(([item, qty]) => (this.state.inventory[item] ?? 0) >= qty)) {
      for (const [item, qty] of items) this.ensure(item, qty);
      this.guard();
    }
    this.state = this.must(placePart(this.state, part));
    this.after();
  }

  performRite() {
    this.doing = "rite";
    for (const [skill, level] of Object.entries(HEARTH_RITE.skills) as [SkillId, number][]) {
      const had = skillLevel(this.state, skill);
      if (had < level) this.grinds.push({ at: "rite", action: "bless_threshold", need: level, had, short: xpForLevel(level) - this.state.skills[skill].xp });
      this.train(skill, level);
    }
    this.riteAt = this.activeMs;
    this.leftAtRite = { ...this.state.inventory };
    this.state = this.must(beginRite(this.state));
    this.wait(HEARTH_RITE.durationMs);
  }

  riteAt = 0;
  leftAtRite: Partial<Record<ItemId, number>> = {};


  play() {
    while (this.followNote());
    this.performRite();
    return this;
  }
}

const MIN = 60_000;
/** When each skill first opened (active minutes), in the order they opened. */
function skillTimes(bot: Bot): { skill: SkillId; at: number }[] {
  return bot.noteAt.flatMap((at, i) => (NOTES[i]!.unlocks as readonly SkillId[]).map((skill) => ({ skill, at: at / MIN })));
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

  it("never needs grinding: following the steps earns every level the next step needs", () => {
    const bot = runs[0]!;
    console.log(`Steps (seed 1, minutes): ${bot.stepLog.map((st) => `${st.id} ${st.minutes.toFixed(1)}`).join(" · ")}`);
    for (const b of runs) {
      const report = b.grinds.map((g) => `${g.at}: ${g.action} needs level ${g.need}, had ${g.had} (${g.short} XP short)`);
      expect(report, "grinding needed").toEqual([]);
    }
  });

  it("makes nothing without a use: crafted things are all spent by the rite", () => {
    const crafted: ItemId[] = ["tallow_candle", "beeswax_candle", "salt_line", "ash_sigil", "smudge", "mugwort_incense", "deciphered_page", "consecrated_salt", "litany"];
    console.log(`Left over at the rite (seed 1): ${JSON.stringify(runs[0]!.leftAtRite)}`);
    for (const b of runs) for (const item of crafted) expect(b.leftAtRite[item] ?? 0, item).toBeLessThanOrEqual(3);
  });

  it("reaches the rite in 20–34 min of active play", () => {
    const minutes = runs.map((b) => Math.round(b.riteAt / MIN));
    console.log(`Chapter 1 rite begins at: ${minutes.join(", ")} min (then the ~5-min rite)`);
    const bot = runs[0]!;
    const names = ["Start", ...Object.values(PART_DEFS).map((p) => p.name.replace("The ", "")), "Perform"];
    console.log(`Stages (seed 1): ${bot.noteAt.slice(0, names.length).map((at, i) => `${names[i]} ${(at / MIN).toFixed(1)}`).join(" · ")} · rite ${(bot.riteAt / MIN).toFixed(1)} min`);
    for (const m of minutes) {
      expect(m).toBeGreaterThanOrEqual(20);
      expect(m).toBeLessThanOrEqual(34);
    }
  });

  it("spreads the skills out: after the first candle, no two skills open within 3 minutes", () => {
    for (const bot of runs) {
      const times = skillTimes(bot);
      expect(times.map((t) => t.skill)).toEqual(["scavenging", "chandlery", "sigilcraft", "herbalism", "scholarship", "ritualism"]);
      // Scavenging and Chandlery are the tutorial pair; from there on, one skill per stage.
      for (let i = 2; i < times.length; i++) expect(times[i]!.at - times[i - 1]!.at).toBeGreaterThanOrEqual(3);
    }
  });

  it("each skill's stage takes 3–10 minutes", () => {
    for (const bot of runs) {
      // Light, Ward, Smoke and Words run note to note. Ritualism's stage is the Offering plus
      // Perform (which brings no new skill), so it runs from the Offering note to the rite.
      const starts = bot.noteAt.slice(1, 6);
      const ends = [...bot.noteAt.slice(2, 6), bot.riteAt];
      for (let i = 0; i < 5; i++) {
        const m = (ends[i]! - starts[i]!) / MIN;
        expect(m, `stage ${i + 1}`).toBeGreaterThanOrEqual(3);
        expect(m, `stage ${i + 1}`).toBeLessThanOrEqual(10);
      }
    }
  });
});
