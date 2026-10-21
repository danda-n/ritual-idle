import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CHARM_IDS, type CharmId } from "../../content/charms";
import { BASE, FOE_DEFS, FOE_IDS, GIFTS, PIECE_DEFS, PIECE_IDS, REMEDIES, REMEDY_IDS, SETS, SLOT_DEFS, SLOTS, type FoeId, type PieceId, type Slot } from "../../content/combat";
import { ITEMS, type ItemId } from "../../content/items";
import { beginFight, deleteLoadout, dismissFightSummary, saveLoadout, setCharm, setHealAt, setRemedy, stopFight, useRemedy, wear, wearLastFor, wearLoadout, type Result } from "../../engine/commands";
import { canFight, combatStats, matchup, pieceAffixes, pieceOf, readiness, roughChance, strikesWith, timeToFullMs, wardingLevel, weaknessAfter, weaknessKnown, type Readiness } from "../../engine/combat";
import { loadoutSlots } from "../../engine/modifiers";
import { skillLevel } from "../../engine/simulate";
import type { GameState } from "../../engine/state";
import { CandleIcon, SkillIcon, SigilIcon } from "../art/icons";
import { CellarIcon } from "../art/cellarIcons";
import { ItemIcon } from "../art/items";
import { Bar, TimedBar } from "../components/Bar";
import { ItemChip } from "../components/ItemLookup";
import { TalentPanel } from "../components/TalentPanel";
import { Term } from "../components/Term";
import { Tip } from "../components/Tip";
import { affixText, baseText, FOE_ART, fixedText, foeName, hp, PIECE_GLYPH, READY, SLOT_GLYPH } from "../cellar";
import { charmEffects } from "../effects";
import { formatDuration } from "../format";

// The Cellar tab (docs/COMBAT.md §11; the handoff's docs/design_handoff/CELLAR.md): You on the left
// (your stats and gear), the foes or the fight on the right. Text that explains a mechanic is
// written in plain sentences; labels and numbers stay short (docs/DESIGN.md "Writing").

type Act = (c: (s: GameState) => Result) => unknown;
type Picker = Slot | "remedy" | "charm" | null;

