# The Grimoire and the Hint Model (v0.1)

> Detail layer beneath [CONCEPT.md](CONCEPT.md) (Pillar 2: *Knowledge you keep*). Chapter 1 content is in [CHAPTER1.md](CHAPTER1.md).
> Numbers are draft and get tuned in playtests.

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

**When they open** *(first patch; third patch: with the first insight)*: the Circle tab opens at the start, but only for the Kindling's parts. Experiments open with their own side note (`EXPERIMENTS_NOTE` in `src/content/notes.ts`) with the first insight, once the Grimoire is open. That's usually Widow Hana's request or a page past the story pages. From then on, all hidden recipes show in the Grimoire.

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
  - **+1 Insight** toward that recipe's next hint level (attuned attempts only)
- Nothing is ever fully wasted.

---

## 5. Automatic deduction

The Grimoire keeps the notes, so the player doesn't have to.

- **Proven wrong:** after an attempt with **zero glows**, every item in it is crossed out for that recipe.
- **Proven right:** if the logic forces it, the Grimoire marks an item as confirmed. Example: 2 of 3 slots glow, and an earlier attempt showed which item was the wrong one.
- **Attempt log:** every attempt is listed with its glow count, so the player can reason from the history.
- **What it doesn't do:** it never solves the puzzle outright. It only records what the player has already proven.

---

## 6. Hints you buy with insight *(third patch; replaces the escalating thresholds)*

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
| A village request that mentions a recipe (the aside is a free hint too: *"your grandmother made me a pillow once…"*) | +2 |
| Marginalia (the Scholarship keystone) | +1 per page |
| Divination vision (Chapter 3+) | Reveals one item's right/wrong status directly |

- **The effect:** a puzzle fan solves it from the riddle with a few tries, which also earns insight. A player who dislikes puzzles buys names. Nobody gets stuck.
- **Accessibility:** *"Grimoire assist"* doubles insight gains.
- **At the Circle,** known ingredients (proven, or named by a bought hint) sort first as gold chips marked ✓.
- **Older saves:** each recipe's old insight joins the pool, and the hints it had already shown count as bought.

---

## 7. How it grows over the Chapters

| Chapter | Change |
|---|---|
| 1 Hearth | 3-ingredient recipes, count feedback, auto-deduction. Teaches the model |
| 2 Grave | Some 4-ingredient recipes. Gravetending curios carry more fragments. The dead can be *asked* (Summoning) for a hint |
| 3 Fern | **Divination:** spend a *vision* for per-item feedback on one attempt. **Forbidden pages** become readable, with Taint-gated recipes |
| 4 Drowned | Recipes that need an **omen as an ingredient** (a released omen fills a slot) |
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

## 9. Screens (wireframe)

**Grimoire: silhouette page**
```
┌─────────────────────────────┬──────────────────────────────────┐
│ SILHOUETTES · Chapter 1     │  ░░ DREAM PILLOW ░░   (3 things) │
│  ◌ Dream pillow      ▮▮▮▯▯  │                                  │
│  ◌ Hearth mark       ▮▯▯▯▯  │  I  "…for sleep that listens:    │
│  ◌ Threshold nail    ▯▯▯▯▯  │      the bitter dream-herb, the  │
│                             │      gentle flower, a scrap of   │
│ RECIPES · MATERIALS · LORE  │      cloth."                     │
│ OMENS · ▓ FORBIDDEN         │  II ▮▮▮▯▯▯  Insight 3 / 6        │
│                             │                                  │
│                             │  Proven wrong:  ̶S̶a̶l̶t̶  ̶A̶s̶h̶  ̶T̶a̶l̶l̶o̶w̶  │
│                             │  Suspected:     Mugwort ?        │
│                             │  Attempts:                       │
│                             │   Mugwort·Nettle·Rags   ◉◉○      │
│                             │   Salt·Ash·Tallow       ○○○      │
│                             │                                  │
│                             │        [ Attune the circle ]     │
└─────────────────────────────┴──────────────────────────────────┘
```

