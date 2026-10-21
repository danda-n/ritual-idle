import { useEffect, useId, useRef, type ReactNode } from "react";

/** Open dialogs, newest last: Escape closes only the top one. */
const open: object[] = [];

/**
 * Dialog with focus moved inside on open, Escape to close, and focus restored on close.
 * The setup runs once per opening. `onClose` is read through a ref, because callers often
 * pass a fresh function on every render (the game re-renders 10 times a second), and
 * re-running the setup would steal focus back, closing any open dropdown.
 */
export function Modal({ title, onClose, children, dismissOnBackdrop = true, className = "", backdropClassName = "", headless = false }: { title: string; onClose: () => void; children: ReactNode; dismissOnBackdrop?: boolean; className?: string; backdropClassName?: string; /** The children bring their own heading (its id is `modalHeadingId(title)`), for dialogs laid out differently. */ headless?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const me = {};
    open.push(me);
    ref.current?.querySelector<HTMLElement>("button, [href], input, textarea, select")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && open[open.length - 1] === me && close.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      open.splice(open.indexOf(me), 1);
      previous?.focus();
    };
  }, []);

  const own = useId();
  const id = headless ? modalHeadingId(title) : own;
  return (
    <div className={`modal-backdrop ${backdropClassName}`} onClick={(e) => dismissOnBackdrop && e.target === e.currentTarget && close.current()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        {!headless && <h2 id={id}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

/** The heading id a headless dialog's own heading uses. */
export function modalHeadingId(title: string): string {
  return `dlg-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
