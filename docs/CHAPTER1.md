# Chapter 1: Hearth. Content Pass (v0.1)

> This is the detail layer beneath [CONCEPT.md](CONCEPT.md). It covers the first session: from arriving at the cold house to the **Kindling of the Hearth-Circle**.
> The numbers are a first pass. They're checked by [tools/ch1_sim.py](../tools/ch1_sim.py) (see §10) and will be tuned in playtests.
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

## 2. Opening and onboarding: Grandmother's notes

Skills unlock through **margin notes** from the half-burnt grimoire. Each note is a small goal with a reward. The sequence takes about 20–30 minutes, and after it everything in Chapter 1 is open.

| # | Note (in her voice) | Goal | Unlocks / reward |
|---|---|---|---|
| 1 | *"The house is cold, child. Start with the hearth."* | Sweep the hearth ×5 | **Scavenging**. The first ash; the sanctum scene shows a dark room |
| 2 | *"Light is the first ward."* | Make 3 Tallow candles | **Chandlery**. The room lights up (first sanctum change) |
| 3 | *"The garden still remembers me."* | Pick 10 Nettles | **Herbalism** |
| 4 | *"My pages burned. Read what's left by candlelight."* | Decipher 1 burnt page | **Scholarship**. The first Grimoire entries and a lore fragment |
| 5 | *"Salt keeps what is inside, inside."* | Lay 3 salt lines | **Sigilcraft** |
| 6 | *"They'll knock. They always knock."* | Fill 1 village request | **Village board** and coin |
| 7 | *"Bless the threshold before you open the circle."* | Perform *Bless the Threshold* | **Ritualism**. The circle in the floor begins to glow |
| 8 | *"The circle is warm. Wake it."* | — | **The Major Rite is revealed**, with its full recipe |

The first **Still Night** omen drop is scripted around note 4, so the player learns to store and release omens early.

**Build status:** all 8 notes are implemented in `src/content/notes.ts`, each with a plain hint line. Note 4 opens the Grimoire, note 6 the Village, and note 7 the Circle. Burnt pages are in `src/content/pages.ts`: pages 1–5 each teach one 📜 recipe, and page 6 is the black-page teaser.

---

## 3. Skills and actions

The columns are: the level required · time per action · XP per action · inputs → outputs. The level cap in Chapter 1 is **20**.
*Italic outputs are chance-based.* Some recipes also need a **deciphered page** before they unlock (marked 📜).

### Herbalism (garden and forest edge)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Pick nettle | 1 | 3s | 5 | Nettle |
| Pick chamomile | 3 | 3s | 7 | Chamomile |
| Pick yarrow | 6 | 4s | 10 | Yarrow |
| Pick mugwort (the dream-herb) | 10 | 4s | 13 | Mugwort |
| Pick St John's wort (the Kupala herb) | 14 | 5s | 17 | St John's wort |
| Cut juniper | 18 | 5s | 21 | Juniper |

### Scavenging (house, attic, beehives, village midden)
| Action | Lvl | Time | XP | Output |
|---|---|---|---|---|
| Sweep the hearth | 1 | 3s | 5 | Ash, *charcoal (10%)* |
| Search the pantry | 2 | 3s | 6 | Tallow, *salt (50%)* |
| Search the attic | 5 | 4s | 9 | *Burnt page (35%)*, *rags (50%)*, *glass (30%)*, *curio (0.5%)* |
| Rob the old hives | 9 | 4s | 12 | Beeswax |
| Sift the village midden | 13 | 5s | 16 | Iron nail, *rags (30%)* |
| Open grandmother's chest | 17 | 5s | 20 | Chalk, *curio (1%)* |

### Chandlery
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Tallow candle | 1 | 3s | 6 | 2 tallow → Tallow candle |
| Smudge bundle 📜 | 4 | 4s | 9 | 2 chamomile + 1 yarrow → Smudge bundle |
| Beeswax candle | 8 | 4s | 12 | 2 beeswax → Beeswax candle |
| Mugwort incense 📜 | 10 | 5s | 15 | 2 mugwort + 1 ash → Mugwort incense |
| **Hearth candle** 📜 | 14 | 5s | 19 | 2 beeswax + 1 St John's wort → Hearth candle |
| Juniper incense | 18 | 6s | 23 | 2 juniper + 1 ash → Juniper incense *(used in Chapter 2; gives Chandlery a reason to go past 14)* |

### Sigilcraft
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Salt line | 1 | 3s | 6 | 1 salt → Salt line |
| Ash sigil | 4 | 4s | 9 | 2 ash + 1 nettle → Ash sigil *(a village request item)* |
| Iron ward 📜 | 8 | 4s | 12 | 2 iron nails + 1 salt → Iron ward |
| Chalk segment | 12 | 5s | 16 | 1 chalk + 1 salt → Chalk segment |
| **Hearth ward** 📜 | 15 | 6s | 22 | 2 chalk segments + 1 iron ward + 1 St John's wort → Hearth ward |

### Scholarship
| Action | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Decipher a burnt page | 1 | 6s | 14 | 1 burnt page + 1 tallow candle → Deciphered page. Each one reveals the next 📜 recipe, lore or hint |
| **Copy the Litany** | 8 | 6s | 20 | 3 deciphered pages + 1 beeswax candle → Grandmother's Litany (the rite's focus) |

