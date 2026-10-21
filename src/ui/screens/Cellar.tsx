import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CHARM_IDS, type CharmId } from "../../content/charms";
import { BASE, FOE_DEFS, FOE_IDS, GIFTS, MASTERY, PIECE_DEFS, PIECE_IDS, REMEDIES, REMEDY_IDS, SETS, SLOT_DEFS, SLOTS, type FoeId, type PieceId, type Slot, type StopRule } from "../../content/combat";
import { ITEMS, type ItemId } from "../../content/items";
import { beginFight, setStopRule, deleteLoadout, dismissFightSummary, saveLoadout, setCharm, setHealAt, setRemedy, stopFight, useRemedy, wear, wearLastFor, wearLoadout, type Result } from "../../engine/commands";
import { READINESS, canFight, combatStats, mastery, matchup, pieceAffixes, pieceOf, readiness, roughChance, strikesWith, timeToFullMs, wardingLevel, weaknessAfter, weaknessKnown, type Readiness } from "../../engine/combat";
import { loadoutSlots } from "../../engine/modifiers";
import type { FightTally, GameState } from "../../engine/state";
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
import { formatDuration, formatRate } from "../format";
import { TALENT_LEVELS } from "../../content/talents";
import { levelProgress, xpForLevel } from "../../engine/xp";

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
      <CellarHero onIntro={onIntro} />
      <div className="cellar">
        <div className="col col-you">
          <WardingPanel state={state} />
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

function CellarHero({ onIntro }: { onIntro: () => void }) {
  return (
    <header className="hero is-cellar is-quiet">
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
    </header>
  );
}

// ---------- Warding: what the skill is and where it's going ----------

function WardingPanel({ state }: { state: GameState }) {
  const level = wardingLevel(state);
  const xp = state.skills.warding.xp;
  const atCap = level >= state.levelCap;
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  const xpLine = FOE_IDS.filter((f) => !FOE_DEFS[f].boss).map((f) => `the ${foeName(f)} ${FOE_DEFS[f].xp}`).join(", ");
  const nextTalent = TALENT_LEVELS.find((l) => l > level);
  const nextFoe = FOE_IDS.find((f) => FOE_DEFS[f].level > level);
  const fight = state.fight;
  const perHour = fight && fight.ms > 30_000 ? (fight.xp / fight.ms) * 3_600_000 : null;
  return (
    <section className="panel warding" data-skill="warding" aria-labelledby="warding-h">
      <header className="warding-head">
        <SkillIcon skill="warding" size={22} />
        <h2 id="warding-h">
          <Term id="warding">Warding</Term>
        </h2>
        <span className="num warding-level">
          Level <b>{level}</b> of {state.levelCap}
        </span>
      </header>
      <Bar value={atCap ? 1 : levelProgress(xp, state.levelCap)} label="Warding XP to the next level" />
      <p className="warding-xp num">{atCap ? "At the cap for now" : `${Math.floor(xp - from)} / ${to - from} XP to level ${level + 1}`}{perHour ? ` · ${formatRate(perHour)} XP/h now` : ""}</p>
      <p className="warding-what">
        Warding is how you fight. Every foe you ward off gives Warding XP: {xpLine}. Each level gives you 2 more Health and makes your blows 1% quicker, but most of your strength comes from your gear.
      </p>
      {(nextTalent || nextFoe) && (
        <p className="warding-next">
          {nextFoe && <span>The {foeName(nextFoe)} at level {FOE_DEFS[nextFoe].level}</span>}
          {nextTalent && <span>A talent at level {nextTalent}</span>}
        </p>
      )}
    </section>
  );
}

// ---------- You ----------

