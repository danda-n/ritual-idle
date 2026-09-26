import type { GameState } from "../../engine/state";
import { JarIcon } from "../art/icons";
import { Inventory } from "../components/Inventory";
import { PlaceHero } from "../components/PlaceHero";

/** Everything the house holds, grouped: its own tab, so the sidebar stays short. */
export function Stores({ state }: { state: GameState }) {
  const kinds = Object.values(state.inventory).filter((n) => (n ?? 0) > 0).length;
  const total = Object.values(state.inventory).reduce((a: number, n) => a + (n ?? 0), 0);
  return (
    <>
      <PlaceHero
        icon={<JarIcon size={34} />}
        title="The Stores"
        line="Grandmother's shelves, filling again."
        stats={[
          { label: "Kinds", value: kinds, accent: true },
          { label: "Things", value: total },
        ]}
      />
      <div className="stores">
        <Inventory state={state} />
      </div>
    </>
  );
}
