# Paste this into Claude Code (from the ritual-idle repo root)

I've added a design handoff in `design/handoff/` (README.md plus a reference/ folder of HTML/CSS mocks). Implement it in this repo.

1. Read `design/handoff/README.md` completely, then `design/handoff/reference/DESIGN_SYSTEM.md`. Open `design/handoff/reference/ui_kits/ritual-idle/places.html` in a browser (run `npx serve design/handoff/reference`) to see the target.
2. Follow the README's "Suggested order". After each step, run `npm run dev`, check the game on all four tabs, and commit. Keep `npm test` and `npm run typecheck` passing.
3. Keep the class vocabulary the game already uses, and use semantic tokens only in components. Don't paste the mock HTML in: update the existing React components (`src/ui/**`) and their CSS.
4. Hard rules: no italics, no dashed outlines, red fill only for the one thing to press, gold only for rare things, and text contrast ≥ 4.5:1. When done, load `design/handoff/reference/ui_kits/ritual-idle/audit.js` in the dev build's console and run `RIAudit.run('House')` (and the same on the other tabs). Fix anything it flags.
5. Replace `docs/DESIGN.md` with the new system (based on `reference/DESIGN_SYSTEM.md` plus the README's rules), and add a changelog entry.
6. Open a PR titled "Design system v0.4: Hearth + Folk".
