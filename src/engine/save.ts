import { ACTION_DEFS } from "../content/actions";
import { ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
import { PART_IDS } from "../content/rite";
import { SKILL_IDS } from "../content/skills";
import type { Feature } from "../content/types";
import { SAVE_VERSION, newGame, type GameState } from "./state";

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
      tended: data.stats?.tended ?? 0,
    },
    settings: { ...base.settings, ...data.settings },
    rite: { ...base.rite, ...data.rite },
    kept: { ...base.kept, ...data.kept },
    rewardsWaiting: data.rewardsWaiting ?? [],
    tend: { ...base.tend, ...data.tend },
    talents: { ...data.talents },
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
  if (data.version < 7) upgradeToV7(state, data);
  if (data.version < 6) {
    // v6 added stage steps: every step of a stage already passed counts as done (no rewards).
    state.stepsDone = NOTES.slice(0, state.notesRevealed - 1).flatMap((n) => ("steps" in n ? n.steps.map((st) => st.id) : []));
    // Still Night used to bless Scholarship and Ritualism; now it blesses one chosen skill.
    const running = state.active ? ACTION_DEFS[state.active.id].skill : "scholarship";
    state.buffs = state.buffs.map((b) => (b.id === "still_night" && !b.skill ? { ...b, skill: running } : b));
  }
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

/** v7: progress as a fraction of the repetition; the keystone became free (points are derived). */
function upgradeToV7(state: GameState, data: Partial<GameState>): void {
  const old = data.active as ({ id: GameState["active"] extends infer A ? (A extends { id: infer I } ? I : never) : never; elapsedMs?: number; progress?: number } | null | undefined);
  if (old && old.progress === undefined) {
    const full = ACTION_DEFS[old.id].seconds * 1000;
    state.active = { id: old.id, progress: Math.min(0.99, Math.max(0, (old.elapsedMs ?? 0) / full)) };
  }
  for (const t of Object.values(state.talents)) if (t) delete (t as { keystone?: boolean }).keystone;
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
export function loadLocal(): GameState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? deserialize(json) : null;
  } catch {
    return null;
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
