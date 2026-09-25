# Chapter 1: Hearth. Content Pass (v0.4, third patch)

> This is the detail layer beneath [CONCEPT.md](CONCEPT.md). It covers the first session: from arriving at the cold house to the **Kindling of the Hearth-Circle**.
> The numbers are a first pass. They're checked by the headless playthrough test ([src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts), see §10) and will be tuned in playtests.
> Item and action names are draft flavour.

---

## 1. Goals for Chapter 1

- **Hook within the first session.** The Rite lands in about 1.5–2 hours of active play and gives a big payoff: the first follower, raised caps, the cellar.
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

## 2. The chapter's spine: the Kindling, built in five parts *(first patch; re-sized in the third)*

The Kindling is visible from the first minute, on the Circle tab. It has **five parts**, and each part is one stage of the chapter. A stage's note from grandmother brings **one new skill**. You make that part from what the new skill teaches and **place it in the Circle**. The rosette lights one petal per part, in the skill's colour. The last stage is performing the rite.

**Sequencing rules** *(third patch; checked by the playthrough test)*:
1. **Every step's count earns the level the next step needs.** You never grind a level with nothing to do; the bot follows the steps literally and fails if it ever has to.
2. **Nothing made without a use.** Everything a step asks you to craft is spent by a later step or a part (the bot checks leftovers at the rite).
3. **Each skill's second recipe comes at level 2, the third at 3.** Deeper recipes are for the village, trust and Chapter II.
4. **A craft gives about the XP of gathering its inputs,** so crafting also levels the gatherer that feeds it.
5. **A gatherer shows only once something uses its finds:** a revealed recipe, an open part, a request on the board, or the current stage's steps. No sweeping (ash) until Sigilcraft wants it.

| Stage | New skill (and place) | Steps (count = what the next step needs) | Part placed |
|---|---|---|---|
| 0 Start | **Scavenging** (+ the Circle) | Search the pantry ×10 · Tend once | |
| 1 Light | **Chandlery** | Pour 27 tallow candles → Chandlery 2 · Rob the hives ×12 (Scav 2) · Pour 6 beeswax candles | 25 tallow candles, 6 beeswax candles |
| 2 Ward | **Sigilcraft** | Lay 27 salt lines → Sigilcraft 2 · Sweep the hearth ×18 (Scav 2) · Draw 10 ash sigils | 25 salt lines, 10 ash sigils |
| 3 Smoke | **Herbalism** | Pick 30 nettle (+100 XP) → Herbalism 2 · Pick 15 chamomile · Bind 15 smudge (+100 XP) → Chandlery 3 · Pick 8 mugwort · Burn 4 mugwort incense | 13 smudge bundles, 4 mugwort incense |
| 4 Words | **Scholarship** (+ the Grimoire) | Pour 10 tallow candles (+100 XP) → Scav 3 · Search the attic ×25 · Decipher 10 pages → Scholarship 2 · Copy the Litany | 7 deciphered pages, the Litany |
| 5 Offering | **Ritualism** (+ the Village) | Help a villager · Bless the threshold ×11 → Ritualism 2 | 2 bread, 3 salt, 10 consecrated salt |
| 6 Perform | | Smoke the rooms ×2 · begin the rite (Ritualism 2) | |

- **Small steps** *(second patch)*: they're in `steps` on each note in `src/content/notes.ts`, checked against lifetime counts and levels, so they never un-complete. They can be met in any order; the stage ends when its part is placed, so a skipped step (like *Tend once*) never blocks anything.
- **Step rewards** *(third patch)*: a done step's reward waits for a gold **Claim** button in the tracker; progress never waits on it. Kinds:
  - items for the next step
  - XP into a skill you pick (the one the next step needs is suggested)
  - a **Surge** (×2 speed on everything for 20 seconds)
  - an omen
- **Task-first cards** *(second patch)*: a new stage pops a card with its steps and rewards, what the part needs, and a Go button to the current step. Grandmother gets one short line (`quote`); her full note is in the Grimoire journal.
- **Parts that aren't reached yet** show only their name and the skill they bring. No part asks for anything from a skill that isn't open (a test checks this).
- **Recipes show only when they matter:** each skill lists what you've reached plus what comes at the next level. A recipe also stays hidden while one of its ingredients comes from a skill that hasn't opened yet.
- **Placing:** from the Circle, or straight from the chapter tracker once a part is ready. The tracker's Go button opens the current step's skill.
- **Experiments** open with their own side note with the first insight, once the Grimoire is open. They're optional.
- **Burnt pages** (`src/content/pages.ts`) teach only recipes off the main path: iron ward, chalk segment, hearth candle, hearth ward and juniper incense. The sixth page is the black-page teaser.

