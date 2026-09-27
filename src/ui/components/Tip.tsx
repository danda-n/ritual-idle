import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Custom tooltips (docs/DESIGN.md "Tooltips"; docs/research/TOOLTIPS.md). The game never uses the
// browser's `title` tooltips. A Tip is extra detail on demand, never the only place for something
// the player needs: why a button is disabled is written on screen instead.

const OPEN_DELAY_MS = 350;
const TOUCH_HOLD_MS = 500;

/** A tooltip's structured content: a title, label/value rows, and a muted note. */
export interface TipContent {
  title?: ReactNode;
  rows?: [ReactNode, ReactNode][];
  note?: ReactNode;
}

/** The card's body, also usable on its own. */
export function TipCard({ title, rows, note }: TipContent) {
  return (
    <>
      {title && <strong className="tip-title">{title}</strong>}
      {rows && rows.length > 0 && (
        <dl className="tip-rows">
          {rows.map(([k, v], i) => (
            <div key={i}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && <p className="tip-note">{note}</p>}
    </>
  );
}

/**
 * Wrap one element to give it a tooltip. It opens after a short hover or on keyboard focus (and on
 * a press-and-hold on touch), sits above the element (below when there's no room), never covers
 * it or catches clicks, and closes on leave, blur or Escape. `content` is a TipContent or any node.
 */
export function Tip({ content, children }: { content: TipContent | ReactNode | null | undefined; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const hold = useRef<number | undefined>(undefined);
  const id = useId();

  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onScroll = () => hide();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);
  // Place it once it has a size: above the anchor, centred, kept on screen.
  useLayoutEffect(() => {
    if (!open || !anchor.current || !card.current) return;
    const a = anchor.current.getBoundingClientRect();
    const c = card.current.getBoundingClientRect();
    const gap = 8;
    const below = a.top - c.height - gap < 8;
    const left = Math.min(Math.max(8, a.left + a.width / 2 - c.width / 2), window.innerWidth - c.width - 8);
    setPos({ left, top: below ? a.bottom + gap : a.top - c.height - gap, below });
  }, [open]);

  if (content === null || content === undefined || !isValidElement(children)) return children;
  const body = typeof content === "object" && content !== null && !isValidElement(content) && ("title" in content || "rows" in content || "note" in content) ? <TipCard {...(content as TipContent)} /> : (content as ReactNode);

  const props = children.props as Record<string, unknown> & { ref?: unknown };
  const call = (name: string, e: unknown) => (props[name] as ((e: unknown) => void) | undefined)?.(e);
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => {
      anchor.current = el;
    },
    "aria-describedby": open ? id : undefined,
    onPointerEnter: (e: PointerEvent) => {
      call("onPointerEnter", e);
      if (e.pointerType === "mouse") show(OPEN_DELAY_MS);
    },
    onPointerLeave: (e: PointerEvent) => {
      call("onPointerLeave", e);
      hide();
    },
    onPointerDown: (e: PointerEvent) => {
      call("onPointerDown", e);
      if (e.pointerType === "touch") hold.current = window.setTimeout(() => setOpen(true), TOUCH_HOLD_MS);
      else hide();
    },
    onPointerUp: (e: PointerEvent) => {
      call("onPointerUp", e);
      window.clearTimeout(hold.current);
    },
    onFocus: (e: FocusEvent) => {
      call("onFocus", e);
      // Keyboard focus only: a mouse click shouldn't pop a card.
      if ((e.target as HTMLElement).matches?.(":focus-visible")) show(0);
    },
    onBlur: (e: FocusEvent) => {
      call("onBlur", e);
      hide();
    },
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={card}
            id={id}
            role="tooltip"
            className={`tip ${pos?.below ? "is-below" : ""}`}
            style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: -9999 }}
          >
            {body}
          </div>,
          document.body,
        )}
    </>
  );
}
