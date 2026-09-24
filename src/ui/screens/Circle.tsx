import { useEffect, useState } from "react";
import { GRIMOIRE_DEFS, type GrimoireId } from "../../content/grimoire";
import type { ItemId } from "../../content/items";
import { attune, circleSlots, experiment, type ExperimentOutcome, type Result, type Success } from "../../engine/commands";
import { GRIMOIRE_IDS, isDiscovered, isSilhouetteVisible, progressOf } from "../../engine/grimoire";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { RitePanel } from "../components/RitePanel";
import { itemName } from "../format";
import { Glows } from "./Grimoire";

type Act = (command: (s: GameState) => Result) => Success | null;

const GLOW_LINES = ["The chalk stays cold.", "The circle stirs once.", "The circle stirs twice.", "The circle stirs three times."];

function outcomeLine(o: ExperimentOutcome): string {
  switch (o.kind) {
    case "discovered":
      return "The circle drinks it in.";
    case "glow":
      return GLOW_LINES[o.glows] ?? "The circle stirs.";
    case "almost":
      return "Something almost answered.";
    case "nothing":
      return "Nothing answers.";
  }
}

export function Circle({ state, act }: { state: GameState; act: Act }) {
  const slots = circleSlots(state);
  const [placed, setPlaced] = useState<ItemId[]>([]);
  const [hideWrong, setHideWrong] = useState(true);
  const [last, setLast] = useState<ExperimentOutcome | null>(null);
  const attuned = state.attunedTo;
  const progress = attuned ? progressOf(state, attuned) : null;

  // Clear the circle when the attunement changes.
  useEffect(() => {
    setPlaced([]);
    setLast(null);
  }, [attuned]);

  const choices = GRIMOIRE_IDS.filter((id) => isSilhouetteVisible(state, id) && !isDiscovered(state, id));
  const held = (Object.entries(state.inventory) as [ItemId, number][])
    .filter(([id, n]) => n > 0 && !(hideWrong && progress?.provenWrong.includes(id)))
    .map(([id]) => id);

  const place = (item: ItemId) => {
    if (placed.includes(item) || placed.length >= slots) return;
    setPlaced([...placed, item]);
  };
  const run = () => {
    const r = act((s) => experiment(s, placed));
    if (!r) return;
    setLast(r.outcome ?? null);
    setPlaced([]);
  };

  return (
    <div className="circle-screen">
      <div className="circle-rite">
        <RitePanel state={state} act={act} />
      </div>
      <section className="panel circle-panel" aria-labelledby="circle-heading">
        <div className="panel-title">
          <CircleRiteIcon size={18} />
          <h2 id="circle-heading">The circle</h2>
        </div>

        <label className="field-label" htmlFor="attune">
          Attuned to
        </label>
        <select
          id="attune"
          className="field"
          value={attuned ?? ""}
          onChange={(e) => act((s) => attune(s, (e.target.value || null) as GrimoireId | null))}
        >
          <option value="">Nothing: a free experiment (hunting secrets)</option>
          {choices.map((id) => (
            <option key={id} value={id}>
              {GRIMOIRE_DEFS[id].name} ({GRIMOIRE_DEFS[id].ingredients.length} things)
            </option>
          ))}
        </select>
        <p className="muted circle-help">
          {attuned
            ? "The circle glows once for every right thing. Order doesn't matter. Each try uses one of each."
            : "Only an exact answer speaks. Two or three things; each try uses one of each."}
        </p>

        <div className="ring" aria-label="Circle slots">
          <svg viewBox="-60 -60 120 120" className="ring-art" aria-hidden="true">
            <circle r="52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle r="40" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={i} r="1.6" cx={52 * Math.cos((i * Math.PI) / 4)} cy={52 * Math.sin((i * Math.PI) / 4)} fill="currentColor" />
            ))}
          </svg>
          <div className="ring-slots">
            {Array.from({ length: slots }, (_, i) => {
              const item = placed[i];
              return item ? (
                <button key={i} className="slot filled" onClick={() => setPlaced(placed.filter((x) => x !== item))} aria-label={`Remove ${itemName(item)}`}>
                  {itemName(item)}
                </button>
              ) : (
                <span key={i} className="slot">
                  empty
                </span>
              );
            })}
          </div>
        </div>

        {last && (
          <div className={`outcome ${last.kind}`} role="status">
            {last.kind === "glow" && <Glows glows={last.glows} of={last.of} />}
            <p className="note-quote">{outcomeLine(last)}</p>
          </div>
        )}

        <div className="row">
          <button className="btn btn-primary" disabled={placed.length < (attuned ? slots : 2)} onClick={run}>
            Place in the circle
          </button>
          {placed.length > 0 && (
            <button className="btn btn-ghost" onClick={() => setPlaced([])}>
              Clear
            </button>
          )}
        </div>
      </section>

      <section className="panel" aria-labelledby="picker-heading">
        <div className="panel-title">
          <h2 id="picker-heading">What you hold</h2>
          {attuned && (
            <label className="panel-aside toggle">
              <input type="checkbox" checked={hideWrong} onChange={(e) => setHideWrong(e.target.checked)} /> Hide proven wrong
            </label>
          )}
        </div>
        {held.length === 0 ? (
          <p className="muted">Nothing to place yet.</p>
        ) : (
          <div className="picker">
            {held.map((id) => (
              <button
                key={id}
                className={`chip pick ${placed.includes(id) ? "accent" : ""} ${progress?.provenRight.includes(id) ? "right" : ""} ${progress?.marks[id] ?? ""}`}
                onClick={() => place(id)}
                disabled={placed.includes(id) || placed.length >= slots}
              >
                {itemName(id)} <span className="muted num">{state.inventory[id]}</span>
              </button>
            ))}
          </div>
        )}
        {progress && progress.attempts.length > 0 && (
          <div className="attempts">
            <h3>Recent attempts</h3>
            <ol className="ledger">
              {[...progress.attempts].reverse().slice(0, 5).map((a, i) => (
                <li key={i}>
                  <span>{a.items.map(itemName).join(" · ")}</span>
                  <Glows glows={a.glows} of={a.items.length} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
