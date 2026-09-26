import { UPGRADE_IDS, type UpgradeId } from "../content/upgrades";
import { canBuild } from "./commands";
import type { GameState } from "./state";

// House projects the UI points the player to. Pure lookups; nothing here changes state.

/**
 * The omen shelf is worth pointing out: the Light is placed (so its candles are in reach) and
 * the shelf isn't built yet. Omens only turn up once it is.
 */
export function omenShelfSuggested(state: GameState): boolean {
  return state.kindling.includes("light") && !state.upgrades.includes("omen_shelf");
}

/** Projects that could be built right now. */
export function projectsReady(state: GameState): UpgradeId[] {
  return UPGRADE_IDS.filter((id) => canBuild(state, id) === null);
}
