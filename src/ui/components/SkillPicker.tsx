import { ACTION_DEFS } from "../../content/actions";
import { SKILL_IDS, SKILLS, type SkillId } from "../../content/skills";
import { isSkillUnlocked } from "../../engine/progress";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { Modal } from "./Modal";

/**
 * Choose a skill: for blessing it with an omen, or for putting a reward's XP into it.
 * Big tiles, one per open skill, with its level; the running one says "now", and a suggested one
 * says why. `children` sits above the tiles (e.g. what's already active).
 */
export function SkillPicker({
  state,
  title,
  effect,
  suggest,
  suggestLabel = "helps your next step",
  onPick,
  onClose,
  children,
}: {
  state: GameState;
  title: string;
  effect: string;
  suggest?: SkillId;
  suggestLabel?: string;
  onPick: (skill: SkillId) => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const running = state.active ? ACTION_DEFS[state.active.id].skill : null;
  const open = SKILL_IDS.filter((id) => isSkillUnlocked(state, id));
  return (
    <Modal title={title} onClose={onClose}>
      <p className="picker-effect">{effect}</p>
      {children}
      <div className="skill-picker" role="group" aria-label={title}>
        {open.map((skill) => (
          <button
            key={skill}
            data-skill={skill}
            className={`skill-pick ${skill === suggest ? "is-suggested" : ""}`}
            onClick={() => {
              onPick(skill);
              onClose();
            }}
          >
            <SkillIcon skill={skill} size={22} />
            <span className="skill-pick-name">{SKILLS[skill].name}</span>
            <span className="skill-pick-level num">Level {skillLevel(state, skill)}</span>
            {(skill === running || skill === suggest) && <span className="skill-pick-tag">{skill === suggest ? suggestLabel : "working on it now"}</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}
