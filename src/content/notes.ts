import type { ActionId } from "./actions";
import type { SkillId } from "./skills";
import type { NoteDef } from "./types";

// Grandmother's margin notes: the Chapter 1 onboarding (docs/CHAPTER1.md §2).
// The first note is shown at the start of a new game; each goal reveals the next note.
export const NOTES = [
  {
    text: "The house is cold, child. Start with the hearth. Ash is the first thing a witch owns.",
    hint: "Sweep the hearth (Scavenging).",
    unlocks: ["scavenging"],
    goal: { kind: "complete", action: "sweep_hearth", count: 5 },
  },
  {
    text: "Light is the first ward. Nothing that listens at the window likes a candle.",
    hint: "Tallow is in the pantry. Pour it into candles (Chandlery).",
    unlocks: ["chandlery"],
    goal: { kind: "complete", action: "tallow_candle", count: 3 },
  },
  {
    text: "The garden still remembers me. Mind the nettles; they remember everyone.",
    hint: "Pick nettles (Herbalism).",
    unlocks: ["herbalism"],
    goal: { kind: "complete", action: "pick_nettle", count: 10 },
  },
  {
    text: "My pages burned. Read what's left by candlelight, and don't hurry them.",
    hint: "Burnt pages turn up in the attic (Scavenging 5). Decipher them with a tallow candle (Scholarship).",
    unlocks: ["scholarship"],
    opens: ["grimoire"],
    gift: "still_night",
    goal: { kind: "complete", action: "decipher_page", count: 1 },
  },
  {
    text: "Salt keeps what is inside, inside. And what is outside, out.",
    hint: "Lay salt lines (Sigilcraft). The pantry has salt.",
    unlocks: ["sigilcraft"],
    goal: { kind: "complete", action: "salt_line", count: 3 },
  },
  {
    text: "They'll knock. They always knock. Help them, and they will forget to be afraid of you.",
    hint: "Fill a request on the village board. Coin buys bread and fixes for the house.",
    unlocks: [],
    opens: ["village"],
    goal: { kind: "requests", count: 1 },
  },
  {
    text: "Bless the threshold before you open the circle. Doors matter more than walls.",
    hint: "Bless the threshold with a salt line and a tallow candle (Ritualism).",
    unlocks: ["ritualism"],
    opens: ["circle"],
    goal: { kind: "complete", action: "bless_threshold", count: 1 },
  },
  {
    text: "The circle is warm. It has been waiting for you. Wake it.",
    hint: "The Kindling of the Hearth-Circle is on the Circle tab. Everything it needs is listed there.",
    unlocks: [],
    goal: { kind: "rite" },
  },
  {
    text: "Rest now, child. The house will keep working, and so will the boy.",
    hint: "Janko helps with whatever you're doing. Chapter II begins in a later build.",
    unlocks: [],
  },
] as const satisfies readonly NoteDef<SkillId, ActionId>[];
