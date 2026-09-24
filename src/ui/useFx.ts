import { useEffect, useState } from "react";
import { onFx, type FxEvent } from "./fx";

/** Keys that were recently flagged by an fx event (e.g. unlocked action ids), cleared after `ms`. */
export function useRecentFx(pick: (e: FxEvent) => string[], ms: number): Set<string> {
  const [recent, setRecent] = useState<Set<string>>(new Set());
  useEffect(
    () =>
      onFx((e) => {
        const keys = pick(e);
        if (keys.length === 0) return;
        setRecent((r) => new Set([...r, ...keys]));
        setTimeout(() => setRecent((r) => new Set([...r].filter((k) => !keys.includes(k)))), ms);
      }),
    // `pick` is a stable module-level function at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ms],
  );
  return recent;
}

/** A number that counts smoothly to its new value (for the purse). */
export function useCountUp(value: number, ms = 600): number {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (shown === value) return;
    const from = shown;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      setShown(Math.round(from + (value - from) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // Only restart when the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ms]);
  return shown;
}
