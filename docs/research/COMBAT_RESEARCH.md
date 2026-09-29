# Combat in idle games (research note, 2026-09-29)

A dated snapshot. **Decided (2026-09-29, CONCEPT's decision log):** losing costs only the supplies spent and that foe's loot; offline fights only when a readiness tag says Safe (a tag worked out from the chances replaced the forecast recommended here, so fights keep some surprise); the story may ask for combat, but announced; a first taste in the cellar after the Kindling, combat in full in Chapter II. The rest is being designed. This note feeds the pitch revision in [CONCEPT.md](../CONCEPT.md) and the combat design, [COMBAT.md](../COMBAT.md). What the designer has already said (before this research): auto-combat after preparing a loadout, you can lose (HP, healing with items, recovery), offline fights against weaker foes, combat takes the action slot, more action slots later, mid-fight switching only for min-maxing and bosses.

## Method
- Eight researchers (Sonnet 5.5) each searched one area on the web (Steam reviews and discussions, wikis, dev notes, folklore sources), then one (Opus 5.5) combined them. The source reports:
- [Melvor Idle combat](combat_research/melvor.md)
- [Idle MMO-likes and AFK combat](combat_research/mmo-likes.md)
- [Prep-then-watch depth](combat_research/prep-watch.md)
- [Incremental and active-idle RPGs](combat_research/incremental-rpg.md)
- [Why people like or avoid combat in idle games](combat_research/psychology.md)
- [Losing, HP and healing, offline combat](combat_research/loss-offline.md)
- [Bosses, gates, gear tiers and parallel actions](combat_research/bosses-gear.md)
- [Slavic folklore bestiary and apotropaic methods](combat_research/folklore.md)
- Reddit was not reachable, and the Melvor wiki refused direct fetches, so many claims rest on Steam threads and search snippets. Treat the findings as directional.
- Spot-checks on 2026-09-29: Idle Clans' auto-eat costs 100,000 gold (confirmed on its wiki); the upiór's poppy seeds, iron and knots to untangle (confirmed on Wikipedia); Milky Way Idle's 150-second respawn was **not** on its wiki's combat page.

## Summary

1. **Combat is where idle games most often break their own promise.** It only works when it can run unattended. Melvor players complain that early combat is "half idle", and late bosses force active play (several Steam threads, moderate evidence).
2. **Prep, then auto-fight, is the standard model.** Melvor, Milky Way Idle (MWI), Idle Clans, NGU Idle, Unnamed Space Idle and Trimps all work this way. Setup is the decision and the fight runs itself (strong pattern, many games).
3. **The most-cited pain point is deaths the numbers did not predict.** In Melvor, stuns, damage-reduction loss, multi-hit attacks and HP afflictions get around the "safe" threshold. Players accept risk they can compute and resent hidden risk. Players built outside tools (a Combat Simulator mod, a "Can I Idle" calculator) to answer "is this safe?".
4. **Losing works best when it costs supplies, not permanent things.** Melvor's random equipment loss is the most criticised part of its combat. NGU Idle's Safe Zone (no penalty), MWI's respawn and Loop Hero's smaller loot share are softer models.
5. **Auto-heal should not be a late paywall.** Melvor's Auto Eat costs 1,000,000 GP and Idle Clans' costs 100,000 gold. Until you buy it, combat is a babysitting chore. Ritual Idle can give it early.
6. **Choices must not feel cosmetic, and must not be decided by luck.** Loop Hero critics say it "plays for you". Four games (Backpack Battles, Super Auto Pets, Despot's Game, Dungeon Clawler) draw luck complaints. Only the second half of this is a hard rule for you, since you ban RNG failure.
7. **Re-doing the same setup is a real chore.** Idle Champions reviewers complain about re-optimising teams. Soda Dungeon added a preset loadout to fix that. Named saved loadouts are a must.
8. **Bosses work best as gates with a clear "prepare better" answer.** NGU Titans, Melvor dungeons and Magic Research bosses do this. Long boss ladders with no unlock feel like filler. Owning gear you cannot equip because of a hidden gate annoys people.
9. **Extra action slots are contested.** Melvor's developers reject two actions at once, and players keep asking. IdleOn allows one active character plus passive AFK ones, and its developers say that will not change. Queues (Increlution) and saved loadouts are a lower-risk alternative.
10. **Slavic folklore fits this design well.** Nearly every creature comes with a specific counter (poppy seeds, iron or a sickle, salt, wormwood, red thread, fire and candles). Many enemies are appeased, occupied or outwitted rather than killed.
11. **Evidence is mostly Steam threads, wikis and search snippets.** No Reddit threads were retrievable, and many claims are single anecdotes. The findings are directional.
12. **Open risk:** nobody showed whether your audience wants combat at all. Skilling-first Melvor players resent combat roadblocks, so combat should feel optional-friendly and be tested.

## What draws players to combat in idle games (ranked by evidence strength)

1. **Set up once, then leave (strong).** MWI, Melvor, Idle Clans and NGU Idle players praise combat that runs unattended once the loadout is right. Melvor players say they can leave a day of farming after getting auto-eat and food.
2. **Prep as a puzzle (strong).** Matching gear to enemy type, tuning healing thresholds and testing tiers in a simulator are what players discuss and enjoy. Unnamed Space Idle players share sector-specific setups. Backpack Battles is praised for unlimited arranging time.
3. **Bosses as goals (moderate).** A boss that sends you back to prepare feels earned. Magic Research is described as "mostly idle until you hit a boss" and praised for it. NGU Titans unlock features.
4. **Choosing between active and idle (moderate).** Melvor posters describe a ramp from active to idle. NGU rewards active play with speed, but auto and offline kills pay the same drops (one thread, anecdotal).
5. **Feeding the skilling economy (moderate).** Melvor gear comes from smithing. Idle Clans advertises brewing potions and smithing before fights. I found no direct player quotes praising this.
6. **Self-imposed challenges and small goals (weak, anecdotal).** MWI's "IronCow" and "no gear except from combat" runs, and reviewers who like small grinding goals.
7. **Retreating early as a smart choice (weak).** Loop Hero's "dont be a hero" thread.

## What drives them away (ranked, with the games where it happened)

1. **Combat that needs babysitting (Melvor, Idle Looter).** A 600-hour player complained about pressing med kits. Hard bosses force manual eating. Melvor's hardest dungeon reportedly gives 0 deaths/hr by hand but about 1.24 deaths/hr idling (one thread).
2. **Deaths from hidden mechanics (Melvor).** One player came back from offline combat to find a stun raising damage taken by 30%. Threads about deaths with auto-eat on cite multi-attack enemies, afflictions and stuns.
3. **Punishing death loss (Melvor).** A random equipped item is lost. A "No Death Penalty" mod exists. Defenders call it "part of the gameplay". Idle Clans forfeits unclaimed loot on death.
4. **Supplies running out (Idle Clans, MWI).** Potions run out within minutes, forcing a manual restock. MWI's auto-combat AI reportedly spams a useless spell and burns mana food (single thread).
5. **Choices that feel meaningless (Loop Hero, Soda Dungeon).** Critics say the game "plays for you". Soda Dungeon combat is called shallow and repetitive.
6. **Luck deciding outcomes (Backpack Battles, Super Auto Pets, Despot's Game, Dungeon Clawler).** Good builds lose through no fault of the player.
7. **Slow grind and walls (Melvor, Idle Champions, Idle Slayer).** Combat levels take months. Idle Champions walls are said to push players to grind or pay. Idle Slayer's armory drops are called an "RNG slog".
8. **Hidden or opaque math (IdleOn).** Players suspect hidden multipliers behind zero-drop AFK stretches. AFK loot is lost when inventories are full (search summary only).
9. **Gear locked or made obsolete (Melvor).** One player spent three weeks farming an item they could not equip. Another said DLC crafting made their hard-earned ultimate weapon obsolete (each one thread).
10. **Combat gating content skilling players want (Melvor, weak, two anecdotes).**
11. **Dead time and zero interaction (Brighter Shores, moderate).** Its first combat patch added food and removed the automatic full heal.
12. **Setup friction and UI bloat (Idle Champions, IdleOn).**

## Patterns that work

| Pattern | Examples | Evidence | Fit with Ritual Idle rules |
|---|---|---|---|
| **Prep, then auto-fight until you stop** | MWI, Melvor, Idle Clans, Unnamed Space Idle | Strong | Matches your core. |
| **Visible enemy types with matching counters** | Melvor's triangle, MWI resistances, Unnamed Space Idle sectors | Moderate to strong | Fits the folklore well. Weaknesses are shown or learned via the Grimoire. |
| **A "can I do this?" preview (simulator, forecast)** | Melvor Combat Simulator mod, MWI wiki simulator | Strong demand | Fits the "no hidden risk" idea. Build it in. |
| **Auto-heal as a threshold rule** | Melvor Auto Eat, Idle Clans | Strong | Fits if early and not a paywall. |
| **Named saved loadouts** | NGU Idle, Soda Dungeon preset | Moderate | Fits the "no chores" rule. |
| **Bosses as gates that unlock something** | NGU Titans, Melvor dungeons | Moderate | Fits. Every boss must open something, and the requirement must be shown up front. |
| **Active play as an accelerator, not a requirement** | NGU Idle | Moderate | Fits if attended play only speeds things up and offline pays the same drops. |
| **Soft or no-loss defeat** | NGU Safe Zone, MWI respawn, Loop Hero retreat | Moderate | Fits "no RNG failure punishing the player". |
| **Risk/reward toggles inside a simple system** | NGU Beast Mode (+40% power, +300% damage taken) | Single source | Fits as an optional min-max layer for bosses. |
| **Stacking bonuses over gear replacement** | IdleOn stamps, cards, alchemy | Single thread | Fits and avoids obsolescence. |
| **Synergy from a few readable pairings** | Loop Hero, Backpack Battles | Moderate | Fits the Grimoire discovery model. |

## Traps to avoid

| Trap | Where seen | How Ritual Idle avoids it |
|---|---|---|
| Hidden damage beyond the displayed max hit | Melvor | Every foe shows a public worst hit that includes special attacks, and status effects are named on the card. |
| Auto-heal locked behind a big purchase | Melvor, Idle Clans | Give a simple heal rule at the start and upgrade it later. |
| Random gear loss on death | Melvor | Defeat costs spent supplies and the fight's unbanked loot, nothing permanent. |
| Opaque auto-combat AI wasting consumables | MWI (one thread) | Use a fixed, readable priority list the player can reorder. |
| Re-doing setup every visit | Idle Champions | Remember the last loadout per foe or place, with named presets and a "same as last time" button. |
| A best-in-slot that solves everything | Melvor potions, Despot's Game, Super Auto Pets | Each foe family has a distinct best answer, and wrong wards slow you down rather than fail you. |
| Luck-based builds | Four games | Wards are crafted deliberately, not rolled from a random shop. |
| Long boss ladders with no unlocks | NGU (301 bosses) | Few bosses, each opening something. |
| Accidentally triggered bosses with big losses | Loop Hero | Boss attempts are opt-in with a readiness readout. |
| Self-healing tank bosses that stall auto-combat | Melvor (moderate) | Bosses are prep puzzles, not endurance checks. |
| Owning gear you cannot equip | Melvor | Show the gate at the recipe, before materials are spent. |
| Full inventory silently losing loot | IdleOn | Pause with a message rather than discarding. |
| Hidden multipliers | IdleOn | Show kill rate, damage taken and loot per hour with a breakdown. |
| Combat as a roadblock for skilling players | Melvor (weak) | Combat gates only combat content, and combat drops supplement skilling inputs. |
| Two automated loops fighting over one resource | Magic Research 2 poster | Check this when extra action slots arrive. |

## Losing, healing and offline combat: options compared

| Approach | Example | Upside | Downside | Fit |
|---|---|---|---|---|
| Lose a random equipped item | Melvor | Real stakes | Most-criticised feature, and late-game loss stings | Bad. Breaks "no RNG failure". |
| Character deleted | Melvor Hardcore | Extreme opt-in challenge | Not for a general audience | Only as a rare optional challenge, if at all. |
| Forfeit unclaimed loot | Idle Clans | Simple | Feels harsh, and it makes deaths costly | Partial. Could apply to the current fight's loot only. |
| Timed respawn at full HP | MWI (150 s, not confirmed on its wiki) | Simple | A real-time wait, and too many deaths make a tier unprofitable | Bad. It is a real-time wait. |
| No penalty, return to safe zone | NGU Titans | Safest | Little meaning to losing | Good for bosses. |
| Retreat with a smaller share of loot | Loop Hero | Makes retreat a smart choice | Needs explaining | Good. |
| Survivability scales output | IdleOn | No cliff | Opaque in IdleOn | Good only if the rate is shown openly. |
| Defeat drains the loadout (candles burned, salt spent) and ends the fight | Proposed | Meaningful, nothing permanent | Needs balance | Best fit. |
| Auto-retreat at a set HP line or when supplies run low | Proposed, from NGU Safe Zone and several suggestions | Safe offline, and the player sees the rule | Fights end early if set badly | Best fit for offline. |
| Offline full simulation on the real rules | Melvor | Consistent with online play | Costs computing time on long absences | Fits, since `advance` already runs offline. Use coarse steps with seeded randomness. |
| Offline "safe foes only" | Proposed | No surprise deaths | Limits the generosity | Good, combined with a preview. |

Offline caps seen: Melvor 24 hours (raised from 12 after feedback, though sources also say 18, so the number is uncertain), Idle Clans 12 hours (24 with an upgrade), MWI about 10 hours (upgradable). Melvor offline combat is opt-in, because you can die. Nobody reported an "expected value vs full simulation" debate.

## Prep-first depth: how to make a loadout "simple yet deep"

Sources and folklore point to the same recipe:

1. **Few slots, real trade-offs.** Three to five slots such as a ward (salt, iron sigil), a light (candle), an herb or offering, and a charm. Many slots with marginal bonuses feel like data entry.
2. **Depth from matching, not stat math.** Each enemy family has a weakness, so the loadout is a small puzzle. The Slavic sources give natural pairs: poppy against the risen dead, wormwood against water spirits, salt water and iron against night spirits.
3. **Pairing bonuses in a few readable recipes.** For example candle plus salt in one ward. These are learnable through the Grimoire, like Loop Hero's synergies.
4. **Visible, learnable enemy info.** Show weakness and worst hit up front, or reveal through the Grimoire. Avoid Backpack Battles' hidden-opponent frustration.
5. **A preview before starting.** Show time per kill, damage per kill, how long supplies last, and a Safe / Risky / Unsafe tag. This is the simulator Melvor players had to build themselves.
6. **One clear healing rule.** "Use this herb below X% HP" as a loadout setting. Show what runs out first.
7. **Mild penalty for wrong choices, mild bonus for right ones.** Never a cliff.
8. **Rotation stops solved builds.** Different zones resist different goods, and each ward slot spends a consumable, so the best set is not free.
9. **Presets and "same as last time."** They keep depth from becoming a chore.
10. **Plain-language reasons.** A short combat log explains why a fight went as it did (a Magic Research 2 poster said spells felt like they "don't really matter").

## Bosses, gear and extra action slots

**Bosses**
- Make each boss a named prep puzzle with a shown weakness, opt-in, and tied to a real unlock (a recipe, place, action or Rite option).
- A boss must be winnable on auto with good prep. Mid-fight switching and manual actions only shorten the time or improve rewards, the reverse of Melvor's hardest dungeon.
- A loss costs only the supplies spent, as with NGU Titans. Each wall needs a crafting answer that the Grimoire can hint at.
- Idle-ability rewards after a boss chain (Melvor pets) are liked, but they make prep-light play easier later.
- No source compared timed and untimed bosses, so that question is open.

**Gear**
- Craft the gear from skilling goods, and let bosses drop rare ingredients rather than finished items. Drop-only gear drew an "RNG slog" complaint (Idle Slayer, weak).
- Prefer upgrade paths and stacking bonuses over replacement, since replacement drew complaints in Melvor and stacking drew praise in IdleOn (each one thread).
- Show the gate at the recipe.
- Keep few gear slots and no manual re-equipping per fight.

**Extra action slots**
- Melvor's developers hold firm on one active action, and players keep asking. IdleOn keeps one active character plus passive AFK ones, and the developer says that is permanent.
- Safest route for you: one active action, followers as passive helpers who need no managing, plus queues and saved loadouts. If you do allow a second loop, watch for both loops competing for one resource (the Magic Research 2 mana problem).
- IdleOn's approach of AFK gains often matching or beating active gains fits "idle still progresses". The AFK gain cap (around 85% of active, per the IdleOn wiki search summary) is a useful reference for the size of an attended-play bonus.

## Folklore bestiary for Ritual Idle

Reliability of folklore: the Drawsko cemetery archaeology (sickles, stones, coins) is scholarly. Wikipedia entries are moderate. Many "Slavic lore" sites are popular and repeat each other (weak).

| Creature | Where | Weakness / counter | Mechanic idea |
|---|---|---|---|
| Upiór (risen corpse) | Graveyard | Poppy seeds (it counts them), sickle or iron, salt, stones and a coin in the grave | Poppy ward makes it count and skip or delay attacks. Sickle sigil gives damage. |
| Strzyga (double-souled undead) | Graveyard, house | Poppy in a cross at the corners, bells, a multi-step burial counter | A multi-step boss with a named counter for each step. |
| Poroniec (from a stillborn child) | Threshold, house | Burial under the threshold turns it into a house guardian (kłobuk) | A one-off story unlock: your rite decides whether it becomes a foe or a guardian. |
| Rusalka (drowned girl) | Water, fields, Green Week | Wormwood, iron pins (popular sources only) | A seasonal zone or modifier the player enters by choice. |
| Utopiec / topielec (drowned soul) | Still water, swamp | Lore gave no counters | Good early or offline foe once you have a plain counter. |
| Vodník / vodyanoy | Ponds, mill | His wet coat-tail gives him away | A Grimoire "tell". Learn how to recognise him. |
| Domovoi / kikimora | House | Offerings and tidiness, not killing | Feed rather than banish. A neglected house makes tougher intruders. |
| Bannik / ovinnik | Bathhouse, barn | Offerings (pancakes, a rooster, popular sources only) | A place-bound appease foe. |
| Zmora / nocnica (nightmare) | Bedroom, night | Salt water, sharp iron, herb smoke, holy water, red ribbon | Easy, fixed counters make it a good offline foe. |
| Południca (noon witch) | Fields at midday | Keep talking, answer her riddles, rest at midday | A boss you answer, not fight. Mugwort and wormwood are unconfirmed. |
| Leshy | Forest | Clothes worn inside out, shoes on opposite feet (weak) | A misdirection puzzle, where a wrong choice makes you lose your way. |
| Likho (misfortune) | Anywhere | Pass it on with a gift, and greed re-catches you | A curse foe with a cleansing or redirect mechanic. |
| Dziady (ancestor dead) | Spring and autumn eve | Food, drink, open doors, lit candles, taboos on noise and sewing | Allies to feed rather than foes. Feeding them could give buffs and tie into the Rite. |

The Christian layer (crosses, holy water, church bells, a "Jesus" paper) can be re-skinned as neutral ritual items: salt, candles, bells and herbs cover the same ground.

## Open questions for the design doc

1. **What happens on defeat?**
   Options: (a) lose the fight's unbanked loot only; (b) lose the loot plus a few consumables; (c) no loss.
   Recommendation: (b), with the loadout's burned candles and spent salt as the cost, plus a clear summary. Nothing permanent.

2. **Is auto-heal available from the start?**
   Options: early basic rule with later upgrades; a shop purchase like Melvor.
   Recommendation: early basic rule (for example "use a poultice below X%"), with later upgrades for smarter conditions. It stops the "half idle" complaint and keeps the first playthrough active in a good way.

3. **What is the offline rule?**
   Options: same engine run in coarse steps; expected-value estimate; safe foes only.
   Recommendation: the same engine in coarse seeded steps, with auto-retreat at the player's HP line or when supplies run low, and a report saying why. Show a Safe / Risky / Unsafe tag, and require Safe to run offline.

4. **How much is shown before a fight?**
   Options: bare numbers; a full preview with a forecast.
   Recommendation: a forecast card (worst hit, time per kill, damage per kill, supplies last), with special attacks named and included.

5. **How does the "active first playthrough" work without breaking the idle promise?**
   Options: mid-fight taps; front-loaded prep; a small attended bonus.
   Recommendation: front-loaded prep as the active part, plus an optional small "attended" bonus that only speeds things up and never gates content. Test whether players skip combat.

6. **Which mid-fight actions exist at bosses?**
   Options: none; a few risk/reward toggles (light a candle for more damage but take more harm); manual eating.
   Recommendation: a few toggles that only shorten time or improve rewards. A boss must be beatable on auto with prep.

7. **How many loadout slots?**
   Options: 3, 4 or 5.
   Recommendation: start at 4 (ward, light, herb or offering, charm), with named presets and "same as last time." Adding more slots later is easier than removing them.

8. **Are the weaknesses known or discovered?**
   Options: shown upfront; revealed through the Grimoire; a mix.
   Recommendation: a mix. The family weakness is discoverable, and the worst hit is always shown.

9. **What is the wrong-ward penalty?**
   Options: none; mild slowdown; hard block.
   Recommendation: a mild slowdown and a mild bonus for the right ward. No hard blocks.

10. **How do bosses unlock things?**
   Options: unlock recipes, places or Rite options; unlock gear only.
   Recommendation: each boss opens one clear thing, shown at the boss's card and at the recipe it gates. Keep boss count small.

11. **Should combat be optional for skilling-first players?**
   Options: combat gates only combat content; combat gates Chapter progress.
   Recommendation: keep main Chapter progress reachable without combat, or make it a clearly labelled choice. This rests on weak evidence, so ask playtesters.

12. **Do you allow extra action slots?**
   Options: none; followers as passive helpers; a queue; true parallel actions.
   Recommendation: followers as passive helpers and queues, not parallel actions. Test before adding a second active loop.

13. **Do combat supplies drain the skilling economy?**
   Options: light sinks; heavy sinks.
   Recommendation: modest sinks, checked in `npm run pacing`, so gathering does not become a chore.

14. **Are there seasonal or place modifiers?**
   Options: none; zones the player enters by choice.
   Recommendation: zones or phases chosen by the player (Green Week, midday, Dziady), never wall-clock gates.

15. **Do you add optional self-challenges?**
   Options: none; toggles such as "no herbs" or "bare-handed rite".
   Recommendation: a few cosmetic toggles. They are cheap and players invent them anyway (one anecdote).

Also remember the project rules: new combat words (ward, wound, banish and so on) go in `src/content/glossary.ts`, and choice text must not name systems the player has not opened yet.

## Evidence quality

- **Strong:** the prep-then-auto structure (wiki pages and many threads), Melvor's auto-eat rule and its hidden exceptions (repeated across threads), the archaeology of the Drawsko graves, and the existence of third-party simulators.
- **Moderate:** the "idle contract" complaint (several Melvor threads plus one Idle Looter review), the RNG complaint (four games, though each is one thread), the setup-friction complaint (Idle Champions, mostly search summaries), and NGU Idle's manual-versus-idle gap.
- **Thin or anecdotal:** MWI's spell-spam AI, IdleOn's hidden multipliers, NGU's auto-kill drops, boss deaths per hour on Melvor's hardest dungeon, gear obsolescence, skilling-first players resenting combat, the IdleOn survivability stat, Nodebuster, Trimps and Soda Dungeon (only reviews or one guide).
- **Caveats:** No Reddit threads were retrievable. Melvor wiki fetches returned 403, so wiki claims come from search snippets. Many sources were search-result summaries and not fully read. Melvor offline caps conflict across sources (12, 18, 24 hours). One report says NGU Titans are easier manually, and another that offline pays the same, which is consistent but from a single thread each.
- **Gaps:** no timed versus untimed boss evidence, no retreat mechanics for Clicker Heroes, Idle Champions, Trimps or Soda Dungeon, no OSRS opinion on AFK combat, nothing on expected value versus full simulation, and no evidence on whether the target audience wants combat at all.
- **Folklore:** solid where scholarly or on Wikipedia, weak for the wormwood, iron, fern tea, rooster and "Jesus" paper claims from popular sites. Check these before naming them in game text.

## Sources

**Melvor Idle**
- https://wiki.melvoridle.com/w/Combat (snippet only)
- https://wiki.melvoridle.com/w/FAQ (snippet only)
- https://wiki.melvoridle.com/w/Slayer (snippet only)
- https://wiki.melvoridle.com/w/Hardcore (snippet only)
- https://wiki.melvoridle.com/w/Game_Mode (snippet only)
- https://wiki.melvoridle.com/w/Offline_Progression (snippet only)
- https://wiki.melvoridle.com/w/Changelog (snippet only)
- https://wiki.melvoridle.com/w/Scripting_and_Extensions/Combat_Simulator (snippet only)
- https://wiki.melvoridle.com/w/Throne_of_the_Herald/Guide
- https://github.com/mythridium/combat-simulator (snippet only)
- https://mod.io/g/melvoridle/m/no-death-penalty (snippet only)
- https://mod.io/g/melvoridle/m/multitasking
- https://steamcommunity.com/app/1267910/discussions/0/561358128180893038
- https://steamcommunity.com/app/1267910/discussions/0/591762563949134719
- https://steamcommunity.com/app/1267910/discussions/0/707749927473812598/
- https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/
- https://steamcommunity.com/app/1267910/discussions/0/3388420307315035865
- https://steamcommunity.com/app/1267910/discussions/0/3120424524435242931/
- https://steamcommunity.com/app/1267910/discussions/0/3416559828459728016
- https://steamcommunity.com/app/1267910/discussions/0/3460471649931718274/
- https://steamcommunity.com/app/1267910/discussions/0/4665175132461478006/
- https://steamcommunity.com/app/1267910/discussions/0/6678353521954382240/ (snippet only)
- https://steamcommunity.com/app/1267910/discussions/0/570371033831351972/
- https://steamcommunity.com/app/1267910/discussions/0/3735205021140855117/?l=english
- https://steamcommunity.com/app/1267910/discussions/0/3487500856965647747/
- https://steamcommunity.com/app/1267910/discussions/0/4917340730756584239/
- https://steamcommunity.com/app/1267910/discussions/0/591783706467828626/
- https://steamcommunity.com/app/1267910/discussions/0/677329263114868117/
- https://steamcommunity.com/app/1267910/discussions/0/3882723820583171054/
- https://steamcommunity.com/app/1267910/discussions/0/3823048293516778888
- https://steamcommunity.com/app/1267910/discussions/0/3882723164279193053
- https://steamcommunity.com/app/1267910/discussions/0/3811785047377336188
- https://steamcommunity.com/app/1267910/discussions/0/3811784760595159250/
- https://steamcommunity.com/app/1267910/discussions/0/3201491842013353593
- https://steamcommunity.com/app/1267910/discussions/0/3552805589781844277/
- https://steamcommunity.com/app/1267910/discussions/0/3764482197525821795 (snippet only)
- https://steamcommunity.com/app/1267910/discussions/0/6006138415314612472/ (snippet only)
- https://steamcommunity.com/app/1267910/discussions/0/7004880943562377318/
- https://steamcommunity.com/id/Razorflamekun/recommended/2055140 (snippet only)
- https://steamcommunity.com/app/1267910/negativereviews/?l=german&browsefilter=toprated&snr=1_5_100010_
- https://steambase.io/games/melvor-idle/reviews (snippet only)
- https://earlyguides.com/melvor-idle/weapons
- https://shapes.inc/fandom/melvor-idle/items-and-equipment

**Milky Way Idle**
- https://milkywayidle.wiki.gg/wiki/Milkyway_Idle_Beginner_Guide
- https://milkywayidle.wiki.gg/wiki/Combat
- https://milkywayidle.wiki.gg/wiki/Food
- https://milkywayidle.wiki.gg/wiki/HP (snippet only)
- https://steamcommunity.com/app/3224420/discussions/0/600778060484086922/
- https://steamcommunity.com/sharedfiles/filedetails/?id=3440009638
- https://store.steampowered.com/app/3224420/Milky_Way_Idle/ (snippet only)

**Idle Clans**
- https://idleclans.wiki/w/index.php/Auto_eating
- https://idleclans.wiki/w/index.php/Combat (snippet only)
- https://steamcommunity.com/app/2103530/discussions/0/592890202622562309/
- https://steamcommunity.com/app/2103530/reviews/ (snippet only)
- https://minireview.io/role-playing/idle-clans (snippet only)
- https://store.steampowered.com/app/2103530/Idle_Clans/
- https://www.idleclans.com/idle-mmorpg/
- https://tideward.app/offline-progression/

**IdleOn**
- https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/
- https://steamcommunity.com/app/1476970/discussions/0/3073118388432603978/ (snippet only)
- https://steamcommunity.com/app/1476970/discussions/0/3764480479602641804/
- https://steamcommunity.com/app/1476970/discussions/0/5153834725007019951/?ctp=2
- https://idleon.wiki/wiki/Game_Mechanics_AFK (snippet only)
- https://playwanderer.online/game-reviews/legends-of-idleon
- https://gist.github.com/shnaps/161a370ed795e6141e0553eb30ddc8fa (snippet only)

**NGU Idle**
- https://sayolove.github.io/ngu-guide/en/mechanics/adventure/
- https://ngu-idle.fandom.com/wiki/Adventure_Mode
- https://steamcommunity.com/app/1147690/discussions/0/4349865446111093857/
- https://steamcommunity.com/app/1147690/discussions/0/1749024925637733504/ (snippet only)
- https://steamcommunity.com/app/1147690/discussions/0/3789254082586144744/ (snippet only)
- https://steamcommunity.com/app/1147690/discussions/0/3492004959421511945 (snippet only)
- https://steamcommunity.com/app/1147690/discussions/0/2967272318174411940
- https://steamcommunity.com/app/1147690/discussions/0/3038229940682896482/

**Other idle and incremental games**
- https://steamcommunity.com/app/627690/negativereviews/?p=1&browsefilter=toprated (Idle Champions)
- https://steamcommunity.com/app/627690/discussions/0/5015307809833051394 (snippet only)
- https://steamcommunity.com/app/627690/discussions/0/1642045003571394503 (snippet only)
- https://steamcommunity.com/app/627690/discussions/0/2525904966945851667 (snippet only)
- https://steamcommunity.com/app/2864890/discussions/0/6193092963016494944 (Magic Research 2)
- https://steamcommunity.com/app/2311680/discussions/0/3874843885717583371/ (Magic Research)
- https://www.incrementaldb.com/community/review/1665
- https://playwanderer.online/game-reviews/magic-research-2 (snippet only)
- https://expertgamereviews.com/magic-research-2-review-a-spellbinding-incremental-rpg-adventure/ (snippet only)
- https://store.steampowered.com/app/2864890/Magic_Research_2/ (snippet only)
- https://trimps.fandom.com/wiki/Guide:How_to_attempt_the_Spire (snippet only)
- https://trimps.fandom.com/wiki/Player_Guide_(Ells) (snippet only)
- https://github.com/genbtc/AutoTrimps (snippet only)
- https://store.steampowered.com/app/1877960/Trimps/ (snippet only)
- https://steamcommunity.com/app/1353300/negativereviews/ (Idle Slayer, snippet only)
- https://playwanderer.online/game-reviews/idle-looter
- https://playwanderer.online/game-reviews/increlution
- https://mancunion.com/2025/05/08/nodebuster-review-a-short-and-sweet-incremental-game/ (snippet only)
- https://steamcommunity.com/app/2776450/discussions/0/603021022325697319 (snippet only)
- https://firestone-idle-rpg.fandom.com/wiki/Gear (snippet only)

**Prep-heavy and auto-battle games**
- https://steamcommunity.com/app/1282730/discussions/0/4768721792061467717 (Loop Hero)
- https://steamcommunity.com/app/1282730/discussions/0/3112522283883159725
- https://steamcommunity.com/app/1282730/discussions/0/3114771547431043349 (snippet only)
- https://steamcommunity.com/app/1282730/discussions/0/3278066986681565260
- https://loophero.fandom.com/wiki/Synergy (snippet only)
- https://gigazine.net/gsc_news/en/20240310-backpack-battles/
- https://steamcommunity.com/app/2427700/discussions/0/4333103687427350925/ (Backpack Battles)
- https://steamcommunity.com/app/1714040/discussions/0/3272435584435760121/ (Super Auto Pets)
- https://steamcommunity.com/app/1227280/discussions/0/3812911928397734308/ (Despot's Game)
- https://store.steampowered.com/app/1227280/Despots_Game_Dystopian_Army_Builder/ (snippet only)
- https://steamcommunity.com/app/1227280/reviews/?browsefilter=toprated (snippet only)
- https://rpgranked.com/soda-dungeon-review/
- https://store.steampowered.com/app/2471100/Unnamed_Space_Idle/ (snippet only)
- https://steamcommunity.com/app/2471100/discussions/0/3812913565880031464/
- https://www.pcgamer.com/games/roguelike/dungeon-clawler-is-a-roguelike-claw-machine-game-which-is-just-as-frustrating-and-moreish-as-it-sounds/ (snippet only)

**OSRS, Brighter Shores and general design**
- https://oldschool.runescape.wiki/w/Nightmare_Zone/Strategies
- https://apptrigger.com/fastest-afk-way-max-combat-old-school-runescape (snippet only)
- https://steamcommunity.com/app/2791440/discussions/0/4628105320572437857/
- https://massivelyop.com/2024/11/06/first-impressions-brighter-shores-has-gobs-of-potential-buried-under-mountains-of-grind/ (snippet only)
- https://patchbot.io/games/brighter-shores/articles/1428-15-sep-2026-combat-improvements-update-1 (snippet only)
- https://www.mobilegamereport.com/articles/idle-rpg-build-decisions-why-they-matter-2026
- https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii
- https://gamedev.net/forums/topic/720012-design-discussion-reducing-inventory-stress-in-loot-based-rpgs/ (snippet only)
- https://itch.io/post/15511691

**Slavic folklore**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC4245124/
- https://en.wikipedia.org/wiki/Upi%C3%B3r
- https://en.wikipedia.org/wiki/Strzyga
- https://en.wikipedia.org/wiki/Poroniec
- https://en.wikipedia.org/wiki/Slavic_water_spirits
- https://en.wikipedia.org/wiki/Rusalka_Week
- https://en.wikipedia.org/wiki/Topielec
- https://en.wikipedia.org/wiki/Vodyanoy
- https://en.wikipedia.org/wiki/Domovoy
- https://en.wikipedia.org/wiki/Kikimora
- https://en.wikipedia.org/wiki/Poludnitsa
- https://en.wikipedia.org/wiki/Likho
- https://en.wikipedia.org/wiki/Dziady
- https://en.wikipedia.org/wiki/Dziady_(wandering_beggars)
- https://www.tandfonline.com/doi/full/10.1080/0015587X.2022.2088957 (abstract only)
- https://lamusdworski.wordpress.com/2015/10/28/polish-mythology-zmory/
- https://russianlife.com/the-russia-file/dont-cross-the-domovoy/
- https://darkslaviclore.com/myths/slavic-vampires
- https://claramacgauffin.substack.com/p/upiors-vampires-before-dracula
- https://urbanlegendsmysteryandmyth.com/2025/09/the-strzyga-terrifying-vampire-of.html
- https://let-me-in.fandom.com/wiki/Upi%C3%B3r
- https://slaviclore.com/the-rusalka-and-the-green-week-festival
- https://storycrossroads.org/2025/04/12/k-kikimora-and-domovoi-slavic-folklore/
- https://thewickedgriffin.com/polish-folklore/
- https://oldfolklore.com/leshy-the-guardian-spirit-of-the-forest/
- https://prettymarginal.com/vodnik-the-water-spirit-and-the-cult-of-water/
- https://yourrootsinpoland.com/dziady-supernatural-genealogy/
