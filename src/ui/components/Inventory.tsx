import { useState } from "react";
import { ITEM_CATEGORIES, ITEM_DEFS, type ItemCategory, type ItemId } from "../../content/items";
import type { GameState } from "../../engine/state";
import { CATEGORY_ICONS, LanternIcon } from "../art/icons";
import { ItemChip } from "./ItemLookup";

const CATEGORY_IDS = Object.keys(ITEM_CATEGORIES) as ItemCategory[];

export function Inventory({ state }: { state: GameState }) {
  const [filter, setFilter] = useState<ItemCategory | "all">("all");
  const items = (Object.entries(state.inventory) as [ItemId, number][]).filter(([, n]) => n > 0);
  const present = CATEGORY_IDS.filter((c) => items.some(([id]) => ITEM_DEFS[id].category === c));
  const shown = present.filter((c) => filter === "all" || filter === c);

  return (
    <section className="panel" aria-labelledby="inventory-heading">
      <div className="panel-title">
        <LanternIcon size={18} />
        <h2 id="inventory-heading">Pantry &amp; shelves</h2>
      </div>
      {items.length === 0 ? (
        <p className="muted">Empty. The house is cold.</p>
      ) : (
        <>
          {present.length > 1 && (
            <div className="filters" role="group" aria-label="Show">
              <button className={`chip filter ${filter === "all" ? "accent" : ""}`} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
                All
              </button>
              {present.map((c) => {
                const Icon = CATEGORY_ICONS[c];
                return (
                  <button key={c} className={`chip filter ${filter === c ? "accent" : ""}`} aria-pressed={filter === c} onClick={() => setFilter(c)} title={ITEM_CATEGORIES[c].name}>
                    <Icon size={14} />
                    <span className="sr-only">{ITEM_CATEGORIES[c].name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {shown.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            return (
              <div key={c} className="inv-group">
                <h3>
                  <Icon size={14} /> {ITEM_CATEGORIES[c].name}
                </h3>
                <ul className="ledger">
                  {items
                    .filter(([id]) => ITEM_DEFS[id].category === c)
                    .map(([item, n]) => (
                      <li key={item}>
                        <ItemChip item={item} plain />
                        <span key={n} className="num pop">
                          {n}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
