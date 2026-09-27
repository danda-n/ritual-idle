# Ritual Idle

An idle skilling game about inheriting a village witch's house. See [docs/CONCEPT.md](docs/CONCEPT.md).

**Play Chapter 1:** https://danda-n.github.io/ritual-idle/ (every push to `main` redeploys automatically)

## Run it

```bash
npm install
npm run dev
```

Then open the URL it prints.

- `npm test` runs the engine tests, including a bot that plays all of Chapter 1.
- `npm run pacing` prints how long that playthrough takes.
- `npm run build` makes a production build in `dist/`.

## Status: Chapter 1 is playable end to end, in playtest rounds

From the cold house to the Kindling of the Hearth-Circle:
- **The staged Kindling:** the chapter's rite is built in five parts, placed in the Circle one by one. Each stage's note from grandmother brings the one new skill it needs. Deciphered burnt pages teach extra recipes.
- **Tabs:** House and Inventory, then the Circle, Grimoire, Village and Experiments as the chapter opens them.
- **Free order:** after the Light, you choose the order of the Ward, the Smoke and the Words; the Offering comes last.
- **A checklist per part:** the tracker lists the part's items with have/need, a button to the skill that makes each, what you're still short of further down, and any level a recipe needs. Any order. One reward per stage, claimed: a Surge, XP where you choose, or items.
- **No grinding:** working through the checklists never needs grinding, in any order, and nothing made is wasted (the playthrough test checks both).
- **Skill talents as builds:** at levels 3, 6, 9 and 12 each skill offers a pair, and you take one side; a pick is fixed until the next tier, then it can be changed. Their text is generated from their effects, with the real numbers. Drawn as a vine. Each level also makes its skill 1% faster.
- **Timed actions** with XP, level caps and rates; each recipe opens at its own level. Each skill shows only what you've reached plus what opens next, and recipe rows show outputs with your bonuses applied (boosted ones marked). Click anywhere on a row to start it. An item lookup on every item name, a woodcut icon for every item, and an Inventory tab grouped by where things come from.
- **The village:**
  - two contracts at a time, delivered in parts, with trust
  - a shop for bread and tallow
- **House projects** built from items: the omen shelf, sealed salt crock, reading lamp, drying rack, mended shutters and carved omen shelf.
- **The Still Night omen** every few minutes once the omen shelf is built: bless a skill you choose with ×2 for 2 minutes. Timed buffs.
- **The Grimoire and the Experiments tab:**
  - four hidden recipes, with hints you buy using insight (the Window charm first)
  - charms: a discovered hidden recipe can be bound again for a 10-minute boost
  - two secrets, with clues you buy
  - automatic deduction
- **The Major Rite:** a "Wake it" banner when the Circle is ready, then about 3 minutes in five phases, running by itself (offline too); tending it on the House's rite scene can take up to half off. It never fails; optional offerings (a hearth candle, the Hearth mark, Still Night) set its quality, shown as a ladder: a Fine rite lets you choose a lasting keepsake, a Resplendent one two (the story rewards never change). Afterwards: Janko, the first follower, and the chapter-end screen.
- **Offline progress** (24h, 36h with the mended shutters) with a "while you were away" summary. A fallback when work stops.
- **Saving:** autosave, immediate saves on every choice, save export/import, and upgrades for older saves.
- **The living sanctum:** a code-drawn woodcut scene that changes as you progress.
- **Calm feedback:** an activity feed beside the tabs for routine events; toasts only for big moments. New words explained on click, and buttons that name where they go.
- **The look (design system v0.4, "Hearth + Folk"):** warm soot grounds with one job per colour (red acts, verdigris selects, gold is rare), a colour, hero band and material per tab, a now-working band in the top bar, recipes as a table whose running row fills as it works, and per-skill stock lists. See [DESIGN](docs/DESIGN.md).
- **Settings:** fallback, Grimoire assist, reduced motion, row density, message duration.

Dev builds have a **Dev tools** panel at the bottom of the page (time skip, give items, +omen, next note, items for the next part, +5 levels, +5 insight) for playtesting.

Design docs: [CONCEPT](docs/CONCEPT.md), [CHAPTER1](docs/CHAPTER1.md), [GRIMOIRE](docs/GRIMOIRE.md), [DESIGN](docs/DESIGN.md), [PLAYTEST](docs/PLAYTEST.md), [RESEARCH](docs/RESEARCH.md).

## Changelog

What changed in each round is in [CHAPTER1's changelog](docs/CHAPTER1.md#changelog); the reasons are in [CONCEPT's decision log](docs/CONCEPT.md#decision-log).
