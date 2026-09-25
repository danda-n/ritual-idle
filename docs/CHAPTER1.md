# Chapter 1: Hearth. Content Pass (v0.5, fourth patch)

> This is the detail layer beneath [CONCEPT.md](CONCEPT.md). It covers the first session: from arriving at the cold house to the **Kindling of the Hearth-Circle**.
> The numbers are a first pass. They're checked by the headless playthrough test ([src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts), see §10) and will be tuned in playtests.
> Item and action names are draft flavour.

---

## 1. Goals for Chapter 1

- **Hook within the first session.** The Rite lands in about 30–35 minutes of active play (the length chosen in the third patch, §10) and gives a big payoff: the first follower, raised caps, the cellar.
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

**Skill unlocks across the game** *(decided)*

| Chapter | New skills | Total |
|---|---|---|
| 1 Hearth | Herbalism, Scavenging, Chandlery, Sigilcraft, Scholarship, Ritualism | 6 |
| 2 Grave | Gravetending, Alchemy, Binding-craft, Summoning | 10 |
| 3 Fern | Astrology, Divination, Purification (Taint arrives) | 13 |
| 4–5 | New depth and forbidden recipes, no new skills | 13 |

---

## 2. The chapter's spine: the Kindling, built in five parts *(first patch; re-sized in the third; free order in the fourth)*

The Kindling is visible from the first minute, on the Circle tab. It has **five parts**, and each part is one stage of the chapter. A stage's note from grandmother brings **one new skill**. You make that part from what the new skill teaches and **place it in the Circle**. The rosette lights one petal per part, in the skill's colour. The last stage is performing the rite.

**Free order** *(fourth patch)*: the Light always comes first and the Offering always comes last. In between, **you choose the order of the Ward, the Smoke and the Words**: when the Light is placed, the tracker (or the Circle) asks which part to make next, and again after the next one. Each choice brings that part's skill (and its place: the Grimoire comes with the Words). The choices are saved (`middleOrder` in the save).

**Sequencing rules** *(third patch; re-laid in the fourth; checked by the playthrough test)*:
1. **Every step's count earns the level the next step needs.** You never grind a level with nothing to do; the bot follows the steps literally, in every order, and fails if it ever has to.
2. **Nothing made without a use.** Everything a step asks you to craft is spent by a later step or a part (the bot checks leftovers at the rite).
3. **Recipes come in tiers, a new tier every 3 levels** *(fourth patch)*: Tier 1 at level 1, Tier 2 at 3, Tier 3 at 6, then 9, 12, 15 and 18 (`TIER_LEVELS` in `src/content/actions.ts`). Each recipe row shows "Tier N · Lvl L". A stage uses Tiers 1–3 of its skill; deeper tiers are for the village, house projects, trust and Chapter II.
4. **Each middle skill owns its gatherer** *(fourth patch)*, so any order works: Sigilcraft sweeps its own ash, Scholarship searches the attic for its own pages, and Herbalism binds its own smudge bundles and makes the mugwort incense.
5. **A craft gives about the XP of gathering its inputs,** so crafting also levels the gatherer that feeds it.
6. **A gatherer shows only once something uses its finds:** a revealed recipe, an open part, a contract on the board, or the current stage's steps.

The table shows the stages in the default order (Ward, Smoke, Words); the middle three can come in any order.

