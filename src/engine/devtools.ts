import type { GameState } from "./state";

/**
 * Dev tool: make it look as if `ms` of time has passed since the last tick, by moving
 * the sim clock *and every stored timer* back together. The next tick then runs the
 * real offline catch-up over that time. Add any new timestamp fields here.
 */
export function rewind(input: GameState, ms: number): GameState {
  const state = structuredClone(input);
  state.lastTickAt -= ms;
  for (const slot of state.board) slot.refillAt -= ms;
  return state;
}
