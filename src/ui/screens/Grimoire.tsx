import { useState, type ReactNode } from "react";
import { GRIMOIRE_DEFS, INSIGHT, type GrimoireId } from "../../content/grimoire";
import { PAGES } from "../../content/pages";
import { attune, setMark, type Result } from "../../engine/commands";
import { GRIMOIRE_IDS, hintTier, isDiscovered, isSilhouetteVisible, nextHintAt, plainNamesShown, progressOf } from "../../engine/grimoire";
import { isFeatureOpen, pagesRead, revealedNotes } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { BookIcon, CircleRiteIcon, ScrollIcon } from "../art/icons";
import { Bar } from "../components/Bar";
import { itemName } from "../format";
import type { ItemId } from "../../content/items";

type Act = (command: (s: GameState) => Result) => unknown;
type Selection = { kind: "recipe"; id: GrimoireId } | { kind: "notes" } | { kind: "pages" } | { kind: "secrets" } | { kind: "forbidden" };

export function Grimoire({ state, act, onAttuned }: { state: GameState; act: Act; onAttuned: () => void }) {
  const silhouettes = GRIMOIRE_IDS.filter((id) => GRIMOIRE_DEFS[id].kind === "hidden" && isSilhouetteVisible(state, id) && !isDiscovered(state, id));
  const discovered = GRIMOIRE_IDS.filter((id) => isDiscovered(state, id));
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
      <nav className="panel grimoire-index" aria-label="Grimoire contents">
        <h3>Silhouettes</h3>
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
          {item({ kind: "secrets" }, "Unwritten things")}
          {blackPageRead && item({ kind: "forbidden" }, "The black page")}
        </ul>
      </nav>

      <section className="panel paper grimoire-page" aria-live="polite">
        {sel.kind === "recipe" && (isDiscovered(state, sel.id) ? <DiscoveredPage id={sel.id} /> : <SilhouettePage state={state} id={sel.id} act={act} onAttuned={onAttuned} />)}
        {sel.kind === "pages" && <PagesPage state={state} />}
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
              <h2>Unwritten things</h2>
            </div>
            <p className="note-quote">Some things the book does not know it holds.</p>
            <p className="muted">
              {secretsLeft > 0 ? `${secretsLeft} secret${secretsLeft === 1 ? "" : "s"} in this chapter, with no hints at all.` : "You have found every secret in this chapter."} They
              answer only to free experiments at the circle.
            </p>
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
  const circleOpen = isFeatureOpen(state, "circle");
  const marked = [...new Set(p.attempts.flatMap((a) => a.items))].filter((i) => !p.provenWrong.includes(i) && !p.provenRight.includes(i));
  const cycle = (m?: "suspect" | "doubt") => (m === undefined ? "suspect" : m === "suspect" ? "doubt" : null);

  return (
    <>
      <div className="panel-title">
        <BookIcon size={18} />
        <h2>{def.name}</h2>
        <span className="muted panel-aside">{def.ingredients.length} things</span>
      </div>
      <div className="hint">
        <span className="hint-num">I</span>
        <p className="note-quote">{def.hints?.riddle}</p>
      </div>
      <div className={`hint ${tier === "riddle" ? "locked" : ""}`}>
        <span className="hint-num">II</span>
        {tier === "riddle" ? <p className="muted">A clearer hint at {INSIGHT.category} insight.</p> : <p>{def.hints?.category.join(" · ")}</p>}
      </div>
      <div className={`hint ${names.length === 0 ? "locked" : ""}`}>
        <span className="hint-num">III</span>
        {names.length === 0 ? <p className="muted">A plain name at {INSIGHT.plain} insight.</p> : <p>{names.map(itemName).join(", ")}.</p>}
      </div>
      <div className="goal">
        <Bar value={next ? p.insight / next : 1} label="Insight toward the next hint" />
        <span className="muted num">{next ? `Insight ${p.insight}/${next}` : `Insight ${p.insight}`}</span>
      </div>

      {(p.provenWrong.length > 0 || p.provenRight.length > 0) && (
        <dl className="proofs">
          {p.provenRight.length > 0 && (
            <>
              <dt>Belongs</dt>
              <dd>{p.provenRight.map((i) => <span key={i} className="chip accent">{itemName(i)}</span>)}</dd>
            </>
          )}
          {p.provenWrong.length > 0 && (
            <>
              <dt>Proven wrong</dt>
              <dd>{p.provenWrong.map((i) => <span key={i} className="chip struck">{itemName(i)}</span>)}</dd>
            </>
          )}
        </dl>
      )}

      {marked.length > 0 && (
        <div className="marks">
          <h3>Your pencil marks</h3>
          <div className="action-io">
            {marked.map((i: ItemId) => (
              <button key={i} className={`chip mark ${p.marks[i] ?? ""}`} onClick={() => act((s) => setMark(s, id, i, cycle(p.marks[i])))} title="Click to mark as suspected, doubted, or clear">
                {itemName(i)} {p.marks[i] === "suspect" ? "?" : p.marks[i] === "doubt" ? "✕?" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {p.attempts.length > 0 && (
        <div className="attempts">
          <h3>Attempts ({p.attempts.length})</h3>
          <ol className="ledger">
            {[...p.attempts].reverse().map((a, i) => (
              <li key={i}>
                <span>{a.items.map(itemName).join(" · ")}</span>
                <Glows glows={a.glows} of={a.items.length} />
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="row">
        <button
          className="btn btn-primary"
          disabled={!circleOpen}
          title={circleOpen ? undefined : "The circle is still cold."}
          onClick={() => act((s) => attune(s, id)) && onAttuned()}
        >
          <CircleRiteIcon size={16} /> Attune the circle
        </button>
        {!circleOpen && <span className="muted">The circle is still cold. Grandmother's notes will say when.</span>}
      </div>
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
