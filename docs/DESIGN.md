# Design System (v0.1)

The folk-art / woodcut direction from [CONCEPT.md §9](CONCEPT.md): one candlelit dark theme, drawn entirely in code (there is no bitmap art yet).

## Tokens: `src/ui/styles/tokens.css`
- **Palette:**
  - ink (backgrounds, 950 → 600)
  - bone (text, 100 / 300 / 500)
  - candle gold (accent, focus, progress)
  - ember (danger, ornaments, warnings)
- **Contrast:** checked at ≥ 4.5:1 for every text token on every surface.
- **Components use semantic tokens only** (`--color-text`, `--color-accent`…), never raw hex.
- **Type:**
  - *IM Fell English SC* for the title only (woodcut-era print)
  - *Alegreya SC* for headings, labels, buttons and tabs
  - *Alegreya* for body text and grandmother's notes (in italics)
  - All three are self-hosted through `@fontsource`, so they work offline and in Electron. Alegreya covers Latin-extended and Cyrillic for Slavic names.
  - Numbers use the `.num` class (tabular figures).
- **Space and shape:** 4px rhythm (`--space-1` to `--space-7`); small radii (3 / 5 / 8px), because woodcut blocks are square-ish.
- **Motion:** `--dur-fast/med/slow`. The OS reduced-motion preference and the in-game setting (`html[data-motion="reduced"]`) both set every duration to 0.

## Components: `src/ui/styles/components.css`
`btn` (primary / ghost / danger), `panel`, `bar`, `chip` (`short` = missing input, `accent` = output), `tabs`, `toast`, `modal`, `ledger` (item/count lists), `note-quote`, `field`.

Item names go through `ItemChip` (`src/ui/components/ItemLookup.tsx`), so any item is clickable for a lookup. Add `plain` for text-style links in lists.

## Art: `src/ui/art/`
- **Icons:** 24px grid, 1.75 stroke, round joins, `currentColor`, with a few solid "ink" fills. Decorative icons get `aria-hidden`; pass `title` when an icon carries meaning on its own.
- **Ornaments:** embroidery band, papercut rosette and sigil divider. All decorative.

## Rules
- **Accessibility:**
  - visible gold focus ring on everything
  - tabs support arrow keys, Home and End
  - modals move focus inside, close with Escape, and restore focus afterwards
  - toasts announce politely and never steal focus
- **Colour is never the only signal.** A missing input is ember *and* its chip keeps the count; a locked action says "Level N".
- **No emoji as icons.** Only SVG.

## The living sanctum: `src/ui/art/Sanctum.tsx`
- **One code-drawn SVG scene**, woodcut and papercut in style: hatch-pattern shadows, flat ink shapes, bone highlights, ember and gold light.
- **Its state is derived only from progress** (`sanctumView`). The five Chapter 1 states:
  1. dark and cold (moonlight only)
  2. candlelit (first tallow candle)
  3. warded (salt line, then iron nails over the door)
  4. circle awake (*Bless the threshold*)
  5. cellar open (after the Rite)
- **Props appear as you earn them:**
  - drying rack, reading lamp, omen shelf (stored omens glow)
  - dream pillow, honey-light jar
  - Janko by the fire
  - the embroidered cloth for a Resplendent rite
  - Blessing smoke
- **Accessibility:** a caption and `aria-label` describe the room in one sentence.
- **Motion:** candle and hearth flicker, drifting smoke, and a circle pulse during the rite. The OS reduced-motion preference and the in-game setting stop all of it.
- **Layout:** below 860px, the main content comes before the sidebar, and skills become a horizontal strip. A skip link jumps to the main content.

## Motion notes
- **Timed progress** (actions, the rite) uses `TimedBar` (`src/ui/components/Bar.tsx`). It reads the progress once per repetition, then a CSS `scaleX` animation runs on the compositor, so it moves every frame at no cost to the game loop. Key it per repetition.
- **Stepwise progress** (XP, goals, insight) uses `Bar`, which eases between values.
- **Progress bars keep filling under reduced motion**, because they carry information. Everything decorative stops.
- **The circle fills with feeling:** the glow and inner ring brighten, the marker dots light in order, the outer ring's drift speeds up, items settle into their slots, and the circle flares when it answers. Transform and opacity only.
- **Modifier classes are prefixed** (`is-glow`, `is-discovered`…) so a state can never collide with a component class. That collision is what squashed the circle's result line into a 10px dot.