---

## 3. Skills and actions

The columns are: the level required · time per action · XP per action · inputs → outputs. The level cap in Chapter 1 is **20**.
*Italic outputs are chance-based.* Some recipes also need a **deciphered page** before they unlock (marked 📜).

### Scavenging (house, attic, beehives, village midden)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Search the pantry | 1 | 3s | 4 | Tallow, *salt (50%)* |
| Rob the old hives | 2 | 4s | 6 | Beeswax |
| Sweep the hearth | 2 | 3s | 4 | Ash, *charcoal (10%)* |
| Search the attic | 3 | 4s | 6 | *Burnt page (40%)*, *rags (50%)*, *glass (30%)*, *curio (0.5%)* |
| Sift the village midden | 10 | 4s | 12 | Iron nail, *rags (30%)* |
| Open grandmother's chest | 14 | 4s | 15 | Chalk, *curio (1%)* |

### Chandlery
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Tallow candle | 1 | 4s | 8 | 2 tallow → Tallow candle |
| Beeswax candle | 2 | 5s | 12 | 2 beeswax → Beeswax candle |
| Smudge bundle | 2 | 5s | 13 | 2 nettle + 1 chamomile → Smudge bundle |
| Mugwort incense | 3 | 5s | 18 | 2 mugwort + 1 ash → Mugwort incense |
| Hearth candle 📜 | 10 | 4s | 25 | 2 beeswax + 1 St John's wort → Hearth candle *(village requests)* |
| Juniper incense 📜 | 14 | 5s | 30 | 2 juniper + 1 ash → Juniper incense *(village requests; Chapter 2)* |

### Sigilcraft
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Salt line | 1 | 4s | 8 | 1 salt → Salt line |
| Ash sigil | 2 | 5s | 16 | 2 ash + 1 salt → Ash sigil |
| Iron ward 📜 | 6 | 3s | 20 | 2 iron nails + 1 salt → Iron ward |
| Chalk segment 📜 | 10 | 4s | 20 | 1 chalk + 1 salt → Chalk segment |
| Hearth ward 📜 | 12 | 5s | 40 | 2 chalk segments + 1 iron ward + 1 St John's wort → Hearth ward *(a village request)* |

### Herbalism (garden and forest edge)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Pick nettle | 1 | 3s | 4 | Nettle |
| Pick chamomile | 2 | 3s | 5 | Chamomile |
| Pick mugwort (the dream-herb) | 2 | 4s | 7 | Mugwort |
| Pick yarrow | 5 | 3s | 8 | Yarrow |
| Pick St John's wort (the Kupala herb) | 10 | 4s | 12 | St John's wort |
| Cut juniper | 14 | 4s | 15 | Juniper |

### Scholarship
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Decipher a burnt page | 1 | 5s | 22 | 1 burnt page + 1 tallow candle → Deciphered page. The first six each teach a 📜 recipe or lore |
| **Copy the Litany** | 2 | 6s | 40 | 3 deciphered pages + 1 beeswax candle → Grandmother's Litany (part of the Words) |

After the six story pages, each deciphered page brings 2 insight.

### Ritualism (minor rites: repeatable, longer, higher XP)
| Rite | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Bless the threshold | 1 | 6s | 20 | 1 salt line + 1 tallow candle → Consecrated salt |
| Smoke the rooms | 2 | 8s | 25 | 1 smudge bundle + 1 tallow candle → *Blessing* (a 15-minute +10% speed buff to all Chapter 1 skills; the row says so) |

## 4. The village: coin and requests *(decided: Village coin)*

- **The request board** shows **3 requests** at a time. Filling one pays **coin** plus **trust**, and a new request appears after a short delay.
- **Trust** unlocks better-paying requests (at 2, 3 and 5). The board shows when the next ones start.
- **There's no "sell anything" market.** Coin comes only from requests, so the resource chains stay meaningful.
- **Build details** *(M1)*:
  - An emptied slot refills after **30 seconds** of game time, including offline.
  - Any request can be **turned away** at no cost, so a request you can't fill never blocks the board.
  - The village opens with the Offering stage, when every skill but Ritualism is already open. Trust-0 requests use early items only (nettle, ash, tallow candles, salt lines).
  - Trust gates in `src/content/requests.ts`: the miller's cough and the stable mark need 2 trust, the loft and the sickroom 3, the wake candles 4, the cradle and the church door 5.
- **Example requests in Chapter 1:**

