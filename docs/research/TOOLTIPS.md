# Tooltips (research note, 2026-09-27)

A dated snapshot. **Decided:** custom rich hover cards (`<Tip>`), no browser `title` tooltips (playtest round 3).

## The problem
The browser's own tooltips (`title`) came up in playtests as distracting:
- they appear slowly and inconsistently
- they can't be styled
- they're plain text only
- they don't work on touch or for keyboard users
- they cover what the player is reading

The game also needs *deeper* information on demand. The clearest example: where a chance find's bonuses come from.

## What works (common guidance and genre practice)
- **Supplementary, never essential.** A tooltip adds detail. Anything the player needs to act, such as why a button is disabled or what they're short of, is written on screen. Hidden-by-default text is easily missed (the usual usability guidance on tooltips).
- **Hover and keyboard focus, after a short delay.** About 300–500 ms avoids flicker as the pointer crosses the screen, and focus shows it at once. It closes on leave, blur or Escape.
- **Don't cover the target.** Place the card above the element, or below when there's no room. Keep it on screen, and never let it catch clicks.
- **Touch needs an alternative.** Press and hold to show; a tap still does the element's own action.
- **Scannable structure.** A title, then label/value rows, then one muted note. The idle and RPG references do this well: Melvor Idle's item and modifier tooltips, and RuneScape's item examine plus rich hovers, where a number's breakdown is one hover away.
- **Short.** One idea per card. Long lore belongs in the Grimoire.

## What we built
- **`Tip`** (`src/ui/components/Tip.tsx`):
  - wraps one element
  - opens on a 350 ms hover, keyboard focus or a 500 ms touch hold
  - is portalled, placed above or below and flipped to stay on screen
  - uses `pointer-events: none` and `role="tooltip"` with `aria-describedby`
  - closes on Escape or scroll
  - respects reduced motion
- **`TipCard`**: a title, rows and a note.
- **Where it's used:**
  - item chips: the item, have/need, and for a recipe's chance find the breakdown (base chance, each bonus and its multiplier, now; past 100% "1 for sure, N% for a 2nd")
  - the recipe XP/h cell: a rate card with per-hour output, XP, the next level and how long the inputs last
  - buffs in the top bar, a minor rite's effect, talent leaves (lock state, flavour), keepsakes (flavour), contract cards (the villager's full words), Janko, omens in the away summary, inventory filters
- **Rule:** no `title` attribute on DOM elements. A test (`src/ui/noTitles.test.ts`) scans the UI. Disabled-button reasons are visible text.
