import type { ItemId } from "./items";
import type { RequestDef } from "./types";

// Village contracts (docs/CHAPTER1.md §4). Two show at a time; each asks for a good amount of
// one or two things, and can be delivered in parts. Better ones appear as trust grows.
// Coin only ever comes from here. The card shows `label`; `text` is the hover title.
// Asides are puzzle hints (docs/GRIMOIRE.md §8): keep what they point at when editing them.
export const REQUESTS = {
  hana_soup: {
    from: "Widow Hana",
    label: "Nettle soup",
    text: "Nettle soup, for the widow Hana. My legs won't carry me to the ditch any more.",
    needs: { nettle: 30, chamomile: 10 },
    coin: 15,
    trust: 1,
    minTrust: 0,
    mentions: { recipe: "dream_pillow", aside: "Grandmother made me a pillow for bad dreams. Bitter-smelling." },
  },
  millers_cough: {
    from: "The miller",
    label: "Cough remedy",
    text: "Something for the miller's cough. It rattles all night.",
    needs: { chamomile: 15, yarrow: 8 },
    coin: 30,
    trust: 1,
    minTrust: 2,
  },
  lye_ash: {
    from: "The soapmaker",
    label: "Lye ash",
    text: "Ash for the lye. The kettle's been cold a week.",
    needs: { ash: 40 },
    coin: 12,
    trust: 1,
    minTrust: 0,
  },
  grave_candles: {
    from: "Old Tomas",
    label: "Grave candles",
    text: "Candles for my father's grave. He never liked the dark.",
    needs: { tallow_candle: 12 },
    coin: 20,
    trust: 1,
    minTrust: 0,
  },
  doorstep_salt: {
    from: "The ferryman's wife",
    label: "Doorstep salt",
    text: "Salt across our doorstep. He says he hears someone wading behind him on the way home.",
    needs: { salt_line: 12 },
    coin: 18,
    trust: 1,
    minTrust: 0,
  },
  stable_mark: {
    from: "The Kral farm",
    label: "Stable mark",
    text: "A mark over the stable door. The cow won't milk.",
    needs: { ash_sigil: 4, salt_line: 6 },
    coin: 40,
    trust: 1,
    minTrust: 2,
    mentions: { recipe: "hearth_mark", aside: "She drew a mark on our hearth in ash. Salt on top." },
  },
  smoke_loft: {
    from: "The weaver",
    label: "Smoke the loft",
    text: "Smoke out whatever is in my loft. It walks when we sleep.",
    needs: { smudge: 4 },
    coin: 45,
    trust: 1,
    minTrust: 3,
  },
  sickroom_smoke: {
    from: "The sexton's wife",
    label: "Sickroom smoke",
    text: "Juniper smoke for the sickroom. The fever won't break.",
    needs: { juniper_incense: 3 },
    coin: 60,
    trust: 2,
    minTrust: 3,
  },
  iron_cradle: {
    from: "A young mother",
    label: "Cradle iron",
    text: "Iron by the cradle. Please. She cries at the window every night.",
    needs: { iron_ward: 3, salt_line: 6 },
    coin: 70,
    trust: 2,
    minTrust: 5,
    mentions: { recipe: "threshold_nail", aside: "The witch kept a nail under her door, and a yellow flower." },
  },
  wake_candles: {
    from: "The Dvorak family",
    label: "Wake candles",
    text: "Candles for the wake. Good ones. Grandfather should find his way.",
    needs: { hearth_candle: 4, beeswax_candle: 4 },
    coin: 80,
    trust: 2,
    minTrust: 4,
  },
  church_ward: {
    from: "The sexton",
    label: "Church ward",
    text: "A ward for the church door. Don't tell the priest who made it.",
    needs: { hearth_ward: 1, chalk_segment: 4 },
    coin: 110,
    trust: 2,
    minTrust: 5,
  },
} as const satisfies Record<string, RequestDef<ItemId>>;

export type RequestId = keyof typeof REQUESTS;

/** Slots on the board, and how long (sim time) an emptied slot waits for a new knock. */
export const BOARD_SLOTS = 2;
export const REFILL_MS = 30_000;
