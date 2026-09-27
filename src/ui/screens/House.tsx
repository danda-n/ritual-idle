import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { ITEMS, type ItemId } from "../../content/items";
import { SKILL_IDS, SKILLS, type SkillId } from "../../content/skills";
import { effectiveOutputs, inputsLastMs, outputPerHour, producingSkill, revealedRecipes, timeToCapMs, timeToNextLevelMs, xpPerHour } from "../../engine/estimates";
import { PART_DEFS, type PartId } from "../../content/rite";
import type { Result } from "../../engine/commands";
import { choicesWaiting } from "../../engine/talents";
import { TalentPanel } from "../components/TalentPanel";
import { BUFFS, type BuffId } from "../../content/buffs";
import { buffDuration, buffEffects } from "../effects";
import { taskName } from "../tasks";
import { actionDurationMs, actionInputs, offlineCapMs } from "../../engine/modifiers";
import { isRecipeKnown, isSkillUnlocked, middleParts, MIDDLE_AT, stageChoices, stageOrder } from "../../engine/progress";
import { blockReason, skillLevel, type StopReason } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { levelProgress } from "../../engine/xp";
import { ScrollIcon, SkillIcon } from "../art/icons";
import { ItemIcon } from "../art/items";
import { describeSanctum, Sanctum, sanctumView } from "../art/Sanctum";
import { Bar } from "../components/Bar";
import { ItemChip } from "../components/ItemLookup";
import type { FxEvent } from "../fx";
import { useRecentFx } from "../useFx";
import { formatDuration, formatRate, formatStop } from "../format";


/** The House hero: the Sanctum scene behind a dark gradient, the place name and three numbers. */
export function HouseHero({ state }: { state: GameState }) {
  const open = SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).length;
  const running = state.active ? ACTION_DEFS[state.active.id].name : state.rite.performing ? "The Kindling" : "Nothing";
  return (
    <header className="hero is-house">
      <div className="hero-art">
        <Sanctum state={state} />
      </div>
      <div className="hero-words">
        <h1>The House</h1>
        <p className="lore">{describeSanctum(sanctumView(state))}</p>
      </div>
      <div className="hero-stats">
        <span className="hero-stat">
          <span className="label">Skills</span>
          <b className="num">
            {open}
            <span className="unit">/{SKILL_IDS.length}</span>
          </b>
        </span>
        <span className="hero-stat accent">
          <span className="label">Working on</span>
          <b className="hero-stat-text">{running}</b>
        </span>
        <span className="hero-stat">
          <span className="label">Away cap</span>
          <b className="num">
            {Math.round(offlineCapMs(state) / 3_600_000)}
            <span className="unit">h</span>
          </b>
        </span>
      </div>
    </header>
  );
}

export function SkillNav({ state, skill, onSelect }: { state: GameState; skill: SkillId; onSelect: (s: SkillId) => void }) {
  const levelled = useLevelFlash(state);
  return (
    <nav className="panel flush skill-list" aria-label="Skills">
      {SKILL_IDS.filter((id) => isSkillUnlocked(state, id)).map((id) => {
        const running = state.active && ACTION_DEFS[state.active.id].skill === id ? state.active : null;
        const waiting = choicesWaiting(state, id).length;
        return (
          <button key={id} data-skill={id} className={`skill-item ${levelled.has(id) ? "levelled" : ""}`} aria-current={id === skill ? "page" : undefined} onClick={() => onSelect(id)}>
            <SkillIcon skill={id} size={20} />
            <span className="name">
              {SKILLS[id].name}
              {waiting > 0 && (
                <span className="talent-badge num" title="A talent to choose">
                  +{waiting}
                </span>
              )}
            </span>
            <span className="num">
              <span key={skillLevel(state, id)} className={`lvl ${levelled.has(id) ? "pop" : ""}`}>
                {skillLevel(state, id)}
              </span>
              <span className="cap">/{state.levelCap}</span>
            </span>
            <Bar thin value={levelProgress(state.skills[id].xp, state.levelCap)} label={`${SKILLS[id].name} level progress`} />
            {running && <RunningNow state={state} id={running.id} progress={running.progress} />}
          </button>
        );
      })}
      <NextSkill state={state} />
    </nav>
  );
}

