import { useState } from "react";
import { Term } from "./Term";
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
import { DrainBar } from "./Bar";

const OMEN_IDS = Object.keys(OMENS) as OmenId[];

/**
 * Shown once the omen shelf is built (a house project): a card per kind of omen stored (one jar
 * with a count, what it does, a "Bless a skill" button that asks which skill), and what's active,
 * each with a draining bar. Built to read at the sidebar's narrowest.
 */
export function OmenShelf({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [choosing, setChoosing] = useState<OmenId | null>(null);
  const buffs = activeBuffs(state);
  const capacity = omenCapacity(state);
  if (capacity === 0 && buffs.length === 0) return null;
  const stored = storedOmens(state);
  const running = state.active ? ACTION_DEFS[state.active.id].skill : undefined;
  return (
    <section className="panel omen-shelf" aria-labelledby="omens-heading">
      <div className="panel-title">
        <MoonIcon size={18} />
        {/* Before the omen shelf is built, this only shows what's active. */}
        <h2 id="omens-heading">
          {capacity > 0 && (
            <>
              <Term id="omen">Omens</Term> &amp;{" "}
            </>
          )}
          <Term id="blessing">{capacity > 0 ? "blessings" : "Blessings"}</Term>
        </h2>
        {capacity > 0 && (
          <span className="muted panel-aside num">
            {stored}/{capacity}
          </span>
        )}
      </div>
      {capacity > 0 && stored === 0 && <p className="muted">Empty · ~1 omen per {Math.round(1 / OMENS.still_night.dropChance)} actions</p>}
      {capacity > 0 && stored >= capacity && <p className="warn omen-full">Shelf full: new omens are lost until you use one.</p>}
      {/* One card per kind of omen: a jar with a count, the name, what it does, and one button. */}
      {OMEN_IDS.filter((id) => (state.omens[id] ?? 0) > 0).map((id) => (
        <div key={id} className="omen">
          <span className="omen-jar" aria-hidden="true">
            <MoonIcon size={20} />
          </span>
          <strong className="omen-name">
            {OMENS[id].name}
            {(state.omens[id] ?? 0) > 1 && <span className="omen-count num"> ×{state.omens[id]}</span>}
          </strong>
          <span className="omen-effect">
            {buffEffects(OMENS[id].buff).join(" · ")} · {buffDuration(OMENS[id].buff)}
          </span>
          <button className="btn btn-ghost btn-sm btn-invite omen-use" onClick={() => (BUFF_DEFS[OMENS[id].buff].blessSkill ? setChoosing(id) : act((s) => releaseOmen(s, id)))}>
            {BUFF_DEFS[OMENS[id].buff].blessSkill ? "Bless a skill" : "Use it"}
          </button>
        </div>
      ))}
      {buffs.length > 0 && <ActiveList state={state} buffs={buffs} />}
      {choosing && (
        <SkillPicker
          state={state}
          title={`Bless a skill with ${OMENS[choosing].name}`}
          effect={`${buffEffects(OMENS[choosing].buff).join(", ")} · ${buffDuration(OMENS[choosing].buff)}`}
          suggest={running}
          suggestLabel="current"
          onPick={(skill) => act((s) => releaseOmen(s, choosing, skill))}
          onClose={() => setChoosing(null)}
        >
          {buffs.length > 0 && (
            <>
              <p className="muted">Active · same skill again: +{buffDuration(OMENS[choosing].buff)}</p>
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
