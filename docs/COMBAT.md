# Combat: warding off what comes to the house (v0.3 draft)

> **Status:** a proposal under review, nothing built yet. It follows [CONCEPT.md](CONCEPT.md) §5.1b and the decision log's "Combat and an active-first playthrough". The research behind it: [research/COMBAT_RESEARCH.md](research/COMBAT_RESEARCH.md). The screens are briefed for Claude Design in [design_briefs/COMBAT_UI.md](design_briefs/COMBAT_UI.md).
> All numbers are starting points, to be tuned once it runs and the bot can fight.
> Words in **bold** on first use would go into the glossary and be wrapped in `<Term>` in the game.

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
- **Remedies:** bread (heals 8), chamomile (heals 4) and a yarrow poultice (heals 15). They're used by your **healing rule** ("use a remedy below 40% Health"), which you have from the first fight, no purchase.
- **They're a help, not a need.** Between foes you catch your breath (+10% Health), and gear can keep you going ("+1 Health per foe beaten"). A Safe fight can run with no remedies at all. Remedies are for harder foes and bosses.
- **The Belt holds** 10 of one remedy at tier 1.
- **The only other consumable** is a charm: a bound charm, or a red thread knot (the next 25 foes' special attacks are halved).

**Loadouts are saved.** Each foe remembers the gear last used against it ("Same as last time"), and you can save named loadouts ("Cellar iron", "Boss").

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

**Rolling a random affix: you choose.**
- When you craft a piece, each random slot rolls **2 options** from the piece's pool, each with its value inside a range shown in advance ("Strike +1–2"). You pick one.
- **The Workbench** (a Cellar project) raises it to **3 options**, and the Crafting talent **Keen eye** adds one more.
- The rolls come from the piece's own seed, so reloading a save doesn't change them.

**Reforging** re-rolls one random affix for components: new options, and you may keep the old one.

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

| Piece | Crafting Lvl | Base | Fixed affix | Made from |
|---|---|---|---|---|
| Salt pouch | 1 | Ward 10 | salt | 1 stitched linen + 4 salt |
| Iron knife | 2 | Strike 5 | iron | 2 iron blanks |
| Tallow lantern | 3 | Strike 3 | fire | 1 lantern frame + 3 tallow candles |
| Herb belt | 4 | holds 10 remedies | remedies heal +10% | 2 stitched linen + 4 nettle |
| Censer | 6 | Strike 4 | smoke | 1 lantern frame + 2 mugwort incense |
| Embroidered shirt | 8 | Health +15 | special attacks −20% | 3 stitched linen + 2 red thread |
| Iron amulet | 10 | Ward 22 | iron | 2 iron blanks + 1 tangled lock |
| Hearth poker | 12 | Strike 8 | hearth | 2 iron blanks + 1 hearth ward |

**Components** (repeatable)

| Component | Lvl | Time | Inputs |
|---|---|---|---|
| Stitched linen | 1 | 4 s | 2 rags |
| Iron blank | 2 | 4 s | 2 iron nails |
| Lantern frame | 3 | 5 s | 1 iron blank + 1 glass |
| Red thread | 6 | 5 s | 1 spun thread + 1 St John's wort (its red oil) |
| Red thread knot (a charm) | 7 | 5 s | 2 red thread + 1 salt |

**Crafting talents** (draft)

| Lvl | One side | Other side |
|---|---|---|
| 3 | **Steady hands:** components ×2 on 20% of crafts | **Quick hands:** components 20% faster |
| 6 | **Keen eye:** +1 option when rolling | **Good grain:** random affixes roll in the top half of their range |
| 9 | **Frugal:** upgrades and reforges cost 20% less | **Second look:** reforging shows +1 option |

---

## 5. How a fight works

**One foe at a time, repeating.** Beat it and the next one steps up at once. It goes on until you stop or you're driven off.

**A blow's size:**

> Blow = Strike × weakness bonus × 100 ÷ (100 + the target's Ward) × a roll of 75–125%

- **Resisted:** a few foes shrug off one tag (×0.75), shown on their card.
- **A telling blow:** 5% of your blows land ×2 (affixes and talents raise it). Some foes have telling blows of their own, named on their card.
- **Special attacks** come on a fixed beat, for example "every 4th blow is the Press, a heavy blow". The foe's card names them.
- **The dice** come from the save's seed, like every other chance in the game.

**Driven off.** At 0 Health the fight ends:
- You lose the remedies used on that foe and its loot.
- Everything already won is kept, and you go back to your previous action (the fallback rule).
- The feed says what happened ("Driven off by the Zmora: the Press").

**Health comes back** whenever you're not fighting (full in about 2 minutes of any other work, online or off), and at once with a remedy out of combat.

---

## 6. The readiness tag

Before you begin, the game plays the fight out 1,000 times in the background with your gear. It uses a fixed seed, so the tag doesn't flicker as you look. It shows one tag on the foe's card, updated as you change gear:

| Tag | You win one fight | Means |
|---|---|---|
| **Safe** | 999 in 1,000 or better | Leave it running, offline too |
| **Likely** | 9 in 10 or better | An odd loss now and then |
| **Risky** | 1 in 2 or better | Worth it if you're watching |
| **Deadly** | 1 in 20 or better | A gamble |
| **Hopeless** | less than 1 in 20 | A long shot, but not impossible |

- **The tooltip** gives the rough chance in words ("about 3 in 4"), never the full result.
- **What the tag counts:** everything in the fight: the rolls, telling blows, special attacks, triggers and your healing rule. For a boss, it counts one attempt.
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

**Charms in combat:** the ones there are work as they are (the Window charm: loot chances ×1.5; the Dream pillow: +25% XP), and a foe beaten counts as one action.

---

## 8. Loot

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

| Foe | What it is | Health | Strike | Ward | Every | Weakness | Special | Leaves behind | Warding XP |
|---|---|---|---|---|---|---|---|---|---|
| **Skrzat** | a small house imp, mischief more than harm | 20 | 3 | 0 | 3.5 s | salt | — | Lost button (30%), rags (20%) | 10 |
| **Kikimora** | the one who spins behind the stove, and breaks what's untidy | 45 | 5 | 10 | 3 s | smoke | every 5th: the Clatter ×2 | Spun thread (35%), curio (1%) | 25 |
| **Zmora** | the nightmare that sits on sleepers' chests | 70 | 7 | 20 | 3.5 s | iron | every 4th: the Press ×2.5; telling blows 10% | Tangled lock (40%) | 45 |

**The boss: the sour Domovoi.** The house spirit, sulking since grandmother's death. You don't banish him: you **calm** him (his bar reads "Temper").
- Temper 300, Strike 9, Ward 30, every 3 s *(draft)*.
- Weakness: **hearth**, so the Hearth poker and the chapter's own best work.
- Special: every 3rd blow, *Pots off the shelf* ×2.
- He's shown from the start, with his weakness, what calming him opens and his gift, and you choose when to try.
- He's meant to be Hopeless at first and Likely around Warding and Crafting 10–12 with the right gear.
- **Calming him** (once):
  - **His gift** (fixed, lasting): **+5% speed in all skills, and Health comes back twice as fast** *(numbers draft)*.
  - He shows you the loose flagstone: the way down to the old crypt, the door to Chapter II.
- **Bread and salt:** bringing bread as your remedy against him also gives +20% Strike, the old welcome. It's a small touch the Grimoire can hint at.

**Every boss leaves a gift.** It's a fixed passive bonus, shown on the boss's card before you try, kept for good, and listed with the keepsakes. There's no choice for now.

**Cellar projects** (house projects shown only once the cellar is open)
- **The Workbench:** 3 options when rolling an affix, not 2 *(draft cost: 4 iron blanks + 6 lost buttons)*.
- **Warded cellar door:** +1 saved loadout *(draft cost: 2 iron blanks + 4 tangled locks)*.

**What the leavings are for:** lost buttons and tangled locks go into projects and pieces, and spun thread into red thread. Later come contracts at higher trust levels, and their main use in Chapter II.

**Size:** about 45–75 minutes of optional play after the rite, to Warding and Crafting ~12 and the Domovoi.

---

## 10. Nothing of combat before the cellar opens

Until the Cellar, Warding and Crafting open, the game shows nothing that belongs to combat:
- no combat words in the text or the glossary
- no stats on item tooltips ("heals 8")
- no combat recipes (the yarrow poultice opens with the cellar, not at its level)
- no loot, projects, contracts or talents that mention it

A test checks this, as `text.test.ts` does for the skill descriptions.

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

- **The Cellar tab**, a place of its own with its colour, hero and material (candlelight, stone and cold).
  - **Left:** the foes as cards (name, a line, the readiness tag, the weakness or "?", a lock level).
  - **Right:** the chosen foe: its card (§6), your gear (the five slots, remedies and charm, with the set bonus if any), and one red **Begin** button.
- **While it runs:**
  - two bars (your Health, its Health or Temper) and the blow beat
  - remedies left
  - a short log of the last few blows (telling blows, specials and triggers stand out)
  - the top-bar band, as with any action
- **Crafting** is a skill in the House's list, like the others:
  - **Components** are its recipe rows.
  - **The crafting window** opens from its page: pick a slot and a piece, see its base, fixed affix, random pool with ranges, and materials. Craft, then choose between the rolled options.
  - The same window reforges and upgrades a piece you hold.
- **The foe's weakness** shows as "?" until you've beaten it 10 times (3 with Grave-sense). Its **Bestiary** page in the Grimoire keeps what you've learned.
- **New words** for the glossary: Warding, Crafting, the Cellar, gear, piece, tier, affix, set, reforge, loadout, Health, Ward, Strike, Speed, weakness, telling blow, readiness, driven off, remedy, healing rule, Temper, gift, Bestiary.

---

## 12. Notes for the build

- **Engine:** combat runs inside `advance()` like any action. Its save fields (gear, pieces with their seeds and affixes, loadouts, the bestiary, gifts) need a `SAVE_VERSION` bump.
- **The playthrough bot** gets a second test that crafts gear and clears the cellar, so its pacing is checked too.
- **"Craft" as a word:** once Crafting is a skill, the game's other uses of "craft" need new words, so "crafts" doesn't read as "Crafting's recipes". The Hearth mark charm lasts "40 crafts", and talents say "15% of Chandlery crafts use no inputs". Something like "recipes with inputs" would do.
- **CONCEPT's skill map** calls Alchemy, Chandlery, Sigilcraft and Binding-craft the "Making" skills. Binding-craft (Chapter II: vessels and fetters for Summoning) may fold into Crafting later; that's decided with Chapter II.

---

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
