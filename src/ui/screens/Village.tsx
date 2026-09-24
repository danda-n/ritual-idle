import type { ReactNode } from "react";
import { ACTION_DEFS } from "../../content/actions";
import { ITEMS, type ItemId } from "../../content/items";
import { REQUESTS } from "../../content/requests";
import { SHOP, type ShopId, type UpgradeId } from "../../content/shop";
import { buy, canBuy, declineRequest, fillRequest, hasItems, type Result } from "../../engine/commands";
import { lookupItem } from "../../engine/estimates";
import type { GameState } from "../../engine/state";
import { CandleIcon, CoinIcon, HouseIcon, LeafIcon, MoonIcon } from "../art/icons";
import { ItemChip } from "../components/ItemLookup";
import { upgradeEffect } from "../effects";

type Act = (command: (s: GameState) => Result) => unknown;
const SHOP_IDS = Object.keys(SHOP) as ShopId[];

export function Village({ state, act }: { state: GameState; act: Act }) {
  return (
    <div className="village">
      <section className="panel" aria-labelledby="board-heading">
        <div className="panel-title">
          <HouseIcon size={18} />
          <h2 id="board-heading">Knocks at the door</h2>
          <span className="muted panel-aside num">Trust {Math.floor(state.trust)}</span>
        </div>
        <div className="request-grid">
          {state.board.map((slot, i) =>
            slot.request ? (
              <RequestCard key={i} state={state} index={i} act={act} />
            ) : (
              <div key={i} className="request-card empty">
                <p className="muted">The lane is quiet.</p>
                <p className="muted num">Someone will knock in {Math.max(0, Math.ceil((slot.refillAt - state.lastTickAt) / 1000))}s.</p>
              </div>
            ),
          )}
        </div>
      </section>

      <Shop state={state} act={act} />
    </div>
  );
}

const PROVISIONS = SHOP_IDS.filter((id) => SHOP[id].kind === "item");
const UPGRADES = SHOP_IDS.filter((id) => SHOP[id].kind === "upgrade") as UpgradeId[];
const UPGRADE_ICONS: Record<UpgradeId, (p: { size?: number }) => ReactNode> = {
  drying_rack: LeafIcon,
  reading_lamp: CandleIcon,
  omen_shelf: MoonIcon,
  mended_shutters: HouseIcon,
};

function Shop({ state, act }: { state: GameState; act: Act }) {
  return (
    <section className="panel shop" aria-labelledby="shop-heading">
      <div className="panel-title">
        <CoinIcon size={18} />
        <h2 id="shop-heading">The village shop</h2>
        <span className="panel-aside purse-small num">
          <CoinIcon size={14} /> {Math.floor(state.coin)}
        </span>
      </div>

      <h3 className="shop-group">Provisions</h3>
      <ul className="shop-list">
        {PROVISIONS.map((id) => {
          const entry = SHOP[id];
          if (entry.kind !== "item") return null;
          const use = lookupItem(state, entry.item);
          const purpose = use.inRite > 0 ? "Needed for the Kindling's offering" : use.usedBy.length > 0 ? `For ${ACTION_DEFS[use.usedBy[0]!].name.toLowerCase()}` : entry.description;
          return (
            <li key={id} className="shop-row">
              <div className="shop-info">
                <strong>
                  {ITEMS[entry.item].name} <span className="num muted">×{entry.qty}</span>
                </strong>
                <p className="muted">
                  {purpose} · you hold <span className="num">{state.inventory[entry.item] ?? 0}</span>
                </p>
              </div>
              <BuyButton state={state} id={id} act={act} />
            </li>
          );
        })}
      </ul>

      <h3 className="shop-group">For the house</h3>
      <ul className="shop-list">
        {UPGRADES.map((id) => {
          const entry = SHOP[id];
          if (entry.kind !== "upgrade") return null;
          const owned = state.upgrades.includes(id);
          const Icon = UPGRADE_ICONS[id];
          const skill = "skill" in entry.effect ? entry.effect.skill : undefined;
          return (
            <li key={id} className={`shop-row upgrade ${owned ? "owned" : ""}`} data-skill={skill}>
              <span className="shop-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <div className="shop-info">
                <strong>{entry.name}</strong>
                <p className="shop-effect">{upgradeEffect(entry.effect)}</p>
              </div>
              {owned ? (
                <span className="shop-owned">✓ In the house</span>
              ) : (
                <BuyButton state={state} id={id} act={act} />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BuyButton({ state, id, act }: { state: GameState; id: ShopId; act: Act }) {
  const cost = SHOP[id].cost;
  const reason = canBuy(state, id);
  const short = cost - Math.floor(state.coin);
  if (reason === "Not enough coin.") {
    return (
      <span className="shop-short num" title={`Costs ${cost} coin`}>
        Need {short} more
      </span>
    );
  }
  return (
    <button className="btn shop-buy" disabled={reason !== null} title={reason ?? undefined} onClick={() => act((s) => buy(s, id))}>
      Buy · <CoinIcon size={14} /> <span className="num">{cost}</span>
    </button>
  );
}

function RequestCard({ state, index, act }: { state: GameState; index: number; act: Act }) {
  const req = REQUESTS[state.board[index]!.request!];
  const needs = Object.entries(req.needs) as [ItemId, number][];
  const ready = hasItems(state, req.needs);
  return (
    <article className={`request-card paper ${ready ? "ready" : ""}`}>
      <h3>{req.from}</h3>
      <p className="note-quote">{req.text}</p>
      <div className="action-io">
        {needs.map(([item, qty]) => (
          <ItemChip key={item} item={item} need={qty} />
        ))}
      </div>
      <p className="muted num">
        Pays {req.coin} coin · +{req.trust} trust
      </p>
      <div className="row">
        <button className="btn btn-primary" disabled={!ready} onClick={() => act((s) => fillRequest(s, index))}>
          Help them
        </button>
        <button className="btn btn-ghost" onClick={() => act((s) => declineRequest(s, index))}>
          Turn away
        </button>
      </div>
    </article>
  );
}
