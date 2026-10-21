import { describe, expect, it } from "vitest";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import { NOTES } from "../content/notes";
import { REQUESTS } from "../content/requests";
import { HEARTH_RITE, PART_DEFS, QUALITIES, RITE_MS, type PartId } from "../content/rite";
import type { Side } from "../content/talents";
import { SHOP } from "../content/shop";
import type { SkillId } from "../content/skills";
import { beginRite, buy, chooseStage, claimReward, declineRequest, deliver, placePart, setSetting, chooseTalent, type Result } from "./commands";
import { actionDurationMs, actionInputs } from "./modifiers";
import { makerOf, shortfall } from "./estimates";
import { offerOf } from "./village";
import { currentNote, isRecipeKnown, isSkillUnlocked, isStepMet, stageChoices, stageOrder, stepById, type Step } from "./progress";
import { advance, blockReason, skillLevel, startAction } from "./simulate";
import { newGame, type GameState } from "./state";
import { xpForLevel } from "./xp";
import { choicesWaiting } from "./talents";
import { SKILL_IDS } from "../content/skills";
import { FOE_DEFS, FOE_IDS, PIECE_DEFS, PIECE_IDS, SLOTS, type FoeId, type PieceId, type Slot } from "../content/combat";
import { beginFight, chooseAffix, craftPiece, setHealAt, setRemedy, wear } from "./commands";
import { canFight, combatStats, readiness, wardingLevel, type Readiness } from "./combat";

