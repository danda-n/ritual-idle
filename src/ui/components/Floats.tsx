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

/** Renders floating feedback labels above everything, positioned at their anchor element. */
export function Floats() {
  const [floats, setFloats] = useState<Float[]>([]);
  const next = useRef(0);

  useEffect(
    () =>
      onFx((e) => {
        if (e.kind !== "float") return;
        const el = e.anchors.map((a) => document.querySelector(a)).find((x) => x !== null);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        // A little sideways jitter so repeated floats don't stack exactly.
        const down = r.top < 90;
        const f: Float = { id: next.current++, text: e.text, tone: e.tone, x: r.left + r.width / 2 + (Math.random() - 0.5) * 24, y: down ? r.bottom : r.top, down };
        setFloats((fs) => [...fs.slice(-(MAX_FLOATS - 1)), f]);
        setTimeout(() => setFloats((fs) => fs.filter((x) => x.id !== f.id)), LIFETIME_MS);
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
