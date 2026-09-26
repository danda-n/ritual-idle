import { ACTION_DEFS } from "../../content/actions";
import { BUFFS } from "../../content/buffs";
import { HEARTH_RITE, RITE_MS } from "../../content/rite";
import { actionDurationMs, activeBuffs } from "../../engine/modifiers";
import { currentNote, isFeatureOpen } from "../../engine/progress";
import { taskName, taskPlace, type Place } from "../tasks";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon, CoinIcon, CogIcon, MoonIcon, SkillIcon } from "../art/icons";
import { Rosette } from "../art/ornaments";
import { formatClock } from "../format";
import { buffEffects } from "../effects";
import { TimedBar } from "./Bar";
import { useCountUp } from "../useFx";
import { SKILLS } from "../../content/skills";

export function TopBar({ state, onStop, stopNote, onSettings, onGo }: { state: GameState; onStop: () => void; stopNote?: string; onSettings: () => void; onGo: (p: Place) => void }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Rosette size={24} className="brand-rosette" />
        <h1 className="brand-title">Ritual Idle</h1>
      </div>
      <Working state={state} onStop={onStop} stopNote={stopNote} onGo={onGo} />
      {activeBuffs(state).map((b) => (
        <span key={`${b.id}:${b.skill ?? ""}`} className="buff-chip" data-skill={b.skill} title={buffEffects(b.id, b.skill).join(" · ")}>
          <MoonIcon size={16} />
          {BUFFS[b.id].name}
          {b.skill && <span className="buff-skill"> · {SKILLS[b.skill].name}</span>} <span className="num muted">{formatClock(b.endsAt - state.lastTickAt)}</span>
        </span>
      ))}
      {isFeatureOpen(state, "village") && (
        <div className="purse" aria-label={`${state.coin} coin`}>
          <CoinIcon size={18} />
          <Purse coin={Math.floor(state.coin)} />
        </div>
      )}
      <button className="btn btn-ghost icon-btn" onClick={onSettings} aria-label="Settings">
        <CogIcon size={18} />
      </button>
    </header>
  );
}

function Working({ state, onStop, stopNote, onGo }: { state: GameState; onStop: () => void; stopNote?: string; onGo: (p: Place) => void }) {
  const rite = state.rite.performing;
  if (rite) {
    return (
      <div className="working is-on is-rite" role="status" data-skill="ritualism">
        <CircleRiteIcon size={22} />
        <span className="working-what">
          <span className="working-skill">The Kindling</span>
          <span className="working-name">
            Phase {rite.phase + 1}/{HEARTH_RITE.phases.length}
          </span>
        </span>
        <TimedBar key={`phase${rite.phase}`} progress={rite.phaseMs / HEARTH_RITE.phaseMs} durationMs={HEARTH_RITE.phaseMs} label="Phase progress" />
        <span className="muted num">{formatClock(RITE_MS - (rite.phase * HEARTH_RITE.phaseMs + rite.phaseMs))}</span>
      </div>
    );
  }
  if (!state.active) {
    // Idle: say what to do next instead of just "idle".
    const note = currentNote(state);
    const goal = "goal" in note && !state.rite.completed ? note.goal : null;
    return (
      <div className="working idle" role="status">
        {stopNote && <span className="warn">Stopped: {stopNote}.</span>}
        {goal ? (
          <>
            <span className="muted">Next:</span>
            <span className="working-name">{taskName(goal)}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onGo(taskPlace(goal))}>
              Go
            </button>
          </>
        ) : (
          !stopNote && <span className="muted">Nothing running. Pick something to do.</span>
        )}
      </div>
    );
  }
  const def = ACTION_DEFS[state.active.id];
  const duration = actionDurationMs(state, state.active.id);
  const left = Math.max(0, ((1 - state.active.progress) * duration) / 1000);
  return (
    <div className="working is-on" role="status" data-skill={def.skill}>
      <SkillIcon skill={def.skill} size={22} />
      <span className="working-what">
        <span className="working-skill">{SKILLS[def.skill].name}</span>
        <span className="working-name">{def.name}</span>
      </span>
      <TimedBar
        key={`${state.active.id}:${state.stats.completed[state.active.id] ?? 0}:${Math.round(duration)}`}
        progress={state.active.progress}
        durationMs={duration}
        label={`${def.name} progress`}
      />
      <span className="muted num working-time">{left.toFixed(1)}s</span>
      <button className="btn btn-ghost btn-sm" onClick={onStop}>
        Stop
      </button>
    </div>
  );
}

function Purse({ coin }: { coin: number }) {
  return <span className="num">{useCountUp(coin)}</span>;
}
