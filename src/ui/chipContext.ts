import { createContext, useContext } from "react";
import type { ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import type { GameState } from "../engine/state";

// What item chips need from the game. Kept in its own file (no components here) so hot reload
// can't leave chips holding a stale copy.

export interface ChipActions {
  state: GameState;
  lookup: (item: ItemId) => void;
  start: (id: ActionId) => void;
}

export const ChipContext = createContext<ChipActions | null>(null);

export function useChipActions(): ChipActions {
  const ctx = useContext(ChipContext);
  // No silent fallback: a chip outside the game would show a fake empty game's answers.
  if (!ctx) throw new Error("ItemChip used outside <ChipContext.Provider>");
  return ctx;
}