| Stage | New skill (and place) | Steps | Part placed | Reward |
|---|---|---|---|---|
| 0 Start | **Scavenging** (+ the Circle) | Search the pantry ×10 | | a Surge |
| 1 Light | **Chandlery** | Pour 40 tallow candles → Chandlery 3 · Rob the old hives ×16 (Scavenging 3) · Pour 8 beeswax candles | 40 tallow candles, 8 beeswax candles | +60 XP (Scavenging suggested) |
| 2–4 Ward | **Sigilcraft** | Lay 40 salt lines → Sigilcraft 3 · Sweep the hearth ×24 · Draw 12 ash sigils | 40 salt lines, 12 ash sigils | a Surge |
| 2–4 Smoke | **Herbalism** | Pick 32 nettle → Herbalism 3 · Pick 16 chamomile · Bind 16 smudge bundles · Pick 12 mugwort (Herbalism 6) · Make 6 mugwort incense | 16 smudge bundles, 6 mugwort incense | 10 tallow candles |
| 2–4 Words | **Scholarship** (+ the Grimoire) | Pour 24 tallow candles to read by · Search the attic ×60 · Decipher 24 burnt pages (Scholarship 3; 21 for the Words, 3 for the Litany) · Copy the Litany (Scholarship 6) | 21 deciphered pages, the Litany | +80 XP (Scholarship suggested) |
| 5 Offering | **Ritualism** (+ the Village) | Finish a contract for a villager · Lay 15 salt lines · Pour 17 tallow candles · Bless the threshold ×15 | 2 bread, 3 salt, 15 consecrated salt | +60 XP (Ritualism suggested) |
| 6 Perform | | Bind 2 smudge bundles · Smoke the rooms ×2 (Ritualism 3) · begin the rite (Ritualism 3) | | |

- **Small steps** *(second patch; made honest in the fourth)*: they're in `steps` on each note in `src/content/notes.ts`.
  - **Steps count from the stage's start.** What you did before the stage doesn't count, so a step always means the work in front of you. The tracker shows live progress.
  - **A craft step is also met by holding enough** of what it makes (for example, candles you already poured).
  - **Step counts match the part's needs exactly** (40 salt lines for a part that needs 40).
  - Once done, a step stays done. They can be met in any order; the stage ends when its part is placed.
- **Step rewards** *(third patch; one per stage since the fourth)*: at most one reward per stage, on its *place* step, plus the Surge for the Start step. A reward waits for a gold **Claim** button in the tracker; progress never waits on it. Kinds:
  - items for the next step
  - XP into a skill you pick (the one the next step needs is suggested)
  - a **Surge** (×2 speed on everything for 20 seconds)
- **Task-first cards** *(second patch)*: a new stage pops a card with its steps and reward, what the part needs, and a Go button to the current step. Grandmother gets one short line (`quote`); her full note is in the Grimoire journal. *(Fourth patch)* The card closes only with its button or Escape, never by a stray click beside it.
- **Go** *(fourth patch)* leads to the skill that makes the current step's **first missing ingredient**, not just the stage's skill.
- **Parts that aren't reached yet** show only their name and the skill they bring. No part asks for anything from a skill that isn't open (a test checks this).
- **Recipes show only when they matter:** each skill lists what you've reached plus what comes at the next tier. A recipe also stays hidden while one of its ingredients comes from a skill that hasn't opened yet.
- **Placing:** from the Circle, or straight from the chapter tracker once a part is ready.
- **Experiments** open with their own side note with the first insight, once the Grimoire is open. They're optional.
- **Burnt pages** (`src/content/pages.ts`) teach only recipes off the main path: iron ward, chalk segment, hearth candle, hearth ward and juniper incense. The sixth page is the black-page teaser.

---

## 3. Skills and actions *(re-laid in tiers in the fourth patch)*

The columns are: the tier and level required · time per action · XP per action · inputs → outputs. The level cap in Chapter 1 is **20**. A new tier comes every 3 levels (§2).
*Italic outputs are chance-based.* Some recipes also need a **deciphered page** before they unlock (marked 📜).

### Scavenging (the house's stores, the hives, the village midden)
| Action | Tier · Lvl | Time | XP | Output |
|---|---|---|---|---|
| Search the pantry | 1 · 1 | 3s | 4 | Tallow, *salt (50%)* |
| Rob the old hives | 2 · 3 | 4s | 6 | Beeswax |
| Sift the village midden | 3 · 6 | 4s | 10 | Iron nail, *rags (30%)* |
| Open grandmother's chest | 4 · 9 | 4s | 13 | Chalk, *curio (1%)* |

### Chandlery
| Action | Tier · Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Tallow candle | 1 · 1 | 4s | 8 | 2 tallow → Tallow candle |
| Beeswax candle | 2 · 3 | 5s | 12 | 2 beeswax → Beeswax candle |
| Hearth candle 📜 | 3 · 6 | 5s | 25 | 2 beeswax + 1 St John's wort → Hearth candle *(contracts; a rite offering, §8)* |
| Juniper incense 📜 | 4 · 9 | 5s | 30 | 2 juniper + 1 ash → Juniper incense *(a contract; Chapter 2)* |

