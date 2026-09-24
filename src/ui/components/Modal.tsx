import { useEffect, useId, useRef, type ReactNode } from "react";

/** Open dialogs, newest last: Escape closes only the top one. */
const open: object[] = [];

/**
 * Dialog with focus moved inside on open, Escape to close, and focus restored on close.
 * The setup runs once per opening. `onClose` is read through a ref, because callers often
 * pass a fresh function on every render (the game re-renders 10 times a second), and
 * re-running the setup would steal focus back, closing any open dropdown.
 */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
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

  const id = useId();
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && close.current()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <h2 id={id}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
