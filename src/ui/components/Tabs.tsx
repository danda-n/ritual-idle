import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabDef<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  /** Shows a small dot, e.g. something new to look at. */
  badge?: boolean;
}

/** Accessible tab strip: arrow keys move between tabs, Home/End jump to the ends. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: TabDef<T>[]; value: T; onChange: (id: T) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next]!.id);
    refs.current[next]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={t.id === value}
          aria-controls={`panel-${t.id}`}
          tabIndex={t.id === value ? 0 : -1}
          className="tab"
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.icon}
          {t.label}
          {t.badge && <span className="badge" aria-label="new" />}
        </button>
      ))}
    </div>
  );
}
