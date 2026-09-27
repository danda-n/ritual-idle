import { useState, type ReactNode } from "react";
import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { CURIOS, GRIMOIRE_DEFS, INSIGHT_COST, INSIGHT_GAIN, type GrimoireId } from "../../content/grimoire";
import { PAGES } from "../../content/pages";
import { REQUESTS } from "../../content/requests";
import { attune, buyHint, type Result } from "../../engine/commands";
import { effectiveOutputs } from "../../engine/estimates";
import { GRIMOIRE_IDS, hintCost, isDiscovered, isSilhouetteVisible, progressOf, type HintKind } from "../../engine/grimoire";
import { isFeatureOpen } from "../../engine/progress";
import { pagesRead, revealedNotes } from "../../engine/progress";
import { EXPERIMENTS_NOTE } from "../../content/notes";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import { riteJournal } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { BookIcon, CircleRiteIcon, ScrollIcon } from "../art/icons";
import { ItemChip } from "../components/ItemLookup";
import { PlaceHero } from "../components/PlaceHero";
import { Story } from "../components/Story";
import { Term } from "../components/Term";
import { noteTitle } from "../tasks";
import { itemName } from "../format";
import { INSIGHT_SOURCES, recipeGuide, recipeKnowledge } from "../guidance";

type Act = (command: (s: GameState) => Result) => unknown;
type Selection =
  | { kind: "recipe"; id: GrimoireId }
  | { kind: "notes" }
  | { kind: "pages" }
  | { kind: "curios" }
  | { kind: "discoveries" }
  | { kind: "kindling" }
  | { kind: "secrets" }
  | { kind: "forbidden" };

const HINT_COSTS = Object.values(INSIGHT_COST);
/** Where curios turn up, with the live chances (bonuses applied): "Search the attic 0.5% · Open grandmother's chest 1%". */
function curioSources(state: GameState): string[] {
  return (Object.keys(ACTION_DEFS) as ActionId[]).flatMap((id) =>
    effectiveOutputs(state, id)
      .filter((o) => o.item === "curio")
      .map((o) => `${ACTION_DEFS[id].name} ${Math.round((o.chance ?? 1) * 1000) / 10}%`),
  );
}

