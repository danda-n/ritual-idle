import { useEffect, useRef, useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import type { ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import { goalProgress } from "../../engine/progress";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { STEPS, taskName, taskPlace, type Place } from "../tasks";
import { Bar } from "./Bar";
import { ItemChip } from "./ItemLookup";

/**
 * The chapter as a checklist: done steps, the current task with what it needs (as chips,
 * so a short one offers to start what makes it) and a Go button, and one "???" ahead.
 */
export function ChapterTracker({ state, onGo }: { state: GameState; onGo: (p: Place) => void }) {
  const current = STEPS.findIndex((s) => s.index === state.notesRevealed - 1);
  const done = state.rite.completed ? STEPS.length : current < 0 ? STEPS.length : current;
  // A step just finished: draw its tick and surge the bar.
  const prev = useRef(done);
  const [advanced, setAdvanced] = useState(false);
  useEffect(() => {
    if (done > prev.current) {
      setAdvanced(true);
      const t = setTimeout(() => setAdvanced(false), 1400);
      prev.current = done;
      return () => clearTimeout(t);
    }
    prev.current = done;
  }, [done]);
  return (
    <section className={`panel paper tracker ${advanced ? "advanced" : ""}`} aria-labelledby="tracker-heading">
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
          const goal = s.note.goal;
          if (i < done) {
            return (
              <li key={i} className={`step done ${advanced && i === done - 1 ? "just-done" : ""}`}>
                <span className="step-mark" aria-hidden="true">✓</span>
                {taskName(goal)}
              </li>
            );
          }
          if (i === done && !state.rite.completed) {
            const p = goalProgress(state, s.note);
            const action = goal.kind === "complete" ? ACTION_DEFS[goal.action] : null;
            const inputs = action ? (Object.entries(action.inputs) as [ItemId, number][]) : [];
            const lowLevel = action && skillLevel(state, action.skill) < action.level;
            return (
              <li key={i} className="step current">
                <span className="step-mark" aria-hidden="true">▶</span>
                <div className="step-body">
                  <div className="step-head">
                    <strong>{taskName(goal)}</strong>
                    {p && p.target > 1 && (
                      <span className="num">
                        {p.done}/{p.target}
                      </span>
                    )}
                  </div>
                  {p && p.target > 1 && <Bar thin value={p.done / p.target} label="Task progress" />}
                  {(inputs.length > 0 || lowLevel) && (
                    <div className="step-needs">
                      {lowLevel && action && (
                        <span className="chip short">
                          {SKILLS[action.skill].name} {action.level}
                        </span>
                      )}
                      {inputs.map(([item, qty]) => (
                        <ItemChip key={item} item={item} need={qty} />
                      ))}
                    </div>
                  )}
                  {"hint" in s.note && <p className="step-hint">{s.note.hint}</p>}
                  <button className="btn btn-ghost step-go" onClick={() => onGo(taskPlace(goal))}>
                    Go
                  </button>
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
      {state.rite.completed && <p className="step-hint">Chapter complete. Janko has joined you.</p>}
    </section>
  );
}
