import type { CSSProperties } from "react";
import type { ItemId } from "../../content/items";
import { HEARTH_RITE, PART_DEFS, PART_IDS, QUALITIES, QUALITY_AT, RITE_MS, type PartId } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { answerMoment, beginRite, canPlace, placePart, type Result } from "../../engine/commands";
import { canBeginRite, openMoment, qualitySteps, riteFactors, riteLog, riteQuality, riteShortfall } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon, SkillIcon } from "../art/icons";
import { formatClock } from "../format";
import { useRecentFx } from "../useFx";
import type { FxEvent } from "../fx";
import { partState } from "../tasks";
import { TimedBar } from "./Bar";
import { ItemChip } from "./ItemLookup";
import { DrainBar } from "./TendControl";

type Act = (c: (s: GameState) => Result) => unknown;
const pickPlaced = (e: FxEvent) => (e.kind === "placed" ? [e.part] : []);

/**
 * The Kindling, built in the Circle one part at a time. Each part lists what it needs (as chips,
 * so a short one offers to start what makes it) and a Place button. Parts not reached yet show only
 * their name and the skill they'll bring. Once all five are placed, the rite itself.
 */
export function KindlingPanel({ state, act }: { state: GameState; act: Act }) {
  const fresh = useRecentFx(pickPlaced, 1600);
  const placed = state.kindling.length;
  const { performing, completed } = state.rite;
  const allPlaced = placed === PART_IDS.length;

  return (
    <section className={`panel paper kindling ${performing ? "performing" : ""} ${completed ? "done" : ""}`} aria-labelledby="kindling-heading">
      <div className="panel-title">
        <CircleRiteIcon size={20} />
        <h2 id="kindling-heading">{HEARTH_RITE.name}</h2>
        <span className="panel-aside num">{completed ? `Performed: ${QUALITIES[completed.quality]}` : `${placed}/${PART_IDS.length} placed`}</span>
      </div>
      <div className="kindling-body">
        <Rosette state={state} fresh={fresh} />
        {!performing && !completed && (
          <ol className="parts">
            {PART_IDS.map((p) => (
              <PartRow key={p} part={p} state={state} act={act} fresh={fresh.has(p)} />
            ))}
          </ol>
        )}
        {(performing || completed) && (
          <div className="kindling-rite">
            {performing && <Ceremony state={state} act={act} />}
            <RiteLog lines={riteLog(state)} />
          </div>
        )}
      </div>
      {allPlaced && !performing && !completed && <Perform state={state} act={act} />}
    </section>
  );
}

function PartRow({ part, state, act, fresh }: { part: PartId; state: GameState; act: Act; fresh: boolean }) {
  const def = PART_DEFS[part];
  const status = partState(state, part);
  const skill = def.skill;
  if (status === "placed") {
    return (
      <li className={`part is-placed ${fresh ? "is-fresh" : ""}`} data-skill={skill}>
        <span className="part-mark" aria-hidden="true">✓</span>
        <div className="part-body">
          <strong>{def.name}</strong>
          <p className="part-line">{def.placed}</p>
        </div>
      </li>
    );
  }
  if (status === "later") {
    return (
      <li className="part is-later" data-skill={skill}>
        <span className="part-mark" aria-hidden="true">◇</span>
        <div className="part-body">
          <strong>{def.name}</strong>
          <span className="muted part-later">
            Later · brings <SkillIcon skill={skill} size={12} /> {SKILLS[skill].name}
          </span>
        </div>
      </li>
    );
  }
  const reason = canPlace(state, part);
  return (
    <li className={`part is-open ${reason === null ? "is-ready" : ""}`} data-skill={skill}>
      <span className="part-mark" aria-hidden="true">▶</span>
      <div className="part-body">
        <strong>{def.name}</strong>
        <div className="part-needs">
          {(Object.entries(def.items) as [ItemId, number][]).map(([item, need]) => (
            <ItemChip key={item} item={item} need={need} />
          ))}
        </div>
        <button className={`btn ${reason === null ? "btn-primary" : "btn-ghost"} part-place`} disabled={reason !== null} onClick={() => act((s) => placePart(s, part))}>
          {reason === null ? "Place in the Circle" : "Not ready yet"}
        </button>
      </div>
    </li>
  );
}

