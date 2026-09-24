import { ACTION_DEFS } from "../../content/actions";
import type { ItemId } from "../../content/items";
import { OMENS } from "../../content/omens";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import type { CatchUp } from "../../engine/offline";
import { formatDuration, formatStop, itemName } from "../format";
import { Modal } from "./Modal";
import { buffEffects } from "../effects";

export function AwaySummary({ away, onClose }: { away: CatchUp; onClose: () => void }) {
  const { report } = away;
  const gained = (Object.entries(report.itemsGained) as [ItemId, number][]).filter(([, n]) => n > 0);
  return (
    <Modal title="While you were away" onClose={onClose}>
      <p className="muted">
        You were gone {formatDuration(away.awayMs)}.
        {away.capped && ` The house kept working for ${formatDuration(report.elapsedMs)}, the limit for now.`}
      </p>
      {report.actionsCompleted === 0 && report.riteMs === 0 ? (
        <p>Nothing stirred. Leave something running next time.</p>
      ) : report.actionsCompleted === 0 ? null : (
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
      {report.riteStarted && <p>The circle was ready, so the {HEARTH_RITE.name} began by itself.</p>}
      {report.riteMs > 0 && report.riteCompleted === null && <p>The {HEARTH_RITE.name} went on without you ({formatDuration(report.riteMs)}).</p>}
      {report.riteCompleted !== null && (
        <p>
          <strong>The {HEARTH_RITE.name} is complete</strong> ({QUALITIES[report.riteCompleted]}).
        </p>
      )}
      {report.curioStories.map((text, i) => (
        <p key={`c${i}`} className="text-2">
          A curio, read: <em>{text}</em>
        </p>
      ))}
      {report.fragments.length > 0 && (
        <p>
          {report.fragments.length === 1 ? "A hint fragment" : `${report.fragments.length} hint fragments`} went into the Grimoire.
        </p>
      )}
      {report.omensFound.map((o, i) => (
        <p key={i}>
          An omen appeared: <strong>{OMENS[o].name}</strong> ({buffEffects(OMENS[o].buff).join(", ")}). It waits on the shelf.
        </p>
      ))}
      {report.omensLost > 0 && <p className="muted">{report.omensLost === 1 ? "An omen" : `${report.omensLost} omens`} passed unseen; the shelf was full.</p>}
      {report.stopped && report.fellBackTo.length > 0 ? (
        <p className="text-2">
          {formatStop(report.stopped.reason)}, so you went back to {ACTION_DEFS[report.fellBackTo[report.fellBackTo.length - 1]!].name.toLowerCase()}.
        </p>
      ) : (
        report.stopped && <p className="warn">Work stopped: {formatStop(report.stopped.reason)}.</p>
      )}
      <button className="btn btn-primary" onClick={onClose}>
        Back to the house
      </button>
    </Modal>
  );
}
