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

## Status: the Chapter 1 vertical slice is complete

From the cold house to the Kindling of the Hearth-Circle:
- **The staged Kindling:** the chapter's rite is built in five parts, placed in the Circle one by one. Each stage's note from grandmother brings the one new skill it needs. Deciphered burnt pages teach extra recipes.
- **Small steps** inside every stage, each with a small reward, shown task-first (grandmother gets one line).
- **Tending:** click Tend (or press Space) for +50% speed while its meter burns, and a growing bonus-find streak. Optional.
- **Skill talents:** a point every 3 levels, four branches (Tending / Swift / Plenty / Fortune) and a keystone per skill, with free reset. Each level also makes its skill 1% faster.
- **Timed actions** with XP, level caps and rates. Each skill shows only what you've reached plus the next recipe. An item lookup on every item name; a pantry grouped by where things come from.
- **The village:**
  - a request board with trust
  - a shop
  - four sanctum upgrades
- **The Still Night omen** (bless a skill you choose), the omen shelf, and timed buffs.
- **The Grimoire and circle:**
  - three hidden recipes with escalating hints
  - two secrets
  - automatic deduction
- **The Major Rite:**
  - never fails; preparation sets the quality
  - can be primed to begin by itself
  - runs offline
  Afterwards: Janko, the first follower, and the chapter-end screen.
- **Offline progress** (24h, 36h with an upgrade) with a "while you were away" summary. A fallback when work stops.
- **Saving:** autosave, immediate saves on every choice, save export/import, and upgrades for older saves.
- **The living sanctum:** a code-drawn woodcut scene that changes as you progress.
- **Settings:** fallback, Grimoire assist, reduced motion, message duration.

Dev builds have a **Dev tools** panel at the bottom of the page (time skip, give items, next note, items for the next part, +5 levels, +fragment) for playtesting.

Design docs: [CONCEPT](docs/CONCEPT.md), [CHAPTER1](docs/CHAPTER1.md), [GRIMOIRE](docs/GRIMOIRE.md), [DESIGN](docs/DESIGN.md), [RESEARCH](docs/RESEARCH.md).