function YouPanel({ state, foe, act, onCraft }: { state: GameState; foe: FoeId; act: Act; onCraft: () => void }) {
  const [tab, setTab] = useState<"gear" | "stats">("gear");
  const stats = combatStats(state);
  const noStrike = !state.cellar.gear.worn.hand && !state.cellar.gear.worn.lantern;
  const full = state.cellar.health >= stats.maxHealth;
  return (
    <article className="panel you" aria-label="You">
      <section className="you-head">
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
          <MeStat label="Health" value={stats.maxHealth} />
          <MeStat label="Ward" value={Math.round(stats.ward)} />
          <MeStat label="Strike" value={Math.round(stats.strike * 10) / 10} zero={noStrike} />
          <MeStat label="Blow every" value={<>{(stats.blowMs / 1000).toFixed(1)}<span className="unit">s</span></>} />
        </div>
        {noStrike && <p className="me-warn">No Hand or Lantern piece: you strike with your bare hands.</p>}
        {!state.fight && !full && (
          <div className="health-now">
            <span className="num">
              Health {Math.floor(state.cellar.health)}/{stats.maxHealth}
            </span>
            <Bar value={state.cellar.health / stats.maxHealth} label="Health now" />
            <span className="num">full in {formatDuration(timeToFullMs(state))}</span>
          </div>
        )}
      </section>
      <section>{tab === "stats" ? <StatsTab state={state} foe={foe} /> : <GearTab state={state} foe={foe} act={act} onCraft={onCraft} />}</section>
    </article>
  );
}

