import { useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { BUFF_DEFS, BUFFS } from "../../content/buffs";
import { SKILL_IDS, SKILLS, type SkillId } from "../../content/skills";
import { isSkillUnlocked } from "../../engine/progress";
import { SkillIcon } from "../art/icons";
import { OMENS, type OmenId } from "../../content/omens";
import { releaseOmen, type Result } from "../../engine/commands";
import { activeBuffs, omenCapacity } from "../../engine/modifiers";
import { storedOmens } from "../../engine/omens";
import type { GameState } from "../../engine/state";
import { MoonIcon } from "../art/icons";
import { formatClock } from "../format";
import { buffDuration, buffEffects } from "../effects";

const OMEN_IDS = Object.keys(OMENS) as OmenId[];

/** Shown once the first omen has appeared. */
export function OmenShelf({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [choosing, setChoosing] = useState<OmenId | null>(null);
  const buffs = activeBuffs(state);
  // Skills you can bless, the one you're running first.
  const running = state.active ? ACTION_DEFS[state.active.id].skill : null;
  const open = SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).sort((a, b) => (a === running ? -1 : b === running ? 1 : 0));
  if (state.stats.omensSeen === 0 && buffs.length === 0) return null;
  const capacity = omenCapacity(state);
  const stored = storedOmens(state);
  return (
    <section className="panel omen-shelf" aria-labelledby="omens-heading">
      <div className="panel-title">
        <MoonIcon size={18} />
        <h2 id="omens-heading">Omen shelf</h2>
        <span className="muted panel-aside num">
          {stored}/{capacity}
        </span>
      </div>
      {stored === 0 && <p className="muted">Empty. Omens drop now and then from any work (about 1 in 400 actions).</p>}
      {OMEN_IDS.filter((id) => (state.omens[id] ?? 0) > 0).map((id) => (
        <div key={id} className="omen">
          <div className="omen-jars" aria-hidden="true">
            {Array.from({ length: state.omens[id] ?? 0 }, (_, i) => (
              <MoonIcon key={i} size={22} />
            ))}
          </div>
          <div>
            <h3>{OMENS[id].name}</h3>
            <ul className="effects">
              {buffEffects(OMENS[id].buff).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          {BUFF_DEFS[OMENS[id].buff].blessSkill && choosing === id ? (
            <div className="bless-pick" role="group" aria-label="Bless which skill?">
              <span className="muted">Bless which work?</span>
              {open.map((skill: SkillId) => (
                <button
                  key={skill}
                  data-skill={skill}
                  className="btn btn-ghost bless-skill"
                  onClick={() => {
                    act((s) => releaseOmen(s, id, skill));
                    setChoosing(null);
                  }}
                >
                  <SkillIcon skill={skill} size={14} /> {SKILLS[skill].name}
                  {skill === running && <span className="muted"> · now</span>}
                </button>
              ))}
              <button className="btn btn-ghost" onClick={() => setChoosing(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => (BUFF_DEFS[OMENS[id].buff].blessSkill ? setChoosing(id) : act((s) => releaseOmen(s, id)))}>
              Release · {buffDuration(OMENS[id].buff)}
            </button>
          )}
        </div>
      ))}
      {buffs.length > 0 && (
        <ul className="ledger buff-list" aria-label="Active effects">
          {buffs.map((b) => (
            <li key={`${b.id}:${b.skill ?? ""}`} className="buff-row">
              <span>
                <strong>{BUFFS[b.id].name}</strong>
                <span className="effects-inline">{buffEffects(b.id, b.skill).join(" · ")}</span>
              </span>
              <span className="num">{formatClock(b.endsAt - state.lastTickAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
