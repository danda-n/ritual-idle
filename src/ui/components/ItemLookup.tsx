import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { ITEM_CATEGORIES, ITEM_DEFS, type ItemCategory, type ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import { lookupItem, producerAction, producingSkill } from "../../engine/estimates";
import { blockReason } from "../../engine/simulate";
import { newGame, type GameState } from "../../engine/state";
import { CATEGORY_ICONS, SkillIcon } from "../art/icons";
import { formatStop, itemName } from "../format";
import { Modal } from "./Modal";

/** What item chips need from the game: the state, a lookup, and a way to start an action. */
export interface ChipActions {
  state: GameState;
  lookup: (item: ItemId) => void;
  start: (id: ActionId) => void;
}

export const ChipContext = createContext<ChipActions>({ state: newGame(0, 0), lookup: () => {}, start: () => {} });

/**
 * An item as a chip, coloured and marked with the skill that makes it.
 * - `qty` alone: an output ("1 Ash"), with an optional drop `chance`.
 * - `need`: an input; shows have/need. Enough is quiet; short is dashed with a warning pill,
 *   and clicking it offers to start the action that makes it.
 * - `plain`: text-style link for lists.
 */
export function ItemChip({ item, qty, need, chance, plain }: { item: ItemId; qty?: number; need?: number; chance?: number; plain?: boolean }) {
  const { state, lookup, start } = useContext(ChipContext);
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const skill = producingSkill(item);
  const have = state.inventory[item] ?? 0;
  const short = need !== undefined && have < need;

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => wrap.current && !wrap.current.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  if (plain) {
    return (
      <button type="button" className="chip item-chip plain" data-skill={skill ?? undefined} onClick={() => lookup(item)} title={`Look up ${itemName(item)}`}>
        {skill && <SkillIcon skill={skill} size={12} />}
        {itemName(item)}
      </button>
    );
  }

  const producer = short ? producerAction(state, item, (id) => blockReason(state, id) === null) : null;
  const producerBlock = producer ? blockReason(state, producer) : null;

  return (
    <span className="item-chip-wrap" ref={wrap}>
      <button
        type="button"
        className={`chip item-chip ${short ? "short" : ""} ${need !== undefined && !short ? "enough" : ""}`}
        data-skill={skill ?? undefined}
        aria-haspopup={short ? "menu" : undefined}
        aria-expanded={short ? menu : undefined}
        onClick={() => (short ? setMenu((m) => !m) : lookup(item))}
        title={short ? `Short of ${itemName(item)}: you have ${have}, need ${need}` : `Look up ${itemName(item)}`}
      >
        {skill && <SkillIcon skill={skill} size={12} />}
        {(need ?? qty) !== undefined && <span className="num">{need ?? qty}</span>}
        <span>{itemName(item)}</span>
        {chance !== undefined && <span className="chip-chance num">{Math.round(chance * 1000) / 10}%</span>}
        {need !== undefined && (
          <span className={`count num ${short ? "count-short" : "count-quiet"}`}>
            {have}/{need}
          </span>
        )}
      </button>
      {menu && (
        <span className="chip-menu" role="menu">
          <span className="chip-menu-title">
            Short {need! - have} {itemName(item).toLowerCase()}
          </span>
          {producer ? (
            <button
              type="button"
              role="menuitem"
              className="btn chip-menu-go"
              data-skill={ACTION_DEFS[producer].skill}
              disabled={producerBlock !== null}
              onClick={() => {
                start(producer);
                setMenu(false);
              }}
            >
              <SkillIcon skill={ACTION_DEFS[producer].skill} size={14} />
              {producerBlock ? `${ACTION_DEFS[producer].name}: ${formatStop(producerBlock).toLowerCase()}` : `Start ${ACTION_DEFS[producer].name.toLowerCase()}`}
            </button>
          ) : (
            <span className="muted chip-menu-note">You don't know how to make this yet.</span>
          )}
          <button
            type="button"
            role="menuitem"
            className="btn btn-ghost"
            onClick={() => {
              lookup(item);
              setMenu(false);
            }}
          >
            Look up
          </button>
        </span>
      )}
    </span>
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
