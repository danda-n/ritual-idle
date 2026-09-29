# Design brief: the Cellar and combat screens (2026-09-29)

A brief for Claude Design. What the screens must do comes from [../COMBAT.md](../COMBAT.md) (v0.3); how they must look comes from the existing design system, "Hearth + Folk" ([../DESIGN.md](../DESIGN.md), and the handoff in [../design_handoff/](../design_handoff/README.md)). The result comes back as a handoff like the last one, and the game's code is built to it.

---

## Paste this into Claude Design

> I'm designing new screens for **Ritual Idle**, a single-player idle/skilling game (Melvor-like) with a Slavic folk-horror theme. You inherit your grandmother's witch-house, and craft candles, salt wards, sigils and herbs. We're adding **auto-combat**: after the chapter's great rite, the cellar opens and the house's spirits have gathered there. You **craft gear** with a new Crafting skill (tiered pieces with fixed and random affixes and set bonuses), put it on, and the fight runs by itself until you stop.
>
> Use the existing **Ritual Idle design system ("Hearth + Folk" on "Soot & Linen")**, attached (or in this project). Follow its hard rules exactly: no italics, no dashed or dotted outlines, red fill only on the one thing to press, gold only for rare things, skill colours only on icons, stripes, bars and the running row, text contrast ≥ 4.5:1, colour never the only signal, reduced motion stops all loops except progress bars, no browser tooltips (use the Tip card). Reuse its class vocabulary (`btn`, `panel`, `bar`, `chip`, `tabs`, `topbar`, `tracker`, `ledger`, `toast`…) and the places pattern (a place colour, a hero band, a material, one signature glow).
>
> The full brief follows: the screens, their states, the words and the mock data. Please deliver HTML/CSS mocks in the same structure as the existing `reference/ui_kits/ritual-idle/` (a `cellar.html` and a `crafting.html`, plus any new component cards), at 1280px and 375px wide, that pass the kit's `audit.js` (0 contrast fails, 0 italics, nothing under 12px).

Then paste or attach everything below.

---

## 1. What combat is (in one screen of text)