function MeStat({ label, value, zero }: { label: string; value: ReactNode; zero?: boolean }) {
  return (
    <div className={`me-stat ${zero ? "is-zero" : ""}`}>
      <span className="label">{label}</span>
      <b className="num">{value}</b>
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
                {PIECE_DEFS[piece.id].name}
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
          {held.length === 0 && <p className="pick-empty">You have no {SLOT_DEFS[slot].name.toLowerCase()} pieces yet. Make one in the crafting window.</p>}
          {held.map((p) => {
            const def = PIECE_DEFS[p.id];
            const inUse = id === p.id;
            const match = def.tag !== undefined && weaknessKnown(state, foe) && def.tag === f.weakness;
            const pv = inUse ? null : preview(state, foe, slot, p.id);
            return (
              <button key={p.id} className="pick-row" role="option" aria-selected={inUse} aria-current={inUse} onClick={() => onPick(p.id)}>
                <span className="ic" data-skill="crafting">
                  <CellarIcon glyph={PIECE_GLYPH[p.id]} size={20} />
                </span>
                <span className="nm">
                  {def.name}
                  {match && <span className="match">Its weakness</span>}
                </span>
                <span className="n">{inUse ? <span className="delta same">in use</span> : pv && <PreviewTag pv={pv} />}</span>
                <span className="gv">
                  <span className="num">{baseText(def)}</span>
                  {def.tag ? <span className="tag">{def.tag}</span> : <span>{fixedText(p.id)}</span>}
                  {pieceAffixes(p).filter((a) => a !== def.fixed).map((a, i) => (
                    <span key={i} className="num">{affixText(a)}</span>
                  ))}
                </span>
                {pv && <span className="pv-line num">{pv.lines.join(" · ")}</span>}
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

/** What putting a piece on would change against this foe: the readiness tag, and your blows and its blows. */
interface Preview {
  from: Readiness;
  to: Readiness;
  lines: string[];
}

function preview(state: GameState, foe: FoeId, slot: Slot, piece: PieceId | null): Preview {
  const now = state.cellar.gear;
  const next = { ...now, worn: { ...now.worn } };
  if (piece) next.worn[slot] = piece;
  else delete next.worn[slot];
  const a = matchup(state, foe, now);
  const b = matchup(state, foe, next);
  const lines: string[] = [];
  const say = (what: string, x: number, y: number) => Math.abs(x - y) >= 0.05 && lines.push(`${what} ${hp(x)} → ${hp(y)}`);
  say("Your blows", a.yourBlow, b.yourBlow);
  say("Its blows", a.itsBlow, b.itsBlow);
  if (a.stats.maxHealth !== b.stats.maxHealth) lines.push(`Health ${a.stats.maxHealth} → ${b.stats.maxHealth}`);
  return { from: readiness(state, foe, now).tag, to: readiness(state, foe, next).tag, lines };
}

function PreviewTag({ pv }: { pv: Preview }) {
  if (pv.from === pv.to) return <span className="delta same">{pv.to}</span>;
  const up = READINESS.indexOf(pv.to) > READINESS.indexOf(pv.from);
  return (
    <span className={`delta ${up ? "up" : "down"}`}>
      {pv.from} → {pv.to}
    </span>
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
          {list.length === 0 && <p className="pick-empty">You have no charms. Bind them at Experiments, or make a red thread knot with Crafting.</p>}
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

function FoeCard({ state, id, current, onChoose }: { state: GameState; id: FoeId; current: boolean; onChoose: () => void }) {
  const f = FOE_DEFS[id];
  const calmed = f.boss && state.cellar.gifts.includes(id as keyof typeof GIFTS);
  const r = readiness(state, id);
  const locked = canFight(state, id)?.startsWith("Needs Warding");
  const known = weaknessKnown(state, id);
  return (
    <button type="button" className={`fcard ${f.boss ? "is-boss" : ""}`} aria-current={current} onClick={onChoose}>
      <span className="art fc-art">
        <img src={FOE_ART[id].art} alt="" />
      </span>
      <span className="fc-body">
        {f.boss && <span className="label">Boss</span>}
        <span className="fc-name">{foeName(id)}</span>
        {locked ? <span className="lock">Opens at Warding {f.level}</span> : calmed ? <span className="calmed">✓ Calmed</span> : <ReadyTag tag={r.tag} wins={r.wins} boss={f.boss} still />}
        <span className="fc-fears">Fears {known ? <b>{f.weakness}</b> : "?"}</span>
        {f.boss && !calmed && <span className="t-2 fc-line">Calm him to open the way down. His gift: +5% speed in every skill.</span>}
      </span>
    </button>
  );
}

function GoBar({ state, foe, act }: { state: GameState; foe: FoeId; act: Act }) {
  const f = FOE_DEFS[foe];
  const r = readiness(state, foe);
  const why = canFight(state, foe);
  const calmed = f.boss === true && state.cellar.gifts.includes(foe as keyof typeof GIFTS);
  const specials = [...(f.special ? [`every ${ordinal(f.special.every)} blow is ${f.special.name}, ×${f.special.mult}`] : []), ...(f.telling ? [`${Math.round(f.telling * 100)}% of its blows are telling blows`] : [])];
  const m = mastery(state, foe);
  const beaten = state.cellar.beaten[foe] ?? 0;
  const nextTier = MASTERY[m.tier];
  return (
    <article className="panel go-bar" aria-labelledby="chosen-h">
      <div className="go-top">
        <span className="portrait" style={{ ["--s" as string]: "48px" }}>
          <img src={FOE_ART[foe].icon} alt="" />
        </span>
        <div className="go-what">
          <h2 id="chosen-h">{foeName(foe)}</h2>
          <span className="t-2 num">
            {f.boss ? "Temper" : "Health"} {f.health} · Strike {f.strike} · Ward {f.ward} · a blow every {(f.blowMs / 1000).toFixed(1)} s
          </span>
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
      </div>
      <dl className="go-facts">
        {specials.length > 0 && (
          <>
            <dt>Watch for</dt>
            <dd className="warn-line">{specials.join(" · ")}</dd>
          </>
        )}
        {f.loot.length > 0 && (
          <>
            <dt>Leaves</dt>
            <dd>{f.loot.map((l) => `${l.item === "curio" ? "a curio" : ITEMS[l.item as ItemId].name.toLowerCase()} ${Math.round(l.chance * 100) || 1}%`).join(" · ")}</dd>
          </>
        )}
        {!f.boss && (
          <>
            <dt>
              <Term id="mastery">Mastery</Term>
            </dt>
            <dd className="num">
              {beaten} beaten{m.tier > 0 ? ` · ${MASTERY.slice(0, m.tier).map((t) => t.text.toLowerCase()).join(", ")}` : ""}
              {nextTier && <span className="t-2"> · at {nextTier.beaten}: {nextTier.text.toLowerCase()}</span>}
            </dd>
          </>
        )}
        {!calmed && !f.boss && (
          <>
            <dt>Stops</dt>
            <dd>
              <StopRuleControl state={state} foe={foe} act={act} />
            </dd>
          </>
        )}
      </dl>
    </article>
  );
}

/** When the fight stops by itself (docs/COMBAT.md §5). */
function StopRuleControl({ state, foe, act }: { state: GameState; foe: FoeId; act: Act }) {
  const rule = state.cellar.stopRule;
  const leavings = FOE_DEFS[foe].loot.filter((l) => l.item !== "curio").map((l) => l.item as ItemId);
  const set = (r: StopRule) => act((s) => setStopRule(s, r));
  const num = (n: number) => (
    <input
      className="field stop-n num"
      type="number"
      min={1}
      max={9999}
      aria-label="How many"
      value={n}
      onChange={(e) => {
        const v = Math.max(1, Math.min(9999, Math.round(Number(e.target.value) || 1)));
        if (rule.kind === "foes") set({ kind: "foes", n: v });
        if (rule.kind === "item") set({ kind: "item", item: rule.item, n: v });
      }}
    />
  );
  return (
    <span className="stop-rule">
      <select
        className="field"
        aria-label="When the fight stops"
        value={rule.kind}
        onChange={(e) => {
          const k = e.target.value;
          if (k === "never") set({ kind: "never" });
          if (k === "foes") set({ kind: "foes", n: 50 });
          if (k === "item") set({ kind: "item", item: leavings[0] ?? "lost_button", n: 10 });
          if (k === "remedies") set({ kind: "remedies" });
        }}
      >
        <option value="never">Never: keep going until I stop it</option>
        <option value="foes">After a number of foes</option>
        <option value="item">When I hold enough of a leaving</option>
        <option value="remedies">When the Belt is empty</option>
      </select>
      {rule.kind === "foes" && <>{num(rule.n)} foes</>}
      {rule.kind === "item" && (
        <>
          {num(rule.n)}
          <select className="field" aria-label="Which leaving" value={rule.item} onChange={(e) => set({ kind: "item", item: e.target.value as ItemId, n: rule.n })}>
            {[...new Set([...leavings, rule.item])].map((i) => (
              <option key={i} value={i}>
                {ITEMS[i].name.toLowerCase()} (you hold {state.inventory[i] ?? 0})
              </option>
            ))}
          </select>
        </>
      )}
    </span>
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
  return (
    <article className="panel stage" data-skill="warding" aria-labelledby="fight-h">
      <header className="stage-head">
        <span className="label">Warding · fighting</span>
        <h2 id="fight-h">{name}</h2>
        {!f.boss && (
          <span className="stage-count num">
            <b>{fight.beaten}</b>
            warded off{ruleLeft(state, fight.beaten)}
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
      <Spoils state={state} foe={fight.foe} loot={fight.loot} />
      <FightNumbers state={state} foe={fight.foe} t={fight} beaten={fight.beaten} remediesUsed={fight.remediesUsed} beltLeft={state.cellar.gear.remedy ? fight.belt : null} live />
    </article>
  );
}

/** The stop rule's progress, for the fight's head: " · stops at 50". */
function ruleLeft(state: GameState, beaten: number): string {
  const r = state.cellar.stopRule;
  if (r.kind === "foes") return ` · stops at ${r.n} (${Math.max(0, r.n - beaten)} to go)`;
  if (r.kind === "item") return ` · stops at ${r.n} ${ITEMS[r.item].name.toLowerCase()} (you hold ${state.inventory[r.item] ?? 0})`;
  if (r.kind === "remedies") return " · stops when the Belt is empty";
  return "";
}

/** What the foe can leave, and what this fight has given: big, so a find is seen. */
function Spoils({ state, foe, loot }: { state: GameState; foe: FoeId; loot: Partial<Record<ItemId, number>> }) {
  const table = FOE_DEFS[foe].loot;
  const prev = useRef<Partial<Record<string, number>>>({ ...loot });
  const [fresh, setFresh] = useState<string[]>([]);
  const sig = JSON.stringify(loot);
  useEffect(() => {
    const got = (Object.keys(loot) as ItemId[]).filter((i) => (loot[i] ?? 0) > (prev.current[i] ?? 0));
    prev.current = { ...loot };
    if (got.length === 0) return;
    setFresh(got);
    const t = setTimeout(() => setFresh([]), 1200);
    return () => clearTimeout(t);
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = mastery(state, foe);
  if (table.length === 0) return null;
  return (
    <section className="spoils" aria-label="Spoils">
      <span className="label">Spoils this fight</span>
      <ul>
        {table.map((l) => {
          const id = l.item;
          const n = id === "curio" ? 0 : loot[id as ItemId] ?? 0;
          const chance = Math.min(100, l.chance * m.loot * combatStats(state).loot * 100);
          return (
            <li key={id} className={`spoil ${n > 0 ? "has" : ""} ${fresh.includes(id) ? "is-new" : ""}`}>
              <span className="spoil-ic" aria-hidden="true">
                {id === "curio" ? <CellarIcon glyph="button" size={26} /> : <ItemIcon item={id as ItemId} size={26} />}
              </span>
              <span className="spoil-name">
                {id === "curio" ? "Curio" : ITEMS[id as ItemId].name}
                <span className="t-2 num">
                  {chance < 1 ? chance.toFixed(1) : Math.round(chance)}% a foe{id !== "curio" ? ` · you hold ${state.inventory[id as ItemId] ?? 0}` : ""}
                </span>
              </span>
              {id !== "curio" && <b className="spoil-n num">+{n}</b>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The fight's own numbers, live and kept after it ends; and your records against this foe. */
function FightNumbers({ state, foe, t, beaten, remediesUsed, beltLeft, live }: { state: GameState; foe: FoeId; t: FightTally; beaten: number; remediesUsed: number; beltLeft: number | null; live?: boolean }) {
  const perHour = t.ms > 30_000 ? (t.xp / t.ms) * 3_600_000 : null;
  const rec = state.cellar.records[foe];
  const cell = (label: string, value: ReactNode, note?: ReactNode) => (
    <div className="fn">
      <span className="label">{label}</span>
      <b className="num">{value}</b>
      {note && <span className="t-2 num">{note}</span>}
    </div>
  );
  return (
    <section className="fight-numbers" aria-label={live ? "This fight" : "That fight"}>
      <span className="label">{live ? "This fight" : "That fight"}</span>
      <div className="fn-grid">
        {cell("Time", formatDuration(t.ms))}
        {!FOE_DEFS[foe].boss && cell("Warded off", beaten)}
        {cell("Warding XP", `+${Math.round(t.xp)}`, perHour ? `${formatRate(perHour)}/h` : undefined)}
        {cell("Your best blow", hp(t.bestDealt))}
        {cell("Worst blow taken", hp(t.worstTaken))}
        {cell("Remedies", remediesUsed, beltLeft !== null ? `${beltLeft} left` : undefined)}
      </div>
      {rec && (
        <p className="t-2 num fn-records">
          Your records against the {foeName(foe)}: best blow {hp(rec.bestDealt)} · worst taken {hp(rec.worstTaken)} · {rec.longestRun} in one fight
        </p>
      )}
    </section>
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
  const numbers = <FightNumbers state={state} foe={last.foe} t={last} beaten={last.beaten} remediesUsed={last.remediesUsed} beltLeft={null} />;
  const lootChips = (Object.entries(last.loot) as [ItemId, number][]).map(([i, n]) => <ItemChip key={i} item={i} qty={n} />);
  if (last.end !== "driven") {
    const title = last.end === "away" ? "Stopped when you left" : last.end === "rule" ? "Stopped by your rule" : "Stopped";
    return (
      <section className="result-card" role="status">
        <header>
          <b>
            {title} · {name}
          </b>
          <button className="btn btn-text btn-sm" onClick={() => act(dismissFightSummary)}>
            Dismiss
          </button>
        </header>
        {last.end === "away" && <p className="t-2">Only Safe fights keep going while you're away.</p>}
        {lootChips.length > 0 && <div className="result-loot">{lootChips}</div>}
        {numbers}
      </section>
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
        {numbers}
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
