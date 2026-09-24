import { useState } from "react";
import { ITEMS, type ItemId } from "../../content/items";
import { NOTES } from "../../content/notes";
import { addInsight, fragmentTarget } from "../../engine/grimoire";
import type { GameState } from "../../engine/state";

// Dev builds only (see App). Time skips go through the real offline catch-up.
const MIN = 60_000;

export function DevPanel({ dev }: { dev: { skip: (ms: number) => void; mutate: (fn: (s: GameState) => GameState) => void } }) {
  const [item, setItem] = useState<ItemId>("tallow");
  return (
    <details className="dev-panel">
      <summary>Dev tools</summary>
      <div className="row">
        <span className="muted">Skip time:</span>
        {[10, 60, 480].map((m) => (
          <button key={m} className="btn btn-ghost" onClick={() => dev.skip(m * MIN)}>
            +{m < 60 ? `${m}m` : `${m / 60}h`}
          </button>
        ))}
      </div>
      <div className="row">
        <label className="muted" htmlFor="dev-item">
          Give:
        </label>
        <select id="dev-item" className="field dev-select" value={item} onChange={(e) => setItem(e.target.value as ItemId)}>
          {(Object.keys(ITEMS) as ItemId[]).map((id) => (
            <option key={id} value={id}>
              {ITEMS[id].name}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost" onClick={() => dev.mutate((s) => ({ ...s, inventory: { ...s.inventory, [item]: (s.inventory[item] ?? 0) + 10 } }))}>
          +10
        </button>
        <button className="btn btn-ghost" onClick={() => dev.mutate((s) => ({ ...s, coin: s.coin + 100 }))}>
          +100 coin
        </button>
        <button className="btn btn-ghost" onClick={() => dev.mutate((s) => ({ ...s, notesRevealed: Math.min(s.notesRevealed + 1, NOTES.length) }))}>
          Next note
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            dev.mutate((s) => {
              addInsight(s, fragmentTarget(s), 3, "page");
              return s;
            })
          }
        >
          +fragment
        </button>
      </div>
    </details>
  );
}
