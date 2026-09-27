import type { CSSProperties } from "react";
import type { ItemId } from "../../content/items";
import { HEARTH_RITE, PART_DEFS, PART_IDS, QUALITIES, type PartId } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { canPlace, placePart, type Result } from "../../engine/commands";
import { stageChoices } from "../../engine/progress";
import { ritePhases } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { itemName } from "../format";
import { useRecentFx } from "../useFx";
import type { FxEvent } from "../fx";
import { partState } from "../tasks";
import { ItemChip } from "./ItemLookup";
import { RiteReady, RiteScene } from "./Rite";

type Act = (c: (s: GameState) => Result) => unknown;
const pickPlaced = (e: FxEvent) => (e.kind === "placed" ? [e.part] : []);

/**
 * The Kindling, built in the Circle one part at a time. Each part lists what it needs (as chips,
 * so a short one offers to start what makes it) and a Place button. Parts not reached yet show only
 * their name and the skill they'll bring. Once all five are placed, the rite itself; while it runs
 * and after, a five-row phase checklist (the story lines are in the Grimoire journal).
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
        {performing && <RiteScene state={state} act={act} compact />}
        {completed && <PhaseList state={state} />}
        {allPlaced && !performing && !completed && <RiteReady state={state} act={act} />}
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
          <span className="muted part-later num">
            {(Object.entries(def.items) as [ItemId, number][]).map(([item, n]) => `${n} ${itemName(item).toLowerCase()}`).join(" · ")}
          </span>
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
            {choosable ? "Yours to choose (above)" : "Later"} · brings <SkillIcon skill={skill} size={12} /> {SKILLS[skill].name}
          </span>
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

/** The rite's five phases, one per part: ✓ done, ▸ running now, · later. */
function PhaseList({ state }: { state: GameState }) {
  return (
    <ol className="phase-list" aria-label="Rite phases">
      {ritePhases(state).map(({ part, status }) => (
        <li key={part} className={`is-${status}`} data-skill={PART_DEFS[part].skill} aria-current={status === "current" ? "step" : undefined}>
          <span className="phase-mark" aria-hidden="true">
            {status === "done" ? "✓" : status === "current" ? "▸" : "·"}
          </span>
          {PART_DEFS[part].name}
        </li>
      ))}
    </ol>
  );
}
