# Idle MMO-likes and AFK combat (raw research report, 2026-09-29)

One of eight source reports behind [../COMBAT.md](../COMBAT.md), kept as written by the researcher. Unverified; see the evidence notes there.

## Summary
- Evidence was thinner than hoped. Reddit was not reachable through these tools. What I found comes from Steam threads, official wikis, patch notes, and a few review sites. Where a point rests on a search-tool paraphrase and not a page I read, I say so.
- **Prep then auto-fight is the standard model.** Milky Way Idle (MWI), Idle Clans, Melvor and OSRS Nightmare Zone (NMZ) all work this way. The player chooses gear, consumables and a target, then the game repeats until told to stop. Prep quality decides whether the session is safe and efficient.
- **Consumable sustain is the main lever, and the main complaint.** Supplies run out, or auto-eat thresholds fail against burst damage. Both games that use food (Idle Clans, Melvor) have visible player frustration here.
- **Losing is usually soft.** MWI respawns you after 150 s with full HP. Melvor makes offline combat opt-in because you can die. Idle Clans is harsher: death forfeits unclaimed loot. Wiki guidance says excessive deaths make a tier unprofitable.
- **Boredom comes from zero decisions and long waits.** Brighter Shores' combat drew "almost zero interaction" complaints. Its first combat patch added meaningful food and no auto full heal.
- **AFK culture rewards low attention but keeps a small chore.** NMZ gives about 20 minutes of AFK per restart. The player still flicks a prayer and restarts. This looks like a deliberate "check in" rhythm.
- **Cooldown-free auto abilities are easy to exploit badly.** A Steam poster says MWI's auto-combat will spam a zero-cooldown spell and burn mana food. This is a single anecdote.
- **Party play and self-imposed challenges are the long-term glue in MWI**, though I found no direct evidence on why people group.

## Findings

**1. Loadout and prep as the core loop**
- MWI: weapon, abilities, charm, and food and drink slots. You start with 1 food and 1 drink slot and get 3 of each at the Giant Pouch (total level 750). Drinks such as Coffee are combat buffs. Food has a cooldown so you cannot spam it. The wiki tells players to test tiers in the combat simulator before committing. Zone tiers T0-T5 add 25% monster stats per tier.
  Sources: https://milkywayidle.wiki.gg/wiki/Milkyway_Idle_Beginner_Guide, https://milkywayidle.wiki.gg/wiki/Combat. The food-cooldown claim comes from a search summary only. Strength: strong for the loadout structure, since it appears in wiki pages I read.
- Idle Clans: one potion set per combat style, plus swiftness and resurrection potions for bosses. Source: https://idleclans.wiki/w/index.php/Combat (search summary only). Strength: moderate.
- MWI charms redirect 70% of combat XP into a chosen skill. That makes the loadout a way to steer progression, not only power. Source: https://milkywayidle.wiki.gg/wiki/Combat. Strength: strong, from a wiki, but it is one game.

**2. Auto-eat and sustain**
- Idle Clans sells auto-eating as a 100,000 gold upgrade. Wiki advice is to set it around 80% before long sessions. Sources: https://idleclans.wiki/w/index.php/Auto_eating, https://idleclans.wiki/w/index.php/Auto_eating (threshold advice from search summary). Strength: moderate.
- Melvor: offline combat is off by default, and players say you can die offline without prep. Auto-eat is described as "ideally a must". Source: https://steamcommunity.com/app/1267910/discussions/0/3460471649931718274/. Strength: moderate, several posters in related threads.
- Melvor: auto-eat fails if one hit exceeds your threshold. Some enemies have several attacks, so players die with auto-eat on. Source: search summary of https://steamcommunity.com/app/1267910/discussions/0/6678353521954382240/ (not fetched). Strength: moderate.
- Idle Clans: players say potions run out within minutes, forcing a return to base to restock. Sources: https://minireview.io/role-playing/idle-clans, https://steamcommunity.com/app/2103530/reviews/. Both were search snippets, not read in full. Strength: moderate, repeated across the search results.
- Idle Clans forum: players simplify by carrying one food type, the one that heals the most. Source: https://steamcommunity.com/app/2103530/discussions/0/592890202622562309/. Strength: anecdote. It suggests item choice is mostly solved.

