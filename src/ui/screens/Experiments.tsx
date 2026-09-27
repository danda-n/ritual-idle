import { useEffect, useState, type CSSProperties } from "react";
import { GRIMOIRE_DEFS, type GrimoireId } from "../../content/grimoire";
import type { ItemId } from "../../content/items";
import { CHARM_DEFS, CHARM_IDS, CHARMS, type CharmId } from "../../content/charms";
import { attune, bindCharm, canBindCharm, circleSlots, experiment, useCharm, type ExperimentOutcome, type Result, type Success } from "../../engine/commands";
import { GRIMOIRE_IDS, isDiscovered, isSilhouetteVisible, progressOf } from "../../engine/grimoire";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon, MoonIcon } from "../art/icons";
import { PlaceHero } from "../components/PlaceHero";
import { ItemChip } from "../components/ItemLookup";
import { Term } from "../components/Term";
import { itemName } from "../format";
import { ItemIcon } from "../art/items";
import { producingSkill } from "../../engine/estimates";
import { outcomeHelp, recipeKnowledge } from "../guidance";
import { charmEffects, charmLasts } from "../effects";
import { Glows, HintList } from "./Grimoire";

type Act = (command: (s: GameState) => Result) => Success | null;

/**
 * Experiments, a place of their own: find grandmother's small workings at the Circle (3 items,
 * 1 glow per right one), then bind them again as charms for a timed boost. Optional throughout;
 * it's the active side of the game for players who want one.
 */
