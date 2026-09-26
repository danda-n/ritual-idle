# Handoff: Ritual Idle design system ("Hearth + Folk", built on "Soot & Linen")

## Overview
This is a new visual foundation for **Ritual Idle** (`github.com/danda-n/ritual-idle`). It replaces the v0.3 "candlelit vellum" styles in `src/ui/styles/`. It comes from the design audit (`reference/VISUAL_DIRECTION.md`, direction A) and several review rounds:
- **Base:** "Soot & Linen" tokens. Each colour has one job: red = act, verdigris = selected/done, gold = rare, skill colours = identity.
- **Look:** "Hearth". Warm grounds, small-caps headings, and the running work is the one thing that glows.
- **Flair:** "Folk". Embroidery bands, brass corner marks on cards, item tokens, a running row that fills as it works, and pressable buttons.
- **Places:** each tab (House, Grimoire, Village, Circle) gets its own colour, hero band and material, on one shared shell.

## About the design files
Everything in `reference/` is a **design reference built in HTML/CSS**, not production code. The game is React plus plain class-based CSS (`src/ui/styles/*.css`, imported in `src/main.tsx`). The CSS in `reference/` uses **the same class vocabulary** as the game (`btn`, `panel`, `bar`, `chip`, `tabs`, `topbar`, `tracker`, `omen`, `ledger`, `toast`…), so most of it ports directly. The task is to **move the game's styles and markup onto this system**, not to paste the HTML in.

## Fidelity
**High fidelity.** Colours, type, spacing, radii, states and motion are final. Match them exactly. The Sanctum scene (`src/ui/art/Sanctum.tsx`) is **kept as it is**: in the mocks it's a placeholder behind the House hero band.

## Hard rules
1. **No italics anywhere.** Lore uses Alegreya roman. Remove every `font-style: italic` (`.note-quote`, `.toast-text`, `.flavour`, `.part-line`, `.sanctum-caption`…).
2. **No dashed or dotted outlines** on items or disabled buttons. "Short" = a red-tinted chip plus a red count pill. Disabled = a solid dark background with the reason in text.
3. **Red fill only on the one thing to press.** Row Start buttons are neutral until you hover them.
4. **Gold only means rare:** rare finds, Resplendent, keepsakes, step rewards and insight ✦. Never coin, level-ups, frames or headings.
5. **Skill colours** go on icons, stripes, bars and the running row only. Item chips are neutral with a coloured icon badge.
6. **Contrast:** text ≥ 4.5:1 (≥ 3:1 at ≥ 24px). Run `reference/ui_kits/ritual-idle/audit.js` (`RIAudit.run('label')` in the console) on every tab. It should report 0 fails, 0 italics and nothing under 12px.
7. **Colour is never the only signal**: every colour has a glyph or text next to it.
8. **Reduced motion** (OS setting or `html[data-motion="reduced"]`) stops every loop except progress bars.

## Target file structure in the repo
```
src/ui/styles/
  tokens/palette.css      ← reference/tokens/palette.css
  tokens/semantic.css     ← reference/tokens/semantic.css + the Hearth grounds from looks.css (see below)
  tokens/type.css         ← reference/tokens/type.css
  tokens/space.css        ← reference/tokens/space.css (incl. [data-density])
  base.css                ← the base section of reference/components/components.css
  components.css          ← the rest of components.css + the Hearth rules from looks.css + folk.css, unscoped
  places.css              ← reference/ui_kits/ritual-idle/places.css
  (delete) identity.css, layout.css → fold what's still used into components.css/places.css
src/ui/art/ornaments.tsx  ← keep EmbroideryBand (now the top-bar band), Rosette; drop SigilDivider
docs/DESIGN.md            ← replace with reference/DESIGN_SYSTEM.md (+ the rules above)
```
Fonts: add `@fontsource/alegreya-sans` (400, 500, 700). Keep `@fontsource/alegreya` and `@fontsource/alegreya-sc`. Drop `@fontsource/im-fell-english-sc`, which has no Cyrillic. Remove the Google Fonts `@import` in `tokens/fonts.css`, because fontsource replaces it.

