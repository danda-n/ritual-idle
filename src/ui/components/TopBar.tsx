import { ACTION_DEFS } from "../../content/actions";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { Rosette } from "../art/ornaments";
import { Bar } from "./Bar";

export function TopBar({ state, onStop, stopNote }: { state: GameState; onStop: () => void; stopNote?: string }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Rosette size={26} className="brand-rosette" />
        <h1 className="brand-title">Ritual Idle</h1>
      </div>
      <Working state={state} onStop={onStop} stopNote={stopNote} />
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
  const left = Math.max(0, def.seconds - state.active.elapsedMs / 1000);
  return (
    <div className="working" role="status">
      <SkillIcon skill={def.skill} size={20} />
      <span className="working-name">{def.name}</span>
      <Bar value={state.active.elapsedMs / (def.seconds * 1000)} label={`${def.name} progress`} />
      <span className="muted num working-time">{left.toFixed(1)}s</span>
      <button className="btn btn-ghost" onClick={onStop}>
        Stop
      </button>
    </div>
  );
}
