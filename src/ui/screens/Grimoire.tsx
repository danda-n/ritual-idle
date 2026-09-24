import { useState, type ReactNode } from "react";
import { CURIO_STORIES, GRIMOIRE_DEFS, INSIGHT, type GrimoireId } from "../../content/grimoire";
import { PAGES } from "../../content/pages";
import { attune, type Result } from "../../engine/commands";
import { GRIMOIRE_IDS, hintTier, isDiscovered, isSilhouetteVisible, nextHintAt, plainNamesShown, progressOf } from "../../engine/grimoire";
import { pagesRead, revealedNotes } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { BookIcon, CircleRiteIcon, ScrollIcon } from "../art/icons";
import { Bar } from "../components/Bar";
import { ItemChip } from "../components/ItemLookup";
import { itemName } from "../format";
import { INSIGHT_SOURCES, recipeGuide, recipeKnowledge } from "../guidance";

type Act = (command: (s: GameState) => Result) => unknown;
type Selection = { kind: "recipe"; id: GrimoireId } | { kind: "notes" } | { kind: "pages" } | { kind: "curios" } | { kind: "secrets" } | { kind: "forbidden" };

export function Grimoire({ state, act, onAttuned }: { state: GameState; act: Act; onAttuned: () => void }) {
  const silhouettes = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden" && isSilhouetteVisible(state, id) && !isDiscovered(state, id));
  const discovered = GRIMOIRE_IDS.filter((id) => isDiscovered(state, id));
  const secretsTotal = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret").length;
  const secretsLeft = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "secret" && !isDiscovered(state, id)).length;
  const blackPageRead = pagesRead(state).length >= PAGES.length;
  const [sel, setSel] = useState<Selection>(silhouettes[0] ? { kind: "recipe", id: silhouettes[0] } : { kind: "pages" });

  const item = (s: Selection, label: string, extra?: ReactNode) => {
    const active = JSON.stringify(s) === JSON.stringify(sel);
    return (
      <li key={JSON.stringify(s)}>
        <button className={`index-entry ${active ? "selected" : ""}`} aria-current={active ? "true" : undefined} onClick={() => setSel(s)}>
          <span>{label}</span>
          {extra}
        </button>
      </li>
    );
  };

  return (
    <div className="grimoire">
      {discovered.length === 0 && (
      <ol className="how-strip" aria-label="How the Grimoire works">
        <li>
          <strong>1 · Collect hints</strong> Burnt pages, curios and villagers reveal hidden recipes here.
        </li>
        <li>
          <strong>2 · Guess at the Circle</strong> Place things; it glows once per right one.
        </li>
        <li>
          <strong>3 · Discover</strong> The right set makes it. Its bonus is yours for good.
        </li>
      </ol>
      )}
      <nav className="panel grimoire-index" aria-label="Grimoire contents">
        <h3>Hidden recipes</h3>
        {silhouettes.length === 0 ? (
          <p className="muted">No shapes yet. Hints turn up in burnt pages, curios, and what the village remembers.</p>
        ) : (
          <ul>
            {silhouettes.map((id) =>
              item({ kind: "recipe", id }, GRIMOIRE_DEFS[id].name, <Bar thin value={Math.min(1, progressOf(state, id).insight / (INSIGHT.plain + INSIGHT.perExtraName))} label="Insight" />),
            )}
          </ul>
        )}
        {discovered.length > 0 && (
          <>
            <h3>Discovered</h3>
            <ul>{discovered.map((id) => item({ kind: "recipe", id }, GRIMOIRE_DEFS[id].name))}</ul>
          </>
        )}
        <h3>The rest of the book</h3>
        <ul>
          {item({ kind: "notes" }, `Grandmother's notes (${state.notesRevealed})`)}
          {item({ kind: "pages" }, `Deciphered pages (${pagesRead(state).length})`)}
          {item({ kind: "curios" }, `Curios (${Math.min(state.stats.curiosRead, CURIO_STORIES.length)}/${CURIO_STORIES.length})`)}
          {item({ kind: "secrets" }, "Secrets")}
          {blackPageRead && item({ kind: "forbidden" }, "The black page")}
        </ul>
      </nav>

      <section className="panel paper grimoire-page" aria-live="polite">
        {sel.kind === "recipe" && (isDiscovered(state, sel.id) ? <DiscoveredPage id={sel.id} /> : <SilhouettePage state={state} id={sel.id} act={act} onAttuned={onAttuned} />)}
        {sel.kind === "pages" && <PagesPage state={state} />}
        {sel.kind === "curios" && (
          <>
            <div className="panel-title">
              <ScrollIcon size={18} />
              <h2>Curios</h2>
              <span className="muted panel-aside num">
                {Math.min(state.stats.curiosRead, CURIO_STORIES.length)}/{CURIO_STORIES.length}
              </span>
            </div>
            <p className="muted">Rare finds from the attic (0.5%) and grandmother's chest (1%). Each one also adds 3 insight to a hidden recipe.</p>
            <ol className="curios">
              {CURIO_STORIES.map((story, i) => (
                <li key={i} className={i < state.stats.curiosRead ? "found" : "missing"}>
                  {i < state.stats.curiosRead ? story : "Not found yet"}
                </li>
              ))}
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
              {revealedNotes(state).map((n) => (
                <li key={n.text} className="note-quote">
                  {n.text}
                </li>
              ))}
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
            <p>{secretsLeft > 0 ? `${secretsLeft} left to find. No hints: set the Circle to Free experiment and try sets of 3.` : "You found every secret in this chapter."}</p>
          </>
        )}
        {sel.kind === "forbidden" && (
          <>
            <div className="panel-title">
              <ScrollIcon size={18} />
              <h2>The black page</h2>
            </div>
            <p className="note-quote">Ink of the Unwritten.</p>
            <p className="muted">The ink is too dark to read. Not yet.</p>
          </>
        )}
      </section>
    </div>
  );
}

