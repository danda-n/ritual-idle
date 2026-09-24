export function Bar({ value, label, thin }: { value: number; label?: string; thin?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span
      className={`bar ${thin ? "thin" : ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="bar-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}
