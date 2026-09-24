import type { ItemDef } from "./types";

/** Where things come from; the pantry groups items this way. */
export const ITEM_CATEGORIES = {
  garden: { name: "Garden & forest" },
  house: { name: "House & village" },
  candles: { name: "Candles & incense" },
  sigils: { name: "Sigils & wards" },
  pages: { name: "Pages & texts" },
  rites: { name: "Rites" },
} as const;

export type ItemCategory = keyof typeof ITEM_CATEGORIES;

export const ITEMS = {
  // Herbalism
  nettle: { name: "Nettle", category: "garden" },
  chamomile: { name: "Chamomile", category: "garden" },
  yarrow: { name: "Yarrow", category: "garden" },
  mugwort: { name: "Mugwort", category: "garden", description: "The dream-herb." },
  stjohns: { name: "St John's wort", category: "garden", description: "The Kupala herb." },
  juniper: { name: "Juniper", category: "garden" },
  // Scavenging
  ash: { name: "Ash", category: "house" },
  charcoal: { name: "Charcoal", category: "house" },
  tallow: { name: "Tallow", category: "house" },
  salt: { name: "Salt", category: "house" },
  burnt_page: { name: "Burnt page", category: "pages", description: "What's left of grandmother's grimoire." },
  rags: { name: "Rags", category: "house" },
  glass: { name: "Glass shard", category: "house" },
  curio: { name: "Curio", category: "house", description: "Odd keepsakes. Each one is read when found, and remembered in the Grimoire's margins." },
  beeswax: { name: "Beeswax", category: "house" },
  iron_nail: { name: "Iron nail", category: "house" },
  chalk: { name: "Chalk", category: "house" },
  // Chandlery
  tallow_candle: { name: "Tallow candle", category: "candles" },
  smudge: { name: "Smudge bundle", category: "candles" },
  beeswax_candle: { name: "Beeswax candle", category: "candles" },
  mugwort_incense: { name: "Mugwort incense", category: "candles" },
  hearth_candle: { name: "Hearth candle", category: "candles" },
  juniper_incense: { name: "Juniper incense", category: "candles" },
  // Sigilcraft
  salt_line: { name: "Salt line", category: "sigils" },
  ash_sigil: { name: "Ash sigil", category: "sigils" },
  iron_ward: { name: "Iron ward", category: "sigils" },
  chalk_segment: { name: "Chalk segment", category: "sigils" },
  hearth_ward: { name: "Hearth ward", category: "sigils" },
  // Scholarship
  deciphered_page: { name: "Deciphered page", category: "pages" },
  litany: { name: "Grandmother's Litany", category: "pages", description: "The focus for the Hearth-Circle." },
  // Village
  bread: { name: "Bread", category: "house", description: "For the offering of bread and salt." },
  // Ritualism
  consecrated_salt: { name: "Consecrated salt", category: "rites" },
} as const satisfies Record<string, ItemDef>;

export type ItemId = keyof typeof ITEMS;
export const ITEM_DEFS: Record<ItemId, ItemDef> = ITEMS;
