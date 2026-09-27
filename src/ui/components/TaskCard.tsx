import type { ItemId } from "../../content/items";
import { PART_DEFS, type PartId } from "../../content/rite";
import type { Note } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { itemPlace, noteUnlocks, placeLabel, rewardText, stepPlace, stepProgress, stepsOf, taskName, taskPlace, type Place } from "../tasks";
import { ItemChip } from "./ItemLookup";
import { Modal } from "./Modal";
import { Story } from "./Story";

/**
 * A new chapter stage, task first: what to do (a part's items, or the stage's step), its reward,
 * and a button that names where it takes you. Grandmother's note sits behind a collapsed "Story"
 * link (it's also in the Grimoire journal).
 */
export function TaskCard({ note, state, onClose, onGo }: { note: Note; state: GameState; onClose: () => void; onGo: (p: Place) => void }) {
  const unlocks = noteUnlocks(note);
  const experiments = "opens" in note && (note.opens as readonly string[]).includes("experiments");
  const goal = "goal" in note ? note.goal : null;
  const { steps, done, current } = stepsOf(state, note);
  const title = experiments ? "New: Experiments" : goal ? `New: ${taskName(goal)}` : "Chapter complete";
  const needs = goal?.kind === "place" ? (Object.entries(PART_DEFS[goal.part as PartId].items) as [ItemId, number][]) : [];
  // A part: start where its first missing item is made. Otherwise: where the step is done.
  const firstShort = needs.find(([item, qty]) => (state.inventory[item] ?? 0) < qty);
  const go: Place | null = goal?.kind === "place" && firstShort ? itemPlace(state, firstShort[0]) : current ? stepPlace(current, state) : experiments ? { tab: "experiments" } : goal ? taskPlace(goal) : null;
  const reward = steps.map(rewardText).find(Boolean);
  // A stage whose only step is placing its part lists the part's items instead of steps.
  const showSteps = steps.length > 0 && goal?.kind !== "place";

  return (
    // A stray click outside shouldn't throw the card away: close with its button or Escape.
    <Modal title={title} onClose={onClose} dismissOnBackdrop={false}>
      {unlocks.length > 0 && (
        <ul className="effects">
          {unlocks.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      )}
      {showSteps ? (
        <ol className="task-steps">
          {steps.map((s) => (
            <li key={s.id} className={done(s) ? "is-done" : s === current ? "is-current" : ""}>
              <span className="task-step-mark" aria-hidden="true">
                {done(s) ? "✓" : s === current ? "▶" : "·"}
              </span>
              <span>
                {s.label}
                {!done(s) && stepProgress(state, s) && <span className="num muted"> {stepProgress(state, s)}</span>}
              </span>
              {rewardText(s) && <span className="task-reward num">{rewardText(s)}</span>}
            </li>
          ))}
        </ol>
      ) : (
        "hint" in note && <p className="note-hint">{note.hint}</p>
      )}
      {goal?.kind === "place" && <p className="muted">Make these, in any order, then place the part in the Circle.{reward ? ` Reward: ${reward}.` : ""}</p>}
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
          {placeLabel(go)}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={onClose}>
          Continue
        </button>
      )}
      <Story lines={[note.text]} />
    </Modal>
  );
}
