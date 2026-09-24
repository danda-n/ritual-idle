import type { ActionId } from "./actions";
import type { PageDef } from "./types";

// Deciphered burnt pages, in the order they are read (docs/CHAPTER1.md §3, Scholarship).
// Page N is read by the Nth "Decipher a burnt page". Recipes listed in `unlocks`
// stay unknown until their page is read.
export const PAGES = [
  {
    title: "Of candles and smoke",
    text: "Chamomile to soothe, yarrow to cut. Bind them tight and burn them slow; the smoke goes where you cannot.",
    unlocks: ["smudge_bundle"],
  },
  {
    title: "Of the iron at the door",
    text: "Cold iron and salt. Whatever walks the lane at night will not cross a nail it cannot count.",
    unlocks: ["iron_ward"],
  },
  {
    title: "Of the dream-herb",
    text: "Mugwort, dried on the hearth and burned with its ash. Breathe it before sleep and you will remember what you see.",
    unlocks: ["mugwort_incense"],
  },
  {
    title: "Of the Kupala herb",
    text: "St John's wort, picked with the dew on it. Pressed into beeswax it makes a light the dead can see by.",
    unlocks: ["hearth_candle"],
  },
  {
    title: "Of the hearth's guard",
    text: "Chalk the circle in two halves, nail it with iron, and seal it with the Kupala herb. Then it is a door, not a hole.",
    unlocks: ["hearth_ward"],
  },
  {
    title: "The black page",
    text: "The ink here is too dark to read. Beneath it, in pencil: \"Leave that page be. I didn't.\"",
    unlocks: [],
  },
] as const satisfies readonly PageDef<ActionId>[];