export function Grimoire({ state, act, onAttuned }: { state: GameState; act: Act; onAttuned: () => void }) {
  const silhouettes = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden" && isSilhouetteVisible(state, id) && !isDiscovered(state, id));
  const discovered = GRIMOIRE_IDS.filter((id) => isDiscovered(state, id));
  const secretsTotal = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret").length;
  const secretsLeft = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret" && !isDiscovered(state, id)).length;
  const blackPageRead = pagesRead(state).length >= PAGES.length;
  const curiosFound = Math.min(state.stats.curiosRead, CURIOS.length);
  const riteStarted = !!state.rite.performing || !!state.rite.completed;
  const [sel, setSel] = useState<Selection>(silhouettes[0] ? { kind: "recipe", id: silhouettes[0] } : { kind: "pages" });

  const item = (s: Selection, label: string, meta?: ReactNode, extra?: ReactNode) => {
    const active = JSON.stringify(s) === JSON.stringify(sel);
    return (
      <li key={JSON.stringify(s)}>
        <button className="ribbon" aria-current={active ? "true" : undefined} onClick={() => setSel(s)}>
          <span className="ribbon-row">
            <span>{label}</span>
            {meta && <span className="meta num">{meta}</span>}
          </span>
          {extra}
        </button>
      </li>
    );
  };

  const hidden = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden").length;
  const found = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden" && isDiscovered(state, id)).length;
  return (
    <>
      <PlaceHero
        icon={<BookIcon size={34} />}
        title="The Grimoire"
        term="grimoire"
        line="What's left of her book, and what you add to it."
        stats={[
          { label: "Insight to spend", term: "insight", value: `✦ ${state.insight}`, accent: true },
          { label: "Hidden recipes", term: "hidden", value: <>{found}<span className="unit">/{hidden}</span></> },
          { label: "Secrets", term: "secret", value: <>{secretsTotal - secretsLeft}<span className="unit">/{secretsTotal}</span></> },
        ]}
      />
      {discovered.length === 0 && isFeatureOpen(state, "experiments") && (
      <ol className="how-strip" aria-label="How the Grimoire works">
        <li>
          <strong>1 · Earn insight ✦</strong>
        </li>
        <li>
          <strong>
            2 · Buy a hint ({Math.min(...HINT_COSTS)}–{Math.max(...HINT_COSTS)} ✦)
          </strong>
        </li>
        <li>
          <strong>3 · Test at the Circle (1 glow per right item)</strong>
        </li>
      </ol>
      )}
      <div className="book">
      <nav className="book-index" aria-label="Grimoire contents">
        <p className="insight num" aria-label={`${state.insight} insight to spend`}>
          <b>✦ {state.insight}</b>
          <span className="meta">insight to spend</span>
        </p>
        <span className="label">Hidden recipes</span>
        {silhouettes.length === 0 ? (
          <p className="muted">{isFeatureOpen(state, "experiments") ? "None left" : "Open with experiments"}</p>
        ) : (
          <ul>
            {silhouettes.map((id) => {
              const k = recipeKnowledge(state, id);
              // What it gives, up front: a reason to chase it before you've put in any work.
              return item({ kind: "recipe", id }, GRIMOIRE_DEFS[id].name, `${k.belongs.length}/${k.size} known`, <span className="index-gives">Gives: {GRIMOIRE_DEFS[id].rewardText}</span>);
            })}
          </ul>
        )}
        {discovered.length > 0 && (
          <>
            <span className="label">Discovered</span>
            <ul>{discovered.map((id) => item({ kind: "recipe", id }, GRIMOIRE_DEFS[id].name))}</ul>
          </>
        )}
        <ul>{item({ kind: "secrets" }, "Secrets", `${secretsTotal - secretsLeft}/${secretsTotal}`)}</ul>
        {/* The story, all of it, collapsed by entry: nothing here is needed to play. */}
        <span className="label">Journal</span>
        <ul>
          {item({ kind: "notes" }, "Grandmother's notes", state.notesRevealed + (state.experimentsOpen ? 1 : 0))}
          {item({ kind: "pages" }, "Deciphered pages", pagesRead(state).length)}
          {item({ kind: "curios" }, "Curios", `${curiosFound}/${CURIOS.length}`)}
          {discovered.length > 0 && item({ kind: "discoveries" }, "Discoveries", discovered.length)}
          {riteStarted && item({ kind: "kindling" }, "The Kindling")}
          {blackPageRead && item({ kind: "forbidden" }, "The black page")}
        </ul>
      </nav>

      <section className="page" aria-live="polite">
        {sel.kind === "recipe" && (isDiscovered(state, sel.id) ? <DiscoveredPage id={sel.id} /> : <SilhouettePage state={state} id={sel.id} act={act} onAttuned={onAttuned} />)}
        {sel.kind === "pages" && <PagesPage state={state} />}
        {sel.kind === "curios" && (
          <>
            <div className="panel-title">
              <ScrollIcon size={18} />
              <h2>
                <Term id="curio">Curios</Term>
              </h2>
              <span className="muted panel-aside num">
                {curiosFound}/{CURIOS.length}
              </span>
            </div>
            <p className="muted num">
              {curioSources(state).join(" · ")} · +{INSIGHT_GAIN.curio} insight each
            </p>
            <ol className="journal">
              {CURIOS.map((c, i) =>
                i < curiosFound ? (
                  <li key={c.name}>
                    <Story summary={c.name} lines={[c.story]} />
                  </li>
                ) : (
                  <li key={c.name} className="missing">
                    Not found yet
                  </li>
                ),
              )}
            </ol>
          </>
        )}
        {sel.kind === "notes" && (
          <>
            <div className="panel-title">
              <BookIcon size={18} />
              <h2>Grandmother's notes</h2>
            </div>
            <ol className="journal">
              {[...revealedNotes(state), ...(state.experimentsOpen ? [EXPERIMENTS_NOTE] : [])].map((n) => (
                <li key={n.text}>
                  <Story summary={noteTitle(n)} lines={[n.text]} />
                </li>
              ))}
            </ol>
          </>
        )}
        {sel.kind === "discoveries" && (
          <>
            <div className="panel-title">
              <BookIcon size={18} />
              <h2>Discoveries</h2>
            </div>
            <ol className="journal">
              {discovered.map((id) => (
                <li key={id}>
                  <Story summary={GRIMOIRE_DEFS[id].name} meta={GRIMOIRE_DEFS[id].rewardText} lines={[GRIMOIRE_DEFS[id].reveal]} />
                  {GRIMOIRE_DEFS[id].opens && <p className="muted">Plot thread: grandmother's hidden note</p>}
                </li>
              ))}
            </ol>
          </>
        )}
        {sel.kind === "kindling" && (
          <>
            <div className="panel-title">
              <ScrollIcon size={18} />
              <h2>The Kindling</h2>
            </div>
            <ol className="journal">
              <li>
                <Story
                  summary={HEARTH_RITE.name}
                  meta={state.rite.completed ? `Performed: ${QUALITIES[state.rite.completed.quality]}` : `Phase ${(state.rite.performing?.phase ?? 0) + 1} of ${HEARTH_RITE.phases.length}`}
                  lines={riteJournal(state)}
                />
              </li>
            </ol>
          </>
        )}
        {sel.kind === "secrets" && (
          <>
            <div className="panel-title">
              <BookIcon size={18} />
              <h2>Secrets</h2>
              <span className="muted panel-aside num">
                {secretsTotal - secretsLeft}/{secretsTotal}
              </span>
            </div>
            <p className="num">{secretsLeft > 0 ? `${secretsLeft} left · clues ${INSIGHT_COST.clue} ✦ · test sets of 3 in Free experiment` : "All found"}</p>
            {GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret").map((id) => (
              <SecretEntry key={id} state={state} id={id} act={act} />
            ))}
          </>
        )}
        {sel.kind === "forbidden" && (
          <>
            <div className="panel-title">
              <ScrollIcon size={18} />
              <h2>The black page</h2>
            </div>
            <p className="note-quote">Ink of the Unwritten.</p>
            <p className="muted">Readable in Chapter 3</p>
          </>
        )}
      </section>
      </div>
    </>
  );
}

