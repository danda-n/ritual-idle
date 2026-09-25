# Design System (v0.4, fourth patch)

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
  - **Sizes** *(fourth patch: one step larger)*: `--text-xs` 14, `sm` 15, `md` 17, `lg` 19, `xl` 23, `2xl` 29 px.
- **Space and shape:** 4px rhythm (`--space-1` to `--space-7`); small radii (3 / 5 / 8px), because woodcut blocks are square-ish.
- **Motion:** `--dur-fast/med/slow`. The OS reduced-motion preference and the in-game setting (`html[data-motion="reduced"]`) both set every duration to 0.

## Components: `src/ui/styles/components.css`
`btn` (primary / ghost / danger), `panel`, `bar`, `chip` (`short` = missing input, `accent` = output), `tabs`, `toast`, `modal`, `ledger` (item/count lists), `note-quote`, `field`.

Item names go through `ItemChip` (`src/ui/components/ItemLookup.tsx`), so any item is clickable for a lookup. Add `plain` for text-style links in lists.

## Art: `src/ui/art/`
- **Icons:** 24px grid, 1.75 stroke, round joins, `currentColor`, with a few solid "ink" fills. Decorative icons get `aria-hidden`; pass `title` when an icon carries meaning on its own.
- **Item icons** *(fourth patch)*: one woodcut glyph per item (`src/ui/art/items.tsx`, `ItemIcon`), on the same grid and stroke. They take `currentColor`, so a chip colours each with the skill that makes it. Add a glyph whenever you add an item.
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
- **Feedback:** rows change only their border and tint on hover *(fourth patch: they used to lift)*, the running row breathes, skill tiles flash on level-up, and pantry counts bump when they change. All are transform/opacity/box-shadow, and all stop under reduced motion.
- **Writing rule:** effects lead, in plain numbers generated from the data (`src/ui/effects.ts`). Flavour is one short line at most.
- **The shop:**
  - *Provisions* (repeatable) say what you get, what it's for and how many you hold.
  - Buttons read "Buy · N" (an outline) when you can afford it, and "Need N more" when you can't.
  - *(Fourth patch: the one-time "For the house" items moved to House projects, built from items; see below.)*
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
- **Talents panel** (`components/TalentPanel.tsx`) sits under a skill's recipes. *(Branches, ranks and keystones were replaced by the talent vine in the fourth patch; see below.)*
  - Three branch cards with rank pips, the current effect in plain numbers and a "+1 rank" button.
  - Below them, the keystone row: dashed until it can be taken, solid in the skill colour once open or taken.
  - The header says "N points to spend" or "Next point at level N", with a free Reset.

## Second patch: task cards, no layout shift
- **Task card** (`components/TaskCard.tsx`, replacing the note modal):
  - The title is "New: <task>", followed by what opened (chips) and the steps. The current step is bold with ▶; done steps get ✓. Each step's reward sits on the right in candle gold.
  - Then the part's needs as chips, and a primary **Go: <current step>** button.
  - Grandmother's `quote` comes last, in small muted italics.
- **The tracker's current step** shows "step k of n", a thin bar, the current step with its reward, and the needs chips. There's no hint paragraph.
- **No layout shift:**
  - Action rows keep one height. The rates line always takes a single line (ellipsis, full text in the tooltip) and hover only reveals it (`visibility`/`opacity`).
  - The control column has a fixed minimum height, whether it holds Start or the bar.
- **The omen picker:** *Bless a skill* (fourth patch; it was "Release") asks "Bless which work?" with a skill-coloured button per open skill, the running one first (marked "now"). Buff chips name the blessed skill.

## Third patch: claim buttons, the picker, the tree, the ceremony
- **Claim buttons:** gold, full-width in the tracker ("Claim · +2 beeswax"). An XP choice opens the skill picker.
- **The skill picker** (`components/SkillPicker.tsx`, used for omen blessings and XP choices):
  - A dialog with the effect line in candle gold on top, then anything already active, then one tile per open skill.
  - Each tile has a skill-colour stripe, the icon, the name and the level, and "working on it now" or "helps your next step" when that applies.
- **The omen shelf** is just jars, the effect in one line, one **Bless a skill** button (fourth patch), and the active blessings, each with its skill icon, a draining bar in the skill colour and the time left.
- **The talent tree of life** (`components/TalentTree.tsx`) *(replaced by the vine in the fourth patch)*:
  - SVG: a stitched trunk from the skill's root to a keystone flower, and four curling limbs with leaves.
  - Nodes: taken = filled in the skill colour; next = an outline with a slow pulse; locked = dim.
  - The flower blooms in the skill colour when a branch is full. The caption under it says what the hovered or focused node does.
- **The ceremony** *(replaced in the fourth patch: the rite runs by itself, see below)*.
- **Insight** shows as "✦ N insight" in candle gold. Hint buttons read "Name one ingredient · 6 ✦" and are disabled with the shortfall in their tooltip.
- **Dialogs stack:** Escape closes only the top one.

