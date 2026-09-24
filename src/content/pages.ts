import type { ActionId } from "./actions";
import type { PageDef } from "./types";

// Deciphered burnt pages, in the order they are read (docs/CHAPTER1.md §3, Scholarship).
// Page N is read by the Nth "Decipher a burnt page". Recipes listed in `unlocks`
// stay unknown until their page is read.
export const PAGES = [
  {
    title: "Of the iron at the door",
    text: "Cold iron and salt. Whatever walks the lane at night will not cross a nail it cannot count.",
    unlocks: ["iron_ward"],
  },
  {
    title: "Of chalk",
    text: "Chalk from my chest, salt from the pantry. Draw the line once and never twice; a line drawn twice is a door.",
    unlocks: ["chalk_segment"],
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
    title: "Of juniper",
    text: "Juniper for the sickroom and the grave. Burn it with ash, and the fever forgets which house it came to.",
    unlocks: ["juniper_incense"],
  },
  {
    title: "The black page",
    text: "The ink here is too dark to read. Beneath it, in pencil: \"Leave that page be. I didn't.\"",
    unlocks: [],
  },
] as const satisfies readonly PageDef<ActionId>[];
