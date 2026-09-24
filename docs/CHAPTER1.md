# Chapter 1: Hearth. Content Pass (v0.2, first patch)

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

## 2. The chapter's spine: the Kindling, built in five parts *(decided in the first patch)*

The Kindling is visible from the first minute, on the Circle tab. It has **five parts**, and each part is one stage of the chapter. A stage's note from grandmother brings **one new skill**. You make that part mostly from what the new skill teaches, plus one stretch item, and **place it in the Circle**. The rosette lights one petal per part, in the skill's colour. The last stage is performing the rite.

| Stage | Note (in her voice) | New skill (and place) | Part placed | Stretch item |
|---|---|---|---|---|
| 0 Start | *"The house is cold, child. Under the floor is my circle…"* | **Scavenging** (+ the Circle) | Goal: Search the pantry ×8 | |
| 1 Light | *"Light is the first ward."* | **Chandlery** | 8 tallow candles | + 3 beeswax candles (Chandlery 4, beeswax from Scavenging 5) |
| 2 Ward | *"Salt keeps what is inside, inside."* | **Sigilcraft** | 12 salt lines | + 4 ash sigils (Sigilcraft 5, ash from Scavenging 3) |
| 3 Smoke | *"The garden still remembers me."* | **Herbalism** | 3 smudge bundles | + 1 mugwort incense (Chandlery 7, mugwort from Herbalism 4) |
| 4 Words | *"My pages burned. Read what's left by candlelight."* | **Scholarship** (+ the Grimoire, the first Still Night) | 2 deciphered pages | + the Litany (Scholarship 4; burnt pages from Scavenging 8) |
| 5 Offering | *"They'll knock. They always knock."* | **Ritualism** (+ the Village) | 2 bread, 3 salt, 6 consecrated salt | |
| 6 Perform | *"The circle is warm. Wake it."* | | Reach Ritualism 5, then begin the rite (30 min) | |

- **Parts that aren't reached yet** show only their name and the skill they bring. No part asks for anything from a skill that isn't open (a test checks this).
- **Recipes show only when they matter:** each skill lists what you've reached plus the single next recipe. A recipe also stays hidden while one of its ingredients comes from a skill that hasn't opened yet.
- **Placing:** from the Circle, or straight from the chapter tracker once a part is ready. The tracker's Go button opens the stage's new skill.
- **Experiments** open with their own side note, when the first hint toward a hidden recipe arrives (once the Grimoire is open). They're optional, and the note names the Dream pillow as a good first goal.
- **Build status:** the notes are in `src/content/notes.ts` (with `EXPERIMENTS_NOTE`), and the parts are `KINDLING_PARTS` in `src/content/rite.ts`.
- **Burnt pages** (`src/content/pages.ts`) now teach only recipes off the main path: iron ward, chalk segment, hearth candle, hearth ward and juniper incense. The sixth page is the black-page teaser. Nothing a stage needs is locked behind a page.

---

## 3. Skills and actions

The columns are: the level required · time per action · XP per action · inputs → outputs. The level cap in Chapter 1 is **20**.
*Italic outputs are chance-based.* Some recipes also need a **deciphered page** before they unlock (marked 📜).

### Scavenging (house, attic, beehives, village midden)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Search the pantry | 1 | 3s | 6 | Tallow, *salt (50%)* |
| Sweep the hearth | 3 | 3s | 5 | Ash, *charcoal (10%)* |
| Rob the old hives | 5 | 4s | 12 | Beeswax |
| Search the attic | 8 | 4s | 9 | *Burnt page (30%)*, *rags (50%)*, *glass (30%)*, *curio (0.5%)* |
| Sift the village midden | 12 | 5s | 16 | Iron nail, *rags (30%)* |
| Open grandmother's chest | 16 | 5s | 20 | Chalk, *curio (1%)* |

### Chandlery
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Tallow candle | 1 | 3s | 6 | 2 tallow → Tallow candle |
| Beeswax candle | 4 | 4s | 12 | 2 beeswax → Beeswax candle |
| Smudge bundle | 5 | 4s | 9 | 2 nettle + 1 chamomile → Smudge bundle |
| Mugwort incense | 7 | 5s | 15 | 2 mugwort + 1 ash → Mugwort incense |
| Hearth candle 📜 | 12 | 5s | 19 | 2 beeswax + 1 St John's wort → Hearth candle *(village requests)* |
| Juniper incense 📜 | 16 | 6s | 23 | 2 juniper + 1 ash → Juniper incense *(village requests; Chapter 2)* |

### Sigilcraft
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Salt line | 1 | 3s | 6 | 1 salt → Salt line |
| Ash sigil | 5 | 4s | 9 | 2 ash + 1 salt → Ash sigil |
| Iron ward 📜 | 8 | 4s | 12 | 2 iron nails + 1 salt → Iron ward |
| Chalk segment 📜 | 12 | 5s | 16 | 1 chalk + 1 salt → Chalk segment |
| Hearth ward 📜 | 15 | 6s | 22 | 2 chalk segments + 1 iron ward + 1 St John's wort → Hearth ward *(a village request)* |

