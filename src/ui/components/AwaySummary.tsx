import { noteTitle } from "../tasks";
import { ACTION_DEFS } from "../../content/actions";
import type { ItemId } from "../../content/items";
import { OMENS } from "../../content/omens";
import { QUALITIES } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import type { CatchUp } from "../../engine/offline";
import { formatDuration, formatStop, itemName } from "../format";
import { Modal } from "./Modal";
import { Tip } from "./Tip";
import { buffEffects } from "../effects";
import { FOE_DEFS, type FoeId } from "../../content/combat";

export function AwaySummary({ away, onClose }: { away: CatchUp; onClose: () => void }) {
  const { report } = away;
  const gained = (Object.entries(report.itemsGained) as [ItemId, number][]).filter(([, n]) => n > 0);
  return (
    <Modal title="While you were away" onClose={onClose}>
      <p className="muted num">
        Away {formatDuration(away.awayMs)}
        {away.capped && ` · simulated ${formatDuration(report.elapsedMs)} (cap)`}
      </p>
      {report.actionsCompleted === 0 && report.riteMs === 0 && !report.fight.stoppedAway ? (
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
      <CellarLine report={report} />
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
        {/* One line per kind of omen, with a count (two Still Nights read "Still Night ×2"). */}
        {[...new Set(report.omensFound)].map((o) => {
          const n = report.omensFound.filter((x) => x === o).length;
          return (
            <li key={`omen-${o}`}>
              <span>Omen</span>
              <Tip content={{ title: OMENS[o].name, note: `Bless a skill: ${buffEffects(OMENS[o].buff).join(", ")}` }}>
              <span tabIndex={0}>
                {OMENS[o].name}
                {n > 1 ? ` ×${n}` : ""} (on shelf)
              </span>
              </Tip>
            </li>
          );
        })}
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

/** The cellar first (docs/design_handoff/CELLAR.md): foes warded off, remedies used, and how the fight ended. */
function CellarLine({ report }: { report: CatchUp["report"] }) {
  const f = report.fight;
  const beaten = Object.entries(f.beaten) as [FoeId, number][];
  if (beaten.length === 0 && !f.stoppedAway && !f.drivenOff && !f.calmed) return null;
  const name = (id: FoeId) => FOE_DEFS[id].name.replace(/^The sour /, "");
  const parts = [...beaten.filter(([id]) => !FOE_DEFS[id].boss).map(([id, n]) => `${n} ${name(id)}${n === 1 ? "" : "s"} warded off`), ...(f.remediesUsed ? [`${f.remediesUsed} remedies used`] : [])];
  return (
    <p className="away-cellar">
      <span>
        <strong>The cellar:</strong>
        {parts.length > 0 && ` ${parts.join(" · ")}.`}
        {f.calmed && " The Domovoi is calmed."}
        {f.drivenOff && ` Driven off by the ${name(f.drivenOff.foe)}${f.drivenOff.by ? `: ${f.drivenOff.by}` : ""}.`}
        {f.stoppedAway && ` The fight with the ${name(f.stoppedAway)} stopped when you left: only Safe fights go on while you're away.`}
      </span>
    </p>
  );
}
