# Design System

The folk-art / woodcut direction from [CONCEPT.md §9](CONCEPT.md): one candlelit dark theme, drawn entirely in code (there is no bitmap art yet). This doc describes the UI as it is now; how it got here is in the [Changelog](#changelog).

---

## 1. Tokens and type: `src/ui/styles/tokens.css`
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
  - **Sizes:** `--text-xs` 14, `sm` 15, `md` 17, `lg` 19, `xl` 23, `2xl` 29 px.
- **Space and shape:** 4px rhythm (`--space-1` to `--space-7`); small radii (3 / 5 / 8px), because woodcut blocks are square-ish.
- **Motion tokens:** `--dur-fast/med/slow` (120 / 220 / 420ms). The OS reduced-motion preference and the in-game setting (`html[data-motion="reduced"]`) both set every duration to 0.

### Two materials (`src/ui/styles/identity.css`)
- The **room** is dark wood with a faint grain. Controls and lists sit on carved-wood panels.
- **Vellum** is for what you read or act on: the chapter tracker, the Kindling panel, Grimoire pages, contracts and every dialog. It's warm, lifted dark vellum lit by a candle from above, framed in gold with an inner gold rule.
- Vellum stands out by warmth, light and frame, not brightness (bright bone paper glared at 15:1 against the room).
- It works by re-mapping the semantic tokens inside `.paper` / `.modal`. Text contrast on it: bone 10.7:1, muted ≥ 5.2:1, gold ≥ 6.2:1.

### Folk colour per skill
`data-skill` sets `--skill`:
- Herbalism: moss
- Scavenging: cornflower
- Chandlery: candle gold
- Sigilcraft: poppy
- Scholarship: lilac-indigo
- Ritualism: plum

They're used on tile stripes, icons, XP bars, item chips and icons, Start outlines, the running row's glow, talent leaves, project effects and the blessed-skill bars. All are ≥ 5:1 on the dark surfaces.

---

## 2. Components: `src/ui/styles/components.css`
`btn` (primary / ghost / danger), `panel`, `bar`, `chip` (`short` = missing input, `enough`, `accent` = output), `tabs`, `toast`, `modal`, `ledger` (item/count lists), `note-quote`, `field`.

- **Item chips** (`ItemChip`, `src/ui/components/ItemLookup.tsx`): every item name goes through it, so any item is clickable for a lookup. Add `plain` for text-style links in lists.
  - A chip is always coloured and marked with the icon of the item it names, in the colour of the skill that *makes* the item, wherever it appears. Tallow is cornflower (Scavenging) even inside a Chandlery row. Bought items (bread) stay bone.
  - Inputs show have/need. **Enough** has a solid border and a quiet count. **Short** has a dashed border and a warning pill.
  - Clicking a short chip opens a small menu. It offers to start the action that makes the item, or says why it can't start yet, and has "Look up".
- **Buttons:** the primary gold is kept for one decision at a time (Place, Claim, Build when ready, Begin the rite, a card's Go). Start buttons on recipe rows are quiet skill-coloured outlines until hovered. Disabled buttons say what's missing, on the button ("Needs 2 beeswax", "Level 8") or in its tooltip.
- **The skill picker** (`components/SkillPicker.tsx`, used for omen blessings and XP choices): a dialog with the effect line in candle gold on top, then anything already active, then one tile per open skill. Each tile has a skill-colour stripe, the icon, the name and the level, and "working on it now" or "helps your next step" when that applies.
- **Dialogs** (`components/Modal.tsx`) stack: Escape closes only the top one. Cards that carry a task (task cards, the omen-shelf card) close only with their button or Escape, never with a stray click on the backdrop.

---

## 3. Art and icons: `src/ui/art/`
- **Icons:** 24px grid, 1.75 stroke, round joins, `currentColor`, with a few solid "ink" fills. Decorative icons get `aria-hidden`; pass `title` when an icon carries meaning on its own.
- **Item icons:** one woodcut glyph per item (`src/ui/art/items.tsx`, `ItemIcon`), on the same grid and stroke. They take `currentColor`, so a chip colours each with the skill that makes it. They appear on item chips (recipe rows, tracker, task cards), in Stores, on contracts and projects, and in the Circle's picker and slots. **Add a glyph whenever you add an item.**
- **Ornaments:** embroidery band, papercut rosette and sigil divider. All decorative.
- **No emoji as icons.** Only SVG.

---

## 4. The living sanctum: `src/ui/art/Sanctum.tsx`
- **One code-drawn SVG scene** at the top of the House tab, woodcut and papercut in style: hatch-pattern shadows, flat ink shapes, bone highlights, ember and gold light.
- **Its state is derived only from progress** (`sanctumView`). The five Chapter 1 states:
  1. dark and cold (moonlight only)
  2. candlelit (first tallow candle)
  3. warded (salt line, then iron nails over the door)
  4. circle awake (the Ward placed)
  5. cellar open (after the Rite)
- **Props appear as you earn them:**
  - drying rack, reading lamp, omen shelf (stored omens glow) — the house projects
  - dream pillow, honey-light jar
  - Janko by the fire
  - the embroidered cloth for a Resplendent rite
  - Blessing smoke
- **Accessibility:** a caption and `aria-label` describe the room in one sentence.
- **Motion:** candle and hearth flicker, drifting smoke, and a bright circle while the rite runs. The OS reduced-motion preference and the in-game setting stop all of it.

---

## 5. Motion
- **Timed progress** (actions, rite phases) uses `TimedBar` (`src/ui/components/Bar.tsx`). It reads the progress once per repetition, then a CSS `scaleX` animation runs on the compositor, so it moves every frame at no cost to the game loop. Key it per repetition.
- **Stepwise progress** (XP, goals, steps, insight, deliveries) uses `Bar`, which eases between values.
- **Progress bars keep filling under reduced motion**, because they carry information. Everything decorative stops.
- **Transform, opacity and box-shadow only**, for every animation.
- **Live touches:** the running row breathes, skill tiles flash on level-up, items that just arrived get a short highlight in Stores, and the purse counts up.
- **The Circle fills with feeling:** the glow and inner ring brighten, the marker dots light in order, the outer ring's drift speeds up, items settle into their slots, and the Circle flares when it answers.
- **Invitations:** a slow gold glow (the `invite` animation) marks something worth a look: the omen shelf's project row while it's pointed out, and the Bless button when an omen is stored.
- **Modifier classes are prefixed** (`is-glow`, `is-discovered`…) so a state can never collide with a component class. That collision once squashed the Circle's result line into a 10px dot.

---

## 6. Feedback
The code: `src/ui/fx.ts`, `components/Floats.tsx`, `useFx.ts`, `components/ActivityFeed.tsx`.

### Floats
- `emitFx({ kind: "float", text, anchors, tone })` sends a label rising from the first matching element. The tones are item, rare (gold with ✦), coin, level and good.
- **Floats queue per anchor:** floats from the same spot leave 220ms apart and stack upward instead of overlapping.
- Insight never toasts: it floats quietly on the Grimoire tab.

### The feed and toasts
- **The activity feed** is one quiet line under the top bar with the latest routine event. It fades in, never changes height, and announces politely. Click it for the last 30 (Escape or a click outside closes the list).
- **Routine events go to the feed:** steps done, plain level-ups, omens found or lost, claims, talent picks, partial deliveries, a fallback switch, pages that teach nothing new.
- **Toasts are only for big moments:** a part placed, a project built, a contract done, a level-up that opens a new tier or recipe or a talent choice, a page that teaches a recipe, rare finds, curios, the rite beginning, and refusals ("why that didn't work"). Toasts announce politely and never steal focus.

### Moments
- The `unlocked` event puts a "New" badge on fresh recipe rows; `helped` stamps "Helped ✓" on a finished contract's slot; `placed` blooms a petal on the Kindling rosette.
- The tracker ticks and surges when a step completes, and the next task card waits 800ms.
- At the Circle: glows light one by one, "Closer!" appears when a try beats your best, and a discovery gives a spark ring and a blooming rosette.

---

## 7. Layout rules
- **Rows never shift.**
  - Hover changes only the **border and background tint**: no lift, no size change.
  - Action rows keep one height. The rates line always takes a single line (ellipsis, full text in the tooltip), and hover or focus only reveals it (`visibility` / `opacity`).
  - The control column has a fixed minimum height, whether it holds Start or the bar.
  - The top bar's action name has a fixed slot; the feed line never changes height.
- **Click anywhere on a row to start its recipe.** The Start button stays for the keyboard; chips and their menus keep their own clicks.
- **Hierarchy:** the running action is the brightest thing on the House screen.
- **Structure:**
  - The top bar is its own dark band, with the feed under it, then an embroidery band and the tabs.
  - Tabs are ribbons with a stitched top; the active one is vellum. New tabs show a dot until first visited.
  - Section titles carry a red cross-stitch underline.
- **Main and sidebar:** the tab's content on the left; the chapter tracker and the omen shelf in the sidebar.
- **Narrow screens:** below 860px, the main content comes before the sidebar, and skills become a horizontal strip. A skip link jumps to the main content.
- **Accessibility:**
  - visible gold focus ring on everything
  - tabs support arrow keys, Home and End
  - modals move focus inside, close with Escape, and restore focus afterwards
- **Colour is never the only signal.** A missing input is ember *and* its chip keeps the count; a locked recipe says "Level N".
- **Writing rule:** effects lead, in plain numbers generated from the data (`src/ui/effects.ts`). Flavour is one short line at most.

---

## 8. Screens and panels

### The top bar (`components/TopBar.tsx`)
- The title with a rosette, then what's running: the skill icon, the action's name, its bar, the seconds left and **Stop**.
- During the rite: "Kindling · phase n/5", the phase bar and the time left.
- When idle: "Next:" with the current task and a **Go** button (or why work stopped).
- Active blessings as chips naming the blessed skill and the time left, the purse (once the village is open), and the Settings gear.

### The chapter tracker (`components/ChapterTracker.tsx`)
- Vellum, at the top of the sidebar: "Chapter I · Hearth", done/total and a bar.
- Done tasks with ✓; the current one with ▶, "step k of n", a thin bar, the current step with its reward in candle gold, and the needs as chips (a skill level short shows as a short chip). There's no hint paragraph. One "???" ahead.
- Its button is **Place in the Circle** (gold) once the part is ready, and **Go** otherwise. Go leads to the skill that makes the current step's first missing ingredient.
- **Claim buttons:** gold and full-width ("Claim · +2 beeswax"). An XP choice opens the skill picker.
- **The stage choice:** after the Light, the tracker shows "Choose what to make next. Any order works." with one skill-coloured tile per remaining part (the part's name and "brings <skill>").
- **The omen-shelf pointer:** see House projects below.

### Task cards (`components/TaskCard.tsx`)
- The title is "New: <task>", followed by what opened and the steps. The current step is bold with ▶; done steps get ✓. Each step's reward sits on the right in candle gold.
- Then the part's needs as chips, and a primary **Go: <current step>** button.
- Grandmother's quote comes last, in small muted italics. The full note lives in the Grimoire journal.

### The House tab (`screens/House.tsx`)
- **The sanctum**, then the **skill list:** only unlocked skills, plus one dashed **Next** tile that names the next skill and what brings it (or says it's your choice while the next part is still yours to pick). A tile shows "+N" in its skill colour while talent choices wait.
- **The skill header:** the icon, the name and "About Xm to level N".
- **Recipe rows:** the name and "Tier N · Lvl L · time · XP", input chips → output chips, the rates line, and Start or the running bar. Only what you've reached plus the next tier shows. A recipe not yet learned from a page reads "Unknown recipe · Learned from a burnt page".
- **Talents as a vine** (`components/TalentPanel.tsx`, `components/TalentTree.tsx`), under the recipes:
  - An embroidered vine from the skill at the root; level 3 is nearest the root, then 6, 9 and 12.
  - Each level has a pair of leaves, one on each side, each with the talent's name and its effect in plain words.
  - Taken = filled in the skill colour; the other side dims (click it to switch, free); not reached yet = a stitched outline, disabled, with "Opens at level N".
  - The panel header says "A talent to choose" or "Next choice at level N", with a free Reset.
- **House projects** (`components/Projects.tsx`): a panel at the bottom of the House tab, shown once Chandlery is open, marked "Optional · built once, kept for good" (or "N ready to build" in candle gold while anything can be built).
  - Each project card has its icon, name, effect line, item chips with have/need, and a **Build** button (gold only when everything is there; otherwise disabled, with the reason in its tooltip). The effect takes the helped skill's colour.
  - Built projects fold into one "In the house:" line at the bottom.
  - Building the omen shelf opens a short note on what omens do.
- **Pointing out the omen shelf** (`components/ShelfCard.tsx`, the tracker, the Projects panel), once the Light is placed and until the shelf is built:
  - A one-time card in grandmother's voice ("My omen shelf is bare…"), with the shelf's item chips, **Show me the projects** (scrolls to the panel) and **Later**. It never shows over another card.
  - A quiet "Side project · The omen shelf" block under the tracker's steps: muted label, item chips, and **Go** (it reads **Build it** once everything is there).
  - The shelf's project row carries a gold **New** tag and the slow `invite` glow.
  - A one-time toast when it could first be built. One-time pointers are remembered in `settings.introsSeen`.

### The omen shelf (`components/OmenShelf.tsx`)
- In the sidebar, once the shelf is built: a jar per stored omen, the effect in one line, one **Bless a skill** button (it opens the skill picker, running skill first, marked "working on it now"), and the active blessings, each with its skill icon, a draining bar in the skill colour and the time left.

### Stores (`screens/Stores.tsx`, a jar icon)
- The inventory on its own tab, grouped by where things come from, with filter chips. There's no separate "needed now" strip, because the tracker's chips already show what the current step needs.

### The Village (`screens/Village.tsx`)
- **Contracts**, on vellum: who's asking, their line, then one row per item: a chip for what's still needed (✓ once done), "n/N delivered" and a thin bar. Then "Pays N coin · +N trust", **Deliver what I have** (gold when you hold any of it), which becomes **Deliver and finish** when it would complete, and **Turn away** (ghost). The panel header shows trust and "better work at N".
- **The shop:** repeatable provisions only (bread, tallow). Each row says what you get, what it's for and how many you hold. The button reads "Buy · N" when you can afford it, and "Need N more" when you can't.

### The Grimoire (`screens/Grimoire.tsx`)
- Insight shows as "✦ N insight" in candle gold. Hint buttons read "Name one ingredient · 6 ✦" and are disabled with the shortfall in their tooltip.
- Page layout and guidance are in [GRIMOIRE.md §9](GRIMOIRE.md).

### The Circle (`screens/Circle.tsx`, `components/KindlingPanel.tsx`)
- **The Kindling panel** is vellum and sits at the top of the Circle tab.
  - A **rosette of five petals**, one per part. A petal is dashed until its part is placed, then filled in its skill's colour, with a bloom as it lands. While the rite runs the heart lights, the ring drifts, and the current phase's petal pulses.
  - **Part rows:** placed = a tick and the one-line "placed" text; open = skill-coloured border, item chips with have/need and a **Place in the Circle** button (gold only when ready); later = the name and "Later · brings <skill>", or "Yours to choose" with **Make this next** during the stage choice.
- **Experiments** are a separate panel below, marked optional (see [GRIMOIRE.md §9](GRIMOIRE.md)).

### The rite card (the Kindling panel's **Wake it** block)
- The Ritualism level needed, then "About 3 minutes. It runs by itself, even while you're away, and never fails."
- **Offerings (optional):** the hearth candle as a checkbox (disabled with the reason when you have none), and the Hearth mark and Still Night as ✦ (met) or ◇ (not yet).
- The outcome line names the quality ("none = Sound, 1–2 = Fine, all 3 = Resplendent") and says only the lore and a keepsake differ. Then **Begin the rite**.
- While it runs: the phase and its part, its bar and the time left, the outcome, and the rite log in grandmother's voice.

### The chapter end (`components/ChapterEnd.tsx`)
- A dialog: the sanctum as a painting, the finale line, "The Kindling was <quality>", a ledger of what it brought (skill caps for Chapter II, Janko and his effect, the cellar, the embroidered cloth for Resplendent), the lore, "Chapter II · Grave comes in a later build", and **Back to the house**.

---

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

---

## Changelog

One short entry per round, oldest first. The reasons are in [CONCEPT.md's decision log](CONCEPT.md#decision-log).

- **M0 and M6:** the folk-art design system (tokens, fonts, components, icons, ornaments) and the living sanctum.
- **UI feedback round:** the chapter tracker and story cards; ink and paper with a folk colour per skill, then toned down to candlelit vellum; item chips by producing skill, with short/enough states; smooth progress bars.
- **Playtest-readiness round:** the feedback kit (floats, "New" badges, stamps, Circle glows, the discovery burst); one word per thing.
- **First patch:** the Kindling panel and rosette on the Circle tab; the tracker's Place/Go; a Next skill tile; the first talent panel (branches and keystones).
- **Second patch:** task cards instead of note modals; rows that never change height; the omen picker.
- **Third patch:** claim buttons, the skill picker, talents drawn as a tree of life, a played rite ceremony, insight shown as "✦ N"; stacked dialogs.
- **Fourth patch:** the activity feed and fewer toasts; floats that queue; rows that stay put and start on click; "Tier N · Lvl L" rows; the stage choice; the talent vine; House projects; contracts delivered in parts; the idle rite card with offerings; a Stores tab; an icon for every item; text one step larger. Tend, the tree of life, the ceremony and the shop's one-time items are gone.
- **After the fourth patch:** pointers to the omen shelf (a one-time card, a tracker block, a "New" tag and glow, a one-time toast). This doc was reorganised by topic, describing the current UI.
