import { useState } from "react";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { beginRite, primeRite, type Result } from "../../engine/commands";
import { activeBuffs } from "../../engine/modifiers";
import { isRiteRevealed } from "../../engine/progress";
import { canBeginRite, riteFactors, riteLog, riteQuality, riteShortfall } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import type { ItemId } from "../../content/items";
import { CircleRiteIcon } from "../art/icons";
import { formatClock } from "../format";
import { ItemChip } from "./ItemLookup";
import { TimedBar } from "./Bar";

export function RitePanel({ state, act }: { state: GameState; act: (c: (s: GameState) => Result) => unknown }) {
  const [open, setOpen] = useState(false);
  if (!isRiteRevealed(state)) return null;
  const { performing, completed } = state.rite;
  const stillNight = performing?.stillNight ?? activeBuffs(state).some((b) => b.id === "still_night");
  const quality = completed ? completed.quality : riteQuality(state, stillNight);
  const short = riteShortfall(state);
  const metCount = riteFactors(state, stillNight).filter((f) => f.met).length;
  const reason = canBeginRite(state);
  const total = Object.keys(HEARTH_RITE.items).length + Object.keys(HEARTH_RITE.skills).length;
  const readyCount = total - short.items.length - short.skills.length;
  const allReady = readyCount === total;
  // Collapsed to one line until it matters: everything ready, running, done, or opened by the player.
  const expanded = open || allReady || !!performing || !!completed;

  return (
    <section className={`panel paper rite-panel ${performing ? "performing" : ""} ${completed ? "done" : ""} ${allReady && !performing && !completed ? "is-ready" : ""}`} aria-labelledby="rite-heading">
      <div className="panel-title">
        <CircleRiteIcon size={20} />
        <h2 id="rite-heading">{HEARTH_RITE.name}</h2>
        <span className="panel-aside rite-summary num">
          {!completed && !performing && `${readyCount}/${total} ready · `}
          {completed ? "Performed" : "Outcome"}: {QUALITIES[quality]}
          {!allReady && !performing && !completed && (
            <button className="btn btn-ghost rite-toggle" aria-expanded={expanded} onClick={() => setOpen((o) => !o)}>
              {expanded ? "Hide" : "View"}
            </button>
          )}
        </span>
      </div>

      {expanded && !performing && !completed && (
        <>
          <h3>What it needs</h3>
          <ul className="ledger rite-needs">
            {(Object.entries(HEARTH_RITE.items) as [ItemId, number][]).map(([item, need]) => {
              const have = state.inventory[item] ?? 0;
              return (
                <li key={item} className={have >= need ? "met" : ""}>
                  <span>
                    <span aria-hidden="true">{have >= need ? "✓ " : "· "}</span>
                    <ItemChip item={item} plain />
                  </span>
                  <span className="num">
                    {Math.min(have, need)}/{need}
                  </span>
                </li>
              );
            })}
            {Object.entries(HEARTH_RITE.skills).map(([skill, need]) => {
              const missing = short.skills.find((x) => x.skill === skill);
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
          <h3>
            What makes it better · <span className="num">{metCount}</span> of 3 → {QUALITIES[quality]}
          </h3>
          <ul className="factors">
            {riteFactors(state, stillNight).map((f) => (
              <li key={f.label} className={f.met ? "met" : ""}>
                <span aria-hidden="true">{f.met ? "✦" : "◇"}</span> {f.label}
              </li>
            ))}
          </ul>
          <p className="muted">It never fails. 0 = Sound · 1–2 = Fine · all 3 = Resplendent.</p>
          <div className="row">
            <button className="btn btn-primary" disabled={reason !== null} title={reason ?? undefined} onClick={() => act(beginRite)}>
              Begin the rite
            </button>
            <label className="toggle">
              <input type="checkbox" checked={state.rite.primed} onChange={(e) => act((s) => primeRite(s, e.target.checked))} /> Begin by itself when ready
            </label>
          </div>
        </>
      )}

      {performing && (
        <>
          <div className="goal">
            <TimedBar key="rite" elapsedMs={performing.elapsedMs} durationMs={HEARTH_RITE.durationMs} label="Rite progress" />
            <span className="muted num">{formatClock(HEARTH_RITE.durationMs - performing.elapsedMs)}</span>
          </div>
          <RiteLog lines={riteLog(state)} />
        </>
      )}

      {completed && <RiteLog lines={riteLog(state)} />}
    </section>
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
