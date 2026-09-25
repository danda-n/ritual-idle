import { useEffect, useRef, useState } from "react";
import { onFx, type FxTone } from "../fx";

interface Float {
  id: number;
  text: string;
  tone: FxTone;
  x: number;
  y: number;
  /** Near the top of the screen, floats drift down so they stay visible. */
  down: boolean;
}

const LIFETIME_MS = 1100;
const MAX_FLOATS = 8;
/** Floats from the same spot queue up this far apart, so they rise one after another. */
const GAP_MS = 220;

/** Renders floating feedback labels above everything, positioned at their anchor element. */
export function Floats() {
  const [floats, setFloats] = useState<Float[]>([]);
  const next = useRef(0);
  /** When each anchor may next show a float (a little queue per spot). */
  const nextAt = useRef(new Map<Element, number>());

  useEffect(
    () =>
      onFx((e) => {
        if (e.kind !== "float") return;
        const el = e.anchors.map((a) => document.querySelector(a)).find((x) => x !== null);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        const down = r.top < 90;
        const f: Float = { id: next.current++, text: e.text, tone: e.tone, x: r.left + r.width / 2, y: down ? r.bottom : r.top, down };
        // Queue behind whatever this spot showed last, like a parrot: one after another.
        const now = performance.now();
        const at = Math.max(now, nextAt.current.get(el) ?? 0);
        nextAt.current.set(el, at + GAP_MS);
        setTimeout(() => {
          setFloats((fs) => [...fs.slice(-(MAX_FLOATS - 1)), f]);
          setTimeout(() => setFloats((fs) => fs.filter((x) => x.id !== f.id)), LIFETIME_MS);
        }, at - now);
      }),
    [],
  );

  return (
    <div className="floats" aria-hidden="true">
      {floats.map((f) => (
        <span key={f.id} className={`float tone-${f.tone} ${f.down ? "down" : ""}`} style={{ left: f.x, top: f.y }}>
          {f.text}
        </span>
      ))}
    </div>
  );
}
