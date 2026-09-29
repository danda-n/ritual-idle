# Losing, HP and healing, offline combat (raw research report, 2026-09-29)

One of eight source reports behind [../COMBAT_RESEARCH.md](../COMBAT_RESEARCH.md), kept as written by the researcher. Unverified; see the evidence notes there.

## Summary
- Melvor Idle is the closest analogue to what the designer wants. It runs a full tick-by-tick offline simulation, including food use and death. Its penalty is losing one random equipped item. Gold is never lost, and a prayer can prevent the item loss. Players treat this as fair, but only once they can predict when they are safe.
- Melvor's auto-eat rule is that you are safe if your auto-eat threshold is above the monster's max hit and you have food. Most "unfair" deaths come from hidden exceptions: special attacks, stuns, damage-reduction (DR) shred and HP afflictions can break that guarantee.
- Players build or lean on external tools to answer "can I idle this?": a Combat Simulator mod and a "Can I Idle" calculator. The game itself doesn't answer clearly. Showing kill time, damage taken and supply run-time in-game is an open opportunity.
- Idle Clans and Milky Way Idle simulate offline on the server and cap it at 10-12 hours, extendable to 24. Melvor simulates on the device with a 24-hour cap (raised from 12 after feedback). Idle Clans sells auto-eat as a 100,000 gold upgrade, so it is gated by progression.
- NGU Idle's adventure mode shows the no-penalty end of the spectrum: losing to a Titan sends you to a Safe Zone with no penalty. IdleOn folds survival into output. Its "Survivability" stat (defence, food, health) scales AFK gains rather than killing you.
- One IdleOn thread shows what erodes trust: players suspect hidden multipliers and see wildly inconsistent AFK drops (144 statues in 10 hours versus 0). Undisclosed factors in offline combat feel worse than an explicit penalty.
- I found no usable primary evidence on Clicker Heroes, Soda Dungeon, Trimps or Idle Champions retreat mechanics, and no direct evidence on expected-value versus full-simulation debates. The main gap is that most of the evidence is Steam forum snippets and wikis, not deep Reddit threads.

## Findings

### 1. Death penalties: a spectrum
- **Melvor (equipment loss).** Dying loses one random equipment slot's item forever, unless Protect Item is active. Ammo and summoning tablets are forfeited as a whole stack. It is possible to lose nothing if the chosen slot is empty. Gold and food are not lost.
  - Sources: https://wiki.melvoridle.com/w/Combat (via search summary; the page returned 403 on direct fetch), https://steamcommunity.com/app/1267910/discussions/0/3388420307315035865, https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/
  - Strength: strong. Wiki plus multiple forum posts agree.
- **Melvor's mitigations.** The Protect Item prayer (level 26 Prayer) removes the loss. It costs 2 prayer points per enemy attack, or nothing with the Gold Diamond Ring. Hardcore mode permanently deletes the character on death, as an opt-in extreme.
  - Sources: https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/, https://wiki.melvoridle.com/w/FAQ
  - Strength: strong.
- **NGU Idle (no penalty).** Being defeated by a Titan sends you to the Safe Zone with no penalties.
  - Source: https://sayolove.github.io/ngu-guide/en/mechanics/adventure/
  - Strength: single source (a community guide). The guide says nothing on ordinary-enemy deaths.
- **IdleOn (soft penalty).** There is no hard death loss in what I found. Low survivability (defence, food and HP combined) lowers AFK gains instead.
  - Source: https://idleon.wiki/wiki/Game_Mechanics_AFK, via a search summary.
  - Strength: moderate. I only saw the search snippet, not the full page.
- **Player attitude to gear loss.** Players call it "part of the gameplay". Early-game gear is easily replaced, while late-game loss stings. Some advise exporting backups. A mod.io "No Death Penalty" mod exists, which suggests some players find it too harsh. The players who quoted "part of the gameplay" were defending it against save-scumming.
  - Sources: https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/, https://mod.io/g/melvoridle/m/no-death-penalty
  - Strength: moderate. A few anecdotes plus the existence of the mods.

### 2. Auto-eat and healing thresholds
- **Melvor.** Auto-eat is a shop purchase (1,000,000 GP for the first tier) with a threshold that is a percentage of max HP. The example given is 100 HP with Tier I giving a trigger at 20 HP or less. Advice: fight monsters whose max hit is below the threshold.
  - Source: https://steamcommunity.com/app/1267910/discussions/0/707749927473812598/, plus search summaries of the wiki.
  - Strength: strong.
- **Hidden exceptions are the main complaint.** Special attacks (stun, DR reduction, HP afflictions) can exceed the displayed max hit or lower the effective threshold. Players say a small random chance of a special attack can kill you when HP is only slightly off. Players describe auto-eat as less reliable at higher tiers, and one summary quotes combat as "half idle if you don't want to die".
  - Sources: https://steamcommunity.com/app/1267910/discussions/0/3388420307315035865, https://steamcommunity.com/app/1267910/discussions/0/561358128180893038
  - Strength: moderate to strong. The pattern repeats across threads, but I only saw it in search summaries.
