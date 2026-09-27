# Ritual Idle — Core Concept (v0.3)

> Working title. This document fixes the **core idea**: fantasy, pillars, loops, skill shape and constraints.
> v0.2: all 10 open questions from v0.1 are decided. v0.3: the main sections describe the game as it is now (after four patches and three playtest rounds), and are kept current after every patch.
> The decision log at the end records what changed and why; Chapter 1's own changelog is at the end of [CHAPTER1.md](CHAPTER1.md#changelog).
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
| Challenge | Major Rites and summonings take the place of bosses. No auto-combat, and rites never fail; they run by themselves (tending can hurry them, never required), and optional offerings set the outcome quality |
| Visuals | A readable UI plus one illustrated "living sanctum" scene |
| Business | Premium one-time purchase, with paid expansions later |
| Core systems | Omens and invoked moons (never a time-lock), Taint |
| Time scale | 3–6s actions. The Chapter 1 rite is about 3 minutes and runs by itself (about 1.5 if tended); longer rites (30 min–8h) are the target for later chapters. Offline cap 24h, raised to 72h and then 7 days by upgrades |
| Pacing | About 4 weeks of real time to the Great Rite; the first session reaches the Chapter 1 Rite |
| Endgame | New Game+ Patron cycles; the Moon and the Hunger at launch |
| Art | Folk-art / woodcut style; placeholders until the loop is proven |
| Tech | TypeScript web + Electron; local saves + Steam Cloud + export |
| Currency | Village coin, earned only from villagers' contracts. Buys provisions (bread, tallow); later also some exclusive or rare projects and rare rewards. House projects are built from items, not bought. No free-sell market |
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

**Lore is a reward.** Grandmother's notes, translated fragments, the voices of the dead on Forefathers' Eve, and the Patrons' bargains are things you *earn*, the same way you earn XP. It's an opt-in reward: it collects in the Grimoire journal, one click away, and is never pushed at the player. The screens read like a ledger; the mood comes from names and art.

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
  - *Insight* toward undiscovered recipes (from pages past the story ones, and from curios).
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
- **The recipe is fully listed upfront.** You always know what a Rite needs; the challenge is producing it. Components come from several skills. In Chapter 1 the rite is the **Kindling**, built in five parts (candles, a ward, smoke, words, an offering), one per stage of the chapter, each placed in the Circle as you make it. Later rites may also ask for, for example:
  - a focus
  - a follower to assist
- **Rites run by themselves.** Once the requirements are met, you begin it (or let it begin by itself) and it runs in the action slot, offline too. There's nothing to answer, and it never fails.
- **Tending is optional.** While a rite runs, things to tend appear on screen (in Chapter 1: wicks, salt, smoke, words, bread); each click takes a few seconds off, up to half the rite. An idle player loses nothing but time.
- **Quality comes from optional offerings, never from failure.** In Chapter 1 there are three: a hearth candle, a discovered hidden recipe (the Hearth mark) and an active Still Night blessing. None = *Sound*, 1–2 = *Fine*, all 3 = *Resplendent*.
  - Later chapters can add more kinds of offering: consecrated materials, followers assisting, a matching omen or invoked moon, low Taint.
  - **Quality adds lasting extras, never the story rewards.** A plain (Sound) rite always gives the whole story reward. In Chapter 1 a Fine rite lets you choose **one keepsake** of three, a Resplendent one **two** (small lasting perks: faster time away, one more omen place, insight from pages), and a Resplendent one adds the embroidered circle cloth, a kept item that will matter in Chapter II. Keepsakes are kept for good and can be swapped at Ascension. Later, quality also adds a capped share of Offerings (§5.5).
- **The Circle Asks** *(from Chapter 2; the kiss/curse)*: before a rite, the circle offers a choice of 2–3 bargains, each written for that rite and shown in full. Take any, or none. Each is one quality step.
  - **The bite:** a curse on one skill you choose, e.g. *"The house goes cold: Chandlery 25% slower."* It counts down with **any work you do** (online or offline), about 150 repetitions (~10 minutes of play), so you simply work on something else meanwhile. It never takes a skill below half speed, never stops work, and never touches the rite. Nothing is random.
  - **The kiss:** when it runs out, the curse turns into a small permanent blessing on the same skill (e.g. *Hearth-hardened*: +3% Chandlery), up to +15% per skill across the game.
  - The kinds of price grow with the chapters: skill curses first, then a follower keeping vigil (Chapter 2), then Taint (Chapter 3).
  - Research behind it: [docs/research/RITE_QUALITY.md](research/RITE_QUALITY.md). The numbers are starting points for playtests.
