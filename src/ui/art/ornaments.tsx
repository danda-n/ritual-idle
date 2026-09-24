// Folk ornaments drawn in code: an embroidery band, a papercut rosette and a sigil divider.
// All decorative (aria-hidden), all currentColor so they follow the tokens.

/** Repeating cross-stitch band (diamonds and stitched ticks), for headers and dividers. */
export function EmbroideryBand({ height = 12, className }: { height?: number; className?: string }) {
  const id = "embroidery-band";
  return (
    <svg className={className} width="100%" height={height} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6h3M21 6h3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 1.5 16.5 6 12 10.5 7.5 6Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 4.2 13.8 6 12 7.8 10.2 6Z" fill="currentColor" />
          <path d="M4.5 3.5l1.5 1.5M4.5 8.5 6 7M19.5 3.5 18 5M19.5 8.5 18 7" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}

/** Eight-petal papercut rosette (wycinanki). */
export function Rosette({ size = 28, className }: { size?: number; className?: string }) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg className={className} width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">
      {petals.map((a) => (
        <path key={a} d="M0 -2.5C2 -5 2 -8.5 0 -11 -2 -8.5 -2 -5 0 -2.5Z" fill="currentColor" transform={`rotate(${a})`} fillOpacity={a % 90 === 0 ? 1 : 0.55} />
      ))}
      <circle r="2" fill="currentColor" />
      <circle r="0.9" fill="var(--color-surface)" />
    </svg>
  );
}

/** Horizontal rule with a small sigil in the middle. */
export function SigilDivider({ className }: { className?: string }) {
  return (
    <div className={`sigil-divider ${className ?? ""}`} aria-hidden="true">
      <span />
      <svg width="14" height="14" viewBox="-7 -7 14 14">
        <path d="M0 -6 6 0 0 6 -6 0Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle r="1.6" fill="currentColor" />
      </svg>
      <span />
    </div>
  );
}