**Scoping:** in the mocks, Hearth and Folk are opt-in through `[data-look="hearth"]` and `[data-flair="folk"]`. In the game they are **the default**: remove those attribute prefixes and put the Hearth grounds in `:root`. The Linen theme (`[data-theme="linen"]`) stays opt-in as a future setting.

## Design tokens (final values)
**Grounds (Hearth: these override the Soot values):** bg `#0e0c0a` · band `#16130f` · surface `#1f1b17` · raised `#2b2621` · sunken `#0b0908` · border-soft `#342e28` · border `#4b433b` · vellum `#2c251d`
**Text:** `#ede7db` / `#bfbaaf` / `#99958c`
**Roles:** action `#b63325` (hover `#a1271e`, Folk gradient `#c73a2b→#a8291f`, 2px `#5c150f` base shadow) · danger text `#ef816b` · selected/success `#5ebaaf` · info `#92b3cb` · rare `#edb345` · stitch `#c93126` · oxblood `#7f2119` · brass `#9a7a45` (arrows `#b39463`)
**Skills:** herbalism `#94be58` · scavenging `#469bd1` · chandlery `#ebd56a` · sigilcraft `#ee694f` · scholarship `#cdaef2` · ritualism `#db6ea5` (set through `[data-skill]` → `--skill`)
**Places:** house `#e2703f` · grimoire = lilac · village = verdigris · circle = rowan (`[data-place]` → `--place`, `--place-deep`)
**Type:** UI = Alegreya Sans · titles and column labels = Alegreya SC · lore = Alegreya (roman). Scale 12 / 13 / 14 / 15 / 17 / 21 / 28, hero titles 30, rows 15px, labels 12px SC +0.06em.
**Space:** 4 / 8 / 12 / 16 / 24 / 32 / 48 · rows 46px (roomy, the default), 36, 32.
**Radii:** 3px (buttons, chips) · 4px (panels) · 6px (dialogs) · 0 for bars.
**Motion:** 120 / 220 / 420ms, `cubic-bezier(0.2,0.7,0.2,1)`.

## Screens
Open `reference/ui_kits/ritual-idle/places.html` and click through the tabs.

### Shell (every tab)
- **Top bar** (60px, band colour): rosette and "Ritual Idle" (Alegreya SC 24px), then the **now-working band**, then Tend, the buff chip, the purse and the settings cog. The now-working band has the skill's colour at 14% over the band, a 3px skill edge, a glow, a 12px SC skill label over the recipe name (SC 17px), an 8px timer bar, the time and Stop.
- **Embroidery band** (12px, stitch red, the diamond pattern from `EmbroideryBand`) directly under the top bar. Use `mask-repeat: round` so it never ends on a half diamond.
- **Tabs:** Alegreya SC 16px, text-3. The active tab gets text-1, an icon in the place colour, a glow in the place colour and a stitched red underline.
- **Sidebar** (320px, band colour): the chapter tracker (lit vellum card with brass corners and stitch steps), "Omens & blessings" (omens plus active blessings) and "All shelves" (collapsed `<details>`).
- **Room light:** a radial wash in the place colour at the top of the main column.

### House
- **Hero:** the Sanctum art sits behind a dark gradient, with a flickering hearth glow. Title "The House" in SC 30, one lore line, and stats: Skills, Working on (in the place colour), Away cap.
- **Skill list:** a 3px skill stripe on each item. The selected skill gets an 11% skill tint and a skill-coloured name. The **running skill** also shows the recipe name, an animated timer bar and the time.
- **Skill header:** a 12% skill tint, the name in SC 24, and an embroidery band in the skill colour.
- **Recipe table:** fixed columns `20px | name | Lvl 34 | Time 46 | XP 36 | inputs → makes | XP/h 52 | control 132`, with SC column labels.
  - The **running row** fills left to right with the skill colour over one cycle (`--dur` = cycle time), and has a 3px edge, a 1px ring and a glow.
  - The row's Start button is neutral until you hover it. A blocked Start shows the reason as text on a dark background.
- **Stock (per skill):** two separate lists, **Inputs** (short items first, red pill plus "need N") and **Made here**. Each list shows 5 rows, then "Show all N". Names are shown in full.

