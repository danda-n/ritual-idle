// Folk ornaments drawn in code: the embroidery band and a papercut rosette.
// Both decorative (aria-hidden) and coloured by the tokens.

/**
 * The embroidery band: a 12px strip of stitch-red diamonds under the top bar. It's a CSS mask
 * (\`--emb\` in tokens/semantic.css) repeated with \`round\`, so it never ends on half a diamond.
 */
export function EmbroideryBand({ className }: { className?: string }) {
  return <span className={`embroidery ${className ?? ""}`} aria-hidden="true" />;
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
      <circle r="0.9" fill="var(--color-band)" />
    </svg>
  );
}
