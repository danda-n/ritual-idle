import type { SkillId } from "../../content/skills";
import { TALENT_LEVELS, TALENT_RELOCK, TALENTS, type Side, type TalentLevel } from "../../content/talents";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { canChoose, choiceAt, unlocksAt } from "../../engine/talents";
import { SkillIcon } from "../art/icons";
import { Tip } from "./Tip";
import { talentText } from "../effects";

/**
 * A skill's talents as an embroidered vine: the skill at the root, and at each talent level a pair
 * of leaves, one on each side. Only the pairs reached so far show, plus the next one (locked).
 * A taken leaf fills with the skill's colour and the other dims; a pick is fixed until the next
 * tier, when the other side can be taken instead.
 */
export function TalentTree({ state, skill, onChoose }: { state: GameState; skill: SkillId; onChoose: (level: TalentLevel, side: Side) => void }) {
  const level = skillLevel(state, skill);
  const next = TALENT_LEVELS.find((l) => l > level);
  const shown = TALENT_LEVELS.filter((l) => l <= level || l === next);
  return (
    <div className="talent-vine" data-skill={skill} role="group" aria-label="Talents">
      {shown.map((at) => {
        const reached = level >= at;
        const chosen = choiceAt(state, skill, at);
        const changeable = canChoose(state, skill, at) === null;
        const lockedUntil = unlocksAt(state, skill, at);
        const state_ = !reached ? "is-locked" : chosen ? "is-chosen" : "is-waiting";
        return (
          <div key={at} className={`vine-pair ${state_}`}>
            {(["a", "b"] as const).map((side) => {
              const t = TALENTS[skill][at][side];
              const taken = chosen === side;
              const other = chosen !== undefined && !taken;
              const title = !reached
                ? `Opens at level ${at}`
                : taken
                  ? lockedUntil !== null
                    ? `Taken · fixed until level ${lockedUntil}`
                    : "Taken"
                  : lockedUntil !== null
                    ? `Change at level ${lockedUntil}`
                    : other
                      ? "Take this one instead"
                      : `Take this one · fixed until level ${at + TALENT_RELOCK}`;
              return (
                <Tip key={side} content={{ title: t.name, note: t.flavour ? `${title} · ${t.flavour}` : title }}>
                <button
                  type="button"
                  className={`vine-leaf vine-leaf-${side} ${taken ? "is-taken" : ""} ${other ? "is-other" : ""}`}
                  disabled={!taken && !changeable}
                  aria-pressed={taken}
                  onClick={() => !taken && changeable && onChoose(at, side)}
                >
                  <span className="vine-leaf-name">{t.name}</span>
                  <span className="vine-leaf-text">{talentText(t, skill)}</span>
                </button>
                </Tip>
              );
            })}
            <span className="vine-node num" aria-hidden="true">
              {at}
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