- **Melvor's progression advice.** Start on easy monsters (cows), then get gear and auto-eat. Only end-game dungeons need active attention, and most content stays idleable with preparation.
  - Source: https://steamcommunity.com/app/1267910/discussions/0/561358128180893038
  - Strength: single-thread anecdote.
- **Idle Clans.** Auto-eating is a 100,000 gold upgrade in the Combat category of the Upgrade dealership. Food selection is clumsy: players sell low-tier food or reorder the inventory so the best food is used first. That is a UX pain point.
  - Sources: https://idleclans.wiki/w/index.php/Auto_eating, https://steamcommunity.com/app/2103530/discussions/0/592890202622562309/
  - Strength: moderate. The wiki page gave no detail on thresholds, deaths or offline behaviour.

### 3. Offline combat simulation
- **Melvor.** Offline combat is a full tick-accurate simulation on the device. It includes food use, special attacks, RNG effects and mastery unlocks. It is opt-in via a "Toggle Offline Combat" setting. The cap is 24 hours (originally 12, raised after feedback). Some sources say 18 hours, so treat the exact number as uncertain.
  - Sources: https://tideward.app/offline-progression/, https://steamcommunity.com/app/1267910/discussions/0/4665175132461478006/, https://steamcommunity.com/app/1267910/discussions/0/3460471649931718274/
  - Strength: strong on "full simulation". The cap number is inconsistent across sources.
- **Melvor offline deaths.** You can die offline if you are hit above the auto-eat threshold or run out of food or consumables. Hardcore characters are deleted. A player advised checking food first, and noted a longer period gives more accurate consumption estimates in the summary.
  - Source: https://steamcommunity.com/app/1267910/discussions/0/707749927473812598/
  - Strength: moderate.
- **Idle Clans and Milky Way Idle.** Both simulate offline on the server. Idle Clans caps at 12 hours, or 24 with an upgrade or premium. Milky Way Idle gives about 10 hours, upgradable.
  - Source: https://tideward.app/offline-progression/
  - Strength: single secondary source.
- **Expected value versus full simulation.** I found no player or developer discussion of this trade-off. The one source on Melvor is the full-sim description above.

### 4. Communicating whether a fight is sustainable
- Melvor's community built the Combat Simulator mod to show kill time, damage taken and dungeon or slayer outcomes for a chosen loadout. Players also use a "Can I Idle" calculator to check whether content is safe to AFK.
  - Sources: https://wiki.melvoridle.com/w/Scripting_and_Extensions/Combat_Simulator, https://github.com/mythridium/combat-simulator, https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/
  - Strength: strong that the demand exists and is met by third parties.
- IdleOn's survivability stat lumps defence, food and health together. The community still treats AFK gains as opaque (see the thread below).
  - Sources: https://idleon.wiki/wiki/Game_Mechanics_AFK, https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/
  - Strength: moderate.
- IdleOn opacity: a poster complains of hidden factors ("Drop rate is meaningless if this other undisclosed factor says NOPE"). Players report huge variance in AFK drops.
  - Source: https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/
  - Strength: single thread, though a clear anecdote about opaque offline output.

### 5. Retreat and safe-zone mechanics
- NGU's Safe Zone is the only retreat-style mechanic I could confirm (see above).
- I found nothing usable on Clicker Heroes, Soda Dungeon or Idle Champions retreat or fail-and-farm behaviour. My searches returned generic store pages. I am not asserting anything about them.

## What players love
- Offline combat that just works, with the game simulating it fully (Melvor). Evidence: repeated forum answers that auto-eat works offline. Strength: moderate.
- A clear rule for "safe": auto-eat threshold above the monster's max hit, and enough food. Evidence: repeated Melvor advice. Strength: strong.
- Meaningful, opt-in protection from loss (Protect Item prayer). Evidence: multiple posts. Strength: moderate.
- Third-party simulation tools that answer "can I idle this?". This shows demand rather than love for the base game. Strength: strong.
- A longer offline cap. Melvor raised its cap after feedback. Strength: moderate.

## What players dislike / complaints
- Deaths from hidden mechanics: special attacks, stuns and DR or HP effects that bypass the displayed max hit and auto-eat threshold. Strength: repeated across threads.
- Combat feeling only "half idle" at higher tiers because auto-eat stops being enough. Strength: single quoted comment.
- Losing late-game gear to a random slot roll. Players defend it as the game's risk, but mods to remove it exist. Strength: mixed.
- Clumsy food selection (Idle Clans inventory ordering). Strength: single thread.
- Opaque AFK output and drops (IdleOn). Strength: single thread, but the complaint is specific.
- Auto-eat sitting behind a large gold cost before combat is truly idle. This is my inference from the price points rather than a quoted complaint. Strength: weak.

