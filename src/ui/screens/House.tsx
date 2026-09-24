import { useEffect, useRef, useState } from "react";
import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { ITEMS, type ItemId } from "../../content/items";
import { SKILL_IDS, SKILLS, type SkillId } from "../../content/skills";
import { inputsLastMs, outputPerHour, timeToCapMs, timeToNextLevelMs, xpPerHour } from "../../engine/estimates";
import { actionDurationMs } from "../../engine/modifiers";
import { isRecipeKnown, isSkillUnlocked } from "../../engine/progress";
import { blockReason, skillLevel, type StopReason } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { levelProgress } from "../../engine/xp";
import { SkillIcon } from "../art/icons";
import { Bar, TimedBar } from "../components/Bar";
import { ItemChip } from "../components/ItemLookup";
import type { FxEvent } from "../fx";
import { useRecentFx } from "../useFx";
import { formatDuration, formatRate, formatStop } from "../format";

const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];

export function SkillNav({ state, skill, onSelect }: { state: GameState; skill: SkillId; onSelect: (s: SkillId) => void }) {
  const levelled = useLevelFlash(state);
  return (
    <nav className="skill-nav" aria-label="Skills">
      {SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).map((id) => {
        const running = state.active && ACTION_DEFS[state.active.id].skill === id;
        return (
          <button key={id} data-skill={id} className={`skill-tile ${id === skill ? "selected" : ""} ${levelled.has(id) ? "levelled" : ""}`} aria-current={id === skill ? "page" : undefined} onClick={() => onSelect(id)}>
            <SkillIcon skill={id} size={22} />
            <span className="skill-tile-name">{SKILLS[id].name}</span>
            <span className="skill-tile-level num">
              <span key={skillLevel(state, id)} className={levelled.has(id) ? "pop" : undefined}>
                {skillLevel(state, id)}
              </span>
              <span className="muted">/{state.levelCap}</span>
            </span>
            <Bar thin value={levelProgress(state.skills[id].xp, state.levelCap)} label={`${SKILLS[id].name} level progress`} />
            {running && <span className="skill-tile-running" aria-label="working" />}
          </button>
        );
      })}
    </nav>
  );
}

const pickUnlocked = (e: FxEvent) => (e.kind === "unlocked" ? e.ids : []);

export function SkillActions({ state, skill, onStart }: { state: GameState; skill: SkillId; onStart: (id: ActionId) => void }) {
  const fresh = useRecentFx(pickUnlocked, 5000);
  const level = skillLevel(state, skill);
  const toCap = timeToCapMs(state, skill);
  // Show what can be done now, then only the next thing to unlock; sum up the rest in one line.
  const all = ACTION_IDS.filter((id) => ACTION_DEFS[id].skill === skill);
  const available = (id: ActionId) => isRecipeKnown(state, id) && ACTION_DEFS[id].level <= level;
  const open = all.filter(available);
  const locked = all.filter((id) => !available(id)).sort((a, b) => ACTION_DEFS[a].level - ACTION_DEFS[b].level);
  const nextUp = locked[0];
  const later = locked.slice(1);
  const laterUnknown = later.filter((id) => !isRecipeKnown(state, id)).length;
  return (
    <section className="skill-actions" aria-labelledby="skill-heading">
      <header className="skill-header" data-skill={skill}>
        <SkillIcon skill={skill} size={28} />
        <div>
          <h2 id="skill-heading">{SKILLS[skill].name}</h2>
          <p className="muted num">
            {toCap !== null ? `About ${formatDuration(toCap)} to level ${state.levelCap}` : `At level ${state.levelCap}, the cap for now`}
          </p>
        </div>
      </header>
      <div className="action-list">
        {open.map((id) => (
          <ActionRow key={id} id={id} state={state} onStart={() => onStart(id)} fresh={fresh.has(id)} />
        ))}
        {nextUp && <ActionRow key={nextUp} id={nextUp} state={state} onStart={() => onStart(nextUp)} />}
        {later.length > 0 && (
          <p className="more-recipes muted">
            {later.length} more {later.length === 1 ? "recipe" : "recipes"} · up to Lvl {Math.max(...later.map((id) => ACTION_DEFS[id].level))}
            {laterUnknown > 0 && ` · ${laterUnknown} still in burnt pages`}
          </p>
        )}
      </div>
    </section>
  );
}

