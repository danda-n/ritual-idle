import { useState, type CSSProperties } from "react";
import type { ItemId } from "../../content/items";
import { HEARTH_RITE, OFFERINGS, PART_DEFS, PART_IDS, QUALITIES, RITE_MS, type OfferingId, type PartId } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { beginRite, canPlace, chooseStage, placePart, type Result } from "../../engine/commands";
import { stageChoices } from "../../engine/progress";
import { canBeginRite, canOffer, offeringsMet, riteLog, riteQuality, riteShortfall } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { formatClock } from "../format";
import { useRecentFx } from "../useFx";
import type { FxEvent } from "../fx";
import { partState } from "../tasks";
import { TimedBar } from "./Bar";
import { ItemChip } from "./ItemLookup";

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
    <section className={`circle-stage ${performing ? "is-performing" : ""} ${completed ? "is-done" : ""}`} aria-labelledby="kindling-heading">
      <div>
        <Rosette state={state} fresh={fresh} />
        <p className="kindle-caption">
          <span className="label">{HEARTH_RITE.name}</span>
        </p>
      </div>
      <div className="stage-side">
        <div className="stage-head">
          <h2 id="kindling-heading">The Kindling</h2>
          <span className="meta num">{completed ? `Performed: ${QUALITIES[completed.quality]}` : `${placed}/${PART_IDS.length} placed`}</span>
        </div>
        {!performing && !completed && (
          <ol className="parts">
            {PART_IDS.map((p) => (
              <PartRow key={p} part={p} state={state} act={act} fresh={fresh.has(p)} />
            ))}
          </ol>
        )}
        {(performing || completed) && (
          <>
            {performing && <Running state={state} />}
            <RiteLog lines={riteLog(state)} />
          </>
        )}
        {allPlaced && !performing && !completed && <Perform state={state} act={act} />}
      </div>
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
        <span className="ic" aria-hidden="true">✓</span>
        <div className="part-body">
          <strong>{def.name}</strong>
          <p className="lore">{def.placed}</p>
        </div>
      </li>
    );
  }
  if (status === "later") {
    const choosable = stageChoices(state).includes(part);
    return (
      <li className={`part is-later ${choosable ? "is-choosable" : ""}`} data-skill={skill}>
        <span className="ic" aria-hidden="true">
          <SkillIcon skill={skill} size={16} />
        </span>
        <div className="part-body">
          <strong>{def.name}</strong>
          <span className="muted part-later">
            {choosable ? "Yours to choose" : "Later"} · brings <SkillIcon skill={skill} size={12} /> {SKILLS[skill].name}
          </span>
          {choosable && (
            <button className="btn btn-ghost btn-sm part-place" onClick={() => act((s) => chooseStage(s, part))}>
              Make this next
            </button>
          )}
        </div>
      </li>
    );
  }
  const reason = canPlace(state, part);
  return (
    <li className={`part is-open ${reason === null ? "is-ready" : ""}`} data-skill={skill}>
      <span className="ic" aria-hidden="true">
        <SkillIcon skill={skill} size={16} />
      </span>
      <div className="part-body">
        <strong>{def.name}</strong>
        <div className="part-needs">
          {(Object.entries(def.items) as [ItemId, number][]).map(([item, need]) => (
            <ItemChip key={item} item={item} need={need} />
          ))}
        </div>
        <button className={`btn btn-sm ${reason === null ? "btn-primary" : ""} part-place`} disabled={reason !== null} onClick={() => act((s) => placePart(s, part))}>
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
    <div className={`kindle ${lit ? "is-lit" : ""}`} style={{ "--fill": fill } as CSSProperties} aria-label={`The Kindling: ${state.kindling.length} of ${PART_IDS.length} parts placed`} role="img">
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <defs>
          <radialGradient id="kindling-glow">
            <stop offset="0.25" stopColor="var(--place)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--place)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="58" fill="url(#kindling-glow)" opacity={0.25 + fill * 0.55} />
        <g className="ring-out">
          <circle r="52" fill="none" stroke="#6b5a50" strokeWidth="0.8" strokeDasharray="2 3" />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} r="1.4" cx={52 * Math.cos((i * Math.PI) / 5)} cy={52 * Math.sin((i * Math.PI) / 5)} fill={i < Math.round(fill * 10) ? "var(--place)" : "#4b433b"} />
          ))}
        </g>
        <circle r="45" fill="none" stroke="#4b433b" strokeWidth="0.5" />
        {PART_IDS.map((p, i) => {
          const a = (i * 2 * Math.PI) / PART_IDS.length - Math.PI / 2;
          const on = state.kindling.includes(p);
          const now = state.rite.performing && HEARTH_RITE.phases[state.rite.performing.phase]?.part === p;
          return (
            <g key={p} data-skill={PART_DEFS[p].skill} className={`petal ${on ? "is-on" : ""} ${!on && partState(state, p) === "open" ? "is-next" : ""} ${now ? "is-now" : ""} ${fresh.has(p) ? "is-fresh" : ""}`} transform={`translate(${34 * Math.cos(a)} ${34 * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90})`}>
              <path d="M0 -14 C 9 -8, 9 8, 0 14 C -9 8, -9 -8, 0 -14 Z" />
            </g>
          );
        })}
        <circle r="11" className="heart" />
      </svg>
    </div>
  );
}

