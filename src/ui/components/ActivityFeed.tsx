import { useEffect, useRef, useState } from "react";
import type { FeedEntry } from "../useGame";

/**
 * One quiet line under the top bar: the latest routine event (a step done, a level, an omen).
 * Click it for the last 30. Big moments still get a toast; everything else lands here, so nothing
 * needs clicking away.
 */
export function ActivityFeed({ feed }: { feed: FeedEntry[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const latest = feed[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="feed" ref={wrap}>
      <button type="button" className="feed-line" aria-expanded={open} aria-controls="feed-list" onClick={() => setOpen((o) => !o)} disabled={!latest}>
        <span className="feed-mark" aria-hidden="true">
          ✦
        </span>
        {/* Keyed so each new line fades in; the line itself never changes height. */}
        <span key={latest?.id} className="feed-text" aria-live="polite">
          {latest ? latest.text : "Quiet in the house."}
        </span>
        {feed.length > 1 && <span className="feed-more muted">{open ? "Hide" : "Recent"}</span>}
      </button>
      {open && (
        <ol id="feed-list" className="feed-list">
          {feed.map((e) => (
            <li key={e.id}>
              <span className="num muted feed-time">{new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              {e.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
