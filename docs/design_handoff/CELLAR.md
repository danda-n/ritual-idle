# Handoff addendum: the Cellar (auto-combat), gear and Crafting

Read `README.md` first. This file adds the combat work built on the same system. The briefs it answers are in `reference/briefs/`.

## Files to open
- `reference/ui_kits/ritual-idle/cellar.html`: **the main reference.** A "Mock state" bar at the top switches between the 12 states. That bar is for review only. Don't ship it.
- `reference/ui_kits/ritual-idle/crafting.html`: the Crafting skill and the crafting window, with 6 mock states.
- `reference/ui_kits/ritual-idle/cellar-frames.html`: the Cellar at 1280px and 375px.
- CSS, loaded in this order after the base: `cellar.css` → `gear.css` → `crafting.css`.
- Icons: `reference/assets/cellar-icons.js` and `gear-icons.js`. They add their paths to `RI.paths`.
- Foe art: `reference/assets/foes/{id}_art.jpg` (big) and `{id}_icon.jpg` (portrait) for skrzat, kikimora, zmora and domovoi.

## Fidelity
High fidelity. Match the colours, type, spacing and states. The mock data (foes, numbers, pieces) is placeholder: take the real values from the game's data.

## Hard rules (on top of README's)
- **Plain English** in every line that explains a mechanic. Write short, whole sentences, not fragments joined with "·". The introduction dialog is the model.
- **No browser tooltips.** Use the Tip card (`.has-tip` + `.tip`). It must show on hover **and** on keyboard focus.
- **Begin** is the only red fill on the screen. When it can't be pressed, it says why ("Needs Warding 10").
- **Readiness** is always the word plus 0–4 diamond pips. Colour is never the only signal.
- **Focus:** every control you can press shows the 2px focus ring (`--color-focus`).
- **Reduced motion** stops the candle glow, the art shake and lunge, the damage pop-ups and the affix flip. The Health bars and the blow timer still move.

## New tokens
- Warding skill: hoarfrost `#b6dde8` → `[data-skill="warding"]`.
- Crafting skill: flax `#d6b98a` → `[data-skill="crafting"]`.
- Cellar place: flint `#8c9cf2`, deep `#232a4d` → `[data-place="cellar"]`.
- Candle light: `rgb(237 171 92)`. It's the Cellar's one glow, not a role colour.
- Readiness: Safe `#5ebaaf` · Likely `#92b3cb` · Risky `#f2a97c` · Deadly `#f28a74` on an oxblood tint · Hopeless `#a8a49b`.
- Small labels in the Cellar are 13px and use text-2. Body text is 15px.

## Screens

### Cellar layout
- **Hero:** a cold, plain background with one still candle glow (no pattern, no flicker). Title, one lore line, a "How it works" link, and three stat boxes: Warding level, Foes warded off, Domovoi state. Values are 32px.
- **Two columns** at 1100px and wider: **You** on the left, **Foes / the fight** on the right. Below 1100px it's one column, with the foe column first.
- **Sidebar:** unchanged from the base shell (tracker, omens, collapsed shelves).

### You panel (left)
- **Head:** "You" plus two level chips (Warding, Crafting), with the skill icon and the level in the skill colour. Two tabs on the right: **Gear** and **Your stats**.
- **Stat strip:** Health, Ward, Strike, Speed. Each shows a big number and one short line saying where it comes from.
- **Gear tab:**
  - **Five tiles in one row:** Amulet, Hand, Lantern, Garment, Belt. On phones it's 3 per row.
  - Each tile shows the icon, the slot name, the piece name and one big number (its base stat). The tier sits top right. The tag badge sits top left and turns verdigris with a ✓ when the chosen foe fears it (only once the weakness is known). Pieces from Grandmother's set have a red stitched line along the bottom.
  - An **empty slot** gets a red outline and says "Empty".
  - **Set line** under the row: the set name, the piece count and the bonus.
  - **One detail card** under the tiles, for the tile you tapped: name, tier, base stat, tag, rolled affix, set. "Change" opens the picker (a popover on desktop, a bottom sheet on phones). The picker lists only pieces you hold, and ends with "Make more: Crafting ›".
  - **Remedy and charm** boxes, then the healing rule ("Use a remedy below 40% Health", with a − / + stepper).
  - While a fight runs, the gear is locked: no Change, no stepper.
