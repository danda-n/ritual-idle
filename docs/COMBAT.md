# Combat: warding off what comes to the house (v0.5)

> **Status:** built (the cellar, after the Kindling), and tuned by the cellar playthrough. Chapter II comes next. It follows [CONCEPT.md](CONCEPT.md) §5.1b and the decision log's "Combat and an active-first playthrough". The research behind it: [research/COMBAT_RESEARCH.md](research/COMBAT_RESEARCH.md). The screens were briefed for Claude Design in [design_briefs/COMBAT_UI.md](design_briefs/COMBAT_UI.md), and its answer is the handoff in [design_handoff/CELLAR.md](design_handoff/CELLAR.md) (mocks: `cellar.html`, `crafting.html`; foe art in `reference/assets/foes/`).
> The numbers are the game's (`src/content/combat.ts`). The cellar playthrough (`src/engine/playthrough.test.ts`, "the cellar after the Kindling") keeps them honest: it fails if the cellar leaves its 45–75 minute band or the Domovoi stops reading Likely around Warding and Crafting 10–12.
> Words in **bold** on first use are in the glossary (`src/content/glossary.ts`) and wrapped in `<Term>` in the game.

---

## 1. What combat is for

- **A different activity with its own loot.** Spirits leave things behind that nothing else gives, and those go into gear, recipes and, later, rites.
- **Gear to build.** Tiered pieces with stats, affixes, set bonuses and, higher up, triggers, made with a new skill, **Crafting**.
- **Something to beat.** Each foe is a small puzzle (what does it fear?), and each boss opens something and leaves a lasting gift.
- **Always something to do.** There's always a piece to craft or upgrade, a stronger foe to prepare for, or a boss to beat.

**Guardrails** (from the decision log)
- **You prepare, it fights.** There's no manual attack and no clicking during a fight. Switching mid-fight is for min-maxing and bosses only.
- **Surprise, but no traps.** Fights have chance, and the exact outcome isn't shown in advance. A **readiness tag** sums up your chances, worked out from the fight's real rules. Everything that could catch you out (special attacks, hard blows) is named on the foe's card and counted in the tag.
- **Losing is cheap:** only the remedies used on that foe and its loot. You never lose gear, items you hold, levels or progress.
- **No waiting screens.** Health comes back while you do anything else, or at once with a remedy.
- **Offline:** only fights tagged Safe.
- **Nothing of combat before the cellar opens** (§10).

---

## 2. Two new skills

Both open with the cellar, after the Kindling (§9), as the chapter's seventh and eighth skills. Both train like every other skill, with talent pairs every 3 levels, and their caps follow the chapter caps (40 after the Kindling). The cellar covers roughly levels 1–15 of each.

**Warding** (fighting). Fighting gives Warding XP. Most of your strength comes from your **gear**, not your level. Warding's level gives only:
- **+2 Health per level** (Health 40 at level 1)
- **1% faster per level**
- its talents (§7)

Warding lives in the Cellar tab, not the House's skill list. Everything that speeds up a skill speeds up your blows too: Janko's help, the Window charm, a blessing, the Domovoi's gift. With no Hand or Lantern piece you strike with your bare hands (Strike 2).

**Crafting** (making gear). It has two kinds of recipes:
- **Components** are repeatable recipe rows, like any skill's, and are Crafting's idle training: an iron blank, stitched linen, a lantern frame, red thread (§4).
- **Pieces** are the gear, made once each in the **crafting window** (§11) from components and materials, and later upgraded and reforged.

---

## 3. Gear, remedies and a charm

**What you take into a fight:**
- **Five gear slots**, each with one durable **piece** that isn't used up.
- **Remedies** carried in the Belt (one kind at a time).
- **One charm.**

| Slot | Gives | Tier 1 pieces (the cellar) |
|---|---|---|
| **Amulet** | Ward, and a tag | Salt pouch (salt) · Iron amulet (iron) |
| **Hand** | Strike, and a tag | Iron knife (iron) · Hearth poker (hearth) |
| **Lantern** | Strike, and a tag | Tallow lantern (fire) · Censer (smoke) |
| **Garment** | Health, softer special attacks | Embroidered shirt |
| **Belt** | Holds remedies | Herb belt |
| **Charm** | A charm's effect | any bound charm, or a red thread knot |

**Your four stats**

