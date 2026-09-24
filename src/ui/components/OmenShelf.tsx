import { useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { BUFF_DEFS, BUFFS } from "../../content/buffs";
import { OMENS, type OmenId } from "../../content/omens";
import { SKILLS } from "../../content/skills";
import { releaseOmen, type Result } from "../../engine/commands";
import { activeBuffs, omenCapacity } from "../../engine/modifiers";
import { storedOmens } from "../../engine/omens";
import type { ActiveBuff, GameState } from "../../engine/state";
import { MoonIcon, SkillIcon } from "../art/icons";
import { formatClock } from "../format";
import { buffDuration, buffEffects } from "../effects";
import { SkillPicker } from "./SkillPicker";
import { DrainBar } from "./TendControl";

const OMEN_IDS = Object.keys(OMENS) as OmenId[];

/**
 * Shown once the first omen has appeared: jars for what's stored, one Release button (a skill
 * blessing asks which skill, in a dialog), and what's active, each with a draining bar.
 */
export function OmenShelf({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [choosing, setChoosing] = useState<OmenId | null>(null);
  const buffs = activeBuffs(state);
  if (state.stats.omensSeen === 0 && buffs.length === 0 && storedOmens(state) === 0) return null;
  const capacity = omenCapacity(state);
  const stored = storedOmens(state);
  const running = state.active ? ACTION_DEFS[state.active.id].skill : undefined;
  return (
    <section className="panel omen-shelf" aria-labelledby="omens-heading">
      <div className="panel-title">
        <MoonIcon size={18} />
        <h2 id="omens-heading">Omen shelf</h2>
        <span className="muted panel-aside num">
          {stored}/{capacity}
        </span>
      </div>
      {stored === 0 && <p className="muted">Empty. Omens turn up now and then from any work (about 1 in 100 actions).</p>}
      {OMEN_IDS.filter((id) => (state.omens[id] ?? 0) > 0).map((id) => (
        <div key={id} className="omen">
          <div className="omen-jars" aria-label={`${state.omens[id]} stored`}>
            {Array.from({ length: state.omens[id] ?? 0 }, (_, i) => (
              <MoonIcon key={i} size={22} />
            ))}
          </div>
          <div className="omen-what">
            <strong>{OMENS[id].name}</strong>
            <span className="muted">
              {buffEffects(OMENS[id].buff).join(", ")} · {buffDuration(OMENS[id].buff)}
            </span>
          </div>
          <button className="btn btn-primary" onClick={() => (BUFF_DEFS[OMENS[id].buff].blessSkill ? setChoosing(id) : act((s) => releaseOmen(s, id)))}>
            Release
          </button>
        </div>
      ))}
      {buffs.length > 0 && <ActiveList state={state} buffs={buffs} />}
      {choosing && (
        <SkillPicker
          state={state}
          title={`Release ${OMENS[choosing].name}: bless which work?`}
          effect={`${buffEffects(OMENS[choosing].buff).join(", ")} · ${buffDuration(OMENS[choosing].buff)}`}
          suggest={running}
          suggestLabel="working on it now"
          onPick={(skill) => act((s) => releaseOmen(s, choosing, skill))}
          onClose={() => setChoosing(null)}
        >
          {buffs.length > 0 && (
            <>
              <p className="muted">Already active (blessing the same skill again adds {buffDuration(OMENS[choosing].buff)}):</p>
              <ActiveList state={state} buffs={buffs} />
            </>
          )}
        </SkillPicker>
      )}
    </section>
  );
}

/** Active effects, one per line: name, the blessed skill, a draining bar and the time left. */
function ActiveList({ state, buffs }: { state: GameState; buffs: ActiveBuff[] }) {
  return (
    <ul className="active-buffs" aria-label="Active effects">
      {buffs.map((b) => {
        const left = b.endsAt - state.lastTickAt;
        return (
          <li key={`${b.id}:${b.skill ?? ""}`} data-skill={b.skill}>
            {b.skill ? <SkillIcon skill={b.skill} size={14} /> : <MoonIcon size={14} />}
            <span className="active-buff-name">
              {BUFFS[b.id].name}
              {b.skill && ` · ${SKILLS[b.skill].name}`}
            </span>
            <DrainBar key={b.endsAt} leftMs={left} totalMs={Math.max(left, BUFFS[b.id].durationMs)} />
            <span className="num muted">{formatClock(left)}</span>
          </li>
        );
      })}
    </ul>
  );
}
