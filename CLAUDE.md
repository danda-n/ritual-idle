# Ritual Idle

A single-player idle/skilling game (Melvor-like) with a Slavic folk-horror occult theme.
The designer is not a programmer. Explain technical choices plainly, and keep game content editable as data.

## Design docs (source of truth for *what* to build)
- `docs/CONCEPT.md`: core concept, pillars, loops, and the decision log (read that first)
- `docs/CHAPTER1.md`: Chapter 1 content: actions, items, notes, village, omen, Rite
- `docs/GRIMOIRE.md`: discovery and hint model
- `docs/RESEARCH.md`: market and community research behind the decisions
- `tools/ch1_sim.py`: Chapter 1 pacing simulation (`python3 tools/ch1_sim.py`)

If code and docs disagree, ask which should change. Never silently diverge from a logged decision.

## Stack
Vite + React + TypeScript, Vitest. Electron (Steam) and PixiJS (sanctum scene) come later.

- `npm run dev`: dev server
- `npm test`: engine tests
- `npm run typecheck` / `npm run build`

## Layout
- `src/content/`: **game data only** (skills, items, actions). Balance and naming changes go here. Keep `docs/CHAPTER1.md` and `tools/ch1_sim.py` in sync when numbers change.
- `src/engine/`: pure game logic, with no React or DOM (except guarded localStorage in `save.ts`). `advance(state, ms)` is the single simulation step; offline progress is the same function run over the time away, capped.
- `src/ui/`: React components. `useGame` owns the tick loop, autosave and commands.

## Rules
- Engine functions are pure and deterministic: randomness comes from `state.rngSeed` via `engine/rng.ts`, never `Math.random()` inside the simulation.
- Every engine behavior gets a test in `src/engine/*.test.ts`.
- Save format changes: bump `SAVE_VERSION` and make `deserialize` upgrade older saves. Never break existing saves.
- Design guardrails (from the decision log): no real-time gating, no failure on rites, low follower management, generous offline progress, no pay-to-win.