function SilhouettePage({ state, id, act, onAttuned }: { state: GameState; id: GrimoireId; act: Act; onAttuned: () => void }) {
  const def = GRIMOIRE_DEFS[id];
  const p = progressOf(state, id);
  const tier = hintTier(p.insight);
  const next = nextHintAt(id, p.insight);
  const names = def.hints?.plain.slice(0, plainNamesShown(id, p.insight)) ?? [];
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
        <p>{guide.detail}</p>
        {guide.action && (
          <button className="btn btn-primary" onClick={() => act((s) => attune(s, id)) && onAttuned()}>
            <CircleRiteIcon size={16} /> {guide.action}
          </button>
        )}
      </div>

      <dl className="proofs">
        <dt>Belongs</dt>
        <dd>
          {k.belongs.length === 0 ? <span className="muted">Nothing confirmed yet</span> : k.belongs.map((i) => <ItemChip key={i} item={i} qty={1} />)}
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
                <span className="muted">Nothing you hold. Gather more kinds of things.</span>
              ) : (
                k.stillPossible.slice(0, 12).map((i) => <span key={i} className="chip">{itemName(i)}</span>)
              )}
            </dd>
          </>
        )}
      </dl>

      <h3 className="hints-title">Hints</h3>
      <div className="hint">
        <span className="hint-num">I</span>
        <p className="note-quote">{def.hints?.riddle}</p>
      </div>
      <div className={`hint ${tier === "riddle" ? "locked" : ""}`}>
        <span className="hint-num">II</span>
        {tier === "riddle" ? <p className="muted">at {INSIGHT.category} insight</p> : <p>{def.hints?.category.join(" · ")}</p>}
      </div>
      <div className={`hint ${names.length === 0 ? "locked" : ""}`}>
        <span className="hint-num">III</span>
        {names.length === 0 ? <p className="muted">at {INSIGHT.plain} insight</p> : <p>{names.map(itemName).join(", ")}.</p>}
      </div>
      <div className="goal">
        <Bar value={next ? p.insight / next : 1} label="Insight toward the next hint" />
        <span className="muted num">{next ? `${p.insight}/${next}` : p.insight}</span>
      </div>
      {next && (
        <ul className="insight-sources" aria-label="Where insight comes from">
          {INSIGHT_SOURCES.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}

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

export function Glows({ glows, of }: { glows: number; of: number }) {
  return (
    <span className="glows" aria-label={`${glows} of ${of} glow`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={`glow ${i < glows ? "lit" : ""}`} aria-hidden="true" />
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
        <span className="chip accent panel-aside">Discovered</span>
      </div>
      <p className="note-quote">{def.reveal}</p>
      <div className="action-io">
        {def.ingredients.map((i) => (
          <span key={i} className="chip">
            {itemName(i)}
          </span>
        ))}
      </div>
      <p>
        <strong>What it does:</strong> {def.rewardText}
      </p>
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
      {pages.length === 0 && <p className="muted">Nothing read yet. Burnt pages turn up in the attic.</p>}
      {pages.map((p) => (
        <div key={p.title} className="page-entry">
          <h3>{p.title}</h3>
          <p className="text-2">{p.text}</p>
        </div>
      ))}
    </>
  );
}
