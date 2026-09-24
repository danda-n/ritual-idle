# Ritual Idle — Core Concept (v0.2)

> Working title. This document fixes the **core idea**: fantasy, pillars, loops, skill shape and constraints.
> v0.2: all 10 open questions from v0.1 are decided. See the decision log at the end.
> Anything marked *(draft)* is a starting point for the next brainstorm, not a decision.
> Evidence behind the choices lives in [RESEARCH.md](RESEARCH.md).

---

## 1. Elevator pitch

You inherit your grandmother's house, the village witch's, at the edge of a Carpathian-style forest. Over many moons you gather, craft and **discover** the rites needed to perform the **Great Rite**.
Every skill feeds the ritual circle. Followers take over the work you have mastered. Omens and moons are power you capture, store, and later learn to call down yourself.

*Melvor-style skilling depth, a real occult identity, discovery that remembers what you found, and a sanctum you can watch come alive.*

**Locked decisions**

| Area | Decision |
|---|---|
| Theme | Ritual / occult (witchcraft, alchemy, summoning, a hidden order) |
| Platform | PC: Steam + browser, single-player, fully offline-capable |
| Setting | Invented Slavic/Carpathian folk-horror region, 1800s. You inherit your grandmother's witch-house; the Great Rite is an apotheosis |
| Parallel work | You do one action at a time, plus 4 (up to ~6) low-management followers |
| Structure | A finite main story with a real ending, then Patron Cycles as the prestige endgame |
| Discovery | Forgiving and permanent: the Grimoire fills itself and hints are generous. Major Rite recipes are listed; discovery lives in side rites, hidden recipes, forbidden variants and lore |
| Challenge | Major Rites and summonings take the place of bosses. No auto-combat, and rites never fail; preparation sets the outcome quality |
| Visuals | A readable UI plus one illustrated "living sanctum" scene |
| Business | Premium one-time purchase, with paid expansions later |
| Core systems | Omens and invoked moons (never a time-lock), Taint |
| Time scale | 3–6s actions; rites 30 min–8h; offline cap 24h, raised to 72h and then 7 days by upgrades |
| Pacing | About 4 weeks of real time to the Great Rite; the first session reaches the Chapter 1 Rite |
| Endgame | New Game+ Patron cycles; the Moon and the Hunger at launch |
| Art | Folk-art / woodcut style; placeholders until the loop is proven |
| Tech | TypeScript web + Electron; local saves + Steam Cloud + export |
| Currency | Village coin, earned only from villagers' requests. Buys basics (bread, tallow) and sanctum upgrades. No free-sell market |
| Skill unlocks | Ch1: 6 skills · Ch2: +4 · Ch3: +3 (Taint arrives) · Ch4–5: depth only |

---

## 2. Why this game: the market gap

- **Deep skilling idles are all generic RuneScape fantasy with spreadsheet-style UIs.**
  - Melvor Idle is at 92% on Steam.
  - The multiplayer clones score lower: Idle Clans 74%, Milky Way Idle 71%.
  - "Melvor is just a spreadsheet" is a common complaint.
- **Occult idles on Steam are shallow "sacrifice followers, number goes up" games** at 68–79%.
- **The best occult games aren't idle.** Cultist Simulator is at 79% and Book of Hours at 89%. Both are loved for their mystery and criticised for being opaque and punishing.
- **Discovery-driven alchemy sells.** Potion Craft is at 93%, and Cult of the Lamb proves the cult theme has mass appeal (96%, over 119k reviews).
- **Visual incrementals are undersupplied** (Gnorp's developer; the Rusty's Retirement and Cast n Chill breakouts).

**The gap:** Melvor-scale interlocking skills, a serious occult identity, forgiving discovery, something to look at, and premium pricing with offline play. Nobody combines these today.

---

## 3. Design pillars

1. **Everything feeds the Rite.** Skills depend on each other. Major rites draw from *every* tier of material, so no skill or early resource ever becomes obsolete.
2. **Knowledge you keep.** The Grimoire of discovered recipes, rites and lore is permanent. It survives every reset. Discovery is the game's second progression track, next to XP.
3. **Time is a reagent.** You have one personal action and a few scarce followers. Stored omens and invoked moons are boosts you choose when to spend. **Nothing is ever time-locked.**
4. **Power has a price.** Forbidden work builds Taint. Taint raises yields but brings afflictions. They are always reversible and never end the game.
5. **Respect the player.**
   - Full offline simulation, and no pay-to-win.
   - Quality-of-life is built in: ETAs, a fallback when work stops, presets.
   - A readable UI that doesn't require a wiki.
   - A real ending.

---

## 4. Setting, fantasy and tone *(decided in Q7; details are draft)*

**Setting:** an invented mountain region inspired by Carpathian and Slavic folklore, in the 1800s.
- Herb-witches, grave customs, Forefathers' Eve (*Dziady*), Kupala night and the fern flower, strigoi, drowned churches, Morana and the winter's end.
- It's an *invented* land that draws on real folklore respectfully, not a real place or religion.
- Almost no games use it, and it fits Herbalism and Gravetending naturally.

