import type { SkillId } from "../../content/skills";
import { TALENT_LEVELS, TALENTS, type Side, type TalentLevel } from "../../content/talents";
import type { GameState } from "../../engine/state";
import { canChoose, choiceAt } from "../../engine/talents";
import { SkillIcon } from "../art/icons";

/**
 * A skill's talents as an embroidered vine: the skill at the root, and at each talent level a pair
 * of leaves, one on each side. Take one and it fills with the skill's colour while the other dims;
 * click the dimmed one to switch (free). Pairs not reached yet stay stitched outlines.
 */
export function TalentTree({ state, skill, onChoose }: { state: GameState; skill: SkillId; onChoose: (level: TalentLevel, side: Side) => void }) {
  return (
    <div className="talent-vine" data-skill={skill} role="group" aria-label="Talents">
      {TALENT_LEVELS.map((level) => {
        const open = canChoose(state, skill, level) === null;
        const chosen = choiceAt(state, skill, level);
        const state_ = !open ? "is-locked" : chosen ? "is-chosen" : "is-waiting";
        return (
          <div key={level} className={`vine-pair ${state_}`}>
            {(["a", "b"] as const).map((side) => {
              const t = TALENTS[skill][level][side];
              const taken = chosen === side;
              const other = chosen !== undefined && !taken;
              return (
                <button
                  key={side}
                  type="button"
                  className={`vine-leaf vine-leaf-${side} ${taken ? "is-taken" : ""} ${other ? "is-other" : ""}`}
                  disabled={!open}
                  aria-pressed={taken}
                  onClick={() => !taken && onChoose(level, side)}
                  title={!open ? `Opens at level ${level}` : taken ? "Taken" : other ? "Switch to this one (free)" : "Take this one"}
                >
                  <span className="vine-leaf-name">{t.name}</span>
                  <span className="vine-leaf-text">{t.text}</span>
                </button>
              );
            })}
            <span className="vine-node num" aria-hidden="true">
              {level}
            </span>
          </div>
        );
      })}
      <span className="vine-root" aria-hidden="true">
        <SkillIcon skill={skill} size={22} />
      </span>
    </div>
  );
}
