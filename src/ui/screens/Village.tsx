import { ACTION_DEFS } from "../../content/actions";
import { ITEMS, type ItemId } from "../../content/items";
import { REQUESTS } from "../../content/requests";
import { SHOP, type ShopId } from "../../content/shop";
import { buy, canBuy, declineRequest, deliver, type Result } from "../../engine/commands";
import { lookupItem, nextTrustAt, producingSkill } from "../../engine/estimates";
import { requestCoin, trustMultiplier } from "../../engine/modifiers";
import type { GameState } from "../../engine/state";
import { CoinIcon, HouseIcon, LanternIcon } from "../art/icons";
import { ItemIcon } from "../art/items";
import { PlaceHero } from "../components/PlaceHero";
import { Bar } from "../components/Bar";
import { deliverable, stillNeeded } from "../../engine/village";
import { ItemChip } from "../components/ItemLookup";
import type { FxEvent } from "../fx";
import { useRecentFx } from "../useFx";

type Act = (command: (s: GameState) => Result) => unknown;
const SHOP_IDS = Object.keys(SHOP) as ShopId[];

const pickHelped = (e: FxEvent) => (e.kind === "helped" ? [String(e.slot)] : []);

export function Village({ state, act }: { state: GameState; act: Act }) {
  const helped = useRecentFx(pickHelped, 1800);
  const nextAt = nextTrustAt(state);
  return (
    <>
    <PlaceHero
      icon={<LanternIcon size={34} />}
      title="The Village"
      line="Knocks at the door, and a shop that keeps odd hours."
      stats={[
        {
          label: "Trust",
          value: (
            <span className="trust" title="Trust grows with every contract you finish. Higher trust brings better-paying work.">
              <span>
                {Math.floor(state.trust)}
                {nextAt !== null && <span className="unit">· better work at {nextAt}</span>}
              </span>
              <Bar value={nextAt ? state.trust / nextAt : 1} label="Trust" />
            </span>
          ),
        },
        { label: "Coin", value: Math.floor(state.coin), accent: true },
      ]}
    />
    <div className="village-grid">
      <section className="panel" aria-labelledby="board-heading">
        <div className="panel-title">
          <HouseIcon size={18} />
          <h2 id="board-heading">Knocks at the door</h2>
          <span className="panel-aside">Contracts · {state.board.length} at a time</span>
        </div>
        <div className="notices">
          {state.board.map((slot, i) =>
            slot.request ? (
              <RequestCard key={i} state={state} index={i} act={act} />
            ) : (
              <div key={i} className="notice is-empty">
                {helped.has(String(i)) && <span className="helped-stamp">Helped ✓</span>}
                <p className="pays num">Next contract in {Math.max(0, Math.ceil((slot.refillAt - state.lastTickAt) / 1000))}s</p>
              </div>
            ),
          )}
        </div>
      </section>

      <Shop state={state} act={act} />
    </div>
    </>
  );
}

const PROVISIONS = SHOP_IDS;

function Shop({ state, act }: { state: GameState; act: Act }) {
  return (
    <section className="panel shop" aria-labelledby="shop-heading">
      <div className="panel-title">
        <CoinIcon size={18} />
        <h2 id="shop-heading">The village shop</h2>
      </div>
      <span className="label">Provisions</span>
      <ul className="shop-ledger">
        {PROVISIONS.map((id) => {
          const entry = SHOP[id];
          const use = lookupItem(state, entry.item);
          const purpose = use.inKindling > 0 ? "Needed for the Kindling's offering" : use.usedBy.length > 0 ? `For ${ACTION_DEFS[use.usedBy[0]!].name.toLowerCase()}` : entry.description;
          return (
            <li key={id} data-skill={producingSkill(entry.item) ?? undefined}>
              <span className="ic" aria-hidden="true">
                <ItemIcon item={entry.item} size={18} />
              </span>
              <span>
                <strong>
                  {ITEMS[entry.item].name} <span className="num muted">×{entry.qty}</span>
                </strong>
                <br />
                <span className="eff">
                  {purpose} · you hold <span className="num">{state.inventory[entry.item] ?? 0}</span>
                </span>
              </span>
              <BuyButton state={state} id={id} act={act} />
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
      <span className="need-more num" title={`Costs ${cost} coin`}>
        Need {short} more
      </span>
    );
  }
  return (
    <button className="btn btn-ghost btn-sm price" disabled={reason !== null} title={reason ?? undefined} onClick={() => act((s) => buy(s, id))}>
      Buy · <CoinIcon size={14} /> <span className="num">{cost}</span>
    </button>
  );
}

/** A contract: what they need, what's been delivered, and a Deliver button for whatever you hold. */
function RequestCard({ state, index, act }: { state: GameState; index: number; act: Act }) {
  const slot = state.board[index]!;
  const req = REQUESTS[slot.request!];
  const needs = Object.entries(req.needs) as [ItemId, number][];
  const left = stillNeeded(slot);
  const give = deliverable(state, slot);
  const canGive = Object.keys(give).length > 0;
  const finishes = needs.every(([item]) => (left[item] ?? 0) <= (give[item] ?? 0));
  return (
    <article className={`notice ${finishes ? "is-ready" : ""}`}>
      <h3>{req.from}</h3>
      <p className="lore">{req.text}</p>
      <ul className="contract-needs">
        {needs.map(([item, qty]) => {
          const done = slot.delivered[item] ?? 0;
          return (
            <li key={item}>
              {done < qty ? <ItemChip item={item} need={qty - done} /> : <span className="chip enough">✓ {ITEMS[item].name}</span>}
              <span className="muted num contract-count">
                {done}/{qty} delivered
              </span>
              <Bar thin value={done / qty} label={`${ITEMS[item].name} delivered`} />
            </li>
          );
        })}
      </ul>
      <p className="pays num">
        Pays {requestCoin(state, req)} coin · +{+(req.trust * trustMultiplier(state)).toFixed(1)} trust
      </p>
      <div className="row">
        <button className={`btn btn-sm ${canGive ? "btn-primary" : "btn-ghost"}`} disabled={!canGive} onClick={() => act((s) => deliver(s, index))} title={canGive ? undefined : "You have none of what they need yet"}>
          {finishes ? "Deliver and finish" : "Deliver what I have"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => act((s) => declineRequest(s, index))}>
          Turn away
        </button>
      </div>
    </article>
  );
}
