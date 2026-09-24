import type { ItemId } from "./items";
import type { RequestDef } from "./types";

// The village request board (docs/CHAPTER1.md §4). Three requests show at a time;
// better ones appear as trust grows. Coin only ever comes from here.
export const REQUESTS = {
  hana_soup: {
    from: "Widow Hana",
    text: "Nettle soup, for the widow Hana. My legs won't carry me to the ditch any more.",
    needs: { nettle: 10 },
    coin: 6,
    trust: 1,
    minTrust: 0,
    mentions: { recipe: "dream_pillow", aside: "Your grandmother made me a pillow once, for the bad dreams. Bitter-smelling. It worked." },
  },
  millers_cough: {
    from: "The miller",
    text: "Something for the miller's cough. It rattles all night.",
    needs: { chamomile: 5, yarrow: 2 },
    coin: 12,
    trust: 1,
    minTrust: 0,
  },
  lye_ash: {
    from: "The soapmaker",
    text: "Ash for the lye. The kettle's been cold a week.",
    needs: { ash: 15 },
    coin: 5,
    trust: 1,
    minTrust: 0,
  },
  grave_candles: {
    from: "Old Tomas",
    text: "Candles for my father's grave. He never liked the dark.",
    needs: { tallow_candle: 3 },
    coin: 10,
    trust: 1,
    minTrust: 0,
  },
  stable_mark: {
    from: "The Kral farm",
    text: "A mark over the stable door. The cow won't milk.",
    needs: { ash_sigil: 1 },
    coin: 15,
    trust: 1,
    minTrust: 2,
    mentions: { recipe: "hearth_mark", aside: "She drew a mark on our hearth once, with her finger and the ashes. Salt on top. Never went out after." },
  },
  smoke_loft: {
    from: "The weaver",
    text: "Smoke out whatever is in my loft. It walks when we sleep.",
    needs: { smudge: 1 },
    coin: 20,
    trust: 1,
    minTrust: 3,
  },
  sickroom_smoke: {
    from: "The sexton's wife",
    text: "Juniper smoke for the sickroom. The fever won't break.",
    needs: { juniper_incense: 1 },
    coin: 25,
    trust: 2,
    minTrust: 3,
  },
  iron_cradle: {
    from: "A young mother",
    text: "Iron by the cradle. Please. She cries at the window every night.",
    needs: { iron_ward: 1 },
    coin: 30,
    trust: 2,
    minTrust: 5,
    mentions: { recipe: "threshold_nail", aside: "My mother said the witch kept a nail under her own door, and a yellow flower with it." },
  },
} as const satisfies Record<string, RequestDef<ItemId>>;

export type RequestId = keyof typeof REQUESTS;

/** Slots on the board, and how long (sim time) an emptied slot waits for a new knock. */
export const BOARD_SLOTS = 3;
export const REFILL_MS = 30_000;
