import { BUFFS } from "../../content/buffs";
import { OMENS, type OmenId } from "../../content/omens";
import { releaseOmen, type Result } from "../../engine/commands";
import { activeBuffs, omenCapacity } from "../../engine/modifiers";
import { storedOmens } from "../../engine/omens";
import type { GameState } from "../../engine/state";
import { MoonIcon } from "../art/icons";
import { formatClock } from "../format";

const OMEN_IDS = Object.keys(OMENS) as OmenId[];

/** Shown once the first omen has appeared. */
export function OmenShelf({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const buffs = activeBuffs(state);
  if (state.stats.omensSeen === 0 && buffs.length === 0) return null;
  const capacity = omenCapacity(state);
  const stored = storedOmens(state);
  return (
    <section className="panel omen-shelf" aria-labelledby="omens-heading">
      <div className="panel-title">
        <MoonIcon size={18} />
        <h2 id="omens-heading">Omen shelf</h2>
        <span className="muted panel-aside num">
          {stored}/{capacity}
        </span>
      </div>
      {stored === 0 && <p className="muted">Empty. Omens come to those who keep working.</p>}
      {OMEN_IDS.filter((id) => (state.omens[id] ?? 0) > 0).map((id) => (
        <div key={id} className="omen">
          <div className="omen-jars" aria-hidden="true">
            {Array.from({ length: state.omens[id] ?? 0 }, (_, i) => (
              <MoonIcon key={i} size={22} />
            ))}
          </div>
          <div>
            <h3>{OMENS[id].name}</h3>
            <p className="muted">{OMENS[id].description}</p>
          </div>
          <button className="btn btn-primary" onClick={() => act((s) => releaseOmen(s, id))}>
            Release
          </button>
        </div>
      ))}
      {buffs.length > 0 && (
        <ul className="ledger buff-list" aria-label="Active effects">
          {buffs.map((b) => (
            <li key={b.id}>
              <span title={BUFFS[b.id].description}>{BUFFS[b.id].name}</span>
              <span className="num">{formatClock(b.endsAt - state.lastTickAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
