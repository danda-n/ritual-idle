import { createContext, useContext, type ReactNode } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { ITEM_CATEGORIES, ITEM_DEFS, type ItemCategory, type ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import { lookupItem } from "../../engine/estimates";
import type { GameState } from "../../engine/state";
import { CATEGORY_ICONS } from "../art/icons";
import { itemName } from "../format";
import { Modal } from "./Modal";

/** Any item name in the game can be clicked to look it up. */
export const LookupContext = createContext<(item: ItemId) => void>(() => {});

export function ItemChip({ item, className = "", children }: { item: ItemId; className?: string; children?: ReactNode }) {
  const open = useContext(LookupContext);
  return (
    <button type="button" className={`chip item-chip ${className}`} onClick={() => open(item)} title={`Look up ${itemName(item)}`}>
      {children ?? itemName(item)}
    </button>
  );
}

export function ItemLookupModal({ state, item, onClose }: { state: GameState; item: ItemId; onClose: () => void }) {
  const def = ITEM_DEFS[item];
  const l = lookupItem(state, item);
  const Icon = CATEGORY_ICONS[def.category as ItemCategory];
  const actionLabel = (id: keyof typeof ACTION_DEFS) => `${ACTION_DEFS[id].name} (${SKILLS[ACTION_DEFS[id].skill].name})`;
  return (
    <Modal title={def.name} onClose={onClose}>
      <p className="muted lookup-category">
        <Icon size={16} /> {ITEM_CATEGORIES[def.category as ItemCategory].name} · you hold <span className="num">{state.inventory[item] ?? 0}</span>
      </p>
      {def.description && <p className="note-quote">{def.description}</p>}
      <dl className="lookup">
        <dt>Comes from</dt>
        <dd>
          {l.madeBy.length === 0 && !l.sold ? <span className="muted">Not something you know how to get yet.</span> : null}
          {l.madeBy.map((id) => (
            <span key={id}>{actionLabel(id)}</span>
          ))}
          {l.sold && <span>The village shop</span>}
        </dd>
        <dt>Used for</dt>
        <dd>
          {l.usedBy.length === 0 && l.inRite === 0 && l.wantedBy.length === 0 && l.inRecipes.length === 0 && <span className="muted">Nothing you know of yet.</span>}
          {l.usedBy.map((id) => (
            <span key={id}>{actionLabel(id)}</span>
          ))}
          {l.inRite > 0 && <span>The Kindling of the Hearth-Circle (×{l.inRite})</span>}
          {l.wantedBy.map((who) => (
            <span key={who}>A request from {who}</span>
          ))}
          {l.inRecipes.map((name) => (
            <span key={name}>{name} (Grimoire)</span>
          ))}
        </dd>
      </dl>
      <button className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
}
