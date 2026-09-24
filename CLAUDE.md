# Ritual Idle

A single-player idle/skilling game (Melvor-like) with a Slavic folk-horror occult theme.
The designer is not a programmer. Explain technical choices plainly, and keep game content editable as data.

## Design docs (source of truth for *what* to build)
- `docs/CONCEPT.md`: core concept, pillars, loops, and the decision log (read that first)
- `docs/CHAPTER1.md`: Chapter 1 content: actions, items, notes, village, omen, Rite
- `docs/GRIMOIRE.md`: discovery and hint model
- `docs/RESEARCH.md`: market and community research behind the decisions
- `docs/DESIGN.md`: design system (tokens, type, components, art rules, feedback kit, words). Follow it for every UI change
- `docs/PLAYTEST.md`: what to try and what to note in a Chapter 1 playtest
- `src/engine/playthrough.test.ts`: a headless bot plays all of Chapter 1 on the real engine (it's the pacing check; `npm run pacing` prints the timings)

If code and docs disagree, ask which should change. Never silently diverge from a logged decision.

## Stack
Vite + React + TypeScript, Vitest. Electron (Steam) and PixiJS (sanctum scene) come later.

- `npm run dev`: dev server
- `npm test`: engine tests, including the Chapter 1 playthrough
- `npm run pacing`: prints the playthrough's timings
- `npm run typecheck` / `npm run build`

## Layout
- `src/content/`: **game data only** (skills, items, actions, the Kindling's parts, talents). Balance and naming changes go here. Keep `docs/CHAPTER1.md` in sync when numbers change, and run `npm test` (the playthrough fails if the chapter becomes unfinishable or leaves its pacing band).
- `src/engine/`: pure game logic, with no React or DOM (except guarded localStorage in `save.ts`). `advance(state, ms)` is the single simulation step; offline progress is the same function run over the time away, capped.
- `src/engine/` also has `commands.ts` (every player command), `modifiers.ts` (every bonus), `estimates.ts` (UI-only rates and lookups) and `devtools.ts` (`rewind` for the dev time skip).
- `src/ui/`: React. `useGame` owns the tick loop, autosave and commands. `screens/` are the tabbed places, `components/` are shared pieces, `art/` holds code-drawn SVG icons and ornaments, and `styles/` has tokens, components and layout.

## Rules
- Engine functions are pure and deterministic: randomness comes from `state.rngSeed` via `engine/rng.ts`, never `Math.random()` inside the simulation.
- Every engine behavior gets a test in `src/engine/*.test.ts`.
- Save format changes: bump `SAVE_VERSION` and make `deserialize` upgrade older saves. Never break existing saves.
- Design guardrails (from the decision log): no real-time gating, no failure on rites, low follower management, generous offline progress, no pay-to-win.
- Dev builds show a Dev tools panel at the bottom of the page: time skip (through the real offline path), give items, +100 coin, +omen, next note, items for the next part, +5 levels, +fragment. When you add a new timestamp to the state, add it to `rewind` in `devtools.ts` as well.
- Test in the browser on a separate origin (e.g. `http://test.localhost:5391`), which has its own save. Never use the designer's `localhost` save for testing.
