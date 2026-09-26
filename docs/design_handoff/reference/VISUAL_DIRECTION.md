# Visual Direction: Colour, Type and a Denser UI (research, 2026-09-26)

> The question: the playtest screenshot (Chapter 1 · Hearth) reads as "too AI": orange, gold and brown everywhere, one big blob. How do we make it look good, with colours that work together, and put the flavour in the visuals instead of the lore? We are also moving to a denser, spreadsheet-like UI with much less prose.
> This is a research note, not a decision. It builds on [DESIGN.md](../DESIGN.md), [CONCEPT.md](../CONCEPT.md) §9 and decision log Q9 ("folk-art / woodcut… limited palette: bone, ink black, ember red, candle gold"), and the current `src/ui/styles/tokens.css` and `identity.css`.
> Every contrast number here was computed (WCAG 2 ratio and APCA Lc), and colour-blind separation was simulated (Machado 2009, full severity, distances in OKLab). Sources are at the end.

---

## 0. Summary (the one-screen answer)

- **Why it's a blob:** every neutral *and* the accent sit in one narrow warm hue band. Backgrounds, text, borders, vellum and gold are all between hue 59° and 82° in OKLCH. The layers are barely different in lightness: a panel on the room is 1.07:1. Gold does twelve different jobs, so it means nothing. Glows, gradients, double frames and small caps are on almost every surface.
- **The fix is not a new hue, it's giving each colour one job.** A near-neutral **soot** ground, **linen** text, **one red** that means "act here", **skill colours** that live only on icons, stripes and bars, and **gold kept for rare things**. Separate the layers by lightness, not by frames.
- **Recommended direction: A "Soot & Linen".** It's actually *closer* to the logged Q9 palette (bone, ink **black**, ember red, candle gold) than what we built, because the build turned "ink black" into brown and made gold the main colour. So A mostly changes *roles* and a few values, not the decision.
- **The folk flavour moves into a few strong, functional places:** a red cross-stitch band under the top bar, the active tab drawn as a stitched underline, chapter steps counted as cross-stitches, papercut rosettes only at the Circle and the chapter end, and one "vellum" use (Grimoire pages and the chapter-end card).
- **Type:** keep *Alegreya* for lore, add **Alegreya Sans** (same family, Cyrillic, tabular figures) for all UI and numbers, and keep small caps for the title and column headers only. *IM Fell English SC* has **Latin only** (no Cyrillic, no č/ž/ł), so it can't carry Slavic names.
- Two alternatives are fully specified: **B "Palekh Lacquer"** (blue-black lacquer with jewel colours) and **C "Vyshyvanka"** (a light linen theme with red and black stitching, a good future daytime mode).

---

## 1. Diagnosis: why the current look reads as a brown and gold blob

### 1.1 One hue for everything
Measured in OKLCH (lightness, chroma, hue):

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `--ink-950` | #120e0b | 16.8% 0.009 **59°** | room |
| `--ink-900` | #1c1611 | 20.6% 0.014 **62°** | surface |
| `--ink-800` | #271f18 | 24.6% 0.018 **63°** | raised |
| `--ink-600` | #4a3b2f | 36.5% 0.029 **60°** | border |
| `--bone-100` | #efe6d6 | 92.8% 0.023 **82°** | text |
| `--bone-500` | #a39580 | 67.6% 0.034 **78°** | muted text |
| `--gold-400` | #e0ad4a | 77.6% 0.129 **81°** | accent |
| vellum `#33271c`, frame `#8a6a3a` | | 28.3% / 54.6%, **64° / 76°** | cards and frames |
| `--folk-candle` | #e8b04e | 79.1% 0.131 **79°** | Chandlery **and** the vellum accent |

The ground, the text, the frames and the accent are all the same hue. Only lightness and chroma change, so the eye reads one warm field with brighter and darker patches: the "blob". Darkest Dungeon's art director names exactly this trap (the "brown and dingy eyeroll") and avoids it by giving each area a dominant hue *plus* analogous and complementary accents ([GameSpot/Yahoo](https://finance.yahoo.com/news/gothic-sensibilities-darkest-dungeon-164800337.html)).

### 1.2 No value hierarchy between layers
- `--color-surface` on `--color-bg`: **1.07:1**. `--color-raised` on surface: **1.11:1**. Vellum on the room: **1.32:1**.
- Panels are therefore told apart by **borders and frames** instead of by lightness: `.panel` border plus `--shadow-1`, `.paper` border plus the inner gold rule (`.paper::after`), `.tabs + .layout` gold top border, `.topbar` border plus shadow. That's 47 `border:` declarations across the styles.
- Refactoring UI's advice is the opposite: use fewer borders, and separate things with background value and space ([Refactoring UI notes](https://gist.github.com/selcukcihan/b9418596a98abfcd4bbc622550820cc5)).

### 1.3 Gold does twelve jobs
`--color-accent` appears 72 times, `--folk-candle` 61 times, raw gold RGBA (`232 176 78` / `224 173 74`) 23 more times. Gold currently means:
primary button · focus ring · every progress bar (`.bar-fill` default) · panel icons (`.panel-title svg`) · vellum headings · vellum frames (`#8a6a3a`) · effect lines and effect chips · coin (`.purse`, `.float.tone-coin`) · level-ups (`.float.tone-level`) · rare finds (`.float.tone-rare`) · insight (`.insight-pool`, `.buy-hint`) · keepsakes · the active tab · "New" tags · the `invite` glow · the brand title · **and** the Chandlery skill colour.