/** Five petals round the circle, one per part: dark until placed, then lit in its skill's colour. */
function Rosette({ state, fresh }: { state: GameState; fresh: Set<string> }) {
  const fill = state.kindling.length / PART_IDS.length;
  const lit = !!state.rite.performing || !!state.rite.completed;
  return (
    <div className={`kindling-rosette ${lit ? "is-lit" : ""}`} style={{ "--fill": fill } as CSSProperties} aria-label={`The Kindling: ${state.kindling.length} of ${PART_IDS.length} parts placed`} role="img">
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <defs>
          <radialGradient id="kindling-glow">
            <stop offset="0.3" stopColor="var(--gold-400)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--gold-400)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="kindling-glow" r="58" fill="url(#kindling-glow)" />
        <circle r="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="kindling-ring" />
        {PART_IDS.map((p, i) => {
          const a = (i * 2 * Math.PI) / PART_IDS.length - Math.PI / 2;
          const on = state.kindling.includes(p);
          const now = state.rite.performing && HEARTH_RITE.phases[state.rite.performing.phase]?.part === p;
          return (
            <g key={p} data-skill={PART_DEFS[p].skill} className={`petal ${on ? "is-on" : ""} ${now ? "is-now" : ""} ${fresh.has(p) ? "is-fresh" : ""}`} transform={`translate(${34 * Math.cos(a)} ${34 * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90})`}>
              <path d="M0 -14 C 9 -8, 9 8, 0 14 C -9 8, -9 -8, 0 -14 Z" />
            </g>
          );
        })}
        <circle r="12" className="kindling-heart" />
      </svg>
    </div>
  );
}

function Perform({ state, act }: { state: GameState; act: Act }) {
  const short = riteShortfall(state).skills;
  const reason = canBeginRite(state);
  return (
    <div className={`perform ${reason === null ? "is-ready" : ""}`}>
      <h3>Wake it</h3>
      <ul className="ledger">
        {Object.entries(HEARTH_RITE.skills).map(([skill, need]) => {
          const missing = short.find((x) => x.skill === skill);
          return (
            <li key={skill} className={missing ? "" : "met"}>
              <span>
                <span aria-hidden="true">{missing ? "· " : "✓ "}</span>
                {SKILLS[skill as keyof typeof SKILLS].name} level
              </span>
              <span className="num">
                {missing ? missing.have : need}/{need}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="muted">
        {HEARTH_RITE.phases.length} phases, about {Math.round(RITE_MS / 60_000)} minutes. Each phase has one moment: answer it for a better outcome. It never fails.
      </p>
      <Quality state={state} />
      <button className="btn btn-primary" disabled={reason !== null} title={reason ?? undefined} onClick={() => act(beginRite)}>
        Begin the rite
      </button>
    </div>
  );
}

/** The ceremony under way: the phase, its bar, the moment to answer, and the quality so far. */
function Ceremony({ state, act }: { state: GameState; act: Act }) {
  const p = state.rite.performing!;
  const phase = HEARTH_RITE.phases[Math.min(p.phase, HEARTH_RITE.phases.length - 1)]!;
  const open = openMoment(state);
  const from = phase.moment.at * HEARTH_RITE.phaseMs;
  const status = p.moments[p.phase] ? "answered" : open ? "open" : p.phaseMs < from ? "coming" : "missed";
  return (
    <div className="ceremony">
      <div className="ceremony-head">
        <strong>
          Phase {p.phase + 1} of {HEARTH_RITE.phases.length} · {PART_DEFS[phase.part].name}
        </strong>
        <span className="muted num">{formatClock(RITE_MS - (p.phase * HEARTH_RITE.phaseMs + p.phaseMs))} left</span>
      </div>
      <TimedBar key={`phase${p.phase}`} progress={p.phaseMs / HEARTH_RITE.phaseMs} durationMs={HEARTH_RITE.phaseMs} label="Phase progress" />
      <div className={`moment is-${status}`} role="status">
        {status === "open" && (
          <>
            <p>{phase.moment.prompt}</p>
            <button className="btn btn-primary" onClick={() => act(answerMoment)}>
              {phase.moment.button}
            </button>
            <DrainBar key={`m${p.phase}`} leftMs={open!.leftMs} totalMs={HEARTH_RITE.momentMs} />
          </>
        )}
        {status === "coming" && <p className="muted">Watch for this phase's moment…</p>}
        {status === "answered" && <p>✓ {phase.moment.button}: done.</p>}
        {status === "missed" && <p className="muted">The moment passed. The rite goes on.</p>}
      </div>
      <Quality state={state} />
    </div>
  );
}

/** Quality steps as pips, with the outcome they make and what counts. */
function Quality({ state }: { state: GameState }) {
  const factors = riteFactors(state);
  const steps = qualitySteps(state);
  const total = factors.reduce((n, f) => n + f.of, 0);
  return (
    <div className="rite-quality">
      <span className="pips" aria-label={`${steps} of ${total} quality steps`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`pip ${i < steps ? "on" : ""}`} />
        ))}
      </span>
      <span>
        Outcome so far: <strong>{QUALITIES[riteQuality(state)]}</strong>
      </span>
      <span className="muted rite-quality-how">
        {factors.map((f) => `${f.label}`).join(" · ")}. {QUALITY_AT.fine}+ Fine, {QUALITY_AT.resplendent}+ Resplendent.
      </span>
    </div>
  );
}

export function RiteLog({ lines }: { lines: string[] }) {
  return (
    <ol className="rite-log" aria-live="polite">
      {lines.map((l) => (
        <li key={l} className="note-quote">
          {l}
        </li>
      ))}
    </ol>
  );
}
