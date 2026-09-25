import { useState } from "react";
import { ITEMS, type ItemId } from "../../content/items";
import { NOTES } from "../../content/notes";
import { PART_DEFS, PART_IDS } from "../../content/rite";
import { addInsight } from "../../engine/grimoire";
import type { GameState } from "../../engine/state";
import { SKILL_IDS } from "../../content/skills";
import { levelForXp, xpForLevel } from "../../engine/xp";

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
        <button className="btn btn-ghost" onClick={() => dev.mutate((s) => ({ ...s, omens: { ...s.omens, still_night: (s.omens.still_night ?? 0) + 1 }, stats: { ...s.stats, omensSeen: s.stats.omensSeen + 1 } }))}>
          +omen
        </button>
        <button className="btn btn-ghost" onClick={() => dev.mutate((s) => ({ ...s, notesRevealed: Math.min(s.notesRevealed + 1, NOTES.length) }))}>
          Next note
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            dev.mutate((s) => {
              const part = PART_IDS.find((p) => !s.kindling.includes(p));
              if (part) for (const [item, qty] of Object.entries(PART_DEFS[part].items)) s.inventory[item as ItemId] = (s.inventory[item as ItemId] ?? 0) + (qty ?? 0);
              return s;
            })
          }
        >
          Items for next part
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            dev.mutate((s) => {
              for (const id of SKILL_IDS) s.skills[id].xp = xpForLevel(Math.min(s.levelCap, levelForXp(s.skills[id].xp, s.levelCap) + 5));
              return s;
            })
          }
        >
          +5 levels
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            dev.mutate((s) => {
              addInsight(s, 5, "page");
              return s;
            })
          }
        >
          +5 insight
        </button>
      </div>
    </details>
  );
}
