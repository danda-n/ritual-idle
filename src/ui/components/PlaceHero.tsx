import type { ReactNode } from "react";

export interface HeroStat {
  label: string;
  value: ReactNode;
  /** In the place colour (the one number that matters most here). */
  accent?: boolean;
}

/**
 * The hero band at the top of a tab: its mark, the place name, one line, and two or three key
 * numbers, with an embroidery band in the place colour (docs/DESIGN.md "Places").
 */
export function PlaceHero({ icon, title, line, stats }: { icon: ReactNode; title: string; line?: string; stats: HeroStat[] }) {
  return (
    <header className="hero">
      <span className="hero-mark" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h1>{title}</h1>
        {line && <p className="lore">{line}</p>}
      </div>
      <div className="hero-stats">
        {stats.map((s) => (
          <span key={s.label} className={`hero-stat ${s.accent ? "accent" : ""}`}>
            <span className="label">{s.label}</span>
            <b className="num">{s.value}</b>
          </span>
        ))}
      </div>
    </header>
  );
}
