import { KEEPSAKE_DEFS, KEEPSAKE_IDS } from "../../content/keepsakes";
import { chooseKeepsake, type Result } from "../../engine/commands";
import { keepsakePicksLeft } from "../../engine/keepsakes";
import type { GameState } from "../../engine/state";

/**
 * After a Fine or Resplendent rite: three keepsakes, choose one (or two). Chosen ones stay
 * marked; the rest dim once the choices are made. Nothing here is required.
 */
export function KeepsakePick({ state, act, later = true }: { state: GameState; act: (c: (s: GameState) => Result) => unknown; later?: boolean }) {
  const left = keepsakePicksLeft(state);
  if (left === 0 && state.keepsakes.length === 0) return null;
  return (
    <section className="keepsakes" aria-labelledby="keepsakes-heading">
      <h3 id="keepsakes-heading">{left > 0 ? `The circle leaves something behind: choose ${left === 1 ? "one" : "two"}` : "What the circle left behind"}</h3>
      <div className="keepsake-grid">
        {KEEPSAKE_IDS.map((id) => {
          const k = KEEPSAKE_DEFS[id];
          const kept = state.keepsakes.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`keepsake ${kept ? "is-kept" : ""} ${!kept && left === 0 ? "is-other" : ""}`}
              disabled={kept || left === 0}
              aria-pressed={kept}
              onClick={() => act((s) => chooseKeepsake(s, id))}
            >
              <span className="keepsake-name">
                {kept && "✓ "}
                {k.name}
              </span>
              <span className="keepsake-text">{k.text}</span>
              <span className="keepsake-flavour">{k.flavour}</span>
            </button>
          );
        })}
      </div>
      {left > 0 && <p className="muted">Kept for good.{later && " You can also choose later, from the chapter tracker."}</p>}
    </section>
  );
}