### Herbalism (garden and forest edge)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Pick nettle | 1 | 3s | 5 | Nettle |
| Pick chamomile | 2 | 3s | 7 | Chamomile |
| Pick mugwort (the dream-herb) | 4 | 4s | 13 | Mugwort |
| Pick yarrow | 7 | 4s | 10 | Yarrow |
| Pick St John's wort (the Kupala herb) | 12 | 5s | 17 | St John's wort |
| Cut juniper | 16 | 5s | 21 | Juniper |

### Scholarship
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Decipher a burnt page | 1 | 6s | 14 | 1 burnt page + 1 tallow candle → Deciphered page. The first six each teach a 📜 recipe or lore |
| **Copy the Litany** | 4 | 6s | 20 | 3 deciphered pages + 1 beeswax candle → Grandmother's Litany (part of the Words) |

After the six story pages, each deciphered page adds 3 insight to a hidden recipe.

### Ritualism (minor rites: repeatable, longer, higher XP)
| Rite | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Bless the threshold | 1 | 10s | 22 | 1 salt line + 1 tallow candle → Consecrated salt |
| Smoke the rooms | 3 | 12s | 30 | 1 smudge bundle + 1 tallow candle → *Blessing* (a 15-minute +10% speed buff to all Chapter 1 skills) |

---

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

## 5. Omen: Still Night *(the only omen in Chapter 1)*

- **Drop:** about 1 in 400 actions (roughly one every 25 minutes of play), online or offline. The first one is a gift with the Words note.
- **Storage:** an omen shelf in the sanctum. It holds 1 at the start and 3 after the upgrade.
- **Release effect (15 minutes):**
  - +50% Scholarship and Ritualism speed.
  - Burnt pages drop twice as often.
- **During the Rite:** releasing Still Night while the Rite runs raises its outcome quality by one step (see §8).
- **Its lesson:** whether to spend it now for speed or save it for the Rite is the first real decision about omens.
- **Build details** *(M2)*:
  - Releasing a second Still Night while one is running *adds* 15 minutes.
  - An omen that drops when the shelf is full passes unseen, and the player is told why.
  - *Smoke the rooms* now applies the Blessing as a buff. It refreshes rather than stacks, so repeating the rite can't pile up bonus time.

---

## 6. Hidden recipes (Grimoire discovery tutorial)

There are three hidden recipes in Chapter 1. None unlock by level. You find them from **hint fragments** (from deciphered pages and attic curios) and by **experimenting at the circle**.

- **How experimenting works:** see [GRIMOIRE.md](GRIMOIRE.md). You attune the circle to a silhouette, the glow count shows how many items are right, wrong items are auto-crossed, and hints escalate from riddle to category to plain names.
- **There are also 2 hint-less secrets:** Honey-light and Hana's soup (see GRIMOIRE.md §8).

| Hidden recipe | Hint fragment | Recipe | Effect |
|---|---|---|---|
| **Dream pillow** | *"…for sleep that listens: the bitter dream-herb, the gentle flower, a scrap of cloth."* | Mugwort + chamomile + rags | +10% to all offline progress (a permanent sanctum item) |
| **Hearth mark** | *"…where the fire lived, draw its name in what it left behind, and salt to keep it."* | Ash + charcoal + salt | A permanent +1 outcome-quality step for Chapter 1–2 rites |
| **Threshold nail** | *"…cold iron under the door, and the Kupala herb to make it sing."* | Iron nail + St John's wort + salt | Village trust ×1.5, and grandmother's hidden note opens (the first thread toward the hidden 5th follower) |

---

## 7. Taint teaser

- One Grimoire page is **black**: *"Ink of the Unwritten."* Its recipe shows but can't be read: *"The ink is too dark to read. Not yet."*
- Deciphering the 6th page adds grandmother's note: *"Leave that page be. I didn't."*
- **Pays off in Chapter 3,** when Taint and Purification arrive.

---

## 8. The Major Rite: Kindling the Hearth-Circle

**The rite needs its five parts placed in the Circle** (§2) and **Ritualism 5**. The parts stay in the Circle once placed, so nothing in the pantry can be used up by mistake.

- **Performing it:** 30 minutes, and it keeps going offline. It can be primed.
- A short illustrated log plays while it runs (the candles lit one by one, the circle waking, a voice that isn't grandmother's).
- **It never fails.** Outcome quality counts three factors: Still Night active during the Rite, the Hearth mark discovered, Ritualism 10+.
  - 0 factors → **Sound**, 1–2 → **Fine**, all 3 → **Resplendent**.
  - Component grades are left for Chapter 2.
- **Rewards:**
  - All caps rise to **40** (the content for it comes with Chapter II).
  - **Follower 1** arrives. *(draft)* A village orphan who "heard the circle wake", with the trait *Hearth-born: +20% Chandlery*.
  - The **cellar** opens in the sanctum.
  - A lore chapter.