| Stat | What it does | Comes from |
|---|---|---|
| **Health** | Run out and you're driven off | Warding level, the Garment, affixes, gifts |
| **Ward** | Each blow you take is cut: Ward 50 takes a third off, Ward 100 half | The Amulet, affixes |
| **Strike** | The size of each of your blows | The Hand and the Lantern, affixes |
| **Speed** | How often you strike: every 3 s at first | Warding level, affixes, talents |

**Tags and weakness.** Every foe fears one tag (salt, smoke, fire, iron, hearth…).
- **Your blows ×1.5** if your Hand or Lantern carries its tag.
- **Its blows halved** if your Amulet does.
- The wrong tags simply get no bonus, never a penalty. So the best gear changes by foe, and saved loadouts earn their keep.

**Remedies: a small layer.**
- **Remedies:** bread (heals 8), chamomile (heals 4) and a yarrow poultice (heals 15). They're used by your **healing rule** ("use a remedy below 40% Health", 10–80% in steps of 5), which you have from the first fight, no purchase. Out of a fight you can use one at once.
- **They're a help, not a need.** Between foes you catch your breath (+10% Health), and gear can keep you going ("+1 Health per foe beaten"). A Safe fight can run with no remedies at all. Remedies are for harder foes and bosses.
- **The Belt holds** 10 of one remedy at tier 1. At Begin it takes as many as you hold, up to that; they're used from your stores as the rule needs them. With no Belt you carry none.
- **The only other consumable** is a charm: a bound charm, or a red thread knot (the next 25 foes' special attacks are halved). The charm you wear is used at Begin, and again between foes, whenever none of it is on.

**Loadouts are saved.** Each foe remembers the gear last used against it: "Same as last time" puts it back (choosing a foe never changes your gear by itself). You can also save **named loadouts** ("Cellar iron", "Boss"): 2 places, 3 with the Warded cellar door. A loadout keeps the pieces, the remedy, the charm and the healing rule.

**Gear is locked while a fight runs.** To change it, stop, change, and begin again (a boss attempt starts over).

---

## 4. Crafting: pieces, affixes, upgrades

**A piece** has:
- **Base stats** by tier.
- **Fixed affixes:** the piece's identity (its tag, and one trait). Always the same.
- **Random affixes:** rolled when you craft it (below).

| Tier | Fixed | Random | When |
|---|---|---|---|
| 1 | 1 | 1 | the cellar |
| 2 | 2 | 1 | Chapter II |
| 3+ | 2 | 2 | later |

**Making a piece takes time.** It runs in the action slot like a recipe (12–24 s at its base speed, faster with Crafting's speed), gives Crafting XP, and its materials go when it starts (stopping gives them back). When it's done, work goes back to what ran before, and its options wait for you, even if it finished while you were away. You make one of each piece.

**Rolling a random affix: you choose.**
- When a piece is done, each random slot rolls **2 options** from the piece's pool, distinct kinds first, each with its value inside a range shown in advance ("Strike +1–2"). You pick one. A value in the top quarter of its range is marked "▲ High roll".
- **The Workbench** (a Cellar project) raises it to **3 options**, and the Crafting talent **Keen eye** adds one more.
- The options are saved as soon as they're rolled, so reloading a save doesn't change them.

**Reforging** re-rolls one random affix, at once, for a few components (each piece has its own reforge cost, e.g. the Iron knife: 1 iron blank): new options, and you may keep the old one. The Frugal talent makes some reforges free.

**Upgrading in place.** A piece goes up a tier with new materials. It keeps its affixes and gains the next tier's slots, so nothing you built goes to waste. Tier 2 waits for Chapter II's materials.

**Affix pools, tier 1** (each slot rolls from its own)

| Slot | Options (value ranges) |
|---|---|
| Amulet | Ward +3–5 · Health +5–8 · special attacks −10–15% |
| Hand | Strike +1–2 · Speed +3–5% · telling blows +2–3% |
| Lantern | Strike +1–2 · loot chances +10–15% · Warding XP +5–10% |
| Garment | Health +4–8 · Ward +2–4 · +1 Health per foe beaten |
| Belt | holds +2–4 remedies · remedies heal +10–20% |

**Triggers** ("a telling blow heals 3", "every 10th foe, the lantern flares ×3") come in higher tiers' pools and on the boss's pieces.

**Sets** come from fixed identities, so they're chosen, never rolled:
- **Grandmother's set** is the Salt pouch, Embroidered shirt and Herb belt.
- 2 pieces: +10% Ward.
- 3 pieces: the first special attack of each fight misses.

**Draft tier 1 pieces**

| Piece | Crafting Lvl | Base | Fixed affix | Made from | Time · XP | Reforge |
|---|---|---|---|---|---|---|
| Salt pouch | 1 | Ward 10 | salt | 1 stitched linen + 4 salt | 12 s · 15 | 4 salt |
| Iron knife | 2 | Strike 5 | iron | 2 iron blanks | 12 s · 20 | 1 iron blank |
| Tallow lantern | 3 | Strike 3 | fire | 1 lantern frame + 3 tallow candles | 15 s · 28 | 3 tallow candles |
| Herb belt | 4 | holds 10 remedies | remedies heal +10% | 2 stitched linen + 4 nettle | 15 s · 35 | 1 stitched linen + 2 nettle |
| Censer | 6 | Strike 4 | smoke | 1 lantern frame + 2 mugwort incense | 18 s · 50 | 1 mugwort incense |
| Embroidered shirt | 8 | Health +15 | special attacks −20% | 3 stitched linen + 2 red thread | 20 s · 70 | 1 red thread |
| Iron amulet | 10 | Ward 22 | iron | 2 iron blanks + 1 tangled lock | 20 s · 90 | 1 iron blank |
| Hearth poker | 12 | Strike 8 | hearth | 2 iron blanks + 1 hearth ward | 24 s · 120 | 1 iron blank |

**Components** (repeatable)

| Component | Lvl | Time | XP | Inputs |
|---|---|---|---|---|
| Stitched linen | 1 | 4 s | 4 | 2 rags |
| Iron blank | 2 | 4 s | 6 | 2 iron nails |
| Lantern frame | 3 | 5 s | 9 | 1 iron blank + 1 glass |
| Red thread | 6 | 5 s | 12 | 1 spun thread + 1 St John's wort (its red oil) |
| Red thread knot (a charm) | 7 | 5 s | 13 | 2 red thread + 1 salt |

Crafting's XP is half of what Chapter 1's recipes give for the time, on purpose: the cellar is meant to last 45–75 minutes, and at Chapter 1's rates Crafting reached 12 in under half an hour.

**Crafting talents** (draft)

| Lvl | One side | Other side |
|---|---|---|
| 3 | **Steady hands:** components ×2 on 20% of crafts | **Quick hands:** components 20% faster |
| 6 | **Keen eye:** +1 option when rolling | **Good grain:** random affixes roll in the top half of their range |
| 9 | **Frugal:** 25% of reforges use no components | **Second look:** reforging shows +1 option |
| 12–30 | drafts in `src/content/talents.ts` (bulk linen, Warding speed, thrift on blanks and glass, more options, top-half rolls, free reforges) | |

---

## 5. How a fight works

**One foe at a time, repeating.** Beat it and the next one steps up at once. It goes on until you stop or you're driven off.

**A blow's size:**

> Blow = Strike × weakness bonus × 100 ÷ (100 + the target's Ward) × a roll of 75–125%

- **Resisted:** a few foes shrug off one tag (×0.75), shown on their card.
- **A telling blow:** 5% of your blows land ×2 (affixes and talents raise it). Some foes have telling blows of their own, named on their card.
- **Special attacks** come on a fixed beat, for example "every 4th blow is the Press, a heavy blow". The foe's card names them.
- **The dice** come from the save's seed, like every other chance in the game.
- **Who strikes first:** each side strikes on its own timer, you on a tie. When a foe goes down, the next steps up at once (its timer starts fresh; yours carries on).
- **Grandmother's set (3 pieces):** the first special attack of each foe misses.

**Driven off.** At 0 Health the fight ends:
- You lose the remedies used on that foe and its loot.
- Everything already won is kept, and you go back to your previous action (the fallback rule).
- A toast says what happened ("Driven off by the Zmora", "the Press"), and the Cellar keeps a summary of the fight until you dismiss it: what hit you, the cost, what you kept, and one piece of advice that points at the fix (with "Wear it ›" when you hold the right piece).

**Stopping** (Stop, or starting other work) ends the fight with everything kept; the Cellar shows its summary.

**Stop rules** say when a fight stops by itself, checked after each foe: never (the default), after a number of foes, once you hold enough of one of its leavings ("10 lost buttons", for a project), or when the Belt is empty. Work then goes back to what ran before, as after being driven off. The rule is set next to Begin and kept for every fight.

**This fight** keeps its own numbers while it runs, and in its summary after: time, foes warded off, Warding XP (and per hour), your biggest blow, the biggest blow you took, and remedies used. **Records** per foe are kept for good: your best blow against it, its worst against you, and the most of it beaten in one fight.

**Health comes back** whenever you're not fighting (full in about 2 minutes of any other work, online or off), and at once with a remedy out of combat.

---

## 6. The readiness tag

Before you begin, the game plays the fight out 1,000 times in the background with your gear, from full Health, with the remedies you'd carry. It uses a fixed seed, so the tag doesn't flicker as you look. It shows one tag on the foe's card, updated as you change gear:

| Tag | You win one fight | Means |
|---|---|---|
| **Safe** | 999 in 1,000 or better, **and** long runs hold (below) | Leave it running, offline too |
| **Likely** | 9 in 10 or better | An odd loss now and then |
| **Risky** | 1 in 2 or better | Worth it if you're watching |
| **Deadly** | 1 in 20 or better | A gamble |
| **Hopeless** | less than 1 in 20 | A long shot, but not impossible |

**Safe means safe to leave.** Winning one foe 999 times in 1,000 isn't enough: a Safe fight left running overnight meets thousands of foes in a row. So Safe also needs five runs of 1,000 foes in a row (Health carried over, catching your breath between, no remedies, since they'd run out) to never bring you below a fifth of your Health. A boss is one attempt, so for a boss Safe is just 999 in 1,000. The tag is fixed when you begin: it decides whether the fight goes on while you're away.

- **The tooltip** gives the rough chance in words ("about 3 in 4"), never the full result.
- **What the tag counts:** everything in the fight: the rolls, telling blows, special attacks, the set's missed special and your healing rule. For a boss, it counts one attempt. It reads your gear from full Health; your Health now shows on its own bar ("Health 30/73 · full in 1m").
- **With remedies**, one more line: "Remedies last about N foes".
- **What the foe's card shows:**
  - its Health, Strike, Ward and speed
  - its special attacks and telling blows, by name
  - its weakness, after 10 beaten (§11)
  - what it leaves behind

---

## 7. Warding talents

Pairs every 3 levels, the same kinds as the other skills, in one vocabulary. Draft pairs for the cellar levels:

| Lvl | One side | Other side |
|---|---|---|
| 3 | **Steady hand:** Strike +15% | **Sure line:** Ward +15% |
| 6 | **Second wind:** catch your breath +20% between foes (not +10%) | **Hot blood:** Strike +25%, Ward −10% |
| 9 | **Herb-wise:** remedies heal +40% | **Hardy:** +20 Health |
| 12 | **Grave-sense:** a foe's weakness shows after 3 beaten (not 10) | **Counter-craft:** the right tag gives ×1.75, not ×1.5 |
| 15 | **Keen strike:** telling blows 5% → 12% | **Deep pockets:** loot chances ×1.5 |
| 18–30 | drafts in `src/content/talents.ts` (more Ward, Strike, Health, breath, remedies, telling blows, ×2 for the right tag) | |

**Charms in combat:** the ones there are work as they are (the Window charm: loot chances ×1.5; the Dream pillow: +25% XP), and a foe beaten counts as one action (omens can turn up from it too).

---

## 8. Loot

- **Foe mastery:** beating one kind of foe again and again makes you better against it, for good. At 25 beaten: loot chances ×1.25 against it; at 100: +25% Warding XP from it; at 250: your blows +10% against it. Shown on the chosen foe and in the Bestiary. Not for bosses. (In the cellar playthrough it barely moves the pacing: the bot reaches tier I on two foes.)
- **Mostly ingredients, not finished gear.** The spirits' leavings go into components, pieces, upgrades and, later, rites. Gear is crafted, never dropped (the boss's pieces are made from what he leaves).
- **Chance finds follow the same rule as everywhere** (one list of bonuses, past 100% gives extras), so the chip tooltips work here too.
- **Curios** can drop (+insight, a Grimoire story).
- **No coin.** Coin stays contract-only, as decided.
- **One new Herbalism recipe**, opening with the cellar: **Yarrow poultice** (Herbalism 9: 2 yarrow + 1 rags), the strongest remedy. Yarrow is a wound herb in folk medicine.

---

## 9. The cellar: the Chapter 1 taste

**The story.** The Kindling woke the circle, and the circle's light pushes what lingered in the house down into the one place it doesn't reach: the cellar, shut since grandmother died. A new place opens after the rite: **the Cellar** tab, with Warding and Crafting.

Chapter 1's path to the rite doesn't change. The bot still ends the chapter at the rite; the cellar is what's next.

**The foes** (the house's own spirits, from the folklore; details in [research/combat_research/folklore.md](research/combat_research/folklore.md))

| Foe | What it is | Health | Strike | Ward | Every | Weakness | Special | Leaves behind | Warding XP | Opens at |
|---|---|---|---|---|---|---|---|---|---|---|
| **Skrzat** | a small house imp, mischief more than harm | 20 | 3 | 0 | 3.5 s | salt | — | Lost button (30%), rags (20%) | 5 | Warding 1 |
| **Kikimora** | the one who spins behind the stove, and breaks what's untidy | 45 | 5 | 10 | 3 s | smoke | every 5th: the Clatter ×2 | Spun thread (35%), curio (1%) | 12 | Warding 3 |
| **Zmora** | the nightmare that sits on sleepers' chests | 70 | 7 | 20 | 3.5 s | iron | every 4th: the Press ×2.5; telling blows 10% | Tangled lock (40%) | 22 | Warding 6 |

The XP is half of the first draft's, for the same reason as Crafting's (§4).

**The boss: the sour Domovoi.** The house spirit, sulking since grandmother's death. You don't banish him: you **calm** him (his bar reads "Temper").
- Temper 800, Strike 12, Ward 40, every 3 s. 150 Warding XP. (The first draft, Temper 300 and Strike 9, fell in 13 minutes at Warding 6 without the poker: remedies outhealed him.)
- Weakness: **hearth**, so the Hearth poker and the chapter's own best work.
- Special: every 3rd blow, *Pots off the shelf* ×2.
- He's shown from the start, with his weakness, what calming him opens and his gift, and you choose when to try.
- He's Hopeless at first and turns Likely as the Hearth poker is made: in the cellar playthrough, at Warding 12 and Crafting 12, with poultices and the talents taken. A level-40 player with no remedies and no talents is still Hopeless: he's a puzzle of gear, remedies and talents, not of levels.
- **Calming him** (once):
  - **His gift** (fixed, lasting): **+5% speed in all skills, and Health comes back twice as fast** *(numbers draft)*.
  - He shows you the loose flagstone: the way down to the old crypt, the door to Chapter II.
- **Bread and salt:** bringing bread as your remedy against him also gives +20% Strike, the old welcome. It's a small touch the Grimoire can hint at.

**Every boss leaves a gift.** It's a fixed passive bonus, shown on the boss's card before you try, kept for good, and listed with the keepsakes. There's no choice for now.

**Cellar projects** (house projects shown only once the cellar is open)
- **The Workbench:** 3 options when rolling an affix, not 2 *(draft cost: 4 iron blanks + 6 lost buttons)*.
- **Warded cellar door:** +1 saved loadout *(draft cost: 2 iron blanks + 4 tangled locks)*.

**What the leavings are for:** lost buttons and tangled locks go into projects and pieces, and spun thread into red thread. Later come contracts at higher trust levels, and their main use in Chapter II.

**Size:** about 45–75 minutes of optional play after the rite, to Warding and Crafting ~12 and the Domovoi. The cellar playthrough calms him at 50–54 minutes (three seeds), with every piece made on the way.

**Leavings in the item lookup** say which foe leaves them and which pieces use them.

---

## 10. Nothing of combat before the cellar opens

Until the Cellar, Warding and Crafting open, the game shows nothing that belongs to combat:
- no combat words in the text or the glossary
- no stats on item tooltips ("heals 8")
- no combat recipes (the yarrow poultice opens with the cellar, not at its level)
- no loot, projects, contracts or talents that mention it

`combat.test.ts` checks it: no Chapter 1 text (skills, items, notes, projects, keepsakes, glossary) uses a combat word, and no cellar recipe or project shows before the rite at any level.

**The introduction.** When the cellar opens, a large dialog introduces it, like the chapter end. It has a few short sections with a small drawing each:
1. **The cellar:** what's down there, and why now (grandmother's note, two lines).
2. **How a fight goes:** pick a foe, put on your gear, begin; it fights on by itself until you stop.
3. **Gear:** the five slots, and that Crafting makes the pieces (two options to choose from for each random affix).
4. **Weakness:** each foe fears something; the right tags make it much easier.
5. **Readiness:** the five tags, and what Safe means.
6. **Losing:** what it costs (remedies and that foe's loot) and what it never costs.
7. **Away:** Safe fights keep going while you're away.
8. **Bosses:** the Domovoi, what calming him opens, and his gift.

One button: "Go down to the cellar". It can be read again from the Cellar tab ("How it works") and from the Guide.

---

## 11. On screen (for DESIGN.md when it's built)

The screens are designed in [design_handoff/CELLAR.md](design_handoff/CELLAR.md), which has the full detail; this is the outline.

- **The Cellar tab**, a place of its own: flint `#8c9cf2` on deep `#232a4d`, cold plain stone with one still candle glow (the place's only glow). The hero holds the title, one lore line, "How it works", and three numbers: Warding level, foes warded off, the Domovoi's state.
- **Two columns** (one column under 1100px, foes first):
  - **Left: Warding, then You.** The **Warding panel** says what the skill is in plain sentences (XP from each foe, what a level gives), with its level, an XP bar, XP/h while fighting, and what's next (a foe, a talent). **You:** two tabs, Gear and Your stats, over four plain numbers (Health, Ward, Strike, a blow every N s):
    - **Gear:** the five slots as tiles (icon, slot, piece, its base stat, tier; the tag badge turns verdigris with a ✓ when the chosen foe fears it; Grandmother's set pieces have a red stitched line), the set line, one detail card for the tile picked (with Change: a picker of the pieces you hold, ending "Make more: Crafting ›"), the remedy and charm, and the healing rule with a − / + stepper. Gear is locked while a fight runs. The picker previews each piece against the chosen foe: the readiness change ("Risky → Likely") and what it does to the blows ("Your blows 10 → 14").
    - **Your stats:** each stat broken into its parts, and one plain line about the chosen foe ("Your blows land for about 6.5 · 3 to win").
  - **Right, the foes:** a card per foe with only its big woodcut art, name, readiness tag (or the level it opens at) and "Fears ?" (or the weakness); the Domovoi's card set apart, wider and warmer. Under them the **chosen foe**: portrait, name, its numbers in one line, the large readiness tag (a Tip with the rough chance) and the red **Begin** (when it can't be pressed it says why), then what to watch for, what it leaves, its mastery and the stop rule.
- **Readiness** is always the word plus 0–4 diamond pips, never colour alone: Safe `#5ebaaf`, Likely `#92b3cb`, Risky `#f2a97c`, Deadly `#f28a74`, Hopeless `#a8a49b`.
- **While it runs** the right column becomes the arena: the foe's bar on top, its big art on the candle glow, your Health below, a thin "Next blow" timer. Your blow shakes the art with a damage pop (a telling blow pops bigger, "✶ Telling blow ×2"); its blow lunges and your Health row flashes red; a foe warded off fades and returns. Under it, **Spoils this fight**: one big tile per thing the foe can leave (its icon, its name and +N this fight, glowing as a find lands; its chance and how many you hold in a Tip), then **This fight** (time, warded off, XP and XP/h, your best blow, the worst you took, remedies) and your records against it. There's no blow-by-blow log. The head shows the stop rule's progress ("stops at 50 (23 to go)"). The top bar's now-working band shows Warding, the foe's portrait and Health, and Stop. Reduced motion stops everything but the bars.
- **End states:** stopped is one line with Dismiss; **driven off** is a calm panel in place (what hit you, Cost, Kept, Now, and one line of advice that links to the fix: "An iron Amulet halves its blows · Wear it ›").
- **Dialogs:** the introduction (§10; also "How it works"), the Domovoi calmed (his art, the gift in a gold-edged box, since a gift is a keepsake), and the away summary with the cellar line first.
- **Crafting** is a skill in the House's list. Its page has the component rows and opens the **crafting window**: a slot rail → a piece list (locked ones show their level) → the piece card (tiers, base, fixed affix, the random pool with ranges, set, a Tier 2 preview, materials with have/need, time, XP, Craft). After Craft the 2 options (3 with the Workbench) flip over one by one and you Choose; a high roll says "▲ High roll" in verdigris, never gold. The same window reforges (the current affix above the new rolls, "Keep the old one") and upgrades (what Tier 2 adds; locked until Chapter II's materials).
- **New skill colours:** Warding hoarfrost `#b6dde8`, Crafting flax `#d6b98a`.
- **The foe's weakness** shows as "?" until you've beaten it 10 times (3 with Grave-sense). Its **Bestiary** page in the Grimoire (an art tile per foe: fears, specials, loot or the boss's gift; foes not met are locked tiles) keeps what you've learned.
- **New words** for the glossary: Warding, Crafting, the Cellar, gear, piece, tier, affix, set, reforge, loadout, Health, Ward, Strike, Speed, weakness, telling blow, readiness, driven off, remedy, healing rule, Temper, gift, Bestiary.

## 12. In the code

- **Engine:** `src/engine/combat.ts` (stats, the fight rules, readiness, fights and pieces inside `advance()`), commands in `commands.ts`, content in `src/content/combat.ts`. Save version 12 adds `cellar` (Health, pieces, gear, loadouts, per-foe memory, foes beaten, gifts, the pending roll, the last fight's summary), `fight` and `job`; version 13 adds the records, the stop rule and a fight's own numbers. Fights and pieces keep their timers relative to themselves, so the dev time skip needs nothing new.
- **Two playthroughs:** the Chapter 1 bot, then a cellar bot that carries on from the Kindling: it makes each piece as Crafting reaches it, trains whichever of Warding and Crafting is behind, chooses its affixes, and tries the Domovoi once he reads Likely. `npm run pacing` prints both.
- **"Craft" as a word:** the game's other uses of "craft" became "actions that use inputs" (the Hearth mark lasts "the next 40 actions that use inputs"; talents say "15% of Chandlery actions use no inputs"), so "craft" never reads as the Crafting skill.
- **Binding-craft** (Chapter II: vessels and fetters for Summoning) may fold into Crafting; that's decided with Chapter II.

## Changelog

- **v0.1 (2026-09-29):** first proposal: the Warding skill, a four-slot loadout (Ward, Light, Remedy, Charm), four stats, fights with no dice and a full forecast, cheap losing, offline for Safe fights, Warding talents, loot as ingredients, and the cellar taste (Skrzat, Kikimora, Zmora, the sour Domovoi).
- **v0.2 (2026-09-29):** after the designer's review:
  - Fights have chance (rolls and telling blows), and the forecast is replaced by a readiness tag worked out in the background, with the rough chance on hover.
  - Every boss leaves a fixed lasting gift.
  - Nothing of combat shows before it opens, and a large introduction when it does.
  - Weaknesses show after 10 beaten.
  - The retreat rule is dropped.
- **v0.3 (2026-09-29):** gear instead of consumable loadouts:
  - A new skill, Crafting, with components (repeatable) and pieces (the crafting window).
  - Five durable gear slots with tiers and affixes: 1 fixed + 1 random at tier 1, up to 2 + 2 later. Random affixes offer 2 options to choose from (3 with the Workbench project).
  - Reforging, upgrading in place, and sets.
  - Consumables cut to remedies and charms; you catch your breath between foes, so remedies are a help, not a need.
  - The red thread knot moves to Crafting.
- **Screens designed (2026-10-21):** Claude Design's handoff ([design_handoff/CELLAR.md](design_handoff/CELLAR.md)) is in: the Cellar with You on the left and the foes on the right (the brief had them the other way), gear tiles with a detail card and a You / Your stats switch, readiness pips, the arena, driven off in place, the Bestiary, and the crafting window. §11 follows it. Combat is the next build, before Chapter II.
- **v0.4 (2026-10-21): built.** The cellar, Warding and Crafting are in the game, to the handoff's screens. Decided while building: Safe means safe for long runs (five runs of 1,000 foes, never below a fifth of your Health), gear is locked while a fight runs, named loadouts (2, 3 with the Warded cellar door) besides per-foe "Same as last time", pieces take time in the action slot. Tuned with the cellar playthrough: Crafting and foe XP halved, the Domovoi raised to Temper 800, Strike 12, Ward 40 (he fell in 13 minutes before). New: bare hands strike 2; foes open at Warding 1/3/6; the Grandmother's-set miss is per foe; Frugal is a 25% free reforge; talents 12–30 drafted for both skills.
- **v0.5 (2026-10-21): after the designer's first look.** Stop rules (after N foes, at N of a leaving, when the Belt is empty), foe mastery (25/100/250 beaten), the fight's own numbers and per-foe records, and a gear preview in the picker. On screen: a Warding panel that explains the skill, a calmer You panel and foe cards, a Spoils panel and "This fight" in place of the blow log.
