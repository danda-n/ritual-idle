import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACTION_DEFS } from "../../content/actions";
import { ITEM_CATEGORIES, ITEM_DEFS, type ItemCategory, type ItemId } from "../../content/items";
import { SKILLS } from "../../content/skills";
import { lookupItem, producerAction, producingSkill } from "../../engine/estimates";
import { blockReason } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { useChipActions } from "../chipContext";
import { CATEGORY_ICONS, SkillIcon } from "../art/icons";
import { ItemIcon } from "../art/items";
import { formatStop, itemName } from "../format";
import { Modal } from "./Modal";

/** A chip's tooltip: "Look up Mugwort · The dream-herb." (item descriptions are puzzle bridges). */
const lookUpTitle = (item: ItemId) => `Look up ${itemName(item)}${ITEM_DEFS[item].description ? ` · ${ITEM_DEFS[item].description}` : ""}`;

/**
 * An item as a chip, coloured and marked with the skill that makes it.
 * - `qty` alone: an output ("1 Ash"), with an optional drop `chance`. `boostedBy` names what raised
 *   the numbers shown (a talent, project or buff): they're marked, and the hover title says why.
 * - `need`: an input; shows have/need. Enough is quiet; short is dashed with a warning pill,
 *   and clicking it offers to start the action that makes it.
 * - `plain`: text-style link for lists (`bare` drops its icon, where the list draws its own).
 */
export function ItemChip({ item, qty, need, chance, plain, bare, boostedBy }: { item: ItemId; qty?: number; need?: number; chance?: number; plain?: boolean; bare?: boolean; boostedBy?: string[] }) {
  const { state, lookup, start } = useChipActions();
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const skill = producingSkill(item);
  const have = state.inventory[item] ?? 0;
  const short = need !== undefined && have < need;

  // The menu lives on its own top layer (a portal), placed under the chip, so rows below
  // can't cover it or catch its clicks. It closes on an outside click, Escape, scroll or resize.
  useLayoutEffect(() => {
    if (!menu || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 316) });
  }, [menu]);
  useEffect(() => {
    if (!menu) return;
    const inside = (t: EventTarget | null) => !!t && (wrap.current?.contains(t as Node) || menuRef.current?.contains(t as Node));
    const onDown = (e: MouseEvent) => !inside(e.target) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const close = () => setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  if (plain) {
    return (
      <button
        type="button"
        className="chip item-chip plain"
        data-skill={skill ?? undefined}
        onClick={(e) => {
          e.stopPropagation();
          lookup(item);
        }}
        title={lookUpTitle(item)}
      >
        {!bare && <ItemIcon item={item} size={15} />}
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
        className={`chip item-chip ${short ? "short" : ""} ${need !== undefined && !short ? "enough" : ""} ${boostedBy?.length ? "boosted" : ""}`}
        data-skill={skill ?? undefined}
        aria-haspopup={short ? "menu" : undefined}
        aria-expanded={short ? menu : undefined}
        onClick={(e) => {
          // Chips live inside clickable rows: keep the click here.
          e.stopPropagation();
          if (short) setMenu((m) => !m);
          else lookup(item);
        }}
        title={short ? `Short of ${itemName(item)}: you have ${have}, need ${need}` : boostedBy?.length ? `${lookUpTitle(item)} · raised by ${boostedBy.join(", ")}` : lookUpTitle(item)}
      >
        <ItemIcon item={item} size={15} />
        {(need ?? qty) !== undefined && <span className="num">{need ?? qty}</span>}
        <span>{itemName(item)}</span>
        {chance !== undefined && <span className="chip-chance num">{Math.round(chance * 1000) / 10}%</span>}
        {need !== undefined && (
          <span className={`count num ${short ? "count-short" : "count-quiet"}`}>
            {have}/{need}
          </span>
        )}
      </button>
      {menu &&
        pos &&
        createPortal(
        // A portal still bubbles clicks to the row in React: stop them here.
        <span className="chip-menu" role="menu" ref={menuRef} style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
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
            <span className="muted chip-menu-note">Recipe unknown</span>
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
        </span>,
          document.body,
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
      {def.description && <p>{def.description}</p>}
      <dl className="lookup">
        <dt>Comes from</dt>
        <dd>
          {l.madeBy.length === 0 && !l.sold ? <span className="muted">Unknown</span> : null}
          {l.madeBy.map((id) => (
            <span key={id}>{actionLabel(id)}</span>
          ))}
          {l.sold && <span>The village shop</span>}
        </dd>
        <dt>Used for</dt>
        <dd>
          {l.usedBy.length === 0 && l.inKindling === 0 && l.wantedBy.length === 0 && l.inRecipes.length === 0 && !l.inUnfound && <span className="muted">Nothing known</span>}
          {l.usedBy.map((id) => (
            <span key={id}>{actionLabel(id)}</span>
          ))}
          {l.inKindling > 0 && <span>The Kindling of the Hearth-Circle (×{l.inKindling})</span>}
          {l.wantedBy.map((who) => (
            <span key={who}>A request from {who}</span>
          ))}
          {l.inRecipes.map((name) => (
            <span key={name}>{name} (Grimoire)</span>
          ))}
          {l.inUnfound && <span className="tease">Something you haven't found yet</span>}
        </dd>
      </dl>
      <button className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
}
