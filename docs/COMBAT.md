# Combat: warding off what comes to the house (v0.2 draft)

> **Status:** a proposal under review, nothing built yet. It follows [CONCEPT.md](CONCEPT.md) §5.1b and the decision log's "Combat and an active-first playthrough". The research behind it: [research/COMBAT_RESEARCH.md](research/COMBAT_RESEARCH.md).
> All numbers are starting points, to be tuned once it runs and the bot can fight.
> Words in **bold** on first use would go into the glossary and be wrapped in `<Term>` in the game.

---

## 1. What combat is for

- **A different activity with its own loot.** Spirits leave things behind that nothing else gives, and those go into recipes and, later, rites.
- **Something to beat.** Each foe is a small puzzle (what does it fear?), and each boss opens something and leaves a lasting gift.
- **Always something to do.** There's always a stronger foe to prepare for, a boss to beat, or supplies to make for the next fight.
- **The house makes the weapons.** Combat uses what the crafting skills already make (salt lines, sigils, wards, candles, incense, herbs), so every skill matters in a fight.

**Guardrails** (from the decision log)
- **You prepare, it fights.** There's no manual attack and no clicking during a fight. Switching mid-fight is for min-maxing and bosses only.
- **Surprise, but no traps.** Fights have chance, and the exact outcome isn't shown in advance. A **readiness tag** sums up your chances, worked out from the fight's real rules. Everything that could catch you out (special attacks, hard blows) is named on the foe's card and counted in the tag.
- **Losing is cheap:** only the supplies spent on that foe and its loot. You never lose gear, items you hold, levels or progress.
- **No waiting screens.** Health comes back while you do anything else, or at once with a remedy.
- **Offline:** only fights tagged Safe.
- **Nothing of combat before Warding opens** (§9).

---

## 2. The skill: Warding

**Warding** is the combat skill. It opens with the cellar, after the Kindling (§8), as the chapter's seventh skill. It trains like every other skill: fighting gives Warding XP.

Most of your strength comes from the **loadout**, not your level. Warding's level gives only:
- **+2 Health per level** (Health 40 at level 1)
- **1% faster per level**, like every skill
- **talent pairs every 3 levels**, like every skill (§6)

Warding's cap follows the chapter caps (40 after the Kindling). The cellar covers roughly levels 1–15.

---

## 3. The loadout

Four slots, each filled from what you've made. Every slot has a job, and the Ward and Light can match a foe's weakness.

| Slot | Takes | Gives | Used up |
|---|---|---|---|
| **Ward** | Sigilcraft goods: salt line, ash sigil, chalk segment, iron ward, hearth ward | **Ward** (softens every blow you take) | 1 per 5 foes beaten |
| **Light** | Candles and incense: tallow, beeswax and hearth candles, mugwort and juniper incense | **Strike** (how hard you hit) | 1 per 3 foes beaten |
| **Remedy** | One kind of food or herb: bread, chamomile or a yarrow poultice | Healing, used by your **healing rule** | 1 each time the rule fires |
| **Charm** | A charm: any you've bound on the Experiments tab, or the red thread knot (§7) | The charm's own effect | By its uses (a foe beaten counts as an action) |

**Your four stats**

| Stat | What it does | Comes from |
|---|---|---|
| **Health** | Run out and you're driven off | Warding level, talents, gifts |
| **Ward** | Each blow you take is cut: Ward 50 takes a third off, Ward 100 half | The Ward slot, talents, charms |
| **Strike** | The size of each of your blows | The Light slot, talents, charms |
| **Speed** | How often you strike: every 3 s at first | Warding level, talents, charms |

**The healing rule:** "Use a remedy below 40% Health". The line is yours to set, and the rule is there from the first fight (no purchase).

**Loadouts are saved.** Each foe remembers the last loadout used against it ("Same as last time"), and you can save named loadouts ("Cellar salt", "Boss"). Missing items are shown on the loadout before you begin.

**Draft item values**

