import type { Note } from "../../engine/progress";
import { noteUnlocks, taskName } from "../tasks";
import { Modal } from "./Modal";

/** A story beat: grandmother's note appears once, with exactly what it opened and the next task. */
export function NoteModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const unlocks = noteUnlocks(note);
  return (
    <Modal title="A note in the margin" onClose={onClose}>
      <blockquote className="note-quote paper-quote">{note.text}</blockquote>
      {unlocks.length > 0 && (
        <ul className="effects">
          {unlocks.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      )}
      {"goal" in note && (
        <p className="effect-line">
          Next: {taskName(note.goal)}
        </p>
      )}
      <button className="btn btn-primary" onClick={onClose}>
        Continue
      </button>
    </Modal>
  );
}
