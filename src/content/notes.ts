import type { ActionId } from "./actions";
import type { SkillId } from "./skills";
import type { NoteDef } from "./types";

// Grandmother's margin notes: the Chapter 1 spine (docs/CHAPTER1.md §2).
// The Kindling is built in five parts; each stage's note brings the one new skill that part needs.
// The first note is shown at the start of a new game; each goal reveals the next note.
export const NOTES = [
  {
    text: "The house is cold, child. Under the floor is my circle. It sleeps, and it will want waking: light, a ward, smoke, words and an offering, in that order. Start in the pantry.",
    hint: "Search the pantry (Scavenging) for tallow. The Circle tab shows the Kindling's five parts.",
    unlocks: ["scavenging"],
    opens: ["circle"],
    goal: { kind: "complete", action: "search_pantry", count: 8 },
  },
  {
    text: "Light is the first ward. Nothing that listens at the window likes a candle.",
    hint: "Pour tallow candles (Chandlery). The Light also wants beeswax candles; beeswax comes from Rob the old hives (Scavenging 5).",
    unlocks: ["chandlery"],
    goal: { kind: "place", part: "light" },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    hint: "Lay salt lines (Sigilcraft) with salt from the pantry. Ash sigils need ash: Sweep the hearth (Scavenging 3).",
    unlocks: ["sigilcraft"],
    goal: { kind: "place", part: "ward" },
  },
  {
    text: "The garden still remembers me. Mind the nettles; they remember everyone. Smoke carries what hands can't.",
    hint: "Pick nettle and chamomile (Herbalism) for smudge bundles, and mugwort for incense. Both are made in Chandlery.",
    unlocks: ["herbalism"],
    goal: { kind: "place", part: "smoke" },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them. The circle wants my Litany spoken, and it's in there somewhere.",
    hint: "Burnt pages come from Search the attic (Scavenging 8). Deciphering one uses a tallow candle. Three deciphered pages and a beeswax candle make the Litany.",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    gift: "still_night",
    goal: { kind: "place", part: "words" },
  },
  {
    text: "They'll knock. They always knock. Help them, and they'll forget to be afraid of you. Their bread goes in the circle, with our salt.",
    hint: "Fill village requests for coin and buy bread. Bless the threshold (Ritualism) to make consecrated salt.",
    unlocks: ["ritualism"],
    opens: ["village"],
    goal: { kind: "place", part: "offering" },
  },
  {
    text: "The circle is warm. It has been waiting for you. Wake it.",
    hint: "Reach Ritualism 5, then begin the Kindling on the Circle tab. It takes 30 minutes and runs while you're away.",
    unlocks: [],
    goal: { kind: "rite" },
  },
  {
    text: "Rest now, child. The house will keep working, and so will the boy.",
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
  hint: "Experiments are open at the Circle. Pick a hidden recipe (the Dream pillow is a good first one) and try three things. The Circle glows once for each right one. It's optional.",
  unlocks: [],
  opens: ["experiments"],
} as const satisfies NoteDef<SkillId, ActionId>;
