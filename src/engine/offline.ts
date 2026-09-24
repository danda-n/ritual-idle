import { offlineCapMs } from "./modifiers";
import { advance, type Report } from "./simulate";
import type { GameState } from "./state";

export interface CatchUp {
  state: GameState;
  report: Report;
  /** Real time away, before the cap. */
  awayMs: number;
  /** True if some of the time away was lost to the offline cap. */
  capped: boolean;
}

/** Fast-forward a loaded save to `now`, simulating up to the offline cap. */
export function catchUp(saved: GameState, now: number): CatchUp {
  const awayMs = Math.max(0, now - saved.lastTickAt);
  const cap = offlineCapMs(saved);
  const simulatedMs = Math.min(awayMs, cap);
  const { state, report } = advance(saved, simulatedMs);
  return { state: { ...state, lastTickAt: now }, report, awayMs, capped: awayMs > cap };
}