| Request | Needs | Pays |
|---|---|---|
| "Nettle soup for the widow Hana" | 10 nettle | 6 coin |
| "Salt across our doorstep" | 4 salt lines | 8 coin |
| "Candles for my father's grave" | 3 tallow candles | 10 coin |
| "Something for the miller's cough" (trust 2) | 5 chamomile + 2 yarrow | 12 coin |
| "A mark over the stable door, the cow won't milk" (trust 2) | 1 ash sigil | 15 coin |
| "Smoke out whatever is in my loft" (trust 3) | 1 smudge bundle | 20 coin |
| "Candles for the wake" (trust 4) | 2 hearth candles | 35 coin |
| "Iron by the cradle" (trust 5) | 1 iron ward | 30 coin *(+ extra trust)* |
| "A ward for the church door" (trust 5) | 1 hearth ward | 50 coin |

- **What coin buys in Chapter 1:**

| Purchase | Cost | Why |
|---|---|---|
| Bread (for bread and salt) | 5 coin | Needed for the Rite offering |
| Tallow ×10 | 8 coin | Backup when the pantry runs short |
| **Sanctum: herb drying rack** | 60 coin | +10% Herbalism yield (a visible rack in the scene) |
| **Sanctum: reading lamp** | 80 coin | +15% Scholarship speed |
| **Sanctum: omen shelf** | 50 coin | Omen storage 1 → 3 |
| **Sanctum: mended shutters** | 120 coin | Offline cap 24h → 36h *(the first taste of the cap upgrades; 72h comes in Chapter 2)* |

---

## 5. Omen: Still Night *(the only omen in Chapter 1; re-tuned in the third patch)*

- **Drop:** about 1 in 100 actions (roughly every 4–5 minutes of work), online or offline. Step rewards give a couple more.
- **Storage:** the omen shelf holds 2 at the start and 3 after the upgrade.
- **Release (2 minutes):** a dialog asks which open skill to bless, with the one you're running first. That skill gets **×2 speed and ×2 chance finds**. Blessings on different skills run side by side; the same skill again adds 2 minutes. The dialog lists what's already active.
- **Its lesson:** save omens for the skill you want to rush.
- **During the rite:** Still Night active at any point during the rite is one quality step (§8).
- **An omen that drops on a full shelf** passes unseen, and the player is told why.

---

## 6. Hidden recipes (Grimoire discovery tutorial)

There are three hidden recipes in Chapter 1. None unlock by level. You find them with **insight** and by **experimenting at the Circle**.

- **Insight** *(third patch)* is one pool, counted on the Grimoire. It comes from wrong tries at the Circle (+1), pages past the sixth (+2), curios (+3) and some villagers (+2). There are no toasts, just a float on the Grimoire tab.
- **You spend it on the hint you want** (see [GRIMOIRE.md](GRIMOIRE.md) §6):
  - a hidden recipe's categories (4)
  - one more ingredient named (6)
  - a secret's next written clue (4)
