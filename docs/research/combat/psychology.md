# Why people like or avoid combat in idle games (raw research report, 2026-09-29)

One of eight source reports behind [../COMBAT.md](../COMBAT.md), kept as written by the researcher. Unverified; see the evidence notes there.

## Summary
- Evidence is thin. Reddit was not fetchable (searches surfaced no usable r/incremental_games threads), so almost everything comes from Melvor Idle and IdleOn Steam threads plus a few design articles. Most findings are single-thread anecdotes. Only two patterns recur across sources: the "idle contract" complaint and the "decisions must stay interesting" claim.
- The strongest complaint pattern is that combat breaks the "idle" promise when it needs babysitting. Melvor players report HP micromanagement and late-game bosses that force active play (multiple Steam threads).
- Offline or auto combat deaths are only tolerated when players can predict them. Melvor's "unexpected death" threads center on hidden damage modifiers. Predictability matters more than safety.
- Meaningful build choices are what keep idle RPG players, per one trade article. Combat that is only a bigger-number comparison is called forgettable ("automation alone" lasts about a week).
- Players want combat to be optional, or at least not blocking. Skilling-first players resent combat roadblocks that gate content they care about.
- Prep before a fight (gear, food and auto-eat thresholds, area choice) is what Melvor players actually discuss and enjoy tuning. That is the "prep, then auto" model.
- Inventory and loot management is a repeated pain in idle RPGs. IdleOn players lose AFK loot to full inventories.
- Opaque mechanics frustrate players (IdleOn AFK fighting). Transparent math is valued.

## Findings

### 1. The "idle contract": combat that needs babysitting
- A Melvor player with 600 hours complained combat isn't idle because they must keep pressing med kits to avoid dying. Replies: combat is "half idle" without auto-eat, and only late-game content truly demands active play. https://steamcommunity.com/app/1267910/discussions/0/561358128180893038/
- A 1,300-hour player said the "Into the Mist" dungeon boss (self-healing) reduced their enjoyment. Others argued high-end dungeons contradict the "Automation, Casual, Minimalist and Idler" store tags. They also feared the planned 120 combat expansion would push away idle-minded players. Some replied that prep and maxed stats make it manageable. https://steamcommunity.com/app/1267910/discussions/0/3416559828459728016
- A Melvor thread describes losing motivation to launch the game because certain bosses are boring to complete, and describes some bosses as forcing active play "not exactly fun". https://steamcommunity.com/app/1267910/discussions/0/3882723164279193053 (a "worth it?" thread; the boss remarks came via search summary, so treat as weak)
- Outside combat, a review of Idle Looter says its active-click bounties make it feel like "Active" Looter, breaking the genre's promise. https://playwanderer.online/game-reviews/idle-looter
- Strength: moderate. Multiple independent Melvor threads plus one review, but all one community.

### 2. Deaths: fine if legible, angry if hidden
- A Melvor player returned from offline combat to find their character dead. Cause: a "Sealing" stun effect raising damage taken by 30%. They asked for clear warnings on damage-boosting effects. Replies: auto-eat only triggers below a threshold, so a single big hit can kill. https://steamcommunity.com/app/1267910/discussions/0/3120424524435242931/
- Search-result summaries of other Melvor threads say deaths despite auto-eat come from multi-attack enemies, afflictions that lower max HP (so the threshold slips), and stun. https://steamcommunity.com/app/1267910/discussions/0/6678353521954382240/ (title "Auto Eat Useless?", not read in full)
- Strength: moderate. Consistent theme, few fully read threads.

### 3. Build depth and decisions as the retention engine
- A Mobile Game Report piece argues automation alone holds interest for about a week. It says decisions must stay interesting at 100 hours, and that bad build depth means "pick a hero because their number is bigger". https://www.mobilegamereport.com/articles/idle-rpg-build-decisions-why-they-matter-2026
- Melvor's own combat rework goals (per patch-note search summaries) were build diversity and moving away from "one weapon is BiS". https://wiki.melvoridle.com/w/Changelog (not fetched; from search summary)
- Strength: weak-to-moderate. One editorial plus one dev-stated goal; no direct player quotes.

