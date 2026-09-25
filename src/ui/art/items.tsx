import type { ReactNode } from "react";
import type { ItemId } from "../../content/items";
import { Icon, type IconProps } from "./icons";

// One small woodcut glyph per item (docs/DESIGN.md, icons): the same 24px grid, 1.75 stroke and
// currentColor as the rest of the set, so a chip colours it with the skill that makes it.

/** A candle body with a flame; `wide` for beeswax, `tall` for the hearth candle. */
const candle = (x: number, w: number, top: number) => (
  <>
    <path d={`M12 ${top - 5.5}c1.4 1.5 1.4 3 0 4.2-1.4-1.2-1.4-2.7 0-4.2Z`} fill="currentColor" />
    <rect x={x} y={top} width={w} height={20 - top} rx="1" />
  </>
);

/** A sprig: a stem with leaves in pairs. */
const sprig = (leaf: ReactNode) => (
  <>
    <path d="M12 21V6" />
    {leaf}
  </>
);

const GLYPHS: Record<ItemId, ReactNode> = {
  // Garden & forest
  nettle: sprig(<path d="M12 9 7.5 6.5 8.5 11 12 12M12 9l4.5-2.5-1 4.5L12 12M12 14l-4 -1 1 4 3 1M12 14l4-1-1 4-3 1" />),
  chamomile: (
    <>
      <path d="M12 21v-7" />
      <circle cx="12" cy="9" r="2" fill="currentColor" />
      <path d="M12 4.5v1.8M12 11.7v1.8M7.5 9h1.8M14.7 9h1.8M8.8 5.8l1.3 1.3M13.9 10.9l1.3 1.3M15.2 5.8l-1.3 1.3M10.1 10.9l-1.3 1.3" />
    </>
  ),
  yarrow: (
    <>
      <path d="M12 21v-9M12 12 8 8M12 12l4-4M12 12V7" />
      <circle cx="8" cy="7" r="1.5" fill="currentColor" />
      <circle cx="16" cy="7" r="1.5" fill="currentColor" />
      <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
    </>
  ),
  mugwort: sprig(<path d="M12 8c-3-1-4.5-3-4.5-3S10 5 12 8Zm0 0c3-1 4.5-3 4.5-3S14 5 12 8Zm0 5c-3.5-.5-5.5-3-5.5-3s3.5 0 5.5 3Zm0 0c3.5-.5 5.5-3 5.5-3s-3.5 0-5.5 3Zm0 4c-3-.3-4.5-2.3-4.5-2.3S10 14.5 12 17Zm0 0c3-.3 4.5-2.3 4.5-2.3S14 14.5 12 17Z" />),
  stjohns: (
    <>
      <path d="M12 21v-9" />
      <circle cx="12" cy="8" r="1.4" fill="currentColor" />
      <path d="M12 4v2.2M15.6 6.6l-1.9 1M14.4 11.2l-1.3-1.8M9.6 11.2l1.3-1.8M8.4 6.6l1.9 1" />
      <path d="M12 16c-2 0-3.5-1-3.5-1M12 16c2 0 3.5-1 3.5-1" />
    </>
  ),
  juniper: (
    <>
      <path d="M12 21V5M12 8 8 6M12 8l4-2M12 12 7.5 9.5M12 12l4.5-2.5M12 16l-5-2.5M12 16l5-2.5" />
      <circle cx="9" cy="17.5" r="1.3" fill="currentColor" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" />
    </>
  ),
  // House & village
  ash: (
    <>
      <path d="M4 19c2-4 5-6 8-6s6 2 8 6H4Z" />
      <path d="M10 10c0-1.5 1-2 1-3.5M14 10.5c0-1.5 1-2 1-3.5" />
    </>
  ),
  charcoal: <path d="M6 16 9 8l7-2 3 7-5 5-8-2Z M9 8l3 5 7 0M12 13l2 5" fill="none" />,
  tallow: (
    <>
      <path d="M6 10h12l-1 9H7L6 10Z" />
      <path d="M8 10c1-2.5 7-2.5 8 0" />
      <path d="M9 13.5c2 .8 4 .8 6 0" />
    </>
  ),
  salt: (
    <>
      <path d="M8 9h8v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9Z" />
      <path d="M9 9V6.5h6V9" />
      <path d="M10.5 4.5h.01M13.5 4.5h.01M12 3h.01" strokeWidth={2.4} />
    </>
  ),
  burnt_page: (
    <>
      <path d="M6 4h9l3 3v6l-2 1.5 1 2-2 1-.5 2.5H6V4Z" />
      <path d="M9 9h6M9 12h5" />
    </>
  ),
  rags: <path d="M5 8c3-2 5 1 8-1s5 0 6 1l-1 9c-2-1-4 1-7 0s-4 0-5 1L5 8Z M8 11c2 .5 4-.5 7 .5" />,
  glass: <path d="M8 4l4 3 5-2-1 7 3 5-8 3-4-6-2-5 3-5Z M12 7l-1 6 5 3" />,
  curio: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 7v10M7 12h10" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </>
  ),
  beeswax: (
    <>
      <path d="M12 4 18 7.5v7L12 18l-6-3.5v-7L12 4Z" />
      <path d="M12 11 18 7.5M12 11 6 7.5M12 11v7" />
    </>
  ),
  iron_nail: (
    <>
      <path d="M8 5h8" strokeWidth={2.6} />
      <path d="M12 5v12l-1.5 3M12 17l1.5 3" />
    </>
  ),
  chalk: (
    <>
      <path d="M5 15 15 5l4 4L9 19l-4-4Z" />
      <path d="M8 12l4 4" />
    </>
  ),
  // Candles & incense
  tallow_candle: candle(9, 6, 10),
  beeswax_candle: (
    <>
      {candle(8, 8, 10)}
      <path d="M8 13.5h8M8 16.5h8" />
    </>
  ),
  hearth_candle: (
    <>
      {candle(9.5, 5, 8)}
      <path d="M6 20h12" />
      <path d="M9.5 12l5 3M14.5 12l-5 3" />
    </>
  ),
  smudge: (
    <>
      <path d="M9 20c-1-5 0-10 3-15 3 5 4 10 3 15H9Z" />
      <path d="M9.5 15h5M10 11h4" />
    </>
  ),
  mugwort_incense: (
    <>
      <path d="M12 20V9" />
      <path d="M12 9c-1.5-1.5 1.5-2.5 0-4.5" />
      <path d="M7 20h10" />
    </>
  ),
  juniper_incense: (
    <>
      <path d="M8 20h8l1-4H7l1 4Z" />
      <path d="M12 16V9M12 9c-1.5-1.5 1.5-2.5 0-4.5M9 12l3-2 3 2" />
    </>
  ),
  // Sigils & wards
  salt_line: (
    <>
      <path d="M4 16c3-2 5 2 8 0s5-2 8 0" />
      <path d="M7 12h.01M11 11h.01M15 12h.01" strokeWidth={2.4} />
    </>
  ),
  ash_sigil: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 6v12M8 9l8 6M16 9l-8 6" />
    </>
  ),
  iron_ward: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 9h6M12 9v7" />
    </>
  ),
  chalk_segment: (
    <>
      <path d="M5 16a8 8 0 0 1 14 0" strokeDasharray="3 2" />
      <path d="M12 8v2" />
    </>
  ),
  hearth_ward: (
    <>
      <path d="M4 20V10l8-6 8 6v10H4Z" />
      <circle cx="12" cy="14" r="3" />
      <path d="M12 11v6M9 14h6" />
    </>
  ),
  // Pages & texts
  deciphered_page: (
    <>
      <path d="M6 4h9l3 3v13H6V4Z" />
      <path d="M15 4v3h3M9 10h6M9 13h6M9 16h4" />
    </>
  ),
  litany: (
    <>
      <path d="M6 5c2-1 4-1 6 1 2-2 4-2 6-1v14c-2-1-4-1-6 1-2-2-4-2-6-1V5Z" />
      <path d="M12 6v14" />
      <path d="M8.5 9h1.5M14 9h1.5" />
    </>
  ),
  bread: (
    <>
      <path d="M4 15c0-4 3.5-7 8-7s8 3 8 7v2H4v-2Z" />
      <path d="M8 11l1.5 2M12 10.5v2.5M16 11l-1.5 2" />
    </>
  ),
  // Rites
  consecrated_salt: (
    <>
      <path d="M6 18c2-3 4-4 6-4s4 1 6 4H6Z" />
      <path d="M12 3v6M9 6h6" />
    </>
  ),
};

/** An item's glyph, in currentColor. */
export function ItemIcon({ item, ...p }: IconProps & { item: ItemId }) {
  return <Icon {...p}>{GLYPHS[item]}</Icon>;
}
