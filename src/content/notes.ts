import type { ActionId } from "./actions";
import type { SkillId } from "./skills";
import type { NoteDef } from "./types";

// Grandmother's margin notes: the Chapter 1 spine (docs/CHAPTER1.md §2).
// The Kindling is built in five parts; each stage's note brings the one new skill that part needs.
// Each stage splits into small steps with small rewards, so there's always a next click.
// The first note is shown at the start of a new game; each goal reveals the next note.
export const NOTES = [
  {
    text: "The house is cold, child. Under the floor is my circle. It sleeps, and it will want waking: light, a ward, smoke, words and an offering, in that order. Start in the pantry.",
    quote: "The house is cold, child. Start in the pantry.",
    hint: "Search the pantry (Scavenging) for tallow.",
    unlocks: ["scavenging"],
    opens: ["circle"],
    steps: [
      { id: "start.pantry", label: "Search the pantry 10 times", goal: { kind: "complete", action: "search_pantry", count: 10 }, reward: { xp: { skill: "scavenging", amount: 30 } } },
      { id: "start.tend", label: "Tend your work once (the Tend button)", goal: { kind: "tended", count: 1 }, reward: { xp: { skill: "scavenging", amount: 40 } } },
    ],
    goal: { kind: "complete", action: "search_pantry", count: 10 },
  },
  {
    text: "Light is the first ward. Nothing that listens at the window likes a candle.",
    quote: "Light is the first ward.",
    hint: "Pour tallow candles (Chandlery). Beeswax comes from Rob the old hives (Scavenging 2).",
    unlocks: ["chandlery"],
    steps: [
      { id: "light.candles", label: "Pour 27 tallow candles", goal: { kind: "complete", action: "tallow_candle", count: 27 }, reward: { xp: { skill: "chandlery", amount: 20 } } },
      { id: "light.hives", label: "Rob the old hives 12 times (Scavenging 2)", goal: { kind: "complete", action: "rob_hives", count: 12 }, reward: { items: { salt: 4 } } },
      { id: "light.beeswax", label: "Pour 6 beeswax candles (Chandlery 2)", goal: { kind: "complete", action: "beeswax_candle", count: 6 }, reward: { items: { ash: 2 } } },
      { id: "light.place", label: "Place the Light in the Circle", goal: { kind: "place", part: "light" } },
    ],
    goal: { kind: "place", part: "light" },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    quote: "Salt keeps what is inside, inside.",
    hint: "Lay salt lines (Sigilcraft) with salt from the pantry. Ash sigils need ash from Sweep the hearth (Scavenging 2).",
    unlocks: ["sigilcraft"],
    steps: [
      { id: "ward.lines", label: "Lay 27 salt lines", goal: { kind: "complete", action: "salt_line", count: 27 }, reward: { items: { salt: 4 } } },
      { id: "ward.sweep", label: "Sweep the hearth 14 times (Scavenging 2)", goal: { kind: "complete", action: "sweep_hearth", count: 14 }, reward: { items: { ash: 2 } } },
      { id: "ward.sigil", label: "Draw 8 ash sigils (Sigilcraft 2)", goal: { kind: "complete", action: "ash_sigil", count: 8 }, reward: { xp: { skill: "sigilcraft", amount: 30 } } },
      { id: "ward.place", label: "Place the Ward in the Circle", goal: { kind: "place", part: "ward" } },
    ],
    goal: { kind: "place", part: "ward" },
  },
  {
    text: "The garden still remembers me. Mind the nettles; they remember everyone. Smoke carries what hands can't.",
    quote: "The garden still remembers me. Mind the nettles.",
    hint: "Pick nettle and chamomile (Herbalism) for smudge bundles, and mugwort for incense. Both are made in Chandlery.",
    unlocks: ["herbalism"],
    steps: [
      { id: "smoke.nettle", label: "Pick 30 nettle", goal: { kind: "complete", action: "pick_nettle", count: 30 }, reward: { xp: { skill: "herbalism", amount: 100 } } },
      { id: "smoke.chamomile", label: "Pick 15 chamomile (Herbalism 2)", goal: { kind: "complete", action: "pick_chamomile", count: 15 }, reward: { items: { ash: 2 } } },
      { id: "smoke.smudge", label: "Bind 15 smudge bundles (Chandlery 2)", goal: { kind: "complete", action: "smudge_bundle", count: 15 }, reward: { xp: { skill: "chandlery", amount: 100 } } },
      { id: "smoke.mugwort", label: "Pick 8 mugwort (Herbalism 2)", goal: { kind: "complete", action: "pick_mugwort", count: 8 }, reward: { items: { ash: 2 } } },
      { id: "smoke.incense", label: "Burn 4 mugwort incense (Chandlery 3)", goal: { kind: "complete", action: "mugwort_incense", count: 4 }, reward: { xp: { skill: "scavenging", amount: 60 } } },
      { id: "smoke.place", label: "Place the Smoke in the Circle", goal: { kind: "place", part: "smoke" } },
    ],
    goal: { kind: "place", part: "smoke" },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them. The circle wants my Litany spoken, and it's in there somewhere.",
    quote: "My pages burned. Read what's left by candlelight.",
    hint: "Burnt pages come from Search the attic (Scavenging 3). Deciphering uses a tallow candle.",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    gift: "still_night",
    steps: [
      { id: "words.candles", label: "Pour 10 tallow candles to read by", goal: { kind: "complete", action: "tallow_candle", count: 37 }, reward: { xp: { skill: "scavenging", amount: 100 } } },
      { id: "words.attic", label: "Search the attic 25 times (Scavenging 3)", goal: { kind: "complete", action: "search_attic", count: 25 }, reward: { items: { burnt_page: 1 } } },
      { id: "words.decipher", label: "Decipher 10 burnt pages", goal: { kind: "complete", action: "decipher_page", count: 10 }, reward: { items: { beeswax_candle: 1 } } },
      { id: "words.litany", label: "Copy the Litany (Scholarship 2)", goal: { kind: "complete", action: "copy_litany", count: 1 }, reward: { xp: { skill: "scholarship", amount: 40 } } },
      { id: "words.place", label: "Place the Words in the Circle", goal: { kind: "place", part: "words" } },
    ],
    goal: { kind: "place", part: "words" },
  },
  {
    text: "They'll knock. They always knock. Help them, and they'll forget to be afraid of you. Their bread goes in the circle, with our salt.",
    quote: "They'll knock. Help them.",
    hint: "Fill village requests for coin and buy bread. Bless the threshold (Ritualism) to make consecrated salt.",
    unlocks: ["ritualism"],
    opens: ["village"],
    steps: [
      { id: "offering.help", label: "Help a villager (Village tab)", goal: { kind: "requests", count: 1 }, reward: { items: { salt: 3 } } },
      { id: "offering.bless", label: "Bless the threshold 11 times", goal: { kind: "complete", action: "bless_threshold", count: 11 }, reward: { items: { bread: 1 } } },
      { id: "offering.place", label: "Place the Offering in the Circle", goal: { kind: "place", part: "offering" } },
    ],
    goal: { kind: "place", part: "offering" },
  },
  {
    text: "The circle is warm. It has been waiting for you. Wake it.",
    quote: "The circle is warm. Wake it.",
    hint: "Smoke the rooms (Ritualism 2), then begin the Kindling on the Circle tab.",
    unlocks: [],
    steps: [
      { id: "perform.smoke", label: "Smoke the rooms twice (Ritualism 2)", goal: { kind: "complete", action: "smoke_rooms", count: 2 }, reward: { xp: { skill: "ritualism", amount: 30 } } },
    ],
    goal: { kind: "rite" },
  },
  {
    text: "Rest now, child. The house will keep working, and so will the boy.",
    quote: "Rest now, child.",
    hint: "Janko speeds up whatever you do. Chapter II comes in a later build.",
    unlocks: [],
  },
] as const satisfies readonly NoteDef<SkillId, ActionId>[];

/**
 * A side note, outside the chapter's steps: it arrives with the first hint toward a hidden recipe
 * (once the Grimoire is open) and opens experiments at the Circle. Optional play.
 */
export const EXPERIMENTS_NOTE = {
  text: "You've found the edge of one of my small workings. The circle answers those too, if you give it the right three things.",
  quote: "The circle answers small workings too.",
  hint: "Pick a hidden recipe (the Dream pillow is a good first one) and try three things at the Circle. It glows once for each right one. Optional.",
  unlocks: [],
  opens: ["experiments"],
} as const satisfies NoteDef<SkillId, ActionId>;
