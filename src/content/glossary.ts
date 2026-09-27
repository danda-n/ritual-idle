// New words the game introduces, explained in a line or two (the <Term> component opens them).
// Plain and short: what it is, and what it's for. Numbers come from the data where they're shown.

export const GLOSSARY = {
  keepsake: {
    name: "Keepsake",
    text: "Something of grandmother's the Circle lets you keep after a good rite. Each gives a small bonus for good. A Fine rite lets you choose one, a Resplendent rite two.",
  },
  omen: {
    name: "Omen",
    text: "A rare find that turns up from any work once you have an omen shelf to keep it on. Use one to bless a skill for a short while (faster work, more chance finds). A full shelf loses new omens.",
  },
  blessing: {
    name: "Blessing",
    text: "A timed boost from an omen, a charm or a minor rite. It shows in the side panel with the time left.",
  },
  offering: {
    name: "Offering",
    text: "Something extra for the rite, never required. Each offering raises the rite's quality one step.",
  },
  quality: {
    name: "Rite quality",
    text: "How well the rite went: Sound, Fine or Resplendent, from the offerings. It never fails, and the story rewards are the same; a better rite adds keepsakes to choose.",
  },
  insight: {
    name: "Insight",
    text: "What you learn from grandmother's pages, curios and failed experiments. Spend it on hints for hidden recipes.",
  },
  charm: {
    name: "Charm",
    text: "Made at the Circle from a recipe you've discovered, as often as you like. Use it for a timed boost.",
  },
  project: {
    name: "House project",
    text: "Side work built once from things you make. Each helps for good. Nothing on the main path needs them.",
  },
} as const satisfies Record<string, { name: string; text: string }>;

export type TermId = keyof typeof GLOSSARY;
