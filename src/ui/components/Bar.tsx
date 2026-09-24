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
 * It reads the progress once when it mounts, then the browser animates it at full frame rate:
 * butter smooth, and no work for the game loop. Give it a `key` that changes with each
 * repetition so it starts fresh.
 */
export function TimedBar({ elapsedMs, durationMs, label, thin }: { elapsedMs: number; durationMs: number; label?: string; thin?: boolean }) {
  const [start] = useState(() => ({ elapsed: Math.max(0, Math.min(elapsedMs, durationMs)), duration: Math.max(1, durationMs) }));
  return (
    <span className={`bar ${thin ? "thin" : ""}`} role="progressbar" aria-label={label} aria-valuenow={Math.round((elapsedMs / durationMs) * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className="bar-fill timed" style={{ animationDuration: `${start.duration}ms`, animationDelay: `-${start.elapsed}ms` }} />
    </span>
  );
}