**3. Death and failure**
- MWI: death means an automatic respawn after 150 s with full HP and MP. In dungeons there is no respawn and the run fails. Guide text says excessive deaths reduce XP gains enough to make a tier unprofitable. Sources: https://milkywayidle.wiki.gg/wiki/HP (snippet), https://milkywayidle.wiki.gg/wiki/Milkyway_Idle_Beginner_Guide. Strength: strong.
- Idle Clans: death forfeits unclaimed loot and removes you from combat. Source: https://idleclans.wiki/w/index.php/Combat (snippet). Strength: moderate.
- Brighter Shores: the first combat update removed the automatic full heal after combat and added eating food to restore health. Source: https://patchbot.io/games/brighter-shores/articles/1428-15-sep-2026-combat-improvements-update-1 (snippet). Strength: single game, but the change is deliberate.

**4. Tuning problems and auto-combat behavior**
- A MWI Steam thread reports the AI "will chew your mana food and spam useless spells". It also reports a level 67 character losing to level 52 monsters because of gear and damage-type mismatch. Source: https://steamcommunity.com/app/3224420/discussions/0/600778060484086922/. Strength: one thread. It fits the wiki's advice to use the simulator.
- MWI has a combat triangle of damage types and resistances. Hit chance is accuracy^1.4 / (accuracy^1.4 + evasion^1.4). Source: https://milkywayidle.wiki.gg/wiki/Combat. Strength: strong.

**5. AFK culture in OSRS**
- NMZ is described as the most effective AFK combat method for over ten years, with roughly 100k-150k XP/hr depending on style. Absorption setups give about 20 minutes of AFK time. You then restart, flick Rapid Heal every 50-60 s and reset HP. The prayer version is active. Sources: https://oldschool.runescape.wiki/w/Nightmare_Zone/Strategies, https://apptrigger.com/fastest-afk-way-max-combat-old-school-runescape (snippet). Strength: strong on facts. I found no player opinion on whether it is fun, and the search did not surface it.
- I found no usable Reddit or forum evidence on OSRS AFK slayer or "afkable" sentiment. The search returned guides and news sites. Treat OSRS opinion as a gap.

**6. Engagement and boredom**
- Brighter Shores threads: "almost zero interaction during combat" and long waits between fights. Players want ability choice, and some want chill OSRS-like combat. Sources: https://steamcommunity.com/app/2791440/discussions/0/4628105320572437857/, https://massivelyop.com/2024/11/06/first-impressions-brighter-shores-has-gobs-of-potential-buried-under-mountains-of-grind/. Strength: moderate. Brighter Shores is a hybrid game, not a pure idle game.
- IdleOn: talents that boost AFK damage exist. One is "Attacks on Simmer", and there is a cap on how much active skills can boost AFK gains. Source: https://gist.github.com/shnaps/161a370ed795e6141e0553eb30ddc8fa (snippet). Strength: weak, since I didn't read it in full.
- IdleOn reviewer: praises how classes and skills interact, and criticizes UI bloat, the bookkeeping of many characters and inventories, and pay-gated power. Source: https://playwanderer.online/game-reviews/legends-of-idleon. Strength: one review. It supports the designer's stance against management chores.

**7. Party, solo and self-challenge**
- MWI: early players are advised not to group because XP is lower. A level malus of up to 90% applies to people far below party level. Dungeon back slots are untradeable and must be farmed per class. Sources: https://milkywayidle.wiki.gg/wiki/Milkyway_Idle_Beginner_Guide, https://milkywayidle.wiki.gg/wiki/Combat. Strength: moderate.
- MWI has players who add their own restrictions ("IronCow", NGIC: no gear from anywhere but combat). Source: https://steamcommunity.com/sharedfiles/filedetails/?id=3440009638. Strength: an anecdote, but it fits the designer's self-challenge goal.
- Steam reviews of MWI are called grindy but supportive. One reviewer says the goal is small grinding goals and chatting with other players. Source: https://store.steampowered.com/app/3224420/Milky_Way_Idle/ (snippet). Strength: anecdote.

## What players love
- Setting up once, then leaving: MWI's automatic repeat, and offline progress of up to 10 hours (upgradeable) per the search summary.
- Prep as a puzzle: a combat simulator, gear matched to enemy resistances, and drinks as buffs (MWI).
- AFK windows that give strong rewards for low attention (NMZ).
- Small, steady goals, with a social or self-imposed challenge layer on top (MWI reviews, NGIC).