- **Experimenting:** attune the Circle to a hidden recipe. The glow count shows how many items are right, wrong items are crossed out automatically, and known ingredients sort first as gold chips.
- **There are also 2 secrets** (Honey-light and Hana's soup), each with 3 written clues you can buy.

| Hidden recipe | Riddle (free) | Recipe | Effect |
|---|---|---|---|
| **Dream pillow** | *"…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."* | Mugwort + chamomile + rags | +10% to all offline progress (a permanent sanctum item) |
| **Hearth mark** | *"…where the fire lived, draw its name in what it left behind, and salt to keep it."* | Ash + charcoal + salt | +1 quality step for rites |
| **Threshold nail** | *"…cold iron under the door, and the Kupala herb to make it sing."* | Iron nail + St John's wort + salt | Village trust ×1.5, and grandmother's hidden note opens (the first thread toward the hidden 5th follower) |

---

## 7. Taint teaser

- One Grimoire page is **black**: *"Ink of the Unwritten."* Its recipe shows but can't be read: *"The ink is too dark to read. Not yet."*
- Deciphering the 6th page adds grandmother's note: *"Leave that page be. I didn't."*
- **Pays off in Chapter 3,** when Taint and Purification arrive.

---

## 8. The Major Rite: Kindling the Hearth-Circle *(a played ceremony since the third patch)*

**The rite needs its five parts placed in the Circle** (§2) and **Ritualism 2**.

- **Performing it:** a ceremony of **five phases of a minute each**, one per part (content: `HEARTH_RITE.phases` in `src/content/rite.ts`). It takes the action slot.
- **Moments:** partway through each phase a moment comes ("A candle gutters", "The salt line breaks"…) and stays open for 12 seconds. You answer it on the Circle, or with the button that appears in the top bar.
- **It never fails.** Quality counts steps:
  - each moment answered (5)
  - the Hearth mark discovered (1)
  - Still Night active during the rite (1)

  0–2 = **Sound**, 3–5 = **Fine**, 6–7 = **Resplendent**. If you leave mid-rite, it finishes offline without the remaining moments.
- **Rewards:**
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
- It follows each stage's steps literally, claims rewards (XP where suggested), places parts, spends talent points (Swift first), fills requests for bread, and plays the rite, answering every moment.
- No tending, no omens and no experiments.
- It runs as part of `npm test`. It fails if:
  - the chapter can't be finished, or a note soft-locks
  - **anything needs a level the steps didn't earn** (grinding)
  - **crafted things are left over** at the rite (more than 3 of any)
  - the rite begins outside **20–34 minutes**
  - two skills open **less than 3 minutes apart** (after the tutorial pair)
  - a skill's stage takes **less than 3 or more than 10 minutes**
- `npm run pacing` prints each step's time.
- **XP curve:** XP to the next level = **612 × 1.14^(level − 1)**, eased for the first three levels (×0.35, ×0.55, ×0.8): 214 XP for level 2, 597 for 3, 1,233 for 4.
  - *History:* 25 × 1.18^(L−1), then 165 × 1.14 (first patch), then 245 × 1.14 with the ease (second).
  - The third patch set the chapter's length by the rule "no grinding", and the designer chose about 30–35 minutes.
- **Level speed:** each level makes its own skill 1% faster, compounding.
- **Result** (5 seeds, third patch): the rite begins at **22–23 minutes**, and the ceremony takes 5, so the chapter is about **27 minutes** for an efficient idle player. Players who read, choose and claim will take longer (the target was 30–35). Stage lengths (seed 1): Light 5.3, Ward 3.6, Smoke 4.2, Words 3.7, Offering + Perform 4.5 minutes.

**Things to tune in playtests:**
- **Whether ~30 minutes feels right.** Longer means bigger parts (every item still has a use) and slower levels, together.
- **The Ward is the shortest stage.**
- **Tending, Surges and omens** make everything faster for active players. Watch whether the chapter becomes too quick for them.

---

## 11. What the vertical slice needs from this document

> **Status: complete** (milestones M0–M7). Everything below is built, tested and played through; see the README.
> Open tuning items: §10 (preparation time is at the top of the target) and the playtest list above.

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

## 13. Talents, tending and level speed *(first and second patch)*

- **Tending** *(second patch)*: the hands-on bonus, never required.
  - Clicking **Tend** (or pressing Space) lights a flame meter that drains over **15 seconds**. While it's lit, the running action is **+50% faster**.
  - Each tended repetition in a row adds **2%** to a bonus-find chance (1 extra of the main output), up to **20%**. The streak resets when the meter goes out or you switch actions.
  - The meter lives on the game clock, so it simply runs out while you're away.
  - Numbers: `TEND` in `src/content/talents.ts`.


- **Points:** each skill earns 1 talent point every 3 levels, so 6 by the Chapter 1 cap of 20 (13 at 40). Points come from levels, so only what you spend is saved.
- **Four branches per skill**, 3 ranks each:
  - **Tending** *(second patch)*: +5s on the meter and +1% bonus chance per tended repetition, per rank
  - **Swift:** +5% speed per rank
  - **Plenty:** 5% chance per rank of 1 extra of each sure output
  - **Fortune:** 3% chance per rank of a critical, which doubles output and XP
- **One keystone per skill.** It blooms **for free** once any one branch holds 3 points (third patch: it used to cost a point, which a player with 3 in one branch didn't have). Content in `src/content/talents.ts`:

| Skill | Keystone | Effect |
|---|---|---|
| Scavenging | Keen eye | Chance finds are 50% more likely |
| Chandlery | Long-burning | 10% of what you pour comes in pairs |
| Sigilcraft | Steady hand | 15% of workings use no materials |
| Herbalism | Dew-picked | Every 5th pick gives 1 extra |
| Scholarship | Marginalia | Each page deciphered gives +1 insight toward a hidden recipe |
| Ritualism | Devout | Minor rites give 25% more XP |

- **Reset is free, at any time.**
- **Where:** a folk tree of life under each skill's recipes on the House tab (the skill at the root, four branches of 3 clickable nodes, the keystone flower at the crown). A skill tile shows "+N" when it has points to spend.
- **All rolls use the seeded RNG,** and only for bonuses the player has, so offline progress applies them the same way.
