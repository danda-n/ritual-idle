import { BUFFS, type BuffId } from "../content/buffs";
import { OMENS, type OmenId } from "../content/omens";
import { omenCapacity } from "./modifiers";
import type { SkillId } from "../content/skills";
import type { Note } from "./progress";
import type { GameState } from "./state";

// Omens and buffs. These helpers mutate `state`; callers pass a private copy.

export function storedOmens(state: GameState): number {
  return Object.values(state.omens).reduce((a, n) => a + (n ?? 0), 0);
}

/**
 * Put an omen on the shelf. Returns false if the shelf is full (the omen passes unseen).
 * `promised` omens (a note's gift) always land, even on a full shelf.
 */
export function grantOmen(state: GameState, id: OmenId, promised = false): boolean {
  state.stats.omensSeen++;
  if (!promised && storedOmens(state) >= omenCapacity(state)) return false;
  state.omens[id] = (state.omens[id] ?? 0) + 1;
  return true;
}

/**
 * Start or lengthen a buff. `stack` adds the full duration on top of any time left
 * (released omens are scarce); otherwise it just refreshes (repeatable minor rites).
 */
export function applyBuff(state: GameState, id: BuffId, now: number, stack: boolean, skill?: SkillId): void {
  const duration = BUFFS[id].durationMs;
  // A blessing on another skill is its own buff, running side by side.
  const same = (b: { id: BuffId; skill?: SkillId }) => b.id === id && b.skill === skill;
  const existing = state.buffs.find((b) => same(b) && b.endsAt > now);
  if (!existing) {
    state.buffs = state.buffs.filter((b) => !same(b));
    state.buffs.push(skill ? { id, endsAt: now + duration, skill } : { id, endsAt: now + duration });
  } else {
    existing.endsAt = stack ? existing.endsAt + duration : Math.max(existing.endsAt, now + duration);
  }
}

export function pruneBuffs(state: GameState, now: number): void {
  state.buffs = state.buffs.filter((b) => b.endsAt > now);
}

/** Notes can carry a gift (the scripted first Still Night). Returns the omens granted. */
export function giveNoteGifts(state: GameState, notes: readonly Note[]): OmenId[] {
  const granted: OmenId[] = [];
  for (const n of notes) {
    if ("gift" in n && n.gift in OMENS && grantOmen(state, n.gift as OmenId, true)) granted.push(n.gift as OmenId);
  }
  return granted;
}