/** A "spend insight on this" button: says the cost, and why it can't be bought yet. */
function BuyHint({ state, id, kind, label, act }: { state: GameState; id: GrimoireId; kind: HintKind; label: string; act: Act }) {
  const cost = hintCost(state, id, kind);
  if (cost === null) return null;
  const short = state.insight < cost;
  return (
    <button className="btn btn-ghost btn-sm buy-hint" disabled={short} onClick={() => act((s) => buyHint(s, id, kind))}>
      {label} · <span className="num">{cost}</span> ✦
    </button>
  );
}

function SecretEntry({ state, id, act }: { state: GameState; id: GrimoireId; act: Act }) {
  const def = GRIMOIRE_DEFS[id];
  const found = isDiscovered(state, id);
  const read = progressOf(state, id).clues;
  return (
    <div className={`secret ${found ? "is-found" : ""}`}>
      <h3>
        {def.name} <span className="muted num">({def.ingredients.length} things)</span>
        {found && <span className="good">✓ Found</span>}
      </h3>
      {found ? (
        <p className="muted">{def.rewardText}</p>
      ) : (
        <>
          {(def.clues ?? []).slice(0, read).map((c) => (
            <p key={c} className="note-quote">
              {c}
            </p>
          ))}
          <BuyHint state={state} id={id} kind="clue" label={read === 0 ? "Read a clue" : "Read another clue"} act={act} />
        </>
      )}
    </div>
  );
}