export function Experiments({ state, act }: { state: GameState; act: Act }) {
  const slots = circleSlots(state);
  const [placed, setPlaced] = useState<ItemId[]>([]);
  const [hideWrong, setHideWrong] = useState(true);
  const [last, setLast] = useState<ExperimentOutcome | null>(null);
  const [closer, setCloser] = useState(false);
  // Counts tries, so each result re-plays its animation.
  const [tryNo, setTry] = useState(0);
  const attuned = state.attunedTo;
  // Two views, remembered in this browser: the Circle (finding recipes) and the charms.
  const [view, setView] = useState<"circle" | "charms">(() => {
    try {
      return localStorage.getItem("ritual-idle.expView") === "charms" ? "charms" : "circle";
    } catch {
      return "circle";
    }
  });
  const pickView = (v: "circle" | "charms") => {
    setView(v);
    try {
      localStorage.setItem("ritual-idle.expView", v);
    } catch {
      /* private window: the view just isn't remembered */
    }
  };
  const charmsHeld = CHARM_IDS.reduce((n, c) => n + (state.inventory[c] ?? 0), 0);
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
  // What you hold, known ingredients first (proven at the Circle, or named by a hint you bought).
  const known = new Set(knowledge?.belongs ?? []);
  const held = (Object.entries(state.inventory) as [ItemId, number][])
    .filter(([id, n]) => n > 0 && !(hideWrong && progress?.provenWrong.includes(id)))
    .map(([id]) => id)
    .sort((a, b) => Number(known.has(b)) - Number(known.has(a)));

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

  const hiddenIds = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden");
  const secretIds = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret");
  return (
    <>
      <PlaceHero
        icon={<MoonIcon size={34} />}
        title="Experiments"
        term="experiment"
        line="Her small workings. The Circle answers those too, if you give it the right three things."
        stats={[
          { label: "Hidden recipes", term: "hidden", value: <>{hiddenIds.filter((id) => isDiscovered(state, id)).length}<span className="unit">/{hiddenIds.length}</span></>, accent: true },
          { label: "Secrets", term: "secret", value: <>{secretIds.filter((id) => isDiscovered(state, id)).length}<span className="unit">/{secretIds.length}</span></> },
          { label: "Insight", term: "insight", value: `✦ ${state.insight}` },
        ]}
      />
      <div className="exp-views" role="tablist" aria-label="Experiments">
        {(["circle", "charms"] as const).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} className={`exp-view ${view === v ? "is-on" : ""}`} onClick={() => pickView(v)}>
            {v === "circle" ? "The Circle" : `Charms${charmsHeld > 0 ? ` (${charmsHeld})` : ""}`}
          </button>
        ))}
      </div>
      {view === "charms" ? (
        <Charms state={state} act={act} />
      ) : (
        <div className="exp-grid">
          {/* Left: what you're working on, what you know, and the hints. */}
          <section className="panel recipe-card" aria-labelledby="recipe-heading">
            <div className="panel-title">
              <h2 id="recipe-heading">Working on</h2>
              <span className="panel-aside num">✦ {state.insight}</span>
            </div>
            <select
              id="attune"
              className="field"
              aria-label="Hidden recipe"
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
              <>
                <p className="gives">
                  <span className="gives-label">Gives</span> {GRIMOIRE_DEFS[attuned].rewardText}
                </p>
                <dl className="proofs">
                  <dt>Belongs</dt>
                  <dd>
                    {knowledge.belongs.length === 0 ? <span className="muted">none yet</span> : knowledge.belongs.map((i) => <span key={i} className="chip right">✓ {itemName(i)}</span>)}
                    <span className="muted num"> {knowledge.belongs.length}/{knowledge.size}</span>
                  </dd>
                  {knowledge.ruledOut.length > 0 && (
                    <>
                      <dt>Crossed out</dt>
                      <dd>
                        {knowledge.ruledOut.map((i) => (
                          <span key={i} className="chip struck">
                            {itemName(i)}
                          </span>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>
                {GRIMOIRE_DEFS[attuned].kind === "hidden" && (
                  <div className="hints">
                    <HintList state={state} id={attuned} act={act} />
                  </div>
                )}
              </>
            ) : (
              <p className="muted circle-help">No glows here: only the exact set of 3 answers, and it finds a secret.</p>
            )}
          </section>

          {/* Right: the Circle itself, the result, and what you can place. */}
          <section className="panel circle-panel" aria-labelledby="circle-heading">
            <div className="panel-title">
              <CircleRiteIcon size={18} />
              <h2 id="circle-heading">At the Circle</h2>
              <span className="panel-aside muted">Pick {slots}, then place them</span>
            </div>
        <div
          className={`ring ${placed.length > 0 ? "is-filling" : ""} ${fill === 1 ? "is-full" : ""} ${last?.kind === "discovered" ? "is-answered" : ""}`}
          style={{ "--fill": fill } as CSSProperties}
          aria-label={`Circle slots, ${placed.length} of ${slots} filled`}
        >
          <svg viewBox="-60 -60 120 120" className="ring-art" aria-hidden="true">
            <defs>
              <radialGradient id="ring-glow">
                <stop offset="0.35" stopColor="var(--place)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--place)" stopOpacity="0" />
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
                <button key={`${i}-${item}`} className="slot filled" data-skill={producingSkill(item) ?? undefined} onClick={() => remove(item)} aria-label={`Remove ${itemName(item)}`}>
                  <ItemIcon item={item} size={18} />
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
          <button className="btn btn-primary btn-sm" disabled={placed.length < slots} onClick={run}>
            Place in the Circle · uses 1 of each
          </button>
          {placed.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setPlaced([])}>
              Clear
            </button>
          )}
        </div>
            <div className="picker-head">
              <span className="label">Your items</span>
              {attuned && (
                <label className="toggle">
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
                className={`chip pick ${placed.includes(id) ? "accent" : ""} ${known.has(id) ? "right" : ""}`}
                onClick={() => place(id)}
                disabled={placed.includes(id) || placed.length >= slots}
              >
                {known.has(id) && <span aria-label="known">✓ </span>}
                <ItemIcon item={id} size={15} />
                {itemName(id)} <span className="muted num">{state.inventory[id]}</span>
              </button>
            ))}
          </div>
        )}
            {progress && progress.attempts.length > 0 && (
              <details className="attempts">
                <summary>Tries ({progress.attempts.length})</summary>
                <ol className="ledger">
                  {[...progress.attempts].reverse().map((a, i) => (
                    <li key={i}>
                      <span>{a.items.map(itemName).join(" · ")}</span>
                      <Glows glows={a.glows} of={a.items.length} />
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </section>
        </div>
      )}
    </>
  );
}

/**
 * Charms: each discovered hidden recipe can be bound again from its ingredients (at once) and used
 * for a timed boost. Recipes not found yet show what they'll bind, so there's a reason to look.
 */
function Charms({ state, act }: { state: GameState; act: Act }) {
  return (
    <section className="panel charms" aria-labelledby="charms-heading">
      <div className="panel-title">
        <MoonIcon size={18} />
        <h2 id="charms-heading">
          <Term id="charm">Charms</Term>
        </h2>
        <span className="panel-aside muted">Bind as many as you like · use one for a boost</span>
      </div>
      <ul className="charm-list">
        {CHARM_IDS.map((c: CharmId) => {
          const recipe = CHARMS[c].from;
          const found = isDiscovered(state, recipe);
          const held = state.inventory[c] ?? 0;
          const left = state.charms[c] ?? 0;
          const block = canBindCharm(state, c);
          return (
            <li key={c} className={`charm ${found ? "" : "is-locked"} ${left > 0 ? "is-on" : ""}`}>
              <span className="charm-icon" aria-hidden="true">
                <ItemIcon item={c} size={22} />
              </span>
              <span className="charm-body">
                <strong>{itemName(c)}</strong>
                <span className="charm-effect">
                  {charmEffects(c).join(" · ")} · next {charmLasts(c)}
                  {left > 0 && <span className="charm-on num"> · on, {charmLasts(c, left)} left</span>}
                </span>
                {found ? (
                  <span className="charm-io">
                    {(Object.entries(CHARM_DEFS[c].cost) as [ItemId, number][]).map(([i, n]) => (
                      <ItemChip key={i} item={i} need={n} />
                    ))}
                  </span>
                ) : (
                  <span className="muted">Discover {GRIMOIRE_DEFS[recipe].name} to bind it</span>
                )}
                {found && block && held === 0 && <span className="muted charm-why">{block}</span>}
              </span>
              {found && (
                <span className="charm-ctl">
                  <button className="btn btn-sm" disabled={block !== null} onClick={() => act((s) => bindCharm(s, c))}>
                    Bind
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={held < 1} onClick={() => act((s) => useCharm(s, c))}>
                    Use <span className="num">({held})</span>
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
