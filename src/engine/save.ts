import { ITEMS } from "../content/items";
import { NOTES } from "../content/notes";
import { PAGES } from "../content/pages";
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
    },
    settings: { ...base.settings, ...data.settings },
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
  return state;
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
