import type { ReactNode } from "react";
import type { TermId } from "../../content/glossary";
import { Term } from "./Term";

export interface HeroStat {
  label: string;
  /** Explain the label on click (a new word: trust, insight…). */
  term?: TermId;
  value: ReactNode;
  /** In the place colour (the one number that matters most here). */
  accent?: boolean;
}

/**
 * The hero band at the top of a tab: its mark, the place name, one line, and two or three key
 * numbers, with an embroidery band in the place colour (docs/DESIGN.md "Places").
 */
export function PlaceHero({ icon, title, line, stats, term }: { icon: ReactNode; title: string; line?: string; stats: HeroStat[]; term?: TermId }) {
  return (
    <header className="hero">
      <span className="hero-mark" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h1>
          {title}
          {term && <Term id={term} iconOnly />}
        </h1>
        {line && <p className="lore">{line}</p>}
      </div>
      <div className="hero-stats">
        {stats.map((s) => (
          <span key={s.label} className={`hero-stat ${s.accent ? "accent" : ""}`}>
            <span className="label">{s.term ? <Term id={s.term}>{s.label}</Term> : s.label}</span>
            <b className="num">{s.value}</b>
          </span>
        ))}
      </div>
    </header>
  );
}