## Ideas and lessons for Ritual Idle
All ideas respect the designer's rules: no real-time waits, no chores, no RNG failure punishing the player, generous offline progress, no pay-to-win.
1. **Losing costs supplies and progress, not gear.** Melvor's random gear loss is the most-criticised part of an otherwise accepted system. A ritual-flavoured equivalent is that a defeat drains the loadout (candles burn out, salt is spent) and pushes you back to your ward-circle with the fight's kills kept. It costs nothing permanent, and defeat is still meaningful. Optional: a small "Shaken" debuff that decays with time or clears with a consumable. It is not a real-time wait if it clears through use of an item or another action.
2. **Make sustainability a rule the player can compute.** Show three numbers on the fight card: time per kill, damage taken per kill, and how many kills or how much time the current supplies last. Melvor players had to write mods and use external tools for this, so putting it in the game is a clear opportunity.
3. **Ban hidden damage.** The strongest complaint pattern is deaths the displayed numbers did not predict. Give every enemy a public "worst hit" that includes special attacks. If an enemy has a special attack, name it in the card and include it in the safe threshold. Add a "Safe / Risky / Unsafe" tag for the current loadout, and refuse or warn before starting Unsafe auto-combat.
4. **Auto-heal is a core, early feature, not a late shop unlock.** The Melvor and Idle Clans price gates make idling costly. Make the heal threshold a loadout setting (for example herbs or a tincture used below a chosen HP percent) available early, with it running out of supplies as the natural limiter.
5. **Offline combat uses the same engine, and the loadout decides.** Ritual Idle's `advance(state, ms)` already runs offline through the same function. That matches Melvor's full-simulation approach with no expected-value shortcut to explain. To keep it cheap on long absences, simulate in coarse steps but on the real rules and seeded RNG. Because the sim is deterministic and seeded, it never becomes a hidden "unlucky" death.
6. **Offline stops safely rather than punishing.** If supplies run out or HP hits the retreat line offline, the player retreats to the ward-circle and combat ends, with a summary saying what happened and why. Because no RNG failure is allowed, offline combat should only stop for a rule the player can see. Keep the cap generous, with 24 hours as the benchmark.
7. **Retreat as a built-in rule.** Add a "retreat when HP falls below X" or "retreat when candles run low" setting. NGU's Safe Zone is a precedent for a no-penalty fallback.
8. **Boss losses have no penalty beyond spent consumables.** This follows the NGU Titan pattern. It suits bosses that unlock things, where the challenge should be "prepare better", not "grind back after failing".
9. **Let survivability reduce output, not just kill you.** IdleOn ties survivability to yield. For safe offline farming of weaker foes, the same idea could give lower kill speed rather than a cliff, provided the rate is shown openly in the fight card. IdleOn's opaque version drew complaints, so do not hide the multiplier.
10. **Food and supply selection must be one clear choice.** Idle Clans players fight the inventory to pick which food gets used. In Ritual Idle the loadout screen should let the player choose what is consumed and when.

## Sources
- https://steamcommunity.com/app/1267910/discussions/0/707749927473812598/
- https://steamcommunity.com/app/1267910/discussions/0/3199245102899115969/
- https://steamcommunity.com/app/1267910/discussions/0/3388420307315035865
- https://steamcommunity.com/app/1267910/discussions/0/561358128180893038
- https://steamcommunity.com/app/1267910/discussions/0/4665175132461478006/
- https://steamcommunity.com/app/1267910/discussions/0/3460471649931718274/
- https://wiki.melvoridle.com/w/Combat (search-summary only; direct fetch returned 403)
- https://wiki.melvoridle.com/w/FAQ (search-summary only)
- https://wiki.melvoridle.com/w/Offline_Progression (search-summary only; direct fetch returned 403)
- https://wiki.melvoridle.com/w/Scripting_and_Extensions/Combat_Simulator (search-summary only)
- https://github.com/mythridium/combat-simulator (search-summary only)
- https://mod.io/g/melvoridle/m/no-death-penalty (search-summary only)
- https://tideward.app/offline-progression/
- https://idleclans.wiki/w/index.php/Auto_eating
- https://steamcommunity.com/app/2103530/discussions/0/592890202622562309/
- https://steamcommunity.com/app/1476970/discussions/0/599639412970623691/
- https://idleon.wiki/wiki/Game_Mechanics_AFK (search-summary only)
- https://sayolove.github.io/ngu-guide/en/mechanics/adventure/
- https://milkywayidle.wiki.gg/wiki/Combat (fetched, no death or offline information found)

Not found: no usable Reddit threads, and no evidence on Clicker Heroes, Soda Dungeon, Trimps or Idle Champions retreat behaviour, or on expected-value versus full-simulation debates.
