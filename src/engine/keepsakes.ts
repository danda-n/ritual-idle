import { KEEPSAKE_DEFS, KEEPSAKE_PICKS, type KeepsakeEffect } from "../content/keepsakes";
import type { GameState } from "./state";

// Keepsakes: chosen after a Fine or Resplendent rite. How many is derived from the rite's
// quality, so only the choices are saved.

/** Keepsakes still to choose (0 before the rite, or once all are chosen). */
export function keepsakePicksLeft(state: GameState): number {
  const done = state.rite.completed;
  if (!done) return 0;
  return Math.max(0, KEEPSAKE_PICKS[done.quality as 0 | 1 | 2] - state.keepsakes.length);
}

/** The effects of the keepsakes held. */
export function keepsakeEffects(state: GameState): KeepsakeEffect[] {
  return state.keepsakes.map((id) => KEEPSAKE_DEFS[id].effect);
}
