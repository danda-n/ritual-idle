import { useState } from "react";

/** A progress bar for values that change now and then (XP, goals, insight). Eases between values. */
export function Bar({ value, label, thin }: { value: number; label?: string; thin?: boolean }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <span className={`bar ${thin ? "thin" : ""}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="bar-fill eased" style={{ transform: `scaleX(${pct})` }} />
    </span>
  );
}

/**
 * A progress bar for something that fills at a steady rate (an action repetition, the rite).
 * It reads the progress (0–1) once when it mounts, then the browser animates the rest at full
 * frame rate: butter smooth, and no work for the game loop. `durationMs` is the whole
 * repetition at the current speed. Give it a `key` that changes with each repetition (and with
 * the speed) so it starts fresh.
 */
export function TimedBar({ progress, durationMs, label, thin }: { progress: number; durationMs: number; label?: string; thin?: boolean }) {
  const [start] = useState(() => {
    const duration = Math.max(1, durationMs);
    return { elapsed: Math.max(0, Math.min(1, progress)) * duration, duration };
  });
  return (
    <span className={`bar ${thin ? "thin" : ""}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="bar-fill timed" style={{ animationDuration: `${start.duration}ms`, animationDelay: `-${start.elapsed}ms` }} />
    </span>
  );
}
