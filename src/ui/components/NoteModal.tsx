import type { Note } from "../../engine/progress";
import { noteUnlocks, taskName, taskPlace, type Place } from "../tasks";
import { Modal } from "./Modal";

/** A story beat: grandmother's note, what it opened, and a button straight to the next task. */
export function NoteModal({ note, onClose, onGo }: { note: Note; onClose: () => void; onGo: (p: Place) => void }) {
  const unlocks = noteUnlocks(note);
  return (
    <Modal title="A note in the margin" onClose={onClose}>
      <blockquote className="note-quote">{note.text}</blockquote>
      {unlocks.length > 0 && (
        <ul className="effects">
          {unlocks.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      )}
      {"hint" in note && <p className="note-hint">{note.hint}</p>}
      {"goal" in note ? (
        <button
          className="btn btn-primary"
          onClick={() => {
            onGo(taskPlace(note.goal));
            onClose();
          }}
        >
          Go: {taskName(note.goal)}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={onClose}>
          Continue
        </button>
      )}
    </Modal>
  );
}