- **Your stats tab:** each stat broken into the parts that make it, then one plain line about this foe (for example "Your blows land for about 6.5 · 3 to win"). Then the weakness line.

### Foes (right, not fighting)
- Three foe cards with big art (4:3), then the boss card (Domovoi: wider, the art on the left, warmer). Cards you haven't chosen have dimmed art. The chosen card gets a 2px place-colour ring and a glow.
- Each card: name, readiness tag, Health / Strike / Ward, and "Fears ?" or the weakness.
- **Go bar:** portrait, foe name, one line about its specials or loot, the large readiness tag (opens a Tip with the rough chance), and **Begin**.

### The fight (right, fighting)
- **Head:** "Warding · fighting", the foe name, the count warded off, and Stop.
- **Arena:**
  - The foe's Health bar on top.
  - The **big art** in the middle on the candle glow, with your Health bar below.
  - A thin "Next blow" timer between them.
- **Your blow:** the art shakes, and the damage pops up over it. A telling blow pops bigger and shows a "✶ Telling blow ×2" banner.
- **Its blow:** the art lunges toward you, and your Health row flashes red.
- **Foe warded off:** the art fades and comes back. A float says "Warded off" or the loot.
- **Below the arena:** loot, remedies left, charm uses, and the last 4 blows (portrait or "you" dot, name, what happened, number).
- **Top bar** during a fight: the now-working band shows Warding, the foe portrait, the foe's Health and Stop.

### End states
- **Stopped:** one line above the foe view, with a Dismiss link.
- **Driven off:** a calm panel with what hit you, Cost (remedies used and that foe's loot), Kept (all gear), Now, and one line of advice that links to the fix (for example "An iron Amulet halves its blows · Wear it ›"). Never a separate screen.

### Dialogs
- **Introduction** (the first visit, and "How it works"): the four portraits, a short quote, and 8 plain-English sections, then "Go down to the cellar".
- **Domovoi calmed:** big art, his gift in a gold-edged box (gold is allowed here because it's a keepsake), and "Back to the cellar".
- **Away summary:** the cellar line first, then the other skills, then Health.

### Bestiary
A page in the Grimoire book. One art tile per foe, showing fears, specials and loot (or the boss's gift). Foes you haven't met yet are locked tiles.

### Crafting window (`crafting.html`)
- **Layout:** a slot rail → a piece list (locked pieces show the level they need) → the piece card.
- **Piece card:** icon, name, tier pills, then base stat, fixed affix (tag), the random affix pool, set, and Tier 2 preview. At the bottom: materials (chips), time, XP and **Craft**.
- **After Craft:** 2 options (3 with the Workbench) flip over one by one. The player picks one and presses **Choose**. A high roll says "▲ High roll" in verdigris, never gold.
- **Reforge:** the current affix on top, the new rolls below, and "Keep the old one" next to Choose.
- **Upgrade:** a list of what Tier 2 adds, and a locked button that says what's missing.

## State to add
- `cellar.selectedFoe`
- `cellar.gearTileSelected`
- `cellar.youTab` (`gear` | `stats`)
- `cellar.healAt` (10–80, in steps of 5)
- `cellar.pickerOpen`
- `crafting.slot`, `crafting.piece`, `crafting.pendingRolls`, `crafting.picked`
- The fight state (Health, timer, log, tally) comes from the combat sim. Animate it from the sim's events: `blow`, `tellingBlow`, `special`, `heal`, `foeDown`, `loot`.

## Check before the PR
Run `audit.js` (`RIAudit.run('label')`) on every Cellar and Crafting state at 1280px and 375px. Expect 0 contrast fails, 0 italics and nothing under 12px. Tab through the whole screen with the keyboard: every control should be reachable and show the focus ring.
