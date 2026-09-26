# Rite Quality: Sacrifices and Rewards (research, 2026-09-26)

> The question: should rite quality ever change rewards, and if it does, what makes a good **sacrifice** and a **worthy reward**, without asking for the player's attention (no quick-time events)?
> This is a research note, not a decision. It builds on [CONCEPT.md](../CONCEPT.md) (§3 "Power has a price", §5.3 rites, §5.5 cycles, §8 Taint and followers, decision log Q4, Q5 and Q8) and [CHAPTER1.md](../CHAPTER1.md) §5 and §8.
> Sources are at the end. Game facts come from wikis and guides; numbers for Ritual Idle are suggestions to tune.

---

> **Decided on 2026-09-26** (see [CONCEPT.md's decision log](../CONCEPT.md#decision-log), "Rite quality: the kiss and the curse"): Proposal B with A's ladder, named **"The Circle Asks"**. Chapter 1 gets **only the keepsake pick** (Fine 1, Resplendent 2); bargains start in Chapter 2. Answers to §7: Q1 (c) · Q2 any work · Q3 a gentle blessing on the same skill (−25% for ~150 repetitions → +3%) · Q4 a choice of 2–3 per rite · Q5 (b) · Q6 (c) swap at Ascension · Q7 vows reworked as Promises (bonus goals, never restrictions) · Q8 (a) no steeping · Q9 "The Circle Asks".

## 1. Summary (the one-screen answer)

**Yes, quality should change rewards, but sideways and lastingly, never the story reward.** A plain (Sound) rite always gives the full Chapter reward. Quality adds *extra* things that last: a pick of one small permanent gift, Offerings for the endgame, a step up for a follower. A player who skips quality is never blocked, only a little less decorated and a little slower.

**What makes the price feel worth it**, from every game we looked at:
1. **The price is shown before you accept, and you choose it.** No dice, no surprise (Hades' Chaos, Slay the Spire's Neow, Risk of Rain 2's Shrine of the Mountain).
2. **The price is temporary and the reward lasts.** Hades' Chaos boons are the clearest case: a curse for 3–4 fights, then a blessing for the rest of the run.
3. **The price touches something you can plan around.** Players love a curse they can dodge by building smart (Darkest Dungeon trinkets on the right hero, Slay the Spire's curse relics, Melvor's Agility penalties on skills you don't train).
4. **The reward is different in kind, not just a bigger number.** Boss items in Risk of Rain 2, a true final boss in Monster Train, permanent perks from Realm Grinder and Antimatter Dimensions challenges.

**Recommendation: build Proposal B, "The Gift That Bites", on top of Proposal A's reward ladder.**
- Before a rite, the circle offers **bargains**: each one shows a clear price (a curse on one skill, a vow, some Taint, a follower kept at the circle) and a clear gift. You accept any number, or none.
- **Curses are measured in work, not clock time** ("the next 200 repetitions of Chandlery are 30% slower"), so they pass offline too and never make anyone wait.
- **When a curse runs out it turns into a small permanent blessing on the same skill** ("the house was cold; now it holds heat": +5% Chandlery). That's the kiss/curse in one line, and it's Hades' Chaos rebuilt for an idle game.
- **Chapter 1 first step:** keep the three current offerings, add one bargain ("Let the hearth go cold"), and let a Resplendent rite offer **a pick of 1 of 3 keepsakes** with small lasting effects. This changes the logged rule "quality is cosmetic in Chapter 1", so it needs the designer's yes (§7).

---

## 2. How we read "kiss/curse", and the rules we have to keep

### 2.1 Our reading
"Kiss/curse" is a **gift from something that might bite you**. In games it shows up in four shapes:

| Shape | What it means | Example |
|---|---|---|
| **Curse first, then blessing** | You suffer for a while, then you're rewarded for good | Hades' Chaos boons |
| **Price for a better outcome** | You make it harder or costlier, and the result is bigger | Hades' Heat, Risk of Rain 2's Shrine of the Mountain |
| **Blessing with a lasting drawback** | Power that comes with a permanent downside | Noita's Glass Cannon, Darkest Dungeon trinkets, Balatro's Ectoplasm |
| **Giving something up** | You burn something valuable to get something else | Inscryption's blood, Cult of the Lamb's sacrifice, Kittens Game's unicorns |

For Ritual Idle we read it as **a bargain with the thing in the circle**: it asks for something, you see exactly what, and it pays you in something that lasts. The bite is real but bounded, and it always ends or can be undone. That matches Pillar 4 ("Power has a price… always reversible and never end the game") and folklore: the domovoi is fed bread and salt to keep him kind, and the rusalki are given ribbons and bread so they stay away from the fields; in both, the gift buys favour from something that could turn on you.

### 2.2 Design goals
- **Quality is worth it:** a player who goes for it should feel it for days, not minutes.
- **The sacrifice is worthy:** it should sting a little, and be a real choice (sometimes the right answer is "not this time").
- **Rites get deeper** without getting longer to operate.

### 2.3 Firm constraints (from the decision log and the designer's taste)

| Rule | What it rules out |
|---|---|
| No real-time gating or waiting | "Wait 8 hours for a better rite", curses that tick by the clock and block you |
| No management chores | Bargains that need tending, per-curse micromanagement |
| Nothing fails, no RNG failure (Q5) | Vaal-style gambles, Darkest Dungeon's 25% virtue roll, "chance of a bad result" |
| No quick-time events or attention tests | Anything answered during the rite |
| Idle-friendly | Every choice is made **before** the rite and works offline |
| Tension from choices and optimisation, not dice or reflexes | Hidden prices, random prices |
| Quality never punishes skipping it | Rewards the story or later content needs |

---

## 3. Patterns found in other games

Fit ratings: **Great** fits as is · **Good** fits with a tweak · **Poor** clashes with a rule.

### 3.1 Curse first, then a lasting blessing
- **How it works:** you accept a curse for a short, known stretch. When it ends, a permanent blessing takes its place.
- **Example:** Hades' Chaos gates. Each Chaos boon is a random pair: a curse lasting a set number of encounters (usually 3–4), then a blessing for the rest of the run. Rarity only improves the blessing, and damage curses can't take Zagreus below 1 HP. ([Hades wiki](https://hades.fandom.com/wiki/Chaos/Boons_(Hades)), [TheGamer](https://www.thegamer.com/hades-chaos-guide/))
- **Why the price feels worth it:** the curse is short and visible, the blessing lasts, and the game quietly guarantees the curse can't end your run.
- **Fit: Great**, if the curse is measured in **work done** (repetitions) instead of fights or clock time, and the pair is shown before you accept (Hades' pairs are random; ours should be chosen).

### 3.2 Chosen modifiers ("heat") for better rewards
- **How it works:** you switch on difficulty modifiers before a run; each point of difficulty raises the reward.
- **Examples:**
  - **Hades' Pact of Punishment:** Heat pays out bounties (Titan Blood, Diamonds, Ambrosia) once per new Heat level per weapon, so players raise it one point at a time. ([Hades wiki](https://hades.fandom.com/wiki/Pact_of_Punishment), [RPG Site](https://www.rpgsite.net/feature/10287-hades-pact-of-punishment-heat-modifiers-and-how-to-maximize-your-rewards))
  - **Hades II's Oath of the Unseen:** 16 Vows raise Fear and pay in Nightmare, spent on weapon aspects. ([Hades wiki](https://hades.fandom.com/wiki/Oath_of_the_Unseen))
  - **Risk of Rain 2's Shrine of the Mountain:** more bosses; each shrine adds one more copy of the boss reward, and each extra drop has its own 15% chance to be a rare boss item. Two shrines at once unlock a piece of equipment. ([RoR2 wiki](https://riskofrain2.wiki.gg/wiki/Shrine_of_the_Mountain))
  - **Path of Exile maps:** map modifiers make the area harder and raise item quantity and rarity. ([PoE wiki](https://pathofexile.fandom.com/wiki/Map))
  - **Diablo 4 Nightmare sigils:** 2–4 negative affixes, one positive, better loot. ([Maxroll](https://maxroll.gg/d4/resources/nightmare-dungeons))
  - **Monster Train's Pact Shards:** take shards for money, upgrades and unit fusions; the boss grows stronger, and 100 shards opens a true final boss. ([Monster Train wiki](https://monster-train.fandom.com/wiki/Pact_Shards))
- **Why the price feels worth it:** the price and the reward are on the same screen, the player sets the dial, and **first-time bounties** stop endless farming.
- **Fit: Good.** In an action game, "harder" means skill. In our game nothing can be harder in that sense, so "heat" becomes **a slower or costlier rite or chapter** (a curse, a vow, a bigger tithe). The first-time bounty idea is very useful for repeatable side rites.

### 3.3 Consuming valuables (items, followers, currencies)
- **How it works:** you burn something you'd rather keep.
- **Examples:**
  - **Inscryption:** big cards cost blood, paid by sacrificing your own cards on the board; the sacrificial altar moves one card's sigils onto another. The game grew from a jam entry called "Sacrifices Must Be Made". ([Game Developer](https://www.gamedeveloper.com/design/how-game-jam-sacrifices-became-inscryption), [Inscryption wiki](https://inscryption.fandom.com/wiki/Blood))
  - **Cult of the Lamb:** rituals cost bones and wood; Sacrifice of the Flesh costs a follower (and some faith) for a strong effect. ([Cult of the Lamb wiki](https://cult-of-the-lamb.fandom.com/wiki/Rituals))
  - **Cultist Simulator:** a rite has slots (lore, tools, ingredients, influences, followers) and **consumes one of them**; the cards' aspects decide the outcome. ([Cultist Simulator wiki](https://cultistsimulator.fandom.com/wiki/Rites), [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1429378632))
  - **Kittens Game:** sacrifice unicorns at ziggurats for tears, alicorns for time crystals, which build better religion buildings. ([Kittens Game wiki](https://wiki.kittensgame.com/en/game-tabs/religion))
  - **Slay the Spire's Neow:** the third starting option always trades something (all your gold, max HP) for a rare relic or card; the fourth swaps your starter relic for a random boss relic. ([Slay the Spire wiki](https://slay-the-spire.fandom.com/wiki/Neow))
- **Why the price feels worth it:** what you give is something *you* built up, so the choice has weight; the reward is usually rarer than what you paid.
- **Fit: Great.** It's already our Chapter 1 model (a hearth candle). The trap is when the sacrifice is so cheap it isn't a choice, which is where Chapter 1 is today.

### 3.4 A blessing with a lasting drawback
- **How it works:** a strong bonus is permanently paired with a penalty.
- **Examples:** Noita's Glass Cannon (×5 damage, max health capped at 50) ([Noita wiki](https://noita.wiki.gg/wiki/Glass_Cannon)); Darkest Dungeon trinkets, most with a penalty scaled to their power ([DD wiki](https://darkestdungeon-archive.fandom.com/wiki/Trinkets)); Balatro's Ectoplasm (an extra Joker slot for less hand size, worse each use) ([Balatro wiki](https://balatrowiki.org/w/Ectoplasm)); Against the Storm cornerstones like Exploration Expedition (−5 Resolve all game, +15 for 5 minutes per new glade) ([Steam discussion](https://steamcommunity.com/app/1336490/discussions/0/3792632416051835773)); Melvor's Agility obstacles (green bonuses, usually one red penalty) ([Melvor wiki](https://wiki.melvoridle.com/w/Agility)).
- **Why the price feels worth it:** when the penalty hits something you weren't using. Players say about 90% of Darkest Dungeon's trinkets are never used, because a few are too good and the rest aren't worth it ([Steam discussion](https://steamcommunity.com/app/262060/discussions/2/618453594760672423/)). Melvor players dislike Agility's penalties enough that mods remove them ([mod.io](https://mod.io/g/melvoridle/m/free-agility-obstacles-no-negatives)), and our own RESEARCH.md lists "buffs with mandatory penalties" as a pet peeve.
- **Fit: Poor as a permanent penalty, Good if it ends.** This is exactly why CONCEPT makes afflictions reversible. Prefer 3.1 (the curse ends).

### 3.5 Taint as the price
- **How it works in our design:** forbidden work raises Taint, Taint raises forbidden yields, and thresholds bring mixed afflictions (CONCEPT §8).
- **Nearest example:** Against the Storm's Hostility: forbidden glades pay more and raise danger, and some cornerstones trade Hostility for bonuses. ([Glade events wiki](https://wiki.hoodedhorse.com/Against_the_Storm/Glade_Events), [TheGamer](https://www.thegamer.com/against-the-storm-glade-events-dangerous-forbidden-ranked/))
- **Why the price feels worth it:** it's one number the player already watches, and the Taint ward makes it safe offline.
- **Fit: Great from Chapter 3.** It is Pillar 4 in its purest form, and Purification (which eats low-tier goods) pays it back off.

### 3.6 Tying up a resource for a while (a follower, a slot, time)
- **How it works:** something useful is unavailable for a while.
- **Examples:** Cultist Simulator's followers sent on expeditions or into rites; Hades II's Vows that remove options for a run; our own CONCEPT rite assist slot (followers raise quality and come back).
- **Why the price feels worth it:** it's an opportunity cost, easy to understand, never destructive.
- **Fit: Good**, if "for a while" is counted in **your work** (e.g. "Janko keeps vigil for the next 300 repetitions"), not in hours, and if the follower comes back with something.

### 3.7 Vows that restrict play for a while
- **How it works:** you promise not to do something, and are paid for keeping it.
- **Examples:** Antimatter Dimensions' challenges (restrictions, then a strong permanent reward on first clear) ([AD wiki](https://antimatter-dimensions.fandom.com/wiki/Challenges)); Trimps' challenges such as Balance (harder enemies, +100% helium at zone 40) ([Trimps wiki](https://trimps.fandom.com/wiki/Balance)); NGU Idle's challenges (permanent rewards) ([NGU wiki](https://ngu-idle.fandom.com/wiki/Challenges)); Idle Champions' patron variants (extra restrictions for patron currency) ([Idle Champions wiki](https://idle-champions.fandom.com/wiki/Patrons)); Realm Grinder's challenges (permanent perks) ([Realm Grinder wiki](https://realm-grinder.fandom.com/wiki/Challenges)).
- **Why the price feels worth it:** idle players *like* a puzzle of "how do I do this without X?", and the rewards are permanent.
- **Fit: Good, with care.** A vow must never block the main path (a stuck state is a soft-lock). Safe vows: "no omens until the next part is placed", "no village contracts this stage", "no talent switching". Riskier: "no Herbalism" when a step needs it.

### 3.8 Reveal-then-choose bargains
- **How it works:** the game shows a small set of offers, each with its full price and reward, and you pick.
- **Examples:** Slay the Spire's Neow (four options, the third always a trade) ([wiki](https://slaythespire.wiki.gg/wiki/Neow)); Hades' boon choice of 1 of 3; Noita's Holy Mountain perks (pick one of several) ([Noita wiki](https://noita.wiki.gg/wiki/Category:Perks)); Monster Train's shard offers on the map.
- **Why the price feels worth it:** you see everything, so the choice is yours; small variety keeps each rite fresh.
- **Fit: Great.** It's one decision up front and it plays well with Divination, which CONCEPT already says can "preview rite outcome quality".

### 3.9 Gambles (for contrast: not for us)
- **Path of Exile's Vaal Orb:** corrupting an item can do nothing, reroll it, add a special property, or ruin it, and the item is locked forever ([PoE wiki](https://pathofexile.fandom.com/wiki/Vaal_Orb)).
- **Darkest Dungeon's resolve check:** 25% virtue, 75% affliction by default ([DD wiki](https://darkestdungeon.fandom.com/wiki/Virtue)).
- **Fit: Poor.** They're exciting because they can go wrong. Q5 says nothing goes wrong. The one lesson to keep: **a visible "locked" state** (Vaal's "corrupted" tag) makes a choice feel final and important.

### 3.10 Summary table

| Pattern | Idle-friendly | No QTE | No failure | Interesting choice | Overall |
|---|---|---|---|---|---|
| Curse, then blessing | Yes (count work) | Yes | Yes | High | **Great** |
| Reveal-then-choose bargains | Yes | Yes | Yes | High | **Great** |
| Consuming valuables | Yes | Yes | Yes | Medium (needs a real cost) | **Great** |
| Taint as price (Ch3+) | Yes (Taint ward) | Yes | Yes | High | **Great** |
| Tying up a follower or slot | Yes (count work) | Yes | Yes | Medium | **Good** |
| Vows | Yes | Yes | Yes, if never blocking | High | **Good** |
| Chosen "heat" | Yes | Yes | Yes | Medium | **Good** |
| Permanent drawback | Yes | Yes | Yes | Low (dominant picks) | Poor |
| Gambles | Yes | Yes | **No** | High | Poor |

---

## 4. Good sacrifices for Ritual Idle

Ranked by **how interesting the choice is** and **how little attention it needs**. "Attention" means anything after the rite begins; everything here is chosen before.

| # | Sacrifice | How it reads in game | Choice | Attention | Chapter |
|---|---|---|---|---|---|
| 1 | **A curse on one skill, counted in work** | "The house goes cold: the next 200 Chandlery repetitions are 30% slower." Ends by itself, offline too, then becomes a small blessing | High: you pick which skill to hurt, ideally one you're not using next | None | **1+** |
| 2 | **Taint** | "Mark the circle with the black ink: +12 Taint." | High: Taint is a dial with upsides | None (Taint ward) | **3+** |
| 3 | **A stored omen burned** | "Pour a Still Night into the circle" (from the shelf, not active) | Medium-high: omens are scarce and you'd rather spend them on a skill | None | **1+** |
| 4 | **A follower keeps vigil** | "Janko stays at the circle for your next 300 repetitions" (no assist bonus), then returns with a rank step or trait | Medium-high: you give up +30% speed for a while | None | **2+** (1 follower from Ch1's end) |
| 5 | **A vow until the next part or stage** | "Vow of the dark window: no omens until the next part is placed" · "Vow of silence: no contracts this stage" | High, a puzzle | Low: you must remember it (the UI shows it) | **1+** (safe vows only) |
| 6 | **A rare item or curio** | "Lay grandmother's thimble in the circle" (a curio is used up, or its story stays but its insight doesn't) | Medium: curios are few and loved | None | **1+** (curios exist) |
| 7 | **A higher-grade part** | "Place the Light as hearth candles instead of tallow" or consecrated salt instead of salt lines | Medium: a bigger sink for your chain, pleases Pillar 1 | None | **2+** (consecration) |
| 8 | **Giving up a running buff** | "Let the Blessing burn out into the circle" (the house blessing ends now) | Low-medium | None | **1+** |
| 9 | **Coin** | "A tithe to the church: 40 coin" | Low (coin has few uses) | None | **2+**, when coin buys rare things |
| 10 | **Time: a long priming** | "Let the circle steep": the rite takes your action slot for longer, and more steeping raises quality | Low-medium | None, but it **edges toward real-time waiting** | Later chapters, with care |

**Notes on the ranking**
- **#1 is the star** because it's the only one where the price is *where you choose it to land*, like placing a Darkest Dungeon trinket on the hero whose weakness doesn't matter. A smart player curses the skill they just finished with. That's optimisation, not dice.
- **Counting in repetitions, not minutes,** is what keeps it idle: it passes while you're away, and it never tells you to wait. Suggested rule: the curse counts repetitions of the cursed skill only if you're using it, or **any** work (to avoid "just don't touch it" dodging); see §7.
- **Floor for every curse:** never below 50% speed (the same floor as an empty pantry), never blocks an action, and never touches the rite itself.
- **Avoid for tone:** animal sacrifice (the domovoi's midnight cock is real folklore, but CONCEPT dropped "small living offerings"). Keep sacrifices to bread, salt, candles, ribbons, curios, warmth, silence and time.
- **#10 (long priming)** is tempting for an idle game, but "Resplendent needs 8 hours" becomes a clock the player feels they must obey. If used, make steeping cost *work* (the rite holds your action slot, so you give up production) and cap it so an ordinary night away already reaches the top.

---

## 5. Worthy rewards for higher quality

### 5.1 Ranked

| # | Reward | Why it's worthy | Mandatory risk | Chapter |
|---|---|---|---|---|
| 1 | **A pick of 1 of 3 small permanent gifts** ("keepsakes": +5% offline, an extra omen shelf slot, a talent-like perk, a recipe variant) | Lasting, a real choice, different every time (Hades boons, Noita perks) | Low if each is small (≤5–10% on one thing) | **1+** |
| 2 | **The blessing a curse turns into** (+5% on the cursed skill, permanent) | The kiss after the curse; it's earned by the sacrifice itself | Low | **1+** |
| 3 | **Follower growth:** a rank step or a second trait | Followers are few and permanent; CONCEPT says ranks rise through rites | Medium: keep rank also reachable without quality | **2+** |
| 4 | **Offerings (prestige currency)** | Carries into every cycle; CONCEPT already says Offerings come from quality | Medium: cap quality's share | Earned **from Ch1**, spent at Ascension |
| 5 | **Recipe variants and hidden rites** (a Resplendent rite reveals a side rite's silhouette or a forbidden variant) | Discovery is Pillar 2; knowledge you keep | Low (side content only) | **1+** |
| 6 | **Sanctum upgrades** (something visible in the scene *with* a small effect: the embroidered cloth also gives +1 insight per page) | Feeds "something to look at" | Low | **1+** |
| 7 | **Patron favour** | Tees up the first pledge | Medium | **3+** |
| 8 | **Lore and cosmetics** | The floor that always comes with quality; today's Chapter 1 reward | None | **1+** |

### 5.2 Sizing for an idle game
- **Rule of thumb:** the whole quality track in a chapter should leave a Resplendent player **about 10–15% ahead** of a Sound player at the chapter's end, not more. That's felt, but a skipper isn't punished.
- **Price vs. reward:** a curse should cost about **5–10 minutes of one skill's output**; its blessing should repay that within **2–3 sessions** and then keep giving. Example: 200 repetitions at 30% slower on a 4-second action costs about 4 extra minutes; +5% on that skill over a 4-week game repays it many times over.
- **Offerings:** if quality gives Offerings, keep quality's share **at most ~30–40%** of a cycle's Offerings (the rest from finishing rites and follower sacrifice), so Boons never depend on quality.
- **Side rites (repeatable):** pay the quality bonus **once** per quality level, like Hades' Heat bounties, so there's no farming loop.

### 5.3 Warnings: rewards that make quality mandatory
- **Anything a later rite or step needs** (an item, a level, a follower rank). The story must always work at Sound.
- **Big multipliers on core speed or XP** (+25% XP). Everyone would take them; the choice disappears.
- **More follower slots, higher caps, a new skill.** These are story rewards; putting them behind quality splits the game in two.
- **Offline cap upgrades.** Locking generosity behind quality punishes exactly the idle players we're for.
- **Rewards that invalidate others** (Darkest Dungeon's dominant trinkets). If one keepsake is always the pick, the others are wasted content.
- **Missables.** If a quality reward can only be earned once per cycle, let the next cycle offer it again, so no one feels they lost it forever.

---

## 6. Three proposals

### Proposal A: "The Tithe Ladder" (quality pays sideways)
The simplest version: today's offerings, but each quality level adds a lasting extra.

**How it plays**
1. The rite's card lists the optional offerings, as today.
2. Beside each quality level, the card shows what it adds ("Fine: +1 Offering · Resplendent: +2 Offerings and a keepsake").
3. You begin; the rite runs by itself.
4. At the end: the full story reward, then the extras, and at Resplendent a pick of 1 of 3 keepsakes.

- **Sacrifice:** items (a hearth candle), a discovery (the Hearth mark), an omen, later a follower in the assist slot or low Taint.
- **Reward:** Offerings (1 / 2 / 4 per Major Rite for Sound / Fine / Resplendent), plus a keepsake pick at Resplendent.
- **Idle and never fails:** everything is chosen up front; the rite always completes.
- **Chapter 1 step:** Resplendent offers 1 of 3 keepsakes (e.g. *Grandmother's quilt*: +5% offline progress · *A jar of embers*: +1 omen shelf slot · *Her reading glasses*: +1 insight per deciphered page). Record Offerings earned, to be spent later.
- **Risks:** Offerings don't mean anything until Ascension, weeks later; the ladder itself is not very "kiss/curse". Today's sacrifices are cheap (one candle), so Resplendent may feel free.

### Proposal B: "The Gift That Bites" (the true kiss/curse) *(recommended)*
The thing in the circle offers bargains. Each is a curse now and a blessing later.

**How it plays**
1. When the rite is ready, the card shows the usual offerings plus **2–3 bargains** (from Chapter 3, Divination can reveal a third or a reroll).
2. Each bargain states three things plainly:
   - **The price:** "The house goes cold: Chandlery is 30% slower for the next 200 repetitions."
   - **The kiss:** "Counts as a quality step."
   - **What it becomes:** "Afterwards: *Hearth-hardened*, Chandlery +5% for good."
3. You accept any, or none. Accepting shows the curse as a frost-coloured tag on that skill's tile, with a count ("142 left").
4. The rite runs by itself. Afterwards the curse ticks down with work, online or offline.
5. When it runs out, a quiet feed line and a small mark on the tile: the curse becomes its blessing.

- **The sacrifice (by chapter):**
  - Ch1: a work-counted curse on one skill ("the house goes cold", "salt-thirst: salt lines take 2 salt", "the pages curl: deciphering is slower").
  - Ch2: a follower keeps vigil; a vow for the next stage.
  - Ch3+: Taint ("+12 Taint, and the black ink answers"); stronger curses paired with forbidden variants.
- **The reward:** each accepted bargain = one quality step **and** a small permanent blessing on the cursed skill. Quality on top pays the Proposal A ladder (keepsake pick, Offerings).
- **Idle and never fails:**
  - Curses count repetitions, never clock time, so they pass while you're away.
  - A curse never takes a skill below 50% speed, never stops an action, and never touches the rite.
  - The price is shown in full; nothing is random after you accept.
- **Rough numbers:**
  - Curse: −30% speed (or +1 input) for 150–250 repetitions ≈ 5–10 extra minutes of that skill.
  - Blessing: +5% speed, or +5% yield, or +1 input saved per 10 on that skill, permanent (stacks up to +15% per skill across chapters).
  - At most 2 bargains per Major Rite in Ch1, 3 later.
- **Chapter 1 step (small):**
  - Add **one** bargain as a fourth optional offering: *"Let the hearth go cold"* (Chandlery −30% for 200 repetitions → *Hearth-hardened*, +5% Chandlery). With it, Resplendent needs 3 of 4, so the player can skip the one offering they dislike.
  - Pair it with Proposal A's keepsake pick at Resplendent.
  - The playthrough bot takes no offerings, so pacing is unchanged; add a test that the curse ends and becomes its blessing, offline too.
- **Risks:**
  - **Dodging:** if curses count only the cursed skill's work, players curse a skill they won't use and it never ends. Either count **any** work (clean) or let an unused curse fade after a set amount of total work.
  - **Stacking:** 10 little permanent +5%s add up. Cap per skill (+15%) and total bargains per chapter.
  - **Tone creep:** make the bites feel folkloric, not punishing: cold, thirst, curling pages, restless nights.
  - **More UI:** one tag per cursed skill and one feed line; keep it that small.

### Proposal C: "Vigil and Steeping" (spend time and hands, not items)
Quality comes from what you **tie up** during and after the rite.

**How it plays**
1. The card has two sliders (with steps, not free values): **Vigil** (how many followers sit with the circle) and **Steeping** (how long the rite holds your action slot).
2. More vigil or more steeping raises quality. The card shows the cost in plain terms: "Janko keeps vigil for your next 300 repetitions" · "The rite holds your hands for 20 more minutes of work".
3. Followers come back with a rank step; the steeped rite gives a keepsake.

- **Sacrifice:** follower assist (their +30%) and your own action slot's production.
- **Reward:** follower rank steps and traits; keepsakes; Offerings.
- **Idle and never fails:** chosen up front; "20 more minutes" fits naturally into an offline stretch.
- **Rough numbers:** each vigil follower = one step, returns after 300 repetitions of your work with +1 rank step; steeping in 3 steps (+10 / +30 / +60 minutes of the action slot).
- **Chapter 1 step:** none really (Janko only arrives *after* the rite); at most, a steeping step.
- **Risks:** steeping looks like **real-time waiting**, which the designer has rejected; "leave it overnight for the best result" becomes a clock. Followers kept away for long feels like management. It's a good **extra ingredient** for Chapter 2+ (vigil as one kind of bargain), not the whole system.

### Which one, and why
**Pick B, with A's ladder as its reward half, and use C's "vigil" as one kind of bargain from Chapter 2.**
- B is the only proposal that is truly kiss/curse: the price bites, you choose where, it ends, and it leaves something behind.
- It's all one decision before the rite, so it respects every constraint: no waiting, no dice, no attention during the rite.
- It gives Taint (Ch3), followers (Ch2) and vows natural homes as bargain types, so rites deepen chapter by chapter without new systems.
- It's small to start: one bargain and a keepsake pick in Chapter 1.

---

## 7. Open questions for the designer

1. **Does quality change rewards at all in Chapter 1?**
   (a) Keep it cosmetic (as logged), and start bargains in Chapter 2 · (b) add the keepsake pick and one bargain now · (c) keepsake pick only.
2. **What does a curse count down with?**
   (a) Any work you do (can't be dodged, simplest) · (b) only the cursed skill's work (more of a puzzle, can be dodged) · (c) the cursed skill's work, fading after a set total.
3. **What does a curse turn into?**
   (a) Always a small blessing on the same skill · (b) a blessing on another skill · (c) nothing; the reward is only the quality step.
4. **How many bargains per rite?**
   (a) One fixed bargain · (b) a choice of 2–3, the same every time · (c) 2–3 drawn for each rite from a list (seeded, shown before you accept).
5. **Where do Offerings come from?**
   (a) Mostly quality · (b) mostly finishing rites and follower sacrifice, quality a capped extra (~30–40%) · (c) not from quality at all.
6. **Can a keepsake be swapped later?**
   (a) Fixed forever · (b) free to swap, like talents · (c) swap at Ascension.
7. **Vows:** (a) never · (b) only "safe" vows that can't block the main path · (c) any vow, released automatically if it would block.
8. **Steeping (time as a price):** (a) never, it's too close to waiting · (b) only as action-slot work, capped short · (c) allowed for long late-game rites.
9. **Naming the bargain:** "Bargain", "Price", "Tithe", "The Circle Asks", or a folk word (e.g. a nod to *žertva*, the Slavic word family for sacrifice)?

---

## 8. Flavour notes (for naming)
- **Domovoi:** fed bread and salt, milk or the evening's leftovers by the stove to keep him kind; called to a new house with bread and salt ("Grandfather, come with us"). Good for hearth bargains: *"Leave the hearth unfed tonight."* ([Wikipedia](https://en.wikipedia.org/wiki/Domovoy), [Bread and salt](https://en.wikipedia.org/wiki/Bread_and_salt))
- **Rusalki:** during Rusalka Week, eggs, garlands, bread and ribbons were left at riverbanks so they'd keep away from the fields; angered, they could send floods or cattle plague. A gift that keeps something away is a natural Chapter 4 (Drowned) bargain. ([Rusalka Week](https://en.wikipedia.org/wiki/Rusalka_Week), [Slavic water spirits](https://en.wikipedia.org/wiki/Slavic_water_spirits))
- **The sacrificer:** the Slavic priest's name, *zhrets*, is reconstructed as "one who makes sacrifices", from the same root as words for offering. ([Zhrets](https://en.wikipedia.org/wiki/Zhrets))
- **Dziady** (Forefathers' Eve, feeding the dead) already frames Chapter 2; a "place at the table left empty" is a ready-made vow. ([Dziady](https://en.wikipedia.org/wiki/Dziady))
- **Bite names that stay eerie-cozy:** *The house goes cold* · *Salt-thirst* · *The pages curl* · *Restless nights* · *Grave-chill* · *The candle won't hold* · *A place left empty*. **Kiss names:** *Hearth-hardened* · *Salt-sure* · *Ink-steady* · *Night-sighted*.

---

## 9. Sources

**Games**
- Hades, Chaos boons: https://hades.fandom.com/wiki/Chaos/Boons_(Hades) , https://www.thegamer.com/hades-chaos-guide/
- Hades, Pact of Punishment: https://hades.fandom.com/wiki/Pact_of_Punishment , https://www.rpgsite.net/feature/10287-hades-pact-of-punishment-heat-modifiers-and-how-to-maximize-your-rewards
- Hades II, Oath of the Unseen: https://hades.fandom.com/wiki/Oath_of_the_Unseen
- Slay the Spire, Neow: https://slay-the-spire.fandom.com/wiki/Neow , https://slaythespire.wiki.gg/wiki/Neow
- Slay the Spire, curses and curse relics: https://slay-the-spire.fandom.com/wiki/Curse , https://slay-the-spire.fandom.com/wiki/Darkstone_Periapt
- Monster Train, Pact Shards: https://monster-train.fandom.com/wiki/Pact_Shards
- Risk of Rain 2, Shrine of the Mountain: https://riskofrain2.wiki.gg/wiki/Shrine_of_the_Mountain
- Cultist Simulator, rites: https://cultistsimulator.fandom.com/wiki/Rites , https://steamcommunity.com/sharedfiles/filedetails/?id=1429378632
- Darkest Dungeon, trinkets and virtues: https://darkestdungeon-archive.fandom.com/wiki/Trinkets , https://darkestdungeon.fandom.com/wiki/Virtue , https://steamcommunity.com/app/262060/discussions/2/618453594760672423/
- Path of Exile, Vaal Orb and maps: https://pathofexile.fandom.com/wiki/Vaal_Orb , https://pathofexile.fandom.com/wiki/Map
- Diablo 4, Nightmare Dungeons: https://maxroll.gg/d4/resources/nightmare-dungeons
- Against the Storm, glade events and cornerstones: https://wiki.hoodedhorse.com/Against_the_Storm/Glade_Events , https://www.thegamer.com/against-the-storm-glade-events-dangerous-forbidden-ranked/ , https://steamcommunity.com/app/1336490/discussions/0/3792632416051835773
- Inscryption, sacrifice: https://www.gamedeveloper.com/design/how-game-jam-sacrifices-became-inscryption , https://inscryption.fandom.com/wiki/Blood
- Noita, perks: https://noita.wiki.gg/wiki/Glass_Cannon , https://noita.wiki.gg/wiki/Category:Perks
- Balatro, Ectoplasm: https://balatrowiki.org/w/Ectoplasm
- Loop Hero, tile trade-offs: https://www.pcgamer.com/loop-hero-combos-cards-tile/
- Cult of the Lamb, rituals: https://cult-of-the-lamb.fandom.com/wiki/Rituals

**Idle games**
- Melvor Idle, Agility and its penalties: https://wiki.melvoridle.com/w/Agility , https://mod.io/g/melvoridle/m/free-agility-obstacles-no-negatives ; Ancient Relics: https://wiki.melvoridle.com/w/Ancient_Relics
- Antimatter Dimensions, challenges: https://antimatter-dimensions.fandom.com/wiki/Challenges
- Trimps, Balance and challenges: https://trimps.fandom.com/wiki/Balance , https://trimps.fandom.com/wiki/Challenges
- NGU Idle, challenges: https://ngu-idle.fandom.com/wiki/Challenges
- Idle Champions, patrons: https://idle-champions.fandom.com/wiki/Patrons
- Realm Grinder, challenges: https://realm-grinder.fandom.com/wiki/Challenges
- Kittens Game, religion: https://wiki.kittensgame.com/en/game-tabs/religion

**Folklore**
- Domovoy: https://en.wikipedia.org/wiki/Domovoy ; Bread and salt: https://en.wikipedia.org/wiki/Bread_and_salt
- Rusalka Week: https://en.wikipedia.org/wiki/Rusalka_Week ; Slavic water spirits: https://en.wikipedia.org/wiki/Slavic_water_spirits
- Zhrets: https://en.wikipedia.org/wiki/Zhrets ; Dziady: https://en.wikipedia.org/wiki/Dziady

*Caveat: as in RESEARCH.md, Reddit wasn't searched directly. Community sentiment here comes from Steam discussions, wikis and guides. Melvor Idle has no up-front "pay for a better outcome" system we could find; its nearest cousins are Agility's bonus-with-penalty obstacles, which players tend to dislike.*
