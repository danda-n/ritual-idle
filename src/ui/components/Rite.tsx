import { useEffect, useRef, useState } from "react";
import type { ItemId } from "../../content/items";
import { HEARTH_RITE, PART_DEFS, RITE_MS, TEND_MAX_MS, TEND_MS, type OfferingId, type PartId } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { beginRite, tendRite, type Result } from "../../engine/commands";
import { canBeginRite, canOffer, ritePhases, riteShortfall } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { ItemIcon } from "../art/items";
import { CircleRiteIcon } from "../art/icons";
import { formatClock } from "../format";
import { TimedBar } from "./Bar";
import { QualityLadder } from "./QualityLadder";
import { Term } from "./Term";

type Act = (c: (s: GameState) => Result) => unknown;

/**
 * All five parts placed: the rite is ready. A banner that says so plainly, what it needs
 * (Ritualism 3), the optional offerings and quality ladder, and the one red button.
 * Shown on the House (in place of its hero) and on the Circle.
 */
export function RiteReady({ state, act }: { state: GameState; act: Act }) {
  const [candle, setCandle] = useState(false);
  const short = riteShortfall(state).skills;
  const reason = canBeginRite(state);
  const chosen: OfferingId[] = candle && canOffer(state, "hearth_candle") === null ? ["hearth_candle"] : [];
  return (
    <section className={`rite-ready ${reason === null ? "is-ready" : ""}`} aria-labelledby="rite-ready-heading">
      <div className="rite-ready-head">
        <CircleRiteIcon size={28} />
        <div>
          <h2 id="rite-ready-heading">The Circle is ready. Wake it.</h2>
          <p className="rite-ready-sub">
            {HEARTH_RITE.name} · {Math.round(RITE_MS / 60_000)} min, less if you tend it · runs offline · can't fail
          </p>
        </div>
      </div>
      <ul className="rite-needs">
        {Object.entries(HEARTH_RITE.skills).map(([skill, need]) => {
          const missing = short.find((x) => x.skill === skill);
          return (
            <li key={skill} className={missing ? "" : "is-met"}>
              <span aria-hidden="true">{missing ? "○" : "✓"}</span> {SKILLS[skill as keyof typeof SKILLS].name} {need}
              <span className="num muted"> {missing ? `(you have ${missing.have})` : ""}</span>
            </li>
          );
        })}
        <li className="is-met">
          <span aria-hidden="true">✓</span> All five parts in the Circle
        </li>
      </ul>
      <h3>
        <Term id="offering">Offerings</Term> <span className="muted">(optional)</span>
      </h3>
      <QualityLadder state={state} chosen={chosen} candle={{ checked: candle, onChange: setCandle }} />
      <button className="btn btn-primary btn-lg" disabled={reason !== null} title={reason ?? undefined} onClick={() => act((s) => beginRite(s, chosen))}>
        Begin the rite
      </button>
      {reason && <p className="muted">{reason}</p>}
    </section>
  );
}

/** What you tend in each phase: an item's picture and what clicking it does. */
const TEND: Record<PartId, { item: ItemId; verb: string }> = {
  light: { item: "tallow_candle", verb: "Light a wick" },
  ward: { item: "salt", verb: "Close the salt" },
  smoke: { item: "smudge", verb: "Fan the smoke" },
  words: { item: "deciphered_page", verb: "Read a word" },
  offering: { item: "bread", verb: "Set down bread" },
};

type Target = { id: number; x: number; y: number; born: number };
const SPAWN_MS = 1_200;
const LIFE_MS = 3_000;
const MAX_TARGETS = 3;

/**
 * The rite under way, as the focus: the phase in big letters and its line, the time left, and a
 * field where things to tend appear (wicks, gaps in the salt, smoke, words, bread). Each one
 * clicked takes a few seconds off, up to half the rite. Nothing is lost by not tending: switch
 * away and it runs its full length. Targets are drawn by the UI only; the engine just counts time.
 */
export function RiteScene({ state, act, compact = false }: { state: GameState; act: Act; compact?: boolean }) {
  const p = state.rite.performing!;
  const phaseIndex = Math.min(p.phase, HEARTH_RITE.phases.length - 1);
  const phase = HEARTH_RITE.phases[phaseIndex]!;
  const tend = TEND[phase.part];
  const done = p.phase * HEARTH_RITE.phaseMs + p.phaseMs + p.bankMs;
  const left = RITE_MS - done;
  const canTend = p.tendedMs < TEND_MAX_MS;

  const [targets, setTargets] = useState<Target[]>([]);
  const [bursts, setBursts] = useState<Target[]>([]);
  const next = useRef(1);
  useEffect(() => {
    if (!canTend) {
      setTargets([]);
      return;
    }
    const spawn = setInterval(() => {
      const now = Date.now();
      setTargets((ts) => {
        const alive = ts.filter((t) => now - t.born < LIFE_MS);
        if (alive.length >= MAX_TARGETS || document.visibilityState === "hidden") return alive;
        return [...alive, { id: next.current++, x: 8 + Math.random() * 84, y: 12 + Math.random() * 70, born: now }];
      });
    }, SPAWN_MS);
    return () => clearInterval(spawn);
  }, [canTend]);

  const hit = (t: Target) => {
    setTargets((ts) => ts.filter((x) => x.id !== t.id));
    setBursts((bs) => [...bs, { ...t, born: Date.now() }]);
    setTimeout(() => setBursts((bs) => bs.filter((b) => b.id !== t.id)), 700);
    act(tendRite);
  };

  return (
    <section className={`rite-scene ${compact ? "is-compact" : ""}`} data-skill={PART_DEFS[phase.part].skill} aria-labelledby="rite-scene-heading">
      <header className="rite-scene-head">
        <span className="label">
          Phase {p.phase + 1} of {HEARTH_RITE.phases.length}
        </span>
        <h2 id="rite-scene-heading">{PART_DEFS[phase.part].name}</h2>
        <p className="rite-line">{phase.log}</p>
      </header>
      <div className="rite-time">
        <TimedBar key={`phase${p.phase}:${Math.round(p.tendedMs)}`} progress={Math.min(1, (p.phaseMs + p.bankMs) / HEARTH_RITE.phaseMs)} durationMs={HEARTH_RITE.phaseMs} label="Phase progress" />
        <span className="num">{formatClock(left)} left</span>
      </div>
      <div className="rite-field" role="group" aria-label="Tend the rite">
        {targets.map((t) => (
          <button key={t.id} type="button" className="rite-target" style={{ left: `${t.x}%`, top: `${t.y}%`, animationDuration: `${LIFE_MS}ms` }} onClick={() => hit(t)} aria-label={`${tend.verb} (−${TEND_MS / 1000}s)`} title={tend.verb}>
            <ItemIcon item={tend.item} size={26} />
          </button>
        ))}
        {bursts.map((b) => (
          <span key={`b${b.id}`} className="rite-burst num" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden="true">
            −{TEND_MS / 1000}s
          </span>
        ))}
        {targets.length === 0 && (
          <p className="rite-field-hint muted">{canTend ? `${tend.verb}: click what appears to hurry the rite` : "Tended as far as it goes. The rite finishes on its own."}</p>
        )}
      </div>
      <p className="rite-foot muted">
        <span className="num">
          Time taken off: {formatClock(p.tendedMs)} of {formatClock(TEND_MAX_MS)}
        </span>{" "}
        · optional · leave any time, it keeps going
      </p>
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
    </section>
  );
}
