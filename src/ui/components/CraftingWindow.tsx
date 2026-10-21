import { useState } from "react";
import { FOE_DEFS, FOE_IDS, PIECE_DEFS, PIECE_IDS, SETS, SLOT_DEFS, SLOTS, type Affix, type PieceId, type Slot } from "../../content/combat";
import type { ItemId } from "../../content/items";
import { cancelCraft, canReforge, chooseAffix, craftPiece, reforge, type Result } from "../../engine/commands";
import { canCraftPiece, isHighRoll, pieceDurationMs, pieceOf, weaknessKnown } from "../../engine/combat";
import { rollOptionCount } from "../../engine/modifiers";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { CellarIcon } from "../art/cellarIcons";
import { affixText, baseText, fixedText, PIECE_GLYPH, poolText, SLOT_GLYPH } from "../cellar";
import { TimedBar } from "./Bar";
import { ItemChip } from "./ItemLookup";
import { Modal, modalHeadingId } from "./Modal";
import { Term } from "./Term";

// The crafting window (docs/COMBAT.md §4, §11; the handoff's crafting.html): a slot rail, the
// slot's pieces, and the piece card. Craft takes the action slot; when it's done the options turn
// over and you choose one. The same card reforges a piece you hold. Upgrading waits for Chapter II.

type Act = (c: (s: GameState) => Result) => unknown;
const TITLE = "The crafting window";

