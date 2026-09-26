import type { ItemId } from "../../content/items";
import { UPGRADES } from "../../content/upgrades";
import { ItemChip } from "./ItemLookup";
import { Modal } from "./Modal";

/**
 * Shown once, after the Light is placed: grandmother points out her bare omen shelf, and with it
 * the house projects. Nothing waits on it; it just makes sure the player knows it's there.
 */
export function ShelfCard({ onGo, onClose }: { onGo: () => void; onClose: () => void }) {
  return (
    <Modal title="Side project: the omen shelf" onClose={onClose} dismissOnBackdrop={false}>
      <p className="task-quote">“My omen shelf is bare. Build it again, and the house will start to notice things.” — grandmother</p>
      <p>
        House projects are optional. You build them once, from things you make, and they help for good. The omen shelf is the first: once it's up, omens start to turn up while you work,
        and you can bless a skill with one for a short, strong push. The first omen comes with the shelf.
      </p>
      <div className="task-needs">
        <span className="muted">Needs</span>
        {(Object.entries(UPGRADES.omen_shelf.items) as [ItemId, number][]).map(([item, qty]) => (
          <ItemChip key={item} item={item} need={qty} />
        ))}
      </div>
      <div className="row">
        <button
          className="btn btn-primary"
          onClick={() => {
            onGo();
            onClose();
          }}
        >
          Show me the projects
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          Later
        </button>
      </div>
    </Modal>
  );
}