- **Promises** *(later chapters)*: optional bonus goals you can take on before a rite, e.g. *"Before the next rite, finish two contracts."* Keeping one pays at the next rite; breaking one costs nothing. Promises never restrict or block play.
- **No time as a price.** Nothing asks you to wait or leave a rite "steeping"; the only time-like price is a curse, and it passes by working, not waiting.
- **Length:** the Chapter 1 rite is about 3 minutes. Longer rites (30 minutes to 8 hours) are the target for later chapters, which is where **priming** (queueing a prepared rite so it begins by itself, even offline) matters most.
- **Rites are presented as events:** when the parts are all in, a banner ("The Circle is ready. Wake it.") takes the House's hero, with the offerings and a quality ladder (offerings → Sound, Fine, Resplendent and what each adds). While it runs, the House becomes the rite scene: the phase in large letters, its line, the time left and the things to tend. The rosette's petals light phase by phase; the rite's story lines collect in the Grimoire journal. The chapter end is in sections: the rite, what it gave, keepsakes to choose (kept when you leave), and the story, folded.
- **Rewards of a Major Rite:**
  - all skill caps raised
  - the next material tier
  - a follower
  - a sanctum expansion
  - a lore chapter (in the Grimoire journal)
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
| 1 Hearth | **First session:** about 30–35 min for an efficient idle player, about 45–60 with side projects. The first Rite lands before the player leaves | 24h |
| 2 Grave | Days 2–5 | 24h → 72h upgrade |
| 3 Fern | About week 2 | 72h |
| 4 Drowned | Weeks 2–3.5 | 72h |
| 5 Starlit | About week 4, the ending | 7 days |
| Cycle 2 (NG+) | About 1 week | 7 days |

- **Unlock cadence:** something new every few minutes in Chapter 1, something every session in the mid game, a Major Rite every 1–2 weeks late.
- **Active vs idle:** active play wins mostly **through decisions** (switching actions, experimenting, spending omens, using charms), roughly 1.3–1.5× over pure idle. The one click bonus is tending a running rite: optional, capped at half the rite, and never needed for anything but time. No other click or "stay on screen" bonuses.
- **The Great Rite is a real ending with credits.** Afterwards the house, the Grimoire and your skills stay, and the endgame opens.

### 5.5 Cycle loop (endgame / prestige) *(decided in Q6)*
- **The Rite of Ascension is a New Game+ reset.** Pledge the order to a **Patron** and replay Chapters 1–5 under that Patron's rules.
  - It's much faster: cycle 2 takes about 1 week of real time and later cycles get shorter.
  - It ends in that **Patron's own final rite and ending**, so each cycle has a story reward.
- **What resets:** skill levels, mastery and materials.
- **What carries over:**
  - **the Grimoire and lore.** Nothing needs re-discovering.
  - **Follower roster.** Followers stay with you, back at Initiate rank. You can still *sacrifice* one at Ascension for extra Offerings; that slot is refilled by a new recruit at the next Chapter Rite.
  - **Offerings → Boons.** Offerings are the prestige currency, earned mostly from finishing rites and from sacrifices, with rite quality as a capped extra (about a third at most). They're spent on permanent Boons: XP and speed, a starting kit, faster early chapters.
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
  - **Hints escalate** from riddle to category to plain names. **Insight** is one pool, filled by failed attempts, pages, curios and village contracts, and **spent on the hint you choose** (a recipe's categories, one ingredient named, a nudge toward the one never named, a secret's next clue), so nobody gets stuck.
  - Experiments have their **own tab**. Chapter 1 has four hidden recipes; the first (the Window charm) is made from what every path holds when experiments open.
  - **Charms:** a discovered hidden recipe can be bound again from its own bind cost, at once and as often as you like, and used for a boost that lasts a number of actions, crafts or contracts (never a clock, so time away counts the same). It's the active side of discovery; nothing needs it.
  - **Each attempt costs 1 of each item** and always gives a little consolation XP.
  - **Secrets** turn up by free experimenting (1–2 per chapter); insight can buy their written clues.
  - **Divination** (Chapter 3) gives per-item feedback.
- **Omens and moons** *(decided in Q1)*
  - There is **no lunar calendar and no time-locks.** Everything is always available.
  - **Omens** (Blood Moon, Eclipse, Still Night…) drop from actions, online or offline, about every few minutes of work. A *captured* omen is stored (a jar of moonlight, a black candle) and **spent when the player chooses**, giving a temporary boost and occasionally a rare material. In Chapter 1, Still Night blesses one skill you choose with ×2 speed and ×2 chance finds for 2 minutes.
  - **Omens need somewhere to be kept:** none turn up until you build the **omen shelf** (a house project). The game points the player to it once the first part of the Kindling is placed.
  - **Invoked moons:** later, Astrology lets you *draw down* a moon state on demand for reagents. The moon becomes a tool, not a clock.
  - Omens that drop offline are collected automatically, so nothing is ever missed.
- **Talents: small builds** *(Chapter 1 onwards)*
  - Every 3 levels up to 30 each skill offers a **pair of talents, and you pick one side** (later chapters space pairs 5 levels apart past 30). The sides pull different ways (speed, bulk, thrift, chance finds, doubles, insight, help for another skill).
  - A pick is fixed until the next talent level, then it can be changed; there's no reset. The panel stays compact: one line per pick made. Each level also makes its own skill 1% faster.
  - **Talent text is generated from the effects,** in one vocabulary with the real numbers ("makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour"), and recipe rows show the outputs as boosted.