/** Under the running skill: the recipe and the time left (the bars are in the top bar and the row). */
function RunningNow({ state, id, progress }: { state: GameState; id: ActionId; progress: number }) {
  const ms = actionDurationMs(state, id);
  return (
    <span className="now" role="status">
      <span className="now-name">{ACTION_DEFS[id].name}</span>
      <span className="now-time num">{(((1 - progress) * ms) / 1000).toFixed(1)}s</span>
    </span>
  );
}

/** One quiet tile for the next skill to arrive, and what brings it (or a choice of them). */
function NextSkill({ state }: { state: GameState }) {
  const choices = stageChoices(state);
  if (choices.length > 0) {
    return (
      <div className="skill-item is-next" aria-label="Next: choose a part in the chapter tracker">
        <span />
        <span className="name">Next skill</span>
        <span />
        <span className="when">You choose, at the Circle</span>
      </div>
    );
  }
  const order = stageOrder(state);
  const at = order.findIndex((n, i) => i >= state.notesRevealed && n.unlocks.some((s) => !isSkillUnlocked(state, s)));
  if (at < 1) return null;
  // The next stage is still one of several free choices: don't pretend to know which.
  const left = middleParts(state).slice(Math.max(0, at - MIDDLE_AT[0]));
  if ((MIDDLE_AT as readonly number[]).includes(at) && left.length > 1) {
    return (
      <div className="skill-item is-next" aria-label="Next: you choose the next part">
        <span />
        <span className="name">Next skill</span>
        <span />
        <span className="when">Your choice, once this part is placed</span>
      </div>
    );
  }
  const skill = order[at]!.unlocks[0]!;
  const before = order[at - 1]!;
  if (!("goal" in before)) return null;
  const when = before.goal.kind === "place" ? `once ${PART_DEFS[before.goal.part as PartId].name.replace(/^The /, "the ")} is placed` : `after ${taskName(before.goal).toLowerCase()}`;
  return (
    <div className="skill-item is-next" data-skill={skill} aria-label={`Next skill: ${SKILLS[skill].name}, ${when}`}>
      <SkillIcon skill={skill} size={20} />
      <span className="name">{SKILLS[skill].name}</span>
      <span />
      <span className="when">Next · {when}</span>
    </div>
  );
}

const pickUnlocked = (e: FxEvent) => (e.kind === "unlocked" ? e.ids : []);

export function SkillActions({ state, skill, onStart, onStop, act }: { state: GameState; skill: SkillId; onStart: (id: ActionId) => void; onStop: () => void; act: (c: (s: GameState) => Result) => unknown }) {
  const fresh = useRecentFx(pickUnlocked, 5000);
  const level = skillLevel(state, skill);
  const toCap = timeToCapMs(state, skill);
  // Only what can be done now, plus what comes at the next level. Nothing further up shows.
  const shown = revealedRecipes(state, skill);
  const open = shown.filter((id) => ACTION_DEFS[id].level <= level);
  const nextUp = shown.filter((id) => ACTION_DEFS[id].level > level);
  const running = state.active && ACTION_DEFS[state.active.id].skill === skill ? state.active.id : null;
  const next = running ? timeToNextLevelMs(state, running) : null;
  return (
    <div className="skill-actions">
      <section className="panel flush skill-panel" aria-labelledby="skill-heading">
        <header className="skill-head" data-skill={skill}>
          <SkillIcon skill={skill} size={24} />
          <div>
            <h2 id="skill-heading">{SKILLS[skill].name}</h2>
            <p className="meta num">
              Level {level} of {state.levelCap} · {toCap !== null ? `about ${formatDuration(toCap)} to the cap` : "at the cap for now"}
            </p>
          </div>
          <div className="stats">
            <span className="stat">
              <span className="label">XP/h now</span>
              <b className="num">{running ? formatRate(xpPerHour(state, running)) : "—"}</b>
            </span>
            <span className="stat">
              <span className="label">Next level</span>
              <b className="num">{next !== null ? formatDuration(next) : "—"}</b>
            </span>
          </div>
        </header>
        <div className="recipes" data-skill={skill}>
          <div className="recipes-head" aria-hidden="true">
            <span />
            <span className="label">Recipe</span>
            <span className="label r">Lvl</span>
            <span className="label r">Time</span>
            <span className="label r">XP</span>
            <span className="label col-io">Inputs → makes</span>
            <span className="label r col-rate">XP/h</span>
            <span />
          </div>
          {open.map((id) => (
            <RecipeRow key={id} id={id} state={state} onStart={() => onStart(id)} onStop={onStop} fresh={fresh.has(id)} />
          ))}
          {nextUp.map((id) => (
            <RecipeRow key={id} id={id} state={state} onStart={() => onStart(id)} onStop={onStop} />
          ))}
        </div>
        <SkillStock state={state} skill={skill} recipes={open} />
      </section>
      <TalentPanel state={state} skill={skill} act={act} />
    </div>
  );
}

