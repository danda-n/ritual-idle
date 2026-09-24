import { useEffect, useRef, useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { HEARTH_RITE, PART_DEFS, type PartId } from "../../content/rite";
import type { ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import { goalProgress } from "../../engine/progress";
import { canPlace, claimReward, placePart, type Result } from "../../engine/commands";
import { stepById } from "../../engine/progress";
import type { SkillId } from "../../content/skills";
import { SkillPicker } from "./SkillPicker";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { rewardText, stepPlace, stepsOf, STEPS, taskName, taskPlace, type Place } from "../tasks";
import { Bar } from "./Bar";
import { ItemChip } from "./ItemLookup";

/**
 * The chapter as a checklist: done steps, the current task with what it needs (as chips,
 * so a short one offers to start what makes it) and a Go button, and one "???" ahead.
 */
export function ChapterTracker({ state, onGo, act }: { state: GameState; onGo: (p: Place) => void; act: (c: (s: GameState) => Result) => unknown }) {
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
      <RewardsWaiting state={state} act={act} />
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
            // A part lists its items; an action its inputs. Chips show have/need.
            const inputs = (goal.kind === "place" ? Object.entries(PART_DEFS[goal.part as PartId].items) : action ? Object.entries(action.inputs) : []) as [ItemId, number][];
            const needLevel =
              action && skillLevel(state, action.skill) < action.level
                ? { skill: action.skill, level: action.level }
                : goal.kind === "rite" && skillLevel(state, "ritualism") < HEARTH_RITE.skills.ritualism!
                  ? { skill: "ritualism" as const, level: HEARTH_RITE.skills.ritualism! }
                  : null;
            const { steps, done: stepDone, current: now } = stepsOf(state, s.note);
            const doneCount = steps.filter(stepDone).length;
            return (
              <li key={i} className="step current">
                <span className="step-mark" aria-hidden="true">▶</span>
                <div className="step-body">
                  <div className="step-head">
                    <strong>{taskName(goal)}</strong>
                    {steps.length > 0 ? (
                      <span className="num muted">
                        step {Math.min(doneCount + 1, steps.length)} of {steps.length}
                      </span>
                    ) : (
                      p &&
                      p.target > 1 && (
                        <span className="num">
                          {p.done}/{p.target}
                        </span>
                      )
                    )}
                  </div>
                  {steps.length > 0 ? <Bar thin value={doneCount / steps.length} label="Steps done" /> : p && p.target > 1 && <Bar thin value={p.done / p.target} label="Task progress" />}
                  {now && (
                    <div className="step-now">
                      <span>{now.label}</span>
                      {rewardText(now) && <span className="task-reward num">{rewardText(now)}</span>}
                    </div>
                  )}
                  {(inputs.length > 0 || needLevel) && (
                    <div className="step-needs">
                      {needLevel && (
                        <span className="chip short">
                          {SKILLS[needLevel.skill].name} {needLevel.level}
                        </span>
                      )}
                      {inputs.map(([item, qty]) => (
                        <ItemChip key={item} item={item} need={qty} />
                      ))}
                    </div>
                  )}
                  {steps.length === 0 && "hint" in s.note && <p className="step-hint">{s.note.hint}</p>}
                  {goal.kind === "place" && canPlace(state, goal.part as PartId) === null ? (
                    <button className="btn btn-primary step-go" onClick={() => act((st) => placePart(st, goal.part as PartId))}>
                      Place in the Circle
                    </button>
                  ) : (
                    <button className="btn btn-ghost step-go" onClick={() => onGo(now ? stepPlace(now, state) : taskPlace(goal))}>
                      Go
                    </button>
                  )}
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

/** Done steps whose rewards wait: one gold Claim button each. An XP choice asks which skill. */
function RewardsWaiting({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [choosing, setChoosing] = useState<string | null>(null);
  if (state.rewardsWaiting.length === 0) return null;
  const pending = choosing ? stepById(choosing) : undefined;
  const choice = pending?.reward && "xpChoice" in pending.reward ? pending.reward.xpChoice : null;
  return (
    <div className="rewards-waiting" aria-label="Rewards to claim">
      {state.rewardsWaiting.map((id) => {
        const step = stepById(id);
        if (!step?.reward) return null;
        const r = step.reward;
        return (
          <button key={id} className="btn btn-primary claim-btn" onClick={() => ("xpChoice" in r ? setChoosing(id) : act((s) => claimReward(s, id)))}>
            Claim · {rewardText(step)}
          </button>
        );
      })}
      {choosing && choice && (
        <SkillPicker
          state={state}
          title={`Put ${choice.amount} XP into…`}
          effect={`+${choice.amount} XP to the skill you choose`}
          suggest={choice.suggest as SkillId}
          onPick={(skill) => act((s) => claimReward(s, choosing, skill))}
          onClose={() => setChoosing(null)}
        />
      )}
    </div>
  );
}
