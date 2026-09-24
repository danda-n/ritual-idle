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
