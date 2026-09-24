import { ACTION_DEFS } from "../../content/actions";
import { BUFFS } from "../../content/buffs";
import { actionDurationMs, activeBuffs } from "../../engine/modifiers";
import { isFeatureOpen } from "../../engine/progress";
import type { GameState } from "../../engine/state";
import { CoinIcon, SkillIcon } from "../art/icons";
import { Rosette } from "../art/ornaments";
import { formatClock } from "../format";
import { Bar } from "./Bar";

export function TopBar({ state, onStop, stopNote }: { state: GameState; onStop: () => void; stopNote?: string }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Rosette size={26} className="brand-rosette" />
        <h1 className="brand-title">Ritual Idle</h1>
      </div>
      <Working state={state} onStop={onStop} stopNote={stopNote} />
      {activeBuffs(state).map((b) => (
        <span key={b.id} className="chip accent buff-chip" title={BUFFS[b.id].description}>
          {BUFFS[b.id].name} <span className="num">{formatClock(b.endsAt - state.lastTickAt)}</span>
        </span>
      ))}
      {isFeatureOpen(state, "village") && (
        <div className="purse" aria-label={`${state.coin} coin`}>
          <CoinIcon size={18} />
          <span className="num">{state.coin}</span>
        </div>
      )}
    </header>
  );
}

function Working({ state, onStop, stopNote }: { state: GameState; onStop: () => void; stopNote?: string }) {
  if (!state.active) {
    return (
      <div className="working idle" role="status">
        {stopNote ? <span className="warn">Stopped: {stopNote}.</span> : <span className="muted">Idle. Choose something to do.</span>}
      </div>
    );
  }
  const def = ACTION_DEFS[state.active.id];
  const duration = actionDurationMs(state, state.active.id);
  const left = Math.max(0, (duration - state.active.elapsedMs) / 1000);
  return (
    <div className="working" role="status">
      <SkillIcon skill={def.skill} size={20} />
      <span className="working-name">{def.name}</span>
      <Bar value={state.active.elapsedMs / duration} label={`${def.name} progress`} />
      <span className="muted num working-time">{left.toFixed(1)}s</span>
      <button className="btn btn-ghost" onClick={onStop}>
        Stop
      </button>
    </div>
  );
}
