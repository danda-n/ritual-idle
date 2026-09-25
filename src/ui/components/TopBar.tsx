import { ACTION_DEFS } from "../../content/actions";
import { BUFFS } from "../../content/buffs";
import { HEARTH_RITE, RITE_MS } from "../../content/rite";
import { openMoment } from "../../engine/rite";
import { actionDurationMs, activeBuffs } from "../../engine/modifiers";
import { currentNote, isFeatureOpen } from "../../engine/progress";
import { taskName, taskPlace, type Place } from "../tasks";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon, CoinIcon, CogIcon, SkillIcon } from "../art/icons";
import { Rosette } from "../art/ornaments";
import { formatClock } from "../format";
import { buffEffects } from "../effects";
import { TimedBar } from "./Bar";
import { useCountUp } from "../useFx";
import { TendControl } from "./TendControl";
import { SKILLS } from "../../content/skills";

export function TopBar({ state, onStop, stopNote, onSettings, onGo, onTend, onAnswer }: { state: GameState; onStop: () => void; stopNote?: string; onSettings: () => void; onGo: (p: Place) => void; onTend: () => void; onAnswer: () => void }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Rosette size={26} className="brand-rosette" />
        <h1 className="brand-title">Ritual Idle</h1>
      </div>
      <Working state={state} onStop={onStop} stopNote={stopNote} onGo={onGo} onAnswer={onAnswer} />
      {state.active && !state.rite.performing && <TendControl state={state} onTend={onTend} />}
      {activeBuffs(state).map((b) => (
        <span key={`${b.id}:${b.skill ?? ""}`} className="chip accent buff-chip" title={buffEffects(b.id, b.skill).join(" · ")}>
          {BUFFS[b.id].name}
          {b.skill && ` · ${SKILLS[b.skill].name}`} <span className="num">{formatClock(b.endsAt - state.lastTickAt)}</span>
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

function Working({ state, onStop, stopNote, onGo, onAnswer }: { state: GameState; onStop: () => void; stopNote?: string; onGo: (p: Place) => void; onAnswer: () => void }) {
  const rite = state.rite.performing;
  if (rite) {
    // The moment can be answered from anywhere, right here in the top bar.
    const open = openMoment(state);
    const phase = HEARTH_RITE.phases[Math.min(rite.phase, HEARTH_RITE.phases.length - 1)]!;
    return (
      <div className="working" role="status">
        <CircleRiteIcon size={20} />
        <span className="working-name">
          Kindling · phase {rite.phase + 1}/{HEARTH_RITE.phases.length}
        </span>
        <TimedBar key={`phase${rite.phase}`} progress={rite.phaseMs / HEARTH_RITE.phaseMs} durationMs={HEARTH_RITE.phaseMs} label="Phase progress" />
        {open ? (
          <button className="btn btn-primary moment-top" onClick={onAnswer}>
            {phase.moment.button}
          </button>
        ) : (
          <span className="muted num">{formatClock(RITE_MS - (rite.phase * HEARTH_RITE.phaseMs + rite.phaseMs))}</span>
        )}
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
            <button className="btn btn-ghost" onClick={() => onGo(taskPlace(goal))}>
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
    <div className="working" role="status" data-skill={def.skill}>
      <SkillIcon skill={def.skill} size={20} />
      <span className="working-name">{def.name}</span>
      <TimedBar
        key={`${state.active.id}:${state.stats.completed[state.active.id] ?? 0}:${Math.round(duration)}`}
        progress={state.active.progress}
        durationMs={duration}
        label={`${def.name} progress`}
      />
      <span className="muted num working-time">{left.toFixed(1)}s</span>
      <button className="btn btn-ghost" onClick={onStop}>
        Stop
      </button>
    </div>
  );
}

function Purse({ coin }: { coin: number }) {
  return <span className="num">{useCountUp(coin)}</span>;
}
