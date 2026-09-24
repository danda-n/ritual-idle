import { useState } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { TEND } from "../../content/talents";
import type { GameState } from "../../engine/state";
import { isTended, tendBonusChance, tendMeterMs } from "../../engine/talents";

/**
 * The hands-on bonus for the running action: a flame meter that drains, and a Tend button that
 * refills it. While lit: +50% speed, and a streak that grows a bonus-find chance. Never required.
 */
export function TendControl({ state, onTend, compact }: { state: GameState; onTend: () => void; compact?: boolean }) {
  if (!state.active) return null;
  const skill = ACTION_DEFS[state.active.id].skill;
  const lit = isTended(state);
  const total = tendMeterMs(state, skill);
  const left = Math.max(0, state.tend.endsAt - state.lastTickAt);
  const chance = tendBonusChance(state, skill);
  return (
    <div className={`tend ${lit ? "is-lit" : ""} ${compact ? "compact" : ""}`}>
      <button className="btn btn-ghost tend-btn" onClick={onTend} title="Tend it (Space): refills the flame. While lit, +50% speed and a growing chance of a bonus find.">
        Tend
      </button>
      {lit ? <DrainBar key={state.tend.endsAt} leftMs={left} totalMs={total} /> : <span className="bar thin tend-bar" aria-hidden="true" />}
      {!compact && (
        <span className="tend-info muted num">
          {lit ? `+${Math.round(TEND.speed * 100)}% · bonus ${Math.round(chance * 100)}%${state.tend.streak > 0 ? ` (streak ${state.tend.streak})` : ""}` : "Tend: +50% speed"}
        </span>
      )}
    </div>
  );
}

/** Drains from its current level to empty on the compositor, like TimedBar in reverse. */
export function DrainBar({ leftMs, totalMs }: { leftMs: number; totalMs: number }) {
  const [start] = useState(() => ({ total: Math.max(1, totalMs), spent: Math.max(0, totalMs - leftMs) }));
  return (
    <span className="bar thin tend-bar" role="progressbar" aria-label="Tend meter" aria-valuenow={Math.round((leftMs / totalMs) * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="bar-fill drain" style={{ animationDuration: `${start.total}ms`, animationDelay: `-${start.spent}ms` }} />
    </span>
  );
}
