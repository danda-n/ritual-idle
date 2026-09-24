import { currentNote, goalProgress, revealedNotes } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { BookIcon } from "../art/icons";
import { Bar } from "./Bar";

export function Notes({ state }: { state: GameState }) {
  const note = currentNote(state);
  const progress = goalProgress(state, note);
  const older = revealedNotes(state).slice(0, -1).reverse();
  return (
    <section className="panel notes" aria-labelledby="notes-heading">
      <div className="panel-title">
        <BookIcon size={18} />
        <h2 id="notes-heading">Grandmother's notes</h2>
      </div>
      <blockquote className="note-quote">{note.text}</blockquote>
      {"hint" in note && <p className="notes-hint muted">{note.hint}</p>}
      {progress && (
        <div className="goal">
          <Bar value={progress.done / progress.target} label="Note goal progress" />
          <span className="muted num">
            {progress.done}/{progress.target}
          </span>
        </div>
      )}
      {older.length > 0 && (
        <details>
          <summary>Earlier notes ({older.length})</summary>
          {older.map((n) => (
            <blockquote key={n.text} className="note-quote old">
              {n.text}
            </blockquote>
          ))}
        </details>
      )}
    </section>
  );
}
