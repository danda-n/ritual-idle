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
| **Discovered** | Found recipes and secrets, with what they do (the reveal line collapsed under "Story") |
| **Secrets** | How many are left, and how to find them |
| **Journal** | All the story, one collapsed entry per line of it (a one-line title that opens to its text): grandmother's notes (titled by task), deciphered pages ("Teaches: Iron ward"), curios (n/5, by name), discoveries (the reveal lines), the Kindling (its phase lines, finale and lore), and the black page (the Chapter 3 teaser, once page 6 is read) |

The "where does X come from / what is it for" lookup lives on every item name (click it), not in the Grimoire.

---

## 3. Kinds of discovery

| Kind | Found by | Hints? | Required? | Example (Chapter 1) |
|---|---|---|---|---|
| **Scripted recipes** | Deciphering pages in order | No, they're simply revealed | Some are (the Rite path) | Hearth candle, Iron ward |
| **Hidden recipes** | Hints + attuned experiments | Yes, escalating | Never | Window charm, Dream pillow, Hearth mark, Threshold nail |
| **Secrets** | Free experiments or rare curios | **None** | Never | Honey-light, Hana's soup |
| **Forbidden pages** | Unlock in Chapter 3 (Taint) | Teaser text only | Never | Ink of the Unwritten |

Chapter 1 has 4 hidden recipes and 2 secrets. Later chapters get about 3–5 hidden recipes and 1–2 secrets each.

---

## 4. The circle: attuned vs. free experiments