### 4. Weapon and prep choices players actually discuss
- Melvor players debate combat style, auto-eat thresholds set above the highest hit, and armor mixing against enemy types. One player said the styles "feel about the same" and disliked magic because runes are time-intensive to craft. https://steamcommunity.com/app/1267910/discussions/0/3811784760595159250/
- Weapon choice threads center on matching stat bonuses to the target and checking idle survivability. https://steamcommunity.com/app/1267910/discussions/0/3201491842013353593
- Strength: moderate, but this is the discussion of a small set of players.

### 5. Inventory, loot and opaque AFK math
- IdleOn: players report AFK loot displayed in the AFK window differs from what they receive when the inventory fills up. Loot also drops on the ground. https://steamcommunity.com/app/1476970/discussions/0/3073118388432603978/ (from search summary, not fully read)
- IdleOn: a "deep dive" thread shows players cannot tell which stats or drop mechanics matter, and suspect hidden multipliers. https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/
- Search results for idle RPG gear complaints mention that manually re-equipping every piece "makes the game really unplayable" and that players want bounded inventories. Sources were itch.io and forum posts and were not read in full (https://gamedev.net/forums/topic/720012-design-discussion-reducing-inventory-stress-in-loot-based-rpgs/).
- Strength: moderate for loot loss and opacity, weak for gear bloat generally.

### 6. Skilling-first players and combat gating
- A Steam reviewer of Melvor's expansion said, as someone who does much more skilling than combat, it is "a pain" to clear so many roadblocks to enjoy later combat. https://steamcommunity.com/id/Razorflamekun/recommended/2055140
- A Melvor forum thread title suggests some players want a toggle for the combat expansion: "I Don't want Throne of the Herald! Can it be disabled?" (not read). https://steamcommunity.com/app/1267910/discussions/0/6006138415314612472/
- Strength: weak. Two anecdotes. I found no thread detailing why skilling-only players prefer it, so the "why" is inferred, not evidenced.

### 7. Walls and bosses as goals
- Idle Champions players talk about a "wall" and about stacking or swapping characters to break it (e.g. a Minotaur boss around area 250). https://steamcommunity.com/app/627690/discussions/0/2525904966945851667 (from search summary).
- Steam Endless World and other search snippets say players quit after repeated deaths to one boss, and that time-gates leave features "neither active nor idle." Not verified by reading.
- The Math of Idle Games (Part III) supports designing walls so progress continues through a slower path (e.g. prestige currency still accrues). https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii
- Strength: weak-to-moderate. Wall-as-goal is plausible and common, but I did not find explicit "I love boss walls" testimony.

## What players love
- Melvor's "prep then idle" arc: getting auto-eat and enough food, then idling even hard dungeons (weak-moderate; forum advice threads).
- Overleveling early content and progressing to a hands-off state (Melvor thread 561358128180893038).
- Choices that change outcomes (weapon versus enemy type, threshold tuning), per the build-diversity sources.
- Being able to break a wall by optimizing formation or gear rather than by waiting (Idle Champions threads).
- Mellow, "zen-like" idling (Melvor "worth it?" thread, weak).

## What players dislike / complaints
- Combat that requires clicking to heal or react, and endgame bosses that turn "idle" into active waiting (Melvor threads).
- Hidden damage modifiers causing offline deaths (Melvor unexpected-death thread).
- Self-healing or tanky bosses that feel like pure DPS checks or endurance tests ("over-tuned", "super tanky" in a Melvor thread).
- Active-click mid-game systems in an "idle" game (Idle Looter).
- Combat gating content that skilling-first players want.
- Inventory overflow losing AFK loot and opaque AFK formulas (IdleOn).
- Build depth that is only bigger numbers (Mobile Game Report).
- Not found: solid evidence on "obsolete old content" or explicit gear-bloat rants specific to combat idle games. I did not verify these.

## Ideas and lessons for Ritual Idle
1. **Make offline safe by design.** Offline combat should never end in a surprise death. Options: the player retreats automatically at a set HP floor (a visible "withdraw at X%" ward) and the session ends, with the report saying what happened. Loss should mean "the fight stopped and you keep partial loot," not a wipe. This fits "no RNG failure" and "generous offline."
2. **Show the danger before the fight.** Display a plain forecast ("this spirit hits for up to X, your ward holds Y") and flag any status that changes damage. Melvor's stun-multiplier surprise is the counter-example.
3. **Automate the healing, not the decision.** Auto-heal from a chosen consumable (herbs, salt) at a threshold is a prep choice, not a chore. Players value the threshold decision but resent manual clicking.
4. **Prep is the game.** Let the loadout (charms, sigils, candles, salt, herbs) matter against enemy types (spirit tags, weaknesses). This mirrors Melvor's enemy-type matching and the "decision that stays interesting at 100 hours" idea. Avoid one best-in-slot: make counters situational.
5. **Bosses as gates with a clear "prep to beat" answer.** Give each boss a readable requirement (e.g. needs a specific sigil, a salt ring quality) so a wall is solved by crafting, not by waiting. Provide a slower fallback route so a stuck player still progresses. Avoid self-heal endurance bosses that stall auto-combat.
6. **Keep it optional-friendly.** Skilling-first players resent combat roadblocks. Gate combat content behind combat, and make combat drops supplement (not replace) skilling inputs. Consider letting the boss unlocks be optional side-rewards for some of the chapter.
7. **Keep loot inventory light.** Consumables and materials as stacks, few gear slots, auto-compare and no manual re-equipping per fight. Cap loss: if the pack fills, pause with a message rather than silently discarding (the IdleOn issue).
8. **Be transparent about math.** Show kill rate, damage taken and loot per hour with a visible breakdown of modifiers, to avoid IdleOn's "hidden multiplier" suspicion.
9. **Low-stakes wins in the first session.** The "fairly active first playthrough" goal risks the idle-contract complaint. Keep active choices optional, front-loaded prep rather than mid-fight reaction, and reserve mid-fight switching for min-maxing and bosses as planned.
10. **Test a hypothesis I could not verify.** Whether the target audience actually wants combat at all is unproven. A cheap playtest question: did they skip combat, and why.

## Sources
Fetched and read (at least in summary):
- https://www.mobilegamereport.com/articles/idle-rpg-build-decisions-why-they-matter-2026
- https://steamcommunity.com/app/1267910/discussions/0/3811784760595159250/
- https://steamcommunity.com/app/1267910/discussions/0/3882723164279193053
- https://playwanderer.online/game-reviews/idle-looter
- https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii
- https://steamcommunity.com/app/1267910/discussions/0/561358128180893038/
- https://steamcommunity.com/app/1267910/discussions/0/3120424524435242931/
- https://steamcommunity.com/app/1267910/discussions/0/3416559828459728016
- https://steamcommunity.com/app/1267910/discussions/0/3201491842013353593
- https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/

Seen only as search-result summaries (not opened):
- https://steamcommunity.com/app/1267910/discussions/0/6678353521954382240/
- https://steamcommunity.com/app/1476970/discussions/0/3073118388432603978/
- https://steamcommunity.com/app/627690/discussions/0/2525904966945851667
- https://steamcommunity.com/id/Razorflamekun/recommended/2055140
- https://steamcommunity.com/app/1267910/discussions/0/6006138415314612472/
- https://wiki.melvoridle.com/w/Changelog
- https://gamedev.net/forums/topic/720012-design-discussion-reducing-inventory-stress-in-loot-based-rpgs/
