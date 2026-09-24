# Research Notes (September 2026)

Condensed findings behind [CONCEPT.md](CONCEPT.md). The Steam scores are approximate, taken from store pages and Steambase snapshots.
Caveat: Reddit didn't load during research, so community sentiment comes from Steam discussions, Hacker News, galaxy.click, press and design essays. The r/incremental_games threads are worth reading by hand.

---

## 1. Market snapshot

| Game | Steam | Core loop | Praised | Criticised |
|---|---|---|---|---|
| Melvor Idle | 92% of ~8.6k | 20+ RuneScape-style skills that feed each other, one action at a time | Skills depend on each other; "RuneScape without the tedium"; offline play; cloud save | Late grind; Township making other skills obsolete; Astrology nerfs; spreadsheet UI |
| NGU Idle | 95% of ~10.9k | Split resources across many systems, then rebirth | Humour; huge amount of content; free | Deliberate tedium; stretched endgame |
| IdleOn | ~75% of 22–30k | ~10 characters working in parallel | Depth; frequent updates | Pay-to-win (auto-loot, gacha pets); chores; developer conduct |
| Antimatter Dimensions | 91% of ~3.4k | Generators that feed generators | Each prestige layer changes the rules | Mid-game walls |
| Cookie Clicker | 96% of 55k+ | Click, build, ascend | Charm; minigames | — |
| Leaf Blower Revolution | 94% of ~22k | Silly premise with deep layers | Generous free-to-play | — |
| Idle Champions | 76% overall, 62% recent | Place D&D champions in formation | Licence; positional puzzle | Paywalls; nerfs after purchase |
| Increlution | 85% of ~1.2k | Queue jobs within one lifespan | Tension of a time loop; a story | Too many repeats before automation |
| Unnamed Space Idle | ~92% | Ship loadout vs. enemy types | Systems that "click"; catch-up nerfs for new players | — |
| Gnorp Apologue | 95% of ~7.4k | Visual production simulation | Watching the machine work; 120k+ sold at $7 | — |
| Nodebuster | 97% of ~10–14k | Short timed runs plus an upgrade tree | No filler; ~4-hour ending | Short |
| Loop Hero | 91% of ~16k | Hero fights automatically, you place cards | Idle combined with RPG depth | — |
| Soda Dungeon 2 | 93% | Auto-dungeon plus a town | Fair free-to-play | — |
| Shop Titans | 76% overall, 51% recent | Craft and sell | Fun to be the shopkeeper | $50 of base unlocks plus a subscription |
| Clicker Heroes 2 | ~52%, delisted | Paid sequel | Ethical premium stance | Abandoned; price shock |
| Idle Clans / Milky Way Idle | 74% / 71% | Multiplayer RuneScape-likes with markets | Player economy; clans | Always online; manipulation; seen as clones |
| Rusty's Retirement | 97%, 500k+ sold | Farm in a strip on your screen | Desktop-corner play | — |
| Cast n Chill | 95%, $5.3M+ | Fishing with an active/idle toggle | Second-monitor play | — |
| The Farmer Was Replaced | 96%, 400k+ | Code a farming drone | A hybrid genre | — |

**Occult-adjacent**

| Game | Steam | Notes |
|---|---|---|
| Cultist Simulator | 79% | Mystery built into the mechanics; punishing and opaque |
| Book of Hours | 89% overall, 70% recent | No fail states, but still no guidance; clunky UI |
| Cult of the Lamb | 96% of ~119k | The cult theme at mass scale |
| Potion Craft | 93% of ~16.6k | Recipes discovered by exploring a map |
| Magic Research 1 / 2 | 90% / 92% | Schools of magic; apprentices automate spells; reassigning them is a chore |
| Theory of Magic | Browser | Class-path choices drive replays |
| Idle Iktah | 76% | Skilling idle with items affected by moon phase |
| Cult of the Yellow King, Let It Consume, Necromancer Idle | 68–79% | Shallow "sacrifice, number goes up" games |

---

## 2. What players praise
- **New systems appearing over time.** Each layer changes how earlier ones are used (Antimatter Dimensions, Candy Box, Universal Paperclips).
- **Skills that depend on each other.** Optimising the whole web becomes the game.
- **Honest offline progress**, as if you had been playing the whole time.
- **Early content staying relevant.**
- **Hard-won rare drops** and meaningful goals.
- **Built-in quality-of-life:** ETAs, buy-max, notifications, save export.
- **Charm, humour, and something to watch.**
- **Steady updates**, and catch-up for new players.
- **Real build choices:** Realm Grinder factions, Unnamed Space Idle loadouts.

