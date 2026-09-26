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
- **Free order:** after the Light, you choose the order of the Ward, the Smoke and the Words; the Offering comes last.
- **Small steps** inside every stage, counted from the stage's start, shown task-first (grandmother gets one line). One reward per stage, claimed: a Surge, XP where you choose, or items.
- **Steps sized to the level:** following the steps never needs grinding, in any order, and nothing made is wasted (the playthrough test checks both).
- **Skill talents as builds:** at levels 3, 6, 9 and 12 each skill offers a pair, and you take one side; switching and reset are free. Drawn as a vine. Each level also makes its skill 1% faster.
- **Timed actions** with XP, level caps and rates, in tiers (a new tier every 3 levels). Each skill shows only what you've reached plus the next tier. Click anywhere on a row to start it. An item lookup on every item name, a woodcut icon for every item, and a Stores tab grouped by where things come from.
- **The village:**
  - two contracts at a time, delivered in parts, with trust
  - a shop for bread and tallow
- **House projects** built from items: the omen shelf, reading lamp, drying rack, mended shutters and carved omen shelf.
- **The Still Night omen** every few minutes once the omen shelf is built: bless a skill you choose with ×2 for 2 minutes. Timed buffs.
- **The Grimoire and circle:**
  - three hidden recipes, with hints you buy using insight
  - two secrets, with clues you buy
  - automatic deduction
- **The Major Rite:** about 3 minutes in five phases, running by itself (offline too). It never fails; optional offerings (a hearth candle, the Hearth mark, Still Night) set its quality: a Fine rite lets you choose a lasting keepsake, a Resplendent one two (the story rewards never change). Afterwards: Janko, the first follower, and the chapter-end screen.
- **Offline progress** (24h, 36h with the mended shutters) with a "while you were away" summary. A fallback when work stops.
- **Saving:** autosave, immediate saves on every choice, save export/import, and upgrades for older saves.
- **The living sanctum:** a code-drawn woodcut scene that changes as you progress.
- **Calm feedback:** an activity feed under the top bar for routine events; toasts only for big moments.
- **Settings:** fallback, Grimoire assist, reduced motion, message duration.

Dev builds have a **Dev tools** panel at the bottom of the page (time skip, give items, +omen, next note, items for the next part, +5 levels, +5 insight) for playtesting.

Design docs: [CONCEPT](docs/CONCEPT.md), [CHAPTER1](docs/CHAPTER1.md), [GRIMOIRE](docs/GRIMOIRE.md), [DESIGN](docs/DESIGN.md), [PLAYTEST](docs/PLAYTEST.md), [RESEARCH](docs/RESEARCH.md).

## Changelog

What changed in each round is in [CHAPTER1's changelog](docs/CHAPTER1.md#changelog); the reasons are in [CONCEPT's decision log](docs/CONCEPT.md#decision-log).