### Sigilcraft (salt and ash)
| Action | Tier · Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Salt line | 1 · 1 | 4s | 8 | 1 salt → Salt line |
| Sweep the hearth | 1 · 1 | 3s | 4 | Ash, *charcoal (10%)* |
| Ash sigil | 2 · 3 | 5s | 16 | 2 ash + 1 salt → Ash sigil |
| Iron ward 📜 | 3 · 6 | 4s | 24 | 2 iron nails + 1 salt → Iron ward |
| Chalk segment 📜 | 4 · 9 | 4s | 24 | 1 chalk + 1 salt → Chalk segment |
| Hearth ward 📜 | 5 · 12 | 5s | 60 | 2 chalk segments + 1 iron ward + 1 St John's wort → Hearth ward *(a contract)* |

### Herbalism (the garden and forest edge, and what's bound from it)
| Action | Tier · Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Pick nettle | 1 · 1 | 3s | 8 | Nettle |
| Pick chamomile | 2 · 3 | 3s | 8 | Chamomile |
| Bind a smudge bundle | 2 · 3 | 5s | 24 | 2 nettle + 1 chamomile → Smudge bundle |
| Pick mugwort (the dream-herb) | 3 · 6 | 4s | 10 | Mugwort |
| Mugwort incense | 3 · 6 | 5s | 24 | 2 mugwort + 1 tallow → Mugwort incense |
| Pick yarrow | 4 · 9 | 3s | 9 | Yarrow |
| Pick St John's wort (the Kupala herb) | 4 · 9 | 4s | 12 | St John's wort |
| Cut juniper | 5 · 12 | 4s | 15 | Juniper |

### Scholarship (grandmother's pages)
| Action | Tier · Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Search the attic | 1 · 1 | 4s | 6 | *Burnt page (40%)*, *rags (50%)*, *glass (30%)*, *curio (0.5%)* |
| Decipher a burnt page | 2 · 3 | 5s | 22 | 1 burnt page + 1 tallow candle → Deciphered page. The first six each teach a 📜 recipe or lore |
| **Copy the Litany** | 3 · 6 | 6s | 40 | 3 deciphered pages + 1 beeswax candle → Grandmother's Litany (part of the Words) |

After the six story pages, each deciphered page brings 2 insight.

### Ritualism (minor rites: repeatable, longer, higher XP)
| Rite | Tier · Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Bless the threshold | 1 · 1 | 6s | 20 | 1 salt line + 1 tallow candle → Consecrated salt |
| Smoke the rooms | 2 · 3 | 8s | 25 | 1 smudge bundle + 1 tallow candle → *Blessing* (a 15-minute +10% speed buff to all Chapter 1 skills; the row says so) |

## 4. The village and the house: coin, contracts and projects *(decided: Village coin; contracts and projects in the fourth patch)*

- **The contract board** shows **2 contracts** at a time *(fourth patch: it was 3 smaller requests)*. Each asks for a good amount of one or two things. Finishing one pays **coin** plus **trust**, and a new contract knocks after a short delay.
- **Delivery in parts** *(fourth patch)*: "Deliver what I have" hands over whatever you hold of what's still needed. What's delivered stays delivered (kept per slot, with a bar per item); the last delivery ("Deliver and finish") pays.
- **Trust** unlocks better-paying contracts (at 2, 3, 4 and 5). The board shows when the next ones start.
- **There's no "sell anything" market.** Coin comes only from contracts, so the resource chains stay meaningful.
- **Build details** *(M1)*:
  - An emptied slot refills after **30 seconds** of game time, including offline.
  - Any contract can be **turned away** at no cost (what was delivered to it is gone), so a contract you can't fill never blocks the board.
  - The village opens with the Offering stage, when every skill but Ritualism is already open. Its first step is to finish one contract. Trust-0 contracts use early items only (nettle and chamomile, ash, tallow candles, salt lines).
