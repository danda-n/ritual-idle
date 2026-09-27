import { useEffect, useRef, useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { HEARTH_RITE, type PartId } from "../../content/rite";
import type { ItemId } from "../../content/items";
import { SKILL_IDS, SKILLS } from "../../content/skills";
import { goalProgress } from "../../engine/progress";
import { atCap, canPlace, chooseKeepsakes, claimReward, placePart, type Result } from "../../engine/commands";
import { stepById } from "../../engine/progress";
import type { SkillId } from "../../content/skills";
import { shortfall } from "../../engine/estimates";
import { itemName } from "../format";
import { SkillPicker } from "./SkillPicker";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { chapterSteps, itemPlace, placeLabel, rewardText, stageInfo, stepPlace, stepsOf, taskName, taskPlace, type Place } from "../tasks";
import { isSkillUnlocked, stageChoices } from "../../engine/progress";
import { PART_DEFS as PARTS, type PartId as Part } from "../../content/rite";
import { SkillIcon } from "../art/icons";
import { chooseStage } from "../../engine/commands";
import { Bar } from "./Bar";
import { ItemChip } from "./ItemLookup";
import { KeepsakePick, useKeepsakeChoice } from "./KeepsakePick";
import { Modal } from "./Modal";
import { UPGRADES } from "../../content/upgrades";
import { omenShelfSuggested, projectsReady } from "../../engine/projects";
import { followerEffects } from "../effects";

/**
 * The chapter as a checklist: done steps, the current task with what it needs (as chips,
 * so a short one offers to start what makes it) and a button that names where it goes, and one
 * "???" ahead.
 */
export function ChapterTracker({ state, onGo, act }: { state: GameState; onGo: (p: Place) => void; act: (c: (s: GameState) => Result) => unknown }) {
  const STEPS = chapterSteps(state);
  const choices = stageChoices(state);
  const current = STEPS.findIndex((s) => s.index === state.notesRevealed - 1);
  // While a choice is waiting, the finished stage counts as done.
  const done = state.rite.completed ? STEPS.length : current < 0 ? STEPS.length : current + (choices.length > 0 ? 1 : 0);
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
    <section className={`panel tracker ${advanced ? "advanced" : ""}`} aria-labelledby="tracker-heading">
      <div className="panel-title">
        <CircleRiteIcon size={18} />
        <h2 id="tracker-heading">Chapter I · Hearth</h2>
        <span className="panel-aside num">
          {done}/{STEPS.length}
        </span>
      </div>
      {/* The chapter's stages, counted as cross-stitches */}
      <div className="stitch-row" role="img" aria-label={`${done} of ${STEPS.length} stages done`}>
        {STEPS.map((_, i) => (
          <span key={i} className={`stitch ${i < done ? "is-done" : i === done ? "is-current" : "is-ahead"}`} />
        ))}
      </div>
      <RewardsWaiting state={state} act={act} />
      <KeepsakesWaiting state={state} act={act} />
      {choices.length > 0 && <StageChoice state={state} choices={choices} act={act} />}
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
          // While a choice waits, the next stage is whatever you pick: show nothing for it yet.
          if (choices.length > 0 && i >= done) return null;
          if (i === done && !state.rite.completed) {
            const p = goalProgress(state, s.note);
            const action = goal.kind === "complete" ? ACTION_DEFS[goal.action] : null;
            const needLevel =
              action && skillLevel(state, action.skill) < action.level
                ? { skill: action.skill, level: action.level }
                : goal.kind === "rite" && skillLevel(state, "ritualism") < HEARTH_RITE.skills.ritualism!
                  ? { skill: "ritualism" as const, level: HEARTH_RITE.skills.ritualism! }
                  : null;
            const { steps, current: now } = stepsOf(state, s.note);
            const reward = steps.map(rewardText).find(Boolean);
            const place = now ? stepPlace(now, state) : taskPlace(goal);
            return (
              <li key={i} className="step current">
                <span className="step-mark" aria-hidden="true">▶</span>
                <div className="step-body">
                  <div className="step-head">
                    <strong>{taskName(goal)}</strong>
                    {p && p.target > 1 && goal.kind !== "place" && (
                      <span className="num">
                        {p.done}/{p.target}
                      </span>
                    )}
                  </div>
                  {goal.kind === "place" ? (
                    <PartChecklist state={state} part={goal.part as PartId} onGo={onGo} />
                  ) : (
                    <>
                      {p && p.target > 1 && <Bar thin value={p.done / p.target} label="Task progress" />}
                      {needLevel && (
                        <div className="step-needs">
                          <span className="chip short">
                            {SKILLS[needLevel.skill].name} {needLevel.level}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {reward && <p className="step-reward">Reward: <span className="task-reward num">{reward}</span></p>}
                  {steps.length === 0 && "hint" in s.note && <p className="step-hint">{s.note.hint as string}</p>}
                  {goal.kind === "place" && canPlace(state, goal.part as PartId) === null ? (
                    <button className="btn btn-primary step-go" onClick={() => act((st) => placePart(st, goal.part as PartId))}>
                      Place in the Circle
                    </button>
                  ) : (
                    goal.kind !== "place" && (
                      <button className="btn btn-ghost step-go" onClick={() => onGo(place)}>
                        {placeLabel(place)}
                      </button>
                    )
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
      {omenShelfSuggested(state) && (
        // Optional side work, pointed out quietly under the chapter's own steps.
        <div className="side-project">
          <div className="step-head">
            <span className="muted">Side project</span>
            <strong>Omen shelf</strong>
          </div>
          <div className="step-needs">
            {(Object.entries(UPGRADES.omen_shelf.items) as [ItemId, number][]).map(([item, qty]) => (
              <ItemChip key={item} item={item} need={qty} />
            ))}
          </div>
          <button className="btn btn-ghost step-go" onClick={() => onGo({ tab: "house", anchor: "projects" })}>
            {projectsReady(state).includes("omen_shelf") ? "Build it" : "Projects ›"}
          </button>
        </div>
      )}
      {state.rite.completed && (
        // The chapter's done: a small card, then on to Chapter II (nothing to grind here).
        <div className="chapter-done">
          <strong>Chapter I complete</strong>
          <p className="step-hint">
            Janko joined ({followerEffects("janko")[0]}) · skill caps rise to {HEARTH_RITE.rewards.levelCap}
          </p>
          <p className="step-hint">Chapter II · Grave comes in a later build.</p>
        </div>
      )}
    </section>
  );
}

/**
 * A part's checklist: each item with have/need and a button to the skill that makes it, then one
 * line of what's still short further down (talents applied), and any level a recipe still needs.
 * Order is free: make them however you like.
 */
function PartChecklist({ state, part, onGo }: { state: GameState; part: PartId; onGo: (p: Place) => void }) {
  const sf = shortfall(state, part);
  return (
    <div className="part-checklist">
      <ul className="checklist">
        {sf.items.map((it) => {
          const done = it.have >= it.need;
          const where = itemPlace(state, it.item);
          return (
            <li key={it.item} className={done ? "is-done" : ""} data-skill={it.maker ? ACTION_DEFS[it.maker].skill : undefined}>
              <span className="check-mark" aria-hidden="true">
                {done ? "✓" : ""}
              </span>
              <ItemChip item={it.item} plain />
              <span className="num check-count">
                {Math.min(it.have, it.need)}/{it.need}
              </span>
              {!done && (
                <button className="btn btn-text btn-sm" onClick={() => onGo(where)} title={it.maker ? `Made with ${ACTION_DEFS[it.maker].name.toLowerCase()}` : "Bought at the Village, with coin from contracts"}>
                  {placeLabel(where)}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {sf.short.length > 0 && (
        <p className="short-line">
          <span className="label">Short of</span>{" "}
          {sf.short
            .slice()
            .sort((a, b) => b.depth - a.depth)
            .map((l) => `${l.qty} ${itemName(l.item).toLowerCase()}`)
            .join(" · ")}
        </p>
      )}
      {sf.levels.length > 0 && (
        <div className="step-needs">
          {sf.levels.map((l) => (
            <span key={l.for} className="chip short" title={`${ACTION_DEFS[l.for].name} opens at ${SKILLS[l.skill].name} level ${l.level}`}>
              {SKILLS[l.skill].name} {l.level} for {ACTION_DEFS[l.for].name.toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Keepsakes still to choose after the rite (if the chapter-end card was closed first). */
function KeepsakesWaiting({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [open, setOpen] = useState(false);
  const { left, chosen, toggle } = useKeepsakeChoice(state);
  if (left === 0 || !state.rite.completed?.endingSeen) return null;
  return (
    <div className="rewards-waiting">
      <button className="btn btn-primary claim-btn" onClick={() => setOpen(true)}>
        Choose {left === 1 ? "a keepsake" : "two keepsakes"}
      </button>
      {open && (
        <Modal title="Keepsakes" onClose={() => setOpen(false)}>
          <KeepsakePick state={state} chosen={chosen} onToggle={toggle} later={false} />
          <div className="row">
            <button
              className="btn btn-primary"
              disabled={chosen.length === 0}
              onClick={() => {
                act((s) => chooseKeepsakes(s, chosen));
                setOpen(false);
              }}
            >
              Keep {chosen.length > 1 ? "them" : "it"}
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Later
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Done steps whose rewards wait: one gold Claim button each. An XP choice asks which skill. */
function RewardsWaiting({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [choosing, setChoosing] = useState<string | null>(null);
  if (state.rewardsWaiting.length === 0) return null;
  const pending = choosing ? stepById(choosing) : undefined;
  const choice = pending?.reward && "xpChoice" in pending.reward ? pending.reward.xpChoice : null;
  const allCapped = SKILL_IDS.filter((k) => isSkillUnlocked(state, k)).every((k) => atCap(state, k));
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
          // XP past the cap is lost: capped skills can't take it (unless every skill is capped).
          isDisabled={(skill) => (atCap(state, skill) && !allCapped ? "At the cap" : null)}
        />
      )}
    </div>
  );
}

/** The free choice after the Light: which part to make next. Each brings its own skill. */
function StageChoice({ state, choices, act }: { state: GameState; choices: Part[]; act: (c: (s: GameState) => Result) => unknown }) {
  return (
    <div className="stage-choice" role="group" aria-label="Choose what to make next">
      <p className="stage-choice-title">{state.middleOrder.length === 0 ? "Choose the next part (any order; you'll make all three)" : "Choose the next part"}</p>
      {choices.map((p) => {
        const info = stageInfo(p);
        return (
          <button key={p} data-skill={info.skill} className="skill-pick stage-pick" onClick={() => act((s) => chooseStage(s, p))}>
            <SkillIcon skill={info.skill} size={20} />
            <span className="skill-pick-name">
              {PARTS[p].name} <span className="muted">· brings {SKILLS[info.skill].name}</span>
            </span>
            <span className="stage-pick-blurb">{info.blurb}</span>
            <span className="stage-pick-meta num">
              {info.items.map(([item, qty]) => `${qty} ${itemName(item).toLowerCase()}`).join(" · ")}
              {info.uses.length > 0 && ` · uses ${info.uses.join(", ")}`}
              {info.opens.length > 0 && ` · opens ${info.opens.join(", ")}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