/** One recipe as a table row. The whole row starts it; the running row fills with its colour. */
/**
 * The running row's fill: reads the progress once when it mounts, then a CSS animation carries it
 * across one repetition (like TimedBar). Never updated per tick, so it can't drift.
 */
function RowFill({ progress, durationMs }: { progress: number; durationMs: number }) {
  const [start] = useState(() => ({ duration: Math.max(1, durationMs), elapsed: Math.max(0, Math.min(1, progress)) * Math.max(1, durationMs) }));
  return <span className="row-fill" aria-hidden="true" style={{ animationDuration: `${start.duration}ms`, animationDelay: `-${start.elapsed}ms` }} />;
}

function RecipeRow({ id, state, onStart, onStop, fresh }: { id: ActionId; state: GameState; onStart: () => void; onStop: () => void; fresh?: boolean }) {
  const def = ACTION_DEFS[id];
  if (!isRecipeKnown(state, id)) {
    return (
      <div className="recipe is-unknown" data-skill={def.skill}>
        <ScrollIcon size={16} />
        <span className="span">
          Unknown recipe · <span className="num">Lvl {def.level}</span> · learned from a burnt page
        </span>
      </div>
    );
  }
  const blocked = blockReason(state, id);
  const locked = blocked?.kind === "level_too_low";
  const running = state.active?.id === id;
  const inputs = Object.entries(actionInputs(state, id)) as [ItemId, number][];
  const ms = actionDurationMs(state, id);
  const reps = state.stats.completed[id] ?? 0;
  return (
    <div
      data-skill={def.skill}
      className={`recipe ${locked ? "is-locked" : ""} ${running ? "is-running" : ""} ${fresh ? "is-fresh" : ""} ${!running && blocked === null ? "can-start" : ""}`}
      // The whole row starts it (the Start button is there for the keyboard; chips have their own menus).
      onClick={() => !running && blocked === null && onStart()}
    >
      {/* Same clock as the top bar: keyed per repetition and speed, so the two restart together. */}
      {running && <RowFill key={`${id}:${reps}:${Math.round(ms)}`} progress={state.active!.progress} durationMs={ms} />}
      <SkillIcon skill={def.skill} size={18} />
      <span className="name">
        {def.name}
        {fresh && <span className="new">New</span>}
      </span>
      <span className="r num" title={`Opens at ${SKILLS[def.skill].name} level ${def.level}`}>
        {def.level}
      </span>
      <span className="r num">
        {+(ms / 1000).toFixed(1)}
        <span className="unit">s</span>
      </span>
      <span className="r num">{def.xp}</span>
      <span className="io">
        {inputs.map(([item, qty]) => (
          <ItemChip key={item} item={item} need={qty} />
        ))}
        {inputs.length > 0 && (
          <span className="io-arrow" aria-label="makes">
            →
          </span>
        )}
        {/* What you really get: talents, projects and buffs applied (marked when they changed it). */}
        {effectiveOutputs(state, id).map((o) => (
          <ItemChip key={o.item} item={o.item} qty={o.qty} chance={o.chance} boostedBy={o.changedBy} />
        ))}
        {def.buff && (
          // A minor rite that gives an effect instead of an item: say exactly what it does.
          <span className="chip buff-out" title={`Each completion: ${buffEffects(def.buff as BuffId).join(", ")} for ${buffDuration(def.buff as BuffId)} (refreshes, never stacks)`}>
            {BUFFS[def.buff as BuffId].name}: {buffEffects(def.buff as BuffId).join(", ")} · {buffDuration(def.buff as BuffId)}
          </span>
        )}
      </span>
      <span className="r num col-rate" title={rateTitle(state, id)}>
        {locked ? "" : formatRate(xpPerHour(state, id))}
      </span>
      <span className="ctl">
        {running ? (
          <>
            <span className="ctl-time num">{(((1 - state.active!.progress) * ms) / 1000).toFixed(1)}s</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onStop();
              }}
            >
              Stop
            </button>
          </>
        ) : blocked ? (
          <button className="btn btn-sm" disabled title={formatStop(blocked)}>
            {startLabel(state, id, blocked)}
          </button>
        ) : (
          <button
            className="btn btn-start btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
          >
            Start
          </button>
        )}
      </span>
    </div>
  );
}

