import { GRIMOIRE_DEFS, type GrimoireId } from "../../content/grimoire";
import { Rosette } from "../art/ornaments";
import { Modal } from "./Modal";

export function DiscoveryModal({ id, onClose }: { id: GrimoireId; onClose: () => void }) {
  const def = GRIMOIRE_DEFS[id];
  return (
    <Modal title={`Discovered: ${def.name}`} onClose={onClose}>
      <div className="discovery-mark" aria-hidden="true">
        <Rosette size={56} />
      </div>
      <p className="note-quote">{def.reveal}</p>
      <p>
        <strong>What it does:</strong> {def.rewardText}
      </p>
      <p className="muted">Written into the Grimoire. It stays found, whatever comes.</p>
      <button className="btn btn-primary" onClick={onClose}>
        Close the book
      </button>
    </Modal>
  );
}
