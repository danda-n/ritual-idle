import type { ItemId } from "../../content/items";
import { PART_DEFS, type PartId } from "../../content/rite";
import type { Note } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { noteUnlocks, rewardText, stepPlace, stepsOf, taskName, taskPlace, type Place } from "../tasks";
import { ItemChip } from "./ItemLookup";
import { Modal } from "./Modal";

/**
 * A new chapter step, task first: what to do (its small steps, each with its reward), what it
 * needs, and a Go button to the first open step. Grandmother's line is one short quote at the end;
 * the full note is in the Grimoire journal.
 */
export function TaskCard({ note, state, onClose, onGo }: { note: Note; state: GameState; onClose: () => void; onGo: (p: Place) => void }) {
  const unlocks = noteUnlocks(note);
  const experiments = "opens" in note && (note.opens as readonly string[]).includes("experiments");
  const goal = "goal" in note ? note.goal : null;
  const { steps, done, current } = stepsOf(state, note);
  const title = experiments ? "New: Experiments at the Circle" : goal ? `New: ${taskName(goal)}` : "Chapter complete";
  const needs = goal?.kind === "place" ? (Object.entries(PART_DEFS[goal.part as PartId].items) as [ItemId, number][]) : [];
  const go: Place | null = current ? stepPlace(current, state) : experiments ? { tab: "circle" } : goal ? taskPlace(goal) : null;

  return (
    <Modal title={title} onClose={onClose}>
      {unlocks.length > 0 && (
        <ul className="effects">
          {unlocks.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      )}
      {steps.length > 0 ? (
        <ol className="task-steps">
          {steps.map((s) => (
            <li key={s.id} className={done(s) ? "is-done" : s === current ? "is-current" : ""}>
              <span className="task-step-mark" aria-hidden="true">
                {done(s) ? "✓" : s === current ? "▶" : "·"}
              </span>
              <span>{s.label}</span>
              {rewardText(s) && <span className="task-reward num">{rewardText(s)}</span>}
            </li>
          ))}
        </ol>
      ) : (
        "hint" in note && <p className="note-hint">{note.hint}</p>
      )}
      {needs.length > 0 && (
        <div className="task-needs">
          <span className="muted">Needs</span>
          {needs.map(([item, qty]) => (
            <ItemChip key={item} item={item} need={qty} />
          ))}
        </div>
      )}
      {go ? (
        <button
          className="btn btn-primary"
          onClick={() => {
            onGo(go);
            onClose();
          }}
        >
          Go{current ? `: ${current.label}` : ""}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={onClose}>
          Continue
        </button>
      )}
      {"quote" in note && <p className="task-quote">“{note.quote}” — grandmother</p>}
    </Modal>
  );
}