function ActionRow({ id, state, onStart, fresh }: { id: ActionId; state: GameState; onStart: () => void; fresh?: boolean }) {
  const def = ACTION_DEFS[id];
  if (!isRecipeKnown(state, id)) {
    return (
      <div className="action-row unknown">
        <div className="action-name">
          <strong>Unknown recipe</strong>
          <span className="muted num">Lvl {def.level}</span>
        </div>
        <p className="action-io muted">Learned from a burnt page (Scholarship).</p>
      </div>
    );
  }
  const blocked = blockReason(state, id);
  const locked = blocked?.kind === "level_too_low";
  const running = state.active?.id === id;
  const inputs = Object.entries(def.inputs) as [ItemId, number][];

  return (
    <div data-skill={def.skill} className={`action-row ${locked ? "locked" : ""} ${running ? "running" : ""} ${fresh ? "fresh" : ""}`}>
      {fresh && <span className="new-badge">New</span>}
      <div className="action-name">
        <strong>{def.name}</strong>
        <span className="muted num">
          Lvl {def.level} · {+(actionDurationMs(state, id) / 1000).toFixed(1)}s · {def.xp} xp
        </span>
      </div>
      <div className="action-io">
        {inputs.map(([item, qty]) => (
          <ItemChip key={item} item={item} need={qty} />
        ))}
        {inputs.length > 0 && (
          <span className="io-arrow" aria-label="makes">
            →
          </span>
        )}
        {def.outputs.map((o) => (
          <ItemChip key={o.item} item={o.item} qty={o.qty} chance={o.chance} />
        ))}
        {!locked && <Rates state={state} id={id} running={running} />}
      </div>
      <div className="action-control">
        {running ? (
          <TimedBar
            key={`${id}:${state.stats.completed[id] ?? 0}:${Math.round(actionDurationMs(state, id))}`}
            elapsedMs={state.active!.elapsedMs}
            durationMs={actionDurationMs(state, id)}
            label={`${def.name} progress`}
          />
        ) : (
          <button className="btn btn-primary" onClick={onStart} disabled={blocked !== null} title={blocked ? formatStop(blocked) : undefined}>
            {startLabel(state, id, blocked)}
          </button>
        )}
      </div>
    </div>
  );
}

/** Per-hour output and XP; while running, also how long the inputs last and the next level. */
function Rates({ state, id, running }: { state: GameState; id: ActionId; running: boolean }) {
  const main = outputPerHour(state, id)[0];
  const last = inputsLastMs(state, id);
  const next = timeToNextLevelMs(state, id);
  return (
    <span className="rates muted num">
      {main && `${formatRate(main.perHour)} ${ITEMS[main.item].name.toLowerCase()}/h · `}
      {formatRate(xpPerHour(state, id))} xp/h
      {running && last !== null && ` · inputs last ${formatDuration(last)}`}
      {running && next !== null && ` · next level in ${formatDuration(next)}`}
    </span>
  );
}

/** Skills whose level just went up, for a brief flash on their tile. */
function useLevelFlash(state: GameState): Set<SkillId> {
  const prev = useRef<Partial<Record<SkillId, number>>>({});
  const [flash, setFlash] = useState<Set<SkillId>>(new Set());
  const levels = SKILL_IDS.map((id) => skillLevel(state, id)).join(",");
  useEffect(() => {
    const up = SKILL_IDS.filter((id) => prev.current[id] !== undefined && skillLevel(state, id) > prev.current[id]!);
    for (const id of SKILL_IDS) prev.current[id] = skillLevel(state, id);
    if (up.length === 0) return;
    setFlash(new Set(up));
    const t = setTimeout(() => setFlash(new Set()), 900);
    return () => clearTimeout(t);
    // Only re-check when some level changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);
  return flash;
}

/** A Start button that says what's missing when it can't start ("Needs 2 beeswax"). */
function startLabel(state: GameState, id: ActionId, blocked: StopReason | null): string {
  if (!blocked) return "Start";
  switch (blocked.kind) {
    case "level_too_low":
      return `Level ${blocked.level}`;
    case "missing_input": {
      const need = ACTION_DEFS[id].inputs[blocked.item] ?? 0;
      return `Needs ${need - (state.inventory[blocked.item] ?? 0)} ${ITEMS[blocked.item].name.toLowerCase()}`;
    }
    case "rite_in_progress":
      return "Rite under way";
    default:
      return formatStop(blocked);
  }
}
