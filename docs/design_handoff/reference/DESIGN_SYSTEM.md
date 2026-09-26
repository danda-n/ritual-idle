# Ritual Idle Design System — "Soot & Linen"

Design system for **Ritual Idle**, an idle skilling game about inheriting a village witch's house (Slavic folk horror, Chapter 1 · Hearth). This system implements direction **A "Soot & Linen"** from the design audit and replaces v0.3 ("candlelit vellum").

## Sources
- **Repo:** `github.com/danda-n/ritual-idle` (branch `main`). UI lives in `src/ui/` — styles in `src/ui/styles/{tokens,components,layout,identity}.css`, icons and ornaments in `src/ui/art/`, screens in `src/ui/screens/`. Docs: `docs/DESIGN.md`, `docs/CONCEPT.md` §9.
- **Audit:** `uploads/VISUAL_DIRECTION.md` (2026-09-26) — diagnosis, palette directions A/B/C, type, components, migration plan. All contrast numbers here come from it.
- The repo's v0.3 stylesheets are copied verbatim into `src/ui/styles/` for the "before" recreation only. Don't build on them.

## What changed from v0.3 (and why)
- **Grounds:** warm brown ink (hue 59–82°, layers 1.07:1 apart) → near-neutral **soot** with real lightness steps (15 → 19 → 23 → 28% L).
- **Gold:** from twelve jobs to one — **rare**. Action is **cinnabar red**, selection/success is **verdigris**.
- **Frames, glows, wood grain, gradients:** removed. Panels separate by value; borders only on interactive things.
- **Type:** Alegreya SC everywhere → **Alegreya Sans** for all UI and numbers; SC only for titles and column headers; Alegreya (roman, never italic) for lore.
- **Skill colours:** re-picked and spread in lightness; worst colour-blind pair ΔE 0.013 → 0.060. They live on icons, stripes and bars only — chips are neutral with a coloured glyph.
- **Ornament** concentrated: one stitch band under the top bar, the stitched active tab, stitches as chapter steps, the papercut rosette.
- **Recipes** become a real table: fixed columns, tabular numbers, XP/h shown as a column.

---

## CONTENT FUNDAMENTALS
- **Effects lead, in plain numbers.** "×2 on one skill · 2 min", "Needs 2 beeswax", "Claim · +2 beeswax". Flavour is one short line at most, and it comes last.
- **Less prose.** The UI is moving toward a spreadsheet. A row says name, level, time, XP, inputs → outputs, rate. No hint paragraphs.
- **Sentence case** everywhere. Small caps only through the display face (titles, column headers).
- **Second person, implied.** Buttons are verbs: Start, Stop, Tend, Go, Place in the Circle, Release, Claim. Status lines address nobody: "Next: Make 3 tallow candles".
- **Grandmother's voice** is lore: Alegreya roman (no italics anywhere — they read poorly), one line, earthy and specific. "A candle burns on the table; the hearth is still cold."
- **One word per thing** (from DESIGN.md): the Circle, the Kindling, parts are *placed*, steps' rewards are *claimed*, talents, Tend, insight, clues, moments, recipe, Shelves.
- Disabled buttons explain themselves ("Level 10", "Needs 1 beeswax"). Colour is never the only signal.
- **No emoji.** Unicode only as typographic marks: `→` between inputs and outputs, `·` separators, `✦` for rare, `×` for multipliers.

