import { GRIMOIRE_DEFS, type GrimoireId } from "../../content/grimoire";
import { Rosette } from "../art/ornaments";
import { Modal } from "./Modal";
import { Story } from "./Story";

/** A discovery: the rosette and the reward. The reveal line is one click away, under "Story". */
export function DiscoveryModal({ id, onClose }: { id: GrimoireId; onClose: () => void }) {
  const def = GRIMOIRE_DEFS[id];
  return (
    <Modal title={`Discovered: ${def.name}`} onClose={onClose}>
      <div className="discovery-mark bloom" aria-hidden="true">
        <Rosette size={72} />
      </div>
      <p className="effect-line big">{def.rewardText}</p>
      {def.opens && <p className="muted">{def.opens}</p>}
      <Story lines={[def.reveal]} />
      <button className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
}
