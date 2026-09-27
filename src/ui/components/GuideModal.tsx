import { GLOSSARY, type TermId } from "../../content/glossary";
import type { GameState } from "../../engine/state";
import { Modal } from "./Modal";

/**
 * The Guide: every word whose explanation you've read, A to Z, to read again any time (words turn
 * plain once read). Words not met yet stay out; a line says how many are left.
 */
export function GuideModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const seen = (state.settings.termsSeen.filter((t) => t in GLOSSARY) as TermId[]).sort((a, b) => GLOSSARY[a].name.replace(/^The /, "").localeCompare(GLOSSARY[b].name.replace(/^The /, "")));
  const left = Object.keys(GLOSSARY).length - seen.length;
  return (
    <Modal title="Guide" onClose={onClose}>
      {seen.length === 0 ? (
        <p className="muted">Words the game introduces collect here once you've read them. Look for a small "i".</p>
      ) : (
        <dl className="guide-list">
          {seen.map((t) => (
            <div key={t}>
              <dt>{GLOSSARY[t].name}</dt>
              <dd>{GLOSSARY[t].text}</dd>
            </div>
          ))}
        </dl>
      )}
      {left > 0 && <p className="muted guide-left num">{left} more word{left === 1 ? "" : "s"} explain themselves as you meet them.</p>}
      <button className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
}
