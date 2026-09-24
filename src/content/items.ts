import type { ItemDef } from "./types";

export const ITEMS = {
  // Herbalism
  nettle: { name: "Nettle" },
  chamomile: { name: "Chamomile" },
  yarrow: { name: "Yarrow" },
  mugwort: { name: "Mugwort", description: "The dream-herb." },
  stjohns: { name: "St John's wort", description: "The Kupala herb." },
  juniper: { name: "Juniper" },
  // Scavenging
  ash: { name: "Ash" },
  charcoal: { name: "Charcoal" },
  tallow: { name: "Tallow" },
  salt: { name: "Salt" },
  burnt_page: { name: "Burnt page", description: "What's left of grandmother's grimoire." },
  rags: { name: "Rags" },
  glass: { name: "Glass shard" },
  curio: { name: "Curio" },
  beeswax: { name: "Beeswax" },
  iron_nail: { name: "Iron nail" },
  chalk: { name: "Chalk" },
  // Chandlery
  tallow_candle: { name: "Tallow candle" },
  smudge: { name: "Smudge bundle" },
  beeswax_candle: { name: "Beeswax candle" },
  mugwort_incense: { name: "Mugwort incense" },
  hearth_candle: { name: "Hearth candle" },
  juniper_incense: { name: "Juniper incense" },
  // Sigilcraft
  salt_line: { name: "Salt line" },
  ash_sigil: { name: "Ash sigil" },
  iron_ward: { name: "Iron ward" },
  chalk_segment: { name: "Chalk segment" },
  hearth_ward: { name: "Hearth ward" },
  // Scholarship
  deciphered_page: { name: "Deciphered page" },
  litany: { name: "Grandmother's Litany", description: "The focus for the Hearth-Circle." },
  // Village
  bread: { name: "Bread", description: "For the offering of bread and salt." },
  // Ritualism
  consecrated_salt: { name: "Consecrated salt" },
} as const satisfies Record<string, ItemDef>;

export type ItemId = keyof typeof ITEMS;