// A scripted player that finishes Chapter 1 using only the real engine and commands. It follows
// each stage's steps literally (make exactly what the step says), places each part, takes a side
// of each talent pair (all "a" or all "b"), fills requests for bread, then performs the rite. Idle play: it never tends or releases
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

  /** The order it takes the free middle parts in. */
  order: PartId[];

  /** The side it takes of every talent pair. */
  side: Side;

  constructor(seed: number, order: PartId[] = ["ward", "smoke", "words"], side: Side = "a") {
    this.state = this.must(setSetting(newGame(0, seed), "fallback", "stop"));
    this.order = order;
    this.side = side;
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

  /** Note the time of new notes, claim rewards, and choose any talents waiting. */
  after() {
    for (const id of [...this.state.rewardsWaiting]) {
      const r = stepById(id)!.reward!;
      this.state = this.must(claimReward(this.state, id, "xpChoice" in r ? r.xpChoice.suggest : undefined));
    }
    while (this.noteAt.length < this.state.notesRevealed) this.noteAt.push(this.activeMs);
    for (const skill of SKILL_IDS) {
      if (!isSkillUnlocked(this.state, skill)) continue;
      for (const level of choicesWaiting(this.state, skill)) this.state = this.must(chooseTalent(this.state, skill, level, this.side));
    }
  }

  /**
   * What to make an item with: a recipe it can already run that makes the item every time, the
   * highest level first (salt from the barrel once Scavenging reaches 7), else the first maker.
   */
  producer(item: ItemId): ActionId {
    const makers = ACTION_IDS.filter((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item));
    if (makers.length === 0) throw new Error(`Nothing makes ${item}`);
    const sure = makers
      .filter((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item && o.chance === undefined))
      .filter((a) => isSkillUnlocked(this.state, ACTION_DEFS[a].skill) && isRecipeKnown(this.state, a) && ACTION_DEFS[a].level <= skillLevel(this.state, ACTION_DEFS[a].skill))
      .sort((a, b) => ACTION_DEFS[b].level - ACTION_DEFS[a].level);
    return sure[0] ?? makers[0]!;
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
    for (const [item, qty] of Object.entries(actionInputs(this.state, id)) as [ItemId, number][]) this.ensure(item, qty);
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
    // Spirits' leavings come from fights in the cellar, not recipes.
    if (!ACTION_IDS.some((x) => ACTION_DEFS[x].outputs.some((o) => o.item === item))) return this.ensureCellar(item, qty);
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
    // What the board asks, as scaled for the trust level and the slot.
    const offer = offerOf(this.state.board[slot]!)!;
    for (const [item, qty] of Object.entries(offer.needs) as [ItemId, number][]) this.ensure(item, qty);
    this.state = this.must(deliver(this.state, slot));
  }

  /** Do the current stage's steps in order, then its goal. Returns false when the next goal is the rite. */
  followNote(): boolean {
    // A free choice: take the next part in this bot's order.
    const choices = stageChoices(this.state);
    if (choices.length > 0) {
      const pick = this.order.find((p) => choices.includes(p))!;
      this.state = this.must(chooseStage(this.state, pick));
      this.after();
    }
    const note = currentNote(this.state);
    if (!("goal" in note)) return false;
    const at = this.state.notesRevealed;
    for (const step of ("steps" in note ? note.steps : []) as readonly Step[]) {
      if (this.state.notesRevealed !== at) break;
      this.doing = step.id;
      const g = step.goal;
      if (g.kind === "complete") while (!isStepMet(this.state, step)) this.run(g.action);
      else if (g.kind === "requests") while (this.state.stats.requestsFilled < g.count) this.fillOne();
      else if (g.kind === "place") this.place(g.part as PartId);
      this.stepLog.push({ id: step.id, minutes: this.activeMs / MIN });
    }
    if (this.state.notesRevealed !== at || stageChoices(this.state).length > 0) return true;
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
    // Like a player reading the checklist: work up from the lowest-level recipe, raw things before
    // what's made from them, so each step earns the levels the next one needs.
    const plan = shortfall(this.state, part);
    const lvl = (item: ItemId) => {
      const m = makerOf(this.state, item);
      return m ? ACTION_DEFS[m].level : 0;
    };
    // One target per item: the part's own need plus what other recipes on the way use of it.
    const byItem = new Map<ItemId, { item: ItemId; target: number; depth: number }>();
    for (const l of plan.items) byItem.set(l.item, { item: l.item, target: l.need, depth: 0 });
    for (const l of plan.short) {
      const had = byItem.get(l.item);
      if (had) byItem.set(l.item, { ...had, target: had.target + l.qty, depth: Math.max(had.depth, l.depth) });
      else byItem.set(l.item, { item: l.item, target: (this.state.inventory[l.item] ?? 0) + l.qty, depth: l.depth });
    }
    const tasks = [...byItem.values()].sort((a, b) => lvl(a.item) - lvl(b.item) || b.depth - a.depth);
    for (const t of tasks) {
      this.doing = `${part}: ${t.item}`;
      this.ensure(t.item, t.target);
    }
    this.doing = `${part}.place`;
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
    // The rite runs by itself.
    this.wait(RITE_MS);
  }

  riteAt = 0;
  leftAtRite: Partial<Record<ItemId, number>> = {};


  play() {
    while (this.followNote());
    this.performRite();
    return this;
  }

  // ---------- The cellar (docs/COMBAT.md §9) ----------

  cellarStart = 0;
  /** When the Domovoi first read Likely, with the levels then; and when he was calmed. */
  domovoiLikely: { at: number; warding: number; crafting: number } | null = null;
  calmedAt: number | null = null;
  piecesAt: { piece: PieceId; minutes: number }[] = [];

  /** Which foe leaves an item behind. */
  dropper(item: ItemId): FoeId {
    return FOE_IDS.find((f) => FOE_DEFS[f].loot.some((l) => l.item === item))!;
  }

  /** Fight a foe for `ms` (or until the fight ends), with the best gear for it. */
  fight(foe: FoeId, ms: number) {
    this.dress(foe);
    this.state = this.must(beginFight(this.state, foe));
    let left = ms;
    while (this.state.fight && left > 0) {
      const step = Math.min(left, 30_000);
      this.wait(step);
      left -= step;
    }
    // Driven off (or done): catch your breath doing something useful.
    if (this.state.fight) this.state = { ...this.state, fight: null };
  }

  /** Put on the pieces that suit this foe: its feared tag where you have it, else the strongest. */
  dress(foe: FoeId) {
    const weak = FOE_DEFS[foe].weakness;
    for (const slot of SLOTS) {
      const held = this.state.cellar.pieces.filter((p) => PIECE_DEFS[p.id].slot === slot);
      const score = (id: PieceId) => (PIECE_DEFS[id].tag === weak ? 100 : 0) + (PIECE_DEFS[id].base.strike ?? 0) + (PIECE_DEFS[id].base.ward ?? 0) / 3 + (PIECE_DEFS[id].base.health ?? 0);
      const best = held.map((p) => p.id).sort((a, b) => score(b) - score(a))[0];
      if (best) this.state = this.must(wear(this.state, slot as Slot, best));
    }
  }

  ensureCellar(item: ItemId, qty: number) {
    const foe = FOE_IDS.find((f) => FOE_DEFS[f].loot.some((l) => l.item === item));
    if (foe && !ACTION_IDS.some((a) => ACTION_DEFS[a].outputs.some((o) => o.item === item))) {
      while ((this.state.inventory[item] ?? 0) < qty) {
        if (canFight(this.state, foe) !== null) this.trainWarding();
        else this.fight(foe, 60_000);
        this.guard();
      }
      return;
    }
    this.ensure(item, qty);
  }

  /** The next piece to make: the lowest level not held, once Crafting reaches it. */
  nextPiece(): PieceId | null {
    return PIECE_IDS.filter((p) => !this.state.cellar.pieces.some((x) => x.id === p)).sort((a, b) => PIECE_DEFS[a].level - PIECE_DEFS[b].level)[0] ?? null;
  }

  makePiece(id: PieceId) {
    while (skillLevel(this.state, "crafting") < PIECE_DEFS[id].level) this.train("crafting", PIECE_DEFS[id].level);
    for (const [item, qty] of Object.entries(PIECE_DEFS[id].items) as [ItemId, number][]) {
      if (FOE_IDS.some((f) => FOE_DEFS[f].loot.some((l) => l.item === item))) this.ensureCellar(item, qty);
    }
    for (const [item, qty] of Object.entries(PIECE_DEFS[id].items) as [ItemId, number][]) this.ensure(item, qty);
    this.state = this.must(craftPiece(this.state, id));
    while (this.state.job) this.wait(5_000);
    // Choose the option that helps most: Strike, then Health, then the rest.
    const order = ["strike", "health", "ward", "speed", "telling", "perFoe", "specials", "beltCap", "remedyHeal", "loot", "xp"];
    const opts = this.state.cellar.pending!.options;
    const pick = opts.map((o, i) => ({ i, rank: order.indexOf(o.kind) * 100 - o.value })).sort((a, b) => a.rank - b.rank)[0]!.i;
    this.state = this.must(chooseAffix(this.state, pick));
    this.piecesAt.push({ piece: id, minutes: (this.activeMs - this.cellarStart) / MIN });
  }

  /** The best foe for Warding XP that's Safe or Likely now. */
  trainWarding() {
    const ok = (t: Readiness) => t === "Safe" || t === "Likely";
    const foes = FOE_IDS.filter((f) => !FOE_DEFS[f].boss && canFight(this.state, f) === null).filter((f) => {
      this.dress(f);
      return ok(readiness(this.state, f).tag);
    });
    const foe = foes.sort((a, b) => FOE_DEFS[b].xp - FOE_DEFS[a].xp)[0] ?? "skrzat";
    this.fight(foe, 2 * MIN);
  }

  remedyFor(): void {
    const poultice = skillLevel(this.state, "herbalism") >= 9;
    const remedy = poultice ? "yarrow_poultice" : "chamomile";
    this.ensure(remedy, combatStats(this.state).beltCap);
    this.state = this.must(setRemedy(this.state, remedy));
    this.state = this.must(setHealAt(this.state, 50));
  }

  /** After the Kindling: make gear, ward off the cellar's foes, and calm the Domovoi. */
  playCellar(limitMinutes = 240) {
    this.cellarStart = this.activeMs;
    this.state = this.must(setSetting(this.state, "fallback", "stop"));
    while (!this.state.cellar.gifts.includes("domovoi")) {
      if ((this.activeMs - this.cellarStart) / MIN > limitMinutes) throw new Error(`Cellar not done in ${limitMinutes} min: Warding ${wardingLevel(this.state)}, Crafting ${skillLevel(this.state, "crafting")}, pieces ${this.state.cellar.pieces.map((p) => p.id).join(", ")}`);
      this.dress("domovoi");
      if (this.state.cellar.pieces.some((p) => PIECE_DEFS[p.id].slot === "belt")) this.remedyFor();
      const tag = readiness(this.state, "domovoi").tag;
      if (tag === "Likely" || tag === "Safe") {
        this.domovoiLikely ??= { at: (this.activeMs - this.cellarStart) / MIN, warding: wardingLevel(this.state), crafting: skillLevel(this.state, "crafting") };
        this.fight("domovoi", 10 * MIN);
        if (this.state.cellar.gifts.includes("domovoi")) break;
        continue;
      }
      // Like a player: make the next piece once Crafting reaches it; otherwise train whichever of
      // the two skills is behind (Crafting through its components, Warding on the best safe foe).
      const next = this.nextPiece();
      const crafting = skillLevel(this.state, "crafting");
      if (next && PIECE_DEFS[next].level <= crafting) this.makePiece(next);
      else if (next && crafting <= wardingLevel(this.state)) this.train("crafting", crafting + 1);
      else this.trainWarding();
    }
    this.calmedAt = (this.activeMs - this.cellarStart) / MIN;
    return this;
  }
}

