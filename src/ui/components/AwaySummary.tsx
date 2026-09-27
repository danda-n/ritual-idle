import { noteTitle } from "../tasks";
import { ACTION_DEFS } from "../../content/actions";
import type { ItemId } from "../../content/items";
import { OMENS } from "../../content/omens";
import { QUALITIES } from "../../content/rite";
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
      <p className="muted num">
        Away {formatDuration(away.awayMs)}
        {away.capped && ` · simulated ${formatDuration(report.elapsedMs)} (cap)`}
      </p>
      {report.actionsCompleted === 0 && report.riteMs === 0 ? (
        <p className="muted">Nothing was running.</p>
      ) : report.actionsCompleted === 0 ? null : (
        <>
          <ul className="ledger">
            {report.levelUps.map((l) => (
              <li key={l.skill}>
                <span>{SKILLS[l.skill].name}</span>
                <span className="num">
                  {l.from} → {l.to}
                </span>
              </li>
            ))}
            {gained.map(([item, n]) => (
              <li key={item}>
                <span>{itemName(item)}</span>
                <span className="num">+{n}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {report.stepsDone.length > 0 && (
        <p>
          Steps done: {report.stepsDone.map((st) => st.label).join(" · ")}
        </p>
      )}
      {report.notesRevealed.map((n) => (
        <p key={n.text}>
          <strong>New: {noteTitle(n)}</strong>
        </p>
      ))}
      {report.pagesRead.map((p) => (
        <p key={p.title}>
          Page deciphered: <strong>{p.title}</strong>
        </p>
      ))}
      <ul className="ledger">
        {report.riteMs > 0 && report.riteCompleted === null && (
          <li>
            <span>Kindling</span>
            <span className="num">+{formatDuration(report.riteMs)}</span>
          </li>
        )}
        {report.riteCompleted !== null && (
          <li>
            <span>Kindling</span>
            <span>done ({QUALITIES[report.riteCompleted]})</span>
          </li>
        )}
        {report.curioStories.length > 0 && (
          <li>
            <span>Curios</span>
            <span className="num">+{report.curioStories.length}</span>
          </li>
        )}
        {report.fragments.length > 0 && (
          <li>
            <span>Insight</span>
            <span className="num">+{report.fragments.reduce((n, f) => n + f.amount, 0)}</span>
          </li>
        )}
        {report.omensFound.map((o, i) => (
          <li key={`omen${i}`}>
            <span>Omen</span>
            <span title={`Bless a skill: ${buffEffects(OMENS[o].buff).join(", ")}`}>{OMENS[o].name} (on shelf)</span>
          </li>
        ))}
        {report.omensLost > 0 && (
          <li>
            <span>Omens lost (shelf full)</span>
            <span className="num">{report.omensLost}</span>
          </li>
        )}
      </ul>
      {report.stopped && report.fellBackTo.length > 0 ? (
        <p className="text-2">
          {formatStop(report.stopped.reason)} → {ACTION_DEFS[report.fellBackTo[report.fellBackTo.length - 1]!].name}
        </p>
      ) : (
        report.stopped && <p className="warn">Work stopped: {formatStop(report.stopped.reason)}</p>
      )}
      <button className="btn btn-primary" onClick={onClose}>
        Back to the house
      </button>
    </Modal>
  );
}