**Opening:**
- Your grandmother was the village's *bosorka*, its witch. She has died and left you her house at the edge of the forest, a half-burnt grimoire, and a chalk circle in the floor that is **still warm**.
- The tutorial is her notes in the margins.
- The village is wary of you and needs you anyway.

**What the Great Rite is for: becoming something more.** It is an apotheosis.
- Grandmother was preparing it and never finished.
- Chapter by Chapter you find out what she was trying to become, and what you might become instead.
- Each Patron's ending answers "become *what*?" differently: the Moon's is serene and cold; the Hunger's is vast and terrible.

**Arc of the fantasy:** a hedge-witch in one candle-lit room → keeper of a small coven in the village → something the villagers only whisper about.

**Tone:** eerie-cozy. Candlelight, dried herbs, snow on the roof, whispers in the cellar. Folk horror, not gore. Unsettling lore delivered calmly.

**Lore is a reward.** Grandmother's notes, translated fragments, the voices of the dead on Forefathers' Eve, and the Patrons' bargains are things you *earn*, the same way you earn XP.

**Draft renames to fit the setting**

| Ch | Tier | Major Rite |
|---|---|---|
| 1 | Hearth | Kindling the Hearth-Circle |
| 2 | Grave | Forefathers' Eve: calling the dead to supper |
| 3 | Fern | The Fern Flower: the bloom that opens only on Kupala night *(as an invoked moon, never a real-time wait)* |
| 4 | Drowned | The Drowned Bell: the church beneath the lake |
| 5 | Starlit | The Great Rite |

---

## 5. The loops

