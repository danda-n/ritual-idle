# Chapter 1: Hearth. Content Pass (v0.7)

> This is the detail layer beneath [CONCEPT.md](CONCEPT.md). It covers the first session: from arriving at the cold house to the **Kindling of the Hearth-Circle**.
> It describes the chapter **as it is now**. What changed in each round is in the [Changelog](#changelog) at the end, and the reasons are in [CONCEPT.md's decision log](CONCEPT.md#decision-log).
> The numbers are checked by the headless playthrough test ([src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts), see §10) and are tuned in playtests. Item and action names are draft flavour.

---

## 1. Goals for Chapter 1

- **Hook within the first session.** The Rite lands in about 30–35 minutes for an efficient idle player (§10) and gives a big payoff: the first follower, raised caps, the cellar.
- **Teach every core system once, gently:**
  - timed actions
  - skills feeding each other
  - the Grimoire
  - one omen
  - hidden recipes
  - the village
  - rite outcome quality
- **Visible progress in the sanctum:** the room goes from cold and dark to candlelit and warded.
- **No Taint, no followers, no failure.** Taint is only hinted at.

**Skill unlocks across the game**

| Chapter | New skills | Total |
|---|---|---|
| 1 Hearth | Herbalism, Scavenging, Chandlery, Sigilcraft, Scholarship, Ritualism | 6 |
| 2 Grave | Gravetending, Alchemy, Binding-craft, Summoning | 10 |
| 3 Fern | Astrology, Divination, Purification (Taint arrives) | 13 |
| 4–5 | New depth and forbidden recipes, no new skills | 13 |

---

## 2. The chapter's spine: the Kindling, built in five parts

The Kindling is visible from the first minute, on the Circle tab. It has **five parts**, and each part is one stage of the chapter. A stage's note from grandmother brings **one new skill**. You make that part from what the new skill teaches and **place it in the Circle**. The rosette lights one petal per part, in the skill's colour. The last stage is performing the rite.

**Free order:** the Light always comes first and the Offering always comes last. In between, **you choose the order of the Ward, the Smoke and the Words**: when the Light is placed, the tracker (or the Circle) asks which part to make next, and again after the next one. Each choice brings that part's skill (and its place: the Grimoire comes with the Words). The choices are saved (`middleOrder` in the save).

**Sequencing rules** (checked by the playthrough test):
1. **No grinding.** Working through a part's checklist from the lowest-level recipe up earns every level the next recipe needs. The bot plays the checklists this way, in every order, and fails if it ever has to wait for a level with nothing to do.
2. **Nothing made without a use.** Everything a part needs you to craft is spent by that part or a later one (the bot checks leftovers at the rite).
3. **Each recipe opens at its own level.** Most come every 3 levels (1, 3, 6, 9, 12), but any level is allowed: Decipher a burnt page opens at Scholarship 2, Pick mugwort at Herbalism 5 and Scrape the salt barrel at Scavenging 7. Each recipe row shows its level (the "Lvl" column). A stage uses its skill's recipes up to level 6; deeper ones are for the village, house projects, trust and Chapter II.
4. **Each middle skill owns its gatherer,** so any order works: Sigilcraft sweeps its own ash, Scholarship searches the attic for its own pages, and Herbalism binds its own smudge bundles and makes the mugwort incense.
5. **A craft gives about the XP of gathering its inputs,** so crafting also levels the gatherer that feeds it.
6. **A gatherer shows only once something uses its finds:** a revealed recipe, an open part, a contract on the board, or a House project you can work toward (the midden shows once a project wants nails).

The table shows the stages in the default order (Ward, Smoke, Words); the middle three can come in any order.

| Stage | New skill (and place) | Part placed (its checklist) | Reward |
|---|---|---|---|
| 0 Start | **Scavenging** (+ the Circle) | Step: Search the pantry ×10 | a Surge |
| 1 Light | **Chandlery** | 40 tallow candles, 8 beeswax candles | +60 XP (Scavenging suggested) |
| 2–4 Ward | **Sigilcraft** | 40 salt lines, 12 ash sigils | a Surge |
| 2–4 Smoke | **Herbalism** | 16 smudge bundles, 6 mugwort incense | 10 tallow candles |
| 2–4 Words | **Scholarship** (+ the Grimoire; Experiments soon after) | 21 deciphered pages, the Litany | +80 XP (Scholarship suggested) |
| 5 Offering | **Ritualism** (+ the Village) | 2 bread, 3 salt, 15 consecrated salt | +60 XP (Ritualism suggested) |
| 6 Wake the Circle | | Begin the rite at Ritualism 3 (offerings optional) | |

- **One step per stage:** placing its part (in `steps` on each note in `src/content/notes.ts`); the Start stage's step is searching the pantry 10 times. What to make is the part's own **checklist**, in any order.
- **The part checklist** (in the tracker): each of the part's items with have/need, a ✓ when there's enough, and a button naming the skill that makes it ("Sigilcraft ›"; bread says "Village ›"). Under it, one **Short of** line worked out down the recipe tree with your talents and what you hold ("16 burnt pages · 26 tallow"; Fine ash halves the ash), and a level chip for any recipe on the way you can't run yet ("Scholarship 6 for copy the litany"). The logic is `shortfall` and `makerOf` in `src/engine/estimates.ts`; the playthrough bot plans from the same checklist.
- **Bread** for the Offering is bought at the Village with coin from contracts (the salt barrel also turns one up now and then).
- **Stage rewards:** one per stage, for placing its part, plus the Surge for the Start step. A reward waits for a gold **Claim** button in the tracker; progress never waits on it. Kinds:
  - items
  - XP into a skill you pick (a suggested one is marked)
  - a **Surge** (×2 speed on everything for 20 seconds)
- **Task-first cards:** a new stage pops a card with the part's items ("Make these, in any order, then place the part in the Circle"), its reward, and a button naming where the first missing item is made ("Chandlery ›"). Grandmother's note sits behind a collapsed **Story** link on the card, and in the Grimoire journal; there's no quote. A note without a part (the experiments note, the last note) shows one short gameplay line (`hint`) instead. The card closes only with its button or Escape, never by a stray click beside it.
- **Buttons name where they go:** "Chandlery ›", "Projects ›", "Village ›", "Circle ›", "Experiments ›". No button just says "Go".
- **The chapter tracker** (in the sidebar) shows the stages as stitches, the current part's checklist, its reward, and one "???" ahead. A **short chip** offers to start what makes that item. When you're idle, the **top bar shows the next task** with its place button.
- **The stage choice happens at the Circle:** when the Light is placed (and again after the next part), the game takes you to the Circle once, with a toast. There, "Choose the next part" shows a card per part: the skill it brings with a few lines on what that skill is (`about` in `src/content/skills.ts`), what you'll make, what it uses from skills you already have (the Words: tallow and beeswax candles), and what it opens (the Words: the Grimoire, then Experiments, each explained on click), with a "Make the Words next" button. The tracker, the top bar and the skill list only point to the Circle ("Next part: your choice · Circle ›").
- **Chances past 100%:** bonuses multiply a chance find without a cap. Past 100% it's one for sure plus a chance of another: 110% salt is 1 salt and a 10% chance of a 2nd (the crock plus Deep shelves: 112.5%). The recipe row shows the real percent, and its hover says it in words.
- **New words are explained** where they first appear (a click opens one or two lines from `src/content/glossary.ts`): the Circle, the Kindling, the Grimoire, the Village, contracts, trust, coin, hidden recipes, secrets, experiments, talents, Surge, curios, followers, the level cap, keepsakes, omens, blessings, offerings, rite quality, insight, charms and house projects.
- **Parts that aren't reached yet** show only their name and the skill they bring. No part asks for anything from a skill that isn't open (a test checks this).
- **Recipes show only when they matter:** each skill lists what you've reached plus whatever opens at the next level. A recipe also stays hidden while one of its ingredients comes from a skill that hasn't opened yet. Shortcuts (a short chip's Start, an item's lookup) only start recipes on a skill's list; the `start` command refuses anything not reached.
- **Placing:** from the Circle, or straight from the chapter tracker once a part is ready.
- **Experiments** open with their own side note with the first insight, once the Grimoire is open, and get their own tab. They're optional (§6).
- **Burnt pages** (`src/content/pages.ts`) teach only recipes off the main path: iron ward, chalk segment, hearth candle, hearth ward and juniper incense. The sixth page is the black-page teaser.
- **New words explained:** a few words the game introduces (keepsake, omen, blessing, offering, rite quality, insight, charm, house project) are underlined with a small "i"; a click opens a one- or two-line explanation (`src/content/glossary.ts`).
- **Feedback** (details in [DESIGN.md §7](DESIGN.md#7-feedback)):
  - item, level and coin floats, which queue and stack instead of overlapping
  - an **activity feed**, one quiet line under the top bar, for routine events (plain level-ups, omens, claims, talent picks, partial deliveries); click it for the last 30
  - **toasts only for big moments:** a part placed, a project built, a contract done, a new recipe or talent at a level-up, a new recipe from a page, rare finds, curios, the rite beginning
  - "New" badges on fresh recipes, the helped stamp, the tracker tick
  - staggered Circle glows, "Closer!", the discovery burst
  - the framed room at the chapter end
- **Inventory:** the inventory has its own tab, and every item has its own woodcut icon, coloured by the skill that makes it.

---

## 3. Skills and actions

The columns are: the level required · time per action · XP per action · inputs → outputs. The level cap in Chapter 1 is **20**. Each recipe opens at its own level (§2).
Outputs in brackets like "(50%)" are chance-based. Some recipes also need a **deciphered page** before they unlock (marked 📜).
On screen, a recipe row shows what you really get: talents, House projects and buffs are applied to its chances and quantities, and anything raised is marked (§11 and [DESIGN.md](DESIGN.md#6-places-each-tab)).

### Scavenging (the house's stores, the hives, the village midden)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Search the pantry | 1 | 3s | 4 | Tallow, salt (50%) |
| Rob the old hives | 3 | 4s | 6 | Beeswax |
| Sift the village midden | 6 | 4s | 10 | Iron nail, rags (30%) |
| Scrape the salt barrel | 7 | 4s | 11 | Salt, tallow (40%), bread (5%) |
| Open grandmother's chest | 9 | 4s | 13 | Chalk, curio (1%) |

### Chandlery
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Tallow candle | 1 | 4s | 8 | 2 tallow → Tallow candle |
| Beeswax candle | 3 | 5s | 12 | 2 beeswax → Beeswax candle |
| Hearth candle 📜 | 6 | 5s | 25 | 2 beeswax + 1 St John's wort → Hearth candle (contracts; a rite offering, §8) |
| Juniper incense 📜 | 9 | 5s | 30 | 2 juniper + 1 ash → Juniper incense (a contract; Chapter 2) |

### Sigilcraft (salt and ash)
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Salt line | 1 | 4s | 8 | 1 salt → Salt line |
| Sweep the hearth | 1 | 3s | 4 | Ash, charcoal (10%) |
| Ash sigil | 3 | 5s | 16 | 2 ash + 1 salt → Ash sigil |
| Iron ward 📜 | 6 | 4s | 24 | 2 iron nails + 1 salt → Iron ward |
| Chalk segment 📜 | 9 | 4s | 24 | 1 chalk + 1 salt → Chalk segment |
| Hearth ward 📜 | 12 | 5s | 60 | 2 chalk segments + 1 iron ward + 1 St John's wort → Hearth ward (a contract) |

### Herbalism (the garden and forest edge, and what's bound from it)
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Pick nettle | 1 | 3s | 8 | Nettle |
| Pick chamomile | 3 | 3s | 8 | Chamomile |
| Bind a smudge bundle | 3 | 5s | 24 | 2 nettle + 1 chamomile → Smudge bundle |
| Pick mugwort (the dream-herb) | 5 | 4s | 10 | Mugwort |
| Mugwort incense | 6 | 5s | 24 | 2 mugwort + 1 tallow → Mugwort incense |
| Pick yarrow | 9 | 3s | 9 | Yarrow |
| Pick St John's wort (the Kupala herb) | 9 | 4s | 12 | St John's wort |
| Cut juniper | 12 | 4s | 15 | Juniper |

### Scholarship (grandmother's pages)
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Search the attic | 1 | 4s | 6 | Burnt page (40%), rags (50%), glass (30%), curio (0.5%) |
| Decipher a burnt page | 2 | 5s | 22 | 1 burnt page + 1 tallow candle → Deciphered page. The first six each teach a 📜 recipe or lore |
| **Copy the Litany** | 6 | 6s | 40 | 3 deciphered pages + 1 beeswax candle → Grandmother's Litany (part of the Words) |

After the six story pages, each deciphered page brings 2 insight.

### Ritualism (minor rites: repeatable, longer, higher XP)
| Rite | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Bless the threshold | 1 | 6s | 20 | 1 salt line + 1 tallow candle → Consecrated salt |
| Smoke the rooms | 3 | 8s | 25 | 1 smudge bundle + 1 tallow candle → Blessing (a 15-minute +10% speed buff to all Chapter 1 skills; the row says so) |

**Curios** (from grandmother's chest and the attic) aren't kept in the Inventory. Each is read when found (its toast says "+3 insight") and joins a collection in the Grimoire journal (Curios n/5), listed by name with the story collapsed under it.

---

## 4. The village and the house: coin, contracts and projects

- **The contract board** shows **2 contracts** at a time. Each asks for a good amount of one or two things. Finishing one pays **coin** plus **trust**, and a new contract knocks after a short delay.
- **Delivery in parts:** "Deliver what I have" hands over whatever you hold of what's still needed. What's delivered stays delivered (kept per slot, with a bar per item); the last delivery ("Deliver and finish") pays.
- **Trust** unlocks better-paying contracts (at 2, 3, 4 and 5). The board shows when the next ones start.
- **There's no "sell anything" market.** Coin comes only from contracts, so the resource chains stay meaningful.
- **Board rules:**
  - An emptied slot refills after **30 seconds** of game time, including offline.
  - Any contract can be **turned away** at no cost (what was delivered to it is gone), so a contract you can't fill never blocks the board.
  - The village opens with the Offering stage, when every skill but Ritualism is already open. The Offering's bread is bought with coin from contracts. Trust-0 contracts use early items only (nettle and chamomile, ash, tallow candles, salt lines).
- **Chapter 1 contracts** (`src/content/requests.ts`). A card shows who's asking and a short **label** in plain type; their full line ("Nettle soup, for the widow Hana. My legs won't carry me…") is the label's hover title. Three contracts carry an **aside** when finished, a free hint toward a hidden recipe (+2 insight), kept on that recipe's Grimoire page as "Heard in the village": Hana ("Grandmother made me a pillow for bad dreams. Bitter-smelling." → Dream pillow), the Kral farm ("She drew a mark on our hearth in ash. Salt on top." → Hearth mark) and the young mother ("The witch kept a nail under her door, and a yellow flower." → Threshold nail).

| Label (from) | Needs | Pays | Trust needed |
|---|---|---|---|
| Nettle soup (Widow Hana) | 30 nettle + 10 chamomile | 15 coin, +1 trust | 0 |
| Lye ash (the soapmaker) | 40 ash | 12 coin, +1 trust | 0 |
| Grave candles (Old Tomas) | 12 tallow candles | 20 coin, +1 trust | 0 |
| Doorstep salt (the ferryman's wife) | 12 salt lines | 18 coin, +1 trust | 0 |
| Cough remedy (the miller) | 15 chamomile + 8 yarrow | 30 coin, +1 trust | 2 |
| Stable mark (the Kral farm) | 4 ash sigils + 6 salt lines | 40 coin, +1 trust | 2 |
| Smoke the loft (the weaver) | 4 smudge bundles | 45 coin, +1 trust | 3 |
| Sickroom smoke (the sexton's wife) | 3 juniper incense | 60 coin, +2 trust | 3 |
| Wake candles (the Dvorak family) | 4 hearth candles + 4 beeswax candles | 80 coin, +2 trust | 4 |
| Cradle iron (a young mother) | 3 iron wards + 6 salt lines | 70 coin, +2 trust | 5 |
| Church ward (the sexton) | 1 hearth ward + 4 chalk segments | 110 coin, +2 trust | 5 |

  Hana's label stays "Nettle soup" and her name "Widow Hana": the Hana's soup secret leans on them.

- **What coin buys in Chapter 1** (`src/content/shop.ts`): provisions only.

| Purchase | Cost | Why |
|---|---|---|
| Bread (for bread and salt) | 5 coin | Needed for the Offering (2) |
| Tallow ×10 | 8 coin | Backup when the pantry runs short |

- **Coin later:** coin is meant to come in later for some exclusive or rare projects and rare rewards (not in Chapter 1 yet).
- **House projects:** side work you build once, from things you make, with no coin. Nothing on the main path needs them; they give the deeper recipes (the midden, the chest, iron wards) and the attic's odds and ends a use. A **Projects** panel on the House tab shows them once Chandlery is open (`src/content/upgrades.ts`). Each row states its effect (generated from the data), one extra fact where needed, and a plain "what it's for" line (`blurb`):

| Project | Built from | Effect |
|---|---|---|
| **Omen shelf** | 10 tallow candles + 4 beeswax candles | Holds 2 omens · 1st omen included · omens drop from any work (§5) |
| **Sealed salt crock** | 8 beeswax + 6 tallow candles | Salt finds ×1.5: pantry salt 50% → 75% (for the Ward and the Offering) |
| **Reading lamp** | 6 beeswax candles + 8 glass | +15% Scholarship speed |
| **Herb drying rack** | 12 iron nails + 10 rags | +10% Herbalism yield (a visible rack in the scene) |
| **Mended shutters** | 20 iron nails + 15 rags + 10 salt lines | Offline cap 24h → 36h *(the first taste of the cap upgrades; 72h comes in Chapter 2)* |
| **Carved omen shelf** (after the omen shelf) | 6 chalk + 2 iron wards | Omen storage 2 → 3 |

- **The omen shelf is highlighted** until it's built, since it's the way into omens:
  - Once the Light is placed, the chapter tracker shows a quiet optional line, **"Side project · Omen shelf"**, with have/need chips and "Projects ›" (or "Build it").
  - In the Projects panel, the omen shelf row carries a **"New"** tag and a soft glow, and the panel title says how many projects are ready to build.
  - A one-time toast says when you could first build it ("Omen shelf: ready to build").
  - Building it is a toast, not a dialog: "Omen shelf built · Holds 2 omens · 1 Still Night stored · bless a skill: ×2 speed, 2m". Project rows state their effect generated from the data (`upgradeEffect`), plus one extra fact where needed (`extra`).
- **Old saves:** anyone who had met an omen keeps an omen shelf; the old bought shelf (3 omens) becomes the carved shelf; the board trims to 2 contracts.

---

## 5. Omen: Still Night (the only omen in Chapter 1)

- **Omens need the omen shelf.** None turn up until you build it (a house project, §4, highlighted to the player from the Light onwards). Building it brings the **first Still Night**, and its toast says what blessing a skill gives.
- **Drop:** after that, about 1 in 100 actions (roughly every 4–5 minutes of work), online or offline. The Ritualism talent *Omen-sense* doubles it (§11).
- **Storage:** the omen shelf holds 2; the carved omen shelf holds 3.
- **Bless a skill (2 minutes):** a dialog asks which open skill to bless, with the one you're running first. That skill gets **×2 speed and ×2 chance finds**. Blessings on different skills run side by side; the same skill again adds 2 minutes. The dialog lists what's already active.
- **Its lesson:** save omens for the skill you want to rush.
- **During the rite:** Still Night active at any point during the rite is one of the rite's offerings (§8).
- **An omen that drops on a full shelf** is lost, and the feed says so ("Omen lost (shelf full)"); the shelf's count has the rule as its hover title.

---

## 6. Hidden recipes and charms (Grimoire discovery tutorial)

There are four hidden recipes in Chapter 1. None unlock by level. You find them with **insight** and by experimenting on the **Experiments** tab, which opens with its own side note once the Grimoire is open and you have your first insight (in practice during the Words stage). Everything here is optional.

- **Insight** is one pool, counted on the Grimoire and the Experiments tab. It comes from wrong tries (+1), pages past the sixth (+2), curios (+3) and the three contracts that mention a recipe (+2). There are no toasts, just a float on the Grimoire tab.
- **You spend it on the hint you want** (see [GRIMOIRE.md](GRIMOIRE.md) §6):
  - a hidden recipe's categories (4)
  - one more ingredient named (6); the last ingredient is never named
  - a nudge toward that last ingredient, never its name (6)
  - a secret's next written clue (4)
- **Experimenting:** attune the Circle to a hidden recipe on the Experiments tab. The glow count shows how many items are right, wrong items are crossed out automatically, and known ingredients sort first as gold chips. The attuned recipe's hints sit on the same tab.
- **The free Circle** takes exactly 3 things; every Chapter 1 hidden recipe and secret is 3 things.
- **There are also 2 secrets** (Honey-light and Hana's soup), each with 3 written clues you can buy.
- **The list shows what each hidden recipe gives,** so you know what you're hunting for.
- **The Window charm comes first:** it's made from what every path holds when experiments open (a tallow candle, a glass shard from the attic, salt), so even a player who took the Words first can start. The experiments note points to it.

| Hidden recipe | Riddle (free) | Recipe | Gives for good |
|---|---|---|---|
| **Window charm** | "…a light for the window, glass to hold it, salt along the sill." | Tallow candle + glass shard + salt | +10% speed, all skills |
| **Dream pillow** | "…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth." | Mugwort + chamomile + rags | +10% XP, all skills |
| **Hearth mark** | "…where the fire lived, draw its name in what it left behind, and salt to keep it." | Ash + charcoal + salt | +1 rite quality (an offering, §8) · +10% Sigilcraft speed |
| **Threshold nail** | "…cold iron under the door, and the Kupala herb to make it sing." | Iron nail + St John's wort + salt | Trust gains ×2, and grandmother's hidden note opens (the first thread toward the hidden 5th follower) |

**Charms** (`src/content/charms.ts`, `src/content/buffs.ts`): once a hidden recipe is discovered, its charm can be bound again on the Experiments tab, at once, as often as you like, from 1 of each ingredient. Using a charm starts a **10-minute** boost (using another of the same kind refreshes it; it never stacks). Active charms show in the sidebar's blessings panel (Omens & blessings) with the time left.

| Charm | Boost for 10 minutes |
|---|---|
| Window charm | Chance finds ×1.5, all skills |
| Dream pillow | +25% XP, all skills |
| Hearth mark | 15% of crafts use no inputs |
| Threshold nail | Contracts pay +50% coin |

---

## 7. Taint teaser

- One Grimoire page is **black**: *"Ink of the Unwritten."* Its recipe shows but can't be read: *"The ink is too dark to read. Not yet."*
- Deciphering the 6th page adds grandmother's note: *"Leave that page be. I didn't."*
- **Pays off in Chapter 3,** when Taint and Purification arrive.

---

## 8. The Major Rite: Kindling the Hearth-Circle

**The rite needs its five parts placed in the Circle** (§2) and **Ritualism 3**.

- **When it's ready:** once all five parts are placed, a banner, "The Circle is ready. Wake it.", takes the place of the House tab's hero (and shows on the Circle). It lists what the rite needs (Ritualism 3, all five parts), the optional offerings with the quality ladder, and one red button, **Begin the rite**. Its line: "Kindling of the Hearth-Circle · 3 min, less if you tend it · runs offline · can't fail".
- **Performing it:** **five phases of 36 seconds each** (about 3 minutes in all), one per part. It takes the action slot, **runs by itself** and carries on offline if you step away. You begin it by hand (priming, which begins a rite by itself, comes with the longer rites of later chapters).
- **The rite scene:** while it runs, the House tab's main area becomes the rite: "Phase N of 5", the part's name in large letters, the phase's line, a phase bar and the time left, a field where things to tend appear, and the five-row phase checklist (✓ done, ▸ now, · later). The Circle shows a compact copy. Each phase's line (`HEARTH_RITE.phases` in `src/content/rite.ts`) also goes to the Grimoire journal's Kindling entry.
- **Tending (optional):** things to tend pop up in the field, one kind per phase: wicks to light (the Light), gaps in the salt to close (the Ward), smoke to fan (the Smoke), words to read (the Words), bread to set down (the Offering). Each click takes **3 seconds** off (`TEND_MS`), up to **half the rite** (`TEND_MAX_MS` = 90 seconds), so an active player finishes in about 1.5 minutes and an idle one in 3. Nothing is lost by not tending. The foot of the scene shows "Time taken off: 0:45 of 1:30 · optional · leave any time, it keeps going".
- **Offerings (optional):** chosen before you begin. Each is one quality step (`OFFERINGS` in `src/content/rite.ts`):
  - **a hearth candle** at the heart of the circle (an item, used when the rite begins; "Uses 1 · poured at Chandlery 6")
  - **the Hearth mark** discovered (a hidden recipe on the Experiments tab, §6; counts by itself)
  - **a Still Night blessing** active at any point while it runs (§5; counts by itself)
- **The quality ladder** (on the banner and the chapter end): the three offerings, each ✓ counted or ○ not yet, with how to get it (the hearth candle is a checkbox before the rite), then **Sound** (no offerings: the story rewards) → **Fine** (1–2: + choose 1 keepsake) → **Resplendent** (all 3: + choose 2 keepsakes and the embroidered circle cloth), with the current one marked. Under it: "Quality never changes the story rewards, and the rite can't fail."
- **It never fails.** Quality counts offerings (`QUALITY_AT`): none = Sound, 1–2 = Fine, all 3 = Resplendent. A finished rite records which offerings counted.
- **Quality adds keepsakes, never the story rewards.** A **Fine** rite lets you choose **one keepsake** of three, a **Resplendent** one **two** (`KEEPSAKES` and `KEEPSAKE_PICKS` in `src/content/keepsakes.ts`). They're kept for good (swapping them comes with Ascension):

| Keepsake | Effect |
|---|---|
| Grandmother's quilt | +10% offline speed |
| A jar of embers | +1 omen slot (once the shelf is built) |
| Her reading glasses | +1 insight per page deciphered |

  Each card states its effect; its line of lore is the card's hover title. **Choosing:** click a keepsake to choose it, click again to change your mind; the choice is kept when you leave the chapter-end screen (the `chooseKeepsakes` command). Close it without choosing and the tracker keeps a **Choose a keepsake** button, whose chooser has a **Keep** button.
- **The chapter-end screen** ("Chapter I · Hearth") comes in sections: the rite (its quality and the ladder, with the offerings that counted), what it gave (a ledger: caps rise to 40, Janko, the cellar, the cloth if Resplendent), the keepsakes to choose, and the story, folded. Its button reads "Keep it · back to the house" (or "Back to the house").
- **Story rewards (the same at every quality):**
  - All caps rise to **40** (the content for it comes with Chapter II).
  - **Follower 1** arrives: Janko, a village orphan who "heard the circle wake" (his row's hover title), with +20% Chandlery speed.
  - The **cellar** opens in the sanctum.
  - The finale and lore lines, in the Grimoire journal's Kindling entry (and under a collapsed **Story** on the chapter-end screen).
- **Resplendent bonus:** choose two keepsakes, and a cosmetic (the embroidered circle cloth). Its second-circle lore line also goes to the journal, but it isn't sold as a reward.
- **Afterwards** the house goes back to work (through the fallback rule), and a bridge note closes the chapter. The tracker shows a small **Chapter I complete** card (Janko joined, skill caps rise to 40, Chapter II comes in a later build) and nothing more to chase; the next goal is Chapter II.
- **Janko** ("assist me") gives +30% speed on your current action, and +20% Chandlery speed. Hana's double pay ends when the rite completes.

---

## 9. After the Rite: the bridge to Chapter 2

- The first follower starts in **"assist me"** mode. A brief note explains assigning them to a mastered action.
- The offline cap and the away summary are introduced properly: *"Rest. The house will keep working."*
- **The first Chapter 2 goal** appears (the Grave tier). This is the natural stopping point, so the player leaves on a hook.

---

## 10. Pacing check (headless playthrough)

[src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts) plays Chapter 1 as an efficient idle player, on the real game engine and content.
- It plans each part from the same checklist the tracker shows (`shortfall`), working up from the lowest-level recipe, raw things before what's made from them. It claims rewards (XP where suggested), places parts, takes a side of every talent pair as it comes (§11), takes salt from the salt barrel once it can, fills contracts for coin to buy bread, and lets the rite run without tending.
- No omens, no offerings, no experiments, no charms and no house projects.
- It plays **all 6 orders** of the free middle parts on 2 seeds each (all "A" talents), plus the **other build** (all "B" talents) in two orders.
- It runs as part of `npm test`. It fails if, in any run:
  - the chapter can't be finished, or a note soft-locks
  - **anything needs a level the checklist work didn't earn** (grinding)
  - **crafted things are left over** at the rite (more than 3 of any)
  - the rite begins outside **28–45 minutes**
  - two skills open **less than 3 minutes apart** (after the tutorial pair)
  - a skill's stage takes **less than 3 or more than 12 minutes**
- `npm run pacing` prints each part's time.
- **XP curve:** XP to the next level = **110 × 1.1^(level − 1)**, with no easing: 110 XP for level 2, 121 for 3, 133 for 4. The flatter curve keeps new recipes coming every few levels.
- **Length:** the chapter's length follows from the "no grinding" rule; the designer chose about 30–35 minutes.
- **Level speed:** each level makes its own skill 1% faster, compounding.
- **Result** (6 orders × 2 seeds): the rite begins at **29–32 minutes**, and it takes about 3 (about 1.5 if tended), so the chapter is about **32–35 minutes** for an efficient idle player (about 45–60 with side projects and experiments). Stage lengths (seed 1, Ward → Smoke → Words): Light 7.0, Ward 5.3, Smoke 4.1, Words 7.1, Offering 5.2 minutes, then the rite.

**Things to tune in playtests:**
- **Whether ~30 minutes feels right.** Longer means bigger parts (every item still has a use) and slower levels, together.
- **The Smoke is the shortest stage,** and the Light and the Words the longest.
- **Surges, omens and talents** make everything faster for active players. Watch whether the chapter becomes too quick for them.

---

## 11. Talents as builds, and level speed

- **A pair at levels 3, 6, 9 and 12:** at each, a skill offers two talents and **you take one side, A or B**. The sides pull different ways, and some help another skill. By the Chapter 1 cap of 20, every skill has all four pairs open.
- **A pick is fixed until the next pair's level** (`TALENT_RELOCK` = 3 levels): the level-3 pick can be changed from level 6, the level-6 pick from 9, the level-12 pick from 15. Taking a talent asks first ("Fixed until level 9"). There is no reset.
- **The panel** shows only the pairs reached so far plus the next one, and folds to one line (the picks' names) while no choice is waiting.
- **Old saves:** older talent ranks are dropped on load; you choose again.
- **Effects** (`TalentEffect` in `src/content/talents.ts`):
  - **speed:** this skill, or another skill, is faster
  - **xp:** more XP in this skill, or another
  - **find:** chance finds are more likely (all of them, or one item)
  - **bulk:** +1 of the main output, and its XP, but each repetition takes longer
  - **double:** a chance a repetition comes doubled (outputs and XP)
  - **extra:** a chance of 1 extra of each sure output
  - **everyNth:** every nth repetition gives 1 extra
  - **thrift:** a recipe uses fewer of one input
  - **save:** a chance a recipe uses no inputs at all
  - **byproduct:** a recipe sometimes also gives another item
  - **insight:** insight from each repetition of a recipe
  - **buffLength:** buffs from this skill's rites last longer
  - **omenChance:** omens turn up more often, from any work
- **Talent text is generated from the effects** (`talentText` in `src/ui/effects.ts`), so the words always match the numbers. A talent in `src/content/talents.ts` has a name, its effects and an optional `flavour` line (hover only); there's no hand-written description. The wording, one vocabulary for all:
  - speed and XP: "+15% Scavenging speed", "+25% Scavenging XP"
  - finds: just the multiplier ("Salt ×2 as likely", "Scavenging chance finds ×1.5"); the recipe rows show what it does to each chance
  - bulk: "makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour" (or "no extra time")
  - double: "10% of Scavenging actions give double output and XP"
  - thrift: "Tallow candle: 1 tallow (was 2)"; save: "15% of Sigilcraft crafts use no inputs"
  - buff length: "Blessing lasts ×2 (15m → 30m)"
  A snapshot test (`src/ui/effects.test.ts`) lists every talent's words, so a wording change shows up in review.
- **All talents** (the words as the game shows them, shortened where long):

| Skill | Lvl | A | B |
|---|---|---|---|
| Scavenging | 3 | **Quick fingers:** +15% Scavenging speed | **Deep shelves:** Scavenging chance finds ×1.5 |
| | 6 | **Full arms:** Search the pantry and Rob the old hives: makes 2 per action instead of 1, XP ×2 (chance finds still roll once) · each takes 80% longer, so +11% per hour | **For the chandler:** +12% Chandlery speed |
| | 9 | **Scavenger's luck:** 10% of Scavenging actions give double output and XP | **Busy hands:** +25% Scavenging XP |
| | 12 | **Grandmother's eye:** Curio ×3 as likely | **Well stocked:** Salt ×2 as likely |
| Chandlery | 3 | **Quick pour:** +15% Chandlery speed | **Thin wicks:** Tallow candle: 1 tallow (was 2) |
| | 6 | **Double moulds:** Tallow and beeswax candles: makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour | **Wick ash:** Tallow and beeswax candles: 33% chance of +1 ash |
| | 9 | **Steady flame:** 10% of Chandlery actions give double output and XP | **A light to read by:** +12% Scholarship speed |
| | 12 | **Hearth-light:** Hearth candle: makes 2 per action instead of 1, XP ×2, no extra time | **Chandler's pride:** +30% Chandlery XP |
| Sigilcraft | 3 | **Sure strokes:** +15% Sigilcraft speed | **Fine ash:** Ash sigil: 1 ash (was 2) |
| | 6 | **Long lines:** Salt line: makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour | **Warded rooms:** +12% Ritualism speed |
| | 9 | **Steady hand:** 15% of Sigilcraft crafts use no inputs | **Practised:** +25% Sigilcraft XP |
| | 12 | **Charcoal eye:** Charcoal ×3 as likely | **Iron will:** Iron ward: makes 2 per action instead of 1, XP ×2, no extra time |
| Herbalism | 3 | **Light step:** +15% Herbalism speed | **Green thumb:** 20% chance of +1 of each sure Herbalism output |
| | 6 | **Tight bundles:** Bind a smudge bundle: makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour | **Pure smoke:** Mugwort incense: no tallow (was 1) |
| | 9 | **Dew-picked:** Every 5th Herbalism action gives +1 of each sure output | **Herb-wise:** +12% Chandlery speed |
| | 12 | **Wild harvest:** 10% of Herbalism actions give double output and XP | **Herbwife:** +30% Herbalism XP |
| Scholarship | 3 | **Quick eyes:** +15% Scholarship speed | **Keen search:** Scholarship chance finds ×1.5 |
| | 6 | **By one candle:** Decipher a burnt page: 50% chance to use no inputs | **Marginalia:** Decipher a burnt page: +1 insight each |
| | 9 | **Well read:** +25% Scholarship XP | **The rite's words:** +20% Ritualism XP |
| | 12 | **Footnotes:** Decipher a burnt page: +2 insight each | **Copyist:** 10% of Scholarship actions give double output and XP |
| Ritualism | 3 | **Practised rites:** +15% Ritualism speed | **Devout:** +25% Ritualism XP |
| | 6 | **Long blessing:** Blessing lasts ×2 (15m → 30m) | **Consecrated hands:** 30% of Ritualism crafts use no inputs |
| | 9 | **Omen-sense:** Omens ×2 as likely, from any work | **Circle-keeper:** +12% Sigilcraft speed |
| | 12 | **Blessed work:** 10% of Ritualism actions give double output and XP | **High rites:** +30% Ritualism XP |

- **Recipe rows show the talents at work:** outputs appear as you really get them (find talents, projects and buffs on chances, bulk on quantities; `effectiveOutputs` in `src/engine/estimates.ts`, shared with the per-hour rates). A raised number is in the "improved" colour with a ▲, and its hover title names what raised it ("raised by Deep shelves, Sealed salt crock").
- **Where:** a vine under each skill's recipes on the House tab: the skill at the root, level 3 nearest the root, and a pair of leaves at each talent level. The taken leaf fills in the skill's colour and the other dims; pairs not reached yet stay stitched outlines. A skill tile shows a "+N" badge when N choices are waiting.
- **Level speed:** each level also makes its own skill 1% faster, compounding.
- **All rolls use the seeded RNG,** and only for bonuses the player has, so offline progress applies them the same way.

---

## Changelog

One short entry per round, oldest first. The reasons behind each change are in [CONCEPT.md's decision log](CONCEPT.md#decision-log).

- **Vertical slice (M0–M7):** Chapter 1 playable end to end: 6 skills, grandmother's notes, a village request board, Still Night, 3 hidden recipes and a 30-minute Rite, with offline progress, save/load, the fallback, ETAs, item lookup and the living sanctum. A headless bot plays the chapter as a test.
- **UI feedback round:** a chapter tracker replaces the notes panel, and each note is a one-time story card (all kept in the Grimoire journal). Effects are stated plainly from the data. The ink-and-paper look with a folk colour per skill.
- **Playtest-readiness round:** curios became a collection; the free Circle takes 3 things; 8 requests; notes end with Go, short chips offer to start their maker, and an idle top bar shows the next task. The feedback kit (floats, "New" badges, stamps, Circle glows, the discovery burst). Rite quality counts three factors. The chapter took about 90 minutes.
- **First patch:** the staged Kindling: five parts, one new skill per stage, only the next recipe showing. Talents in three branches with keystones; +1% speed per level; a slower XP curve.
- **Second patch:** small steps inside every stage, Tend (an optional speed meter), a faster start, Still Night blessing a skill you choose, and task-first cards with a Go button.
- **Third patch:** no grinding and nothing made without a use, so the chapter became about 30–35 minutes. Step rewards you claim (Surge, XP where you choose, items, omens); omens every few minutes; talents drawn as a tree of life; insight spent on the hints you choose; the rite played as five short moments.
- **Fourth patch:** calm UI (stacked floats, rows that stay put and start on click). Tend removed; the rite runs by itself in about 3 minutes, with optional offerings for quality. Recipes in tiers every 3 levels and a flatter XP curve; a free order for the Ward, the Smoke and the Words; honest steps. Talents as pick-one-of-two pairs at 3, 6, 9 and 12. House projects built from items; 2 contracts delivered in parts; omens need the omen shelf. An activity feed, fewer toasts, a Stores tab, and an icon for every item.
- **After the fourth patch:** the omen shelf is highlighted to the player (a one-time card, a tracker line, a "New" tag, a one-time toast). Coin is planned for exclusive or rare projects and rare rewards later. The docs now describe the current game, with this changelog.
- **Rite quality pays:** a Fine rite lets you choose a keepsake, a Resplendent one two (quilt, jar of embers, reading glasses). The kiss/curse bargains ("The Circle Asks") are planned from Chapter 2.
- **Design system v0.4 ("Hearth + Folk"):** a new look for every screen (see DESIGN.md); no change to the chapter's content or numbers.
- **Text trimmed to a spreadsheet style:** screens lead with numbers and verbs, and the story moves to the Grimoire journal (collapsed). Task cards lose the quote (a "Story" link instead); contracts show short labels (full lines as hover titles); the omen-shelf card and its after-build note are gone (a toast instead); the rite log is a phase checklist; keepsakes state their effect (lore as hover title); a Resplendent rite is sold as two keepsakes and the cloth, not "more lore". Shorter step labels and villager asides; no change to numbers.
- **Before the next playtest:** talents are fixed until the next tier (confirm to take one, no reset), and the panel shows only what's reached; the last stage is just "Wake the Circle" (its two steps never blocked the rite); after the rite the tracker lists what's still to find; XP rewards can't go into a skill at the cap.
- **Playtest reset 1:** every save from before this build starts fresh (with a notice), because the chapter changed a lot.
- **Inventory:** the Stores tab is now called Inventory.
- **Playtest round 2:** salt relief (Scrape the salt barrel at Scavenging 7; the Sealed salt crock project, pantry salt 50% → 75%); recipes open at their own level (a "Lvl" column instead of tiers; Decipher at Scholarship 2, mugwort at Herbalism 5). Each stage's steps became one part checklist (have/need, a button to the maker, a "Short of" line, level chips), in any order; the Offering's "finish a contract" step is gone. Talent words generated from their effects, and recipe rows show boosted outputs. The rite as an event: a "Wake it" banner, the rite scene on the House with optional tending (up to half the rite), a quality ladder, a chapter end in sections, keepsakes kept on leaving (save version 10). Experiments get their own tab, the Window charm as the first hidden recipe, new rewards (Dream pillow +10% XP, Hearth mark also +10% Sigilcraft speed, Threshold nail trust ×2), charms for 10-minute boosts, and a nudge for the never-named ingredient. New words explained on click; House project blurbs; the stage choice explains each part. After the rite, a "Chapter I complete" card replaces Still to find. Buttons name where they go. Shortcuts can no longer start recipes not yet reached. Chances can pass 100% (one for sure plus a chance of another), and find talents say just their multiplier. The next part is chosen at the Circle (the game takes you there), with a card per part. Every new term is explained on click. The rite still begins at 29–32 minutes.
- **Playtest reset 2:** every save from before this build starts fresh (with a notice): steps, experiments, the rite and chances all changed.
