import type { ActionId } from "./actions";
import type { SkillId } from "./skills";
import type { NoteDef } from "./types";

// Grandmother's margin notes: the Chapter 1 spine (docs/CHAPTER1.md §2).
// The Kindling is built in five parts; each stage's note brings the one new skill that part needs.
// Each stage splits into small steps with small rewards, so there's always a next click.
// The first note is shown at the start of a new game; each goal reveals the next note.
// `text` is story only (the Grimoire journal); what to do is in the steps.
export const NOTES = [
  {
    text: "The house is cold, child. Under the floor is my circle. It sleeps, and it will want waking: light first, then a ward, smoke and words in whatever order you like, and an offering last. Start in the pantry.",
    unlocks: ["scavenging"],
    opens: ["circle"],
    steps: [
      { id: "start.pantry", label: "Search the pantry 10 times", goal: { kind: "complete", action: "search_pantry", count: 10 }, reward: { surge: true } },
    ],
    goal: { kind: "complete", action: "search_pantry", count: 10 },
  },
  {
    text: "Light is the first ward. Nothing that listens at the window likes a candle.",
    unlocks: ["chandlery"],
    steps: [
      { id: "light.candles", label: "Pour 40 tallow candles", goal: { kind: "complete", action: "tallow_candle", count: 40 } },
      { id: "light.hives", label: "Rob the old hives 16 times (Scavenging 3)", goal: { kind: "complete", action: "rob_hives", count: 16 } },
      { id: "light.beeswax", label: "Pour 8 beeswax candles (Chandlery 3)", goal: { kind: "complete", action: "beeswax_candle", count: 8 } },
      { id: "light.place", label: "Place the Light in the Circle", goal: { kind: "place", part: "light" }, reward: { xpChoice: { amount: 60, suggest: "scavenging" } } },
    ],
    goal: { kind: "place", part: "light" },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    unlocks: ["sigilcraft"],
    steps: [
      { id: "ward.lines", label: "Lay 40 salt lines", goal: { kind: "complete", action: "salt_line", count: 40 } },
      { id: "ward.sweep", label: "Sweep the hearth 24 times", goal: { kind: "complete", action: "sweep_hearth", count: 24 } },
      { id: "ward.sigil", label: "Draw 12 ash sigils (Sigilcraft 3)", goal: { kind: "complete", action: "ash_sigil", count: 12 } },
      { id: "ward.place", label: "Place the Ward in the Circle", goal: { kind: "place", part: "ward" }, reward: { surge: true } },
    ],
    goal: { kind: "place", part: "ward" },
  },
  {
    text: "The garden still remembers me. Mind the nettles; they remember everyone. Smoke carries what hands can't.",
    unlocks: ["herbalism"],
    steps: [
      { id: "smoke.nettle", label: "Pick 32 nettle", goal: { kind: "complete", action: "pick_nettle", count: 32 } },
      { id: "smoke.chamomile", label: "Pick 16 chamomile (Herbalism 3)", goal: { kind: "complete", action: "pick_chamomile", count: 16 } },
      { id: "smoke.smudge", label: "Bind 16 smudge bundles (Herbalism 3)", goal: { kind: "complete", action: "smudge_bundle", count: 16 } },
      { id: "smoke.mugwort", label: "Pick 12 mugwort (Herbalism 6)", goal: { kind: "complete", action: "pick_mugwort", count: 12 } },
      { id: "smoke.incense", label: "Make 6 mugwort incense (Herbalism 6)", goal: { kind: "complete", action: "mugwort_incense", count: 6 } },
      { id: "smoke.place", label: "Place the Smoke in the Circle", goal: { kind: "place", part: "smoke" }, reward: { items: { tallow_candle: 10 } } },
    ],
    goal: { kind: "place", part: "smoke" },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them. The circle wants my Litany spoken, and it's in there somewhere.",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    steps: [
      { id: "words.candles", label: "Pour 24 tallow candles", goal: { kind: "complete", action: "tallow_candle", count: 24 } },
      { id: "words.attic", label: "Search the attic 60 times", goal: { kind: "complete", action: "search_attic", count: 60 } },
      { id: "words.decipher", label: "Decipher 24 pages (21 Words + 3 Litany) · Scholarship 3", goal: { kind: "complete", action: "decipher_page", count: 24 } },
      { id: "words.litany", label: "Copy the Litany (Scholarship 6)", goal: { kind: "complete", action: "copy_litany", count: 1 } },
      { id: "words.place", label: "Place the Words in the Circle", goal: { kind: "place", part: "words" }, reward: { xpChoice: { amount: 80, suggest: "scholarship" } } },
    ],
    goal: { kind: "place", part: "words" },
  },
  {
    text: "They'll knock. They always knock. Help them, and they'll forget to be afraid of you. Their bread goes in the circle, with our salt.",
    unlocks: ["ritualism"],
    opens: ["village"],
    steps: [
      { id: "offering.help", label: "Finish 1 contract", goal: { kind: "requests", count: 1 } },
      { id: "offering.lines", label: "Lay 15 salt lines", goal: { kind: "complete", action: "salt_line", count: 15 } },
      { id: "offering.candles", label: "Pour 17 tallow candles", goal: { kind: "complete", action: "tallow_candle", count: 17 } },
      { id: "offering.bless", label: "Bless the threshold 15 times", goal: { kind: "complete", action: "bless_threshold", count: 15 } },
      { id: "offering.place", label: "Place the Offering in the Circle", goal: { kind: "place", part: "offering" }, reward: { xpChoice: { amount: 60, suggest: "ritualism" } } },
    ],
    goal: { kind: "place", part: "offering" },
  },
  {
    text: "The circle is warm. It has been waiting for you. Wake it.",
    // No steps: waking the Circle needs only Ritualism 3 (the rite's card on the Circle tab says so).
    hint: "Ritualism 3 · begin it on the Circle tab · offerings optional",
    unlocks: [],
    goal: { kind: "rite" },
  },
  {
    text: "Rest now, child. The house will keep working, and so will the boy.",
    hint: "Janko: +30% speed on your current action · Chapter II: later build",
    unlocks: [],
  },
] as const satisfies readonly NoteDef<SkillId, ActionId>[];

/**
 * A side note, outside the chapter's steps: it arrives with the first hint toward a hidden recipe
 * (once the Grimoire is open) and opens experiments at the Circle. Optional play.
 */
export const EXPERIMENTS_NOTE = {
  text: "You've found the edge of one of my small workings. The circle answers those too, if you give it the right three things.",
  hint: "Optional · place 3 items at the Circle · 1 glow per right item · start with Dream pillow",
  unlocks: [],
  opens: ["experiments"],
} as const satisfies NoteDef<SkillId, ActionId>;