```
┌──────────────────────────────────────────────────────────────────────┐
│ CYCLE LOOP (endgame)   Rite of Ascension → pledge to a Patron →      │
│                        new rules for the next cycle; keep Grimoire   │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ ARC LOOP (weeks)     Chapters of the story → the Great Rite      │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ RITE LOOP (days)   prepare a Major Rite: components from     │ │ │
│ │ │                    3–4 skills + wards (+ omen) →             │ │ │
│ │ │                    perform → unlock tier/place/follower      │ │ │
│ │ │ ┌──────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ CHECK-IN LOOP (session)  collect offline results,        │ │ │ │
│ │ │ │   reassign followers, experiment at the circle,          │ │ │ │
│ │ │ │   decide which stored omens to spend                     │ │ │ │
│ │ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ │
│ │ │ │ │ ACTION LOOP (sec–min)  pick action → timer →         │ │ │ │ │
│ │ │ │ │  XP + materials + chance of hints and omens          │ │ │ │ │
│ │ │ │ └──────────────────────────────────────────────────────┘ │ │ │ │
│ │ │ └──────────────────────────────────────────────────────────┘ │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.1 Action loop (seconds to minutes)
- **What happens:** pick one action ("Gather nightshade", "Pour tallow candles", "Translate folio III"). It runs on a timer and repeats.
- **Output:** skill XP and materials.
- **Occasional drops:**
  - *Grimoire hints*: fragments pointing at an undiscovered recipe.
  - *Omen tokens*.
  - Very rarely, a *curio*: a unique item that starts a story thread.
- **Mastery:** each action levels on its own, like Melvor's mastery. A mastered action can be handed to a follower.

### 5.2 Check-in loop (a session, 2–20 minutes)
- **Collect:** read the "while you were away" summary: materials, omens seen, rites completed.
- **Delegate:** reassign followers and load presets.
- **Experiment:** put combinations into the circle to test hints (cheap, safe, and every attempt is recorded).
- **Plan:** queue or *prime* the next rite, and decide whether to spend a stored omen or invoke a moon now.

### 5.3 Rite loop (days): the boss equivalent *(decided in Q5)*
- **Major Rites** are the milestones of the game, one per Chapter.
- **The recipe is fully listed upfront.** You always know what a Rite needs; the challenge is producing it. Components come from 3–4 different skills, for example:
  - candles
  - a warded circle
  - a focus
  - an offering
  - a follower to assist
- **Rites never fail.** Once the requirements are met, a Rite succeeds. **Preparation sets the outcome quality** (Chapter 1: *Sound → Fine → Resplendent*):
  - Higher quality comes from better component grades (consecrated materials), followers assisting, a matching omen or invoked moon, low Taint, and a high Ritualism level.
  - A better outcome brings bonus rewards, extra lore and sanctum cosmetics.
  - A weaker outcome still advances the story.
- **Rites can be performed at any time.** **Priming** queues a prepared rite so it runs automatically, even offline.
- **Rites are presented as events:** a short illustrated log plays while it runs ("the third candle gutters… the ward holds").
- **Rewards of a Major Rite:**
  - all skill caps raised
  - the next material tier
  - a follower
  - a sanctum expansion
  - a lore chapter
  - Patron favour (from Chapter 3)
- **Side rites** (optional, some hidden in the Grimoire) give sanctum upgrades, the extra follower, cosmetics and lore. This is where most of the **discovery** lives.

### 5.4 Arc loop (weeks): the main story
- **Five Chapters**, each built around one tier and one Major Rite. *(names and rewards are draft)*

| Ch | Tier | Major Rite (draft) | Cap after | Unlocks |
|---|---|---|---|---|
| 1 | Hearth | Kindling the Hearth-Circle | 40 | Follower 1, Grave tier, the cellar |
| 2 | Grave | Forefathers' Eve: calling the dead to supper | 60 | Follower 2, full Summoning |
| 3 | Fern | The Fern Flower | 80 | Follower 3, Patrons start speaking |
| 4 | Drowned | The Drowned Bell: the church beneath the lake | 99 | Follower 4, forbidden depths |
| 5 | Starlit | **The Great Rite** | — | The ending, then Patron cycles |

- Chapter 1 starts with caps at 20.
- **Pacing target** *(decided in Q8; to be tuned after playtests)*: about **4 weeks of real time** to the Great Rite, front-loaded, for a player checking in about 3 times a day.

| Chapter | Real time | Offline cap by then |
|---|---|---|
| 1 Hearth | **First session, 1–2h active.** The first Rite lands before the player leaves | 24h |
| 2 Grave | Days 2–5 | 24h → 72h upgrade |
| 3 Fern | About week 2 | 72h |
| 4 Drowned | Weeks 2–3.5 | 72h |
| 5 Starlit | About week 4, the ending | 7 days |
| Cycle 2 (NG+) | About 1 week | 7 days |

- **Unlock cadence:** something new every few minutes in Chapter 1, something every session in the mid game, a Major Rite every 1–2 weeks late.
- **Active vs idle:** active play wins **only through decisions** (switching actions, experimenting, spending omens), roughly 1.3–1.5× over pure idle. **No click or "stay on screen" bonuses.**
- **The Great Rite is a real ending with credits.** Afterwards the house, the Grimoire and your skills stay, and the endgame opens.

### 5.5 Cycle loop (endgame / prestige) *(decided in Q6)*
- **The Rite of Ascension is a New Game+ reset.** Pledge the order to a **Patron** and replay Chapters 1–5 under that Patron's rules.
  - It's much faster: cycle 2 takes about 1 week of real time and later cycles get shorter.
  - It ends in that **Patron's own final rite and ending**, so each cycle has a story reward.
- **What resets:** skill levels, mastery and materials.
- **What carries over:**
  - **the Grimoire and lore.** Nothing needs re-discovering.
  - **Follower roster.** Followers stay with you, back at Initiate rank. You can still *sacrifice* one at Ascension for extra Offerings; that slot is refilled by a new recruit at the next Chapter Rite.
  - **Offerings → Boons.** Offerings are the prestige currency, earned from rite outcome quality and sacrifices. They're spent on permanent Boons: XP and speed, a starting kit, faster early chapters.
  - follower presets and sanctum cosmetics.
- **Two Patrons at launch.** They're clear opposites, and each changes the rules rather than adding a multiplier. *(draft twists)*
  - **The Moon (the Pale Mother):**
    - Omens drop about 3× as often, and invoked moons are cheap and strong.
    - Forbidden recipes are *sealed*.
    - It's a pure, omen-driven cycle where Herbalism and Astrology lead.
  - **The Hunger (the Maw):**
    - Taint is fuel: the cap rises to 200 and afflictions are stronger in both directions.
    - Purification is disabled, so Taint only falls by *feeding* the Maw offerings.
    - It's the forbidden, high-yield cycle.
- **More Patrons in expansions:** the Serpent (transmutation within a tier) and the Veil (Patron-only hidden recipes, driven by Divination and Scholarship).
- Patrons are jealous of each other. Favour with one closes off another within a cycle, which encourages a different pledge next time.

---

## 6. Skill map *(13 skills decided in Q2; contents are draft)*

Every skill trains the same way: **timed actions that consume inputs and produce outputs.** Knowledge skills included.

| Category | Skill | Main inputs | Main outputs | Mainly feeds |
|---|---|---|---|---|
| **Gathering** | Herbalism | — | Herbs, fungi, roots, resins | Alchemy, Chandlery, Purification |
| | Gravetending | — | Bone, grave-earth, coffin nails, burial curios | Sigilcraft, Binding-craft, Alchemy, offerings |
| | Scavenging | — | Salt, iron, glass, wax and tallow, feathers, old texts, curios | Chandlery, Binding-craft, Sigilcraft, Scholarship |
| **Crafting** | Alchemy | Herbs, salts, bone ash | Tinctures, anointing oils, inks, ritual salts | Sigilcraft, Scholarship, Ritualism, Summoning |
| | Chandlery | Wax or tallow, resins, herbs | Candles, incense | Divination, Ritualism, Summoning, Purification |
| | Sigilcraft | Salt, chalk, bone, inks | Circle chalk, wards, talismans | Ritualism (safety), Summoning (containment) |
| | Binding-craft | Glass, iron, bone, inks | Vessels, fetters, fetishes | Summoning (holding entities), Astrology (omen jars) |
| **Knowledge** | Scholarship | Old texts, ink, candles | Translations → Grimoire hints, recipes, lore, *treatises* (rite foci) | Grimoire, Ritualism |
| | Divination | Candles, incense, mirror glass | *Visions*: reveal hidden Grimoire entries, preview rite outcome quality | Grimoire, Ritualism |
| | Astrology | Omen fragments, vessels | Captured omens; later, **invoked moons** | Every skill (temporary boosts) |
| **Ritual** | Ritualism | Everything | Minor rites (repeatable; *consecrate* materials to a higher grade), Major Rites (milestones) | Progress, Patron favour |
| | Summoning | Wards, vessels, offerings | Bound entities (timed buffs, special workers) | Everything |
| **Support** | Purification | *Low-tier* herbs, salt, incense | Taint removal, holy water | Taint control; keeps early materials useful |

**Folded into systems:**
- **Recruitment:** Major Rites earn follower slots, not grinding actions.
- **Trapping:** feathers and similar go to Scavenging, and "small living offerings" is dropped for tone.

**Resource chains**

```
GATHERING              CRAFTING                         RITUAL
Herbalism ──┬──────► Alchemy ──(inks, oils)──┐
            ├──────► Chandlery ─(candles)────┤
            └──────► Purification ◄── Taint ─┼──────────────┐