/** The rates behind a row, for its tooltip: output per hour and, while running, what's left. */
function rateTitle(state: GameState, id: ActionId): string {
  const main = outputPerHour(state, id)[0];
  const last = inputsLastMs(state, id);
  const next = timeToNextLevelMs(state, id);
  return [
    main && `${formatRate(main.perHour)} ${ITEMS[main.item].name.toLowerCase()}/h`,
    `${formatRate(xpPerHour(state, id))} xp/h`,
    next !== null && `next level in ${formatDuration(next)}`,
    last !== null && `inputs last ${formatDuration(last)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

const STOCK_ROWS = 5;

/**
 * This skill's stock, in two lists: Inputs (what its open recipes use, short ones first, with
 * "need N") and Made here (what it makes that it doesn't use itself). Five rows, then Show all.
 */
function SkillStock({ state, skill, recipes }: { state: GameState; skill: SkillId; recipes: ActionId[] }) {
  const [open, setOpen] = useState<"in" | "out" | null>(null);
  const needs = new Map<ItemId, number>();
  const made = new Set<ItemId>();
  for (const id of recipes) {
    if (!isRecipeKnown(state, id)) continue;
    for (const [item, qty] of Object.entries(actionInputs(state, id)) as [ItemId, number][]) needs.set(item, Math.max(needs.get(item) ?? 0, qty));
    for (const o of ACTION_DEFS[id].outputs) if (o.chance === undefined || o.chance >= 0.05) made.add(o.item);
  }
  const have = (item: ItemId) => state.inventory[item] ?? 0;
  const inputs = [...needs].sort((a, b) => Number(have(a[0]) >= a[1]) - Number(have(b[0]) >= b[1]) || have(a[0]) - have(b[0]));
  const outputs = [...made].filter((item) => !needs.has(item)).map((item): [ItemId, number | null] => [item, null]);
  const short = inputs.filter(([item, need]) => have(item) < need).length;
  if (inputs.length === 0 && outputs.length === 0) return null;

  const column = (key: "in" | "out", label: ReactNode, list: [ItemId, number | null][]) => {
    if (list.length === 0) return null;
    const shown = open === key ? list : list.slice(0, STOCK_ROWS);
    return (
      <div className="stock-col">
        <div className="stock-head">
          <span className="label">{label}</span>
          <span className="meta num">{list.length}</span>
        </div>
        <ul className="stock-list">
          {shown.map(([item, need]) => {
            const n = have(item);
            const isShort = need !== null && n < need;
            return (
              <li key={item} className={`${isShort ? "is-short" : ""} ${n === 0 && !isShort ? "is-zero" : ""}`} data-skill={producingSkill(item) ?? undefined}>
                <ItemIcon item={item} size={22} />
                <ItemChip item={item} plain bare />
                <span className="need num">{isShort ? `need ${need}` : ""}</span>
                <b className="num">{n}</b>
              </li>
            );
          })}
        </ul>
        {list.length > STOCK_ROWS && (
          <button className="btn btn-text btn-sm stock-all" onClick={() => setOpen(open === key ? null : key)}>
            {open === key ? "Show fewer" : `Show all ${list.length}`}
          </button>
        )}
      </div>
    );
  };
  return (
    <section className="stock" aria-label={`${SKILLS[skill].name} stock`}>
      {column(
        "in",
        short > 0 ? (
          <>
            Inputs · <span className="warn">{short} short</span>
          </>
        ) : (
          "Inputs"
        ),
        inputs,
      )}
      {column("out", "Made here", outputs)}
    </section>
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
      const need = actionInputs(state, id)[blocked.item] ?? 0;
      return `Needs ${need - (state.inventory[blocked.item] ?? 0)} ${ITEMS[blocked.item].name.toLowerCase()}`;
    }
    case "rite_in_progress":
      return "Rite under way";
    default:
      return formatStop(blocked);
  }
}
