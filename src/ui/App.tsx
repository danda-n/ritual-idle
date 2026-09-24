import { useState } from "react";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { ItemId } from "../content/items";
import { SKILL_IDS, SKILLS, type SkillId } from "../content/skills";
import type { CatchUp } from "../engine/offline";
import { currentNote, goalProgress, isRecipeKnown, isSkillUnlocked, pagesRead, revealedNotes } from "../engine/progress";
import { exportSave, importSave } from "../engine/save";
import { blockReason, skillLevel } from "../engine/simulate";
import type { GameState } from "../engine/state";
import { levelProgress } from "../engine/xp";
import { formatDuration, formatStop, itemName } from "./format";
import { useGame, type Toast } from "./useGame";

const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];

export function App() {
  const game = useGame();
  const { state } = game;
  const [skill, setSkill] = useState<SkillId>(state.active ? ACTION_DEFS[state.active.id].skill : "scavenging");

  return (
    <div className="app">
      <header className="topbar">
        <h1>Ritual Idle</h1>
        <ActiveBar state={state} onStop={game.stop} stopNote={game.lastStop && formatStop(game.lastStop.reason)} />
      </header>

      <nav className="skills" aria-label="Skills">
        {SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).map((id) => (
          <button key={id} className={`skill ${id === skill ? "selected" : ""}`} onClick={() => setSkill(id)}>
            <span className="skill-name">{SKILLS[id].name}</span>
            <span className="skill-level">
              {skillLevel(state, id)}/{state.levelCap}
            </span>
            <Bar value={levelProgress(state.skills[id].xp, state.levelCap)} />
          </button>
        ))}
      </nav>

      <main className="actions">
        <h2>{SKILLS[skill].name}</h2>
        {ACTION_IDS.filter((id) => ACTION_DEFS[id].skill === skill).map((id) => (
          <ActionRow key={id} id={id} state={state} onStart={() => game.start(id)} />
        ))}
      </main>

      <aside className="side">
        <Notes state={state} />
        <section>
          <h2>Pantry &amp; shelves</h2>
          <Inventory state={state} />
        </section>
      </aside>

      <footer className="footer">
        <SaveTools state={state} onLoad={game.load} onReset={game.reset} />
      </footer>

      <Toasts toasts={game.toasts} onDismiss={game.dismissToast} />
      {game.away && <AwaySummary away={game.away} onClose={game.dismissAway} />}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <span className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="bar-fill" style={{ width: `${Math.min(1, value) * 100}%` }} />
    </span>
  );
}

function ActiveBar({ state, onStop, stopNote }: { state: GameState; onStop: () => void; stopNote?: string }) {
  if (!state.active) return <div className="active idle">{stopNote ? `Stopped: ${stopNote}.` : "Idle. Choose something to do."}</div>;
  const def = ACTION_DEFS[state.active.id];
  return (
    <div className="active">
      <span>{def.name}</span>
      <Bar value={state.active.elapsedMs / (def.seconds * 1000)} />
      <button onClick={onStop}>Stop</button>
    </div>
  );
}

function ActionRow({ id, state, onStart }: { id: ActionId; state: GameState; onStart: () => void }) {
  const def = ACTION_DEFS[id];
  if (!isRecipeKnown(state, id)) {
    return (
      <div className="action unknown">
        <div className="action-main">
          <strong>Unknown recipe</strong>
          <span className="muted">Lvl {def.level}</span>
        </div>
        <div className="action-io muted">Somewhere in grandmother's burnt pages. Decipher more of them.</div>
      </div>
    );
  }
  const blocked = blockReason(state, id);
  const locked = blocked?.kind === "level_too_low";
  const running = state.active?.id === id;
  const inputs = Object.entries(def.inputs) as [ItemId, number][];

  return (
    <div className={`action ${locked ? "locked" : ""} ${running ? "running" : ""}`}>
      <div className="action-main">
        <strong>{def.name}</strong>
        <span className="muted">
          Lvl {def.level} · {def.seconds}s · {def.xp} xp
        </span>
      </div>
      <div className="action-io">
        {inputs.length > 0 && (
          <span>
            {inputs.map(([item, qty]) => (
              <span key={item} className={(state.inventory[item] ?? 0) < qty ? "short" : ""}>
                {qty} {itemName(item)}{" "}
              </span>
            ))}
            →{" "}
          </span>
        )}
        {def.outputs.map((o) => (
          <span key={o.item}>
            {o.qty} {itemName(o.item)}
            {o.chance !== undefined && <span className="muted"> ({Math.round(o.chance * 1000) / 10}%)</span>}{" "}
          </span>
        ))}
      </div>
      {running ? (
        <Bar value={state.active!.elapsedMs / (def.seconds * 1000)} />
      ) : (
        <button onClick={onStart} disabled={blocked !== null} title={blocked ? formatStop(blocked) : undefined}>
          {locked ? `Level ${def.level}` : "Start"}
        </button>
      )}
    </div>
  );
}