export function Cellar({ state, act, onIntro, onCraft }: { state: GameState; act: Act; onIntro: () => void; onCraft: () => void }) {
  const fight = state.fight;
  const [chosen, setChosen] = useState<FoeId>(fight?.foe ?? state.cellar.lastFight?.foe ?? "skrzat");
  const foe = fight?.foe ?? chosen;
  // Choosing a foe never changes your gear: "Same as last time" puts back what you wore against it.
  const choose = (id: FoeId) => setChosen(id);
  return (
    <>
      <CellarHero state={state} onIntro={onIntro} />
      <div className="cellar">
        <div className="col col-you">
          <YouPanel state={state} foe={foe} act={act} onCraft={onCraft} />
          <TalentPanel state={state} skill="warding" act={act} />
        </div>
        <div className="col col-fight">
          <FightSummary state={state} act={act} />
          {fight ? (
            <Stage state={state} act={act} />
          ) : (
            <>
              <div className="col-head">
                <span className="label">Choose a foe</span>
              </div>
              <div className="fcards">
                {FOE_IDS.filter((id) => !FOE_DEFS[id].boss).map((id) => (
                  <FoeCard key={id} state={state} id={id} current={foe === id} onChoose={() => choose(id)} />
                ))}
              </div>
              {FOE_IDS.filter((id) => FOE_DEFS[id].boss).map((id) => (
                <FoeCard key={id} state={state} id={id} current={foe === id} onChoose={() => choose(id)} />
              ))}
              <GoBar state={state} foe={foe} act={act} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Hero ----------

function CellarHero({ state, onIntro }: { state: GameState; onIntro: () => void }) {
  const beaten = Object.values(state.cellar.beaten).reduce((n, v) => n + (v ?? 0), 0) - (state.cellar.beaten.domovoi ?? 0);
  const calmed = state.cellar.gifts.includes("domovoi");
  return (
    <header className="hero is-cellar">
      <span className="hero-mark" aria-hidden="true">
        <CellarIcon glyph="cellar" size={34} />
      </span>
      <div>
        <h1>
          The Cellar
          <Term id="cellar" iconOnly />
        </h1>
        <p className="lore">Cold stone under the kitchen. The house's spirits wait below.</p>
        <div className="hero-links">
          <button className="btn btn-text btn-sm" onClick={onIntro}>
            How it works
          </button>
        </div>
      </div>
      <div className="hero-stats">
        <span className="hero-stat">
          <span className="label">Warding</span>
          <b className="num">
            {wardingLevel(state)}
            <span className="unit">/{state.levelCap}</span>
          </b>
        </span>
        <span className="hero-stat">
          <span className="label">Foes warded off</span>
          <b className="num">{beaten}</b>
        </span>
        <span className="hero-stat">
          <span className="label">Domovoi</span>
          <b>{calmed ? <span className="calmed boss-state">✓ calmed</span> : <span className="boss-state">not yet calmed</span>}</b>
        </span>
      </div>
    </header>
  );
}

// ---------- You ----------

function YouPanel({ state, foe, act, onCraft }: { state: GameState; foe: FoeId; act: Act; onCraft: () => void }) {
  const [tab, setTab] = useState<"gear" | "stats">("gear");
  const stats = combatStats(state);
  const note = (parts: { source: string }[], empty: string) => (parts.length ? [...new Set(parts.map((p) => p.source.replace(/^Warding \d+$/, "Level")))].join(" · ") : empty);
  const noStrike = !state.cellar.gear.worn.hand && !state.cellar.gear.worn.lantern;
  const full = state.cellar.health >= stats.maxHealth;
  return (
    <article className="panel you" aria-labelledby="you-h">
      <section className="you-head">
        <span className="you-mark" aria-hidden="true">
          <CandleIcon size={26} />
        </span>
        <div className="you-id">
          <h2 id="you-h">You</h2>
          <span className="lvls">
            {(["warding", "crafting"] as const).map((k) => (
              <span key={k} className="lvl-chip" data-skill={k}>
                <SkillIcon skill={k} size={18} />
                <span>{k === "warding" ? <Term id="warding">Warding</Term> : <Term id="crafting">Crafting</Term>}</span>
                <b className="num">{skillLevel(state, k)}</b>
              </span>
            ))}
          </span>
        </div>
        <div className="seg you-tabs" role="tablist" aria-label="You">
          <button role="tab" aria-selected={tab === "gear"} onClick={() => setTab("gear")}>
            Gear
          </button>
          <button role="tab" aria-selected={tab === "stats"} onClick={() => setTab("stats")}>
            Your stats
          </button>
        </div>
      </section>
      <section className="me">
        <div className="me-stats">
          <MeStat glyph="health" label="Health" value={stats.maxHealth} note={note(stats.parts.health, "Level")} />
          <MeStat glyph="ward" label="Ward" value={Math.round(stats.ward)} note={note(stats.parts.ward, "No Amulet")} />
          <MeStat glyph="strike" label="Strike" value={Math.round(stats.strike * 10) / 10} note={noStrike ? "Bare hands · no Hand or Lantern" : note(stats.parts.strike.slice(1), "Bare hands")} zero={noStrike} />
          <MeStat glyph="speed" label="Speed" value={<>{(stats.blowMs / 1000).toFixed(1)}<span className="unit">s</span></>} note="A blow every" />
        </div>
        {!state.fight && (
          <div className="health-now">
            <span className="num">
              Health {Math.floor(state.cellar.health)}/{stats.maxHealth}
            </span>
            <Bar value={state.cellar.health / stats.maxHealth} label="Health now" />
            <span className="num">{full ? "full" : `full in ${formatDuration(timeToFullMs(state))}`}</span>
          </div>
        )}
      </section>
      <section>{tab === "stats" ? <StatsTab state={state} foe={foe} /> : <GearTab state={state} foe={foe} act={act} onCraft={onCraft} />}</section>
    </article>
  );
}

function MeStat({ glyph, label, value, note, zero }: { glyph: "health" | "ward" | "strike" | "speed"; label: string; value: ReactNode; note: string; zero?: boolean }) {
  return (
    <div className={`me-stat ${zero ? "is-zero" : ""}`}>
      <span className="label">
        <CellarIcon glyph={glyph} size={14} />
        {label}
      </span>
      <b className="num">{value}</b>
      <span className="note">{note}</span>
    </div>
  );
}

function GearTab({ state, foe, act, onCraft }: { state: GameState; foe: FoeId; act: Act; onCraft: () => void }) {
  const fighting = state.fight !== null;
  const [sel, setSel] = useState<Slot>("hand");
  const [picker, setPicker] = useState<Picker>(null);
  const gear = state.cellar.gear;
  const stats = combatStats(state);
  const grand = stats.sets.grandmother ?? 0;
  const toggle = (p: Picker) => setPicker((cur) => (cur === p ? null : p));
  useEffect(() => {
    if (fighting) setPicker(null);
  }, [fighting]);
  return (
    <>
      <div className="sec-head">
        <h3>
          <Term id="gear">Gear</Term>
        </h3>
        {fighting ? (
          <span className="meta">Locked while fighting</span>
        ) : (
          <div className="right">
            <button className="btn btn-ghost btn-sm" disabled={!state.cellar.lastFor[foe]} onClick={() => act((s) => wearLastFor(s, foe))}>
              Same as last time
            </button>
            <Presets state={state} act={act} />
          </div>
        )}
      </div>
      <div className="gtiles">
        {SLOTS.map((slot) => (
          <GearTile key={slot} state={state} slot={slot} foe={foe} selected={sel === slot} onSelect={() => { setSel(slot); setPicker(null); }} />
        ))}
      </div>
      {grand >= 2 && (
        <div className="setline">
          <span className="sw" aria-hidden="true" />
          <b>
            {SETS.grandmother.name} · {grand}
          </b>
          <span>+10% Ward{grand >= 3 ? " · the first special attack of each foe misses" : ""}</span>
        </div>
      )}
      <GearDetail state={state} slot={sel} foe={foe} fighting={fighting} open={picker === sel} onToggle={() => toggle(sel)} onPick={(p) => { act((s) => wear(s, sel, p)); setPicker(null); }} onCraft={onCraft} />
      <div className="belt">
        <RemedyRow state={state} fighting={fighting} open={picker === "remedy"} onToggle={() => toggle("remedy")} onPick={(r) => { act((s) => setRemedy(s, r)); setPicker(null); }} act={act} />
        <CharmRow state={state} fighting={fighting} open={picker === "charm"} onToggle={() => toggle("charm")} onPick={(c) => { act((s) => setCharm(s, c)); setPicker(null); }} />
      </div>
      <div className="healing">
        <span className="healing-k">
          <Term id="healing">Healing rule</Term>:
        </span>
        <span>
          Use a <Term id="remedy">remedy</Term> below
        </span>
        {fighting ? (
          <b className="num">{gear.healAt}%</b>
        ) : (
          <span className="stepper">
            <button aria-label="Lower" disabled={gear.healAt <= BASE.healAtMin} onClick={() => act((s) => setHealAt(s, s.cellar.gear.healAt - 5))}>
              −
            </button>
            <output className="num">{gear.healAt}%</output>
            <button aria-label="Higher" disabled={gear.healAt >= BASE.healAtMax} onClick={() => act((s) => setHealAt(s, s.cellar.gear.healAt + 5))}>
              +
            </button>
          </span>
        )}
        <span>Health</span>
      </div>
    </>
  );
}

function GearTile({ state, slot, foe, selected, onSelect }: { state: GameState; slot: Slot; foe: FoeId; selected: boolean; onSelect: () => void }) {
  const id = state.cellar.gear.worn[slot];
  const piece = id ? pieceOf(state, id) : undefined;
  if (!piece) {
    return (
      <button className="gt is-empty" aria-pressed={selected} onClick={onSelect}>
        <span className="gt-ic">
          <CellarIcon glyph={SLOT_GLYPH[slot]} size={28} />
        </span>
        <span className="gt-slot">{SLOT_DEFS[slot].name}</span>
        <span className="gt-nm">Empty</span>
      </button>
    );
  }
  const def = PIECE_DEFS[piece.id];
  const match = def.tag !== undefined && weaknessKnown(state, foe) && def.tag === FOE_DEFS[foe].weakness;
  return (
    <button className="gt" aria-pressed={selected} onClick={onSelect}>
      {def.tag && <span className={`gt-tag ${match ? "is-match" : ""}`}>{match ? `✓ ${def.tag}` : def.tag}</span>}
      <span className="gt-tier">T{piece.tier}</span>
      <span className="gt-ic">
        <CellarIcon glyph={PIECE_GLYPH[piece.id]} size={28} />
      </span>
      <span className="gt-slot">{SLOT_DEFS[slot].name}</span>
      <span className="gt-nm">{def.name}</span>
      <span className="gt-big num">{baseText(def)}</span>
      {def.set && <span className="gt-set" aria-label={SETS[def.set].name} />}
    </button>
  );
}

function GearDetail({ state, slot, foe, fighting, open, onToggle, onPick, onCraft }: { state: GameState; slot: Slot; foe: FoeId; fighting: boolean; open: boolean; onToggle: () => void; onPick: (p: PieceId | null) => void; onCraft: () => void }) {
  const id = state.cellar.gear.worn[slot];
  const piece = id ? pieceOf(state, id) : undefined;
  const f = FOE_DEFS[foe];
  const change = !fighting && (
    <button className="btn btn-ghost btn-sm" aria-expanded={open} onClick={onToggle}>
      Change
    </button>
  );
  const held = state.cellar.pieces.filter((p) => PIECE_DEFS[p.id].slot === slot);
  return (
    <div className="slot-wrap gd-wrap">
      <div className="gdetail">
        {piece ? (
          <>
            <span className="gd-ic">
              <CellarIcon glyph={PIECE_GLYPH[piece.id]} size={26} />
            </span>
            <div className="gd-main">
              <h4>
                {PIECE_DEFS[piece.id].name} <span className="tier">T{piece.tier}</span>
              </h4>
              <ul>
                <li>
                  <b className="num">{baseText(PIECE_DEFS[piece.id])}</b>
                </li>
                <li>
                  {PIECE_DEFS[piece.id].tag ? (
                    <>
                      Tag: <b>{PIECE_DEFS[piece.id].tag}</b>
                      {weaknessKnown(state, foe) && PIECE_DEFS[piece.id].tag === f.weakness && <span className="match"> The {foeName(foe)} fears it</span>}
                    </>
                  ) : (
                    fixedText(piece.id)
                  )}
                </li>
                {piece.affixes.map((a, i) => (
                  <li key={i} className="num">
                    <Term id="affix">Rolled</Term>: <b>{affixText(a)}</b>
                  </li>
                ))}
                {PIECE_DEFS[piece.id].set && <li>Part of {SETS[PIECE_DEFS[piece.id].set!].name}</li>}
              </ul>
            </div>
            {change}
          </>
        ) : (
          <>
            <span className="gd-ic is-empty">
              <CellarIcon glyph={SLOT_GLYPH[slot]} size={26} />
            </span>
            <div className="gd-main">
              <h4 className="warn">No {SLOT_DEFS[slot].name.toLowerCase()} piece</h4>
              <ul>
                <li>{held.length ? "Wear one you hold, or make another with Crafting." : "Make one with Crafting."}</li>
                <li>
                  The {SLOT_DEFS[slot].name} {SLOT_DEFS[slot].gives}.
                </li>
              </ul>
            </div>
            {change}
          </>
        )}
      </div>
      {open && (
        <PickerSheet title={SLOT_DEFS[slot].name} foe={foe} onClose={onToggle} onCraft={onCraft}>
          {held.length === 0 && <p className="pick-row is-make">No {SLOT_DEFS[slot].name.toLowerCase()} pieces yet.</p>}
          {held.map((p) => {
            const def = PIECE_DEFS[p.id];
            const inUse = id === p.id;
            const match = def.tag !== undefined && weaknessKnown(state, foe) && def.tag === f.weakness;
            return (
              <button key={p.id} className="pick-row" role="option" aria-selected={inUse} aria-current={inUse} onClick={() => onPick(p.id)}>
                <span className="ic" data-skill="crafting">
                  <CellarIcon glyph={PIECE_GLYPH[p.id]} size={20} />
                </span>
                <span className="nm">
                  {def.name}
                  <span className="tier">T{p.tier}</span>
                  {match && <span className="match">Its weakness</span>}
                </span>
                <span className="n">{inUse && <span className="delta same">in use</span>}</span>
                <span className="gv">
                  <span className="num">{baseText(def)}</span>
                  {def.tag ? <span className="tag">{def.tag}</span> : <span>{fixedText(p.id)}</span>}
                  {pieceAffixes(p).filter((a) => a !== def.fixed).map((a, i) => (
                    <span key={i} className="num">{affixText(a)}</span>
                  ))}
                </span>
              </button>
            );
          })}
          {id && (
            <button className="pick-row" role="option" aria-selected={false} onClick={() => onPick(null)}>
              <span className="ic" />
              <span className="nm">Take it off</span>
            </button>
          )}
        </PickerSheet>
      )}
    </div>
  );
}

function PickerSheet({ title, foe, onClose, onCraft, children }: { title: string; foe: FoeId; onClose: () => void; onCraft?: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[aria-current='true'], button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(t) && !t.closest(".slot-wrap")) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="picker" role="listbox" aria-label={`${title} for the ${foeName(foe)}`} ref={ref}>
        <div className="picker-head">
          <h4>{title}</h4>
          <span className="meta">for the {foeName(foe)}</span>
        </div>
        {children}
        {onCraft && (
          <div className="pick-foot">
            <button className="btn btn-text btn-sm" onClick={onCraft}>
              Make more: Crafting ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function RemedyRow({ state, fighting, open, onToggle, onPick, act }: { state: GameState; fighting: boolean; open: boolean; onToggle: () => void; onPick: (r: (typeof REMEDY_IDS)[number] | null) => void; act: Act }) {
  const r = state.cellar.gear.remedy;
  const stats = combatStats(state);
  const held = r ? state.inventory[r] ?? 0 : 0;
  const inner = (
    <>
      <span className="gs-ic sm" data-skill="herbalism">
        {r ? <ItemIcon item={r} size={18} /> : <CellarIcon glyph="poultice" size={18} />}
      </span>
      <span className="bl-name">
        <span className="label">Remedy</span>
        <span>{r ? ITEMS[r].name : "None"}</span>
        {r && <span className="t-2 num">Heals {Math.round(REMEDIES[r].heals * stats.remedyHeal * 10) / 10}</span>}
      </span>
      <span className="bl-n">
        {fighting ? (
          <>
            <b className="num">{state.fight!.belt}</b>
            <span className="t-2">left</span>
          </>
        ) : r ? (
          <>
            <b className="num">{held}</b>
            <span className="t-2">{stats.beltCap > 0 ? `Belt holds ${stats.beltCap}` : "No Belt"}</span>
          </>
        ) : null}
      </span>
    </>
  );
  if (fighting) return <div className="belt-row">{inner}</div>;
  return (
    <div className="slot-wrap">
      <button className="belt-row" aria-expanded={open} onClick={onToggle}>
        {inner}
      </button>
      {open && (
        <PickerSheet title="Remedy" foe={state.fight?.foe ?? "skrzat"} onClose={onToggle}>
          {REMEDY_IDS.map((id) => (
            <button key={id} className="pick-row" role="option" aria-selected={r === id} aria-current={r === id} onClick={() => onPick(id)}>
              <span className="ic" data-skill="herbalism">
                <ItemIcon item={id} size={20} />
              </span>
              <span className="nm">{ITEMS[id].name}</span>
              <span className="n num">×{state.inventory[id] ?? 0}</span>
              <span className="gv">
                <span>Heals {REMEDIES[id].heals}</span>
                {id === "bread" && <span>Bread and salt: the Domovoi likes it</span>}
              </span>
            </button>
          ))}
          <button className="pick-row" role="option" aria-selected={r === null} onClick={() => onPick(null)}>
            <span className="ic" />
            <span className="nm">No remedy</span>
          </button>
          {r && held > 0 && state.cellar.health < stats.maxHealth && (
            <div className="pick-foot">
              <button className="btn btn-ghost btn-sm" onClick={() => act((s) => useRemedy(s, r))}>
                Use one now · +{Math.round(REMEDIES[r].heals * stats.remedyHeal)} Health
              </button>
            </div>
          )}
        </PickerSheet>
      )}
    </div>
  );
}

/** Charms you can take into a fight: those you hold or have on. */
function fightCharms(state: GameState): CharmId[] {
  return CHARM_IDS.filter((c) => (state.inventory[c] ?? 0) > 0 || (state.charms[c] ?? 0) > 0);
}

function CharmRow({ state, fighting, open, onToggle, onPick }: { state: GameState; fighting: boolean; open: boolean; onToggle: () => void; onPick: (c: CharmId | null) => void }) {
  const c = state.cellar.gear.charm;
  const on = c ? state.charms[c] ?? 0 : 0;
  const inner = (
    <>
      <span className="gs-ic sm" data-skill="ritualism">
        {c ? <ItemIcon item={c} size={18} /> : <CellarIcon glyph="threadKnot" size={18} />}
      </span>
      <span className="bl-name">
        <span className="label">Charm</span>
        <span>{c ? ITEMS[c].name : "None"}</span>
      </span>
      <span className="bl-n">
        {c && (
          <>
            <b className="num">{on > 0 ? on : state.inventory[c] ?? 0}</b>
            <span className="t-2">{on > 0 ? "uses left" : "held"}</span>
          </>
        )}
      </span>
    </>
  );
  if (fighting) return <div className="belt-row">{inner}</div>;
  const list = fightCharms(state);
  return (
    <div className="slot-wrap">
      <button className="belt-row" aria-expanded={open} onClick={onToggle}>
        {inner}
      </button>
      {open && (
        <PickerSheet title="Charm" foe={state.fight?.foe ?? "skrzat"} onClose={onToggle}>
          {list.length === 0 && <p className="pick-row is-make">No charms. Bind them at Experiments; Crafting makes the red thread knot.</p>}
          {list.map((id) => (
            <button key={id} className="pick-row" role="option" aria-selected={c === id} aria-current={c === id} onClick={() => onPick(id)}>
              <span className="ic" data-skill="ritualism">
                <ItemIcon item={id} size={20} />
              </span>
              <span className="nm">{ITEMS[id].name}</span>
              <span className="n num">×{state.inventory[id] ?? 0}</span>
              <span className="gv">
                <span>{charmEffects(id).join(" · ")}</span>
                {(state.charms[id] ?? 0) > 0 && <span className="num">on · {state.charms[id]} left</span>}
              </span>
            </button>
          ))}
          <button className="pick-row" role="option" aria-selected={c === null} onClick={() => onPick(null)}>
            <span className="ic" />
            <span className="nm">No charm</span>
          </button>
        </PickerSheet>
      )}
    </div>
  );
}

function Presets({ state, act }: { state: GameState; act: Act }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const slots = loadoutSlots(state);
  const saved = state.cellar.loadouts;
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const save = (index: number) => {
    act((s) => saveLoadout(s, index, name));
    setName("");
  };
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Loadouts ▾
      </button>
      {open && (
        <div className="menu" role="menu">
          {saved.length === 0 && (
            <span className="menu-note">
              No <Term id="loadout">loadouts</Term> saved yet.
            </span>
          )}
          {saved.map((l, i) => (
            <div key={i} className="menu-row">
              <button role="menuitem" onClick={() => { act((s) => wearLoadout(s, i)); setOpen(false); }}>
                <span>{l.name}</span>
                <span className="meta">Wear</span>
              </button>
              <button role="menuitem" aria-label={`Save over ${l.name}`} onClick={() => act((s) => saveLoadout(s, i, l.name))}>
                <span className="meta">Save over</span>
              </button>
              <button role="menuitem" aria-label={`Delete ${l.name}`} onClick={() => act((s) => deleteLoadout(s, i))}>
                <span className="meta">✕</span>
              </button>
            </div>
          ))}
          <hr />
          {saved.length < slots ? (
            <form className="menu-save" onSubmit={(e) => { e.preventDefault(); save(saved.length); }}>
              <input aria-label="Loadout name" placeholder={`Loadout ${saved.length + 1}`} value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
              <button type="submit" className="btn btn-ghost btn-sm">
                Save this gear
              </button>
            </form>
          ) : (
            <span className="menu-note">All {slots} places are used. Save over one, or build the Warded cellar door for another.</span>
          )}
        </div>
      )}
    </div>
  );
}

function StatsTab({ state, foe }: { state: GameState; foe: FoeId }) {
  const m = matchup(state, foe);
  const s = m.stats;
  const f = FOE_DEFS[foe];
  const name = foeName(foe);
  const known = weaknessKnown(state, foe);
  const chips = (parts: { source: string; value: number }[], mults: { source: string; mult: number }[] = [], pct = false) => [
    ...parts.map((p, i) => (
      <span key={i} className="part-chip">
        <span>{p.source}</span>
        <b className="num">{i > 0 || pct ? "+" : ""}{p.value}{pct ? "%" : ""}</b>
      </span>
    )),
    ...mults.map((m) => (
      <span key={m.source} className="part-chip">
        <span>{m.source}</span>
        <b className="num">×{Math.round(m.mult * 100) / 100}</b>
      </span>
    )),
  ];
  const blowsToWin = Math.ceil(f.health / Math.max(0.1, m.yourBlow));
  const blowsToLose = Math.ceil(s.maxHealth / Math.max(0.1, m.itsBlow));
  const wears = (["amulet", "hand", "lantern"] as Slot[]).filter((sl) => s.tags[sl] === f.weakness);
  return (
    <>
      <div className="sec-head">
        <h3>How your stats are made</h3>
        <span className="meta">against the {name}</span>
      </div>
      <div className="srows">
        <SRow glyph="health" name="Health" total={s.maxHealth} parts={chips(s.parts.health)} vs={<>The {name} needs about <b className="num">{blowsToLose}</b> blows to drive you off.</>} />
        <SRow glyph="ward" name="Ward" total={Math.round(s.ward)} parts={chips(s.parts.ward, s.mults.ward)} vs={<>Its blows land for about <b className="num">{hp(m.itsBlow)}</b>.</>} />
        <SRow glyph="strike" name="Strike" total={Math.round(s.strike * 10) / 10} parts={chips(s.parts.strike, s.mults.strike)} vs={<>Your blows land for about <b className="num">{hp(m.yourBlow)}</b>, so about <b className="num">{blowsToWin}</b> to win.</>} />
        <SRow glyph="speed" name="Speed" total={`${(s.blowMs / 1000).toFixed(1)} s`} parts={[<span key="base" className="part-chip"><span>Base</span><b className="num">3.0 s</b></span>, ...chips(s.parts.speed, s.mults.speed, true)]} vs={<>You strike every <b className="num">{(s.blowMs / 1000).toFixed(1)} s</b>, it every <b className="num">{(f.blowMs / 1000).toFixed(1)} s</b>.</>} />
        <div className="srow is-weak">
          <span className="srow-ic">
            <SigilIcon size={20} />
          </span>
          <div className="srow-main">
            <div className="srow-top">
              <strong>
                <Term id="weakness">Weakness</Term>
              </strong>
            </div>
            <p className="vs">
              {!known ? (
                <>
                  <span className="tag is-unknown">?</span> Not known yet. Beat the {name} <b className="num">{weaknessAfter(state) - (state.cellar.beaten[foe] ?? 0)}</b> more times to learn it.
                </>
              ) : wears.length ? (
                wears.map((sl) => (
                  <span key={sl}>
                    <span className="match">{PIECE_DEFS[state.cellar.gear.worn[sl]!].name} carries {f.weakness}</span> {sl === "amulet" ? "Its blows are halved." : "Your blows hit half again as hard."}{" "}
                  </span>
                ))
              ) : (
                <>
                  Nothing you wear matches. It fears <span className="tag">{f.weakness}</span>.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SRow({ glyph, name, total, parts, vs }: { glyph: "health" | "ward" | "strike" | "speed"; name: string; total: ReactNode; parts: ReactNode; vs: ReactNode }) {
  return (
    <div className="srow">
      <span className="srow-ic">
        <CellarIcon glyph={glyph} size={20} />
      </span>
      <div className="srow-main">
        <div className="srow-top">
          <strong>{name}</strong>
          <b className="num">{total}</b>
        </div>
        <div className="sparts">{parts}</div>
        <p className="vs">{vs}</p>
      </div>
    </div>
  );
}

// ---------- Foes ----------

/** The readiness tag: the word and its pips, with the rough chance in a Tip. */
export function ReadyTag({ tag, wins, large, boss, remediesLast, still }: { tag: Readiness; wins: number; large?: boolean; boss?: boolean; remediesLast?: number | null; /** Inside another control (a foe card): a plain tag with its Tip on hover, not a button. */ still?: boolean }) {
  const r = READY[tag];
  const pill = (
    <span className={`ready ${large ? "lg" : ""}`} data-r={r.key}>
      <span className="pips" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i < r.pips ? "on" : ""} />
        ))}
      </span>
      {tag}
    </span>
  );
  const content = {
    title: `${tag} · ${roughChance(wins)}`,
    note: `${tag === "Safe" ? (boss ? "You will almost never lose. " : "Leave it running, away too. ") : boss ? "Your chance in one attempt. " : "Your chance against one foe, from full Health. "}It counts the special attacks and your healing rule.${remediesLast ? ` Remedies last about ${remediesLast} foe${remediesLast === 1 ? "" : "s"}.` : ""}`,
  };
  if (still) return <Tip content={content}>{pill}</Tip>;
  return (
    <Tip content={content}>
      <button type="button" className="tip-trigger" aria-label={`Readiness: ${tag}, ${roughChance(wins)}`}>
        {pill}
      </button>
    </Tip>
  );
}

function FoeStats({ state, id }: { state: GameState; id: FoeId }) {
  const f = FOE_DEFS[id];
  const known = weaknessKnown(state, id);
  return (
    <span className="foe-stats">
      <span className="fs" aria-label={`${f.boss ? "Temper" : "Health"} ${f.health}`}>
        <CellarIcon glyph="health" size={14} />
        <b className="num">{f.health}</b>
      </span>
      <span className="fs" aria-label={`Strike ${f.strike}`}>
        <CellarIcon glyph="strike" size={14} />
        <b className="num">{f.strike}</b>
      </span>
      <span className="fs" aria-label={`Ward ${f.ward}`}>
        <CellarIcon glyph="ward" size={14} />
        <b className="num">{f.ward}</b>
      </span>
      <span className="fs">
        Fears {known ? <span className="tag">{f.weakness}</span> : <span className="tag is-unknown" aria-label="unknown">?</span>}
      </span>
    </span>
  );
}

function FoeCard({ state, id, current, onChoose }: { state: GameState; id: FoeId; current: boolean; onChoose: () => void }) {
  const f = FOE_DEFS[id];
  const calmed = f.boss && state.cellar.gifts.includes(id as keyof typeof GIFTS);
  const r = readiness(state, id);
  const art = (
    <span className="art fc-art">
      <img src={FOE_ART[id].art} alt="" />
    </span>
  );
  const tag = calmed ? <span className="calmed">✓ Calmed</span> : <ReadyTag tag={r.tag} wins={r.wins} boss={f.boss} still />;
  const locked = canFight(state, id)?.startsWith("Needs Warding");
  return (
    <button type="button" className={`fcard ${f.boss ? "is-boss" : ""}`} aria-current={current} onClick={onChoose}>
      {art}
      <span className="fc-body">
        {f.boss && <span className="label">Boss</span>}
        <span className="fc-name">{foeName(id)}</span>
        {tag}
        <FoeStats state={state} id={id} />
        {f.boss && (
          <span className="foe-extra">
            {calmed ? (
              <span className="gift is-kept">Gift kept</span>
            ) : (
              <span className="t-2">Calm him to open the crypt. His gift: +5% speed in every skill.</span>
            )}
          </span>
        )}
        {locked && (
          <span className="lock">
            <CellarIcon glyph="lock" size={14} />
            Warding {f.level}
          </span>
        )}
      </span>
    </button>
  );
}

function GoBar({ state, foe, act }: { state: GameState; foe: FoeId; act: Act }) {
  const f = FOE_DEFS[foe];
  const r = readiness(state, foe);
  const why = canFight(state, foe);
  const calmed = f.boss === true && state.cellar.gifts.includes(foe as keyof typeof GIFTS);
  const specials = [...(f.special ? [`every ${ordinal(f.special.every)} blow: ${f.special.name} ×${f.special.mult}`] : []), ...(f.telling ? [`telling blows ${Math.round(f.telling * 100)}%`] : [])];
  return (
    <article className="panel go-bar" aria-labelledby="chosen-h">
      <span className="portrait" style={{ ["--s" as string]: "48px" }}>
        <img src={FOE_ART[foe].icon} alt="" />
      </span>
      <div className="go-what">
        <h2 id="chosen-h">{foeName(foe)}</h2>
        {specials.length ? (
          <span className="warn-line">◆ {specials.join(" · ")}</span>
        ) : (
          <span className="t-2">Leaves {f.loot.map((l) => `${l.item === "curio" ? "curio" : ITEMS[l.item as ItemId].name.toLowerCase()} ${Math.round(l.chance * 100)}%`).join(" · ")}</span>
        )}
      </div>
      {calmed ? (
        <span className="gift is-kept">Calmed · his gift is kept</span>
      ) : why === null || !why.startsWith("Needs Warding") ? (
        <ReadyTag tag={r.tag} wins={r.wins} large boss={f.boss} remediesLast={r.remediesLast} />
      ) : (
        <span />
      )}
      {calmed ? null : why ? (
        <button className="btn" disabled>
          {why.replace(/\.$/, "")}
        </button>
      ) : (
        <button className="btn btn-primary btn-begin" onClick={() => act((s) => beginFight(s, foe))}>
          Begin
        </button>
      )}
    </article>
  );
}

function ordinal(n: number): string {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

// ---------- The fight ----------

function Stage({ state, act }: { state: GameState; act: Act }) {
  const fight = state.fight!;
  const f = FOE_DEFS[fight.foe];
  const name = foeName(fight.foe);
  const stats = combatStats(state);
  const art = useRef<HTMLSpanElement>(null);
  const hits = useRef<HTMLSpanElement>(null);
  const banner = useRef<HTMLSpanElement>(null);
  const youRow = useRef<HTMLDivElement>(null);
  const seen = useRef(fight.seq);
  const reduced = state.settings.reducedMotion;
  // Play each new line of the log on the art: shakes, lunges and the numbers popping up.
  useLayoutEffect(() => {
    const fresh = fight.log.filter((l) => l.n > seen.current);
    seen.current = fight.seq;
    if (reduced || fresh.length === 0) return;
    const kick = (el: HTMLElement | null, cls: string) => {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
    };
    for (const l of fresh.slice(-3)) {
      if (l.who === "you") {
        pop(hits.current, l.telling ? `✶ ${hp(l.amount)}` : `−${hp(l.amount)}`, l.telling ? "is-telling" : "");
        kick(art.current, l.down ? "is-down" : l.telling ? "is-crit" : "is-hit");
        if (l.telling && banner.current) {
          banner.current.textContent = "✶ Telling blow ×2";
          kick(banner.current, "is-on");
        }
        if (l.down) pop(hits.current, "Warded off", "is-down");
      } else {
        kick(art.current, "is-lunge");
        if (!l.missed) kick(youRow.current, "is-struck");
        if (l.special && banner.current) {
          banner.current.textContent = l.missed ? `◆ ${l.special}: it misses` : `◆ ${l.special}`;
          kick(banner.current, "is-on");
        }
      }
    }
  }, [fight.seq]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextMs = Math.min(fight.youMs, fight.foeMs);
  const nextWho = fight.youMs <= fight.foeMs ? "You" : name;
  const loot = Object.entries(fight.loot) as [ItemId, number][];
  const charm = state.cellar.gear.charm;
  return (
    <article className="panel stage" data-skill="warding" aria-labelledby="fight-h">
      <header className="stage-head">
        <span className="label">Warding · fighting</span>
        <h2 id="fight-h">{name}</h2>
        {!f.boss && (
          <span className="stage-count num">
            <b>{fight.beaten}</b>
            warded off
          </span>
        )}
        <button className="btn btn-ghost" onClick={() => act(stopFight)}>
          Stop
        </button>
      </header>
      <div className="arena">
        <div className={`foe-hp ${f.boss ? "is-temper" : ""}`}>
          <span className="who">
            <CellarIcon glyph="health" size={16} />
            {f.boss ? "Temper" : name}
          </span>
          <Bar value={fight.foeHealth / f.health} label={`${name} ${f.boss ? "Temper" : "Health"}`} />
          <span className="hp num">
            {hp(fight.foeHealth)}
            <span className="unit">/{f.health}</span>
          </span>
        </div>
        <div className="art-stage">
          <span className="candle-pool" aria-hidden="true" />
          <span className="art big" ref={art}>
            <img src={FOE_ART[fight.foe].art} alt={`The ${name}`} />
          </span>
          <span className="hits" ref={hits} aria-hidden="true" />
          <span className="banner" ref={banner} aria-hidden="true" />
        </div>
        <div className="beat">
          <span>Next blow</span>
          <TimedBar key={`${fight.seq}`} progress={0} durationMs={nextMs} label="Next blow" />
          <span className="beat-who">{nextWho}</span>
        </div>
        <div className="you-hp" ref={youRow}>
          <span className="who">
            <CandleIcon size={16} />
            You
          </span>
          <Bar value={state.cellar.health / stats.maxHealth} label="Your Health" />
          <span className="hp num">
            {hp(state.cellar.health)}
            <span className="unit">/{stats.maxHealth}</span>
          </span>
        </div>
      </div>
      <section className="tally">
        <span className="stat">
          <span className="label">Loot</span>
          <span className="loot">{loot.length ? loot.map(([item, n]) => <ItemChip key={item} item={item} qty={n} />) : <span className="t-2">None yet</span>}</span>
        </span>
        {state.cellar.gear.remedy && (
          <span className="stat">
            <span className="label">Remedies left</span>
            <b className="num">{fight.belt}</b>
          </span>
        )}
        {charm && (state.charms[charm] ?? 0) > 0 && (
          <span className="stat">
            <span className="label">{ITEMS[charm].name}</span>
            <b className="num">{state.charms[charm]}</b>
          </span>
        )}
      </section>
      <section className="log-sec">
        <ol className="log" aria-label="The last blows">
          {[...fight.log].reverse().slice(0, 4).map((l) => {
            const cls = [l.who === "you" ? "is-you" : "", l.telling ? "is-telling" : "", l.special ? "is-special" : "", l.heal ? "is-heal" : ""].join(" ");
            const g = l.telling ? "✶" : l.special ? "◆" : l.heal ? "+" : "·";
            const what = l.telling ? "Telling blow ×2" : l.special ? (l.missed ? `${l.special}: misses` : `${l.special} ×${f.special?.mult}`) : l.down ? (f.boss ? "Calmed" : "Warded off") : "";
            return (
              <li key={l.n} className={cls}>
                <span className="g" aria-hidden="true">{g}</span>
                <span className="who">
                  {l.who === "you" ? (
                    <span className="you-dot">
                      <CandleIcon size={14} />
                    </span>
                  ) : (
                    <span className="portrait">
                      <img src={FOE_ART[fight.foe].icon} alt="" />
                    </span>
                  )}
                  {l.who === "you" ? "You" : name}
                </span>
                <span className="what">
                  {what}
                  {l.heal ? `${what ? " · " : ""}${ITEMS[state.cellar.gear.remedy ?? "chamomile"].name} +${hp(l.heal)}` : ""}
                </span>
                <span className="dmg num">{l.missed ? "0" : hp(l.amount)}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}

function pop(host: HTMLElement | null, text: string, cls: string) {
  if (!host) return;
  const s = document.createElement("span");
  s.className = `hit ${cls}`;
  s.textContent = text;
  s.style.left = `${35 + Math.random() * 30}%`;
  s.style.top = `${30 + Math.random() * 25}%`;
  host.appendChild(s);
  setTimeout(() => s.remove(), 1000);
}

// ---------- How the last fight ended ----------

function FightSummary({ state, act }: { state: GameState; act: Act }) {
  const last = state.cellar.lastFight;
  if (!last || state.fight) return null;
  const name = foeName(last.foe);
  const loot = (Object.entries(last.loot) as [ItemId, number][]).map(([i, n]) => `${ITEMS[i].name.toLowerCase()} ×${n}`);
  const remedy = state.cellar.gear.remedy;
  const used = last.remediesUsed > 0 ? `${remedy ? ITEMS[remedy].name.toLowerCase() : "remedies"} ×${last.remediesUsed} used` : null;
  if (last.end === "calmed") return null;
  if (last.end !== "driven") {
    return (
      <div className="result" role="status">
        <span className="g" aria-hidden="true">■</span>
        <span className="what">
          <b>{last.end === "away" ? "Stopped when you left" : "Stopped"}</b> · <span className="num">{[`${name} ×${last.beaten}`, ...loot, ...(used ? [used] : [])].join(" · ")}</span>
          {last.end === "away" && <span className="meta"> Only Safe fights keep going while you're away.</span>}
        </span>
        <button className="btn btn-text btn-sm" onClick={() => act(dismissFightSummary)}>
          Dismiss
        </button>
      </div>
    );
  }
  const advice = adviceFor(state, last.foe, act);
  return (
    <section className="driven" role="status">
      <span className="portrait" style={{ ["--s" as string]: "56px" }}>
        <img src={FOE_ART[last.foe].icon} alt="" />
      </span>
      <div className="dv-body">
        <h3>
          <span>
            <Term id="driven">Driven off</Term> by the {name}
            {last.by ? ":" : ""}
          </span>
          {last.by && <span className="what-hit">◆ {last.by}</span>}
        </h3>
        <dl>
          <dt>Cost</dt>
          <dd>{[used, `the ${name}'s loot`].filter(Boolean).join(" · ")}</dd>
          <dt>Kept</dt>
          <dd>All your gear · {last.beaten} beaten{loot.length ? ` · ${loot.join(", ")}` : ""}</dd>
          <dt>Now</dt>
          <dd>Health comes back while you do other work.</dd>
        </dl>
        {advice && <div className="advice">{advice}</div>}
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => act(dismissFightSummary)}>
            Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}

/** One line of advice after being driven off, pointing at the fix the player can make (with a button when it's one click). */
function adviceFor(state: GameState, foe: FoeId, act: Act): ReactNode {
  const f = FOE_DEFS[foe];
  const stats = combatStats(state);
  const known = weaknessKnown(state, foe);
  const heldWith = (slot: Slot) => state.cellar.pieces.find((p) => PIECE_DEFS[p.id].slot === slot && PIECE_DEFS[p.id].tag === f.weakness);
  const wearIt = (slot: Slot, id: PieceId) => (
    <button className="btn btn-text btn-sm" onClick={() => act((s) => wear(s, slot, id))}>
      Wear it ›
    </button>
  );
  if (known && !strikesWith(stats, f.weakness)) {
    for (const slot of ["hand", "lantern"] as Slot[]) {
      const p = heldWith(slot);
      if (p) return <><span>It fears {f.weakness}, and you hold the {PIECE_DEFS[p.id].name.toLowerCase()}. With it, your blows hit half again as hard.</span>{wearIt(slot, p.id)}</>;
    }
  }
  if (known && stats.tags.amulet !== f.weakness) {
    const p = heldWith("amulet");
    if (p) return <><span>A {f.weakness} Amulet halves its blows, and you hold the {PIECE_DEFS[p.id].name.toLowerCase()}.</span>{wearIt("amulet", p.id)}</>;
    const make = PIECE_IDS.find((id) => PIECE_DEFS[id].slot === "amulet" && PIECE_DEFS[id].tag === f.weakness);
    if (make) return <span>A {f.weakness} Amulet halves its blows. Make the {PIECE_DEFS[make].name.toLowerCase()} with Crafting.</span>;
  }
  if (known && !strikesWith(stats, f.weakness)) {
    const make = PIECE_IDS.find((id) => ["hand", "lantern"].includes(PIECE_DEFS[id].slot) && PIECE_DEFS[id].tag === f.weakness);
    if (make) return <span>It fears {f.weakness}. Make the {PIECE_DEFS[make].name.toLowerCase()} with Crafting: your blows will hit half again as hard.</span>;
  }
  if (!state.cellar.gear.remedy || stats.beltCap === 0) return <span>Carry remedies: with a Belt and a remedy, your healing rule keeps you standing.</span>;
  return <span>Train Warding on an easier foe first. Each level adds Health and quicker blows.</span>;
}
