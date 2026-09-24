import type { ItemId } from "../../content/items";
import { REQUESTS } from "../../content/requests";
import { SHOP, type ShopId, type UpgradeId } from "../../content/shop";
import { buy, canBuy, declineRequest, fillRequest, hasItems, type Result } from "../../engine/commands";
import type { GameState } from "../../engine/state";
import { CoinIcon, HouseIcon } from "../art/icons";
import { itemName } from "../format";

type Act = (command: (s: GameState) => Result) => boolean;
const SHOP_IDS = Object.keys(SHOP) as ShopId[];

export function Village({ state, act }: { state: GameState; act: Act }) {
  return (
    <div className="village">
      <section className="panel" aria-labelledby="board-heading">
        <div className="panel-title">
          <HouseIcon size={18} />
          <h2 id="board-heading">Knocks at the door</h2>
          <span className="muted panel-aside num">Trust {state.trust}</span>
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

      <section className="panel" aria-labelledby="shop-heading">
        <div className="panel-title">
          <CoinIcon size={18} />
          <h2 id="shop-heading">The village shop</h2>
          <span className="panel-aside num">
            <CoinIcon size={14} /> {state.coin}
          </span>
        </div>
        <ul className="shop-list">
          {SHOP_IDS.map((id) => {
            const entry = SHOP[id];
            const owned = entry.kind === "upgrade" && state.upgrades.includes(id as UpgradeId);
            const reason = canBuy(state, id);
            return (
              <li key={id} className={`shop-row ${owned ? "owned" : ""}`}>
                <div>
                  <strong>{entry.name}</strong>
                  {entry.kind === "upgrade" && <span className="chip">For the house</span>}
                  <p className="muted">{entry.description}</p>
                </div>
                {owned ? (
                  <span className="chip accent">Done</span>
                ) : (
                  <button className="btn btn-primary" disabled={reason !== null} title={reason ?? undefined} onClick={() => act((s) => buy(s, id))}>
                    <CoinIcon size={14} /> <span className="num">{entry.cost}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function RequestCard({ state, index, act }: { state: GameState; index: number; act: Act }) {
  const req = REQUESTS[state.board[index]!.request!];
  const needs = Object.entries(req.needs) as [ItemId, number][];
  const ready = hasItems(state, req.needs);
  return (
    <article className={`request-card ${ready ? "ready" : ""}`}>
      <h3>{req.from}</h3>
      <p className="note-quote">{req.text}</p>
      <div className="action-io">
        {needs.map(([item, qty]) => (
          <span key={item} className={`chip ${(state.inventory[item] ?? 0) < qty ? "short" : "accent"}`}>
            <span className="num">
              {Math.min(state.inventory[item] ?? 0, qty)}/{qty}
            </span>{" "}
            {itemName(item)}
          </span>
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