export function CraftingWindow({ state, act, onClose }: { state: GameState; act: Act; onClose: () => void }) {
  const pending = state.cellar.pending;
  const working = state.job?.piece;
  const first = pending?.piece ?? working ?? PIECE_IDS.find((p) => !pieceOf(state, p) && PIECE_DEFS[p].level <= skillLevel(state, "crafting")) ?? "salt_pouch";
  const [slot, setSlot] = useState<Slot>(PIECE_DEFS[first].slot);
  const [piece, setPiece] = useState<PieceId>(first);
  const shown = pending?.piece ?? piece;
  const crafting = skillLevel(state, "crafting");
  const workbench = state.upgrades.includes("workbench");
  return (
    <Modal title={TITLE} onClose={onClose} headless className="cw" backdropClassName="cw-scrim">
      <div data-skill="crafting" className="cw-inner">
        <header className="cw-head">
          <SkillIcon skill="crafting" size={26} />
          <div>
            <span className="label num">
              Crafting {crafting} · Workbench {workbench ? "built" : "not built"}
            </span>
            <h2 id={modalHeadingId(TITLE)}>{TITLE}</h2>
          </div>
          <button className="btn btn-ghost icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="cw-body">
          <nav className="cw-slots" aria-label="Slots">
            {SLOTS.map((s) => {
              const held = state.cellar.pieces.filter((p) => PIECE_DEFS[p.id].slot === s).length;
              return (
                <button key={s} className="cw-slot" aria-current={slot === s} onClick={() => { setSlot(s); setPiece(PIECE_IDS.find((p) => PIECE_DEFS[p].slot === s)!); }}>
                  <CellarIcon glyph={SLOT_GLYPH[s]} size={22} />
                  <span>{SLOT_DEFS[s].name}</span>
                  <span className="meta num">{held ? `${held} held` : ""}</span>
                </button>
              );
            })}
          </nav>
          <div className="cw-list">
            <span className="label">{SLOT_DEFS[slot].name} pieces</span>
            {PIECE_IDS.filter((p) => PIECE_DEFS[p].slot === slot).map((p) => {
              const def = PIECE_DEFS[p];
              const locked = def.level > crafting && !pieceOf(state, p);
              return (
                <button key={p} className={`cw-piece ${locked ? "is-locked" : ""}`} aria-current={shown === p} onClick={() => setPiece(p)}>
                  <span className="gs-ic sm" data-skill="crafting">
                    <CellarIcon glyph={PIECE_GLYPH[p]} size={18} />
                  </span>
                  <span className="cw-pn">
                    {def.name}
                    <span className="meta num">{pieceOf(state, p) ? "Held · T1" : locked ? "" : `Crafting ${def.level}`}</span>
                  </span>
                  {locked && (
                    <span className="lock">
                      <CellarIcon glyph="lock" size={14} />
                      Crafting {def.level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="cw-main">
            {state.cellar.pieces.length === 0 && !pending && !working && <p className="cw-empty">Nothing made yet. Your first piece goes straight onto you, in the Cellar's gear.</p>}
            <PieceCard key={`${shown}:${pending ? "p" : ""}`} state={state} id={shown} act={act} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PieceCard({ state, id, act }: { state: GameState; id: PieceId; act: Act }) {
  const def = PIECE_DEFS[id];
  const held = pieceOf(state, id);
  const pending = state.cellar.pending?.piece === id ? state.cellar.pending : null;
  const [pick, setPick] = useState<number | null>(pending?.kind === "craft" ? 0 : null);
  const fears = def.tag ? FOE_IDS.filter((f) => FOE_DEFS[f].weakness === def.tag && weaknessKnown(state, f)) : [];
  const head = (
    <header className="pc-head">
      <span className="pc-ic" data-skill="crafting">
        <CellarIcon glyph={PIECE_GLYPH[id]} size={40} />
      </span>
      <div>
        <span className="label">
          {SLOT_DEFS[def.slot].name} · {held ? "Held" : `Crafting ${def.level}`}
        </span>
        <h2>{def.name}</h2>
      </div>
      <div className="tiers" role="group" aria-label="Tier">
        <span className="tier-pill is-on">Tier 1</span>
        <span className="tier-pill is-locked">
          <CellarIcon glyph="lock" size={12} />
          Tier 2
        </span>
      </div>
    </header>
  );
  const pool = (
    <div className="pool">
      <span className="pool-k">Rolls one of</span>
      {poolText(def.slot).map((p) => (
        <span key={p} className="num">{p}</span>
      ))}
    </div>
  );
  let random;
  let foot;
  if (pending) {
    const opts = pending.options;
    const reforging = pending.kind === "reforge";
    const current = reforging ? held?.affixes[0] : undefined;
    random = (
      <div className="pc-row is-rolling">
        <span className="pc-k">Random <Term id="affix">affix</Term></span>
        <div className="pc-v">
          <div className={`rolls n${reforging ? 2 : Math.min(opts.length, 5)} ${reforging ? "is-reforge" : ""}`} role="radiogroup" aria-label="Choose one">
            {current && <Roll id={id} affix={current} label="Current" index={-1} picked={pick === null} onPick={() => setPick(null)} />}
            {reforging && (
              <span className="vs-mark" aria-hidden="true">
                or one of the new rolls
              </span>
            )}
            {opts.map((o, i) => (
              <Roll key={i} id={id} affix={o} label={`Option ${i + 1}`} index={i} picked={pick === i} onPick={() => setPick(i)} />
            ))}
          </div>
          {!reforging && pool}
        </div>
      </div>
    );
    foot = reforging ? (
      <div className="pc-foot">
        <span className="t-2">Choose a new one, or keep the old one.</span>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => act((s) => chooseAffix(s, null))}>
            Keep the old one
          </button>
          <button className="btn btn-primary btn-craft" disabled={pick === null} onClick={() => pick !== null && act((s) => chooseAffix(s, pick))}>
            {pick === null ? "Pick a new one" : "Choose"}
          </button>
        </div>
      </div>
    ) : (
      <div className="pc-foot">
        <span className="t-2">{opts.length > 2 ? "The Workbench adds a third option." : "Choose one, and the piece is done."}</span>
        <button className="btn btn-primary btn-craft" disabled={pick === null} onClick={() => pick !== null && act((s) => chooseAffix(s, pick))}>
          Choose
        </button>
      </div>
    );
  } else if (held) {
    const why = canReforge(state, id);
    random = (
      <div className="pc-row">
        <span className="pc-k">Random affix</span>
        <span className="pc-v">
          {held.affixes.map((a, i) => (
            <span key={i} className="affix is-random num">{affixText(a)}</span>
          ))}
          {pool}
        </span>
      </div>
    );
    foot = (
      <div className="upgrade">
        <span className="label">Upgrade to Tier 2</span>
        <ul>
          <li>+1 fixed affix · {def.tag ? <span className="tag">{def.tag}</span> : fixedText(id)} stays</li>
          <li>+1 random affix · you choose again</li>
        </ul>
        <div className="pc-foot">
          <span className="t-2">
            <Term id="reforge">Reforge</Term> for {(Object.entries(def.reforge) as [ItemId, number][]).map(([i, n]) => <ItemChip key={i} item={i} need={n} />)}
          </span>
          <div className="row">
            <button className="btn btn-ghost" disabled={why !== null} onClick={() => act((s) => reforge(s, id))}>
              {why ? why.replace(/\.$/, "") : "Reforge"}
            </button>
            <button className="btn" disabled>
              <CellarIcon glyph="lock" size={14} /> Chapter II materials
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    const why = canCraftPiece(state, id);
    const working = state.job?.piece === id ? state.job : null;
    random = (
      <div className="pc-row">
        <span className="pc-k">Random affix</span>
        <div className="pc-v">
          <span className="affix is-random t-2">Rolled when you craft · you choose one of {rollOptionCount(state, false)}</span>
          {pool}
        </div>
      </div>
    );
    foot = (
      <>
        <div className="pc-row pc-mats">
          <span className="pc-k">Materials</span>
          <span className="pc-v mats">
            {(Object.entries(def.items) as [ItemId, number][]).map(([i, n]) => (
              <ItemChip key={i} item={i} need={n} />
            ))}
          </span>
        </div>
        {working ? (
          <div className="pc-foot">
            <span className="job-line">
              Making it
              <TimedBar key={`job:${working.piece}`} progress={working.progress} durationMs={pieceDurationMs(state, id)} label="Making the piece" />
            </span>
            <button className="btn btn-ghost" onClick={() => act(cancelCraft)}>
              Stop
            </button>
          </div>
        ) : (
          <div className="pc-foot">
            <span className="t-2 num">{why ? <span className="warn">{why}</span> : `${(pieceDurationMs(state, id) / 1000).toFixed(1)} s · +${def.xp} Crafting XP · takes your work slot`}</span>
            <button className="btn btn-primary btn-craft" disabled={why !== null} onClick={() => act((s) => craftPiece(s, id))}>
              {why ? why.replace(/\.$/, "") : "Craft"}
            </button>
          </div>
        )}
      </>
    );
  }
  return (
    <article className="piece-card">
      {head}
      <div className="pc-body">
        <div className="pc-row">
          <span className="pc-k">Base</span>
          <span className="pc-v">
            <span className="affix is-base num">{baseText(def)}</span>
          </span>
        </div>
        <div className="pc-row">
          <span className="pc-k">Fixed affix</span>
          <span className="pc-v">
            <span className="affix is-fixed">
              {def.tag ? <span className="tag">{def.tag}</span> : fixedText(id)}
              {fears.length > 0 && ` The ${fears.map((f) => FOE_DEFS[f].name.replace(/^The (sour )?/, "")).join(" and the ")} ${fears.length > 1 ? "fear" : "fears"} ${def.tag}.`}
            </span>
          </span>
        </div>
        {random}
        <div className="pc-row">
          <span className="pc-k">
            <Term id="set">Set</Term>
          </span>
          <span className="pc-v t-2">{def.set ? `${SETS[def.set].name}: 2 pieces +10% Ward · 3 pieces, the first special attack of each foe misses` : "None"}</span>
        </div>
        <div className="pc-row is-later">
          <span className="pc-k">Tier 2</span>
          <span className="pc-v t-2">+1 fixed · +1 random affix</span>
        </div>
      </div>
      {foot}
    </article>
  );
}

function Roll({ id, affix, label, index, picked, onPick }: { id: PieceId; affix: Affix; label: string; index: number; picked: boolean; onPick: () => void }) {
  const high = index >= 0 && isHighRoll(id, affix);
  return (
    <button type="button" className={`roll ${picked ? "is-picked" : ""} ${high ? "is-high" : ""}`} style={{ ["--i" as string]: Math.max(0, index) }} role="radio" aria-checked={picked} onClick={onPick}>
      <span className="roll-k label">{label}</span>
      <span className="roll-v num">{affixText(affix)}</span>
      <span className="roll-note">{high ? "▲ High roll · top of its range" : index < 0 ? "What it has now" : rangeOf(id, affix)}</span>
      <span className="roll-check" aria-hidden="true">
        {picked ? "✓ Chosen" : "Choose"}
      </span>
    </button>
  );
}

function rangeOf(id: PieceId, affix: Affix): string {
  const line = poolText(PIECE_DEFS[id].slot).find((p) => p.startsWith(affixText(affix).split(" +")[0]!.split(" −")[0]!));
  return line ? `Range: ${line.replace(/^[^+−]*[+−]/, "")}` : "";
}
