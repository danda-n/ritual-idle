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
  /** Mark a glossary word as read (it then shows as plain text; the Guide keeps it). */
  markTerm: (id: string) => void;
}

export const ChipContext = createContext<ChipActions | null>(null);

export function useChipActions(): ChipActions {
  const ctx = useContext(ChipContext);
  // No silent fallback: a chip outside the game would show a fake empty game's answers.
  if (!ctx) throw new Error("ItemChip used outside <ChipContext.Provider>");
  return ctx;
}

/** For Terms: the game's context, or null outside it (then every word counts as unread). */
export function useOptionalChipActions(): ChipActions | null {
  return useContext(ChipContext);
}