- **One foe at a time, repeating.** Choose a foe, check your gear, press **Begin**. It fights by itself (in the player's single action slot, like any recipe) until you stop or you're **driven off**. No clicking during the fight.
- **Gear:** five slots, each holding one durable **piece**:
  - **Amulet:** gives Ward (softens blows) and a tag.
  - **Hand:** gives Strike (how hard you hit) and a tag.
  - **Lantern:** gives Strike and a tag.
  - **Garment:** gives Health and softer special attacks.
  - **Belt:** holds remedies.
  
  Plus a few **remedies** (one kind, used by a healing rule, "below 40% Health") and one **charm**. Remedies are a help, not a need: you catch your breath between foes.
- **Pieces are made with the Crafting skill.** Each has:
  - base stats by **tier**
  - **fixed affixes** (its identity: its tag, one trait)
  - **random affixes:** when you craft it, each random slot rolls **2 options** (3 with a project) and you **choose one**
  
  Pieces can be **reforged** (re-roll one random affix, keep the old one if you like) and **upgraded in place** to the next tier. Matching pieces make a **set** ("Grandmother's set: 2 pieces +10% Ward").
- **Four stats:** Health, Ward, Strike, Speed.
- **Weakness:** every foe fears one tag (salt, smoke, fire, iron, hearth…). If your Hand or Lantern carries it, your blows are ×1.5; if your Amulet does, its blows are halved. It's shown as "?" until you've beaten that foe 10 times.
- **Chance:** blows vary, and some land as **telling blows** (×2). The game plays each fight out 1,000 times in the background and shows a **readiness tag**:
  - **Safe** (999 in 1,000 or better: leave it running, offline too)
  - **Likely** (9 in 10)
  - **Risky** (1 in 2)
  - **Deadly** (1 in 20)
  - **Hopeless** (less than 1 in 20)
  
  Hovering the tag gives the rough chance in words ("about 3 in 4"). **Never the exact outcome:** fights should keep their surprise.
- **Losing is cheap:** only the remedies used on that foe and its loot. Gear is never lost. Health comes back during any other work.
- **Bosses:** one in the cellar, the sour **Domovoi** (the house spirit, sulking since grandmother died). You don't banish him, you *calm* him: his bar reads **Temper**. Calming him opens the way down to the crypt (the next chapter) and leaves a lasting **gift** (+5% speed in all skills, Health returns twice as fast).

---

## 2. The screens to design

### 2.1 The Cellar tab (the new place)
A new tab next to the others, with its own place colour, hero band, material and glow. The cellar should feel **cold, low and stone-built, lit by the one candle you carry**, in contrast to the warm House.
- **Hero band:** the place mark, "The Cellar" in SC 30px, one lore line, and 2–3 key numbers (Warding level, foes warded off, the boss: "Domovoi · not yet calmed" / "calmed").
- **Two columns** (one column under 860px):
  - **Left, the foes:** a card per foe with its woodcut glyph, name, one line, readiness tag, weakness (or "?"), and a level lock where one applies ("Warding 8"). The boss's card is set apart, and bigger.
  - **Right, the chosen foe:**
    - **The foe card:** its Health, Strike, Ward and Speed; its specials by name ("every 4th blow: the Press, ×2.5"; "telling blows 10%"); its weakness and any resistance; what it leaves behind as item chips with chances.
    - **Your gear:**
      - Five slots, each showing its piece (icon, name, tier, its tag, the affixes in one line each).
      - A mark where a tag matches this foe's known weakness.
      - The set bonus, if two or more pieces match.
      - Remedies (kind and count, "Belt holds 10") and the charm.
      - An empty slot says so in words.
    - **The healing line** (a small control: "Use a remedy below 40% Health").
    - **The readiness tag,** large, with the rough chance in a Tip.
    - With remedies: "Remedies last about N foes".
    - Saved loadouts: "Same as last time", and a named-preset menu.
    - One red **Begin** button. When disabled, the reason is in words.
- **A "How it works" link** reopens the introduction (§2.6).

### 2.2 Choosing a piece for a slot
Clicking a slot opens a picker listing the pieces you hold for it:
- Icon, name, tier and tag.
- Its affixes.
- A mark if it matches this foe's known weakness.

The same kind of picker chooses the remedy and the charm. One quiet link at the bottom: "Make more: Crafting ›". It's a popover on desktop and a sheet on phones.

### 2.3 A fight running
The right column turns into the fight while it runs:
- Two bars: yours (Health) and the foe's (Health, or Temper for the Domovoi), with numbers.
- The blow beat: whose blow is next and when (a slim timer, like the recipe rows).
- Remedies left, and the charm's uses left.
- A short log of the last 4–6 blows. Telling blows and specials stand out through text and a glyph, not colour alone.
- Counters: foes beaten this run, and loot gathered.
- A **Stop** button.

**Elsewhere during a fight:**
- **The top bar's now-working band** shows the fight like any action: the skill label "Warding", the foe's name, its Health as the bar, and Stop.
- **The sidebar** is unchanged apart from charms in use.

### 2.4 How a fight ends (states)
- **Stopped by you:** back to the foe view, with a one-line summary ("Skrzat ×23 · 7 lost buttons").
- **Driven off:** a calm, clear state, not a game-over screen. What happened ("Driven off by the Zmora: the Press"), what it cost (the remedies used on that foe, its loot), what's kept (gear and everything else), and that you've gone back to your previous action. One line of advice where it helps ("Its weakness is iron").
- **Away summary:** one line in the existing "while you were away" dialog ("The cellar: 212 Skrzats warded off · 64 lost buttons · 3h 20m").

### 2.5 The boss
- **The Domovoi's card:** set apart from the others, with Temper instead of Health, his specials, his weakness, and two things shown up front: **what calming him opens** (the way down to the crypt) and **his gift** (+5% speed in all skills, Health returns twice as fast). His readiness tag starts as Hopeless.
- **Calmed:** a moment worth marking, like a part placed in the Circle, but smaller than the chapter end. A toast or small dialog: his gift, and the loose flagstone. Afterwards his card shows "Calmed" and the gift as kept. The gift also appears with the keepsakes.

### 2.6 The introduction (a large dialog, once)
It appears when the Cellar opens and can be reread from the Cellar tab and the Guide. Its scale is like the chapter end: vellum, sections divided by soft rules, and a small drawing or glyph for each. It must be scannable in about 30 seconds.
1. **The cellar:** what's down there and why now (two lines from grandmother).
2. **How a fight goes:** pick a foe, fill the loadout, Begin; it fights on by itself.
3. **Gear:** the five slots, and that Crafting makes the pieces (choose one of the rolled options for each random affix).
4. **Weakness:** each foe fears something; "?" until you've beaten it 10 times.
5. **Readiness:** the five tags and what Safe means.
6. **Losing:** what it costs (remedies and that foe's loot), and what it never costs (gear, anything else).
7. **Away:** Safe fights keep going while you're away.
8. **Bosses:** the Domovoi, what calming him opens, his gift.

One button: **Go down to the cellar**.

### 2.7 The readiness tag (a component)
Five tags as words with a glyph each, each usable small (the foe list) and large (the chosen foe).
- **Colour within the existing roles:**
  - no red fill (red means "press this")
  - no gold (gold means rare)
  - perhaps verdigris for Safe, the warning and danger text colours for Risky and Deadly, and text-3 for Hopeless
- **The tooltip** (Tip card): the tag, "about 3 in 4", and one note ("Counts its specials and your healing rule").

### 2.8 The Bestiary (a Grimoire page)
A new entry in the Grimoire's ribbon index, in the book's style (vellum page, SC title):
- one tile per foe met
- beaten count
- weakness once learned ("?" before)
- specials
- what it leaves behind
- the boss's gift once calmed

Unmet foes are locked tiles, like the page grid.

### 2.9 The crafting window (new)
**Crafting** is a skill like the others on the House tab: its page has the usual recipe rows (the **components**: stitched linen, iron blank, lantern frame, red thread, red thread knot) and talents. Its page also opens the **crafting window**, a large dialog or panel, where gear pieces are made. This is the screen that should make crafting feel good.
- **Choose a slot** (Amulet, Hand, Lantern, Garment, Belt), then **a piece** from that slot's list (locked ones show their Crafting level).
- **The piece's card:**
  - its base stats by tier
  - its **fixed affix** (always the same)
  - its **random affix slot** with the **pool** it rolls from and each option's range ("Strike +1–2 · Speed +3–5% · telling blows +2–3%")
  - its set, if any
  - the materials with have/need (short ones in the usual red "short" chip style)
  - one red **Craft** button
- **The roll:** after Craft, the random slot shows its **2 options** side by side (3 with the Workbench), each with its rolled value. **You choose one**, and the piece is done.
  - This is the moment of surprise: a short, satisfying reveal. It must stay calm and readable, and reduced motion must show it without animation.
  - A strong roll (near the top of its range) can be marked with words ("high roll"), not gold. Gold means rare only.
- **A piece you hold:**
  - **Reforge** one random affix: the new options appear beside the current one, and "Keep the old one" is a clear option.
  - **Upgrade** to the next tier, shown with what it adds and what it costs. Tier 2 says "Chapter II materials" and is locked for now.
- **States to show:**
  - nothing crafted yet
  - choosing between 2 options
  - choosing between 3
  - reforging (old vs new)
  - an upgrade locked
  - not enough materials

---

## 3. New art needed (woodcut glyphs, in the icon set's style)

- **Foes:**
  - the Skrzat (a small imp)
  - the Kikimora (a spinner, a spindle)
  - the Zmora (a figure pressing on a sleeper's chest; unsettling, not gory)
  - the Domovoi (an old bearded house spirit by the stove)
- **Items:**
  - yarrow poultice
  - red thread knot
  - lost button
  - spun thread
  - tangled lock (of hair)
  - stitched linen
  - iron blank
  - lantern frame
  - red thread
- **Gear pieces:** salt pouch, iron amulet, iron knife, hearth poker, tallow lantern, censer, embroidered shirt (red cross-stitch border), herb belt.
- **The five slot glyphs:** Amulet, Hand, Lantern, Garment, Belt.
- **Stats:** Health, Ward, Strike, Speed.
- **The Cellar's place mark,** and a small cellar-door ornament.
- **Skill colours for Warding and for Crafting** that stay distinct from each other and from the six skill colours in lightness and hue, for colour-blind players:
  - Herbalism lichen `#94be58`
  - Scavenging river `#469bd1`
  - Chandlery beeswax `#ebd56a`
  - Sigilcraft poppy `#ee694f`
  - Scholarship lilac `#cdaef2`
  - Ritualism rowan `#db6ea5`
- **A place colour for the Cellar** that stays distinct from the other places:
  - ember `#e2703f`
  - brass `#b39463`
  - lilac, verdigris and rowan
  - slate `#92b3cb`

---

## 4. Mock data (use these numbers)

| Foe | Line | Health | Strike | Ward | Every | Weakness | Special | Leaves | Tag with the mock loadout |
|---|---|---|---|---|---|---|---|---|---|
| Skrzat | a small house imp, mischief more than harm | 20 | 3 | 0 | 3.5 s | salt | — | Lost button 30% | Safe |
| Kikimora | spins behind the stove, breaks what's untidy | 45 | 5 | 10 | 3 s | smoke | every 5th: the Clatter ×2 | Spun thread 35%, curio 1% | Likely |
| Zmora | the nightmare on the sleeper's chest | 70 | 7 | 20 | 3.5 s | iron | every 4th: the Press ×2.5 · telling blows 10% | Tangled lock 40% | Risky |
| Domovoi (boss) | the house spirit, sour since grandmother died | Temper 300 | 9 | 30 | 3 s | hearth | every 3rd: Pots off the shelf ×2 | calming opens the crypt · gift | Hopeless |

- **The mock player:** Warding 7, Crafting 8, Health 73 (52 from level, +15 shirt, +6 pouch).
- **The mock gear:**
  - Amulet: Salt pouch, tier 1 (Ward 10 · salt · Health +6)
  - Hand: Iron knife, tier 1 (Strike 5 · iron · Speed +4%)
  - Lantern: Tallow lantern, tier 1 (Strike 3 · fire · loot chances +12%)
  - Garment: Embroidered shirt, tier 1 (Health +15 · special attacks −20% · +1 Health per foe beaten)
  - Belt: Herb belt, tier 1 (holds 10 · remedies heal +10% · holds +3)
  - Grandmother's set: 3 pieces (+10% Ward · the first special attack each fight misses)
- **Remedies:** chamomile ×13 (heals 4).
- **Charm:** Window charm (63 uses left).
- **Healing line:** 40%.
- **A running fight:** Skrzat 11/20, you 68/73. The last blows:
  - "You 6.9"
  - "Skrzat 1.3"
  - "You 12.4 · telling blow"
  - "Skrzat 1.5"
- **The crafting window mock:** crafting a Censer (Crafting 6).
  - Base Strike 4, fixed: smoke.
  - Its random slot rolled 2 options: "Strike +2" (a high roll) and "Warding XP +7%".
  - Materials: 1 lantern frame (have 2), 2 mugwort incense (have 1: short).

---

## 5. Words (use exactly these)

- **Places, skills and core terms:** the Cellar · Warding · Crafting · gear · piece · tier · affix (fixed, random) · set · reforge · upgrade · component · loadout · Amulet, Hand, Lantern, Garment, Belt (the slots) · remedy · charm · Health, Ward, Strike, Speed (the stats) · weakness · telling blow · readiness · Safe, Likely, Risky, Deadly, Hopeless · driven off · remedy · healing rule · Temper · calm (the Domovoi) · gift · the Bestiary.
- **Button labels:** Begin · Stop · Craft · Choose · Reforge · Keep the old one · Upgrade · Same as last time · Go down to the cellar · How it works.
- **Style:** numbers and verbs first, labels over sentences, facts joined with " · ", no "you" where it can be dropped. One line per thing; a second line goes in a Tip. Flavour lives in names and art, not in paragraphs.

---

## 6. Out of scope

- Other chapters' foes.
- Follower screens.
- The sanctum scene.
- Changes to existing tabs, except the new Grimoire entry, the top bar's fight state and the away-summary line.
