import { SKILLS, type SkillId } from "../../content/skills";
import { BRANCHES, BRANCH_IDS, branchText, KEYSTONE_NEEDS, KEYSTONES, POINT_EVERY } from "../../content/talents";
import { resetTalents, spendTalent, type Result } from "../../engine/commands";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { canSpend, pointsFree, pointsSpent, rankOf, talentPoints, talentsOf } from "../../engine/talents";

type Act = (c: (s: GameState) => Result) => unknown;

/**
 * A skill's talents: three branches (Swift, Plenty, Fortune) of 3 ranks each, and the skill's own
 * keystone after 3 points in one branch. A point arrives every 3 levels; resetting is free.
 */
export function TalentPanel({ state, skill, act }: { state: GameState; skill: SkillId; act: Act }) {
  const points = talentPoints(state, skill);
  const free = pointsFree(state, skill);
  const level = skillLevel(state, skill);
  const nextAt = (Math.floor(level / POINT_EVERY) + 1) * POINT_EVERY;
  const keystone = KEYSTONES[skill];
  const t = talentsOf(state, skill);
  const keyBlock = canSpend(state, skill, null);

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
        <p className="muted talent-intro">A talent point every {POINT_EVERY} levels. Spend it on tending, speed, more output or lucky doubles. Reset any time for free.</p>
      ) : (
        <>
          <div className="branches">
            {BRANCH_IDS.map((b) => {
              const rank = rankOf(state, skill, b);
              const max = BRANCHES[b].maxRank;
              const block = canSpend(state, skill, b);
              return (
                <div key={b} className={`branch ${rank > 0 ? "is-taken" : ""}`}>
                  <div className="branch-head">
                    <strong>{BRANCHES[b].name}</strong>
                    <span className="pips" aria-label={`Rank ${rank} of ${max}`}>
                      {Array.from({ length: max }, (_, i) => (
                        <span key={i} className={`pip ${i < rank ? "on" : ""}`} />
                      ))}
                    </span>
                  </div>
                  <p className="branch-effect">{rank > 0 ? branchText(b, rank) : <span className="muted">{branchText(b, 1)} per rank</span>}</p>
                  {rank < max && (
                    <button className="btn btn-ghost talent-add" disabled={block !== null} title={block ?? undefined} onClick={() => act((s) => spendTalent(s, skill, b))}>
                      +1 rank
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className={`keystone ${t.keystone ? "is-taken" : ""} ${keyBlock === null ? "is-open" : ""}`}>
            <span className="keystone-mark" aria-hidden="true">
              ✦
            </span>
            <div>
              <strong>{keystone.name}</strong> <span className="branch-effect">{keystone.text}</span>
              {!t.keystone && <p className="muted keystone-need">Needs {KEYSTONE_NEEDS} points in one branch.</p>}
            </div>
            {!t.keystone && (
              <button className="btn btn-ghost talent-add" disabled={keyBlock !== null} title={keyBlock ?? undefined} onClick={() => act((s) => spendTalent(s, skill, null))}>
                Take
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
