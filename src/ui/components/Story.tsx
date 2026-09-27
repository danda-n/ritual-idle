import type { ReactNode } from "react";

/**
 * Story, one click away and never in the way: a collapsed "Story" disclosure with the lines inside,
 * in grandmother's serif. Used by the task card, the discovery dialog, the chapter end and the
 * Grimoire journal (where `summary` is the entry's one-line title).
 */
export function Story({ lines, summary = "Story", meta }: { lines: readonly string[]; summary?: ReactNode; meta?: ReactNode }) {
  if (lines.length === 0) return null;
  return (
    <details className="story">
      <summary>
        {summary}
        {meta && <span className="muted story-meta">{meta}</span>}
      </summary>
      <div className="story-text">
        {lines.map((l) => (
          <p key={l} className="lore sm">
            {l}
          </p>
        ))}
      </div>
    </details>
  );
}