Gravetending┬──────► Sigilcraft ─(wards)─────┼─► RITUALISM ─┤
            └──────► Binding-craft ─(vessels)┼─► SUMMONING ─┤
Scavenging ─┬──────► Chandlery / Binding     │              │
            └─(old texts)─► Scholarship ─────┤              ├─► Major Rite → caps ↑,
KNOWLEDGE    candles ────► Divination ───────┤              │   follower slots, tiers,
             vessels ────► Astrology ─(omens)┘              │   Patron favour, lore
                                                            └─► Minor rites → consecrated
                                                                materials (higher grade)
```

**Levels and tiers** *(structure decided in Q2; numbers are draft)*
- **Chapter caps raised by Rites.** Every skill is capped per Chapter (e.g. 20 / 40 / 60 / 80 / 99). Completing the Chapter's Major Rite raises **all** caps and unlocks the next material tier. Skilling and story move together, and over-grinding can't skip the story.
- **One material tier per Chapter** *(draft names)*: Hearth → Grave → Fern → Drowned → Starlit.
- **Per-action mastery.** Actions have their own mastery. Reaching a set mastery lets a follower run that action.
- **Consecration.** Minor rites upgrade lower-tier materials into ritual-grade versions, which is another sink for early resources.

---

## 7. Core constraints: what makes choices matter

| Constraint | Effect | What we avoid |
|---|---|---|
| **One personal action** | Your time is the main currency | — |
| **4 (up to ~6) followers** | Extra parallel work on mastered actions, or "assist me" by default. A soft tithe from one shared pantry | IdleOn's "eleven inventories to empty" chores |
| **Omen stock** | Stored omens and invoked moons are limited boosts; *when* to spend them is the choice | Any real-time lockout; content is never gated behind waiting |
| **Taint thresholds** | Power now vs. affliction later | Game-over and run loss |
| **Circle slots per rite** | Choosing which components to bring is a build choice | — |

We deliberately **do not** use:
- bank-space taxes
- pay-to-skip timers
- stamina or energy walls
- mandatory active clicking

---

## 8. Core systems in brief

- **Grimoire and discovery** *(full model in [GRIMOIRE.md](GRIMOIRE.md))*
  - **Attune the circle** to a hidden recipe's silhouette and experiment instantly. The glow count shows how many items are right. Items proven wrong are crossed out automatically.
  - **Hints escalate** from riddle to category to plain names. Failed attempts, pages, curios and requests all add Insight, so nobody gets stuck.
  - **Each attempt costs 1 of each item** and always gives a little consolation XP.
  - **Hint-less secrets** turn up by free experimenting (1–2 per chapter).
  - **Divination** (Chapter 3) gives per-item feedback.
- **Omens and moons** *(decided in Q1)*
  - There is **no lunar calendar and no time-locks.** Everything is always available.
  - **Omens** (Blood Moon, Eclipse, Still Night…) drop like rare loot from actions, online or offline. A *captured* omen is stored (a jar of moonlight, a black candle) and **released when the player chooses**, giving a temporary boost to certain skills or rites and occasionally a rare material.
  - **Invoked moons:** later, Astrology lets you *draw down* a moon state on demand for reagents. The moon becomes a tool, not a clock.
  - Omens that drop offline are collected automatically, so nothing is ever missed.
- **Taint and afflictions** *(decided in Q4; numbers are draft)*
  - **Sources:** forbidden recipe variants, some bound entities, and rites performed with forbidden components.
  - **Scale:** 0–100, with thresholds at 25 *Touched*, 50 *Marked* and 75 *Hollowed*.
  - **It's a dial:** rising Taint boosts *forbidden* yields, and a small set of forbidden recipes need a minimum Taint. It's mostly avoidable, but avoiding it costs you something.
  - **Afflictions are mixed.** Each threshold grants one with an upside and a downside, e.g. *Whispers*: +15% Scholarship, −10% follower speed. Some are worth building around.
  - **Taint ward:** you set a Taint ceiling. When it's reached, your action switches to Purification automatically. This keeps long offline stretches safe.
  - **Rapture at 100:** a vision event gives lore and a rare material, drops Taint to 50, and leaves one lasting affliction until you purify it. Dramatic, never game-over.
  - **Purification** lowers Taint and uses up low-tier goods.
- **Followers** *(decided in Q3)*: helpers, not a management game
  - **How you get them:**
    - 4 core followers, one from each Chapter's Major Rite.
    - +1 from a hidden rite found in the Grimoire.
    - +1 from Patron cycles.
    - About 6 at most, always earned through play and never bought.
  - **Strength:** each has a name, one trait (e.g. *Gravedigger's Child: +20% Gravetending*) and a rank: Initiate (~60% of your speed) → Adept → Hierophant (~100%+). Ranks rise through rites.
  - **Default job is "assist me":** an unassigned follower boosts whatever *you* are doing. Assigning a follower to a mastered action of their own is an optional optimisation.
  - **Rite assist slot:** place followers in a rite to raise its outcome quality; they come back afterwards.
  - **Upkeep is a soft tithe:** a small draw of common goods (bread, candles, herbs) from **one shared pantry**. If it runs dry they slow to 50% instead of stopping, and the away summary warns you.
  - **No per-follower inventories, gear or micromanagement.** Presets save a full setup in one click and survive Ascension.
  - **Never lost, except by choice:** no death and no desertion. At Ascension you may *sacrifice* a follower for Offerings.
- **Summoning contracts**
  - Binding an entity means choosing its terms: a longer duration or stronger effects cost more (or add Taint). Binding never fails.
  - Bound entities act as powerful timed buffs or special workers.
- **Patrons**
  - Patrons are the endgame axis: Moon and Hunger at launch. From Chapter 3 they show up in the story as voices and bargains, which tees up the first pledge.

---

## 9. Presentation

- **A readable UI comes first.** Clear panels, ETAs, and totals per hour.
  - Target: no wiki needed for the base game.
- **The living sanctum** is one illustrated scene showing the room and circle.
  - What's in it: candles burning down, followers at work, the current invoked moon or omen glowing in the window.
  - It visibly changes as you progress: one room → a house → a hidden chapel.
  - Prestige cosmetics show up here.
- **Art direction** *(decided in Q9)*: **folk-art / woodcut.**
  - Inspired by woodcut prints, papercuts (*wycinanki*), embroidery motifs and painted folk icons.
  - Limited palette: bone, ink black, ember red, candle gold.
  - The same motifs decorate the UI (borders, sigils, item frames), so the whole game reads as one crafted object.
  - Flat, layered art is cheaper to produce and animate than painting. Candle flicker, drifting smoke and swaying herbs come from simple layer motion.
  - **Production:** build with **placeholders** until the core loop is proven fun, then commission an artist and lock the style. Keep placeholders flat and layered so they match the final pipeline.
- **Stretch goal:** a compact desktop-corner mode (the Rusty's Retirement and Cast n Chill trend).

---

## 10. Business model

- **Premium one-time purchase** on Steam, with the same save playable in the browser.
- A **free browser demo** covering Chapter 1 could double as marketing.
- **Paid expansions** later: new Patrons, skills and chapters (Melvor's proven model).
- Optional cosmetics or a supporter pack at most. **Never pay-to-win.**

---

## 11. Anti-goals (from research)

| Don't | Seen in | Our answer |
|---|---|---|
| One system makes others obsolete | Melvor's Township | Rites consume all tiers; Purification eats low-tier goods |
| Nerfing earned progress | Melvor's Astrology change, Idle Champions | Balance through new content, not retroactive cuts |
| Buffs with mandatory penalties | Melvor Agility | Afflictions are opt-in consequences of Taint and are reversible |
| Upkeep chores that scale with workers | IdleOn | Few followers, reagent upkeep, presets |
| Opaque and punishing mystery | Cultist Sim, Book of Hours | Hints, cheap experiments, auto-Grimoire, skills that reveal |
| Reassign tedium after prestige | Magic Research 2 | Presets persist across Cycles |
| Always-online / server dependency | Idle Clans, Milky Way Idle | Single-player, local and cloud save, save export |
| Needing a wiki | Melvor, Book of Hours | In-game ETAs, tooltips, Grimoire as the manual |
| Endless slowdown with no end | NGU late game | A finite arc with an ending; the endgame is optional |

---

## 12. How we compare

| | Melvor | IdleOn | Increlution | Cultist Sim | **Ritual Idle** |
|---|---|---|---|---|---|
| Parallel work | 1 action | ~10 characters | Queue in one life | Card slots | 1 action + 4–6 followers |
| Scarce resource | Time | Attention | Lifespan | Time and sanity | Time and **stored omens** |
| Direction | Self-set goals | Worlds and quests | Fixed story | Hidden story | **Story arc + Rites** |
| Reset | None | None | Every life | On death | **Optional Patron Cycles** |
| Discovery | Low | Low | Medium | Very high, punishing | **Medium-high, forgiving, in side content** |
| Visuals | Spreadsheet | Cartoon | Text | Cards | **UI + living sanctum** |

---

## 13. Status of the v0.1 open questions

1. ~~**Time scale**~~ → *decided, see the decision log.*
2. ~~**Skills**~~ → *decided, see the decision log.* Exact per-tier item lists come later, in a content pass.
3. ~~**Followers**~~ → *decided, see the decision log.* The trait list and rank-up costs come later.
4. ~~**Taint**~~ → *decided, see the decision log.* The affliction list and exact numbers come later.
5. ~~**Rites**~~ → *decided, see the decision log.* Exact recipes come in the content pass.
6. ~~**Patrons**~~ → *decided, see the decision log.* The Boon tree and Offerings math come later.
7. ~~**Setting and lore**~~ → *decided, see the decision log.* The detailed story bible comes later.
8. ~~**Pacing**~~ → *decided, see the decision log.*
9. ~~**Art direction**~~ → *decided, see the decision log.*
10. ~~**Tech**~~ → *decided, see §14 and the decision log.*
11. **Deferred ideas:** Notoriety and investigators (outside pressure on the cult), a desktop-corner mode, a cosmetic real-moon sync option.

**Next layer: detail passes, now that the core is set**
- ~~**Chapter 1 content pass**~~ → done, see [CHAPTER1.md](CHAPTER1.md).
- ~~**The Grimoire hint model**~~ → done, see [GRIMOIRE.md](GRIMOIRE.md).
- **Economy math:** XP curve, action times, tithe rates, and Offerings → Boons.
- **Afflictions and follower traits:** first lists.
- **Story bible:** grandmother, the village, the Patrons, and chapter beats.
- **Sanctum layout:** what's in the scene, and how it grows by Chapter.

---

## 14. Tech and build path *(decided in Q10)*

**Stack**
- **TypeScript web app**, one codebase for the browser and Steam.
  - A UI framework (React or Svelte) for the panels.
  - The sanctum is **code-drawn SVG** in React (PixiJS stays an option if the scene ever needs canvas).
- **Electron + steamworks.js** for the Steam build (achievements, Steam Cloud).
- **Saves:**
  - local saves (browser storage / file on desktop)
  - **Steam Cloud** on desktop
  - **one-click export/import strings** to move a save between browser and Steam
  - No server and no account. A real cross-save backend can come later if players ask.
- **Offline progress:** a deterministic simulation that fast-forwards the elapsed time (up to the cap) on load. It produces the "while you were away" summary and applies the tithe, Taint ward and primed rites exactly as if you had been playing.

**Content as data.** Skills, items, recipes, rites, afflictions and Patrons live in plain data files (JSON or TypeScript objects), separate from the code. The designer can add or rebalance content without touching game logic, and balance can be checked with scripts.

**Realistic path for a non-programmer designer building with AI help**
1. **Vertical slice (browser only, placeholder art).** Chapter 1 only:
   - 6 skills
   - the Grimoire with a few hidden recipes
   - one follower
   - omens
   - the Hearth-Circle Rite
   - offline progress
   Goal: **is the core loop fun?** Everything else waits for that answer.
2. **Chapter 1 complete** (done): the full chapter, polished and tested. Show it to a small group (the r/incremental_games feedback threads, friends).
3. **Chapters 2–5, then Patron cycles.** Commission art once the loop is proven.
4. **Steam wrapper, Steam Cloud and achievements.** Free browser demo (Chapter 1) as marketing, then the premium release.

TypeScript is the best-supported language for AI-assisted coding, which helps this path. The main risk isn't the code; it's **balance and pacing**, so keep numbers in data files and plan for many playtest iterations.

---

## Decision log

### Q1: Time scale (decided)
- **No lunar calendar, no time-locks.** Waiting hours for a phase feels like an energy timer. Omens and moons are *boosts*, never gates.
- **Omen model B + C:** omens drop as rare loot, can be stored and released at will, and later Astrology invokes moon states on demand.
- **Action speed:** 3–6 seconds per gathering or crafting action. Rites take 30 minutes to 8 hours, and the Great Rite takes longer.
- **Offline cap:** 24 hours at the start, raised to 72 hours by early sanctum upgrades and to 7 days by late ones. Followers keep working offline.
- **Priming:** a prepared rite can be queued to run automatically, including offline.

### Q2: Skills (decided)
- **13 skills:**
  - Gathering: Herbalism, Gravetending, Scavenging.
  - Crafting: Alchemy, Chandlery, Sigilcraft, Binding-craft.
  - Knowledge: Scholarship, Divination, Astrology.
  - Ritual: Ritualism, Summoning.
  - Support: Purification.
- **Recruitment** becomes a system (rites earn follower slots). **Trapping** is merged into Scavenging, and animal offerings are dropped for tone.
- **Level caps are raised by Major Rites**, one tier per Chapter. Skill progress is tied to the story.
- **Knowledge skills train like every other skill**, through timed actions that consume inputs, so they sit inside the resource chains.

### Q3: Followers (decided)
- **Count:** 4 core followers (one per Chapter Rite), +1 from a hidden Grimoire rite, +1 from Patron cycles, about 6 in total.
- **Cheap and low-management:** one shared pantry with a soft tithe (50% speed when the pantry is empty). No inventories or gear. "Assist me" is the default job. Presets.
- **Strength:** start at ~60% of your speed and grow through ranks. Each has one trait.
- **Never lost**, except when you choose to sacrifice one at Ascension.

### Q4: Taint (decided)
- **A dial plus forbidden recipes:** Taint boosts forbidden yields, and a few recipes need a minimum Taint.
- **Afflictions have a mixed upside and downside.** Thresholds at 25, 50 and 75.
- **A Taint ward** (player-set ceiling, automatic switch to Purification) keeps offline play safe. **Rapture** at 100 is a vision event with lore and a rare drop, then Taint drops to 50 and one affliction stays.

### Q5: Rites (decided)
- **Nothing fails.** Every rite, summoning included, succeeds once its requirements are met. Preparation sets the outcome quality and bonus rewards. Tension comes from preparation and optimisation, not from dice.
- **Major Rite recipes are fully listed.** Discovery moves to side rites, hidden recipes, forbidden variants and lore.
- **5 Chapters:** 4 Major Rites plus the Great Rite, with caps 20 → 40 → 60 → 80 → 99.
- **Implication:** Taint no longer comes from failures. Its sources are forbidden variants, forbidden components and some entities.

### Q6: Patrons and the endgame (decided)
- **A cycle is a New Game+ reset:** replay Chapters 1–5 under a Patron's rules, faster each time, ending in a Patron-specific final rite and ending.
- **Carries over:** the Grimoire and lore (Pillar 2 kept), the follower roster (back to Initiate), Offerings spent on permanent Boons, presets and cosmetics. **Resets:** levels, mastery, materials.
- **Launch Patrons: the Moon and the Hunger.** The Serpent and the Veil are held for expansions.

### Q7: Setting and lore (decided)
- **Setting:** an invented region inspired by Slavic and Carpathian folk horror, in the 1800s.
- **Opening:** you inherit your late grandmother's house (she was the village witch), her half-burnt grimoire and a still-warm circle. Her notes are the tutorial.
- **The Great Rite is an apotheosis**, becoming something more. It was grandmother's unfinished work, and each Patron's ending gives a different answer.
- Tiers and Rites are renamed to fit the folklore (draft).

### Q8: Pacing (decided)
- **About 4 weeks of real time to the Great Rite**, front-loaded (see §5.4), with cycle 2 taking about 1 week. That's roughly 6–8 weeks of engagement at launch. It's a tuning knob to adjust after playtests.
- **The first session (1–2h active) reaches the Chapter 1 Rite.**
- **Active play only helps through decisions.** No click bonuses.

### Q9: Art direction (decided)
- **Folk-art / woodcut style** (woodcut, papercut, embroidery), with a limited palette and the same motifs used in the UI.
- **Placeholders first.** Commission art once the loop is proven fun.

### Q10: Tech (decided)
- **TypeScript web app + Electron (steamworks.js)** for Steam, with a code-drawn SVG sanctum.
- **Saves:** local + Steam Cloud + export/import strings. No server.
- **Content-as-data.** Build path starts with a Chapter 1 vertical slice to test the fun (see §14).

### Chapter 1 pass: new core decisions
- **Skill unlocks:**
  - Ch1: Herbalism, Scavenging, Chandlery, Sigilcraft, Scholarship, Ritualism.
  - Ch2: Gravetending, Alchemy, Binding-craft, Summoning.
  - Ch3: Astrology, Divination, Purification. Taint also arrives in Ch3.
  - Ch4–5 add depth, not skills.
- **Village coin:** earned only through village requests (plus trust). It buys basic supplies and sanctum upgrades, including offline-cap upgrades. There's no "sell anything" market.
- **Onboarding** runs through grandmother's margin notes, which unlock the skills one by one over the first 20–30 minutes.

### Grimoire hint model (decided)
- **Hybrid feedback:** a glow count for an attuned recipe, auto-crossing of proven-wrong items, and per-item feedback via Divination in Chapter 3.
- **Cost:** 1 of each item per attempt, plus consolation (Ritualism XP and Insight). Experiments are instant.
- **Fragments are addressed** to their recipe, and hints escalate: riddle, then category, then plain names.
- **Hint-less secrets:** a few per chapter, found by free experimenting.

### Chapter 1 build: small decisions (M1)
- **Village requests can be turned away** with no penalty; a new one knocks after 30 seconds of game time. That way an impossible request never jams the board.
- **The offline cap is derived from sanctum upgrades**, not stored in the save. Mended shutters give 36h in Chapter 1.
- **Yield bonuses** (e.g. the drying rack's +10%) roll a chance for +1 on guaranteed outputs only.

### Chapter 1 build: small decisions (M3–M4)
- **Discovery grants the effect.** A successful circle experiment *is* the making; the reward applies at once, permanently.
- **Janko, Follower 1 (draft):** in "assist me" mode, +30% speed at Initiate, plus the *Hearth-born* trait (+20% more on Chandlery). Assigning followers to their own actions comes in Chapter 2.
- **The rite never fails.** Its outcome counts three factors: 0 = Sound, 1–2 = Fine, all 3 = Resplendent (changed in the playtest-readiness round).
- **Player commands save immediately**, not on the next autosave.

### Chapter 1 build: QoL (M5)
- **No action queue.** Instead there's a **fallback**: when work stops for lack of an ingredient, you switch to the last gathering action (the default), a chosen action, or you stop. It applies offline too, and the away summary says what happened.
- **Every item name can be clicked** to see where it comes from and what uses it. Only recipes you know are shown, so the lookup never spoils hidden content.
- **The pantry is grouped by where things come from:** Garden & forest, House & village, Candles & incense, Sigils & wards, Pages & texts, Rites.
- **Settings** (the gear in the top bar):
  - fallback
  - Grimoire assist
  - reduced motion
  - how long messages stay
  - save export, import and reset
  Visited tabs are remembered in the save.

### UI feedback round (after M7)
- **Grandmother's notes are no longer a sidebar panel.**
  - The sidebar shows a **chapter tracker**: done steps, the current task with its progress and hint, and one "???" ahead.
  - Each note appears **once, as a modal story beat** when its step begins. It states plainly what opened and what's next.
  - All notes stay readable in the **Grimoire journal**.
- **Effects are always explicit.** Buffs, omens, upgrades and rewards lead with what they do (generated from the data). Flavour text is one short line at most.

### Playtest-readiness round
- **Rite quality:** Sound / Fine / Resplendent by factors met (0 / 1–2 / 3). Every factor now matters.
- **Curios** became a collection, not an item. There's **no sound** in this build.
- **The Dream pillow** is +10% speed while away. It used to add extra simulated time, which pushed timers into the future.
- **After the rite,** the house resumes work through the fallback rule.
- **Inputs are checked again when a repetition finishes,** so nothing is ever made for free.

### First patch: the staged Kindling (after the first playtest)
- **The playtest problem:** tier 3–4 of several skills within 5 minutes, then a long quiet stretch before a big rite that needed things the player hadn't unlocked.
- **The chapter's spine is the Kindling, built in five parts:** Light, Ward, Smoke, Words, Offering, then performing it. It's visible from the first minute on the Circle tab. Each part is placed in the Circle once, and the rosette lights one petal per part.
- **One new skill per stage**, only when that stage needs it: Scavenging, then Chandlery, Sigilcraft, Herbalism, Scholarship, Ritualism. Skills are about 10–15 minutes apart; the pacing test fails if two open within 8 minutes (after the tutorial pair).
- **Parts are mostly early-tier plus one stretch item.** Deeper recipes feed the village, trust, upgrades, hidden recipes and Chapter II.
- **Within a skill,** only what you've reached plus the next recipe shows. A recipe stays hidden while one of its ingredients comes from a skill that isn't open yet.
- **Experiments come mid-chapter,** introduced by their own note when the first hint arrives. They're optional, with the Dream pillow as the stated goal.
- **Levels speed up their skill:** +1% per level, compounding.
- **Talents:**
  - 1 point every 3 levels.
  - Three shared branches (Swift / Plenty / Fortune, 3 ranks each) and a skill-specific keystone after 3 points in one branch.
  - Resetting is free.
- **The XP curve is slower early:** 165 × 1.14^(level − 1) instead of 25 × 1.18^(level − 1). The chapter's length stays about 90 minutes.
- **Old saves:** skills and places an older save had opened stay open (`kept` in the save). The chapter resumes at the first part not yet placed, and a finished chapter counts every part as placed.
