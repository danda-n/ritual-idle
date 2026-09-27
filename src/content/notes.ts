import type { ActionId } from "./actions";
import type { SkillId } from "./skills";
import type { NoteDef } from "./types";

// Grandmother's margin notes: the Chapter 1 spine (docs/CHAPTER1.md §2).
// The Kindling is built in five parts; each stage's note brings the one new skill that part needs.
// Each stage's one step is its goal (place the part), with its reward; what to make is the part's
// own checklist (its items, shown with have/need and what you're still short of), in any order.
// The first note is shown at the start of a new game; each goal reveals the next note.
// `text` is story only (the Grimoire journal).
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
      { id: "light.place", label: "Place the Light in the Circle", goal: { kind: "place", part: "light" }, reward: { xpChoice: { amount: 60, suggest: "scavenging" } } },
    ],
    goal: { kind: "place", part: "light" },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    unlocks: ["sigilcraft"],
    steps: [
      { id: "ward.place", label: "Place the Ward in the Circle", goal: { kind: "place", part: "ward" }, reward: { surge: true } },
    ],
    goal: { kind: "place", part: "ward" },
  },
  {
    text: "The garden still remembers me. Mind the nettles; they remember everyone. Smoke carries what hands can't.",
    unlocks: ["herbalism"],
    steps: [
      { id: "smoke.place", label: "Place the Smoke in the Circle", goal: { kind: "place", part: "smoke" }, reward: { items: { tallow_candle: 10 } } },
    ],
    goal: { kind: "place", part: "smoke" },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them. The circle wants my Litany spoken, and it's in there somewhere.",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    steps: [
      { id: "words.place", label: "Place the Words in the Circle", goal: { kind: "place", part: "words" }, reward: { xpChoice: { amount: 80, suggest: "scholarship" } } },
    ],
    goal: { kind: "place", part: "words" },
  },
  {
    text: "They'll knock. They always knock. Help them, and they'll forget to be afraid of you. Their bread goes in the circle, with our salt.",
    unlocks: ["ritualism"],
    opens: ["village"],
    steps: [
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
  hint: "Optional · the Experiments tab · place 3 items · 1 glow per right item · start with the Window charm",
  unlocks: [],
  opens: ["experiments"],
} as const satisfies NoteDef<SkillId, ActionId>;
