import { useEffect, useState } from "react";
import { SKILLS, type SkillId } from "../../content/skills";
import { TALENT_LEVELS, TALENT_RELOCK, TALENTS, type Side, type TalentLevel } from "../../content/talents";
import { chooseTalent, type Result } from "../../engine/commands";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { choicesWaiting, takenTalents } from "../../engine/talents";
import { Modal } from "./Modal";
import { TalentTree } from "./TalentTree";

type Act = (c: (s: GameState) => Result) => unknown;

/**
 * A skill's talents: at levels 3, 6, 9 and 12 a pair to choose between, shown as a vine.
 * Folded to one line while nothing waits; open when a choice does. Taking a talent asks first,
 * because a pick is fixed until the next tier.
 */
export function TalentPanel({ state, skill, act }: { state: GameState; skill: SkillId; act: Act }) {
  const waiting = choicesWaiting(state, skill).length;
  const level = skillLevel(state, skill);
  const next = TALENT_LEVELS.find((l) => l > level);
  const taken = takenTalents(state, skill);
  const [open, setOpen] = useState(waiting > 0);
  const [confirm, setConfirm] = useState<{ at: TalentLevel; side: Side } | null>(null);
  // A new choice opens the panel; switching skills starts from whatever that skill needs.
  useEffect(() => setOpen(waiting > 0), [waiting, skill]);

  const summary = taken.map((t) => t.name).join(" · ");
  const pick = confirm ? TALENTS[skill][confirm.at][confirm.side] : null;

  return (
    <details className={`panel talents ${waiting > 0 ? "has-points" : ""}`} data-skill={skill} open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="panel-title talents-summary">
        <h2 id="talents-heading">{SKILLS[skill].name} talents</h2>
        {!open && summary && <span className="talents-picks">{summary}</span>}
        <span className="panel-aside num">
          {waiting > 0 ? (
            <strong className="talent-free">{waiting === 1 ? "A talent to choose" : `${waiting} talents to choose`}</strong>
          ) : next && next <= state.levelCap ? (
            `Next choice at level ${next}`
          ) : (
            "Every choice made for now"
          )}
        </span>
      </summary>
      <p className="muted talent-intro">One per pair · fixed until the next tier ({TALENT_RELOCK} levels), then you can change it</p>
      <TalentTree state={state} skill={skill} onChoose={(at, side) => setConfirm({ at, side })} />
      {confirm && pick && (
        <Modal title={`Take ${pick.name}?`} onClose={() => setConfirm(null)}>
          <p>{pick.text}</p>
          <p className="muted">
            {level < confirm.at + TALENT_RELOCK ? `Fixed until level ${confirm.at + TALENT_RELOCK}, then you can change it.` : "You're past the next tier, so you can change it again any time."}
          </p>
          <div className="row">
            <button
              className="btn btn-primary"
              onClick={() => {
                act((s) => chooseTalent(s, skill, confirm.at, confirm.side));
                setConfirm(null);
              }}
            >
              Take it
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </details>
  );
}