| Item | Stat | Tag |
|---|---|---|
| Salt line | Ward 10 | salt |
| Ash sigil | Ward 18 | ash |
| Chalk segment | Ward 22 | chalk |
| Iron ward | Ward 30 | iron |
| Hearth ward | Ward 45 | hearth |
| Tallow candle | Strike 4 | fire |
| Beeswax candle | Strike 6 | fire |
| Mugwort incense | Strike 5 | smoke |
| Juniper incense | Strike 8 | smoke |
| Hearth candle | Strike 10 | hearth |
| Bread | heals 8 | — |
| Chamomile | heals 4 | — |
| Yarrow poultice | heals 15 | — |

---

## 4. How a fight works

**One foe at a time, repeating.** Beat it and the next one steps up at once. It goes on until you stop, a Ward or Light runs out, or you're driven off.

**A blow's size:**

> Blow = Strike × weakness bonus × 100 ÷ (100 + the target's Ward) × a roll of 75–125%

- **Weakness:** every foe fears one tag.
  - **The right Light** makes your blows ×1.5.
  - **The right Ward** halves its blows.
  - **The wrong ones** simply get no bonus, never a penalty.
- **Resisted:** a few foes shrug off one tag (×0.75), shown on their card.
- **A telling blow:** 5% of your blows land ×2 (talents raise it). Some foes have telling blows of their own, named on their card.
- **Special attacks** come on a fixed beat, for example "every 4th blow is the Press, a heavy blow". The foe's card names them.
- **The dice** come from the save's seed, like every other chance in the game.

**Driven off.** At 0 Health the fight ends:
- You lose the supplies spent on that foe and its loot.
- Everything already won is kept, and you go back to your previous action (the fallback rule).
- The feed says what happened ("Driven off by the Zmora: the Press").

**Health comes back** whenever you're not fighting (full in about 2 minutes of any other work, online or off), and at once with a remedy out of combat.

---

## 5. The readiness tag

Before you begin, the game plays the fight out 1,000 times in the background with your loadout. It uses a fixed seed, so the tag doesn't flicker as you look. It shows one tag on the foe's card, updated as you change the loadout:

| Tag | You win one fight | Means |
|---|---|---|
| **Safe** | 999 in 1,000 or better | Leave it running, offline too |
| **Likely** | 9 in 10 or better | An odd loss now and then |
| **Risky** | 1 in 2 or better | Worth it if you're watching |
| **Deadly** | 1 in 20 or better | A gamble |
| **Hopeless** | less than 1 in 20 | A long shot, but not impossible |

- **The tooltip** gives the rough chance in words ("about 3 in 4"), never the full result.
- **What the tag counts:** everything in the fight: the rolls, telling blows, special attacks and your healing rule. For a boss, it counts one attempt.
- **One more line on the card:** "Supplies last about N foes". That's for planning; it doesn't give away how a fight goes.
- **What the foe's card shows:**
  - its Health, Strike, Ward and speed
  - its special attacks and telling blows, by name
  - its weakness, after 10 beaten (§10)
  - what it leaves behind

---

## 6. Talents (Warding)

Pairs every 3 levels, the same kinds as the other skills, in one vocabulary. Draft pairs for the cellar levels:

| Lvl | One side | Other side |
|---|---|---|
| 3 | **Steady hand:** Strike +15% | **Sure line:** Ward +15% |
| 6 | **Thrifty wick:** lights last 50% longer | **Hot wick:** Strike +25%, lights last 25% less |
| 9 | **Herb-wise:** remedies heal +40% | **Hardy:** +20 Health |
| 12 | **Grave-sense:** a foe's weakness shows after 3 beaten (not 10) | **Counter-craft:** the right Light gives ×1.75, not ×1.5 |
| 15 | **Keen eye:** telling blows 5% → 12% | **Deep pockets:** loot chances ×1.5 |

**Other skills' talents** can touch combat later (a Sigilcraft talent that makes wards stronger, say), but not in the first version.

**Charms in combat:**
- The ones there are work as they are: the Window charm gives loot chances ×1.5, the Dream pillow +25% Warding XP, and a foe beaten counts as one action.
- The combat charm is the red thread knot, an ordinary recipe (§7).

---

## 7. Loot and new recipes

- **Mostly ingredients, not finished gear.** The spirits' leavings go into new recipes and, later, rites. Gear stays crafted.
- **Chance finds follow the same rule as everywhere** (one list of bonuses, past 100% gives extras), so the chip tooltips work here too.
- **Curios** can drop (+insight, a Grimoire story).
- **No coin.** Coin stays contract-only, as decided.

**Two new recipes, both opening with Warding:**

| Recipe | Skill | Lvl | Inputs → Output | For |
|---|---|---|---|---|
| **Yarrow poultice** | Herbalism | 9 | 2 yarrow + 1 rags → Yarrow poultice | The strongest remedy (heals 15). Yarrow is a wound herb in folk medicine. |
| **Red thread knot** | Sigilcraft | 6 | 2 spun thread + 1 St John's wort → Red thread knot | A charm for the Charm slot: the next 25 foes' special attacks are halved. Red thread against the unclean is widely attested, and St John's wort gives a red oil. |

The red thread knot is an ordinary recipe on Sigilcraft's list, not a hidden one, so it's easy to find. It needs spun thread, which only the Kikimora leaves (§8).

---

## 8. The cellar: the Chapter 1 taste

**The story.** The Kindling woke the circle, and the circle's light pushes what lingered in the house down into the one place it doesn't reach: the cellar, shut since grandmother died. A new place opens after the rite: **the Cellar** tab.

Chapter 1's path to the rite doesn't change. The bot still ends the chapter at the rite; the cellar is what's next.

**The foes** (the house's own spirits, from the folklore; details in [research/combat_research/folklore.md](research/combat_research/folklore.md))

| Foe | What it is | Health | Strike | Ward | Every | Weakness | Special | Leaves behind | Warding XP |
|---|---|---|---|---|---|---|---|---|---|
| **Skrzat** | a small house imp, mischief more than harm | 20 | 3 | 0 | 3.5 s | salt | — | Lost button (30%) | 10 |
| **Kikimora** | the one who spins behind the stove, and breaks what's untidy | 45 | 5 | 10 | 3 s | smoke | every 5th: the Clatter ×2 | Spun thread (35%), curio (1%) | 25 |
| **Zmora** | the nightmare that sits on sleepers' chests | 70 | 7 | 20 | 3.5 s | iron | every 4th: the Press ×2.5; telling blows 10% | Tangled lock (40%) | 45 |

**The boss: the sour Domovoi.** The house spirit, sulking since grandmother's death. You don't banish him: you **calm** him (his bar reads "Temper").
- Temper 300, Strike 9, Ward 30, every 3 s *(draft)*.
- Weakness: **hearth**, so the hearth ward and hearth candle, the chapter's own best work.
- Special: every 3rd blow, *Pots off the shelf* ×2.
- He's shown from the start, with his weakness, what calming him opens and his gift, and you choose when to try.
- He's meant to be Hopeless at first and Likely around Warding 10–12 with the right loadout.
- **Calming him** (once):
  - **His gift** (fixed, lasting): **+5% speed in all skills, and Health comes back twice as fast** *(numbers draft)*.
  - He shows you the loose flagstone: the way down to the old crypt, the door to Chapter II.
- **Bread and salt:** bringing bread as your remedy against him also gives +20% Strike, the old welcome. It's a small touch the Grimoire can hint at.

**Every boss leaves a gift.** It's a fixed passive bonus, shown on the boss's card before you try, kept for good, and listed with the keepsakes. There's no choice for now.

**What the leavings are for** (in Chapter 1)
- **Spun thread:** the red thread knot.
- **Lost buttons and tangled locks:** one or two **Cellar** house projects *(draft: a "Warded cellar door" for +1 saved loadout, a "Spindle" for more rags)*, shown only once Warding is open.
- **Later:** contracts at higher trust levels, and their main use in Chapter II.

**Size:** about 30–60 minutes of optional play after the rite, to Warding ~12 and the Domovoi.

---

## 9. Nothing of combat before Warding opens

Until the Cellar and Warding open, the game shows nothing that belongs to combat:
- no combat words in the text or the glossary
- no stats on item tooltips ("Ward 10", "heals 8")
- no combat recipes (the yarrow poultice and the red thread knot open with Warding, not at their levels)
- no loot, projects, contracts or talents that mention it

A test checks this, as `text.test.ts` does for the skill descriptions.

**The introduction.** When Warding opens, a large dialog introduces it, like the chapter end. It has a few short sections with a small drawing each:
1. **The cellar:** what's down there, and why now (grandmother's note, two lines).
2. **How a fight goes:** pick a foe, fill the loadout, begin; it fights on by itself until you stop.
3. **Your loadout:** the four slots and what each gives.
4. **Weakness:** each foe fears something; the right Ward and Light make it much easier.
5. **Readiness:** the five tags, and what Safe means.
6. **Losing:** what it costs (supplies and that foe's loot) and what it never costs.
7. **Away:** Safe fights keep going while you're away.
8. **Bosses:** the Domovoi, what calming him opens, and his gift.

One button: "Go down to the cellar". It can be read again from the Cellar tab ("How it works") and from the Guide.

---

## 10. On screen (for DESIGN.md when it's built)

- **The Cellar tab**, a place of its own with its colour, hero and material (candlelight, stone and cold).
  - **Left:** the foes as cards (name, a line, the readiness tag, the weakness or "?", a lock level).
  - **Right:** the chosen foe: its card (§5), the loadout's four slots, and one red **Begin** button.
- **While it runs:**
  - two bars (your Health, its Health or Temper) and the blow beat
  - supplies left
  - a short log of the last few blows (telling blows and specials stand out)
  - the top-bar band, as with any action
- **The foe's weakness** shows as "?" until you've beaten it 10 times (3 with Grave-sense). Its **Bestiary** page in the Grimoire keeps what you've learned.
- **New words** for the glossary: Warding, the Cellar, loadout, Health, Ward, Strike, Speed, weakness, telling blow, readiness, driven off, remedy, healing rule, Temper, gift, Bestiary.

---

## 11. Settled in review, and still open

**Settled**
- The five tags and their bands (§5) stay, and the tooltip shows the rough chance in words.
- Safe is lost about once in 1,000 fights. Over a long absence that may stop an offline fight once; it then falls back to your previous action. That's fine.
- Keen eye (telling blows 5% → 12%) is tried as it is, and tuned in play.

**Still open**
- **Engine note (for the build):** combat runs inside `advance()` like any action, and its save fields need a `SAVE_VERSION` bump. The playthrough bot gets a second test that clears the cellar, so its pacing is checked too.
- **The look:** the screens are mocked in Claude Design first, from [design_briefs/COMBAT_UI.md](design_briefs/COMBAT_UI.md).

---

## Changelog

- **v0.1 (2026-09-29):** first proposal: the Warding skill, a four-slot loadout (Ward, Light, Remedy, Charm), four stats, fights with no dice and a full forecast, cheap losing, offline for Safe fights, Warding talents, loot as ingredients, and the cellar taste (Skrzat, Kikimora, Zmora, the sour Domovoi).
- **v0.2 (2026-09-29):** after the designer's review:
  - Fights have chance (rolls and telling blows), and the forecast is replaced by a readiness tag worked out in the background.
  - One remedy kind at a time.
  - A combat charm as an ordinary recipe (the red thread knot).
  - Weaknesses show after 10 beaten.
  - Every boss leaves a fixed lasting gift (the Domovoi's: +5% speed, faster Health).
  - Nothing of combat shows before Warding opens, and a large introduction when it does.
  - The retreat rule is dropped: a fight stops when a Ward or Light runs out, or you're driven off.
  - Settled: the tag bands, the rough chance on hover, Safe's 1 in 1,000, and Keen eye to be tried as it is.
