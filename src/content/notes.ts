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
      { id: "start.pantry", label: "Search the pantry 4 times", goal: { kind: "complete", action: "search_pantry", count: 4 }, reward: { items: { tallow: 2 } } },
      { id: "start.tend", label: "Tend your work once (the Tend button)", goal: { kind: "tended", count: 1 }, reward: { xp: { skill: "scavenging", amount: 40 } } },
    ],
    goal: { kind: "complete", action: "search_pantry", count: 8 },
  },
  {
    text: "Light is the first ward. Nothing that listens at the window likes a candle.",
    quote: "Light is the first ward.",
    hint: "Pour tallow candles (Chandlery). Beeswax comes from Rob the old hives (Scavenging 4).",
    unlocks: ["chandlery"],
    steps: [
      { id: "light.candles", label: "Pour 3 tallow candles", goal: { kind: "complete", action: "tallow_candle", count: 3 }, reward: { xp: { skill: "chandlery", amount: 40 } } },
      { id: "light.sweep", label: "Sweep the hearth once (Scavenging 3)", goal: { kind: "complete", action: "sweep_hearth", count: 1 }, reward: { items: { ash: 3 } } },
      { id: "light.hives", label: "Rob the old hives twice (Scavenging 4)", goal: { kind: "complete", action: "rob_hives", count: 2 }, reward: { items: { beeswax: 2 } } },
      { id: "light.beeswax", label: "Pour a beeswax candle (Chandlery 4)", goal: { kind: "complete", action: "beeswax_candle", count: 1 }, reward: { xp: { skill: "chandlery", amount: 60 } } },
      { id: "light.place", label: "Place the Light in the Circle", goal: { kind: "place", part: "light" } },
    ],
    goal: { kind: "place", part: "light" },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    quote: "Salt keeps what is inside, inside.",
    hint: "Lay salt lines (Sigilcraft) with salt from the pantry. Ash sigils need ash from Sweep the hearth.",
    unlocks: ["sigilcraft"],
    steps: [
      { id: "ward.lines", label: "Lay 3 salt lines", goal: { kind: "complete", action: "salt_line", count: 3 }, reward: { items: { salt: 3 } } },
      { id: "ward.level", label: "Reach Sigilcraft 3", goal: { kind: "level", skill: "sigilcraft", level: 3 }, reward: { items: { salt: 4 } } },
      { id: "ward.sigil", label: "Draw an ash sigil (Sigilcraft 5)", goal: { kind: "complete", action: "ash_sigil", count: 1 }, reward: { items: { ash: 4 } } },
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
      { id: "smoke.nettle", label: "Pick 5 nettle", goal: { kind: "complete", action: "pick_nettle", count: 5 }, reward: { xp: { skill: "herbalism", amount: 40 } } },
      { id: "smoke.chamomile", label: "Pick 3 chamomile (Herbalism 2)", goal: { kind: "complete", action: "pick_chamomile", count: 3 }, reward: { items: { nettle: 4 } } },
      { id: "smoke.smudge", label: "Bind a smudge bundle (Chandlery 5)", goal: { kind: "complete", action: "smudge_bundle", count: 1 }, reward: { items: { chamomile: 2 } } },
      { id: "smoke.mugwort", label: "Pick 2 mugwort (Herbalism 4)", goal: { kind: "complete", action: "pick_mugwort", count: 2 }, reward: { items: { ash: 2 } } },
      { id: "smoke.incense", label: "Burn mugwort incense (Chandlery 6)", goal: { kind: "complete", action: "mugwort_incense", count: 1 }, reward: { xp: { skill: "chandlery", amount: 80 } } },
      { id: "smoke.place", label: "Place the Smoke in the Circle", goal: { kind: "place", part: "smoke" } },
    ],
    goal: { kind: "place", part: "smoke" },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them. The circle wants my Litany spoken, and it's in there somewhere.",
    quote: "My pages burned. Read what's left by candlelight.",
    hint: "Burnt pages come from Search the attic (Scavenging 8). Deciphering uses a tallow candle.",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    gift: "still_night",
    steps: [
      { id: "words.attic", label: "Search the attic 3 times (Scavenging 8)", goal: { kind: "complete", action: "search_attic", count: 3 }, reward: { items: { burnt_page: 1 } } },
      { id: "words.decipher", label: "Decipher a burnt page", goal: { kind: "complete", action: "decipher_page", count: 1 }, reward: { items: { tallow_candle: 2 } } },
      { id: "words.litany", label: "Copy the Litany (Scholarship 4)", goal: { kind: "complete", action: "copy_litany", count: 1 }, reward: { xp: { skill: "scholarship", amount: 80 } } },
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
      { id: "offering.bless", label: "Bless the threshold twice", goal: { kind: "complete", action: "bless_threshold", count: 2 }, reward: { items: { salt_line: 2, tallow_candle: 2 } } },
      { id: "offering.level", label: "Reach Ritualism 3", goal: { kind: "level", skill: "ritualism", level: 3 }, reward: { items: { bread: 1 } } },
      { id: "offering.place", label: "Place the Offering in the Circle", goal: { kind: "place", part: "offering" } },
    ],
    goal: { kind: "place", part: "offering" },
  },
  {
    text: "The circle is warm. It has been waiting for you. Wake it.",
    quote: "The circle is warm. Wake it.",
    hint: "Reach Ritualism 5, then begin the Kindling on the Circle tab. It takes 30 minutes and runs while you're away.",
    unlocks: [],
    steps: [{ id: "perform.level", label: "Reach Ritualism 5", goal: { kind: "level", skill: "ritualism", level: 5 } }],
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
