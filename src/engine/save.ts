import { ACTION_DEFS } from "../content/actions";
import { GRIMOIRE_DEFS, type GrimoireId } from "../content/grimoire";
import { ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { HEARTH_RITE, PART_IDS } from "../content/rite";
import { SKILL_IDS, type SkillId } from "../content/skills";
import { TALENT_LEVELS } from "../content/talents";
import { KEEPSAKES } from "../content/keepsakes";
import { REQUESTS } from "../content/requests";
import { boardSlots, scaleOffer, trustLevel } from "./village";
import { CHARMS } from "../content/charms";
import { BUFFS } from "../content/buffs";
import { UPGRADE_IDS, UPGRADES, type UpgradeId } from "../content/upgrades";
import type { Feature } from "../content/types";
import { SAVE_EPOCH, SAVE_VERSION, newGame, type GameState, type RecipeProgress } from "./state";
import { stepById } from "./progress";

const STORAGE_KEY = "ritual-idle.save";

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

/** Parse and upgrade a save. Throws on anything that isn't a valid save. */
export function deserialize(json: string): GameState {
  const data = JSON.parse(json) as Partial<GameState>;
  if (typeof data !== "object" || data === null || typeof data.version !== "number") {
    throw new Error("Not a Ritual Idle save.");
  }
  if (data.version > SAVE_VERSION) throw new Error("This save is from a newer version of the game.");
  // Fill in anything missing from older saves (new skills, new fields).
  const base = newGame(data.lastTickAt ?? Date.now(), data.rngSeed);
  const state: GameState = {
    ...base,
    ...data,
    skills: { ...base.skills, ...data.skills },
    // Drop items that no longer exist (e.g. the old "blessing" item, now a buff).
    inventory: Object.fromEntries(Object.entries(data.inventory ?? {}).filter(([id]) => id in ITEMS)),
    stats: {
      completed: { ...data.stats?.completed },
      requestsFilled: data.stats?.requestsFilled ?? 0,
      omensSeen: data.stats?.omensSeen ?? 0,
      curiosRead: data.stats?.curiosRead ?? 0,
    },
    settings: { ...base.settings, ...data.settings },
    rite: {
      ...base.rite,
      ...data.rite,
      // v10 added tending: a rite under way in an older save starts with none.
      performing: data.rite?.performing ? { ...data.rite.performing, tendedMs: data.rite.performing.tendedMs ?? 0, bankMs: data.rite.performing.bankMs ?? 0 } : null,
    },
    kept: { ...base.kept, ...data.kept },
    rewardsWaiting: data.rewardsWaiting ?? [],
    middleOrder: data.middleOrder ?? [],
    stageStart: data.stageStart ?? {},
    talents: loadTalents(data.talents),
    keepsakes: (data.keepsakes ?? []).filter((k) => k in KEEPSAKES),
    // v11: charms count uses; the old timed charm buffs are dropped.
    charms: Object.fromEntries(Object.entries(data.charms ?? {}).filter(([k, n]) => k in CHARMS && typeof n === "number" && n > 0)),
    buffs: (data.buffs ?? []).filter((b) => b.id in BUFFS),
    // Contracts: two slots now, each remembering what's been delivered.
    board: (data.board ?? []).map((b) => ({ ...b, delivered: { ...b.delivered } })),
    version: SAVE_VERSION,
  };
  // Fields that no longer exist (the offline cap is now derived from upgrades).
  delete (state as Partial<GameState> & { offlineCapMs?: number }).offlineCapMs;

  if (data.version < 2) {
    // v1 predates notes and pages: open everything so no earned progress gets locked away.
    state.notesRevealed = NOTES.length;
    state.stats.completed.decipher_page = Math.max(state.stats.completed.decipher_page ?? 0, PAGES.length);
  } else if (data.version < 3 && state.notesRevealed >= 6) {
    // v3 inserted the village note as note 6; saves past it shift up by one.
    state.notesRevealed = Math.min(state.notesRevealed + 1, NOTES.length);
  }
  if (data.version < 4) {
    // v4 renamed rite quality (Faltering/Sound/Resplendent → Sound/Fine/Resplendent): old Sound (1)
    // becomes Sound (0); an earned Resplendent (2) stays. Curios became a collection, not an item.
    if (state.rite.completed && state.rite.completed.quality === 1) state.rite.completed = { ...state.rite.completed, quality: 0 };
    delete state.inventory.curio;
  }
  if (data.version < 5) upgradeToStagedKindling(state);
  // Numbers that must never be missing or broken.
  if (!Number.isFinite(state.insight)) state.insight = 0;
  if (data.version < 7) upgradeToV7(state, data);
  if (data.version < 8) upgradeToV8(state);
  if (data.version < 6) {
    // v6 added stage steps: every step of a stage already passed counts as done (no rewards).
    state.stepsDone = NOTES.slice(0, state.notesRevealed - 1).flatMap((n) => ("steps" in n ? n.steps.map((st) => st.id) : []));
    // Still Night used to bless Scholarship and Ritualism; now it blesses one chosen skill.
    const running = state.active ? ACTION_DEFS[state.active.id].skill : "scholarship";
    state.buffs = state.buffs.map((b) => (b.id === "still_night" && !b.skill ? { ...b, skill: running } : b));
  }
  // v11: the board has one slot per place (two, plus projects), and each contract its scaled offer.
  state.upgrades = state.upgrades.filter((u) => u in UPGRADES);
  state.board = state.board.slice(0, boardSlots(state)).map((b, i) => (b.request && !(b.request in REQUESTS) ? { request: null, refillAt: b.refillAt, delivered: {} } : b.request && !b.offer ? { ...b, offer: scaleOffer(b.request, trustLevel(state), i) } : b));
  // v11: a Resplendent rite already done gets its cloth (it used to be only a line of text).
  if (state.rite.completed?.quality === 2 && !state.inventory.circle_cloth) state.inventory.circle_cloth = 1;
  // Steps that no longer exist (stages lost their sub-steps: each is its part's checklist now).
  state.stepsDone = (state.stepsDone ?? []).filter((id) => stepById(id));
  state.rewardsWaiting = state.rewardsWaiting.filter((id) => stepById(id));
  return state;
}

// v4 and older had a different chapter: 9 notes that handed out skills on a timer, and a rite that
// used items straight from the pantry. v5 builds the Kindling in five parts, one stage per note.
const OLD_NOTES = [
  { unlocks: ["scavenging"], opens: [] },
  { unlocks: ["chandlery"], opens: [] },
  { unlocks: ["herbalism"], opens: [] },
  { unlocks: ["scholarship"], opens: ["grimoire"] },
  { unlocks: ["sigilcraft"], opens: [] },
  { unlocks: [], opens: ["village"] },
  { unlocks: ["ritualism"], opens: ["circle"] },
  { unlocks: [], opens: [] },
  { unlocks: [], opens: [] },
] as const;

function upgradeToStagedKindling(state: GameState): void {
  const riteNote = NOTES.findIndex((n) => "goal" in n && n.goal.kind === "rite");
  if (state.rite.completed || state.rite.performing) {
    // The rite already used its components: every part counts as placed.
    state.kindling = [...PART_IDS];
    state.notesRevealed = state.rite.completed ? NOTES.length : riteNote + 1;
    state.experimentsOpen = true;
    return;
  }
  // Mid-chapter: keep every skill and place the old notes had opened, then pick up the new chapter
  // at the first part not yet placed (the Light). Items already made can be placed at once.
  const old = OLD_NOTES.slice(0, state.notesRevealed);
  state.kept = {
    skills: SKILL_IDS.filter((id) => old.some((n) => (n.unlocks as readonly string[]).includes(id))),
    features: (["grimoire", "village", "circle"] as Feature[]).filter((f) => old.some((n) => (n.opens as readonly string[]).includes(f))),
  };
  state.kindling = [];
  // Anyone past the first old note has done the new first step's work too.
  state.notesRevealed = state.notesRevealed > 1 ? 2 : 1;
  // Someone who had already reached the Circle had seen their first experiments.
  state.experimentsOpen = state.kept.features.includes("circle");
}

/** v7: progress as a fraction of the repetition. */
function upgradeToV7(state: GameState, data: Partial<GameState>): void {
  const old = data.active as ({ id: GameState["active"] extends infer A ? (A extends { id: infer I } ? I : never) : never; elapsedMs?: number; progress?: number } | null | undefined);
  if (old && old.progress === undefined) {
    const full = ACTION_DEFS[old.id].seconds * 1000;
    state.active = { id: old.id, progress: Math.min(0.99, Math.max(0, (old.elapsedMs ?? 0) / full)) };
  }
  // Insight became one pool spent on hints. Each recipe's old insight joins the pool, and the
  // hints it had already shown (categories at 6, a name at 12, another every 6) count as bought.
  let pool = 0;
  for (const id of Object.keys(state.grimoire) as GrimoireId[]) {
    const p = state.grimoire[id] as (RecipeProgress & { insight?: number }) | undefined;
    if (!p) continue;
    const old = p.insight ?? 0;
    pool += old;
    delete p.insight;
    const plain = GRIMOIRE_DEFS[id].hints?.plain ?? [];
    const names = old >= 12 ? Math.min(plain.length, 1 + Math.floor((old - 12) / 6)) : 0;
    p.bought = p.bought ?? { category: old >= 6, named: plain.slice(0, names) };
    p.clues = p.clues ?? 0;
  }
  state.insight = (data.insight ?? 0) + pool;
  // The rite became a 5-phase ceremony. One under way carries on at the same share of the way
  // through; the moments it can no longer be asked count as answered, and Still Night counts.
  delete (state.rite as { primed?: boolean }).primed;
  const oldRite = state.rite.performing as unknown as { elapsedMs?: number; stillNight?: boolean } | null;
  if (oldRite && oldRite.elapsedMs !== undefined) {
    const at = Math.min(0.999, oldRite.elapsedMs / (30 * 60_000)) * HEARTH_RITE.phases.length;
    const phase = Math.floor(at);
    state.rite.performing = { phase, phaseMs: (at - phase) * HEARTH_RITE.phaseMs, offered: [], omen: !!oldRite.stillNight, tendedMs: 0, bankMs: 0 };
  }
  if (pool > 0 && state.kept.features.includes("grimoire")) state.experimentsOpen = true;
}

/**
 * Talents became pairs (a side at levels 3, 6, 9 and 12). Anything else, like the old branch
 * ranks, is dropped: nothing is lost, since talents come from levels. Choose again.
 */
function loadTalents(data: unknown): GameState["talents"] {
  const out: GameState["talents"] = {};
  if (!data || typeof data !== "object") return out;
  for (const [skill, picks] of Object.entries(data)) {
    if (!(SKILL_IDS as string[]).includes(skill) || !picks || typeof picks !== "object") continue;
    const kept = Object.fromEntries(Object.entries(picks).filter(([lvl, side]) => (TALENT_LEVELS as readonly number[]).includes(Number(lvl)) && (side === "a" || side === "b")));
    if (Object.keys(kept).length > 0) out[skill as SkillId] = kept;
  }
  return out;
}

/**
 * v8: Tend is gone (its meter and streak), and the rite has no moments: one under way keeps its
 * place, with no offerings made. Upgrades became house projects. (Old talent ranks are dropped by
 * `loadTalents`; the board is trimmed to two contracts on every load.)
 */
function upgradeToV8(state: GameState): void {
  delete (state as { tend?: unknown }).tend;
  // House upgrades are built projects now, and omens need the omen shelf. The old omen shelf held
  // 3 (now the carved shelf); anyone who has met omens keeps a shelf for them.
  const had = state.upgrades as string[];
  const upgrades = new Set(had.filter((u): u is UpgradeId => u in UPGRADES));
  if (had.includes("omen_shelf")) upgrades.add("carved_shelf");
  if (state.stats.omensSeen > 0 || Object.values(state.omens).some((n) => (n ?? 0) > 0)) upgrades.add("omen_shelf");
  state.upgrades = UPGRADE_IDS.filter((u) => upgrades.has(u));
  const p = state.rite.performing as (NonNullable<GameState["rite"]["performing"]> & { moments?: boolean[] }) | null;
  if (p) {
    delete p.moments;
    p.offered = p.offered ?? [];
  }
}

// Export strings are base64 so they survive being pasted into chats and forums.
export function exportSave(state: GameState): string {
  const bytes = new TextEncoder().encode(serialize(state));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function importSave(text: string): GameState {
  const bytes = Uint8Array.from(atob(text.trim()), (c) => c.charCodeAt(0));
  return deserialize(new TextDecoder().decode(bytes));
}

// Browser storage can be unavailable (private windows, blocked storage), so every access is guarded.
/** True if this save comes from before the current playtest reset (SAVE_EPOCH), so it's discarded. */
export function isFromBeforeReset(json: string): boolean {
  try {
    const data = JSON.parse(json) as { epoch?: number };
    return (data.epoch ?? 0) < SAVE_EPOCH;
  } catch {
    return false;
  }
}

/**
 * The saved game, if any. A save from before the current playtest reset is dropped (`reset`
 * says so, for a one-time notice) and the game starts fresh.
 */
export function loadLocal(): { state: GameState | null; reset: boolean } {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return { state: null, reset: false };
    if (isFromBeforeReset(json)) {
      localStorage.removeItem(STORAGE_KEY);
      return { state: null, reset: true };
    }
    return { state: deserialize(json), reset: false };
  } catch {
    return { state: null, reset: false };
  }
}

export function saveLocal(state: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