## Fourth patch: calm feedback, rows that stay put, builds and projects
- **Two feedback channels: the feed and toasts.**
  - The **activity feed** (`components/ActivityFeed.tsx`) is one quiet line under the top bar with the latest routine event. It fades in, never changes height, and announces politely. Click it for the last 30 (Escape or a click outside closes the list).
  - **Routine events go to the feed:** steps done, plain level-ups, omens found or lost, claims, talent picks, partial deliveries, a fallback switch, pages that teach nothing new.
  - **Toasts are only for big moments:** a part placed, a project built, a contract done, a level-up that opens a new tier or recipe or a talent choice, a page that teaches a recipe, rare finds, curios, the rite beginning, and refusals ("why that didn't work").
  - Insight still never toasts: a quiet float on the Grimoire tab.
- **Loot floats queue per anchor:** floats from the same spot leave 220ms apart and stack upward instead of overlapping (`components/Floats.tsx`).
- **Rows never shift:**
  - Hover changes only the **border and background tint**; no lift, no size change. The top bar's action name has a fixed slot.
  - **Click anywhere on a row to start its recipe.** Chips and their menus keep their own clicks.
  - Recipe rows read "Tier N · Lvl L · time · XP".
- **Task cards** close only with their button or Escape, never with a stray click on the backdrop. **Go** leads to the skill that makes the current step's first missing ingredient.
- **The stage choice:** after the Light, the tracker shows "Choose what to make next. Any order works." with one skill-coloured tile per remaining part (the part's name and "brings <skill>").
- **The Stores tab** (`screens/Stores.tsx`, a jar icon): the inventory moved out of the sidebar to its own tab. There's no separate "needed now" strip, because the tracker's chips already show what the current step needs.
- **The talent vine** (`components/TalentTree.tsx`, replacing the tree of life):
  - An embroidered vine from the skill at the root; level 3 is nearest the root, then 6, 9 and 12.
  - Each level has a pair of leaves, one on each side, each with the talent's name and its effect in plain words.
  - Taken = filled in the skill colour; the other side dims (click it to switch, free); not reached yet = a stitched outline, disabled, with "Opens at level N".
  - The panel header says "A talent to choose" or "Next choice at level N", with a free Reset. A skill tile shows "+N" in its colour while choices wait.
- **House projects** (`components/Projects.tsx`): a panel on the House tab, shown once Chandlery is open, marked "Optional · built once, kept for good".
  - Each project card has its icon, name, effect line, and item chips with have/need, and a **Build** button (gold only when everything is there; otherwise disabled, with the reason in its tooltip). The effect takes the helped skill's colour.
  - Built projects fold into one "In the house:" line at the bottom.
  - Building the omen shelf opens a short note on what omens do.
- **Contract cards** (`screens/Village.tsx`), on vellum:
  - Who's asking, their line, then one row per item: a chip for what's still needed (✓ once done), "n/N delivered" and a thin bar.
  - "Pays N coin · +N trust", then **Deliver what I have** (gold when you hold any of it), which becomes **Deliver and finish** when it would complete, and **Turn away** (ghost).
- **The rite card:** "About 3 minutes. It runs by itself…", then **Offerings (optional)**: the hearth candle as a checkbox (disabled with the reason when you have none), and the Hearth mark and Still Night as ✦ (met) or ◇ (not yet). The outcome line names the quality and says only the lore and a keepsake differ. While it runs: the phase, its bar and the time left; the current part's petal pulses on the rosette.
- **Item icons** appear on item chips (recipe rows, tracker, task cards), in Stores, on contracts and projects, and in the Circle's picker and slots.

## Words (one per thing)
- **the Circle**: the place (lowercase "circle" only inside lore text)
- **the Kindling**: the chapter's rite; its five **parts** are *placed* in the Circle
- **experiments**: optional guesses at the Circle (hidden recipes and secrets)
- **talents**: per-skill choices, one side of a **pair** at levels 3, 6, 9 and 12
- **steps**: the small tasks inside a stage; their **rewards** are *claimed*
- **insight**: the pool you *spend* on hints; **clues** are secrets' hints
- **offerings**: the rite's optional extras that set its quality
- **tier**: a group of recipes that opens together, every 3 levels
- **contracts**: the village's asks, *delivered* (in parts or whole) and *finished*
- **projects**: house upgrades you *build* from items
- **bless a skill**: what you do with an omen (not "release")
- **the feed**: the one-line log of routine events; **toasts** are for big moments
- **recipe**: a craftable action
- **hidden recipe**: a Grimoire entry found by hints
- **secret**: found with no hints
- **Stores**: the tab with the inventory (its panel is headed "Stores" too; "the pantry" is only the Search the pantry action, and "the omen shelf" is the project)
- **insight** and **trust** are always shown together with what they unlock