## What players dislike / complaints
- Supplies running out mid-session, forcing a manual restock (Idle Clans).
- Auto-eat thresholds that fail against burst or multi-attack enemies (Melvor).
- Combat with almost no choice and dead time between fights (Brighter Shores).
- Auto-combat AI wasting resources (MWI's zero-cooldown spell spam).
- UI density and per-character bookkeeping (IdleOn).
- Pay-gated power (IdleOn companions).
- Deaths that punish so heavily that a tier becomes unprofitable (MWI guide).

## Ideas and lessons for Ritual Idle
All ideas are checked against the designer's rules: no real-time gating, no chores, no RNG failure punishment, generous offline progress, no pay-to-win.
1. **Make prep the game, and let it show its work.** Give a "ward check" preview before starting, in the spirit of MWI's combat simulator. It would show expected survival and drop rate for the chosen loadout. That turns tuning into a puzzle without spreadsheets, and it protects the offline player.
2. **Offer an "Until I stop" mode.** It should tell the player what will run out first: salt, candles or herbs. This addresses the restock complaint. Auto-stop cleanly when supplies drop below what one more fight needs, and never punish the player for it. Offline combat should stop on the same rule.
3. **Make death a soft setback, not a loss.** Options are a "the spirit drives you back" state: lose the current fight's unbanked loot, keep progression, and heal via items or regen. Avoid Idle Clans' full loot forfeit and MWI's respawn timer, which is real-time gating. Play with cheap, generous revival, such as a house ritual cost paid in items.
4. **Let the player set thresholds, but protect them from burst.** Melvor's failure mode is a threshold that one hit can jump. Have a "warded" buffer: HP the player cannot lose in one hit. Show enemy max hit in the loadout screen so the number is visible before the fight.
5. **Use spirit types as the combat triangle.** Restless dead weak to salt, poltergeists to iron or bells, drowned to fire, and so on. It gives a MWI-style matchup puzzle with theme, and the loadout screen can say what a chosen ward counters.
6. **Cap active bonuses on offline runs, and allow active play to add a bonus to it** (IdleOn's AFK-talent cap, NMZ's restart rhythm). The designer wants a fairly active first playthrough. A gentle "recently attended" bonus would reward active play without gating the idle path. I'd keep it small so idle stays viable.
7. **Give bosses their own prep.** Idle Clans and MWI both use boss-only consumables and untradeable drops. Use single-purpose boss counters like a sigil chosen against a named spirit, with mid-fight switching for min-maxers only.
8. **Beware auto-AI that wastes consumables.** The MWI complaint is a warning. Ritual Idle's auto-combat should use a fixed, readable priority list, which the player can reorder, instead of an opaque AI.
9. **Avoid a large number of parallel loadouts.** IdleOn shows the cost of managing many characters and inventories. Offer one loadout slot per activity type, saved and named, and unlock more later with followers.
10. **Add self-challenge as a toggle.** For example "bare-handed rite" or "no herbs". It costs almost nothing to build, and the NGIC guide suggests players invent these anyway. It is cosmetic and fits the no pay-to-win rule.

## Sources
- https://milkywayidle.wiki.gg/wiki/Milkyway_Idle_Beginner_Guide
- https://milkywayidle.wiki.gg/wiki/Combat
- https://milkywayidle.wiki.gg/wiki/Food
- https://milkywayidle.wiki.gg/wiki/HP (search snippet only)
- https://steamcommunity.com/app/3224420/discussions/0/600778060484086922/
- https://steamcommunity.com/sharedfiles/filedetails/?id=3440009638
- https://store.steampowered.com/app/3224420/Milky_Way_Idle/ (snippet only)
- https://idleclans.wiki/w/index.php/Auto_eating
- https://idleclans.wiki/w/index.php/Combat (snippet only)
- https://steamcommunity.com/app/2103530/discussions/0/592890202622562309/
- https://steamcommunity.com/app/2103530/reviews/ and https://minireview.io/role-playing/idle-clans (snippets only)
- https://steamcommunity.com/app/1267910/discussions/0/3460471649931718274/
- https://steamcommunity.com/app/1267910/discussions/0/6678353521954382240/ (snippet only)
- https://oldschool.runescape.wiki/w/Nightmare_Zone/Strategies
- https://apptrigger.com/fastest-afk-way-max-combat-old-school-runescape (snippet only)
- https://playwanderer.online/game-reviews/legends-of-idleon
- https://gist.github.com/shnaps/161a370ed795e6141e0553eb30ddc8fa (snippet only)
- https://steamcommunity.com/app/2791440/discussions/0/4628105320572437857/
- https://massivelyop.com/2024/11/06/first-impressions-brighter-shores-has-gobs-of-potential-buried-under-mountains-of-grind/ (snippet only)
- https://patchbot.io/games/brighter-shores/articles/1428-15-sep-2026-combat-improvements-update-1 (snippet only)

**Gaps:** No Reddit threads were retrievable. There was no usable OSRS opinion on AFK slayer or "afkable" methods, and no direct detail on Idle Clans offline auto-eat behavior or MWI's offline caps beyond search summaries.
