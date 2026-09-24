# Design System (v0.2)

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

## v0.3: candlelit vellum, folk colours (`src/ui/styles/identity.css`)
- **Two materials.**
  - The **room** is dark wood with a faint grain. Controls and lists sit on carved-wood panels.
  - **Vellum** is for what you read or act on: the chapter tracker, Grimoire pages, the rite recipe, village notices and every dialog. It's warm, lifted dark vellum lit by a candle from above, framed in gold with an inner gold rule.
  - It stands out by warmth, light and frame, not brightness. (v0.2 briefly used bright bone paper, but at 15:1 against the room it glared.)
  - It works by re-mapping the semantic tokens inside `.paper` / `.modal`. Text contrast on it: bone 10.7:1, muted ≥ 5.2:1, gold ≥ 6.2:1.
- **Folk colour per skill** (`data-skill` sets `--skill`):
  - Herbalism: moss
  - Scavenging: cornflower
  - Chandlery: candle gold
  - Sigilcraft: poppy
  - Scholarship: lilac-indigo
  - Ritualism: plum

  They're used on tile stripes, icons, XP bars, output chips, Start outlines, and the running row's glow. All are ≥ 5:1 on the dark surfaces.
- **Hierarchy:** the running action is the brightest thing on the House screen. Start buttons are quiet skill-coloured outlines until hovered, and the primary gold is kept for one decision at a time.
- **Structure:**
  - The top bar is its own dark band.
  - Tabs are ribbons with a stitched top; the active one is paper.
  - Section titles carry a red cross-stitch underline.
- **Feedback:** rows lift on hover, the running row breathes, skill tiles flash on level-up, and pantry counts bump when they change. All are transform/opacity/box-shadow, and all stop under reduced motion.
- **Writing rule:** effects lead, in plain numbers generated from the data (`src/ui/effects.ts`). Flavour is one short line at most.
- **The shop:**
  - *Provisions* (repeatable) say what you get, what it's for and how many you hold.
  - *For the house* (one-time) shows an icon and the effect in the helped skill's colour.
  - Buttons read "Buy · N" (an outline) when you can afford it, "Need N more" when you can't, and "✓ In the house" once owned.
- **Item chips** (`ItemChip`):
  - Always coloured and marked with the icon of the skill that *makes* the item, wherever they appear. Tallow is cornflower (Scavenging) even inside a Chandlery row. Bought items (bread) stay bone.
  - Inputs show have/need. **Enough** has a solid border and a quiet count. **Short** has a dashed border and a warning pill.
  - Clicking a short chip opens a small menu. It offers to start the action that makes the item, or says why it can't start yet, and has "Look up".
  - Disabled Start buttons say what's missing ("Needs 2 beeswax", "Level 8").

## Feedback kit (`src/ui/fx.ts`, `components/Floats.tsx`, `useFx.ts`)
- `emitFx({ kind: "float", text, anchors, tone })` sends a label rising from the first matching element. The tones are item, rare (gold with ✦), coin, level and good.
- The `unlocked` and `helped` events drive the "New" badge on fresh recipe rows and the stamp on helped requests.
- `useCountUp` animates the purse. The tracker ticks and surges when a step completes, and the next note waits 800ms.
- Circle: glows light one by one, "Closer!" appears when a try beats your best, and discovery gives a spark ring and a blooming rosette.
- Everything uses transform, opacity and box-shadow only, and all of it stops under reduced motion.

## First patch: the Kindling and talents
- **The Kindling panel** (`components/KindlingPanel.tsx`) is vellum and sits at the top of the Circle tab.
  - A **rosette of five petals**, one per part. A petal is dashed until its part is placed, then filled in its skill's colour, with a bloom as it lands. While the rite runs the heart lights and the ring drifts.
  - **Part rows:**
    - Placed: a tick, and the one-line "placed" text.
    - Open: skill-coloured border, item chips with have/need, and a Place button (gold only when ready).
    - Later: the name and "Later · brings <skill>".
  - Once all five are placed, a **Wake it** block: the Ritualism level, Begin, "begin by itself", and the outcome with a "Why" toggle.
- **The tracker** shows the current part's items as chips. Its button is **Place in the Circle** (gold) once ready, and **Go** otherwise, which opens the stage's new skill.
- **Skill list:** only unlocked skills, plus one dashed **Next** tile that names the next skill and what brings it. A tile shows a "+N" badge in its skill colour when it has talent points.
- **Talents panel** (`components/TalentPanel.tsx`) sits under a skill's recipes.
  - Three branch cards with rank pips, the current effect in plain numbers and a "+1 rank" button.
  - Below them, the keystone row: dashed until it can be taken, solid in the skill colour once open or taken.
  - The header says "N points to spend" or "Next point at level N", with a free Reset.

## Words (one per thing)
- **the Circle**: the place (lowercase "circle" only inside lore text)
- **the Kindling**: the chapter's rite; its five **parts** are *placed* in the Circle
- **experiments**: optional guesses at the Circle (hidden recipes and secrets)
- **talents**: per-skill choices bought with **talent points**
- **recipe**: a craftable action
- **hidden recipe**: a Grimoire entry found by hints
- **secret**: found with no hints
- **Shelves**: the inventory ("the pantry" is only the Search the pantry action)
- **insight** and **trust** are always shown together with what they unlock
