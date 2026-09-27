# Design System (v0.4: "Hearth + Folk" on "Soot & Linen")

How Ritual Idle looks and behaves on screen. Follow it for every UI change. The source is the design handoff in [design_handoff/](design_handoff/README.md) (its `reference/ui_kits/ritual-idle/places.html` is the target for all tabs) and the audit behind it, [research/VISUAL_DIRECTION.md](research/VISUAL_DIRECTION.md). How the look got here is in the [Changelog](#changelog).

- **Base: "Soot & Linen".** Each colour has one job: red = act here, verdigris = selected or done, slate = info, gold = rare, skill colours = identity.
- **Look: "Hearth".** Warm grounds, small-caps headings, and the running work is the one thing that glows.
- **Flair: "Folk".** Embroidery bands, brass corner marks on cards, item tokens, a running row that fills as it works, and pressable buttons. Ornament always does a job.
- **Places:** each tab has its own colour, hero band and material, on one shared shell.

---

## 1. Hard rules

1. **No italics anywhere.** Lore uses Alegreya roman; the serif alone marks it.
2. **No dashed or dotted outlines** on items or disabled buttons. "Short" is a red-tinted chip with a red count pill. Disabled is a solid dark ground with the reason in words ("Needs 2 beeswax", "Level 6").
3. **Red fill only on the one thing to press** (Claim, Place in the Circle, Begin the rite, a card's Go). Row Start buttons are neutral until you hover them; the omen's "Bless a skill" is a ghost button with the invite outline.
4. **Gold only means rare:** rare finds (✦), Resplendent, keepsakes, step rewards, insight ✦. Never coin, level-ups, frames or headings.
5. **Skill colours** go on icons, stripes, bars and the running row only. Item chips are neutral with a coloured icon badge.
6. **Contrast:** text ≥ 4.5:1 (≥ 3:1 at ≥ 24px). Run the design audit on every tab after a UI change (see §9). It should report 0 contrast fails, 0 italics and nothing under 12px.
7. **Colour is never the only signal:** every colour has a glyph or words beside it (✓ done, ✦ rare, "need 4", a skill name next to its stripe).
8. **Reduced motion** (the OS setting, or `html[data-motion="reduced"]` from Settings) stops every loop except progress bars, which carry information.

---

## 2. Tokens: `src/ui/styles/tokens/`

Components use the semantic tokens only (`--color-text`, `--color-action`…), never raw values. The raw palette lives in `palette.css`; roles in `semantic.css`.

### Colour
| Role | Token | Value |
|---|---|---|
| Room | `--color-bg` | `#0e0c0a` |
| Band (top bar, sidebar) | `--color-band` | `#16130f` |
| Panel | `--color-surface` | `#1f1b17` |
| Raised (hover, selection, dialogs) | `--color-raised` | `#2b2621` |
| Sunken (bar tracks, disabled) | `--color-sunken` | `#0b0908` |
| Row divider / input border | `--color-border-soft` / `--color-border` | `#342e28` / `#4b433b` |
| Vellum (the tracker, Grimoire pages, the chapter end) | `--color-vellum` | `#2c251d` |
| Text 1 / 2 / 3 | `--color-text` / `-2` / `-3` | `#ede7db` / `#bfbaaf` / `#99958c` |
| Action (red fill) | `--color-action` | `#b63325`, hover `#a1271e`; the pressable button is a `#c73a2b → #a8291f` gradient on a 2px `#5c150f` base |
| Danger text, "short" | `--color-danger` | `#ef816b` |
| Selected, success, done | `--color-selected` / `--color-success` | `#5ebaaf` (verdigris) |
| Info (omens) | `--color-info` | `#92b3cb` |
| Rare | `--color-rare` | `#edb345` |
| Stitch (ornament only) / oxblood | `--color-stitch` / `--color-oxblood` | `#c93126` / `#7f2119` |
| Brass corner marks / arrows | `--color-brass` / `--color-arrow` | `#9a7a45` / `#b39463` |

**Skills** (`[data-skill]` sets `--skill`): Herbalism lichen `#94be58` · Scavenging river `#469bd1` · Chandlery beeswax `#ebd56a` · Sigilcraft poppy `#ee694f` · Scholarship lilac `#cdaef2` · Ritualism rowan `#db6ea5`. They're spread in lightness so they stay apart for colour-blind players.

**Places** (`[data-place]` sets `--place` and `--place-deep`): House ember `#e2703f` · Inventory brass `#b39463` · Grimoire lilac · Village verdigris · Circle rowan.

**Linen theme** (`[data-theme="linen"]`): a light alternative with the same roles, kept opt-in for a future setting.

The code-drawn **Sanctum** scene keeps its own art palette (`--ink-*`, `--bone-*`, `--gold-*`, `--ember-*` in `palette.css`); UI components never use those.

### Type (`type.css`)
- **Alegreya Sans** (`--font-ui`): everything interactive and every number. Tabular lining figures everywhere.
- **Alegreya SC** (`--font-display`): panel titles, tab labels, hero titles, column headers, the wordmark. Column headers and micro-labels are 12px with +0.06em tracking, the only tracked text.
- **Alegreya** (`--font-lore`), roman only: story text (journal entries, "Story" disclosures), riddles and clues, hero lore lines.
- **Scale:** 12 / 13 / 14 / 15 / 17 / 21 / 28px (`--text-2xs` … `--text-2xl`); hero titles 30px; table rows 15px; lore 17 / 1.5.
- All three are self-hosted through `@fontsource` (Latin-extended and Cyrillic).

### Space, shape, motion (`space.css`)
- **Space:** 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- **Row height** `--row-h`: 46px (roomy, the default), 36px (`data-density="comfortable"`) or 32px (`"compact"`), set from Settings → Row density.
- **Radii:** 3px buttons and chips · 4px panels · 6px dialogs · 0 for bars (woodcut, not pills).
- **Elevation is lightness.** `--shadow-2` only for dialogs and popovers.
- **Motion:** 120 / 220 / 420ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`. Fades and small rises. Only rare floats glow.

---

## 3. Components: `src/ui/styles/components.css`

- **Buttons:** `btn-primary` (the pressable red; it drops 1px when pressed), `btn-ghost` (1px border), `btn-start` (a row's Start: neutral, then the skill's tint on hover), `btn-text`, `btn-sm`, `icon-btn`. `btn-invite` adds a stitch-red outline that pulses three times, then stays. Disabled buttons say why.
- **Panels:** separated by value, not frames: a faint top-light gradient, a warm hairline and **brass corner marks**. Panel titles are small caps with a short cross-stitch underneath.
- **Vellum** only where it means a written page: the chapter tracker (the lit card, with brass corners), Grimoire pages, and the chapter-end card.
- **Progress bars:** square ends, flat fills on a sunken track. Action timers and XP take the skill colour; done is verdigris; the rite is stitch red; buff drains are the skill at 70%. Timed bars run on the compositor (`TimedBar`, keyed per repetition and speed): they read the progress once when they mount and never update per tick, so they can't drift. **One running action has exactly two moving indicators**, on the same clock: the top-bar band's bar and the running row's fill. Everywhere else shows the time left as text.
- **Item chips** (`ItemChip`): a neutral token with the item's glyph on a tinted badge in the producing skill's colour; counts are pills. Short = red tint and a red pill; clicking a short chip offers to start what makes it. `plain` is a text link for lists.
- **Tabs:** Alegreya SC 16px in text-3. The active tab gets text-1, its icon in the place colour, a soft glow in the place colour and a stitched red underline.
- **Dialogs** stack (Escape closes the top one). Task cards close only with their button or Escape. Dialogs are the raised colour; the chapter end is vellum. No dialog carries a paragraph of prose.
- **Story disclosure** (`Story`): a collapsed `details` titled "Story" (the base `details > summary` style, with its ›), opening to lines in `.lore sm`. On the task card, the discovery dialog and the chapter end. In the Grimoire journal the same component is each entry, titled with a one-line name.
- **Toasts** (bottom-left): raised, with a 3px edge (verdigris; gold for rare).
- **The skill picker:** tiles with the skill stripe; the one you're working on is outlined. A tile that can't take the choice is disabled with the reason in words (XP rewards: "At the cap").
- **Settings:** fields and a segmented control (`seg`) for choices like Row density.

---

## 4. Icons and ornament: `src/ui/art/`

- **Icons** (`icons.tsx`): 24px grid, 1.75 stroke, round joins, `currentColor`, a few solid ink fills. Skill icons take the skill colour; panel icons take brass or text-3.
- **Item icons** (`items.tsx`, `ItemIcon`): one glyph per item on the same grid, coloured by the producing skill. **Add a glyph whenever you add an item.**
- **Ornament, few places, big impact:**
  - the **embroidery band** (12px, stitch red, a CSS mask repeated with `round` so it never ends on half a diamond) under the top bar, under each hero (in the place colour) and under the skill header (in the skill colour)
  - the **cross-stitch** under panel titles and the active tab, and the tracker's stages counted as stitches
  - the papercut **rosette** in the wordmark
  - brass corner marks on panels
- **No emoji.** Unicode only as marks: `→` inputs to outputs, `·` separators, `✦` rare, `×` multipliers, `✓` done.

---

## 5. The shell (every tab)

- **Top bar** (60px, band colour): rosette and "Ritual Idle" (Alegreya SC 24px), the **now-working band**, active buff chips, the purse and the settings cog. The now-working band has the skill's colour at 14% over the band, a 3px skill edge, a ring and a glow, a 12px small-caps skill label over the recipe name (SC 17px), an 8px timer bar, the time left and Stop. Idle, it reads "Next: <task>" with Go. The rite shows its phase the same way.
- **Embroidery band** directly under the top bar.
- **Tabs** with the **activity feed** beside them: one quiet line with the latest routine event; click it for the last 30.
- **Sidebar** (320px, band colour, sticky as one column): the chapter tracker (stages as stitches, Claim buttons, the stage choice, the current step with its chips and Go, the side-project line; after the rite, **Still to find**: hidden recipes, secrets, projects, skills at the cap and better contracts, each with a count and Go), then **Omens & blessings** (stored omens and active blessings with draining bars).
- **Room light:** a radial wash in the place colour at the top of the main column.

---

## 6. Places (each tab)

Every tab adds four things and nothing more: a **place colour**, a **hero band** (big mark, the place name in SC 30px, one lore line, 2–3 key numbers, an embroidery band in the place colour; `PlaceHero`), a **material**, and **one signature glow**.

- **House** (ember): the Sanctum scene is the hero, behind a dark gradient with a slow hearth flicker; stats Skills, Working on, Away cap.
  - **Skill list:** a 3px skill stripe on each item; the selected skill gets an 11% skill tint and a skill-coloured name; the **running skill** also shows its recipe and the time left (text, no bar).
  - **Skill header:** a 12% skill tint, the name in SC 24px, XP/h now and Next level, and an embroidery band in the skill colour.
  - **Recipe table:** fixed columns `icon | recipe | Tier | Time | XP | inputs → makes | XP/h | control`, small-caps column labels, tabular numbers. The whole row starts the recipe. The **running row** fills left to right with the skill colour over one repetition (`RowFill`, the same clock as the top bar), with a 3px edge, a 1px ring and a glow; its control shows the time left and Stop. Rows never change size on hover (only their background changes). Under 820px the inputs move under the name and XP/h hides.
  - **Stock:** two lists per skill, **Inputs** (short ones first, a red pill and "need N") and **Made here**; five rows each, then "Show all N".
  - Then the talent vine: only the pairs reached plus the next one; folded to one line (the picks' names) while no choice waits. Clicking a leaf opens a confirm ("Take Quick fingers? · Fixed until level 6"); a fixed pick's other side is disabled with "Change at level N".
  - Then House projects (with the omen-shelf pointers: a New tag and the invite outline).
- **Inventory** (brass): hero with Kinds and Things; the inventory grouped by category, with icons.
- **Grimoire** (lilac): hero with Insight to spend (✦), Hidden recipes, Secrets. An **open book**: a ribbon index (the active entry marked by a lilac gradient and a 3px edge; insight in a box at the top; Hidden recipes, Discovered, Secrets, then the **Journal**) and a **vellum page** (title in SC 30px, a "Gives" line, a "Next step" callout with a lilac edge, the proofs grid Belongs / Crossed out / Still possible, hints with glowing roman numerals, your tries with lit glow dots). Journal pages are lists of collapsed entries (`.journal`), one per note, page, curio, discovery or the Kindling, divided by soft rules.
- **Village** (verdigris): hero with Trust (and its bar) and Coin. **Knocks at the door** as pinned notices: daylight paper (`#c9bda6 → #b9ab92`, text `#1a1512`), a red pin and a slight tilt; item icons on dark badges; delivered/needed per item with a bar; each notice shows who's asking and a short label in plain type (their full line is the hover title); a notice you can finish gets a verdigris ring and glow; an empty slot shows the Helped stamp and the refill time. The **shop** is a ledger with a 34px icon tile per item: "Buy · (coin) N", or "Need N more".
- **Circle** (rowan): hero with Parts placed and Ritualism. The **night stage**: the five-petal Kindling rosette as hero art (the outer ring drifts; a placed petal is filled in its skill colour and glows; the next pulses with a dashed stroke), and the parts beside it (placed: a filled disc and what was placed; open: skill tint, ring, chips, Place or "Not ready yet"; later: an outlined disc and "Later · brings X"). The rite card with offerings and its outcome sits under the parts. While the rite runs and after, a five-row **phase checklist** (✓ done, ▸ now in the skill colour, · later) replaces the parts. Below: **Experiments** (slots that glow in the place colour when filled) and "Pick from what you hold".

---

## 7. Feedback

- **Floats** (`emitFx`): rise from their anchor and queue per anchor (220ms apart). Coin and items are linen, a level uses the skill colour, good is verdigris, rare is gold with ✦ (the only one that glows).
- **The feed vs toasts:** routine events (steps, plain level-ups, omens, claims, talent picks, partial deliveries) go to the feed. Toasts are for big moments: a part placed, a project built (the omen shelf's says what's stored and what a blessing gives), a contract done, a new tier or talent, a new recipe, rare finds, curios ("+3 insight"), what a villager said ("Heard: Dream pillow"), the rite beginning. Toasts and feed lines are labels: "Contract done — +15 coin · +1 trust".
- **Small moments:** the level number pops, a skill item flashes on level-up, a new recipe row gets a "New" mark, the Helped stamp, the tracker's stitch pops, staggered Circle glows, "Closer!", the discovery bloom.

---

## 8. Layout rules

- **Nothing shifts.** Hover changes only background, border or tint; fixed columns and fixed slots keep rows and the top bar still while numbers change.
- **Click the row** to start a recipe; the Start button is there for the keyboard. Chips inside keep their own menus.
- **The screen should work in greyscale:** room < band < panel < raised in lightness.
- **Narrow screens:** under 1100px the skill list runs across the top and the sidebar narrows; under 860px everything stacks into one column.
- **Accessibility:** focus is a 2px linen outline with a 2px offset; every icon that carries meaning has a label; tabs use arrow keys; dialogs trap focus and restore it.

---

## 9. Checking a change

1. `npm run dev`, then open the game on a test origin (e.g. `http://test.localhost:5391`), never the designer's `localhost` save.
2. Check every tab at 1440px and 1000px.
3. In the console, load and run the audit on each tab:
   ```js
   eval(await (await fetch("/docs/design_handoff/reference/ui_kits/ritual-idle/audit.js")).text());
   RIAudit.run("House");
   ```
   Expect 0 contrast fails, 0 italics and nothing under 12px. Known false positives: floats caught mid-fade, and item icons on the Village notices (the audit measures them against the paper, but they sit on their own dark badge).

---

## Writing

- **Numbers and verbs first, labels over sentences.** "+10% offline speed", "Next contract in 12s", "3 min · runs offline · can't fail". Join facts with `·`; drop articles and "you".
- **One line per thing.** A second line goes in a hover title.
- **Flavour lives in names, art, hover titles and the journal.** Theme names (Kupala herb, Hearth ward, the Kindling), the sanctum, the rosette and the embroidery carry the mood. Story text (grandmother's notes, pages, curios, reveal lines, the rite's lines) lives in the Grimoire journal, collapsed, and behind "Story" disclosures; hover titles carry one line of flavour (a contract's full line, a keepsake's lore, Janko).
- **Puzzle text is gameplay.** Riddles, clues, category hints, villager asides and the item descriptions that bridge riddle words to items ("The dream-herb.") stay, however poetic.
- **No dead text.** A content field no screen shows gets deleted.

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
- **contracts**: the village's asks ("knocks at the door"), *delivered* (in parts or whole) and *finished*
- **projects**: house upgrades you *build* from items
- **bless a skill**: what you do with an omen (not "release")
- **the feed**: the one-line log of routine events; **toasts** are for big moments
- **recipe**: a craftable action
- **hidden recipe**: a Grimoire entry found by hints
- **secret**: found with no hints
- **Inventory**: the tab listing everything you hold ("the pantry" is only the Search the pantry action, and "the omen shelf" is the project)
- **Omens & blessings**: the sidebar panel with stored omens and active blessings (headed just **Blessings** before the omen shelf is built, when no omens can turn up)
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
- **Rite quality pays:** the keepsake pick on the chapter-end card (and its tracker button); the rite card says what each quality gives.
- **Design system v0.4, "Hearth + Folk":** from the design handoff. The brown-and-gold "candlelit vellum" look is replaced: Soot & Linen roles (red acts, verdigris selects, gold is rare) on warm Hearth grounds, Alegreya Sans for the UI, no italics or dashed outlines, brass corner marks, the embroidery band, a now-working band in the top bar, a real recipe table with a filling running row, per-skill stock lists, a place colour and hero band per tab (the Grimoire as a book, Village notices, the Circle at night), and a Row density setting.
- **Text trimmed to a spreadsheet style:** a writing section (flavour lives in names, art, hover titles and the journal); the Grimoire journal of collapsed entries and the `Story` disclosure; the task card's quote, the omen-shelf card and its after-build note, the rite log, the keepsakes' lore line and the chapter end's finale and lore lines are gone from view (a phase checklist, hover titles and "Story" instead); contracts show short labels.
- **Before the next playtest:** the talent vine shows only what's reached and folds while nothing waits, with a confirm and locked sides; the tracker's Still to find after the rite; disabled tiles in the skill picker.
- **Inventory:** the Stores tab is renamed Inventory (its hero and tab); the panel inside is headed "By kind".
- **One clock for the work:** two moving indicators per running action (the top-bar bar and the row fill), in sync; the skill list and the row control show the time left as text, and the row has Stop.