Experiments happen at the ritual circle, on their own **Experiments** tab (the Circle tab is only for the Kindling's parts and the rite). **Experiments are instant.** They don't use your action slot, so the loop keeps running while you experiment.

**When they open:** with their own side note (`EXPERIMENTS_NOTE` in `src/content/notes.ts`) and the first insight, once the Grimoire is open, which in practice is during the Words stage. The note's line: "Optional · the Experiments tab · place 3 items · 1 glow per right item · start with the Window charm". From then on, all hidden recipes show in the Grimoire and on the tab.

**The first one is for everyone:** the Window charm is made from what every path holds by then (a tallow candle, a glass shard from the attic, salt), so a player who took the Words first can start at once.

### 4.1 Attuned experiment (solving a hidden recipe)
1. Choose the hidden recipe on the Experiments tab, or open its silhouette in the Grimoire and choose **Attune the circle** (it takes you to the Experiments tab).
2. The circle shows as many slots as the recipe has ingredients (3 in Chapter 1, 3–4 later). Ingredient order never matters.
3. Place one item in each slot. You can use only items you currently hold, and proven-wrong items are hidden by default (a toggle shows them).
4. **Result:** the circle glows once for each correct item, with one plain line under it: "2 of 3 right (not which) · swap one at a time".
5. If every slot is correct, **the recipe is discovered.** A dialog shows the reward (its reveal line waits under "Story", and in the journal), and the reward applies at once and permanently (discovering it is making it). From then on it can also be bound as a **charm** (§4.4).

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

### 4.4 Charms (the active side)
- **Each discovered hidden recipe can be bound again** on the Experiments tab, at once and as often as you like, from 1 of each of its ingredients (`src/content/charms.ts`). A charm is an item you hold.
- **Using a charm** starts a **10-minute** boost (`src/content/buffs.ts`). Using another of the same kind refreshes it; it never stacks. An active charm shows in the sidebar's blessings panel with the time left.
- The Charms panel lists all four: effect and length, the ingredients as have/need chips, **Bind** and **Use (n)**. A charm whose recipe isn't found yet says "Discover <recipe> to bind it", so there's a reason to look.
- Charms are for players who want to come back to the Circle. Nothing needs them.

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
| **A nudge toward the last one** | hidden recipes | "The last one: It's soft, and it was torn from something old." Never its name | **6** |
| **A clue** | secrets | Honey-light: *"She kept bees for the light, not the honey."* (3 clues each, read in order) | **4** each |

**Sources of insight:**

| Source | Insight |
|---|---|
| A wrong try at the Circle (attuned) | +1 |
| A deciphered page past the sixth | +2 |
| A curio story (attic, chest) | +3 |
| A village contract that mentions a recipe (the aside is a free hint too: "Grandmother made me a pillow for bad dreams. Bitter-smelling."; it stays on the recipe's page as "Heard in the village") | +2 |
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

Each gives its reward for good when discovered, and can then be bound as a charm for a 10-minute boost (§4.4).

**Window charm** (Tallow candle + Glass shard + Salt) → +10% speed, all skills. Charm: chance finds ×1.5, all skills.
- I: "…a light for the window, glass to hold it, salt along the sill."
- II: "Something from the chandler · something from the attic · something from the pantry."
- III: "Tallow candle." → "Salt." · nudge: "It's sharp, and it catches the light."

**Dream pillow** (Mugwort + Chamomile + Rags) → +10% XP, all skills. Charm: +25% XP.
- I: "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."
- II: "A herb from the forest edge · a herb from the garden · something from the attic."
- III: "Mugwort." → "Chamomile." · nudge: "It's soft, and it was torn from something old."

**Hearth mark** (Ash + Charcoal + Salt) → +1 rite quality (it counts as an offering) and +10% Sigilcraft speed. Charm: 15% of crafts use no inputs.
- I: "…where the fire lived, draw its name in what it left behind, and salt to keep it."
- II: "Something from the hearth · something from the hearth · something from the pantry."
- III: "Charcoal." → "Salt." · nudge: "It's grey and fine, and there's always more of it in the grate."

**Threshold nail** (Iron nail + St John's wort + Salt) → trust gains ×2, and grandmother's hidden note opens (the first thread toward the hidden 5th follower). Charm: contracts pay +50% coin.
- I: "…cold iron under the door, and the Kupala herb to make it sing."
- II: "Something from the midden · a herb from the forest edge · something from the pantry."
- III: "Iron nail." → "St John's wort." · nudge: "It keeps things in. The pantry is full of it."

### Secrets (clues you can buy)

| Secret | Recipe | Reward |
|---|---|---|
| **Honey-light** | Beeswax candle + Chamomile + Glass | A cosmetic: a softly glowing jar in the sanctum window. Its reveal line (grandmother's bees) goes to the journal |
| **Hana's soup** | Nettle + Salt + Bread | Widow Hana's contracts pay ×2 for the rest of the chapter. Its reveal line (*"She made it for me the winter my husband died."*) goes to the journal. Her contract's label stays "Nettle soup" and her name "Widow Hana": clue 1 leans on them |

---

## 9. Screens
Every screen answers "what is this for, and what do I do next?". Gameplay, not lore. The logic is in `src/ui/guidance.ts` (tested); the screens are `src/ui/screens/Grimoire.tsx` and `Experiments.tsx`.

### 9.1 The Grimoire
- **A three-step strip** at the top until the first discovery, labels only: *1 · Earn insight ✦ → 2 · Buy a hint (4–6 ✦) → 3 · Test at the Circle (1 glow per right item)*.
- **The pool:** "✦ N insight" in candle gold.
- **The index:** *Hidden recipes* (each with what it **gives** and "n/3 known"), *Discovered*, *Secrets* (n/2), then the **Journal**: grandmother's notes, deciphered pages, curios (n/5), discoveries, the Kindling (once the rite begins), and the black page once every page is read. Every journal entry is a one-line title, collapsed; the story opens under it.
- **A hidden recipe's page:**
  - **Gives** first (the reward, so the player knows why to bother).
  - Then a **Next step** box that follows progress: "Try any 3 things at the Circle, or buy a hint" (under it: "1 glow per right item · wrong try +1 ✦") → "2 of 3 known: find the last one" ("Swap one at a time") → "You know all 3: make it at the Circle". Its button attunes the Circle and goes to the Experiments tab.
  - Then *Belongs* (proven, or named by a hint), *Crossed out*, and *Still possible* (things held that aren't ruled out).
  - The hints come last: the riddle, what a villager said ("Heard in the village · Widow Hana", once her contract is done), then buy buttons ("Name one ingredient · 6 ✦", then "A nudge toward the last one (never its name)", disabled with the shortfall in their tooltip), and one line on where insight comes from.
- **A discovered recipe's page:** Gives, its ingredients, and a collapsed "Story" with the reveal line. The Threshold nail also shows "Opens: grandmother's hidden note (journal)", so the plot thread is visible with the story folded.
  - Your tries, folded, each with its glow dots.
- **Secrets:** "N left · clues 4 ✦ · test sets of 3 in Free experiment", each with its clues to buy.

```
┌──────────────────────────────┬──────────────────────────────────────┐
│ ✦ 7 insight                  │  DREAM PILLOW              3 things  │
│ HIDDEN RECIPES               │  Gives  +10% XP, all skills          │
│  Dream pillow   1/3 known    │ ┌ Next step ───────────────────────┐ │
│   Gives: +10% XP, all skills │ │ 1 of 3 known: find the last 2    │ │
│  Hearth mark    0/3 known    │ │ Swap one at a time               │ │
│  Threshold nail 0/3 known    │ │   [ Keep trying at the Circle ]  │ │
│ DISCOVERED                   │ └──────────────────────────────────┘ │
│  Window charm                │  Belongs:        Mugwort (1/3)       │
│  Secrets             0/2     │  Crossed out:    Salt · Ash · Tallow │
│ JOURNAL                      │  Still possible: Chamomile · Rags …  │
│  Grandmother's notes    5    │  HINTS                               │
│  Deciphered pages       4    │   I   "…for sleep that listens…"     │
│  Curios               1/5    │   II  [ Where each comes from · 4 ✦ ]│
│                              │   III Mugwort. [ Name another · 6 ✦ ]│
│                              │       [ A nudge toward the last · 6 ]│
│                              │  › Your tries (2)                    │
└──────────────────────────────┴──────────────────────────────────────┘
```

### 9.2 The Experiments tab
- **Hero:** Hidden recipes found (n/4), Secrets (n/2) and Insight (✦ N).
- **Charms** first (§4.4): each with its boost, its ingredients, Bind and Use.
- **At the Circle** (marked optional): a step strip (① choose what to work on → ② pick things → ③ place them), with the current step lit; a choice of hidden recipe, or "Free experiment: hunt secrets (no hints)".
- A "Working on" line showing what it gives and what's known.
- A plain line under every result, honest that the glow is a count: "0 right · all crossed out", "2 of 3 right (not which) · swap one at a time", "Two of those match a secret. Swap the third." (the "almost" flicker), "No match · a secret answers only its exact 3". "Closer!" appears when a try beats your best.
- **Your items** (known ingredients first, as gold chips marked ✓; "Hide proven wrong" on by default), then your recent attempts with their glow dots.
- **The attuned recipe's page** (the same as in the Grimoire: next step, proofs, hints to buy) sits on the same tab, so buying a hint never means switching tabs.
- The Circle tab keeps one line pointing here: "Experiments have their own tab: find grandmother's small workings, and bind charms."

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

The glow dots carry the moment; there are no flavour lines by count.

A discovery opens its own dialog with the rosette and the reward. The reveal line sits under a collapsed "Story" there, on the discovered page, and in the journal.

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
    close:    "It's soft, and it was torn from something old.",  // the nudge for the never-named one
  },
  reward: { kind: "xp_all", bonus: 0.1 },          // one reward, or a list of several
  rewardText: "+10% XP, all skills",              // numbers first
  reveal: "The pillow smells of her. …",           // story: collapsed on its page, and in the journal
  // opens?: "Opens: grandmother's hidden note (journal)"   (a visible line for a plot thread)
}
// Secrets have `clues: [three lines]` instead of `hints`.
// INSIGHT_COST = { category: 4, name: 6, close: 6, clue: 4 }
// Charms (content/charms.ts): { from: "dream_pillow", buff: "charm_pillow" }; the boost is in content/buffs.ts
// INSIGHT_GAIN = { failedAttempt: 1, page: 2, curio: 3, request: 2 }
```
Save state: one `insight` pool, and per recipe `{ discovered, attempts: [{ items, glows }], provenWrong, provenRight, marks, bought: { category, named, close }, clues }`. `marks` (the player's pencil marks) is kept in the save but not shown.

---

## 11. Open tuning questions

- Hint costs (4 / 6 / 6 / 4). Test with players who dislike puzzles, and check they never feel stuck for more than about 10 minutes.
- Should the circle limit candidates to items the player has *discovered*? (Yes by default. That keeps the pool at about 15–20 items in Chapter 1.)
- The "almost answered" flicker in free experiments might make secrets too easy. Test with and without it.

---

## 12. Build notes
- **Hidden recipes show once experiments open** (or once discovered). Before that, the Grimoire says they'll show then.
- **Proven right:** when an attempt's not-yet-crossed-out items equal its glow count, they're all marked as belonging.
- **Discovery grants the effect at once.** The successful experiment *is* the making.
  - Several rewards can come from one entry (the Hearth mark: a rite offering and Sigilcraft speed).
  - Threshold nail trust is kept as a fraction internally.
- **Insight never toasts.** It floats quietly on the Grimoire tab and shows on the Grimoire's pages.
- **Pencil marks** (the player's own suspect/doubt marks) aren't shown: they added noise on top of the automatic tracking.
- **Saves from before insight was one pool:** each recipe's old insight joins the pool, and the hints it had already shown count as bought.
- Content lives in `src/content/grimoire.ts` and `src/content/charms.ts`, and logic in `src/engine/grimoire.ts` (hint buying) and `src/engine/commands.ts` (experiments, `bindCharm`, `useCharm`).

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
- **Text trimmed to a spreadsheet style:** "The rest of the book" is now the **Journal**, one collapsed entry per story line (notes, pages, curios by name, discoveries, the Kindling, the black page). The discovery dialog shows the reward only, with the reveal under "Story". Short rewards ("+10% offline speed"), a label-only how-strip, shorter result lines (keeping "not which" and "swap one at a time"). Riddles, clues, category hints, asides and item bridges are unchanged in meaning; the Threshold nail's page says it opens grandmother's hidden note.
- **Playtest round 2:** experiments get their own tab (charms, the Circle, and the attuned recipe's hints together). A fourth hidden recipe, the Window charm, comes first and can be made on every path. New rewards: Window charm +10% speed, Dream pillow +10% XP (was offline speed), Hearth mark also +10% Sigilcraft speed, Threshold nail trust ×2 (was ×1.5). Charms: each discovered hidden recipe can be bound again for a 10-minute boost. A buyable nudge (6 insight) toward the ingredient that's never named.