- **The village and the house** *(Chapter 1 onwards)*
  - **Village contracts:** the board holds **2 contracts** at a time (House projects add more), each asking for a good amount of one or two things. You can **deliver in parts** (what's delivered stays delivered), and finishing one pays coin and trust. **Trust levels never end:** each level brings better contracts, and every contract is scaled to the level and to its slot's quiet difficulty (easy, medium, hard), so there's always work and it grows. A contract can be turned away at no cost.
  - **Coin buys provisions** (bread, tallow, and herbs and beeswax once a House project stocks them). Later it's meant to buy some exclusive or rare projects and rare rewards too. There's no "sell anything" market.
  - **House projects** are side work built once from items you make, with no coin: the omen shelf, a sealed salt crock (more salt), a reading lamp, a drying rack, notice boards (more contracts), a herb stall and a wax trader (shop stock) and so on. Nothing on the main path needs them; they give deeper recipes and odds and ends a use.
- **Calm feedback**
  - Routine events (plain level-ups, omens, claims) go to a quiet **activity feed** under the top bar. **Toasts are kept for big moments** (a part placed, a project built, a contract done, a new recipe or talent, rare finds, the rite beginning).
  - **New words are explained on click** (keepsake, omen, blessing, offering, rite quality, insight, charm, house project), and buttons name where they take you ("Chandlery ›").
  - The inventory has its own **Inventory** tab, and every item has its own woodcut icon.
  - **Custom tooltips** give detail on demand (hover, focus or a touch hold), such as where a chance find's bonuses come from. The browser's own tooltips are never used, and anything needed to act is written on screen.
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
  - Limited palette: bone (linen), ink black (soot), ember red, candle gold. Since design system v0.4 each colour has **one job**: red = act here, verdigris = selected or done, gold = rare only, and a folk colour per skill for identity. The grounds are warm near-black with real lightness steps, so panels separate by value, not frames.
  - The flavour lives in the visuals, not in prose: an embroidery band under the top bar, cross-stitch under titles and tabs, brass corner marks, papercut rosettes, and a colour, hero band and material for each place (the house by the hearth, the Grimoire as a book, the village's pinned notices, the Circle at night). The full system is in [DESIGN.md](DESIGN.md).
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
2. ~~**Skills**~~ → *decided, see the decision log.* Chapter 1's items and recipes are in [CHAPTER1.md](CHAPTER1.md); later tiers come in their chapters' content passes.
3. ~~**Followers**~~ → *decided, see the decision log.* The trait list and rank-up costs come later.
4. ~~**Taint**~~ → *decided, see the decision log.* The affliction list and exact numbers come later.
5. ~~**Rites**~~ → *decided, see the decision log.* The Chapter 1 rite is built and playtested (it runs by itself, with optional offerings); later rites come with their chapters.
6. ~~**Patrons**~~ → *decided, see the decision log.* The Boon tree and Offerings math come later.
7. ~~**Setting and lore**~~ → *decided, see the decision log.* The detailed story bible comes later.
8. ~~**Pacing**~~ → *decided, see the decision log.* Chapter 1 was re-tuned in playtests to about 30–35 minutes of efficient idle play.
9. ~~**Art direction**~~ → *decided, see the decision log.*
10. ~~**Tech**~~ → *decided, see §14 and the decision log.*
11. **Deferred ideas:** Notoriety and investigators (outside pressure on the cult), a desktop-corner mode, a cosmetic real-moon sync option.

**Next layer: detail passes, now that the core is set**
- ~~**Chapter 1 content pass**~~ → done and built, see [CHAPTER1.md](CHAPTER1.md). It's now in playtest rounds (four patches and two playtest rounds so far; see its changelog).
- ~~**The Grimoire hint model**~~ → done, see [GRIMOIRE.md](GRIMOIRE.md).
- **Economy math:** tithe rates and Offerings → Boons. (Chapter 1's XP curve and action times are set; see [CHAPTER1.md](CHAPTER1.md) §3 and §10.)
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
2. **Chapter 1 complete** (done, now in playtest rounds): the full chapter, polished and tested, re-tuned after each playtest. Show it to a small group (the r/incremental_games feedback threads, friends).
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

*Revised after playtests: Chapter 1 ≈ 30–35 min idle (third and fourth patch).*

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
- **Village coin:** earned only through village requests (plus trust). It buys basic supplies and sanctum upgrades, including offline-cap upgrades. There's no "sell anything" market. *(→ changed; see Fourth patch)*
- **Onboarding** runs through grandmother's margin notes, which unlock the skills one by one over the first 20–30 minutes.

### Grimoire hint model (decided)
- **Hybrid feedback:** a glow count for an attuned recipe, auto-crossing of proven-wrong items, and per-item feedback via Divination in Chapter 3.
- **Cost:** 1 of each item per attempt, plus consolation (Ritualism XP and Insight). Experiments are instant.
- **Fragments are addressed** to their recipe, and hints escalate: riddle, then category, then plain names.
- **Hint-less secrets:** a few per chapter, found by free experimenting.

### Chapter 1 build: small decisions (M1)
- **Village requests can be turned away** with no penalty; a new one knocks after 30 seconds of game time. That way an impossible request never jams the board.
- **The offline cap is derived from sanctum upgrades**, not stored in the save. Mended shutters give 36h in Chapter 1. (→ changed: no Chapter 1 project raises the cap; see Playtest round 3)
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
  - Each note appears **once, as a modal story beat** when its step begins. It states plainly what opened and what's next. *(→ changed: it's a task beat; see Text trimmed to a spreadsheet style)*
  - All notes stay readable in the **Grimoire journal**.
- **Effects are always explicit.** Buffs, omens, upgrades and rewards lead with what they do (generated from the data). Flavour text is one short line at most. *(→ tightened: flavour lives in names, art, hover titles and the journal; see Text trimmed to a spreadsheet style)*

### Playtest-readiness round
- **Rite quality:** Sound / Fine / Resplendent by factors met (0 / 1–2 / 3). Every factor now matters.
- **Curios** became a collection, not an item. There's **no sound** in this build.
- **The Dream pillow** is +10% speed while away. It used to add extra simulated time, which pushed timers into the future. *(→ changed: +10% XP; see Playtest round 2)*
- **After the rite,** the house resumes work through the fallback rule.
- **Inputs are checked again when a repetition finishes,** so nothing is ever made for free.

### First patch: the staged Kindling (after the first playtest)
- **The playtest problem:** tier 3–4 of several skills within 5 minutes, then a long quiet stretch before a big rite that needed things the player hadn't unlocked.
- **The chapter's spine is the Kindling, built in five parts:** Light, Ward, Smoke, Words, Offering, then performing it. It's visible from the first minute on the Circle tab. Each part is placed in the Circle once, and the rosette lights one petal per part.
- **One new skill per stage**, only when that stage needs it: Scavenging, then Chandlery, Sigilcraft, Herbalism, Scholarship, Ritualism. Skills are about 10–15 minutes apart; the pacing test fails if two open within 8 minutes (after the tutorial pair).
- **Parts are mostly early-tier plus one stretch item.** Deeper recipes feed the village, trust, upgrades, hidden recipes and Chapter II.
- **Within a skill,** only what you've reached plus the next recipe shows. A recipe stays hidden while one of its ingredients comes from a skill that isn't open yet.
- **Experiments come mid-chapter,** introduced by their own note when the first hint arrives. They're optional, with the Dream pillow as the stated goal *(→ changed: the Window charm comes first; see Playtest round 2)*.
- **Levels speed up their skill:** +1% per level, compounding.
- **Talents** *(→ replaced; see Fourth patch)*:
  - 1 point every 3 levels.
  - Three shared branches (Swift / Plenty / Fortune, 3 ranks each) and a skill-specific keystone after 3 points in one branch.
  - Resetting is free.
- **The XP curve is slower early:** 165 × 1.14^(level − 1) instead of 25 × 1.18^(level − 1). The chapter's length stays about 90 minutes.
- **Old saves:** skills and places an older save had opened stay open (`kept` in the save). The chapter resumes at the first part not yet placed, and a finished chapter counts every part as placed.

### Second patch: hands-on start, a useful omen, task-first notes
- **Changes a logged decision** (Q8: "active play = decisions only"). Active play is now decisions **plus optional tending** *(→ removed; see Fourth patch)*:
  - Clicking **Tend** lights a draining meter: +50% speed while lit, and a streak that grows a bonus-find chance (up to 20%).
  - A fourth talent branch, **Tending**, improves it.
  - It's never required. The pacing test plays idle, so the chapter is ~90 minutes without it.
- **Small steps inside every stage,** each a minute or two with a small reward, so there's always a concrete next click.
- **A faster start:** tier-1 recipes take 2 seconds, and the first levels are eased (levels 2–4 in about 30–60 seconds each). The XP base rose to keep the chapter's length.
- **Still Night blesses a skill you choose** on release: +50% speed and chance finds ×2 for 15 minutes. It used to bless Scholarship and Ritualism, which rarely mattered.
- **Notes are task-first.** A new stage shows its steps, rewards, needs and a Go button; grandmother gets one line, and the full note lives in the Grimoire journal. Toasts say what you got; story stays in the rite log, curios and pages. *(→ changed: no quote and no rite log on screen; see Text trimmed to a spreadsheet style)*
- **Rows never change height on hover:** the rates line always takes its space and is only revealed.

### Third patch: no grinding, a played rite, insight you spend
- **Sequencing rule: no grinding, nothing useless.**
  - Every step's count earns the level the next step needs, and everything crafted is spent by a later step or a part. The playthrough test enforces both.
  - Second recipes come at level 2, third at 3.
  - Gatherers show only once something uses their finds.
- **The chapter is shorter:** the rite begins at ~22 minutes (efficient idle play), and the chapter is ~27–35 minutes. This follows from the no-grind rule and was chosen over bigger parts. Chapter II carries more length.
- **Step rewards are claimed and varied:** a Surge (×2 speed for 20s), XP into a skill you pick, items, an omen. Claiming never gates progress.
- **Omens are a rhythm, not a rarity:** about every 4–5 minutes, ×2 speed and ×2 chance finds on a chosen skill for 2 minutes. The shelf holds 2 (3 with the upgrade).
- **The keystone blooms free** when a branch is full. Talents are drawn as a folk tree of life. *(→ replaced; see Fourth patch)*
- **Insight is spent, not accumulated:** one pool, no toasts. You buy a recipe's categories, an ingredient's name, or a secret's clue, so secrets are findable.
- **The rite is played, not waited for** *(→ replaced; see Fourth patch)*. It replaces the 30-minute rite (which asked players to leave) with 5 phases of a minute, each with a 12-second moment to answer. Quality comes from moments answered, the Hearth mark and an omen. It still never fails, and still finishes offline.
- **Fixed:**
  - Tend no longer finishes a repetition at once (progress is a fraction now).
  - Escape closes only the top dialog.
  - Smoke the rooms states its effect.

### Fourth patch: calm, choices, builds and side projects
- **Tend is removed** (the meter, the Space key, the Tending talent branch and the "Tend once" step). Active play is choices, not clicking. This **restores Q8** ("active play only helps through decisions"), which the second patch had changed. *(→ one exception since: tending the running rite; see Playtest round 2)*
- **The Major Rite runs by itself.** Five phases of 36 seconds (about 3 minutes), no moments to answer, and it carries on offline. It needs Ritualism 3. *(→ it can now be tended to finish sooner; see Playtest round 2)*
  - **Quality comes only from optional offerings** chosen before beginning: a hearth candle (an item, used when the rite begins), the Hearth mark (a discovered hidden recipe) and an active Still Night blessing. None = Sound, 1–2 = Fine, all 3 = Resplendent.
  - **Quality is cosmetic:** it changes only the lore and a keepsake, never the rewards. It still never fails. *(→ changed; see Rite quality, after the fourth patch)*
- **Free order of the middle parts.** After the Light, the player chooses the order of the Ward, the Smoke and the Words; the Offering stays last. Each middle skill gathers for itself (Sigilcraft sweeps its ash, Scholarship searches the attic, Herbalism binds smudge and makes mugwort incense), so every order works without grinding. The playthrough bot plays all six orders.
- **Honest steps** *(→ replaced by part checklists; see Playtest round 2)*: steps count from the stage's start, a craft step is also met by holding enough, step counts match each part's needs, and there's at most one reward per stage (on placing its part, plus the Start Surge).
- **Recipes come in tiers, a new tier every 3 levels** (Tier 1 at level 1, then 3, 6, 9, 12, 15, 18), shown on each row *(→ changed: each recipe at its own level; see Playtest round 2)*. The XP curve is flatter to match: 110 × 1.1^(level − 1), with no easing. The rite begins at about 30–32 minutes for an efficient idle player.
- **Talents are builds:** at levels 3, 6, 9 and 12 each skill offers a pair, and you take one side. The sides pull different ways (speed, bulk, thrift, finds, doubles, insight, help for another skill…). Switching and resetting are free. Old branch ranks are dropped on load. Drawn as a vine.
- **Side projects:**
  - **House upgrades are projects built from items**, with no coin: the omen shelf, reading lamp, drying rack, mended shutters and carved omen shelf. They give the deeper recipes and the attic's odds and ends a use. Nothing on the main path needs them.
  - **Omens need the omen shelf.** None turn up until it's built; building it brings the first Still Night. "Bless a skill" replaces "Release". Steps no longer give omens (the Light and the Words each gave a Still Night before).
  - **The village board holds 2 bigger contracts** that can be **delivered in parts** (what's delivered stays delivered). The Offering stage asks you to finish one. The shop sells only bread and tallow.
- **Calm feedback:** routine events (steps done, plain level-ups, omens, claims, talent picks, partial deliveries) go to an **activity feed**, one quiet line under the top bar (click it for the last 30). **Toasts are kept for big moments:** a part placed, a project built, a contract done, a new tier or talent at a level-up, a new recipe from a page, rare finds, curios, the rite beginning. The inventory moved to its own **Stores** tab.
- **Calm UI:** loot floats queue and stack instead of overlapping; rows never change size on hover and a click anywhere on a row starts it; task cards close only with their button or Escape; Go leads to where the missing ingredient is made; text is one step larger.
- **Item icons:** every item has its own code-drawn woodcut glyph, coloured by the skill that makes it, on chips, Stores, contracts, projects and the Circle.
- **Old saves** (save version 8): Tend and in-progress rite moments are dropped; anyone who had met an omen keeps an omen shelf, the old bought shelf becomes the carved shelf, and the board trims to 2.

### After the fourth patch
- **Coin later buys exclusive or rare things:** house projects stay built from items, but later on coin is meant to come in for some exclusive or rare projects and rare rewards. A note for the future; nothing in Chapter 1 yet.
- **The omen shelf is highlighted to the player,** because omens start only with it and playtesters could miss it: once the Light is placed, a one-time card from grandmother (her shelf is bare; house projects are optional, built from what you make, kept for good) with a Go button *(→ removed; see Text trimmed to a spreadsheet style)*; an optional tracker line with have/need chips; a "New" tag and a soft glow on its row; and a one-time toast when it can first be built.
- **The docs stay current:** after every patch, CONCEPT and CHAPTER1 are rewritten to describe the current game. History lives in this decision log and in CHAPTER1's changelog, not in the main sections.

### Rite quality: the kiss and the curse (after the fourth patch)
- **Research:** [docs/research/RITE_QUALITY.md](research/RITE_QUALITY.md) looked at how other games price a better outcome (Hades' Chaos boons and Heat, Slay the Spire's Neow, Risk of Rain 2's Shrine of the Mountain, Monster Train's pact shards, idle-game challenges). A price feels worth it when it's shown up front, temporary, aimed by the player, and pays something of a different kind.
- **Changes a logged decision** (Chapter 1 quality was cosmetic only): **quality now adds lasting extras**, never the story rewards. Chapter 1 gets the **keepsake pick** (Fine: choose 1 of 3; Resplendent: choose 2): Grandmother's quilt (+10% speed while away), a jar of embers (+1 omen place once the shelf is built), her reading glasses (+1 insight per page deciphered).
- **The Circle Asks** (the kiss/curse bargains) starts in **Chapter 2**, not Chapter 1, so the chapter still being tuned doesn't gain a system. The designer's answers to the research's questions:
  - A curse counts down with **any work** (can't be dodged, no puzzle, no break in the flow).
  - It turns into a small blessing on the **same skill**. Starting numbers, gentle on purpose: −25% on one skill for about 150 repetitions, becoming +3% for good; capped at +15% per skill.
  - A **choice of 2–3 bargains** per rite, written for that rite and shown before you accept.
  - **Offerings** come mostly from finishing rites and sacrifices; quality is a capped extra.
  - **Keepsakes swap at Ascension** (they're kept, and collected across chapters, until then).
  - **Vows became Promises:** optional bonus goals that pay if kept and cost nothing if not. Nothing may block progress.
  - **Steeping is dropped:** no waiting as a price.
  - **Name:** "The Circle Asks" (Tithe is already the followers' upkeep).
- **Save version 9** adds the chosen keepsakes.

### Design system v0.4: "Hearth + Folk" (after the fourth patch)
- **Why:** playtest screenshots read as "one big brown and gold blob" and "too AI": every ground, text colour and accent sat in one warm hue family, panels barely separated from the room, gold did a dozen jobs, and small caps, frames and glows were everywhere ([research/VISUAL_DIRECTION.md](research/VISUAL_DIRECTION.md)).
- **What:** the design handoff ([design_handoff/](design_handoff/README.md)) applied to the whole game: "Soot & Linen" roles (red acts, verdigris selects or marks done, gold only for rare things, skill colours only on icons, stripes and bars) on warm "Hearth" grounds; Alegreya Sans for the UI and numbers, the SC face only for titles and column headers, Alegreya roman for lore, **no italics** and no dashed outlines; "Folk" ornament that does a job (the embroidery band, brass corners, item tokens, the running row that fills as it works); and a colour, hero band and material per tab. Recipes are a real table with XP/h, and each skill shows its own Inputs and Made-here stock.
- **Kept on purpose:** the Stores tab (a logged decision from the fourth patch) instead of the handoff's collapsed "All shelves" in the sidebar; Tend stays removed; the shop sells only provisions (house upgrades are projects).
- **New setting:** row density (roomy 46px, comfortable 36px, compact 32px).

### Text trimmed to a spreadsheet style (after v0.4)
- **Why:** the designer: too much fluff text. Screens should read like a spreadsheet, where text says something about the gameplay; the flavour belongs in the visuals, not in lore nobody reads. The audit behind it: [research/TEXT_AUDIT.md](research/TEXT_AUDIT.md).
- **Rules:** numbers and verbs first; one line per thing; labels over sentences; tooltips for the rare "why"; no dead text (content fields no screen shows are deleted). **Puzzle text is gameplay** and stays: riddles, clues, category hints, villager asides (shortened), and the item bridges ("The dream-herb.", "The Kupala herb.", now also in the item chip's tooltip).
- **Where the story went:** everything written stays in the game, one click away. "The rest of the book" is now the Grimoire **Journal**, one collapsed entry per note, page, curio (listed by name), discovery reveal and the Kindling (its phase lines, finale, lore, and the Resplendent line). The task card, the discovery dialog and the chapter end each carry a collapsed **Story** instead of prose.
- **What changed on screen:**
  - Task cards keep steps, needs and Go, and lose grandmother's quote.
  - The omen-shelf card and its after-build note are gone. The tracker's side-project line, the New tag and the ready toast stay; building it is a toast ("Omen shelf built · Holds 2 omens · 1 Still Night stored · bless a skill: ×2 speed, 2m").
  - The rite log is a five-row phase checklist (✓ done, ▸ now, · later) beside the rosette.
  - Contracts show a short label ("Nettle soup") with the full line as its hover title.
  - Keepsakes state their effect ("+10% offline speed"), with their lore as the hover title.
  - Rewards, project effects, talents, the away summary, toasts, the how-strip, guidance and settings are short labels. Curio toasts say "+3 insight".
  - The Threshold nail's page says "Opens: grandmother's hidden note (journal)", so the plot thread shows with the story folded.
- **A Resplendent rite** is sold as "choose two keepsakes, and the embroidered cloth", no longer "and more lore" (its lore line still exists, in the journal).
- **Logged decisions this adjusts:** the pillar "Lore is a reward" (still true, now opt-in); the UI feedback round's "each note appears once, as a modal story beat" (a task beat now) and "flavour text is one short line at most" (flavour lives in names, art, hover titles and the journal); the second patch's "story stays in the rite log"; the one-time omen-shelf card from after the fourth patch; DESIGN.md's task-card quote, shelf card, omen-shelf note, rite log, keepsake lore line and the chapter end's finale and lore lines; GRIMOIRE.md §9.2's reveal dialog with the lore line (the reward only now).
- **No save change:** `settings.introsSeen` stays (the ready toast uses it); an old "omen_shelf" entry is simply unused.

### Before the next playtest (after the text trim)
- **Talents are fixed until the next tier** (changes "switching is free"): a pick at level L can be changed from level L+3 (→ changed: from the next talent level; see Playtest round 3); taking one asks first; no reset. The designer wants talent choices to be real decisions, with a way back once you've grown past them.
- **The last stage is just "Wake the Circle":** its two steps (bind 2 smudge bundles, smoke the rooms twice) never blocked the rite, so they read as busywork.
- **After the rite, the tracker lists what's still to find** (hidden recipes, secrets, projects, skills at the cap, better contracts), so the chapter end isn't a dead end. *(→ removed; see Playtest round 2)*
- **The talent panel shows only what's reached** and folds while nothing waits; **XP rewards can't go into a capped skill.**
- **Playtest save resets:** the game can wipe saves on purpose (`SAVE_EPOCH`), so a playtest after big changes starts clean instead of from a save shaped by old rules. Whether to reset is decided at the end of every session. The first reset ships with this build.
- **The inventory tab is called "Inventory"** (it was "Stores"): the designer preferred a plain, generic name players know at a glance.

### Playtest round 2 (2026-09-27)
- **Salt was the choke point** (about 70 needed for the rite, all from the pantry at 50%). New: **Scrape the salt barrel** (Scavenging 7, 4s, 11 XP: salt every time, tallow 40%, bread 5%) and the **Sealed salt crock** project (8 beeswax + 6 tallow candles: salt finds ×1.5, so pantry salt 50% → 75%).
- **Fixed recipe tiers are dropped** (changes the fourth patch's "a new tier every 3 levels"). Each recipe opens at its own level; most still come every 3, but the salt barrel sits at 7, Decipher a burnt page at Scholarship 2 (was 3) and Pick mugwort at Herbalism 5 (was 6). The recipe table's column is "Lvl". A recipe can now sit where the chapter needs it (the salt barrel just before the Offering).
- **Steps are replaced by part checklists** (changes the fourth patch's "honest steps"). Fixed sub-steps ("Pour 24 candles", then "Decipher") told players an order the game didn't need. Each stage's one step is placing its part; the tracker lists the part's items with have/need, a button to the skill that makes each, a "Short of" line worked out down the recipe tree with the player's talents, and level chips for recipes on the way. Any order. "No grinding" is now checked by the bot planning from the same checklist (hence the lower levels for Decipher and mugwort). The Offering's "finish a contract" step is gone: bread is bought with coin from contracts anyway. The rite still begins at 29–32 minutes.
- **The rite is the focus, and can be tended** (changes Q8 again, narrowly). The rite is the chapter's payoff, so it takes the screen: a banner replaces the House's hero when the Circle is ready, and while it runs the House becomes the rite scene. Tending: things appear to click (wicks, salt, smoke, words, bread); each takes 3 seconds off, up to half the rite (90 seconds). It's never required, it only saves time, and it's the game's only click bonus (short, capped and optional). Keepsakes are chosen freely on the chapter-end screen and kept when you leave it. Save version 10.
- **Experiments get their own tab, and pay active play.** A new first hidden recipe, the **Window charm** (tallow candle, glass shard, salt), can be made on every path when experiments open (a Scholarship-first player had nothing to start with). Rewards were re-aimed at active play: Window charm +10% speed (all skills); **Dream pillow +10% XP instead of +10% offline speed** (an early experiment shouldn't reward being away); Hearth mark a rite offering plus +10% Sigilcraft speed; Threshold nail trust ×2 (was ×1.5). **Charms:** a discovered hidden recipe can be bound again at once and used for a 10-minute boost (chance finds ×1.5, +25% XP, 15% of crafts free, contracts +50% coin) (→ changed: charms last a number of uses; see Playtest round 3), a reason to come back to the Circle. The one ingredient never named gets a buyable **nudge** (6 insight), never its name, so no recipe leaves a player stuck.
- **Talent text is generated from the effects,** and recipe rows show what you really get. Hand-written talent lines could drift from the numbers. Now one vocabulary, real numbers, and a raised output is marked with a ▲ and a hover naming its source.
- **"Still to find" is removed** after the rite (changes "Before the next playtest"). Level 40 in every skill read as stuck at 0/6, and players are meant to move on to Chapter II. A small "Chapter I complete" card remains.
- **New words are explained on click** (a small "i": keepsake, omen, blessing, offering, rite quality, insight, charm, house project), House projects say what they're for, and the stage choice explains each part (the skill's one line, its items, what it uses, what it opens). **Buttons name where they go** ("Chandlery ›", "Projects ›"); no button just says "Go".
- **Chances can pass 100%.** A chance past 100% is one for sure plus a chance of another (110% salt: 1, and 10% for a 2nd), so stacking find bonuses never wastes them. Find talents say only their multiplier ("Salt ×2 as likely"); a list of before → after chances in every talent would be a mess, and the recipe rows show the real numbers.
- **Big choices happen on tabs, not in the sidebar.** The next part is chosen at the Circle (the game takes you there once), with room for a few lines on each skill, what you'll make, and what it opens. The sidebar tracker only informs.
- **Every new term is explained** (a rule now, in CLAUDE.md): the chapter's places and systems (the Circle, the Kindling, the Grimoire, the Village, contracts, trust, coin, hidden recipes, secrets, experiments, talents, Surge, curios, followers, the level cap) open a short explanation where they first appear. Tending the rite stays the one click bonus (confirmed by the designer).
- **Fixed:** an item's Start shortcut could start a recipe not yet on its skill's list (the midden via the drying rack's nails). Shortcuts now use only revealed recipes, a `start` command refuses unreached ones, and a House project counts as a use for a gatherer's finds.

### Playtest round 3 (2026-09-27)
- **One rule for chance finds.** Bonuses disagreed: the Window charm raised every find but wasn't named on the recipe rows (charcoal at 15% looked unchanged), and byproducts like Wick ash ignored find bonuses. Now one list of chance factors drives the roll, the number and the names: find talents, projects (the salt crock), item buffs, all-finds effects (the Window charm) and a blessed skill (Still Night) apply to every chance find, outputs and byproducts alike. Omens (only the omen talents), doubles, extras, saves and every-nth are their own kinds. Byproducts show on the recipe rows and follow the past-100% rule.
- **Custom tooltips, and no browser tooltips.** Playtesters found the browser's `title` tooltips slow, plain and distracting, and they don't work on touch or for keyboard players. A `Tip` card (350 ms hover, focus or a 500 ms touch hold; a title, rows and a note) replaces every one, and a test keeps `title` out of the UI. Tooltips are extra detail only: why a button is disabled is written on screen. An item chip's tooltip breaks a chance down (base × each bonus = now), the one "why" players asked for most. Research: [research/TOOLTIPS.md](research/TOOLTIPS.md).
- **The omen shelf reads at the sidebar's narrowest:** one card per kind of omen (a jar with ×N, the name, the effect on its own line, a full-width "Bless a skill"), and a full shelf says so in words.
- **Charms count uses, not minutes** (changes Playtest round 2's 10-minute charms). A clock asked players to time their play, against the "no real-time gating" guardrail, and time away wasted it. Now: Window charm the next 100 actions (chance finds ×1.5), Dream pillow 100 actions (+25% XP), Hearth mark 40 crafts (25% of crafts free, was 15%), Threshold nail 3 contracts (+50% coin and trust). Using one while it's on adds its uses. Each has a real bind cost (e.g. 3 tallow candles, 2 glass, 4 salt) instead of 1 of each ingredient. Save version 11; old timed charm boosts are dropped.
- **Trust levels never end, and contracts scale** (changes the fixed trust gates at 2–5). Trust stopped mattering once the last contracts (trust 5) had opened, and the same 11 contracts repeated at the same size. Now level L needs L + 2 more trust (3, 7, 12, 18, 25…), the written contracts are templates (each opens at a trust level), and each contract on the board is scaled to the level (×1 + 0.2 per level) and to its slot's quiet difficulty (easy ×0.6, medium ×1, hard ×1.6 with +1 trust). The difficulty is never labelled; the scaled contract is stored on its slot, so it doesn't change after it knocks. The Village shows "Trust level 2 · 1/5 to 3".
- **Village projects** (changes the first build's shutters). Mended shutters (a 36h offline cap) meant little in a 30-minute chapter, so they're gone; the cap stays 24h in Chapter 1. New projects give the village more to do: Notice board and Covered board (+1 contract each; the third slot is the hard one), Herb stall (the shop sells nettle, chamomile, mugwort) and Wax trader (beeswax). They show once the Village is open. Shop entries can wait for a project.
- **Talents every 3 levels to 30** (changes the fourth patch's four pairs, and "fixed until L+3"). Skills had no choices past level 12, though Chapter 1 reaches 20 and the rite raises the cap to 40. 36 new pairs (levels 15–30) use the same effect kinds, bigger higher up. A pick changes at the next talent level; past 30, later chapters space pairs 5 apart. The panel stays small at any level: waiting pairs as two leaves, picks made as one line each with "Change" once allowed, the next pair as one line.
- **Choices talk only about what the player knows** (a rule now, in CLAUDE.md). The stage choice's skill descriptions named places the player hadn't seen (the village midden, the Grimoire, Experiments). Now they describe the skill in terms of the house, candles and the Circle; what a choice opens is in the card's "Opens" row, explained on click.
- **The rite's tend field is quiet:** no text flickers in its middle (a small ring pulse and the "Time taken off" counter instead; the hint is a steady caption under the field).
- **The embroidered cloth is real.** A Resplendent rite promised a cloth that existed only as a line of text. It's now a kept item (a new Heirlooms category, "It will matter in Chapter II"), named on the chapter end and drawn in the House. Saves with a Resplendent rite get it on load.
- **The Experiments tab in two views** (The Circle, Charms; remembered). The Circle view puts what you're working on beside the Circle, and duplicates are gone: the step strip, the second attempts list, the Next step box, the repeated Gives and known list, and the insight-sources list.
- **The Grimoire as a book:** deciphered pages as a grid of 100 page slots by chapter (Chapter I's 6, then 14, 20, 25 and 35 locked), "6/100" in the index, loose leaves with their insight, and curios as tiles with live chances. The book should look mostly still to find.
- **Logged decisions this adjusts:** Chapter 1 build (M1) "Mended shutters give 36h"; the fourth patch's talent pairs at 3, 6, 9 and 12 and its project list; "Before the next playtest"'s "changed from level L+3"; Playtest round 2's 10-minute charms (and the Hearth mark charm's 15%); the text trim's "hover titles" for contracts, keepsakes and flavour (now tooltips).
- **Read words turn plain, and a Guide keeps them.** An explained word stops calling for attention once its explanation is read (its "i" goes); the "?" Guide in the top bar lists every word read, so nothing explained is ever lost.
