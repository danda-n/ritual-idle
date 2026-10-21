# Paste this into Claude Code (from the ritual-idle repo root)

I've added a design handoff in `design/handoff/`: `README.md` (the design system), `CELLAR.md` (auto-combat, gear and Crafting), and a `reference/` folder of HTML/CSS mocks. Implement it in this repo.

1. Read `design/handoff/README.md`, then `design/handoff/CELLAR.md`, then `reference/DESIGN_SYSTEM.md`. Serve the mocks with `npx serve design/handoff/reference` and open:
   - `ui_kits/ritual-idle/places.html` (the four tabs)
   - `ui_kits/ritual-idle/cellar.html` (combat)
   - `ui_kits/ritual-idle/crafting.html`

   Use each page's "Mock state" bar to see every state. That bar is for review only. Don't ship it.
2. If the design system (README's "Suggested order") isn't in the game yet, do that first. Then build the Cellar, gear and Crafting following CELLAR.md.
3. After each step, run `npm run dev` and check the screen at 1280px and 375px. Keep `npm test` and `npm run typecheck` passing, and commit.
4. Update the existing React components in `src/ui/**` and their CSS, using the class names from the mocks. Don't paste the mock HTML in. Copy the foe art from `reference/assets/foes/` into the game's assets, and add the new icon paths to `src/ui/art/icons.tsx`.
5. Hard rules:
   - no italics
   - no dashed outlines
   - the red fill only for the one button to press
   - gold only for rare things
   - text contrast ≥ 4.5:1
   - no browser `title` tooltips: use the Tip card
   - plain-English sentences for anything that explains a mechanic
   - reduced motion stops every loop except the progress bars
6. When done, load `reference/ui_kits/ritual-idle/audit.js` in the dev build's console and run `RIAudit.run('name')` on every tab and Cellar state. Fix anything it flags. Then tab through each screen with the keyboard.
7. Update `docs/DESIGN.md` and the changelog. Open a PR titled "Cellar: auto-combat, gear and Crafting".
