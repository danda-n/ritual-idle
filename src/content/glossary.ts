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
    text: "Every 3 levels, up to 30, a skill offers two talents and you choose one. A pick is fixed until the next talent level, then you can change it.",
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
    text: "A timed boost from an omen or a minor rite. It shows in the side panel with the time left.",
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
    text: "Bound on the Experiments tab from a recipe you\'ve discovered. Use it for a boost that lasts a number of actions or contracts, not a time; using another adds more.",
  },
  project: {
    name: "House project",
    text: "Side work built once from things you make. Each helps for good. Nothing on the main path needs them.",
  },
  // The cellar (docs/COMBAT.md). These words appear only once the cellar is open.
  cellar: {
    name: "The Cellar",
    text: "The room under the kitchen. When the Circle woke, the house's spirits moved down there. You drive them off with Warding, in gear you make with Crafting.",
  },
  warding: {
    name: "Warding",
    text: "Fighting the spirits. A fight runs by itself, one foe after another, until you stop it. Each level gives you more Health and quicker blows.",
  },
  crafting: {
    name: "Crafting",
    text: "Making gear. Its recipes make components; the pieces themselves are made in the crafting window.",
  },
  gear: {
    name: "Gear",
    text: "What you wear into a fight: an Amulet, something in your Hand, a Lantern, a Garment and a Belt. Gear is never used up, and you never lose it.",
  },
  piece: {
    name: "Piece",
    text: "One item of gear, made once in the crafting window. You can make one of each.",
  },
  affix: {
    name: "Affix",
    text: "A bonus on a piece. Its fixed affix is always the same (its tag, or a trait). Its random affix is rolled when you make it, and you choose one of the options.",
  },
  set: {
    name: "Set",
    text: "Pieces that belong together. Wearing two or three of a set gives an extra bonus.",
  },
  reforge: {
    name: "Reforge",
    text: "Roll a piece's random affix again, for a few components. You see the new options next to the old one and can keep the old one.",
  },
  loadout: {
    name: "Loadout",
    text: "A set of gear you've saved with a name, to put on in one click. Each foe also remembers the gear you last wore against it.",
  },
  readiness: {
    name: "Readiness",
    text: "How likely you are to win, worked out by playing the fight out a thousand times: Safe, Likely, Risky, Deadly or Hopeless. Only Safe fights keep going while you're away.",
  },
  weakness: {
    name: "Weakness",
    text: "The one thing a foe fears, like salt or iron. If your Hand or Lantern carries it, your blows hit half again as hard; if your Amulet does, its blows are halved. You learn it after 10 wins.",
  },
  telling: {
    name: "Telling blow",
    text: "A blow that lands twice as hard. A few of yours do, and some foes have their own.",
  },
  driven: {
    name: "Driven off",
    text: "What happens when your Health runs out: the fight ends. You lose the remedies you used on that foe and what it would have dropped. Never gear, never anything else.",
  },
  remedy: {
    name: "Remedy",
    text: "Food or herbs that give Health back. In a fight your healing rule uses them; out of one you can use them yourself.",
  },
  healing: {
    name: "Healing rule",
    text: "When to use a remedy in a fight: below a share of your Health that you set.",
  },
  gift: {
    name: "Gift",
    text: "What a boss leaves when you beat it: a lasting bonus, kept for good.",
  },
  mastery: {
    name: "Mastery",
    text: "Beating one kind of foe again and again makes you better against it, for good: more loot at 25 beaten, more XP at 100, harder blows at 250.",
  },
  bestiary: {
    name: "The Bestiary",
    text: "The Grimoire's pages on the spirits you've met: what each fears, its special attacks and what it leaves behind.",
  },
} as const satisfies Record<string, { name: string; text: string }>;

/** Words of the cellar: never shown before it opens (combat.test.ts checks it). */
export const CELLAR_TERMS = ["cellar", "warding", "crafting", "gear", "piece", "affix", "set", "reforge", "loadout", "readiness", "weakness", "telling", "driven", "remedy", "healing", "gift", "mastery", "bestiary"] as const;

export type TermId = keyof typeof GLOSSARY;