## VISUAL FOUNDATIONS
- **Colour (60-30-10):** ~60% soot ground, ~30% linen text and neutral surfaces, ~10% colour — and inside that, red is scarce. Each hue has one job: red = act here, verdigris = selected/done, slate = info, gold = rare, skill hues = identity. See `tokens/semantic.css`.
- **Value before hue:** room `--color-bg` < band `--color-band` (top bar + sidebar, one dark L) < panel `--color-surface` < raised `--color-raised` (hover, selection, inputs, dialogs). The screen should work in greyscale.
- **Type:** Alegreya Sans 15px rows, 14px chips/buttons, 13px meta, 12px SC column headers (+0.06em, the only tracked text). Alegreya SC 28px for the chapter title. Alegreya regular 17/1.5 for lore; the serif alone marks it. **No italics** in the UI. Tabular lining figures on every number.
- **Backgrounds:** flat. No gradients, grain, noise or radial glows. The only textured thing is the code-drawn woodcut **Sanctum** scene, which is art and stays as is.
- **Vellum** (`--color-vellum`, dark linen paper, 1px rule) only where it means *a written page*: Grimoire pages and the chapter-end card.
- **Borders:** 1px, only on inputs, ghost buttons, interactive chips and the dashed "short" state. Row dividers are `--color-border-soft`. No double frames, no inner rules.
- **Shadows:** none on panels. `--shadow-2` only for dialogs and popovers. Elevation = a lighter surface.
- **Radii:** 3px buttons/chips, 4px panels, 6px dialogs. Progress bars have square ends (woodcut, not pills).
- **Progress bars:** flat fills on a `--color-bg` track, no border. Action timer and XP = skill colour; chapter/steps = linen; done = verdigris; rite = stitch red; drains = skill at 70%.
- **Hover:** rows and list items go to `--color-raised`. Row Start buttons are neutral ghosts that turn into the red action fill on hover/focus. No lift, no translate.
- **Press:** opacity 0.9. **Focus:** 2px linen outline, 2px offset (hue-neutral, never collides with a role).
- **Running state:** raised background + 3px skill-coloured inset edge + the moving timer bar. No glow, no pulse — the bar is motion enough.
- **Motion:** 120 / 220 / 420ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`. Fades and small rises (floats, toasts). Only rare floats may glow. The "invite" is a stitch-red outline pulsing three times, then static. Reduced motion (OS or `html[data-motion="reduced"]`) stops everything except progress bars.
- **Transparency / blur:** none, except the dialog scrim.
- **Layout:** top bar band (52px) → stitch band (6px) → tabs on the room → main content; a 320px band-coloured sidebar (tracker, omen shelf, shelves). House = 220px skill list + recipe panel. Rows 36px, or 32px with `data-density="compact"`.

## ICONOGRAPHY
- The game's own **hand-drawn SVG set** (`src/ui/art/icons.tsx`): 24px grid, 1.75 stroke, round caps and joins, `currentColor`, a few solid "ink" fills at 20–25% opacity. Copied to `assets/icons/*.svg` and `assets/icons.js` (`RI.icon(name, size)`, or `<i data-icon="candle">`).
- Skill → icon: herbalism sprig, scavenging lantern, chandlery candle, sigilcraft sigil, scholarship book, ritualism circleRite. Categories: leaf, house, candle, sigil, scroll, circleRite. Plus coin, moon, cog.
- Skill icons take the skill colour; panel icons take `--color-text-3`; item glyphs in chips take the maker's skill colour.
- **Ornaments** (`src/ui/art/ornaments.tsx`): papercut rosette (`assets/ornaments/rosette.svg`), cross-stitch (`assets/ornaments/stitch.svg`, also inlined in `.stitch-band`, `.stitch`, the active `.tab`). v0.3's diamond embroidery band and sigil divider are retired.
- No icon font, no emoji, no third-party set.

## PLACES (tab identity)
One shell, four rooms. The shared foundation (tokens, components, top bar, sidebar) never changes. Each tab adds four things and nothing more, set by `data-place` on `.shell` (`ui_kits/ritual-idle/places.css`, demo `places.html`):
1. **Place colour** `--place` (+ `--place-deep`): House ember `#e2703f`, Grimoire lilac, Village verdigris, Circle rowan. It tints the active tab's icon, the room's ambient light, the hero and the place's own signature marks. It never replaces the action red or the skill colours.
2. **Hero band** at the top of the tab: big mark, the place name (Alegreya SC 30px), one lore line, 2–3 key numbers, an embroidery band in the place colour. On House the Sanctum scene is the hero.
3. **Material:** House = wood panels; Grimoire = an open book (bookmark-ribbon index + vellum page, roman-numeral hints); Village = pinned linen notices (daylight paper, red pin, tilt) + a shop ledger; Circle = the floor at night (dark stage, the rosette as hero art, parts beside it).
4. **One signature interaction glow:** House the running row, Grimoire lit glows and numerals, Village a ready notice, Circle the placed petals.

## Index
- `styles.css` — entry point (imports only)
- `tokens/` — `fonts.css`, `palette.css` (raw), `semantic.css` (roles, skill map, Linen theme), `type.css`, `space.css`
- `components/components.css` — class-based components, same class vocabulary as the game (`btn`, `panel`, `bar`, `chip`, `tabs`, `topbar`, `skill-list`, `recipes`, `ledger`, `tracker`, `omen`, `toast`, `dialog`, `vellum`, `stitch-band`)
- `components/*.card.html` — component specimens
- `guidelines/*.html` — foundation specimens (colours, type, spacing, brand)
- `assets/` — icons, ornaments, `icons.js`
- `ui_kits/ritual-idle/index.html` — House screen on the new system (interactive: pick skills, Start/Stop, Tend, tabs, Settings with density and Linen theme)
- `ui_kits/ritual-idle/current.html` — House screen as built today (v0.3), using the repo's CSS — the "before"
- `src/ui/styles/` — verbatim copies of the repo's v0.3 CSS (reference only)

## Intentional additions
- `data-theme="linen"` — direction C, as a preview theme (the audit suggests adding it later).
- `data-density="compact"` — 32px rows (the audit calls for it as a setting).
- `.seg` segmented control — for settings choices in the kit.

## Caveats
- Components are **CSS classes**, not React components — the game is styled by class-based CSS, so this drops in as a replacement for `components.css` + `identity.css`.
- The **Sanctum** scene is not recreated (it's a 12KB code-drawn SVG); both kits show a labelled placeholder.
- Only the **House** tab is rebuilt. Grimoire, Village, Circle, the Kindling, talent tree, rite ceremony and dialogs follow the rules above but have no screens yet.
- The **wordmark** uses Alegreya SC as a placeholder. IM Fell English SC is Latin-only; a final SVG wordmark (or Ruslan Display) is still open.
- Fonts load from Google Fonts here; the game should use `@fontsource/alegreya-sans` alongside the existing packages.
