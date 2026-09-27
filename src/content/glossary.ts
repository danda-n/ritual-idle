// New words the game introduces, explained in a line or two (the <Term> component opens them).
// Plain and short: what it is, and what it's for. Numbers come from the data where they're shown.

export const GLOSSARY = {
  circle: {
    name: "The Circle",
    text: "Grandmother's circle under the floor. You place the Kindling's parts in it, and wake it with the Major Rite at the end of the chapter.",
  },
  kindling: {
    name: "The Kindling",
    text: "What wakes the Circle: five parts (Light, Ward, Smoke, Words, Offering), each made from one skill's work and placed in the Circle.",
  },
  grimoire: {
    name: "The Grimoire",
    text: "What's left of grandmother's book: her notes, the pages you decipher, and the hidden recipes you can hunt for. It opens with Scholarship.",
  },
  village: {
    name: "The Village",
    text: "Neighbours knock with contracts. Fill them for coin and trust; coin buys bread for the Offering.",
  },
  contract: {
    name: "Contract",
    text: "A villager's request for things you make. Deliver in parts if you like; finishing it pays coin and trust.",
  },
  trust: {
    name: "Trust",
    text: "How much the village trusts you. It grows with every contract, and higher trust brings better-paying work.",
  },
  coin: {
    name: "Coin",
    text: "Paid for contracts. Spent at the Village (bread for the Offering).",
  },
  hidden: {
    name: "Hidden recipe",
    text: "One of grandmother's small workings. Find its three ingredients at Experiments; hints cost insight. Once found it helps for good, and it can be bound as a charm.",
  },
  secret: {
    name: "Secret",
    text: "A recipe with no page and no glows: found only by free experiments, with clues bought with insight.",
  },
  experiment: {
    name: "Experiment",
    text: "Place three things in the Circle to test a hidden recipe: one glow per right item. A wrong try uses the items but gives insight.",
  },
  talent: {
    name: "Talent",
    text: "At skill levels 3, 6, 9 and 12, choose one of two. A pick is fixed until the next talent level, then you can change it.",
  },
  surge: {
    name: "Surge",
    text: "A short burst: everything works twice as fast for a few seconds.",
  },
  curio: {
    name: "Curio",
    text: "A rare find from grandmother's things. It gives insight, and its story goes in the Grimoire.",
  },
  follower: {
    name: "Follower",
    text: "Someone who joins the house and helps with the work. Janko is the first.",
  },
  cap: {
    name: "Level cap",
    text: "The highest level a skill can reach for now. The rite raises it for Chapter II.",
  },
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
    text: "Bound on the Experiments tab from a recipe you've discovered, as often as you like. Use it for a timed boost.",
  },
  project: {
    name: "House project",
    text: "Side work built once from things you make. Each helps for good. Nothing on the main path needs them.",
  },
} as const satisfies Record<string, { name: string; text: string }>;

export type TermId = keyof typeof GLOSSARY;