- **Chapter 1 contracts** (`src/content/requests.ts`):

| Contract | Needs | Pays | Trust needed |
|---|---|---|---|
| "Nettle soup, for the widow Hana" | 30 nettle + 10 chamomile | 15 coin, +1 trust | 0 |
| "Ash for the lye" (the soapmaker) | 40 ash | 12 coin, +1 trust | 0 |
| "Candles for my father's grave" | 12 tallow candles | 20 coin, +1 trust | 0 |
| "Salt across our doorstep" | 12 salt lines | 18 coin, +1 trust | 0 |
| "Something for the miller's cough" | 15 chamomile + 8 yarrow | 30 coin, +1 trust | 2 |
| "A mark over the stable door" | 4 ash sigils + 6 salt lines | 40 coin, +1 trust | 2 |
| "Smoke out whatever is in my loft" | 4 smudge bundles | 45 coin, +1 trust | 3 |
| "Juniper smoke for the sickroom" | 3 juniper incense | 60 coin, +2 trust | 3 |
| "Candles for the wake" | 4 hearth candles + 4 beeswax candles | 80 coin, +2 trust | 4 |
| "Iron by the cradle" | 3 iron wards + 6 salt lines | 70 coin, +2 trust | 5 |
| "A ward for the church door" | 1 hearth ward + 4 chalk segments | 110 coin, +2 trust | 5 |

- **What coin buys in Chapter 1** (`src/content/shop.ts`) *(fourth patch: only provisions)*:

| Purchase | Cost | Why |
|---|---|---|
| Bread (for bread and salt) | 5 coin | Needed for the Offering |
| Tallow ×10 | 8 coin | Backup when the pantry runs short |

- **House projects** *(fourth patch; they replace the coin upgrades)*: side work you build once, from things you make, with no coin. Nothing on the main path needs them; they give the deeper recipes (the midden, the chest, iron wards) and the attic's odds and ends a use. A **Projects** panel on the House tab shows them once Chandlery is open (`src/content/upgrades.ts`):

| Project | Built from | Effect |
|---|---|---|
| **Omen shelf** | 10 tallow candles + 4 beeswax candles | Omens start to turn up (two fit), and the first Still Night comes with the shelf (§5) |
| **Reading lamp** | 6 beeswax candles + 8 glass | +15% Scholarship speed |
| **Herb drying rack** | 12 iron nails + 10 rags | +10% Herbalism yield (a visible rack in the scene) |
| **Mended shutters** | 20 iron nails + 15 rags + 10 salt lines | Offline cap 24h → 36h *(the first taste of the cap upgrades; 72h comes in Chapter 2)* |
| **Carved omen shelf** (after the omen shelf) | 6 chalk + 2 iron wards | Omen storage 2 → 3 |

- **Old saves** *(fourth patch)*: anyone who had met an omen keeps an omen shelf; the old bought shelf (3 omens) becomes the carved shelf; the board trims to 2 contracts.

---

## 5. Omen: Still Night *(the only omen in Chapter 1; re-tuned in the third patch; behind the omen shelf since the fourth)*

- **Omens need the omen shelf** *(fourth patch)*. None turn up until you build it (a house project, §4). Building it brings the **first Still Night** and a short note on what omens do.
- **Drop:** after that, about 1 in 100 actions (roughly every 4–5 minutes of work), online or offline. The Ritualism talent *Omen-sense* doubles it (§13).
- **Storage:** the omen shelf holds 2; the carved omen shelf holds 3.
- **Bless a skill (2 minutes)** *(fourth patch: it was "Release")*: a dialog asks which open skill to bless, with the one you're running first. That skill gets **×2 speed and ×2 chance finds**. Blessings on different skills run side by side; the same skill again adds 2 minutes. The dialog lists what's already active.
- **Its lesson:** save omens for the skill you want to rush.
- **During the rite:** Still Night active at any point during the rite is one of the rite's offerings (§8).
- **An omen that drops on a full shelf** passes unseen, and the player is told why.

---

## 6. Hidden recipes (Grimoire discovery tutorial)

