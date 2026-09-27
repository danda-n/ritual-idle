import { KEEPSAKE_PICKS } from "../../content/keepsakes";
import { HEARTH_RITE, OFFERINGS, QUALITIES, type OfferingId } from "../../content/rite";
import { canOffer, offeringsMet, qualityFor } from "../../engine/rite";
import type { GameState } from "../../engine/state";
import { Term } from "./Term";

const keepsakes = (n: number) => (n === 1 ? "choose 1 keepsake" : `choose ${n} keepsakes`);

/** What each quality gives, beyond the story rewards every rite gets. */
const GIVES = [
  "The story rewards",
  `+ ${keepsakes(KEEPSAKE_PICKS[1])}`,
  `+ ${keepsakes(KEEPSAKE_PICKS[2])} and the ${HEARTH_RITE.resplendentCosmetic}`,
];

/**
 * The rite's quality, laid out: the three offerings (✓ counted or ○ not yet, what each is and how
 * to get it), then the ladder Sound → Fine → Resplendent with the current one marked and what each
 * adds. Before the rite, the hearth candle is a checkbox (`candle`); during and after, it's fixed.
 * `done` is a finished rite: its recorded quality and the offerings that counted.
 */
export function QualityLadder({ state, chosen, candle, done }: { state: GameState; chosen?: readonly OfferingId[]; candle?: { checked: boolean; onChange: (on: boolean) => void }; done?: { quality: number; offered?: readonly OfferingId[] } }) {
  const met = done ? (done.offered ?? []) : offeringsMet(state, chosen);
  const quality = done?.quality;
  const now = quality ?? qualityFor(met.length);
  return (
    <div className="quality-ladder">
      <ul className="offerings" aria-label="Offerings">
        {OFFERINGS.map((o) => {
          const on = met.includes(o.id);
          const blocked = "item" in o ? canOffer(state, o.id) : null;
          return (
            <li key={o.id} className={on ? "is-met" : ""}>
              {/* The candle's checkbox is its own mark before the rite. */}
              <span className="offering-mark" aria-hidden="true">
                {"item" in o && candle ? "" : on ? "✓" : "○"}
              </span>
              <span className="offering-body">
                {"item" in o && candle ? (
                  <label className="toggle">
                    <input type="checkbox" checked={candle.checked} disabled={blocked !== null} onChange={(e) => candle.onChange(e.target.checked)} /> <strong>{o.label}</strong>
                  </label>
                ) : (
                  <strong>{o.label}</strong>
                )}
                <span className="muted">
                  {o.how}
                  {blocked && candle ? ` · ${blocked}` : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <ol className="ladder" aria-label="Rite quality">
        {QUALITIES.map((q, i) => (
          <li key={q} className={`${i === now ? "is-now" : ""} ${i < now ? "is-past" : ""} ${i === QUALITIES.length - 1 ? "is-top" : ""}`} aria-current={i === now ? "true" : undefined}>
            <span className="ladder-name">{q}</span>
            <span className="ladder-need num">{i === 0 ? "no offerings" : i === 1 ? "1–2 offerings" : "all 3"}</span>
            <span className="ladder-gives">{GIVES[i]}</span>
          </li>
        ))}
      </ol>
      <p className="muted ladder-note">
        <Term id="quality">Quality</Term> never changes the story rewards, and the rite can't fail.
      </p>
    </div>
  );
}
