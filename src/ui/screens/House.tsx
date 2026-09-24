import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { ITEMS, type ItemId } from "../../content/items";
import { SKILL_IDS, SKILLS, type SkillId } from "../../content/skills";
import { inputsLastMs, outputPerHour, timeToCapMs, timeToNextLevelMs, xpPerHour } from "../../engine/estimates";
import { actionDurationMs } from "../../engine/modifiers";
import { isRecipeKnown, isSkillUnlocked } from "../../engine/progress";
import { blockReason, skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { levelProgress } from "../../engine/xp";
import { SkillIcon } from "../art/icons";
import { Bar, TimedBar } from "../components/Bar";
import { ItemChip } from "../components/ItemLookup";
import { formatDuration, formatRate, formatStop } from "../format";

const ACTION_IDS = Object.keys(ACTION_DEFS) as ActionId[];

export function SkillNav({ state, skill, onSelect }: { state: GameState; skill: SkillId; onSelect: (s: SkillId) => void }) {
  return (
    <nav className="skill-nav" aria-label="Skills">
      {SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).map((id) => {
        const running = state.active && ACTION_DEFS[state.active.id].skill === id;
        return (
          <button key={id} className={`skill-tile ${id === skill ? "selected" : ""}`} aria-current={id === skill ? "page" : undefined} onClick={() => onSelect(id)}>
            <SkillIcon skill={id} size={22} />
            <span className="skill-tile-name">{SKILLS[id].name}</span>
            <span className="skill-tile-level num">
              {skillLevel(state, id)}
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

export function SkillActions({ state, skill, onStart }: { state: GameState; skill: SkillId; onStart: (id: ActionId) => void }) {
  const level = skillLevel(state, skill);
  const toCap = timeToCapMs(state, skill);
  return (
    <section className="skill-actions" aria-labelledby="skill-heading">
      <header className="skill-header">
        <SkillIcon skill={skill} size={28} />
        <div>
          <h2 id="skill-heading">{SKILLS[skill].name}</h2>
          <p className="muted num">
            Level {level} of {state.levelCap}
            {toCap !== null ? ` · about ${formatDuration(toCap)} to the cap` : " · at the cap for now"}
          </p>
        </div>
      </header>
      <div className="action-list">
        {ACTION_IDS.filter((id) => ACTION_DEFS[id].skill === skill).map((id) => (
          <ActionRow key={id} id={id} state={state} onStart={() => onStart(id)} />
        ))}
      </div>
    </section>
  );
}

function ActionRow({ id, state, onStart }: { id: ActionId; state: GameState; onStart: () => void }) {
  const def = ACTION_DEFS[id];
  if (!isRecipeKnown(state, id)) {
    return (
      <div className="action-row unknown">
        <div className="action-name">
          <strong>Unknown recipe</strong>
          <span className="muted num">Lvl {def.level}</span>
        </div>
        <p className="action-io muted">Somewhere in grandmother's burnt pages. Decipher more of them.</p>
      </div>
    );
  }
  const blocked = blockReason(state, id);
  const locked = blocked?.kind === "level_too_low";
  const running = state.active?.id === id;
  const inputs = Object.entries(def.inputs) as [ItemId, number][];

  return (
    <div className={`action-row ${locked ? "locked" : ""} ${running ? "running" : ""}`}>
      <div className="action-name">
        <strong>{def.name}</strong>
        <span className="muted num">
          Lvl {def.level} · {+(actionDurationMs(state, id) / 1000).toFixed(1)}s · {def.xp} xp
        </span>
      </div>
      <div className="action-io">
        {inputs.map(([item, qty]) => (
          <ItemChip key={item} item={item} className={(state.inventory[item] ?? 0) < qty ? "short" : ""}>
            <span className="num">{qty}</span> {ITEMS[item].name}
          </ItemChip>
        ))}
        {inputs.length > 0 && (
          <span className="io-arrow" aria-label="makes">
            →
          </span>
        )}
        {def.outputs.map((o) => (
          <ItemChip key={o.item} item={o.item} className="accent">
            <span className="num">{o.qty}</span> {ITEMS[o.item].name}
            {o.chance !== undefined && <span className="muted num"> {Math.round(o.chance * 1000) / 10}%</span>}
          </ItemChip>
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
            {locked ? `Level ${def.level}` : "Start"}
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
