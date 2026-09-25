import type { GameState } from "../../engine/state";
import { Inventory } from "../components/Inventory";

/** Everything the house holds, grouped: its own tab, so the sidebar stays short. */
export function Stores({ state }: { state: GameState }) {
  return (
    <div className="stores">
      <Inventory state={state} />
    </div>
  );
}