function Notes({ state }: { state: GameState }) {
  const note = currentNote(state);
  const progress = goalProgress(state, note);
  const older = revealedNotes(state).slice(0, -1).reverse();
  const pages = pagesRead(state);
  return (
    <section className="notes">
      <h2>Grandmother's notes</h2>
      <blockquote>{note.text}</blockquote>
      {"hint" in note && <p className="muted hint">{note.hint}</p>}
      {progress && (
        <div className="goal">
          <Bar value={progress.done / progress.target} />
          <span className="muted">
            {progress.done}/{progress.target}
          </span>
        </div>
      )}
      {older.length > 0 && (
        <details>
          <summary>Earlier notes ({older.length})</summary>
          {older.map((n) => (
            <blockquote key={n.text} className="old">{n.text}</blockquote>
          ))}
        </details>
      )}
      {pages.length > 0 && (
        <details>
          <summary>Deciphered pages ({pages.length})</summary>
          {pages.map((p) => (
            <div key={p.title} className="page">
              <strong>{p.title}</strong>
              <p>{p.text}</p>
            </div>
          ))}
        </details>
      )}
    </section>
  );
}

function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className="toast" onClick={() => onDismiss(t.id)}>
          <strong>{t.title}</strong>
          <span>{t.text}</span>
        </button>
      ))}
    </div>
  );
}

function Inventory({ state }: { state: GameState }) {
  const items = (Object.entries(state.inventory) as [ItemId, number][]).filter(([, n]) => n > 0);
  if (items.length === 0) return <p className="muted">Empty. The house is cold.</p>;
  return (
    <ul className="items">
      {items.map(([item, n]) => (
        <li key={item}>
          <span>{itemName(item)}</span>
          <span>{n}</span>
        </li>
      ))}
    </ul>
  );
}

function AwaySummary({ away, onClose }: { away: CatchUp; onClose: () => void }) {
  const { report } = away;
  const gained = (Object.entries(report.itemsGained) as [ItemId, number][]).filter(([, n]) => n > 0);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="away-title">
      <div className="modal">
        <h2 id="away-title">While you were away</h2>
        <p className="muted">
          You were gone {formatDuration(away.awayMs)}.
          {away.capped && ` The house kept working for ${formatDuration(report.elapsedMs)}, the limit for now.`}
        </p>
        {report.actionsCompleted === 0 ? (
          <p>Nothing stirred. Leave something running next time.</p>
        ) : (
          <>
            {report.levelUps.map((l) => (
              <p key={l.skill}>
                {SKILLS[l.skill].name} rose from {l.from} to {l.to}.
              </p>
            ))}
            <ul className="items">
              {gained.map(([item, n]) => (
                <li key={item}>
                  <span>{itemName(item)}</span>
                  <span>+{n}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {report.notesRevealed.map((n) => (
          <blockquote key={n.text}>{n.text}</blockquote>
        ))}
        {report.pagesRead.map((p) => (
          <p key={p.title}>Page deciphered: <strong>{p.title}</strong></p>
        ))}
        {report.stopped && <p className="warn">Work stopped: {formatStop(report.stopped.reason)}.</p>}
        <button onClick={onClose}>Back to the house</button>
      </div>
    </div>
  );
}

function SaveTools({ state, onLoad, onReset }: { state: GameState; onLoad: (s: GameState) => void; onReset: () => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const doExport = async () => {
    const code = exportSave(state);
    setText(code);
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Save copied to clipboard.");
    } catch {
      setMessage("Save code is in the box. Copy it from there.");
    }
  };
  const doImport = () => {
    try {
      onLoad(importSave(text));
      setMessage("Save loaded.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That isn't a valid save.");
    }
  };

  return (
    <details>
      <summary>Save</summary>
      <div className="save-tools">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a save code here to import." rows={3} />
        <div className="row">
          <button onClick={doExport}>Export</button>
          <button onClick={doImport} disabled={!text.trim()}>
            Import
          </button>
          <button className="danger" onClick={() => confirm("Start over? This erases your progress.") && onReset()}>
            Reset
          </button>
          <span className="muted">{message}</span>
        </div>
      </div>
    </details>
  );
}
