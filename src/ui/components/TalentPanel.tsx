import { SKILLS, type SkillId } from "../../content/skills";
import { POINT_EVERY } from "../../content/talents";
import { resetTalents, spendTalent, type Result } from "../../engine/commands";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { pointsFree, pointsSpent, talentPoints } from "../../engine/talents";
import { TalentTree } from "./TalentTree";

type Act = (c: (s: GameState) => Result) => unknown;

/**
 * A skill's talents: the tree of life (four branches of 3 ranks, the keystone blooming free when a
 * branch is full). A point arrives every 3 levels; resetting is free. Before the first point it's
 * one quiet line.
 */
export function TalentPanel({ state, skill, act }: { state: GameState; skill: SkillId; act: Act }) {
  const points = talentPoints(state, skill);
  const free = pointsFree(state, skill);
  const level = skillLevel(state, skill);
  const nextAt = (Math.floor(level / POINT_EVERY) + 1) * POINT_EVERY;

  return (
    <section className={`panel talents ${free > 0 ? "has-points" : ""}`} data-skill={skill} aria-labelledby="talents-heading">
      <div className="panel-title">
        <h2 id="talents-heading">{SKILLS[skill].name} talents</h2>
        <span className="panel-aside num">
          {free > 0 ? (
            <strong className="talent-free">
              {free} {free === 1 ? "point" : "points"} to spend
            </strong>
          ) : (
            <span className="muted">{nextAt <= state.levelCap ? `Next point at level ${nextAt}` : "All points earned for now"}</span>
          )}
          {pointsSpent(state, skill) > 0 && (
            <button className="btn btn-ghost talent-reset" onClick={() => act((s) => resetTalents(s, skill))} title="Free: every point comes back">
              Reset
            </button>
          )}
        </span>
      </div>
      {points === 0 ? (
        <p className="muted talent-intro">A talent point every {POINT_EVERY} levels, for tending, speed, more output or lucky doubles. Fill a branch and the keystone blooms free. Reset any time.</p>
      ) : (
        <TalentTree state={state} skill={skill} onTake={(b) => act((s) => spendTalent(s, skill, b))} />
      )}
    </section>
  );
}
