import type { ItemId } from "../../content/items";
import type { GameState } from "../../engine/state";
import { LanternIcon } from "../art/icons";
import { itemName } from "../format";

export function Inventory({ state }: { state: GameState }) {
  const items = (Object.entries(state.inventory) as [ItemId, number][]).filter(([, n]) => n > 0);
  return (
    <section className="panel" aria-labelledby="inventory-heading">
      <div className="panel-title">
        <LanternIcon size={18} />
        <h2 id="inventory-heading">Pantry &amp; shelves</h2>
      </div>
      {items.length === 0 ? (
        <p className="muted">Empty. The house is cold.</p>
      ) : (
        <ul className="ledger">
          {items.map(([item, n]) => (
            <li key={item}>
              <span>{itemName(item)}</span>
              <span className="num">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