A colour that means everything carries no signal. The 60-30-10 guidance puts it plainly: the moment the accent shows up on decorative borders or headings, it stops meaning "do something here" and becomes noise ([66colorful](https://66colorful.com/blog/60-30-10-rule/), [Vision Australia](https://www.visionaustralia.org/business-consulting/digital-access/Creating-accessible-digital-colour-palettes-60-30-10-design-rule)).

### 1.4 Every surface is decorated
- `body` has a gold radial glow plus two wood-grain gradients. `.panel` has a wood gradient. `.paper` has a gold radial glow, a gradient, a border, an inner rule and a triple shadow.
- 32 `box-shadow` declarations, many of them glows: `--glow-candle` on the selected tile, the running row, a ready request card and the Kindling panel, plus `running-glow`, `invite`, `rite-ready` and `level-flash`.
- The red cross-stitch sits under **every** `.panel-title` and on top of **every** `.tab`, so it stops reading as a special ornament.

This is the "gradient-and-glow" default that makes AI output look alike: when nothing chooses, everything gets the same treatment ([SmoothUI](https://smoothui.dev/blog/ai-design-slop), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)). For fantasy games the default is the stock "carved wood, parchment and ornate gold trim" kit ([typical asset packs](https://kenney.nl/assets/fantasy-ui-borders)), which is what we have converged on.

### 1.5 Small caps everywhere
`--font-display` (Alegreya SC) is set 50 times, on buttons, chips, tabs, labels, effect lines, shop rows, part names and headings, with `letter-spacing` added 30 times. When everything is set in small caps, nothing is a heading, and dense numbers get harder to scan.

### 1.6 Skill colours: the same hue as the accent, and they collapse for colour-blind players
- `--folk-candle` (Chandlery) is nearly identical to `--gold-400` (the accent), so a Chandlery row looks like "the important thing".
- Simulated colour vision deficiency (OKLab ΔE; below about 0.05 reads as the same colour):
  - protanopia: **moss / candle 0.021**, cornflower / lilac 0.031
  - deuteranopia: **cornflower / lilac 0.013**, moss / poppy 0.049
- The skill colours are also *all* at nearly the same lightness (70–79%), so lightness can't help tell them apart.

### 1.7 Chips paint the recipe rows
Every item chip is coloured by its producing skill (`.chip.item-chip[data-skill]`), in addition to the row's own skill stripe and outline Start button. A Chandlery row can show four or five hues at once, all mid-saturated and all the same lightness. The result is busy *and* flat.

---

## 2. What the reference games actually do

**Dense idle games (the spreadsheet feel)**
- **Melvor Idle:** the chrome is a quiet dark grey; the colour comes from the pixel icons of skills and items, not from the frames. The sidebar is a list: icon, name, level right-aligned. Its big UI update added colour coding per expansion and upgrade icons in the bank, so colour marks *categories*, not decoration. Players still complain about clutter and about spacing in some skills ([Melvor wiki changelog](https://wiki.melvoridle.com/w/Full_Changelog), [Steam: "Overwhelming cluttering interface"](https://steamcommunity.com/app/1267910/discussions/0/3829792817308141704/), [Steam: "Why is the UI so boring?"](https://steamcommunity.com/app/1267910/discussions/0/3944650879129936794/)). The lesson: neutral chrome plus coloured icons works; don't let density turn into clutter.
- **Antimatter Dimensions / Kittens Game:** rows of identical controls in a table, with numbers in fixed columns (amount, rate, cost). Colour is used per prestige layer or per resource state, and almost nowhere else ([AD](https://ivark.github.io/AntimatterDimensions/), [overview](https://www.itechguides.com/20-best-browser-idle-games-in-2026-from-cookie-clickers-to-deep-incrementals/)).
- **NGU Idle:** deliberately ugly as a joke ([Dinogame](https://dinogame.gg/blog/best-idle-games-2026/)). A cautionary tale: "spreadsheet" has to mean *aligned*, not *raw*.

**Occult and card tables**
- **Cultist Simulator:** a plain dark table with bright, iconic cards and one or two words under each. A colour code runs through the game (Health cards glow red, Reason cards cool blue), but it's kept loose on purpose. Alexis Kennedy aimed for about a quarter of the on-screen text of Sunless Sea ([Thumbsticks](https://www.thumbsticks.com/interview-unseen-arts-behind-cultist-simulator/), [Game Developer](https://www.gamedeveloper.com/design/why-the-i-cultist-simulator-i-devs-built-their-lovecraftian-game-on-a-house-of-cards)). *Technique:* a quiet ground, and colour belongs to the **things** (cards and aspects), not the frames. That fits our "less prose" goal directly.
- **Book of Hours:** thirteen aspects, each with its own colour (Grail red, Heart pink, Forge orange, Edge pea green, Nectar emerald, Moth cream, Moon silver-grey, Knock purple, Lantern yellow, Winter pale blue, Sky dark blue, Scale brown, Rose magenta), always shown with a symbol too ([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/BookOfHours)). Weather Factory tried dark UI strips and moved to paper tones, because black strips clashed with bright scenes ([Weather Factory: Light and Shade](https://weatherfactory.biz/light-and-shade/)). *Technique:* hue plus glyph for every category, and the UI material chosen to sit with the scene.
- **Inscryption:** a shader snapped dark colours to a fixed palette and left bright colours alone, so the shadows merge while the lit cards stay readable. The palette itself came from one artist and was kept to the end ([Daniel Mullins](https://x.com/DMullinsGames/status/1451601471003234314)). *Technique:* keep the darks restricted and neutral, and let lightness carry the colour.
- **Slay the Spire:** each character owns a hue on the card frame (Ironclad red, Silent green, Defect blue, Watcher purple), and the card *type* is carried by the frame's shape. The UI adds small motion cues for draw and discard ([Cloudfall Studios](https://www.cloudfallstudios.com/blog/2018/2/20/flash-thoughts-slay-the-spires-ui)). *Technique:* identity by hue, category by shape.
- **Balatro:** a small, strict palette used boldly, under rules for palette, resolution and UI standardisation. The two core numbers always keep their colours: chips blue, mult red. Colour is an information system ([DayOne interview](https://playday.one/2024/03/09/there-is-a-lot-more-design-to-explore-within-balatro/), [Blake Crosley](https://blakecrosley.com/guides/design/balatro)). *Technique:* one colour per kind of number, everywhere.

**Ink, print and manuscript**
- **Darkest Dungeon:** black appears only in the ink lines, never as dead grey fill. The overall tone is warm (even the cool colours are slightly yellowed), and strong linework lets Bourassa splash unexpected colour without losing readability. Influences: Dürer woodcuts, illuminated manuscripts, Mignola ([GameSpot/Yahoo](https://finance.yahoo.com/news/gothic-sensibilities-darkest-dungeon-164800337.html)). *Technique:* a hard value structure (ink and paper) first, then small hits of saturated colour.
- **Pentiment:** two material registers, the hand-painted manuscript and the woodcut print, used to mean something (the shift from one period to the next), and typefaces as characters' voices ([Game Developer](https://www.gamedeveloper.com/art/deep-dive-the-art-of-pentiment), [PCGamesN](https://www.pcgamesn.com/pentiment/art-fonts-story), [Lettermatic](https://lettermatic.com/custom/pentiment)). *Technique:* a material is a signal. Use vellum *only* where it means "a written page".
- **Black Book** (Morteshka, Slavic and Komi folklore): illustrated cards and pages on a dark ground, with folk music and consulted folklorists ([Morteshka](https://www.morteshka.com/black-book), [Wikipedia](https://en.wikipedia.org/wiki/Black_Book_(video_game))). There's no published art-direction breakdown; from screenshots, the flavour sits in the illustrations and card art while the UI stays quiet. The closest cousin to us in theme; the lesson is to keep the chrome restrained and let the art carry the folklore. (Its visual ancestor, the *lubok* print, mixes icon painting with Western woodcut: [Wikipedia](https://en.wikipedia.org/wiki/Lubok).)

**Palette as mood**
- **Frostpunk:** royal and steel blues, cold and bleached, dominate, and dark "coal" UI panels echo the main resource ([Xbox Wire](https://news.xbox.com/en-us/2021/07/21/how-the-visual-identity-of-frostpunk-changed/)). Warmth is scarce, so warmth means heat and hope. *Technique:* the inverse of our problem. On a cool or neutral ground, a warm colour becomes precious.
- **Sunless Sea / Skies:** Sea began as "dark and vaguely teal"; Skies gave each region its own palette ([Failbetter](https://www.failbettergames.com/news/sunless-skies-pre-production-looking-to-the-skies)). *Technique:* one dominant ground hue per place, which maps onto per-tab accents if we ever want them.
- **Hades:** a limited palette with high-contrast sets, from cold greys to acid greens, under saturated red light ([Point'n Think](https://www.pointnthink.fr/en/the-art-of-hades-en/), [MCV](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/)). Each god's boons carry that god's colour on the icon and frame, while the rest of the chrome stays dark. *Technique:* the *source* owns the hue, like our skills.
- **Blasphemous:** Andalusian Holy Week art (Ribera, Zurbarán, Goya): deep blacks, blood reds, gold on relics ([Siliconera](https://www.siliconera.com/blasphemous-developers-talk-sources-horrifying-religious-imagery/), [frieze](https://www.frieze.com/article/how-video-game-blasphemous-embraces-catholic-gothic-tradition)). *Technique:* gold as a *sacred/rare* signal, not a UI colour.
- **Rain World:** every room is drawn from a swappable palette image, with lit, neutral and shaded rows for each depth layer ([Rain World modding wiki](https://rainworldmodding.miraheze.org/wiki/Palettes)). *Technique:* the palette is data, separate from the drawing. That's our token system, and it's how `[data-skill]` already re-maps `--skill`.
- **Townscaper:** the whole colour UI is a strip of 15 swatches, stored as a 1×16-pixel image; the swatches are matched in value, so any mix looks good ([Steam discussion](https://steamcommunity.com/app/1291340/discussions/0/3039354735027472105/), [Medium](https://chrisluv.medium.com/getting-hacky-with-townscaper-5a31cf7f4c6a)). *Technique:* a curated, finite palette with matched lightness.
- **The Witcher 3:** the 1.20 patch reworked the UI with lead UI designer Dan Voinescu, after the interface had gone through five or more art passes ([Voinescu](https://www.artstation.com/artwork/2AYqe), [Fernando Forero](https://fernandoforeroart.com/the-witcher-3-the-ui-visual-art)). The chrome is dark translucent grey with thin steel-coloured lines; colour is kept for item quality and a few status cues. *Technique:* rarity is the one place a "precious" colour appears.
- **Loop Hero:** a tiny pixel palette on a black ground; the colour lives in the tiles you place, and the UI frames are thin and grey ([Lospec palette](https://lospec.com/palette-list/loop-hero), [PC Gamer](https://www.pcgamer.com/best-design-2021-loop-hero/)).

**What they share:** a quiet ground (neutral, cool, or plain black), strong value steps, colour owned by *things* (cards, gods, aspects, skills, rarity), a glyph or shape next to every colour code, and ornament concentrated in a few places.

---

## 3. Slavic folk colour as a palette source

These hex values are **representative approximations** of the pigments and typical museum photos. They were not sampled from a specific image, so treat them as starting points.

| Tradition | What it is | Characteristic colours (approx.) | Works on a dark UI? |
|---|---|---|---|
| **Vyshyvanka** (Ukrainian embroidery) | Red and black cross-stitch on white linen. Kyiv region: white, coral red, black. Poltava: grey and red with black outlines. The west: ten or more colours ([Kyiv Independent](https://kyivindependent.com/vyshyvanka-traditional-ukrainian-embroidered-shirt/), [Ukrainian Lessons](https://www.ukrainianlessons.com/ukrainian-vyshyvanka/)) | linen #ede7db, red #b3241f / coral #d9503f, black #1f1915, grey #8f8a80 | Yes, inverted: linen text and red stitch on soot. The core of A and C |
| **Wycinanki** (Polish papercut) | Kurpie: single-colour, often black or red, symmetrical. Łowicz: layered, multicoloured ([Wikipedia](https://en.wikipedia.org/wiki/Vytynanky_(Wycinanki)), [Mass Folk Arts](https://blog.massfolkarts.org/index.php/2014/07/the-art-of-polish-paper-cut-design/)) | red #c8102e, green #00843d, yellow #f2c230, magenta #c2185b, blue #1f4ea3 | Kurpie (one colour, solid) is perfect for ornaments; Łowicz for rare celebratory moments |
| **Khokhloma** | Cinnabar red and soot black over a gold effect, which is really tin or silver under a baked varnish ([Wikipedia](https://en.wikipedia.org/wiki/Khokhloma), [RBTH/gw2ru](https://www.gw2ru.com/arts/3174-khokhloma-russian-handicraft)) | cinnabar #c1272d, soot #111, "gold" #d4a02a | This is the brown-and-gold trap if used as a ground. Use as an *event* palette (the rite) |
| **Gzhel** | Cobalt on white porcelain, a limited palette born from firing limits and post-war shortage ([Wikipedia](https://en.wikipedia.org/wiki/Gzhel), [RBTH/gw2ru](https://www.gw2ru.com/arts/2489-gzhel-russian-craft-tableware)) | cobalt #1f4fa8, pale cobalt #7fa6e0, white #f4f6f8 | Cobalt is too dark for text on dark; its light tints work as an info or skill hue. Best in a light theme |
| **Palekh** | Egg tempera on three coats of black lacquer, with gold hatching; red, green and gold on black ([RBTH/gw2ru](https://www.gw2ru.com/arts/1656-palekh-russia-lacquer-miniature), [KÜRE](https://kureansiklopedi.com/en/detay/palekh-miniature)) | lacquer #060912, cinnabar #e8542f, malachite #2f9e76, lapis #3d5fb8, gold #e3b54f | Yes. It's *made* for a black ground. Basis of B |
| **Mezen** | Soot black and red ochre drawn straight on bare wood ([Wikipedia](https://en.wikipedia.org/wiki/Mezen_wood_painting)) | ochre red #9b3b22, soot #1a1714, raw wood #d8b98a | A two-colour discipline; good for icons and ornaments on a light theme |
| **Pysanky** (Hutsul) | Wax-resist eggs dyed yellow → orange → red → black; Hutsul adds green; older blacks were deep brown and older reds darker ([pysanky.info](https://www.pysanky.info/Ukrainian_Pysanky/Traditional/Pages/Hutsul.html), [dye sequences](https://www.pysanky.info/Dyeing/Dye_Sequences.html)) | yellow #e8b923, orange #d9661f, red #b52a1c, green #3f7d3a, black #16120f | The dye *sequence* is a ready-made progression ramp (yellow → red → black) |
| **Hutsul kilims** | Wool, natural dyes; red, black, ochre, green in dense geometry | madder #9e2b25, walnut #3a2a1e, weld yellow #c9a227, green #4a6b3a | Mostly useful for ornament patterns (diamonds, zigzags) |
| **Kurpie** textiles and papercuts | Single-colour papercut stars (*gwiazda*) with 8 to 64 repeats ([sheldonbrown.com](https://www.sheldonbrown.com/org/joyce/wyc-kurpie.html)) | single red or black | The eight-petal rosette we already draw (`ornaments.tsx`) |
| **Romanian *ie*, Bulgarian textiles** | Madder and cochineal reds, indigo blues, weld yellows; red and black dominate ([MDPI Heritage](https://www.mdpi.com/2571-9408/6/1/27), [Great Blouses](https://greatblouses.com/en/content/21-natural-colors-in-romanian-folk-costume-dyeing-threads-with-traditional-plants)) | madder #a3312a, indigo #26386b, weld #d9b84a, black #1b1b1b | Indigo is a good "cool dark" for bands and info on light |

**Folk-horror materials** (the mood words for our tokens): **bone/linen** #ede7db, **soot** #090b0e, **oxblood** #7f2119, **cinnabar** #b63325, **verdigris** #5ebaaf (deep #1a625a), **indigo** #324a83, **lichen** #94be58, **tallow/beeswax** #ebd56a.

**What pairs well on a dark UI:** linen + red (vyshyvanka, the strongest and most recognisable pairing), red + verdigris (near-complementary, so they don't compete), and cinnabar + malachite + gold on lacquer (Palekh). **What to avoid:** gold on brown (Khokhloma as a ground) and cobalt as text on dark.

A useful piece of flavour: in Russian and older Slavic usage, *krasnyi* ("red") shares its root with "beautiful" (Krasnaya Ploshchad', the "beautiful square"). Red *is* the folk colour, which is a good reason to make it the one colour that means "act here".

---

## 4. Colour principles for dark game UIs

1. **60-30-10.** About 60% ground (soot), 30% text and surfaces (linen and neutral steps), 10% colour. Inside the 10%, the action colour is scarce ([66colorful](https://66colorful.com/blog/60-30-10-rule/)).
2. **One action colour, reserved.** It appears only on things you can press: the primary button, the running row's Stop, and focus if we choose. Never on headings, borders or decoration ([Vision Australia](https://www.visionaustralia.org/business-consulting/digital-access/Creating-accessible-digital-colour-palettes-60-30-10-design-rule)).
3. **Separate hue roles.** Action (red), selection (value plus a neutral marker), status (success, warning), skill identity (six hues, icons and bars only), rarity (gold), info (a quiet blue-grey). Each hue has one job. When two roles have to share a hue, give them a different *form* (a fill versus text, a solid versus a dashed border).
4. **Value before hue.** Build the hierarchy in greyscale first: room < band < panel < raised < border < text 3 < text 2 < text 1. If the screenshot works in greyscale, colour becomes a bonus, not a crutch ([Refactoring UI](https://gist.github.com/selcukcihan/b9418596a98abfcd4bbc622550820cc5)).
5. **Neutral or slightly cool ground, warm text and accents.** A warm ground under warm accents gives the blob; a neutral or cool ground makes them pop (Frostpunk's scarce warmth; Bourassa's warm-yellowed cools). We keep **linen text slightly warm (hue 85°)** so it still feels like cloth and bone, not like a screen.
6. **Saturation discipline.** Keep the grounds at chroma ≤ 0.01 (A) or ≤ 0.025 (B). Skill hues sit at 0.10–0.17, and nothing large is saturated. Material's dark theme also desaturates colours on dark: saturated colour "vibrates" and tires the eye ([Material Design](https://m2.material.io/design/color/dark-theme.html)).
7. **Elevation by lighter surfaces, not shadows.** On dark grounds, shadows barely show; lighten the surface instead. Material uses a white overlay from 0% up to 16% ([Material Design](https://m2.material.io/design/color/dark-theme.html)).
8. **Build scales in OKLCH.** Its lightness is perceptual, so a lightness step looks the same across hues, and changing the hue doesn't secretly change the contrast (which HSL does) ([Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl), [Harmonizer and tools](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools)). CSS supports `oklch()` natively, so the tokens can be written that way.
9. **Contrast, two ways.** WCAG 2: ≥ 4.5:1 for text, ≥ 3:1 for large text and UI parts. APCA (better for dark mode): Lc 90 is preferred for body text, Lc 75 is the minimum for body, Lc 60 for other readable text, Lc 45 for large or bold labels; and avoid going past about Lc 90 on dark, which glares ([APCA intro](https://git.apcacontrast.com/documentation/APCAeasyIntro.html), [APCA in a nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)).
10. **Colour-blind safety.** Spread the skill hues in **lightness** as well as hue (the Okabe-Ito palette does exactly this: its colours span dark to light so they still separate when hues merge) ([Okabe-Ito reference](https://easystats.github.io/see/reference/scale_color_okabeito.html)). And always pair colour with a glyph (every skill already has an icon, and every item has its glyph).

---

## 5. Three palette directions

Contrast is shown as **WCAG ratio / APCA Lc** (negative Lc = light text on dark). "surface" is the panel colour, the most common place for text. Colour-blind separation is the *smallest* OKLab distance between any two skill colours after simulation; for comparison, **the current set scores 0.013 (deuteranopia) and 0.021 (protanopia)**.

### A. "Soot & Linen" (recommended)
**Mood:** a linen shirt by a cold stove. Matte, ashen, quiet, then one red thread. Near-neutral charcoal with a hint of cool, warm linen text, cinnabar red for action, verdigris for selection and success, and gold only when something rare happens.

| Token | Hex | OKLCH |
|---|---|---|
| bg-0 (room, sunken, bar tracks) | `#090b0e` | 14.9% 0.007 258 |
| bg-1 (band: top bar, sidebar) | `#111417` | 18.9% 0.008 248 |
| surface (panels) | `#1b1e22` | 23.4% 0.009 256 |
| raised (hover, selected row, inputs) | `#272a2e` | 28.4% 0.009 256 |
| border-soft (row dividers) | `#2d3134` | 31.0% 0.008 240 |
| border (inputs, ghost buttons) | `#3f4347` | 38.1% 0.009 248 |
| text-1 (linen) | `#ede7db` | 92.9% 0.017 85 |
| text-2 | `#bfbaaf` | 79.0% 0.016 86 |
| text-3 (meta, column headers) | `#99958c` | 67.1% 0.014 87 |
| **action** (primary fill, cinnabar) | `#b63325` | 51.9% 0.170 30 |
| action-hover (goes *darker*, keeps text contrast) | `#a1271e` | 46.9% 0.160 29 |
| on-action | `#ede7db` | linen |
| action-text (red as text: warnings, "short") | `#ef816b` | 72.1% 0.140 32 |
| **secondary** (verdigris: selection, links, success ticks) | `#5ebaaf` | 72.9% 0.090 185 |
| danger (text or outline only) | `#ef816b` | same as action-text |
| success / done | `#5ebaaf` | same as secondary |
| info (quiet notes) | `#92b3cb` | 75.0% 0.050 240 |
| **rare** (gold) | `#edb345` | 80.1% 0.140 80 |
| ornament stitch red | `#c93126` | 55.1% 0.190 29 |
| oxblood (deep ornament fill) | `#7f2119` | 39.9% 0.130 29 |

| Skill | Colour name | Hex | OKLCH | on surface |
|---|---|---|---|---|
| Herbalism | lichen | `#94be58` | 74.9% 0.139 128 | 7.78 / −58 |
| Scavenging | river blue | `#469bd1` | 66.0% 0.115 240 | 5.47 / −43 |
| Chandlery | beeswax | `#ebd56a` | 87.0% 0.130 98 | 11.36 / −79 |
| Sigilcraft | poppy | `#ee694f` | 68.0% 0.170 33 | 5.39 / −43 |
| Scholarship | lilac | `#cdaef2` | 80.1% 0.100 305 | 8.71 / −64 |
| Ritualism | rowan-plum | `#db6ea5` | 68.1% 0.149 350 | 5.41 / −43 |

**Key contrasts:** text-1 on bg-0 16.0 / −92 · text-1 on surface 13.6 / −91 · text-1 on raised 11.7 / −89 · text-2 on surface 8.65 / −64 · text-3 on surface 5.60 / −44 (meta only, ≥ 14px) · text-3 on raised 4.83 / −42 · linen on action 4.89 / −69 · linen on action-hover 6.04 / −74 · action-text on surface 6.39 / −50 · verdigris 7.26 / −55 · gold 8.87 / −65 · info 7.59 / −57. Skill colours on raised (hover): all ≥ 4.65:1.
*Note:* the red fill is only 2.78:1 against the panel. That's fine for a button with a text label (the label identifies it), but don't use a red fill *without* text (a bare dot, for example) to carry meaning.

**Colour-blind separation (worst pair):** normal 0.117 (poppy / plum) · protanopia **0.078** (river / plum) · deuteranopia **0.060** (lichen / poppy) · tritanopia **0.066** (poppy / plum). That's three to five times better than now. Lightness does the work: beeswax is lightest (87%), lilac and lichen are next (80% and 75%), and river, poppy and plum sit darker (66–68%). The weakest pair, lichen and poppy for deuteranopes, is still told apart by lightness (75% vs 68%) and always by the icon.

**Where the folk flavour shows:**
- A **cross-stitch band** (stitch red on soot, 6px) along the bottom of the top bar, once per screen.
- The **active tab** is a stitched red underline (reusing the existing stitch gradient), and inactive tabs are plain text. The stitch *is* the selection indicator.
- **Chapter steps as cross-stitches:** the tracker's step row is a line of little ✕ stitches (done = stitch red, current = linen outline, ahead = border-soft). Rite quality pips become stitches too.
- **Kurpie papercut rosette** in one colour (oxblood or linen) only at the Kindling rosette, the chapter end and an empty state.
- Item glyphs stay woodcut; skill icons stay in the skill colour.

**Gold is reserved for:** rare finds (`tone-rare` floats with ✦), a Resplendent rite, chosen keepsakes, and the chapter-end moment. *Not* for coin, level-ups, insight, headings, frames or progress. Coin becomes linen with a coin glyph; insight becomes lilac (Scholarship's colour, since insight comes from reading) or plain linen with ✦; level-ups take the skill colour.

**Beeswax vs gold:** they are 0.08 apart in OKLab (beeswax is lighter and greener; gold is deeper and oranger), and gold always comes with ✦. If playtests confuse them, move Chandlery to "tallow cream" `oklch(88% 0.07 95)`.

### B. "Palekh Lacquer"
**Mood:** a lacquered box opened by candlelight. Deep blue-black, glossy, jewel colours, gilt hairlines. Richer and more "magical" than A, less austere.

| Token | Hex | OKLCH |
|---|---|---|
| bg-0 (lacquer) | `#060912` | 14.1% 0.021 267 |
| bg-1 | `#0d111b` | 17.9% 0.022 267 |
| surface | `#171b26` | 22.3% 0.022 269 |
| raised | `#222734` | 27.4% 0.025 268 |
| border-soft | `#292e3a` | 30.2% 0.023 267 |
| border | `#3c4251` | 38.0% 0.027 268 |
| text-1 (ivory) | `#f0e9d9` | 93.5% 0.023 87 |
| text-2 | `#c3bdb0` | 80.0% 0.019 86 |
| text-3 | `#9d988b` | 68.0% 0.020 89 |
| **action** (vermilion fill) | `#f86e42` | 69.9% 0.180 38 |
| on-action (dark lacquer text) | `#0a0d16` | 16.1% 0.020 270 |
| action-text / danger | `#fa8565` | 74.0% 0.150 36 |
| **secondary** (malachite) / success | `#44be8d` | 72.1% 0.131 163 |
| info (lapis) | `#83adea` | 74.1% 0.100 258 |
| **rare / gilt** | `#edc15a` | 83.0% 0.130 86 |

| Skill | Hex | OKLCH | on surface |
|---|---|---|---|
| Herbalism (leaf) | `#8ccc66` | 77.9% 0.150 135 | 8.96 / −64 |
| Scavenging (lapis light) | `#339fdb` | 66.9% 0.130 238 | 5.83 / −45 |
| Chandlery (wax) | `#ebd96e` | 87.9% 0.129 100 | 12.02 / −81 |
| Sigilcraft (cinnabar) | `#f6684c` | 69.0% 0.180 33 | 5.73 / −44 |
| Scholarship (amethyst) | `#d7adf6` | 81.0% 0.110 310 | 9.17 / −66 |
| Ritualism (garnet rose) | `#e56ca0` | 69.0% 0.160 355 | 5.72 / −44 |

**Key contrasts:** text-1 on surface 14.2 / −92 · text-2 9.19 / −66 · text-3 5.98 / −45 · dark text on vermilion 6.75 / +49 (fine for 15px semibold labels; APCA is weakest on mid-tone fills) · gilt 10.1 / −71.
**Colour-blind separation:** protanopia **0.067** (leaf / wax) · deuteranopia **0.079** (leaf / cinnabar) · tritanopia **0.059** (cinnabar / garnet).
**Folk flavour:** gilt **hairline** ornaments (1px gold linework in the Palekh manner) on the top bar edge and around the Kindling only; jewel-coloured skill icons; the ornament stitch in vermilion.
**Gold is reserved for:** rare items, plus hairline ornament linework (never fills, never text other than rare). That's more gold than A, which is the risk: it slides back toward the old look if it isn't policed.
**Why not the pick:** the blue-black ground fights our blue and violet skills (Scavenging and Scholarship have less room), and "jewels on black lacquer" is a common premium-fantasy look. It's a strong alternative if A feels too austere.

### C. "Vyshyvanka" (light linen)
**Mood:** a white embroidered shirt in daylight. Red and black stitching on linen; papery and bright, like Book of Hours' paper UI. A daytime or accessibility theme, not the main one: folk horror wants the dark.

| Token | Hex | OKLCH |
|---|---|---|
| bg-0 (linen room) | `#ebe6db` | 92.6% 0.016 86 |
| bg-1 (band) | `#f4f0e7` | 95.6% 0.013 87 |
| surface (panels, lightest) | `#fcfaf5` | 98.5% 0.007 89 |
| raised (hover, selected: darker in light mode) | `#e3ddd1` | 89.9% 0.017 85 |
| border-soft | `#d7d0c4` | 86.0% 0.018 81 |
| border | `#b2a99d` | 73.9% 0.020 75 |
| text-1 (soot) | `#1f1915` | 21.9% 0.012 56 |
| text-2 | `#4e4640` | 40.0% 0.015 59 |
| text-3 | `#69625b` | 50.0% 0.014 67 |
| **action** (embroidery red fill) | `#b3241f` | 50.0% 0.180 28 |
| on-action | `#fcfaf5` | |
| action-text / danger | `#a9231e` | 48.0% 0.171 28 |
| **secondary** (indigo) / info | `#254582` / `#2e4b83` | 40% 0.109 262 |
| success | `#246e3a` | 47.9% 0.110 150 |
| **rare** (old gold, as text) | `#94680f` | 54.9% 0.110 78 |

| Skill | Hex | OKLCH | on surface |
|---|---|---|---|
| Herbalism (forest) | `#1d6835` | 45.9% 0.109 150 | 6.53 / +80 |
| Scavenging (cobalt) | `#0a71b1` | 53.0% 0.130 245 | 5.02 / +73 |
| Chandlery (ochre) | `#a06616` | 56.1% 0.115 68 | 4.57 / +70 |
| Sigilcraft (madder) | `#a52014` | 47.0% 0.170 30 | 7.15 / +81 |
| Scholarship (violet) | `#5b2987` | 40.0% 0.151 305 | 9.53 / +90 |
| Ritualism (cochineal) | `#a72a68` | 50.0% 0.170 355 | 6.34 / +79 |

**Key contrasts:** text-1 on surface 16.7 / +101 · text-1 on bg-0 14.0 / +90 · text-2 8.85 / +88 · text-3 5.75 / +77 · linen on red 6.31 / −83 · rare 4.74 / +71.
**Colour-blind separation:** protanopia **0.059** (forest / ochre) · deuteranopia **0.055** (forest / madder) · tritanopia **0.049** (madder / cochineal: borderline, so the icon has to carry it).
**Folk flavour:** literal red and black cross-stitch borders on the top bar and the active tab, Mezen-style two-colour (soot and ochre red) ornaments, and Gzhel cobalt for info.
**Gold is reserved for:** rare only. On light grounds gold is weak (4.7:1 as text), so rare also gets ✦ and a filled badge.
**Cost:** a second theme doubles visual QA (the sanctum SVG, glyph colours, ornament colours). Worth it later, not now. The token structure in §8 makes it a drop-in `:root[data-theme="linen"]` block.

---

## 6. Typography for a dense, data-heavy UI

**Principles**
- A decorative display face belongs **only** where there's one line and time to look: the brand, the chapter title, the chapter-end card, a Grimoire page title. Never on buttons, chips, table cells or numbers ([Pentiment](https://www.pcgamesn.com/pentiment/art-fonts-story) uses type as a *voice*, sparingly).
- Dense UI text wants a **humanist sans** with open shapes, a clear 1/l/I and 0/O, and **tabular lining figures** so columns line up ([FontAlternatives: dense dashboards](https://fontalternatives.com/blog/best-fonts-dense-dashboards/), [Nightingale](https://nightingaledvs.com/choosing-fonts-for-your-data-visualization/)).
- Small caps and letter-spacing mark **one** role: column headers and tiny section labels. Everything else is sentence case.

**Checked candidates** (the Fontsource API for scripts; the font files for OpenType features):

| Font | Scripts | Tabular figures | Verdict |
|---|---|---|---|
| **Alegreya Sans** | Latin, Latin-ext, Cyrillic(+ext) | `tnum`, `lnum` ✓ | **Recommended UI face.** Same designers as Alegreya (Huerta Tipográfica), with calligraphic roots, so it keeps the "old book" feel while being a clean sans |
| Fira Sans | Latin-ext, Cyrillic(+ext) | `tnum` ✓ | Excellent fallback: built for small screens, very legible, but more "tech" |
| IBM Plex Sans | Latin-ext, Cyrillic(+ext) | no `tnum` feature in the build we checked | Very clear, but cold and corporate for folk horror |
| PT Sans | Latin-ext, Cyrillic(+ext) | not checked | Designed Cyrillic-first by ParaType; a good neutral choice, only two weights |
| **Alegreya** (keep) | Latin-ext, Cyrillic | ✓ | Lore, grandmother's notes, Grimoire text, in italics |
| **Alegreya SC** (keep, demoted) | Latin-ext, Cyrillic | ✓ | Column headers, the chapter title, tab labels at most |
| IM Fell English SC (current title) | **Latin only** | none | Can't render č, ž, ł, ę or Cyrillic. Keep only as an SVG wordmark for "Ritual Idle", or replace |
| Ruslan Display | Latin-ext, Cyrillic | none | Based on 1970s semi-*ustav* lettering: very Slavic. Metrics and spacing are flawed ([type.today](https://type.today/en/journal/display2)). OK at 28px+ for one-line titles, with manual letter-spacing |
| Kurale | Latin-ext, Cyrillic(+ext) | none | A soft serif with a hand-drawn feel; a possible chapter-title face; test it first |

**Recommendation:** `--font-ui: "Alegreya Sans"` for everything interactive and numeric (400 / 500 / 700); `--font-lore: "Alegreya"` for prose; `--font-display: "Alegreya SC"` for column headers and chapter titles; the title wordmark as an SVG (or Ruslan Display if we want an unmistakably Slavic mark). All are available on `@fontsource`, so they still work offline and in Electron.

**Size scale for a dense UI** (Alegreya Sans has a modest x-height, so the floor stays at 13px and only for uppercase labels; the playtest asked for larger text, so rows stay at 15px):

| Token | px / line-height | Use |
|---|---|---|
| `--text-2xs` | 12 / 1.2, caps, +0.06em | column headers, micro-labels (the *only* tracked text) |
| `--text-xs` | 13 / 1.3 | meta under a row, units |
| `--text-sm` | 14 / 1.35 | chips, secondary cells, buttons |
| `--text-md` | 15 / 1.35 | **table rows, body UI** |
| `--text-lg` | 17 / 1.3 | panel titles, the skill header |
| `--text-xl` | 21 / 1.25 | screen titles |
| `--text-2xl` | 28 / 1.15 | chapter title, brand |
| lore | 17 / 1.5, Alegreya italic | notes and Grimoire pages |

Row height: 32px compact, 36px comfortable (a setting). Numbers: `font-variant-numeric: lining-nums tabular-nums` on every cell (the existing `.num` class), right-aligned.

---

## 7. Components and UX for a spreadsheet-leaning idle game

### 7.1 Recipe rows as a real table
- A CSS grid with fixed columns shared by every row in a skill: **[icon] Name · Lvl · Time · XP · Inputs → Outputs · XP/h · [Start/bar]**. Column headers in `--text-2xs` caps, `--color-text-3`, sticky at the top of the list.
- Numbers right-aligned and tabular; units in text-3 (`12.0` **s**). The row's *name* is the only text-1 element; everything else is text-2 or text-3.
- Rows are separated by a 1px `--color-border-soft` line, **no box, no border-radius**. Hover = `--color-raised` background. The running row = raised background, a 3px skill-coloured left edge and the skill-coloured timer bar filling the Start cell. No glow, no pulse (the moving bar is motion enough).
- Locked rows at 50% opacity with "Lvl 12" in the level column; unknown recipes as a single muted line.
- Show rates (XP/h, items/h) as a column instead of the hover-only rates line. A spreadsheet shows its numbers.

### 7.2 Fewer borders and frames
- Panels: `--color-surface` on the `--color-bg` room, **no border, no shadow, no gradient**, radius 4px. The lightness step (23% vs 15% in OKLCH) is the separation.
- Sections inside a panel: a text-3 caps label plus space, not a rule or a stitch.
- Borders survive only on inputs, ghost buttons, chips that are *interactive*, and the dashed "short" state.
- Remove the body's radial glow and wood grain, `.panel`'s wood gradient, `.topbar`'s shadow, and `--glow-candle` everywhere.

### 7.3 Panel hierarchy (three levels, by value)
1. **Room** `--color-bg` (bg-0): the page.
2. **Band** `--color-band` (bg-1): the top bar and the sidebar column, full-bleed, so the frame of the app is one calm dark L-shape.
3. **Panel** `--color-surface`: content. **Raised** `--color-raised` is only for hover, selection and inputs.
Dialogs = raised surface + scrim; no frame.

### 7.4 Where the ornament goes (few places, big impact)
- **Top bar:** one cross-stitch band along its bottom edge (the only permanent ornament).
- **Tabs:** the active tab's stitched red underline (flavour that *is* function). Remove the stitch from every `.tab::before` and every `.panel-title::after`.
- **Chapter tracker:** steps counted as stitches.
- **The Circle:** the papercut rosette (already the Kindling rosette), in linen and oxblood, with petals in skill colours.
- **Chapter end:** the one place where Łowicz-style multicolour and gold are allowed: the celebration.
- **Sanctum:** keeps its woodcut look; that's *art*, and art is where the flavour belongs.

### 7.5 Progress bar colours
| Bar | Colour | Why |
|---|---|---|
| Action timer (running row, top bar) | the skill colour | it's that skill working |
| Skill XP (tiles, header) | the skill colour at full; track bg-0 | identity |
| Chapter / step progress | linen (text-2) fill; done steps verdigris | neutral progress, and red stays for actions |
| Contract delivery | text-2; complete = verdigris | status |
| Blessing drain | the skill colour at 70% | a buff on that skill |
| Rite phases | stitch red | the one ceremony |
| Rite quality pips | stitches; Resplendent = gold | rare |
Tracks: `--color-bg` with **no border**, 4–6px, square ends (woodcut, not pills). No gradients on fills: a flat fill is crisper and cheaper.

### 7.6 Skill identity without painting everything
- The skill colour appears on: the **icon**, a **3px left stripe** on the skill list and the running row, the **XP and timer bars**, the talent vine, and level-up floats.
- Item chips: **text in text-1, glyph in the producing skill's colour**, a neutral border. One small coloured glyph per chip instead of a fully coloured chip. "Short" = dashed border + action-text count; "enough" = no border at all (plain text + glyph).
- Start buttons on rows: **neutral ghost buttons** (border + text-1), turning into the action red fill on hover or focus. The red fill stays reserved for "the one thing to press" (Place, Claim, Begin the rite, Go).
- The skill header can carry a very faint tint (`color-mix(in oklch, var(--skill) 6%, var(--color-surface))`) as the one "you are here" wash. Nothing else gets tinted.

### 7.7 Vellum: one or two uses
- **Keep vellum for:** Grimoire pages (you are *reading a written page*) and the chapter-end card (a keepsake of the chapter). Following Pentiment's logic, a material means "this is a document".
- **Drop vellum from:** the chapter tracker (make it a plain sidebar panel with stitch steps), the Kindling panel (the rosette carries it), contracts (a table: who, needs, pays), and all dialogs (raised surface).
- When vellum *is* used in A, make it linen-toned *dark* paper (`oklch(27% 0.02 85)`) with a single 1px border-soft rule: no gold frame, no inner rule, no radial glow.

### 7.8 Other quick wins
- Floats: coin = linen, level = skill colour, item = text-1, good = verdigris, rare = gold + ✦. Only rare may glow.
- Toasts: raised surface, a 3px left edge in the event's colour (skill, verdigris or gold); title in text-1 at 500 weight, not gold small caps.
- The `invite` animation: change it from a gold glow to a stitch-red 2px outline that pulses three times and then stays static.
- Focus ring: 2px linen outline with a 2px offset (highest contrast, and hue-neutral, so it never collides with a role).

---

## 8. Recommendation and migration plan

**Recommended: A "Soot & Linen",** with the §6 type and the §7 components. C can be added later as `data-theme="linen"` from the same semantic tokens.

It stays inside decision Q9 ("bone, ink black, ember red, candle gold"): the four colours are the same, but ink becomes truly near-black, red becomes the action colour, and gold becomes rare. That shift in roles is still a change to DESIGN.md and to CONCEPT §9's wording, so it needs the designer's yes before code changes.

### 8.1 Raw palette (tokens.css)
| Current | Becomes | Value |
|---|---|---|
| `--ink-950` #120e0b | `--soot-950` | `#090b0e` |
| `--ink-900` #1c1611 | `--soot-900` | `#111417` |
| `--ink-800` #271f18 | `--soot-800` | `#1b1e22` |
| `--ink-700` #33291f | `--soot-700` | `#272a2e` |
| (new) | `--soot-650` | `#2d3134` |
| `--ink-600` #4a3b2f | `--soot-600` | `#3f4347` |
| `--bone-100` #efe6d6 | `--linen-100` | `#ede7db` |
| `--bone-300` #c9bba3 | `--linen-300` | `#bfbaaf` |
| `--bone-500` #a39580 | `--linen-500` | `#99958c` |
| `--ember-600` #9e3524 | `--cinnabar-600` | `#b63325` (+ `--cinnabar-700` `#a1271e`, `--stitch` `#c93126`, `--oxblood` `#7f2119`) |
| `--ember-300` #e57a62 | `--cinnabar-300` | `#ef816b` |
| `--gold-400` #e0ad4a | `--gold-400` (rare only) | `#edb345` |
| `--gold-600` #b3842c | remove (or keep for the rare badge's border) | |
| (new) | `--verdigris-400` | `#5ebaaf` |
| (new) | `--slate-300` | `#92b3cb` |
| `--folk-moss` | `--folk-lichen` | `#94be58` |
| `--folk-cornflower` | `--folk-river` | `#469bd1` |
| `--folk-candle` | `--folk-beeswax` | `#ebd56a` |
| `--folk-poppy` | `--folk-poppy` | `#ee694f` |
| `--folk-lilac` | `--folk-lilac` | `#cdaef2` |
| `--folk-plum` | `--folk-rowan` | `#db6ea5` |

(Renaming is optional; changing values under the old names works too. Renaming makes the stray `var(--folk-candle)` used as "the accent" fail loudly, which is useful during migration.)

### 8.2 Semantic tokens
| Token | Now | New mapping |
|---|---|---|
| `--color-bg` | ink-950 | soot-950 |
| **`--color-band`** (new) | none | soot-900 (top bar, sidebar) |
| `--color-surface` | ink-900 | soot-800 |
| `--color-raised` | ink-800 | soot-700 |
| `--color-sunken` | ink-950 | soot-950 |
| `--color-border` | ink-600 | soot-600 |
| `--color-border-soft` | ink-700 | soot-650 |
| `--color-text` / `-2` / `--color-muted` | bone | linen-100 / 300 / 500 |
| `--color-accent` | gold-400 | **split:** remove, replaced by the tokens below |
| **`--color-action`** (new) | none | cinnabar-600 |
| **`--color-action-hover`** (new) | none | cinnabar-700 |
| `--color-on-accent` → **`--color-on-action`** | ink-950 | linen-100 |
| `--color-accent-deep` | gold-600 | remove |
| **`--color-selected`** (new) | none | verdigris-400 (markers, links, checkboxes) |
| **`--color-success`** (new) | none | verdigris-400 |
| **`--color-info`** (new) | none | slate-300 |
| **`--color-rare`** (new) | none | gold-400 |
| `--color-danger` | ember-600 (fill) | cinnabar-300 (text/outline only) |
| `--color-warn-text` | ember-300 | cinnabar-300 |
| `--color-focus` | gold-400 | linen-100 |
| **`--color-stitch`** (new) | none | stitch red (ornaments only) |
| `--glow-candle` | gold glow | **remove** |
| `--shadow-1` | 1px shadow | remove from panels; keep `--shadow-2` for popovers and dialogs only |
| **`--font-ui`** (new) | none | "Alegreya Sans", system-ui, sans-serif |
| `--font-body` → **`--font-lore`** | Alegreya | Alegreya (prose only) |
| `--font-display` | Alegreya SC, everywhere | Alegreya SC, column headers and chapter titles only |
| `--font-title` | IM Fell English SC | SVG wordmark, or Ruslan Display (decide in a test) |
| text sizes | 14–29 | §6 scale (12–28, rows at 15) |

### 8.3 Order of work (each step shippable and screenshot-checkable on `test.localhost`)
1. **Values only:** swap the raw palette and the semantic mapping in `tokens.css`; set `--color-accent` temporarily to `--color-action` so nothing breaks. Screenshot and compare.
2. **Strip the materials:** in `identity.css`, delete the body glow and grain, the `.panel` wood gradient, the `.topbar` shadow, `--glow-candle` uses, `running-glow`, and the stitch on `.panel-title::after` and `.tab::before`. Keep `.paper` for the Grimoire and the chapter end only (restyled per §7.7); `.modal` drops the vellum remap.
3. **Re-role the gold:** go through the 61 `--folk-candle` and 72 `--color-accent` uses. Each becomes one of `--color-action` (buttons you press), `--color-rare` (rare, Resplendent, keepsakes), `--skill` (level-ups, effects on a skill), `--color-text` (coin, headings, panel icons) or `--color-selected` (active states). Then remove `--color-accent`.
4. **Chips and rows:** neutral chips with coloured glyphs; ghost Start buttons; the recipe grid with column headers and rate columns.
5. **Type:** add `@fontsource/alegreya-sans`; `body` and `.btn`, `.chip`, `.tab` use `--font-ui`; demote `--font-display`; new size scale; delete most `letter-spacing`.
6. **Ornaments with a job:** the top-bar stitch band, the stitched active tab, the stitch steps in the tracker and the rite pips.
7. **Docs:** update DESIGN.md §1–§2 and §7 and the changelog; reword CONCEPT §9 (the palette's roles), and log the decision.

Rules to keep while migrating: components use semantic tokens only (DESIGN.md §1); contrast ≥ 4.5:1 for text (all A text tokens pass on every surface except text-3 on raised at 4.83, which still passes); colour is never the only signal (glyphs and dashes stay).

---

## 9. Sources

**AI-generic look and UI craft**
- SmoothUI, "AI Design Slop": https://smoothui.dev/blog/ai-design-slop
- prg.sh, "Why Your AI Keeps Building the Same Purple Gradient Website": https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- Samith Pitigala, "Why AI-Generated UI Looks Good But Often Feels Generic": https://medium.com/@cssamithpitigala/why-ai-generated-ui-looks-good-but-often-feels-generic-020a9b1b8492
- Alex Lavaee, "Why My AI-Generated UI Looked Generic": https://alexlavaee.me/blog/lessons-learned-designing-with-ai/
- Refactoring UI notes (fewer borders, de-emphasise): https://gist.github.com/selcukcihan/b9418596a98abfcd4bbc622550820cc5
- Kenney, Fantasy UI Borders (the stock look): https://kenney.nl/assets/fantasy-ui-borders

**Reference games**
- Darkest Dungeon, "The Gothic Sensibilities of Darkest Dungeon" (GameSpot, mirrored): https://finance.yahoo.com/news/gothic-sensibilities-darkest-dungeon-164800337.html
- Cultist Simulator, Thumbsticks interview: https://www.thumbsticks.com/interview-unseen-arts-behind-cultist-simulator/
- Cultist Simulator, Game Developer: https://www.gamedeveloper.com/design/why-the-i-cultist-simulator-i-devs-built-their-lovecraftian-game-on-a-house-of-cards
- Weather Factory, "Light and Shade": https://weatherfactory.biz/light-and-shade/
- Book of Hours aspects (TV Tropes): https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/BookOfHours
- Inscryption, Daniel Mullins on the palette shader: https://x.com/DMullinsGames/status/1451601471003234314
- Pentiment, Game Developer deep dive: https://www.gamedeveloper.com/art/deep-dive-the-art-of-pentiment
- Pentiment, PCGamesN on art and fonts: https://www.pcgamesn.com/pentiment/art-fonts-story
- Pentiment, Lettermatic: https://lettermatic.com/custom/pentiment
- Balatro, DayOne interview with LocalThunk: https://playday.one/2024/03/09/there-is-a-lot-more-design-to-explore-within-balatro/
- Balatro, design guide: https://blakecrosley.com/guides/design/balatro
- Slay the Spire UI, Cloudfall Studios: https://www.cloudfallstudios.com/blog/2018/2/20/flash-thoughts-slay-the-spires-ui
- Hades art, Point'n Think: https://www.pointnthink.fr/en/the-art-of-hades-en/
- Hades art, MCV/Develop: https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/
- Frostpunk, Xbox Wire: https://news.xbox.com/en-us/2021/07/21/how-the-visual-identity-of-frostpunk-changed/
- Sunless Skies, Failbetter: https://www.failbettergames.com/news/sunless-skies-pre-production-looking-to-the-skies
- Black Book, Morteshka: https://www.morteshka.com/black-book · Wikipedia: https://en.wikipedia.org/wiki/Black_Book_(video_game)
- Lubok: https://en.wikipedia.org/wiki/Lubok
- Blasphemous, Siliconera: https://www.siliconera.com/blasphemous-developers-talk-sources-horrifying-religious-imagery/ · frieze: https://www.frieze.com/article/how-video-game-blasphemous-embraces-catholic-gothic-tradition
- Rain World palettes: https://rainworldmodding.miraheze.org/wiki/Palettes
- Townscaper palette: https://steamcommunity.com/app/1291340/discussions/0/3039354735027472105/ · https://chrisluv.medium.com/getting-hacky-with-townscaper-5a31cf7f4c6a
- The Witcher 3 UI, Dan Voinescu: https://www.artstation.com/artwork/2AYqe · Fernando Forero: https://fernandoforeroart.com/the-witcher-3-the-ui-visual-art
- Loop Hero palette: https://lospec.com/palette-list/loop-hero · PC Gamer: https://www.pcgamer.com/best-design-2021-loop-hero/
- Melvor Idle changelog: https://wiki.melvoridle.com/w/Full_Changelog · Steam threads: https://steamcommunity.com/app/1267910/discussions/0/3829792817308141704/ and https://steamcommunity.com/app/1267910/discussions/0/3944650879129936794/
- Antimatter Dimensions: https://ivark.github.io/AntimatterDimensions/ · idle overview: https://www.itechguides.com/20-best-browser-idle-games-in-2026-from-cookie-clickers-to-deep-incrementals/ · https://dinogame.gg/blog/best-idle-games-2026/

**Folk art**
- Vyshyvanka: https://kyivindependent.com/vyshyvanka-traditional-ukrainian-embroidered-shirt/ · https://www.ukrainianlessons.com/ukrainian-vyshyvanka/
- Wycinanki: https://en.wikipedia.org/wiki/Vytynanky_(Wycinanki) · https://blog.massfolkarts.org/index.php/2014/07/the-art-of-polish-paper-cut-design/ · Kurpie: https://www.sheldonbrown.com/org/joyce/wyc-kurpie.html
- Khokhloma: https://en.wikipedia.org/wiki/Khokhloma · https://www.gw2ru.com/arts/3174-khokhloma-russian-handicraft
- Gzhel: https://en.wikipedia.org/wiki/Gzhel · https://www.gw2ru.com/arts/2489-gzhel-russian-craft-tableware
- Palekh: https://www.gw2ru.com/arts/1656-palekh-russia-lacquer-miniature · https://kureansiklopedi.com/en/detay/palekh-miniature
- Mezen: https://en.wikipedia.org/wiki/Mezen_wood_painting
- Pysanky (Hutsul, dye sequence): https://www.pysanky.info/Ukrainian_Pysanky/Traditional/Pages/Hutsul.html · https://www.pysanky.info/Dyeing/Dye_Sequences.html
- Romanian textile dyes: https://www.mdpi.com/2571-9408/6/1/27 · https://greatblouses.com/en/content/21-natural-colors-in-romanian-folk-costume-dyeing-threads-with-traditional-plants

**Colour and accessibility**
- 60-30-10: https://66colorful.com/blog/60-30-10-rule/ · https://www.visionaustralia.org/business-consulting/digital-access/Creating-accessible-digital-colour-palettes-60-30-10-design-rule
- Material Design dark theme: https://m2.material.io/design/color/dark-theme.html
- OKLCH, Evil Martians: https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl · https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools
- APCA: https://git.apcacontrast.com/documentation/APCAeasyIntro.html · https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html
- Okabe-Ito palette: https://easystats.github.io/see/reference/scale_color_okabeito.html
- Colour-blind simulation: Machado, Oliveira & Fernandes (2009), "A Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE TVCG 15(6)

**Type**
- type.today, Cyrillic display faces on Google Fonts, parts 1 and 2: https://type.today/en/journal/display · https://type.today/en/journal/display2
- Google Design, Cyrillic on Google Fonts: https://design.google/library/scripting-cyrillic
- Dense dashboards: https://fontalternatives.com/blog/best-fonts-dense-dashboards/ · Nightingale: https://nightingaledvs.com/choosing-fonts-for-your-data-visualization/
- Font scripts and weights: Fontsource API (https://api.fontsource.org/v1/fonts/alegreya-sans and siblings); OpenType features read from the Fontsource WOFF files.