const MIN = 60_000;
/** When each skill first opened (active minutes), in the order they opened. */
function skillTimes(bot: Bot): { skill: SkillId; at: number }[] {
  const order = stageOrder(bot.state);
  return bot.noteAt.flatMap((at, i) => (order[i]!.unlocks as readonly SkillId[]).map((skill) => ({ skill, at: at / MIN })));
}

describe("Chapter 1 playthrough", () => {
  // Every order of the three free middle parts, on two seeds each.
  const orders: PartId[][] = [
    ["ward", "smoke", "words"], ["ward", "words", "smoke"], ["smoke", "ward", "words"],
    ["smoke", "words", "ward"], ["words", "ward", "smoke"], ["words", "smoke", "ward"],
  ];
  const runs = orders.flatMap((order) => [1, 2].map((seed) => new Bot(seed, order).play()));
  // The other side of every talent pair, in two orders: the chapter still works with that build.
  const otherBuild = [orders[0]!, orders[5]!].map((order) => new Bot(3, order, "b").play());
  const all = [...runs, ...otherBuild];

  it("can be finished from a fresh game, with every note reached, with either talent build", () => {
    for (const bot of all) {
      expect(bot.state.rite.completed).not.toBeNull();
      expect(bot.state.notesRevealed).toBe(NOTES.length);
      expect(bot.state.followers).toContain("janko");
      expect(bot.state.levelCap).toBe(HEARTH_RITE.rewards.levelCap);
      expect(blockReason(bot.state, "pick_nettle")).toBeNull();
      // No offerings made: Sound (quality only changes lore and a keepsake).
      expect(QUALITIES[bot.state.rite.completed!.quality]).toBe("Sound");
    }
  });

  it("never needs grinding: following the steps earns every level the next step needs", () => {
    const bot = runs[0]!;
    console.log(`Steps (seed 1, minutes): ${bot.stepLog.map((st) => `${st.id} ${st.minutes.toFixed(1)}`).join(" · ")}`);
    for (const b of all) {
      const report = b.grinds.map((g) => `${g.at}: ${g.action} needs level ${g.need}, had ${g.had} (${g.short} XP short)`);
      expect(report, "grinding needed").toEqual([]);
    }
  });

  it("makes nothing without a use: crafted things are all spent by the rite", () => {
    const crafted: ItemId[] = ["tallow_candle", "beeswax_candle", "salt_line", "ash_sigil", "smudge", "mugwort_incense", "deciphered_page", "consecrated_salt", "litany"];
    console.log(`Left over at the rite (seed 1): ${JSON.stringify(runs[0]!.leftAtRite)}`);
    for (const b of all) for (const item of crafted) expect(b.leftAtRite[item] ?? 0, item).toBeLessThanOrEqual(3);
  });

  it("reaches the rite in 28–45 min of active play, in every order", () => {
    const minutes = runs.map((b) => Math.round(b.riteAt / MIN));
    console.log(`Chapter 1 rite begins at: ${minutes.join(", ")} min (then the ~3-min rite)`);
    const bot = runs[0]!;
    const names = stageOrder(bot.state).map((n, i) => ("goal" in n && n.goal.kind === "place" ? PART_DEFS[n.goal.part as PartId].name.replace("The ", "") : "goal" in n && n.goal.kind === "rite" ? "Perform" : i === 0 ? "Start" : "End"));
    console.log(`Stages (seed 1): ${bot.noteAt.slice(0, names.length).map((at, i) => `${names[i]} ${(at / MIN).toFixed(1)}`).join(" · ")} · rite ${(bot.riteAt / MIN).toFixed(1)} min`);
    for (const m of minutes) {
      expect(m).toBeGreaterThanOrEqual(28);
      expect(m).toBeLessThanOrEqual(45);
    }
  });

  it("spreads the skills out: after the first candle, no two skills open within 3 minutes", () => {
    for (const bot of runs) {
      const times = skillTimes(bot);
      const skills = times.map((t) => t.skill);
      // The tutorial pair first, Ritualism last, the middle three in the order chosen.
      expect(skills.slice(0, 2)).toEqual(["scavenging", "chandlery"]);
      expect(skills[5]).toBe("ritualism");
      expect(new Set(skills.slice(2, 5))).toEqual(new Set(["sigilcraft", "herbalism", "scholarship"]));
      // Scavenging and Chandlery are the tutorial pair; from there on, one skill per stage.
      for (let i = 2; i < times.length; i++) expect(times[i]!.at - times[i - 1]!.at).toBeGreaterThanOrEqual(3);
    }
  });

  it("each skill's stage takes 3–12 minutes", () => {
    for (const bot of runs) {
      // Light, Ward, Smoke and Words run note to note. Ritualism's stage is the Offering plus
      // Perform (which brings no new skill), so it runs from the Offering note to the rite.
      const starts = bot.noteAt.slice(1, 6);
      const ends = [...bot.noteAt.slice(2, 6), bot.riteAt];
      for (let i = 0; i < 5; i++) {
        const m = (ends[i]! - starts[i]!) / MIN;
        expect(m, `stage ${i + 1} (${bot.order.join(" → ")})`).toBeGreaterThanOrEqual(3);
        expect(m, `stage ${i + 1} (${bot.order.join(" → ")})`).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe("the cellar after the Kindling", () => {
  const bots = [1, 2, 3].map((seed) => new Bot(seed).play().playCellar());

  it("makes gear, wards off the cellar's foes and calms the Domovoi in 45–75 min of active play", () => {
    for (const b of bots) {
      console.log(`Cellar (seed ${b.state.rngSeed}): Domovoi Likely at ${b.domovoiLikely?.at.toFixed(1)} min (Warding ${b.domovoiLikely?.warding}, Crafting ${b.domovoiLikely?.crafting}) · calmed at ${b.calmedAt?.toFixed(1)} min · pieces: ${b.piecesAt.map((p) => `${p.piece} ${p.minutes.toFixed(1)}`).join(", ")} · beaten ${JSON.stringify(b.state.cellar.beaten)}`);
      expect(b.state.cellar.gifts).toContain("domovoi");
      expect(b.calmedAt!).toBeGreaterThanOrEqual(45);
      expect(b.calmedAt!).toBeLessThanOrEqual(75);
    }
  });

  it("the Domovoi reads Likely around Warding and Crafting 10–12", () => {
    for (const b of bots) {
      expect(b.domovoiLikely!.warding).toBeGreaterThanOrEqual(9);
      expect(b.domovoiLikely!.warding).toBeLessThanOrEqual(14);
      expect(b.domovoiLikely!.crafting).toBeGreaterThanOrEqual(9);
      expect(b.domovoiLikely!.crafting).toBeLessThanOrEqual(14);
    }
  });
});