export function SilhouettePage({ state, id, act, onAttuned }: { state: GameState; id: GrimoireId; act: Act; onAttuned: () => void }) {
  const def = GRIMOIRE_DEFS[id];
  const p = progressOf(state, id);
  const guide = recipeGuide(state, id);
  const k = recipeKnowledge(state, id);

  return (
    <>
      <div className="panel-title">
        <BookIcon size={18} />
        <h2>{def.name}</h2>
        <span className="muted panel-aside">{def.ingredients.length} things</span>
      </div>
      <p className="gives">
        <span className="gives-label">Gives</span> {def.rewardText}
      </p>

      <div className="next-step" role="note">
        <span className="next-step-label">Next step</span>
        <strong>{guide.headline}</strong>
        {guide.detail && <p>{guide.detail}</p>}
        {guide.action && (
          <button className="btn btn-primary btn-sm" onClick={() => act((s) => attune(s, id)) && onAttuned()}>
            <CircleRiteIcon size={16} /> {guide.action}
          </button>
        )}
      </div>

      <dl className="proofs">
        <dt>Belongs</dt>
        <dd>
          {k.belongs.length === 0 ? <span className="muted">—</span> : k.belongs.map((i) => <ItemChip key={i} item={i} qty={1} />)}
          <span className="muted num">
            {" "}
            ({k.belongs.length}/{k.size})
          </span>
        </dd>
        {k.ruledOut.length > 0 && (
          <>
            <dt>Crossed out</dt>
            <dd>{k.ruledOut.map((i) => <span key={i} className="chip struck">{itemName(i)}</span>)}</dd>
          </>
        )}
        {k.belongs.length < k.size && (
          <>
            <dt>Still possible</dt>
            <dd>
              {k.stillPossible.length === 0 ? (
                <span className="muted">None held</span>
              ) : (
                k.stillPossible.slice(0, 12).map((i) => <span key={i} className="chip">{itemName(i)}</span>)
              )}
            </dd>
          </>
        )}
      </dl>

      <h3 className="hints-title">Hints</h3>
      <HintList state={state} id={id} act={act} />
      <ul className="insight-sources" aria-label="Where insight comes from">
        <li className="insight-have num">✦ {state.insight} to spend</li>
        {INSIGHT_SOURCES.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      {p.attempts.length > 0 && (
        <details className="attempts">
          <summary>Your tries ({p.attempts.length})</summary>
          <ol className="ledger">
            {[...p.attempts].reverse().map((a, i) => (
              <li key={i}>
                <span>{a.items.map(itemName).join(" · ")}</span>
                <Glows glows={a.glows} of={a.items.length} />
              </li>
            ))}
          </ol>
        </details>
      )}
    </>
  );
}

/** A hidden recipe's hints, I to III (the riddle, what a villager said, categories, names, the nudge), with buy buttons. */
export function HintList({ state, id, act }: { state: GameState; id: GrimoireId; act: Act }) {
  const def = GRIMOIRE_DEFS[id];
  const p = progressOf(state, id);
  const names = p.bought.named;
  return (
    <>
      <div className="hint">
        <span className="hint-num">I</span>
        <p className="note-quote">{def.hints?.riddle}</p>
      </div>
      {p.heard && heardFrom(id) && (
        <div className="hint heard">
          <span className="hint-num" aria-hidden="true">
            ✦
          </span>
          <p>
            <span className="gives-label">Heard in the village · {heardFrom(id)!.from}</span>
            <br />
            <span className="note-quote">{heardFrom(id)!.aside}</span>
          </p>
        </div>
      )}
      <div className={`hint ${p.bought.category ? "" : "locked"}`}>
        <span className="hint-num">II</span>
        {p.bought.category ? <p>{def.hints?.category.join(" · ")}</p> : <BuyHint state={state} id={id} kind="category" label="Where each thing comes from" act={act} />}
      </div>
      <div className={`hint ${names.length === 0 && !p.bought.close ? "locked" : ""}`}>
        <span className="hint-num">III</span>
        <div>
          {names.length > 0 && <p>{names.map(itemName).join(", ")}.</p>}
          <BuyHint state={state} id={id} kind="name" label={names.length === 0 ? "Name one ingredient" : "Name another"} act={act} />
          {/* The one ingredient never named gets a nudge instead: finding it stays yours. */}
          {def.hints?.close && (p.bought.close ? <p className="note-quote">The last one: {def.hints.close}</p> : <BuyHint state={state} id={id} kind="close" label="A nudge toward the last one (never its name)" act={act} />)}
        </div>
      </div>
    </>
  );
}

/** The villager who mentioned this recipe, and what they said. */
function heardFrom(id: GrimoireId): { from: string; aside: string } | null {
  for (const r of Object.values(REQUESTS)) if ("mentions" in r && r.mentions.recipe === id) return { from: r.from, aside: r.mentions.aside };
  return null;
}

/** Glow dots. `staggered` lights them one after another, for a fresh result. */
export function Glows({ glows, of, staggered }: { glows: number; of: number; staggered?: boolean }) {
  return (
    <span className={`glows ${staggered ? "staggered" : ""}`} aria-label={`${glows} of ${of} glow`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={`glow ${i < glows ? "lit" : ""}`} style={staggered ? { animationDelay: `${i * 220}ms` } : undefined} aria-hidden="true" />
      ))}
    </span>
  );
}

function DiscoveredPage({ id }: { id: GrimoireId }) {
  const def = GRIMOIRE_DEFS[id];
  return (
    <>
      <div className="panel-title">
        <BookIcon size={18} />
        <h2>{def.name}</h2>
        <span className="panel-aside good">✓ Discovered</span>
      </div>
      <p className="gives">
        <span className="gives-label">Gives</span> {def.rewardText}
      </p>
      <div className="action-io">
        {def.ingredients.map((i) => (
          <span key={i} className="chip">
            {itemName(i)}
          </span>
        ))}
      </div>
      {def.opens && <p className="muted">{def.opens}</p>}
      <Story lines={[def.reveal]} />
    </>
  );
}

function PagesPage({ state }: { state: GameState }) {
  const pages = pagesRead(state);
  return (
    <>
      <div className="panel-title">
        <ScrollIcon size={18} />
        <h2>Deciphered pages</h2>
      </div>
      {pages.length === 0 && <p className="muted">None yet · burnt pages come from Search the attic (Scholarship)</p>}
      <ol className="journal">
        {pages.map((p) => (
          <li key={p.title}>
            <Story summary={p.title} meta={p.unlocks.length > 0 ? `Teaches: ${p.unlocks.map((a) => ACTION_DEFS[a].name).join(", ")}` : "Readable in Chapter 3"} lines={[p.text]} />
          </li>
        ))}
      </ol>
    </>
  );
}
