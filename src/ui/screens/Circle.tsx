import { useEffect, useState, type CSSProperties } from "react";
import { GRIMOIRE_DEFS, type GrimoireId } from "../../content/grimoire";
import type { ItemId } from "../../content/items";
import { attune, circleSlots, experiment, type ExperimentOutcome, type Result, type Success } from "../../engine/commands";
import { GRIMOIRE_IDS, isDiscovered, isSilhouetteVisible, progressOf } from "../../engine/grimoire";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { RitePanel } from "../components/RitePanel";
import { itemName } from "../format";
import { circleStep, outcomeHelp, recipeKnowledge } from "../guidance";
import { Glows } from "./Grimoire";

type Act = (command: (s: GameState) => Result) => Success | null;

export function Circle({ state, act }: { state: GameState; act: Act }) {
  const slots = circleSlots(state);
  const [placed, setPlaced] = useState<ItemId[]>([]);
  const [hideWrong, setHideWrong] = useState(true);
  const [last, setLast] = useState<ExperimentOutcome | null>(null);
  const [closer, setCloser] = useState(false);
  // Counts tries, so each result re-plays its animation.
  const [tryNo, setTry] = useState(0);
  const attuned = state.attunedTo;
  const progress = attuned ? progressOf(state, attuned) : null;

  // Empty the slots when the attunement changes (the number of slots may change). The last result
  // stays, so a discovery (which un-attunes the circle) can still flare.
  useEffect(() => {
    setPlaced([]);
  }, [attuned]);

  // How full the circle is (0–1): drives the glow, the lit marker dots and the ring's brightness.
  const fill = slots > 0 ? placed.length / slots : 0;
  const litDots = Math.round(fill * 8);

  const knowledge = attuned ? recipeKnowledge(state, attuned) : null;

  const choices = GRIMOIRE_IDS.filter((id) => isSilhouetteVisible(state, id) && !isDiscovered(state, id));
  const step = circleStep(attuned !== null, choices.length > 0, placed.length, slots);
  const held = (Object.entries(state.inventory) as [ItemId, number][])
    .filter(([id, n]) => n > 0 && !(hideWrong && progress?.provenWrong.includes(id)))
    .map(([id]) => id);

  // Functional updates, so quick clicks in a row each land (none overwrites the last).
  const place = (item: ItemId) => setPlaced((p) => (p.includes(item) || p.length >= slots ? p : [...p, item]));
  const remove = (item: ItemId) => setPlaced((p) => p.filter((x) => x !== item));
  const run = () => {
    // Best glow count so far for this recipe, to celebrate getting closer.
    const best = progress ? Math.max(-1, ...progress.attempts.map((a) => a.glows)) : -1;
    const r = act((s) => experiment(s, placed));
    if (!r) return;
    setLast(r.outcome ?? null);
    setCloser(r.outcome?.kind === "glow" && best >= 0 && r.outcome.glows > best);
    setTry((n) => n + 1);
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
          <h2 id="circle-heading">The Circle</h2>
        </div>

        <ol className="circle-steps" aria-label="How to use the Circle">
          {["Choose what to work on", `Pick ${slots} things below`, "Place them in the Circle"].map((label, i) => (
            <li key={label} className={step === i + 1 ? "current" : step > i + 1 ? "done" : ""} aria-current={step === i + 1 ? "step" : undefined}>
              <span className="circle-step-num">{i + 1}</span> {label}
            </li>
          ))}
        </ol>

        <label className="field-label" htmlFor="attune">
          Hidden recipe
        </label>
        <select
          id="attune"
          className="field"
          value={attuned ?? ""}
          onChange={(e) => {
            setLast(null);
            act((s) => attune(s, (e.target.value || null) as GrimoireId | null));
          }}
        >
          <option value="">Free experiment: hunt secrets (no hints)</option>
          {choices.map((id) => (
            <option key={id} value={id}>
              {GRIMOIRE_DEFS[id].name} ({GRIMOIRE_DEFS[id].ingredients.length} things)
            </option>
          ))}
        </select>
        {attuned && knowledge ? (
          <div className="working-on">
            <p className="gives">
              <span className="gives-label">Gives</span> {GRIMOIRE_DEFS[attuned].rewardText}
            </p>
            <p className="muted">
              Known {knowledge.belongs.length}/{knowledge.size}
              {knowledge.belongs.length > 0 && `: ${knowledge.belongs.map(itemName).join(", ")}`}
              {knowledge.ruledOut.length > 0 && ` · ${knowledge.ruledOut.length} crossed out (hidden below)`}
            </p>
          </div>
        ) : (
          <p className="muted circle-help">No glow count here: only a secret's exact 3 answers.</p>
        )}

        <div
          className={`ring ${placed.length > 0 ? "is-filling" : ""} ${fill === 1 ? "is-full" : ""} ${last?.kind === "discovered" ? "is-answered" : ""}`}
          style={{ "--fill": fill } as CSSProperties}
          aria-label={`Circle slots, ${placed.length} of ${slots} filled`}
        >
          <svg viewBox="-60 -60 120 120" className="ring-art" aria-hidden="true">
            <defs>
              <radialGradient id="ring-glow">
                <stop offset="0.35" stopColor="var(--gold-400)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--gold-400)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle className="ring-glow" r="58" fill="url(#ring-glow)" />
            <g className="ring-outer">
              <circle r="52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              {Array.from({ length: 8 }, (_, i) => (
                <circle
                  key={i}
                  className={`ring-dot ${i < litDots ? "lit" : ""}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                  r="1.6"
                  cx={52 * Math.cos((i * Math.PI) / 4 - Math.PI / 2)}
                  cy={52 * Math.sin((i * Math.PI) / 4 - Math.PI / 2)}
                />
              ))}
            </g>
            <circle className="ring-inner" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          {last?.kind === "discovered" && (
            <span key={tryNo} className="spark-ring" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} style={{ "--a": `${i * 30}deg` } as CSSProperties} />
              ))}
            </span>
          )}
          <div className="ring-slots">
            {Array.from({ length: slots }, (_, i) => {
              const item = placed[i];
              return item ? (
                <button key={`${i}-${item}`} className="slot filled" onClick={() => remove(item)} aria-label={`Remove ${itemName(item)}`}>
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
          <div key={tryNo} className={`outcome is-${last.kind}`} role="status">
            {last.kind === "glow" && <Glows glows={last.glows} of={last.of} staggered />}
            {closer && <span className="closer">Closer!</span>}
            <p className="outcome-help">{outcomeHelp(last)}</p>
          </div>
        )}

        <div className="row">
          <button className="btn btn-primary" disabled={placed.length < slots} onClick={run}>
            Place in the Circle · uses 1 of each
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
          <h2 id="picker-heading">Pick from what you hold</h2>
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
                className={`chip pick ${placed.includes(id) ? "accent" : ""} ${knowledge?.belongs.includes(id) ? "right" : ""}`}
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