The first ~6 deciphered pages follow a set order (the story and recipe unlocks). After that they give hints toward hidden recipes and lore fragments.

### Ritualism (minor rites: repeatable, longer, higher XP)
| Rite | Lvl | Time | XP | Inputs → Output |
|---|---|---|---|---|
| Bless the threshold | 1 | 10s | 25 | 1 salt line + 1 tallow candle → Consecrated salt |
| Smoke the rooms | 4 | 12s | 35 | 1 smudge bundle + 1 tallow candle → *Blessing* (a 15-minute +10% speed buff to all Chapter 1 skills) |

---

## 4. The village: coin and requests *(decided: Village coin)*

- **The request board** shows **3 requests** at a time. Filling one pays **coin** plus **trust**, and a new request appears after a short delay.
- **Trust** unlocks better requests (more coin, rare rewards) and, in later chapters, village-related story.
- **There's no "sell anything" market.** Coin comes only from requests, so the resource chains stay meaningful.
- **Build details** *(M1)*:
  - An emptied slot refills after **30 seconds** of game time, including offline.
  - Any request can be **turned away** at no cost, so a request you can't fill never blocks the board.
  - Trust gates in `src/content/requests.ts`: the stable mark needs 2 trust, smoking out the loft 3, iron by the cradle 5.
- **Example requests in Chapter 1:**

| Request | Needs | Pays |
|---|---|---|
| "Nettle soup for the widow Hana" | 10 nettle | 6 coin |
| "Something for the miller's cough" | 5 chamomile + 2 yarrow | 12 coin |
| "Candles for my father's grave" | 3 tallow candles | 10 coin |
| "A mark over the stable door, the cow won't milk" | 1 ash sigil | 15 coin |
| "Smoke out whatever is in my loft" | 1 smudge bundle | 20 coin |
| "Iron by the cradle" | 1 iron ward | 30 coin *(+ extra trust)* |

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

- **Drop:** about 1 in 400 actions (roughly one every 25 minutes of play), online or offline. The first drop is scripted around note 4.
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

**The recipe is fully listed** once note 8 appears:

| Component | Qty | From |
|---|---|---|
| Hearth candle | 7 | Chandlery 14 |
| Mugwort incense | 3 | Chandlery 10 |
| Hearth ward | 1 | Sigilcraft 15 |
| Grandmother's Litany (focus) | 1 | Scholarship 8 |
| Consecrated salt | 3 | Ritualism (Bless the threshold) |
| Bread and salt (offering) | 1 | Bread from the village + salt |
| **Ritualism level** | 5 | — |

- **Performing it:** 30 minutes, and it keeps going offline. It can be primed.
- A short illustrated log plays while it runs (the candles lit one by one, the circle waking, a voice that isn't grandmother's).
- **It never fails.** Outcome quality is Faltering → Sound → Resplendent:
  - **Sound** is the base outcome.
  - **+1 step** for each of: Still Night released during the Rite, Hearth mark discovered, Ritualism 10+.
  - **−1 step** if any component is only the minimum grade *(consecrated or "fine" grades arrive in Chapter 2)*.
- **Rewards:**
  - All caps rise to **40**, and the Grave tier opens (4 new skills).
  - **Follower 1** arrives. *(draft)* A village orphan who "heard the circle wake", with the trait *Hearth-born: +20% Chandlery*.
  - The **cellar** opens in the sanctum.
  - A lore chapter.
- **Resplendent bonus:** a cosmetic (embroidered circle cloth) and an extra lore fragment.

---

## 9. After the Rite: the bridge to Chapter 2

- The first follower starts in **"assist me"** mode. A brief note explains assigning them to a mastered action.
- The offline cap and the away summary are introduced properly: *"Rest. The house will keep working."*
- **The first Chapter 2 goal** appears (the Grave tier). This is the natural stopping point, so the player leaves on a hook.

---

## 10. Pacing check (simulation)

[tools/ch1_sim.py](../tools/ch1_sim.py) plays Chapter 1 as an efficient player: one action at a time, no offline time, no requests or experiments.

- **XP curve:** XP to the next level = 25 × 1.18^(level − 1). That's 473 XP to reach level 10 and 3,075 XP to reach level 20.
- **Result:** about **60 minutes** of actions to meet the Rite requirements, plus **30 minutes** to perform it.
- **Levels at the Rite:** Chandlery 15, Herbalism 14, Sigilcraft 15, Scholarship 8, Ritualism 5. Scavenging hits the cap of 20 (so there's a visible reason to want the Rite).
- **Real players** read notes, experiment and fill requests, which likely makes them 1.5–2× slower. **Estimate: about 1.5–2 hours to the Rite. That's on target.**

**Things to tune in playtests:**
- Scavenging caps out before the Rite. That's fine as motivation, but check that it doesn't feel like a wall.
- The requirement of 7 hearth candles is the biggest block of time. Lower it if the middle of the session drags.
- Burnt-page drop rate (35%). Scholarship must never stall the notes sequence.
- Coin income vs. sanctum prices. The player should be able to afford 1–2 upgrades before the Rite.

---

## 11. What the vertical slice needs from this document

The first build needs:
- all of §2–§8: 6 skills, 27 actions, the notes sequence, the request board, 1 omen, 3 hidden recipes, the Rite
- offline progress
- save/load
- a placeholder sanctum with visible states (dark → candlelit → warded → circle awake → cellar door)

Everything after the Rite can be a "to be continued" screen.
