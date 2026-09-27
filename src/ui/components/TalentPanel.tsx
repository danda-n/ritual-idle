import { SKILLS, type SkillId } from "../../content/skills";
import { TALENT_LEVELS } from "../../content/talents";
import { chooseTalent, resetTalents, type Result } from "../../engine/commands";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { choicesWaiting, talentsOf } from "../../engine/talents";
import { TalentTree } from "./TalentTree";

type Act = (c: (s: GameState) => Result) => unknown;

/**
 * A skill's talents: at levels 3, 6, 9 and 12 a pair to choose between, shown as a vine.
 * Switching sides is free, any time.
 */
export function TalentPanel({ state, skill, act }: { state: GameState; skill: SkillId; act: Act }) {
  const waiting = choicesWaiting(state, skill).length;
  const level = skillLevel(state, skill);
  const next = TALENT_LEVELS.find((l) => l > level);
  const any = Object.keys(talentsOf(state, skill)).length > 0;

  return (
    <section className={`panel talents ${waiting > 0 ? "has-points" : ""}`} data-skill={skill} aria-labelledby="talents-heading">
      <div className="panel-title">
        <h2 id="talents-heading">{SKILLS[skill].name} talents</h2>
        <span className="panel-aside num">
          {waiting > 0 ? (
            <strong className="talent-free">{waiting === 1 ? "A talent to choose" : `${waiting} talents to choose`}</strong>
          ) : (
            <span className="muted">{next && next <= state.levelCap ? `Next choice at level ${next}` : "Every choice made for now"}</span>
          )}
          {any && (
            <button className="btn btn-ghost talent-reset" onClick={() => act((s) => resetTalents(s, skill))} title="Free: clear every choice and pick again">
              Reset
            </button>
          )}
        </span>
      </div>
      <p className="muted talent-intro">One per pair · switch free</p>
      <TalentTree state={state} skill={skill} onChoose={(l, side) => act((s) => chooseTalent(s, skill, l, side))} />
    </section>
  );
}
