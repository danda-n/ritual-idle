import { AFFIX_POOLS, FOE_DEFS, PIECE_DEFS, type Affix, type AffixKind, type FoeId, type PieceDef, type PieceId, type Slot } from "../content/combat";
import type { Readiness } from "../engine/combat";
import type { CellarGlyph } from "./art/cellarIcons";
import skrzatArt from "../assets/foes/skrzat_art.jpg";
import skrzatIcon from "../assets/foes/skrzat_icon.jpg";
import kikimoraArt from "../assets/foes/kikimora_art.jpg";
import kikimoraIcon from "../assets/foes/kikimora_icon.jpg";
import zmoraArt from "../assets/foes/zmora_art.jpg";
import zmoraIcon from "../assets/foes/zmora_icon.jpg";
import domovoiArt from "../assets/foes/domovoi_art.jpg";
import domovoiIcon from "../assets/foes/domovoi_icon.jpg";

// Words, glyphs and art for the cellar's screens (docs/design_handoff/CELLAR.md). Numbers come from
// the data; these only say them.

/** Each foe's woodcut: the big art and the round portrait (from the design handoff). */
export const FOE_ART: Record<FoeId, { art: string; icon: string }> = {
  skrzat: { art: skrzatArt, icon: skrzatIcon },
  kikimora: { art: kikimoraArt, icon: kikimoraIcon },
  zmora: { art: zmoraArt, icon: zmoraIcon },
  domovoi: { art: domovoiArt, icon: domovoiIcon },
};

export const PIECE_GLYPH: Record<PieceId, CellarGlyph> = {
  salt_pouch: "saltPouch",
  iron_knife: "knife",
  tallow_lantern: "tallowLantern",
  herb_belt: "herbBelt",
  censer: "censer",
  embroidered_shirt: "shirt",
  iron_amulet: "ironAmulet",
  hearth_poker: "poker",
};

export const SLOT_GLYPH: Record<Slot, CellarGlyph> = { amulet: "ironAmulet", hand: "slotHand", lantern: "tallowLantern", garment: "shirt", belt: "herbBelt" };

/** The readiness word as a data attribute, and its pips (0–4). */
export const READY: Record<Readiness, { key: string; pips: number }> = {
  Safe: { key: "safe", pips: 4 },
  Likely: { key: "likely", pips: 3 },
  Risky: { key: "risky", pips: 2 },
  Deadly: { key: "deadly", pips: 1 },
  Hopeless: { key: "hopeless", pips: 0 },
};

const AFFIX_WORDS: Record<AffixKind, (v: string) => string> = {
  ward: (v) => `Ward +${v}`,
  health: (v) => `Health +${v}`,
  strike: (v) => `Strike +${v}`,
  speed: (v) => `Speed +${v}%`,
  telling: (v) => `Telling blows +${v}%`,
  specials: (v) => `Special attacks −${v}%`,
  loot: (v) => `Loot chances +${v}%`,
  xp: (v) => `Warding XP +${v}%`,
  perFoe: (v) => `+${v} Health per foe beaten`,
  beltCap: (v) => `Holds +${v}`,
  remedyHeal: (v) => `Remedies heal +${v}%`,
};

/** An affix in words: "Strike +2", "Speed +4%". */
export function affixText(a: Affix): string {
  return AFFIX_WORDS[a.kind](String(a.value));
}

/** A pool entry's range: "Strike +1–2". */
export function affixRange(kind: AffixKind, min: number, max: number): string {
  return AFFIX_WORDS[kind](min === max ? String(min) : `${min}–${max}`);
}

/** What a slot's random affix can roll, in words. */
export function poolText(slot: Slot): string[] {
  return AFFIX_POOLS[slot].map((p) => affixRange(p.kind, p.min, p.max));
}

/** A piece's base stat, the big number on its tile: "Ward 10", "Strike 5", "Health +15", "Holds 10". */
export function baseText(def: PieceDef): string {
  if (def.base.ward) return `Ward ${def.base.ward}`;
  if (def.base.strike) return `Strike ${def.base.strike}`;
  if (def.base.health) return `Health +${def.base.health}`;
  if (def.base.beltCap) return `Holds ${def.base.beltCap}`;
  return "";
}

/** A piece's fixed identity: its tag, or its trait. */
export function fixedText(id: PieceId): string {
  const def = PIECE_DEFS[id];
  return def.tag ?? (def.fixed ? affixText(def.fixed) : "");
}

/** A foe's short name: "Skrzat", "Domovoi" (the card's title keeps "The sour Domovoi" only in the Bestiary line). */
export function foeName(id: FoeId): string {
  return FOE_DEFS[id].name.replace(/^The (sour )?/, "");
}

/** A number for the fight screen: one decimal under 100. */
export function hp(n: number): string {
  const v = Math.max(0, n);
  return v >= 100 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(v % 1 === 0 ? 0 : 1);
}