### Grimoire
- **Hero** in lilac, with stats: Insight to spend (✦ 7), Hidden recipes, Secrets.
- **Open book:**
  - **Index** (250px): bookmark ribbons, with the active entry marked by a lilac gradient and a 3px edge.
  - **Vellum page:** title in SC 30, a "Gives" line, a "Next step" callout with a lilac edge, a proofs grid (Belongs / Crossed out / Still possible), hints with glowing roman numerals, and your tries with lit glow dots.

### Village
- **Hero** in verdigris, with a Trust bar and Coin.
- **Knocks at the door:** pinned notices.
  - Paper is `#c9bda6→#b9ab92`, text `#1a1512`/`#2e2823`, with a red pin and a slight tilt.
  - Item icons sit on dark `#2b2520` badges.
  - A **ready** notice gets a verdigris ring and glow.
  - An empty slot shows the "Helped ✓" stamp and the refill timer.
- **Shop:** a list with a 34px icon tile for each item, and the effect in the skill colour. The button reads "Buy · 🪙N" when you can afford it (the 🪙 stands for the game's coin icon, not an emoji), "Need N more" when you can't, and "✓ In the house" once owned.

### Circle
- **Hero** in rowan, with stats: Parts placed and Ritualism.
- **Night stage:** the five-petal Kindling rosette as the hero art. The outer ring drifts. A placed petal is filled in its skill colour and glows; the next petal pulses with a dashed outline.
- **Part rows** beside the stage: placed (filled icon disc, lore line), open (skill tint, ring, chips, "Not ready yet" or Place), later (outlined disc, "Later · brings X").
- **Below:** Experiments (pill slots that glow in the place colour when filled) and "Pick from what you hold".

## Interactions and state
- Existing game state drives everything. The only new UI state:
  - `stockOpen` (which stock list is expanded)
  - `shelvesOpen` (the sidebar details)
  - a density setting (`roomy` | `comfortable` | `compact` → `html[data-density]`)
- The place comes from the active tab: set `data-place={tab}` on the layout root.
- Timed fills keep the compositor pattern from `Bar.tsx`/`TimedBar`. The running-row fill is a `::before` with `animation: sweep var(--dur) linear`. Key it per repetition, like `TimedBar`.
- **Floats:** coin is linen, level uses the skill colour, good is verdigris, rare is gold with ✦. Only rare glows.

## Assets
- `reference/assets/icons/*.svg` and `icons.js` come from `src/ui/art/icons.tsx`. There are no changes to the icons: keep using the TSX components.
- `reference/assets/ornaments/*` come from `ornaments.tsx`.

## Suggested order (each step can ship on its own, and you can screenshot to check)
1. Tokens: add the token files, map the old semantic names to the new ones, and add Alegreya Sans.
2. Strip v0.3 materials: remove the wood grain, gold glows, the double frames and the vellum everywhere except the tracker and Grimoire page. Remove all italics.
3. Shell: top bar with the now-working band, embroidery band, tabs, sidebar order, collapsed shelves.
4. House: skill list with the running timer, the recipe table grid, the running-row fill, the per-skill stock lists.
5. Places: add `data-place`, hero bands, then the Grimoire book, Village notices and shop, and the Circle stage.
6. Run the audit on all four tabs, then update `docs/DESIGN.md`.

## Files
- `reference/ui_kits/ritual-idle/places.html`: **the main reference**, all four tabs.
- `reference/ui_kits/ritual-idle/house-folk.html`: House only, with the stock lists.
- `reference/styles.css` → `tokens/*`, `components/components.css`: the foundation.
- `reference/ui_kits/ritual-idle/looks.css` (Hearth), `folk.css` (Folk), `places.css` (Places): the layers that sit on top.
- `reference/guidelines/*.html`, `reference/components/*.card.html`: specimen pages.
- `reference/DESIGN_SYSTEM.md`: full guidelines. `reference/VISUAL_DIRECTION.md`: the audit.
- `CLAUDE_CODE_PROMPT.md`: a prompt to paste into Claude Code.