- **Resplendent bonus:** a cosmetic (embroidered circle cloth) and an extra lore line.
- **Afterwards** the house goes back to work (through the fallback rule), and a bridge note closes the chapter.
- **Build details** *(M4)*:
  - The Still Night bonus counts if the buff is active at any moment while the rite runs (released before or during it).
  - Priming begins the rite the moment everything is ready (the last part placed, or Ritualism reaching 5), even offline.
  - Janko ("assist me") gives +30% speed to whatever you do, and +20% more on Chandlery.
  - A 9th note bridges to Chapter 2.
  - Hana's double pay ends when the rite completes.

---

## 9. After the Rite: the bridge to Chapter 2

- The first follower starts in **"assist me"** mode. A brief note explains assigning them to a mastered action.
- The offline cap and the away summary are introduced properly: *"Rest. The house will keep working."*
- **The first Chapter 2 goal** appears (the Grave tier). This is the natural stopping point, so the player leaves on a hook.

---

## 10. Pacing check (headless playthrough)

[src/engine/playthrough.test.ts](../src/engine/playthrough.test.ts) plays Chapter 1 as an efficient player, on the real game engine and content.
- It follows grandmother's notes, makes each part and places it, spends talent points (Swift first), fills village requests for coin, buys bread and the omen shelf, then trains Ritualism and performs the rite.
- Active play only: no offline time and no experiments.
- It runs as part of `npm test`. It fails if:
  - the chapter can't be finished, or a note soft-locks
  - a part needs an item from a skill that isn't open yet
  - the rite begins outside **55–110 minutes**
  - two skills open **less than 8 minutes apart** (after the Scavenging → Chandlery tutorial pair)
  - a skill's stage takes **less than 8 or more than 20 minutes**. Ritualism's stage runs from the Offering note to the rite.
- `npm run pacing` prints the time each stage begins.

- **XP curve:** XP to the next level = **165 × 1.14^(level − 1)**. That's 165 XP for level 2, 2,650 XP to reach level 10, and 13,020 XP to reach level 20. It was 25 × 1.18^(level − 1): the early levels came five times faster, which is why several skills were at their third or fourth recipe within five minutes.
- **Level speed:** each level makes its own skill 1% faster, compounding (level 20 ≈ 21% faster).
- **Result** (5 seeds, first patch): the rite begins at **59–61 minutes**, and with the 30-minute rite the chapter takes about **90 minutes**, the same as before. Stage lengths for seed 1:

| Stage | Begins | Length |
|---|---|---|
| Start (Scavenging) | 0.0 | 0.4 |
| Light (Chandlery) | 0.4 | 13.7 |
| Ward (Sigilcraft) | 14.1 | 11.0 |
| Smoke (Herbalism) | 25.1 | 15.8 |
| Words (Scholarship) | 40.9 | 9.9 |
| Offering + Perform (Ritualism) | 50.8 | 9.5 |
| Rite begins | 60.3 | 30 |

- **Real players** read notes, experiment and fill requests at their own pace, which likely makes the preparation 1.5–2× slower: about 1.5–2 hours to begin the rite.

**Things to tune in playtests:**
- **The first stage is a 25-second tutorial beat.** Scavenging and Chandlery arrive close together on purpose; every later skill is spaced.
- **Smoke is the longest stage** (Chandlery 7 for mugwort incense). Lower the level if the middle drags.
- **Burnt-page drop rate** (30%): the Words stage leans on it.
- **Coin income vs. sanctum prices:** the village now opens late, so upgrades mostly land around the rite.

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

## 13. Talents and level speed *(first patch)*

- **Points:** each skill earns 1 talent point every 3 levels, so 6 by the Chapter 1 cap of 20 (13 at 40). Points come from levels, so only what you spend is saved.
- **Three branches per skill**, 3 ranks each:
  - **Swift:** +5% speed per rank
  - **Plenty:** 5% chance per rank of 1 extra of each sure output
  - **Fortune:** 3% chance per rank of a critical, which doubles output and XP
- **One keystone per skill**, opened by 3 points in any one branch (content in `src/content/talents.ts`):

| Skill | Keystone | Effect |
|---|---|---|
| Scavenging | Keen eye | Chance finds are 50% more likely |
| Chandlery | Long-burning | 10% of what you pour comes in pairs |
| Sigilcraft | Steady hand | 15% of workings use no materials |
| Herbalism | Dew-picked | Every 5th pick gives 1 extra |
| Scholarship | Marginalia | Each page deciphered gives +1 insight toward a hidden recipe |
| Ritualism | Devout | Minor rites give 25% more XP |

- **Reset is free, at any time.**
- **Where:** the talents panel sits under each skill's recipes on the House tab. A skill tile shows "+N" when it has points to spend.
- **All rolls use the seeded RNG,** and only for bonuses the player has, so offline progress applies them the same way.