## 3. Pet peeves
- Pay-to-win, gacha, paid quality-of-life, and pay-to-skip timers.
- Slowdown that never ends; prestige that feels like punishment.
- One system invalidating the others (Melvor's Township).
- Nerfs to earned progress (Melvor's Astrology).
- The mastery pool feeling zero-sum; buffs that carry penalties (Melvor Agility).
- Too active for an "idle" game (Melvor's early combat and Thieving).
- Needing a wiki; unclear UI; the spreadsheet look.
- Save problems, always-online requirements, one cloud save slot.
- Tedium from reassigning after each reset (Magic Research 2); chores that multiply with each character (IdleOn).
- A dominant strategy that leaves no real choice (Dwarf Eats Mountain).

## 4. The skilling-idle skeleton
Timed action → XP → level → higher-tier actions → raw resources → processing → consumables and gear → challenge sink → rare drops → next gate.
Layered on top: per-item mastery, global passives (pets, Agility, Astrology, Summoning synergies), and a cap-raise or prestige layer.

**Constraints that create choices:**
- one action at a time
- offline cap (24 hours in Melvor, and a debated point)
- inventory limits
- consumable charges
- location and travel (WalkScape)
- spendable checkpoints (the mastery pool)
- lifespan (Increlution)

## 5. Design principles from experts
- **Pecorella (Kongregate):**
  - Costs grow exponentially while production grows more slowly.
  - Milestone bumps add rhythm.
  - Prestige formulas based on lifetime earnings need about 4× (Realm Grinder) to 128× (Egg, Inc.) more effort per doubling.
- **Guan:**
  - Nested timers (e.g. caps at 20 minutes, 5 hours and 2 days) matched to how often players check in.
  - Separate currencies for different check-in styles.
  - Roughly ×1.1 production per level against ×1.15 cost growth.
- **Resets:** prestige is typically worth it at about 10–20% of peak speed.
- **Layers:** layered prestige should change the meaning of earlier layers.
- **Active play:** reward both active and idle play, but big bonuses for active play are seen as a dark pattern.
- **Balancing:** automate content balancing early.

## 6. Monetisation
- **Accepted:**
  - a premium price
  - paid expansions (Melvor)
  - cosmetics
  - small optional shops
  - optional ad boosts (mobile)
- **Rejected:**
  - permanent paid stats or drop rates
  - gacha progression
  - paid content that power-creeps older purchases
  - paid quality-of-life
  - timers you pay to skip
  - nerfs after purchase
- **Precedent:** Clicker Heroes 2's premium switch was praised for its ethics but the game failed commercially. The lesson is that price has to match expectations.

## 7. Trends 2024–26
- Desktop-corner and second-monitor idlers: Rusty's Retirement, Bongo Cat, Cast n Chill.
- Short incrementals you can finish, at $3–7: Nodebuster, Gnorp. They spread through YouTube and the Steam algorithm.
- Hybrids of incremental and another genre: coding, platforming, roguelite runs.
- Active/idle toggles.
- Browser classics moving to Steam: Kittens Game, Trimps, Antimatter Dimensions.
- Melvor Idle 2 (Early Access 2026) adds quests, story and day/night. **It's a direct competitor to watch**, and it confirms demand for more direction in the genre.

## 8. Occult design lessons
- Hidden recipes delight, but record them automatically, hint generously, and make failure cheap.
- Timers suit the theme. Fail states that run while the player is offline do not.
- Lore works as a reward.
- Prestige paths should play differently (Theory of Magic's classes, Realm Grinder's alignments).
- Invest in presentation. Text-only is the most common complaint in magic idles.

---

## Sources
- Pecorella, *The Math of Idle Games*:
  - https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i
  - https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii
  - https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii
- GDC, *Idle Games: The Mechanics and Monetization*: https://www.gdcvault.com/play/1022065/Idle-Games-The-Mechanics-and
- Eric Guan, idle game design principles: https://ericguan.substack.com/p/idle-game-design-principles
- Machinations: https://machinations.io/articles/idle-games-and-how-to-design-them
- Melvor Idle:
  - Store page: https://store.steampowered.com/app/1267910/Melvor_Idle/
  - Wiki: https://wiki.melvoridle.com/w/Mastery , https://wiki.melvoridle.com/w/Offline_Progression , https://wiki.melvoridle.com/w/Summoning
  - Township discussion: https://steamcommunity.com/app/1267910/discussions/0/3552805589771625333
  - Melvor Idle 2 announcement: https://www.gamingonlinux.com/2025/04/popular-idle-game-melvor-idle-is-getting-a-sequel-with-melvor-idle-2-bringing-some-huge-new-features/
- IdleOn pay-to-win thread: https://steamcommunity.com/app/1476970/discussions/0/691998647175359656/
- WalkScape wiki: https://wiki.walkscape.app/wiki/Core_Mechanics
- Milky Way Idle action queue: https://milkywayidle.wiki.gg/wiki/Action_Queue
- Idle Clans wiki: https://idleclans.wiki/w/index.php/Clan
- Increlution / Magic Research 2 reviews:
  - https://playwanderer.online/game-reviews/increlution
  - https://playwanderer.online/game-reviews/magic-research-2
- Gnorp Apologue sales breakdown (GameDiscoverCo): https://newsletter.gamediscover.co/p/how-this-solo-dev-incremental-game
- Clicker Heroes 2 dropping free-to-play (PC Gamer): https://www.pcgamer.com/clicker-heroes-2-drops-free-to-play-model-over-developers-ethical-concerns/
- Top incremental games, June 2026: https://www.topincrementalgames.com/guides/top-10-incremental-idle-games-june-2026
- Cultist Simulator:
  - Store page: https://store.steampowered.com/app/718670/Cultist_Simulator/
  - Developer interview (MCV/UK): https://mcvuk.com/development-news/when-we-made-cultist-simulator/
- Book of Hours: https://store.steampowered.com/app/1028310/BOOK_OF_HOURS/
- Magic Research 2: https://store.steampowered.com/app/2864890/Magic_Research_2/
- Idle Iktah: https://store.steampowered.com/app/3298520/Idle_Iktah/
- Theory of Magic classes: https://theoryofmagic.miraheze.org/wiki/Classes
- Kittens Game religion tab: https://wiki.kittensgame.com/en/game-tabs/religion
- Realm Grinder factions: https://realm-grinder.fandom.com/wiki/Factions
- Rusty's Retirement: https://en.wikipedia.org/wiki/Rusty's_Retirement
- Cast n Chill: https://store.steampowered.com/app/3483740/Cast_n_Chill/
- Games like Melvor comparison (Tideward): https://tideward.app/games-like-melvor-idle/
