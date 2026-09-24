import { goalProgress } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { STEPS, taskName } from "../tasks";
import { Bar } from "./Bar";

/** The chapter as a checklist: done steps, the current task with its progress, and one "???" ahead. */
export function ChapterTracker({ state }: { state: GameState }) {
  const current = STEPS.findIndex((s) => s.index === state.notesRevealed - 1);
  const done = state.rite.completed ? STEPS.length : current < 0 ? STEPS.length : current;
  return (
    <section className="panel paper tracker" aria-labelledby="tracker-heading">
      <div className="panel-title">
        <CircleRiteIcon size={18} />
        <h2 id="tracker-heading">Chapter I · Hearth</h2>
        <span className="panel-aside num">
          {done}/{STEPS.length}
        </span>
      </div>
      <Bar value={done / STEPS.length} label="Chapter progress" />
      <ol className="steps">
        {STEPS.map((s, i) => {
          if (!("goal" in s.note)) return null;
          if (i < done) {
            return (
              <li key={i} className="step done">
                <span className="step-mark" aria-hidden="true">✓</span>
                {taskName(s.note.goal)}
              </li>
            );
          }
          if (i === done && !state.rite.completed) {
            const p = goalProgress(state, s.note);
            return (
              <li key={i} className="step current">
                <span className="step-mark" aria-hidden="true">▶</span>
                <div className="step-body">
                  <div className="step-head">
                    <strong>{taskName(s.note.goal)}</strong>
                    {p && p.target > 1 && (
                      <span className="num">
                        {p.done}/{p.target}
                      </span>
                    )}
                  </div>
                  {p && p.target > 1 && <Bar thin value={p.done / p.target} label="Task progress" />}
                  {"hint" in s.note && <p className="step-hint">{s.note.hint}</p>}
                </div>
              </li>
            );
          }
          if (i === done + 1) {
            return (
              <li key={i} className="step hidden">
                <span className="step-mark" aria-hidden="true">◇</span>
                ???
              </li>
            );
          }
          return null;
        })}
      </ol>
      {state.rite.completed && <p className="step-hint">Chapter complete. Janko has joined you. Chapter II comes in a later build.</p>}
    </section>
  );
}