**Circle: attuned to Dream pillow**
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

---

## 10. Data shape (for the build)

```ts
// src/content/grimoire.ts (as built)
{
  id: "dream_pillow",
  kind: "hidden",              // "hidden" | "secret" | "scripted" | "forbidden"
  chapter: 1,
  ingredients: ["mugwort", "chamomile", "rags"],   // unordered
  hints: {
    riddle:   "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth.",
    category: ["A herb from the forest edge", "A herb from the garden", "Something from the attic"],
    plain:    ["mugwort", "chamomile"],            // revealed in this order
  },
  reward: { kind: "offline_bonus", bonus: 0.1 },   // +10% speed while away
  rewardText: "+10% speed on everything while you're away.",
  reveal: "The pillow smells of her. …",
}
// Insight thresholds are shared: INSIGHT = { category: 6, plain: 12, perExtraName: 6 }
```
Save state per recipe: `{ discovered, insight, attempts: [{ items, glows }], provenWrong, provenRight, marks }` (marks are no longer shown).

---

## 11. Open tuning questions

- Insight thresholds (6 / 12). Test with players who dislike puzzles, and check they never feel stuck for more than about 10 minutes.
- Should the circle limit candidates to items the player has *discovered*? (Yes by default. That keeps the pool at about 15–20 items in Chapter 1.)
- The "almost answered" flicker in free experiments might make secrets too easy. Test with and without it.
- Whether a discovery reveal should pause the action loop. Probably not: show it as a toast plus a Grimoire highlight.

---

## 12. Build notes (Chapter 1, M3)
- **Silhouettes appear with their first fragment.** Fragments come from:
  - deciphered pages past the 6 story pages (+3)
  - curios, read automatically (+3, with a short story)
  - three village requests that mention a recipe (+2, with the villager's aside)
  - failed attuned attempts (+1)
  Loose fragments (pages, curios) go to the unsolved hidden recipe with the least Insight.
- **Proven right:** when an attempt's not-yet-crossed-out items equal its glow count, they're all marked as belonging.
- **Discovery grants the effect at once.** The successful experiment *is* the making.
  - The Dream pillow makes time away count 10% extra (applied after the cap).
  - Threshold nail trust is kept as a fraction internally.
- **Toasts:** Insight from your own attempts only pops up a toast when it unlocks a clearer hint; otherwise the Grimoire page shows it.
- Content lives in `src/content/grimoire.ts` and logic in `src/engine/grimoire.ts`; the screens are `src/ui/screens/Grimoire.tsx` and `Circle.tsx`.

## 13. Guidance (UI feedback round)
Every screen answers "what is this for, and what do I do next?". Gameplay, not lore. Logic is in `src/ui/guidance.ts` (tested).
- **Grimoire:**
  - A three-step strip: *Collect insight → Buy a hint → Try it at the Circle* (third patch).
  - Each recipe page leads with **Gives** (the reward, so the player knows why to bother).
  - Then a **Next step** box that follows progress: "Try any 3 things at the Circle" → "2 of 3 known: find the last one" → "You know all 3: make it at the Circle". It has a button that attunes the Circle and goes there.
  - Then *Belongs* (proven, or named by a hint), *Crossed out*, and *Still possible* (things held that aren't ruled out).
  - The hints come last, with one line on where Insight comes from.
- **Circle:**
  - The Kindling panel comes first (the chapter's parts). Experiments are a separate panel below it, marked optional.
  - A step strip (① choose what to work on → ② pick things → ③ place them), with the current step lit.
  - A "Working on" line showing the reward and what's known.
  - A plain explanation under every result, honest that the glow is a count ("2 of 3 right, but not which. Swap one thing at a time…").
- **Pencil marks** (§5) are no longer shown. They added noise on top of the automatic tracking. Saved marks are kept in the save, unused.