There are three hidden recipes in Chapter 1. None unlock by level. You find them with **insight** and by **experimenting at the Circle**.

- **Insight** *(third patch)* is one pool, counted on the Grimoire. It comes from wrong tries at the Circle (+1), pages past the sixth (+2), curios (+3) and the three contracts that mention a recipe (+2). There are no toasts, just a float on the Grimoire tab.
- **You spend it on the hint you want** (see [GRIMOIRE.md](GRIMOIRE.md) §6):
  - a hidden recipe's categories (4)
  - one more ingredient named (6)
  - a secret's next written clue (4)
- **Experimenting:** attune the Circle to a hidden recipe. The glow count shows how many items are right, wrong items are crossed out automatically, and known ingredients sort first as gold chips.
- **There are also 2 secrets** (Honey-light and Hana's soup), each with 3 written clues you can buy.
- **The Grimoire list shows what each hidden recipe gives** *(fourth patch)*, so you know what you're hunting for.

| Hidden recipe | Riddle (free) | Recipe | Effect |
|---|---|---|---|
| **Dream pillow** | *"…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."* | Mugwort + chamomile + rags | +10% to all offline progress (a permanent sanctum item) |
| **Hearth mark** | *"…where the fire lived, draw its name in what it left behind, and salt to keep it."* | Ash + charcoal + salt | Counts as an offering for rites: +1 quality step (§8) |
| **Threshold nail** | *"…cold iron under the door, and the Kupala herb to make it sing."* | Iron nail + St John's wort + salt | Village trust ×1.5, and grandmother's hidden note opens (the first thread toward the hidden 5th follower) |

---

## 7. Taint teaser

- One Grimoire page is **black**: *"Ink of the Unwritten."* Its recipe shows but can't be read: *"The ink is too dark to read. Not yet."*
- Deciphering the 6th page adds grandmother's note: *"Leave that page be. I didn't."*
- **Pays off in Chapter 3,** when Taint and Purification arrive.

---

## 8. The Major Rite: Kindling the Hearth-Circle *(it runs by itself since the fourth patch)*

**The rite needs its five parts placed in the Circle** (§2) and **Ritualism 3**.

- **Performing it:** **five phases of 36 seconds each** (about 3 minutes in all), one per part, each adding a line to the rite's log (content: `HEARTH_RITE.phases` in `src/content/rite.ts`). It takes the action slot and **runs by itself**: there's nothing to answer, and it carries on offline if you step away. *(Fourth patch: the third patch's played moments are gone.)*
- **Offerings (optional):** chosen on the rite's card before you begin. Each is one quality step (`OFFERINGS` in `src/content/rite.ts`):
  - **a hearth candle** at the heart of the circle (an item, used when the rite begins; §3)
  - **the Hearth mark** discovered (a hidden recipe, §6; counts by itself)
  - **a Still Night blessing** active at any point while it runs (§5; counts by itself)
- **It never fails.** Quality counts offerings (`QUALITY_AT`): none = **Sound**, 1–2 = **Fine**, all 3 = **Resplendent**.
- **Quality changes only cosmetics and lore,** never the rewards.
- **Rewards (the same at every quality):**
  - All caps rise to **40** (the content for it comes with Chapter II).
  - **Follower 1** arrives. *(draft)* A village orphan who "heard the circle wake", with the trait *Hearth-born: +20% Chandlery*.
  - The **cellar** opens in the sanctum.
  - A lore chapter.
- **Resplendent bonus:** a cosmetic (embroidered circle cloth) and an extra lore line.
- **Afterwards** the house goes back to work (through the fallback rule), and a bridge note closes the chapter.
- **Janko** ("assist me") gives +30% speed to whatever you do, and +20% more on Chandlery. Hana's double pay ends when the rite completes.

---

## 9. After the Rite: the bridge to Chapter 2

- The first follower starts in **"assist me"** mode. A brief note explains assigning them to a mastered action.
- The offline cap and the away summary are introduced properly: *"Rest. The house will keep working."*
- **The first Chapter 2 goal** appears (the Grave tier). This is the natural stopping point, so the player leaves on a hook.

---

## 10. Pacing check (headless playthrough)

[src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts) plays Chapter 1 as an efficient idle player, on the real game engine and content.
- It follows each stage's steps literally, claims rewards (XP where suggested), places parts, takes a side of every talent pair as it comes (§13), fills contracts for bread, and lets the rite run.
- No omens, no offerings and no experiments.
- *(Fourth patch)* It plays **all 6 orders** of the free middle parts on 2 seeds each (all "A" talents), plus the **other build** (all "B" talents) in two orders.
- It runs as part of `npm test`. It fails if, in any run:
  - the chapter can't be finished, or a note soft-locks
  - **anything needs a level the steps didn't earn** (grinding)
  - **crafted things are left over** at the rite (more than 3 of any)
  - the rite begins outside **28–45 minutes**
  - two skills open **less than 3 minutes apart** (after the tutorial pair)
  - a skill's stage takes **less than 3 or more than 12 minutes**
- `npm run pacing` prints each step's time.
- **XP curve** *(fourth patch)*: XP to the next level = **110 × 1.1^(level − 1)**, with no easing: 110 XP for level 2, 121 for 3, 133 for 4. With a new tier every 3 levels, the flatter curve keeps tiers coming.
  - *History:* 25 × 1.18^(L−1), then 165 × 1.14 (first patch), then 245 × 1.14 with the ease (second), then 612 × 1.14 with the ease (third).
  - The third patch set the chapter's length by the rule "no grinding", and the designer chose about 30–35 minutes.
- **Level speed:** each level makes its own skill 1% faster, compounding.
- **Result** (fourth patch; 6 orders × 2 seeds): the rite begins at **30–32 minutes**, and it takes about 3, so the chapter is about **33–35 minutes** for an efficient idle player. Stage lengths (seed 1, Ward → Smoke → Words): Light 7.0, Ward 5.2, Smoke 4.1, Words 7.1, Offering 5.7, Perform 0.5 minutes.

**Things to tune in playtests:**
- **Whether ~30 minutes feels right.** Longer means bigger parts (every item still has a use) and slower levels, together.
- **The Smoke is now the shortest stage,** and the Light and the Words the longest.
- **Surges, omens and talents** make everything faster for active players. Watch whether the chapter becomes too quick for them.

---

## 11. What the vertical slice needs from this document

> **Status: complete** (milestones M0–M7). Everything below is built, tested and played through; see the README.
> Open tuning items: §10 and [PLAYTEST.md](PLAYTEST.md).

### Original checklist

The first build needs:
- all of §2–§8: 6 skills, 27 actions, the notes sequence, the request board, 1 omen, 3 hidden recipes, the Rite
- offline progress
- save/load
- a placeholder sanctum with visible states (dark → candlelit → warded → circle awake → cellar door)

Everything after the Rite can be a "to be continued" screen.

---

## 12. Playtest-readiness round (review → fix → polish → joy)
- **Curios** are a collection (Grimoire → Curios n/5) with their stories. They no longer sit in the pantry.
- **Requests:** 8 in total. *Ash for the soapmaker* (trust 0) makes the early board vary; *juniper smoke for the sickroom* (trust 3) gives juniper incense a use.
- **The free Circle** takes exactly 3 things; every Chapter 1 secret is 3 things.
- **First ten minutes:**
  - Each note ends with a **Go** button that takes you to the task.
  - The tracker's current step shows what it needs as chips; a short chip offers to start what makes it.
  - An idle top bar shows the next task.
  - Locked recipes collapse into one summary line per skill *(replaced in the first patch: only the next recipe shows)*.
- **Feedback:**
  - item, level and coin floats
  - unlock toasts and "New" badges
  - the helped stamp, the tracker tick
  - staggered Circle glows, "Closer!", the discovery burst
  - the framed room at the chapter end
- **Pacing** (bot, 5 seeds): 89–91 minutes of active play, including the 30-minute Rite.

---

## 13. Talents as builds, and level speed *(fourth patch; replaces the first patch's branches)*

- **A pair at levels 3, 6, 9 and 12** (one per tier): at each, a skill offers two talents and **you take one side, A or B**. The sides pull different ways, and some help another skill. By the Chapter 1 cap of 20, every skill has all four pairs open.
- **Switching is free,** any time: click the other side. **Reset is free** too.
- **Old saves:** the first patch's branch ranks are dropped on load; you choose again.
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
- **All talents** (content in `src/content/talents.ts`):

| Skill | Lvl | A | B |
|---|---|---|---|
| Scavenging | 3 | **Quick fingers:** +15% Scavenging speed | **Deep shelves:** chance finds (salt, rags, curios) 50% more likely |
| | 6 | **Full arms:** the pantry and the hives give 2 at a time (and twice the XP), but take 80% longer | **For the chandler:** Chandlery 12% faster |
| | 9 | **Scavenger's luck:** 10% chance a search comes doubled, XP too | **Busy hands:** +25% Scavenging XP |
| | 12 | **Grandmother's eye:** curios three times as likely | **Well stocked:** the pantry always turns up salt |
| Chandlery | 3 | **Quick pour:** +15% Chandlery speed | **Thin wicks:** tallow candles take 1 tallow instead of 2 |
| | 6 | **Double moulds:** candles come 2 at a time (and twice the XP), but take 80% longer | **Wick ash:** a third of your candles also leave 1 ash |
| | 9 | **Steady flame:** 10% chance a pour comes doubled, XP too | **A light to read by:** Scholarship 12% faster |
| | 12 | **Hearth-light:** hearth candles come in pairs, at no extra time | **Chandler's pride:** +30% Chandlery XP |
| Sigilcraft | 3 | **Sure strokes:** +15% Sigilcraft speed | **Fine ash:** ash sigils take 1 ash instead of 2 |
| | 6 | **Long lines:** salt lines come 2 at a time (and twice the XP), but take 80% longer | **Warded rooms:** Ritualism 12% faster |
| | 9 | **Steady hand:** 15% of workings use no materials | **Practised:** +25% Sigilcraft XP |
| | 12 | **Charcoal eye:** sweeping turns up charcoal three times as often | **Iron will:** iron wards come in pairs, at no extra time |
| Herbalism | 3 | **Light step:** +15% Herbalism speed | **Green thumb:** 20% chance of an extra herb or bundle |
| | 6 | **Tight bundles:** smudge bundles come 2 at a time (and twice the XP), but take 80% longer | **Pure smoke:** mugwort incense needs no tallow |
| | 9 | **Dew-picked:** every 5th pick gives 1 extra | **Herb-wise:** Chandlery 12% faster |
| | 12 | **Wild harvest:** 10% chance a pick comes doubled, XP too | **Herbwife:** +30% Herbalism XP |
| Scholarship | 3 | **Quick eyes:** +15% Scholarship speed | **Keen search:** the attic's finds (pages, rags, curios) 50% more likely |
| | 6 | **By one candle:** half the pages you decipher need no candle or page | **Marginalia:** +1 insight from every page deciphered |
| | 9 | **Well read:** +25% Scholarship XP | **The rite's words:** +20% Ritualism XP |
| | 12 | **Footnotes:** +2 insight from every page deciphered | **Copyist:** 10% chance a working comes doubled, XP too |
| Ritualism | 3 | **Practised rites:** +15% Ritualism speed | **Devout:** +25% Ritualism XP |
| | 6 | **Long blessing:** smoking the rooms blesses them twice as long | **Consecrated hands:** 30% of rites use no materials |
| | 9 | **Omen-sense:** omens turn up twice as often, from any work | **Circle-keeper:** Sigilcraft 12% faster |
| | 12 | **Blessed work:** 10% chance a blessing comes doubled, XP too | **High rites:** +30% Ritualism XP |

- **Where:** a vine under each skill's recipes on the House tab: the skill at the root, level 3 nearest the root, and a pair of leaves at each talent level. The taken leaf fills in the skill's colour and the other dims; pairs not reached yet stay stitched outlines. A skill tile shows a "+N" badge when N choices are waiting.
- **Level speed:** each level also makes its own skill 1% faster, compounding.
- **All rolls use the seeded RNG,** and only for bonuses the player has, so offline progress applies them the same way.