function Perform({ state, act }: { state: GameState; act: Act }) {
  const [candle, setCandle] = useState(false);
  const short = riteShortfall(state).skills;
  const reason = canBeginRite(state);
  const chosen: OfferingId[] = candle && canOffer(state, "hearth_candle") === null ? ["hearth_candle"] : [];
  const met = offeringsMet(state, chosen);
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
      <p className="muted">About {Math.round(RITE_MS / 60_000)} minutes. It runs by itself, even while you're away, and never fails.</p>
      <h3>Offerings (optional)</h3>
      <ul className="offerings">
        {OFFERINGS.map((o) => {
          const on = met.includes(o.id);
          if ("item" in o) {
            const blocked = canOffer(state, o.id);
            return (
              <li key={o.id} className={on ? "met" : ""}>
                <label className="toggle">
                  <input type="checkbox" checked={candle} disabled={blocked !== null} onChange={(e) => setCandle(e.target.checked)} /> {o.label}
                </label>
                {blocked && <span className="muted"> · {blocked}</span>}
              </li>
            );
          }
          return (
            <li key={o.id} className={on ? "met" : ""}>
              <span aria-hidden="true">{on ? "✦ " : "◇ "}</span>
              {o.label}
            </li>
          );
        })}
      </ul>
      <p className="muted">
        Outcome: <strong>{QUALITIES[riteQuality(state, chosen)]}</strong> · none = Sound, 1–2 = Fine (choose a keepsake), all 3 = Resplendent (choose two, and more lore). The story rewards are the same either way.
      </p>
      <button className="btn btn-primary" disabled={reason !== null} title={reason ?? undefined} onClick={() => act((s) => beginRite(s, chosen))}>
        Begin the rite
      </button>
    </div>
  );
}

/** The rite under way: the phase, its bar, and the time left. It needs nothing from you. */
function Running({ state }: { state: GameState }) {
  const p = state.rite.performing!;
  const phase = HEARTH_RITE.phases[Math.min(p.phase, HEARTH_RITE.phases.length - 1)]!;
  return (
    <div className="ceremony">
      <div className="ceremony-head">
        <strong>
          Phase {p.phase + 1} of {HEARTH_RITE.phases.length} · {PART_DEFS[phase.part].name}
        </strong>
        <span className="muted num">{formatClock(RITE_MS - (p.phase * HEARTH_RITE.phaseMs + p.phaseMs))} left</span>
      </div>
      <TimedBar key={`phase${p.phase}`} progress={p.phaseMs / HEARTH_RITE.phaseMs} durationMs={HEARTH_RITE.phaseMs} label="Phase progress" />
      <p className="muted">
        Outcome: <strong>{QUALITIES[riteQuality(state)]}</strong> · it runs by itself.
      </p>
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
