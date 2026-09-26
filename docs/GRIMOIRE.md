# The Grimoire and the Hint Model

> Detail layer beneath [CONCEPT.md](CONCEPT.md) (Pillar 2: *Knowledge you keep*). Chapter 1 content is in [CHAPTER1.md](CHAPTER1.md).
> Numbers are draft and get tuned in playtests. This doc describes the game as it is now; its history is in the [Changelog](#changelog).

---

## 1. Goals

- **Discovery feels like learning magic.** The player has an "aha!" moment, not a tedious search.
- **Nobody is ever stuck.** Every attempt, even a failed one, moves you forward.
- **No notepad needed.** The Grimoire does the bookkeeping. The thinking is left to the player.
- **Everything is permanent.** Discoveries, hints and attempts survive every Patron cycle.
- **Discovery is never required for the story.** Major Rite recipes are always listed. Hidden recipes are optional power, lore and delight.

---

## 2. What the Grimoire holds

The Grimoire is the game's manual, recipe book and lore journal in one.

| Section | Contents |
|---|---|
| **Hidden recipes** | One page each: what it gives, the next step, Belongs / Crossed out / Still possible, the hints, and your tries |
| **Discovered** | Found recipes and secrets, with what they do |
| **Grandmother's notes** | Every note, as a journal |
| **Deciphered pages** | The story pages |
| **Curios** | The collection (n/5), with stories |
| **Secrets** | How many are left, and how to find them |
| **The black page** | The Chapter 3 teaser, once page 6 is read |

The "where does X come from / what is it for" lookup lives on every item name (click it), not in the Grimoire.

---

## 3. Kinds of discovery

| Kind | Found by | Hints? | Required? | Example (Chapter 1) |
|---|---|---|---|---|
| **Scripted recipes** | Deciphering pages in order | No, they're simply revealed | Some are (the Rite path) | Hearth candle, Iron ward |
| **Hidden recipes** | Hints + attuned experiments | Yes, escalating | Never | Dream pillow, Hearth mark, Threshold nail |
| **Secrets** | Free experiments or rare curios | **None** | Never | Honey-light, Hana's soup |
| **Forbidden pages** | Unlock in Chapter 3 (Taint) | Teaser text only | Never | Ink of the Unwritten |

Chapter 1 has 3 hidden recipes and 2 secrets. Later chapters get about 3–5 hidden recipes and 1–2 secrets each.

---

## 4. The circle: attuned vs. free experiments

The ritual circle in the sanctum is where experiments happen. **Experiments are instant.** They don't use your action slot, so the loop keeps running while you experiment.

**When they open:** the Circle tab opens at the start, but only for the Kindling's parts. Experiments open with their own side note (`EXPERIMENTS_NOTE` in `src/content/notes.ts`) with the first insight, once the Grimoire is open. That's usually Widow Hana's contract or a page past the story pages. From then on, all hidden recipes show in the Grimoire.

### 4.1 Attuned experiment (solving a hidden recipe)
1. Open a silhouette in the Grimoire and choose **Attune the circle**.
2. The circle shows as many slots as the recipe has ingredients (3 in Chapter 1, 3–4 later). Ingredient order never matters.
3. Place one item in each slot. You can use only items you currently hold, and proven-wrong items are hidden by default (a toggle shows them).
4. **Result:** the circle glows once for each correct item: *"The circle stirs twice."*
5. If every slot is correct, **the recipe is discovered.** It gets a reveal and a lore line, and its reward applies at once and permanently (discovering it *is* making it).

### 4.2 Free experiment (hunting secrets)
- If the Circle isn't attuned, you place exactly 3 things (every Chapter 1 secret is 3 things).
- **An exact match** to any secret, or to any hidden recipe, discovers it.
- **There's no glow count.** The only exception: if 2 items match a secret, the circle gives a single uneasy flicker (*"Something almost answered."*). That's enough to tempt, not enough to brute-force.

### 4.3 Cost and consolation
- **Each attempt uses 1 of each placed item.** Common items are cheap, so experimenting stays low-stakes.
- **Every failed attempt pays a consolation:**
  - a little **Ritualism XP**
  - **+1 insight** into the pool (attuned attempts only)
- Nothing is ever fully wasted.

---

## 5. Automatic deduction

The Grimoire keeps the notes, so the player doesn't have to.

- **Proven wrong:** after an attempt with **zero glows**, every item in it is crossed out for that recipe.
- **Proven right:** if the logic forces it, the Grimoire marks an item as confirmed. Example: 2 of 3 slots glow, and an earlier attempt showed which item was the wrong one.
- **Attempt log:** every attempt is listed with its glow count, so the player can reason from the history.
- **What it doesn't do:** it never solves the puzzle outright. It only records what the player has already proven.

---

## 6. Hints you buy with insight

**Insight is one pool**, counted on the Grimoire (and floated quietly on its tab, never toasted). You spend it on the hint you want, when you want it. That makes it a choice rather than a counter that ticks up by itself, and it gives secrets a way in.

| Hint | For | Example (Dream pillow) | Cost |
|---|---|---|---|
| **I. Riddle** | hidden recipes | *"…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."* | Free, shown once experiments open |
| **II. Where each thing comes from** | hidden recipes | *"A herb from the forest edge · a herb from the garden · something from the attic."* | **4** |
| **III. Name one ingredient** | hidden recipes | *"Mugwort."*, then *"Chamomile."* The last ingredient is always yours to find | **6** each |
| **A clue** | secrets | Honey-light: *"She kept bees for the light, not the honey."* (3 clues each, read in order) | **4** each |

**Sources of insight:**

| Source | Insight |
|---|---|
| A wrong try at the Circle (attuned) | +1 |
| A deciphered page past the sixth | +2 |
| A curio story (attic, chest) | +3 |
| A village contract that mentions a recipe (the aside is a free hint too: *"your grandmother made me a pillow once…"*) | +2 |
| Marginalia (a Scholarship talent at level 6; *Footnotes* at 12 gives +2) | +1 per page |
| Divination vision (Chapter 3+) | Reveals one item's right/wrong status directly |

- **The effect:** a puzzle fan solves it from the riddle with a few tries, which also earns insight. A player who dislikes puzzles buys names. Nobody gets stuck.
- **Accessibility:** *"Grimoire assist"* doubles insight gains.
- **At the Circle,** known ingredients (proven, or named by a bought hint) sort first as gold chips marked ✓.

---

## 7. How it grows over the Chapters

| Chapter | Change |
|---|---|
| 1 Hearth | 3-ingredient recipes, count feedback, auto-deduction. Teaches the model |
| 2 Grave | Some 4-ingredient recipes. Gravetending curios carry more fragments. The dead can be *asked* (Summoning) for a hint |
| 3 Fern | **Divination:** spend a *vision* for per-item feedback on one attempt. **Forbidden pages** become readable, with Taint-gated recipes |
| 4 Drowned | Recipes that need an **omen as an ingredient** (an omen from the shelf fills a slot) |
| 5 Starlit | A few capstone secrets that combine discoveries from every chapter |
| Patron cycles | Patron-only silhouettes appear (the Veil expansion leans into this). Everything already found stays found |

---

## 8. Chapter 1 content

### Hidden recipes

**Dream pillow** (Mugwort + Chamomile + Rags) → +10% to all offline progress; a permanent sanctum item.
- I: *"…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."*
- II: *"A herb from the forest edge · a herb from the garden · something from the attic."*
- III: *"Mugwort."* → *"Chamomile."*

**Hearth mark** (Ash + Charcoal + Salt) → a permanent +1 outcome-quality step for Chapter 1–2 rites.
- I: *"…where the fire lived, draw its name in what it left behind, and salt to keep it."*
- II: *"Two things from the hearth · one thing from the pantry."*
- III: *"Charcoal."* → *"Salt."*

**Threshold nail** (Iron nail + St John's wort + Salt) → village trust ×1.5, and grandmother's hidden note opens (the first thread toward the hidden 5th follower).
- I: *"…cold iron under the door, and the Kupala herb to make it sing."*
- II: *"Something from the midden · a herb from the forest edge · something from the pantry."*
- III: *"Iron nail."* → *"St John's wort."*

### Secrets (clues you can buy)

| Secret | Recipe | Reward |
|---|---|---|
| **Honey-light** | Beeswax candle + Chamomile + Glass | A cosmetic: a softly glowing jar in the sanctum window, plus a lore line about grandmother's bees |
| **Hana's soup** | Nettle + Salt + Bread | +trust with the widow Hana, whose requests pay double for the rest of the chapter, plus a lore line: *"She made it for me the winter my husband died."* |

---

## 9. Screens
Every screen answers "what is this for, and what do I do next?". Gameplay, not lore. The logic is in `src/ui/guidance.ts` (tested); the screens are `src/ui/screens/Grimoire.tsx` and `Circle.tsx`.

### 9.1 The Grimoire
- **A three-step strip** at the top until the first discovery: *1 · Collect insight → 2 · Buy a hint → 3 · Try it at the Circle*.
- **The pool:** "✦ N insight" in candle gold.
- **The index:** *Hidden recipes* (each with what it **gives** and "n/3 known"), *Discovered*, then *The rest of the book*: grandmother's notes, deciphered pages, curios (n/5), secrets, and the black page once every page is read.
- **A hidden recipe's page:**
  - **Gives** first (the reward, so the player knows why to bother).
  - Then a **Next step** box that follows progress: "Try any 3 things at the Circle, or buy a hint" → "2 of 3 known: find the last one" → "You know all 3: make it at the Circle". Its button attunes the Circle and goes there.
  - Then *Belongs* (proven, or named by a hint), *Crossed out*, and *Still possible* (things held that aren't ruled out).
  - The hints come last: the riddle, then buy buttons ("Name one ingredient · 6 ✦", disabled with the shortfall in their tooltip), and one line on where insight comes from.
  - Your tries, folded, each with its glow dots.
- **Secrets:** how many are left, each with its clues to buy, and "set the Circle to Free experiment and try sets of 3".

```
┌──────────────────────────────┬──────────────────────────────────────┐
│ ✦ 7 insight                  │  DREAM PILLOW              3 things  │
│ HIDDEN RECIPES               │  Gives  +10% speed while you're away │
│  Dream pillow   1/3 known    │ ┌ Next step ───────────────────────┐ │
│   Gives: +10% speed away…    │ │ 1 of 3 known: find the last 2    │ │
│  Hearth mark    0/3 known    │ │          [ Attune the circle ]   │ │
│  Threshold nail 0/3 known    │ └──────────────────────────────────┘ │
│ DISCOVERED                   │  Belongs:        Mugwort (1/3)       │
│ THE REST OF THE BOOK         │  Crossed out:    Salt · Ash · Tallow │
│  Grandmother's notes (5)     │  Still possible: Chamomile · Rags …  │
│  Deciphered pages (4)        │  HINTS                               │
│  Curios (1/5)                │   I   "…for sleep that listens…"     │
│  Secrets                     │   II  [ Where each comes from · 4 ✦ ]│
│                              │   III Mugwort. [ Name another · 6 ✦ ]│
│                              │  ▸ Your tries (2)                    │
└──────────────────────────────┴──────────────────────────────────────┘
```

### 9.2 The Circle
- **The Kindling panel comes first** (the chapter's parts and the rite; see [DESIGN.md](DESIGN.md)). Experiments are a separate panel below it, marked optional, once they open.
- A step strip (① choose what to work on → ② pick things → ③ place them), with the current step lit.
- A "Working on" line showing the reward and what's known.
- A plain explanation under every result, honest that the glow is a count ("2 of 3 right, but not which. Swap one thing at a time…"). "Closer!" appears when a try beats your best.

```
            ·  ˚  ·
        ·   [ Mugwort ]   ·
     ˚                        ˚
   [ Chamomile ]      [ Rags ]
     ·                        ·
        ·      ◉ ◉ ◉       ·
            "The circle drinks it in."
         ✦ Discovered: Dream pillow ✦
```

**Glow lines** *(flavour by count)*:
- 0: *"The chalk stays cold."*
- 1: *"The circle stirs once."*
- 2: *"The circle stirs twice."*
- all: *"The circle drinks it in."*

A discovery opens its own reveal dialog with the lore line and the reward.

---

## 10. Data shape (for the build)

```ts
// src/content/grimoire.ts (as built)
dream_pillow: {
  name: "Dream pillow",
  kind: "hidden",              // "hidden" | "secret"
  ingredients: ["mugwort", "chamomile", "rags"],   // unordered
  hints: {
    riddle:   "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth.",
    category: ["A herb from the forest edge", "A herb from the garden", "Something from the attic"],
    plain:    ["mugwort", "chamomile"],            // named in this order
  },
  reward: { kind: "offline_bonus", bonus: 0.1 },   // +10% speed while away
  rewardText: "+10% speed on everything while you're away.",
  reveal: "The pillow smells of her. …",
}
// Secrets have `clues: [three lines]` instead of `hints`.
// INSIGHT_COST = { category: 4, name: 6, clue: 4 }
// INSIGHT_GAIN = { failedAttempt: 1, page: 2, curio: 3, request: 2 }
```
Save state: one `insight` pool, and per recipe `{ discovered, attempts: [{ items, glows }], provenWrong, provenRight, marks, bought: { category, named }, clues }`. `marks` (the player's pencil marks) is kept in the save but not shown.

---

## 11. Open tuning questions

- Hint costs (4 / 6 / 4). Test with players who dislike puzzles, and check they never feel stuck for more than about 10 minutes.
- Should the circle limit candidates to items the player has *discovered*? (Yes by default. That keeps the pool at about 15–20 items in Chapter 1.)
- The "almost answered" flicker in free experiments might make secrets too easy. Test with and without it.

---

## 12. Build notes
- **Hidden recipes show once experiments open** (or once discovered). Before that, the Grimoire says they'll show then.
- **Proven right:** when an attempt's not-yet-crossed-out items equal its glow count, they're all marked as belonging.
- **Discovery grants the effect at once.** The successful experiment *is* the making.
  - The Dream pillow makes time away count 10% extra (applied after the cap).
  - Threshold nail trust is kept as a fraction internally.
- **Insight never toasts.** It floats quietly on the Grimoire tab and shows on the Grimoire's pages.
- **Pencil marks** (the player's own suspect/doubt marks) aren't shown: they added noise on top of the automatic tracking.
- **Saves from before insight was one pool:** each recipe's old insight joins the pool, and the hints it had already shown count as bought.
- Content lives in `src/content/grimoire.ts` and logic in `src/engine/grimoire.ts` (hint buying) and `src/engine/commands.ts` (experiments).

---

## Changelog

One short entry per round, oldest first. The reasons are in [CONCEPT.md's decision log](CONCEPT.md#decision-log).

- **Design:** the hint model (glow counts, auto-deduction, escalating hints from fragments addressed to a recipe, hint-less secrets).
- **M3:** the Grimoire and the Circle built: 3 hidden recipes, 2 secrets, automatic deduction, discovery grants the effect.
- **UI feedback round:** the Grimoire and Circle explain themselves: **Gives** first, a **Next step** box, *Belongs / Crossed out / Still possible*, step strips, honest result lines. Pencil marks hidden.
- **First patch:** experiments open mid-chapter with their own note; the Circle tab starts with the Kindling.
- **Third patch:** insight became one pool you spend on the hint you choose (categories, a name, a secret's clue); experiments open with the first insight; insight no longer toasts.
- **Fourth patch:** the list of hidden recipes shows what each gives; item icons in the Circle's picker and slots.
- **After the fourth patch:** this doc now describes the current Grimoire, with this changelog.
