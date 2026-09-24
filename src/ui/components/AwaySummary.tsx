import type { ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import type { CatchUp } from "../../engine/offline";
import { formatDuration, formatStop, itemName } from "../format";
import { Modal } from "./Modal";

export function AwaySummary({ away, onClose }: { away: CatchUp; onClose: () => void }) {
  const { report } = away;
  const gained = (Object.entries(report.itemsGained) as [ItemId, number][]).filter(([, n]) => n > 0);
  return (
    <Modal title="While you were away" onClose={onClose}>
      <p className="muted">
        You were gone {formatDuration(away.awayMs)}.
        {away.capped && ` The house kept working for ${formatDuration(report.elapsedMs)}, the limit for now.`}
      </p>
      {report.actionsCompleted === 0 ? (
        <p>Nothing stirred. Leave something running next time.</p>
      ) : (
        <>
          {report.levelUps.map((l) => (
            <p key={l.skill}>
              {SKILLS[l.skill].name} rose from <span className="num">{l.from}</span> to <span className="num">{l.to}</span>.
            </p>
          ))}
          <ul className="ledger">
            {gained.map(([item, n]) => (
              <li key={item}>
                <span>{itemName(item)}</span>
                <span className="num">+{n}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {report.notesRevealed.map((n) => (
        <blockquote key={n.text} className="note-quote">
          {n.text}
        </blockquote>
      ))}
      {report.pagesRead.map((p) => (
        <p key={p.title}>
          Page deciphered: <strong>{p.title}</strong>
        </p>
      ))}
      {report.stopped && <p className="warn">Work stopped: {formatStop(report.stopped.reason)}.</p>}
      <button className="btn btn-primary" onClick={onClose}>
        Back to the house
      </button>
    </Modal>
  );
}
