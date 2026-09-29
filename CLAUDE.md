# Ritual Idle

A single-player idle/skilling game (Melvor-like) with a Slavic folk-horror occult theme.
The designer is not a programmer. Explain technical choices plainly, and keep game content editable as data.

## Design docs (source of truth for *what* to build)
- `docs/CONCEPT.md`: core concept, pillars, loops, and the decision log (read that first)
- `docs/CHAPTER1.md`: Chapter 1 content: actions, items, notes, village, omen, Rite
- `docs/GRIMOIRE.md`: discovery and hint model
- `docs/RESEARCH.md`: market and community research behind the decisions
- `docs/DESIGN.md`: design system (tokens, type, components, art rules, feedback, layout rules, screens, words). Follow it for every UI change
- `docs/PLAYTEST.md`: what to try and what to note in a Chapter 1 playtest
- `docs/research/`: dated research notes (e.g. `RITE_QUALITY.md`: sacrifices and rewards for rite quality, decided 2026-09-26; `COMBAT.md`: combat in idle games, 2026-09-29, with its source reports in `combat/`)
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
- `src/ui/`: React. `useGame` owns the tick loop, autosave and commands. `screens/` are the tabbed places, `components/` are shared pieces, `art/` holds code-drawn SVG icons and ornaments, and `styles/` has `tokens/` (palette, semantic roles, type, space), `base.css`, `components.css` and `places.css` (the per-tab colour, hero and material). The design handoff these come from is in `docs/design_handoff/`.

## Rules
- **The docs stay current.** Every patch or playtest round ends with *all* the docs (`docs/*.md` and `README.md`) updated in the same series of commits as the code:
  - Each doc describes the game as it is now: no "(replaced in patch N)" asides, no sections grouped by patch, no superseded text kept "for history". Rewrite or remove it.
  - History lives in one place per doc: `docs/CONCEPT.md` keeps its **decision log** (what changed and why), and every other doc ends with a short **Changelog** that gets one entry per patch (`docs/CHAPTER1.md` changes the most, since we iterate on Chapter 1).
  - Research and proposal docs (e.g. `docs/RESEARCH.md`, `docs/research/`) are dated snapshots: add to them, and mark what was decided, rather than rewriting them.
- Engine functions are pure and deterministic: randomness comes from `state.rngSeed` via `engine/rng.ts`, never `Math.random()` inside the simulation.
- Every engine behavior gets a test in `src/engine/*.test.ts`.
- Save format changes: bump `SAVE_VERSION` and make `deserialize` upgrade older saves. Never break existing saves.
- **Playtest save resets:** at the end of every session, ask the designer whether the next build should wipe players' saves, with a recommendation based on what changed (yes after big changes to the chapter, balance or systems, where old saves would give a misleading playtest; no for small fixes). If yes, raise `SAVE_EPOCH` in `src/engine/state.ts` by one: saves from an older reset start a new game on their next load, with a one-time notice. Imported saves are kept.
- **New terms are explained.** Whenever the game introduces a new word for a place, system or resource (the Grimoire, trust, insight, keepsake…), add it to `src/content/glossary.ts` and wrap its first appearances in `<Term>` (a click opens the explanation). Once read, a Term turns plain text, and the "?" Guide in the top bar lists every word read. Review new UI text for such words before committing.
- **Choices talk only about what the player knows.** Text at a choice (a skill's description, a stage card) never names a place or system that isn't open yet; if a choice opens one, name it in the card's "Opens" row with a `<Term>`. A test in `text.test.ts` checks the skill descriptions.
- **The sidebar informs; choices happen on tabs.** Big decisions (which part next, keepsakes, talents) get their own space on a tab or in a dialog; the chapter tracker only points there.
- Design guardrails (from the decision log): no real-time gating, no failure on rites, low follower management, generous offline progress, no pay-to-win.
- Dev builds show a Dev tools panel at the bottom of the page: time skip (through the real offline path), give items, +100 coin, +omen, next note, items for the next part, +5 levels, +5 insight. When you add a new timestamp to the state, add it to `rewind` in `devtools.ts` as well.
- Test in the browser on a separate origin (e.g. `http://test.localhost:5391`), which has its own save. Never use the designer's `localhost` save for testing.
