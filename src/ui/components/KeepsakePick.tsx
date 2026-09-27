import { useState } from "react";
import { KEEPSAKE_DEFS, KEEPSAKE_IDS, type KeepsakeId } from "../../content/keepsakes";
import { keepsakePicksLeft } from "../../engine/keepsakes";
import type { GameState } from "../../engine/state";
import { Term } from "./Term";

/** The keepsakes being chosen on a screen, kept until you leave it (then committed with chooseKeepsakes). */
export function useKeepsakeChoice(state: GameState) {
  const left = keepsakePicksLeft(state);
  const [chosen, setChosen] = useState<KeepsakeId[]>([]);
  const toggle = (id: KeepsakeId) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : left === 1 ? [id] : c.length < left ? [...c, id] : c));
  return { left, chosen, toggle };
}

/**
 * After a Fine or Resplendent rite: three keepsakes, choose one (or two). Click to choose, click
 * again (or another, when choosing one) to change your mind: nothing is kept until you leave the
 * screen. Each card says what it does; its line of lore is the hover title. Nothing here is required.
 */
export function KeepsakePick({ state, chosen, onToggle, later = true }: { state: GameState; chosen: readonly KeepsakeId[]; onToggle: (id: KeepsakeId) => void; later?: boolean }) {
  const left = keepsakePicksLeft(state);
  if (left === 0 && state.keepsakes.length === 0) return null;
  const full = chosen.length >= left;
  return (
    <section className="keepsakes" aria-labelledby="keepsakes-heading">
      <h3 id="keepsakes-heading">
        {left > 0 ? `Choose ${left === 1 ? "a" : left}` : "Your"} <Term id="keepsake">{left === 1 || left === 0 ? "keepsake" : "keepsakes"}</Term>
        {left === 0 && "s"}
      </h3>
      <div className="keepsake-grid">
        {KEEPSAKE_IDS.map((id) => {
          const k = KEEPSAKE_DEFS[id];
          const kept = state.keepsakes.includes(id);
          const picked = chosen.includes(id);
          const on = kept || picked;
          return (
            <button
              key={id}
              type="button"
              className={`keepsake ${on ? "is-kept" : ""} ${!on && (left === 0 || (full && left > 1)) ? "is-other" : ""}`}
              disabled={kept || left === 0}
              aria-pressed={on}
              title={k.flavour}
              onClick={() => onToggle(id)}
            >
              <span className="keepsake-name">
                {on && "✓ "}
                {k.name}
              </span>
              <span className="keepsake-text">{k.text}</span>
            </button>
          );
        })}
      </div>
      {left > 0 && (
        <p className="muted">
          {chosen.length === 0 ? "Click to choose" : "Click again to change your mind"} · kept when you leave this screen{later && " · or choose later from the tracker"}
        </p>
      )}
    </section>
  );
}
