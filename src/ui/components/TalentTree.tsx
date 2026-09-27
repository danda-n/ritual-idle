import { useState } from "react";
import type { SkillId } from "../../content/skills";
import { nextTalentLevel, TALENT_LEVELS, TALENTS, type Side, type TalentLevel } from "../../content/talents";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { canChoose, choiceAt, unlocksAt } from "../../engine/talents";
import { talentText } from "../effects";
import { Tip } from "./Tip";

/**
 * A skill's talents, kept small at any level: a pair waiting for a choice shows as two leaves side
 * by side; picks already made fold into one line each (level · name · what it does), with "Change"
 * once the next talent level allows it (it opens the pair again); the next pair within the level
 * cap is one quiet line. Pairs further up stay out of sight.
 */
export function TalentTree({ state, skill, onChoose }: { state: GameState; skill: SkillId; onChoose: (level: TalentLevel, side: Side) => void }) {
  const level = skillLevel(state, skill);
  const [changing, setChanging] = useState<TalentLevel | null>(null);
  const reached = TALENT_LEVELS.filter((l) => l <= level);
  const waiting = reached.filter((l) => !choiceAt(state, skill, l));
  const chosen = reached.filter((l) => choiceAt(state, skill, l));
  const next = TALENT_LEVELS.find((l) => l > level && l <= state.levelCap);

  return (
    <div className="talent-list" data-skill={skill} role="group" aria-label="Talents">
      {waiting.map((at) => (
        <Pair key={at} state={state} skill={skill} at={at} onChoose={onChoose} />
      ))}
      {chosen.length > 0 && (
        <ul className="talent-rows">
          {chosen.map((at) => {
            const side = choiceAt(state, skill, at)!;
            const t = TALENTS[skill][at][side];
            const lockedUntil = unlocksAt(state, skill, at);
            const open = changing === at;
            return (
              <li key={at} className={`talent-row ${open ? "is-open" : ""}`}>
                <span className="talent-row-level num">{at}</span>
                <Tip content={t.flavour ? { title: t.name, note: t.flavour } : null}>
                  <span className="talent-row-name" tabIndex={t.flavour ? 0 : undefined}>
                    {t.name}
                  </span>
                </Tip>
                <span className="talent-row-text">{talentText(t, skill)}</span>
                {lockedUntil !== null ? (
                  <span className="talent-row-lock muted num">fixed until {lockedUntil}</span>
                ) : (
                  <button className="btn btn-text btn-sm" onClick={() => setChanging(open ? null : at)} aria-expanded={open}>
                    {open ? "Keep it" : "Change"}
                  </button>
                )}
                {open && (
                  <div className="talent-row-pair">
                    <Pair
                      state={state}
                      skill={skill}
                      at={at}
                      onChoose={(l, sd) => {
                        setChanging(null);
                        onChoose(l, sd);
                      }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {next !== undefined && (
        <p className="talent-next muted">
          <span className="num">Level {next}:</span> {TALENTS[skill][next].a.name} or {TALENTS[skill][next].b.name}
        </p>
      )}
    </div>
  );
}

/** One pair as two leaves: take one (it asks first). The one you hold is marked; the other can be taken once allowed. */
function Pair({ state, skill, at, onChoose }: { state: GameState; skill: SkillId; at: TalentLevel; onChoose: (level: TalentLevel, side: Side) => void }) {
  const chosen = choiceAt(state, skill, at);
  const changeable = canChoose(state, skill, at) === null;
  return (
    <div className="talent-pair">
      <span className="talent-pair-level num">Level {at}</span>
      {(["a", "b"] as const).map((side) => {
        const t = TALENTS[skill][at][side];
        const taken = chosen === side;
        return (
          <Tip key={side} content={t.flavour ? { title: t.name, note: t.flavour } : null}>
            <button
              type="button"
              className={`vine-leaf vine-leaf-${side} ${taken ? "is-taken" : ""} ${chosen && !taken ? "is-other" : ""}`}
              disabled={taken || !changeable}
              aria-pressed={taken}
              onClick={() => !taken && changeable && onChoose(at, side)}
            >
              <span className="vine-leaf-name">{t.name}</span>
              <span className="vine-leaf-text">{talentText(t, skill)}</span>
              {!taken && <span className="vine-leaf-lock">Fixed until level {nextTalentLevel(at)}</span>}
            </button>
          </Tip>
        );
      })}
    </div>
  );
}
