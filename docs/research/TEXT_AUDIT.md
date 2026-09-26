# Text audit: toward a spreadsheet style

> Research note, not a decision. It inventories every piece of player-facing text in Chapter 1 and proposes what to keep, shorten, move or cut. Nothing in the code or the other docs has changed yet.
> The request: *"There is too much fluff text. Lean closer to a spreadsheet style, where text matters (mostly) or tells you something about the gameplay. Trim the lore and flavour text. The flavour should live in the visuals, not in lore nobody wants to read."*

**Classes**

| | Meaning |
|---|---|
| **K** | Keep: gameplay info, a number, a cost, a requirement, what a button does, or a theme-carrying name |
| **S** | Shorten: gameplay buried in prose. A short version is given |
| **M** | Move: story worth keeping, but not in the player's face. It goes to the Grimoire journal (collapsed), a "Story ▸" link, or a hover title |
| **C** | Cut: pure flavour, duplicates what the UI already shows, or is dead (never shown) |

---

## 1. Principles

1. **Numbers and verbs first.** "+10% offline speed", not "The house works 10% faster while you're away." Lead with the number, the stat and the verb. Effects are generated from data (`src/ui/effects.ts`) wherever they can be.
2. **One line per thing.** A row, a card or a toast says one thing, in one line. If it needs two, the second goes in a tooltip.
3. **Labels over sentences.** `Next contract in 12s`, not "Someone will knock in 12s." Use `·` to join facts, and drop articles and "you".
4. **No "you"-voiced paragraphs that explain what the UI already shows.** If there's a Reset button with a "Free" tooltip, the intro doesn't also need to say "Switch any time, for free."
5. **Tooltips for the rare "why".** Rules a player needs once (how trust works, what quality does) go in a `title` on the number they explain.
6. **Story is optional, never in the way.** Grandmother's notes, pages, curios, reveal lines and rite logs all stay in the game, in the Grimoire journal, collapsed by default. A modal can carry a "Story ▸" link, but never a paragraph of prose.
7. **The theme lives in names and art.** Item, recipe, place, part and talent names carry the setting (Kupala herb, Hearth ward, the Kindling). So do the sanctum painting, the rosette, embroidery and icons. Sentences don't have to.
8. **Puzzle text is gameplay.** Riddles, clues, category hints, villager asides and the item descriptions that bridge riddle words to items all count as **K**, however poetic they sound (§5).
9. **Kill dead text.** Content fields that no screen shows should be deleted, so nobody polishes words no player will read (§3.14).

---

## 2. Summary

### Counts

290 rows are audited below. A few rows stand for a group, such as "notes 2–8 text" or "all other step labels".

| Class | Rows | Share |
|---|---|---|
| **K** keep | 129 | 44% |
| **S** shorten | 118 | 41% |
| **M** move | 21 | 7% |
| **C** cut | 22 | 8% |

Most of the K rows are short already: labels, buttons and numbers. By word count the picture is lopsided. Most of the words players see today are in the S, M and C rows: note prose, rite logs, reveal lines, modal paragraphs, request lines, the rite card and the away summary.

### The biggest offenders, by screen

| # | Screen | What | Words today → proposed |
|---|---|---|---|
| 1 | **Omen shelf modal** (Projects.tsx:82–89) | Three paragraphs after building the shelf, with a lore opener | ~80 → a one-line toast |
| 2 | **ShelfCard** (ShelfCard.tsx:13–16) | A grandmother quote plus a four-clause paragraph explaining projects and omens | ~70 → cut the card (the tracker pointer, New tag and toast already cover it), or 1 line |
| 3 | **Chapter end** (ChapterEnd.tsx:19, 44–45) | Finale, lore and Resplendent lore as three italic prose lines around the ledger | ~45 → 0 (ledger only, plus "Story ▸") |
| 4 | **Kindling panel** (KindlingPanel.tsx:69, 168, 193, 226) | A prose line per placed part, a rite-log paragraph per phase, a two-sentence rules line and an outcome sentence | ~150 → about 30 |
| 5 | **Discovery modal** (DiscoveryModal.tsx:13) | A reveal paragraph under the reward | ~20 → 0 (it moves to the discovered page, collapsed) |
| 6 | **Grimoire how-strip** (Grimoire.tsx:41–51) | Three explanatory sentences | ~55 → 3 short labels |
| 7 | **Village contracts** (requests.ts, 11 lines) | A folk-voice sentence on every card, in italics | ~130 → 11 two-word labels (the full line as a hover title) |
| 8 | **Away summary** (AwaySummary.tsx) | Every result is a sentence ("An omen appeared: … It waits on the shelf.") | → one ledger |
| 9 | **Task card** (TaskCard.tsx:74) | A grandmother quote on every step card | cut (a "Story ▸" link instead) |
| 10 | **Recipe guidance** (guidance.ts:41–56) | A two-sentence "detail" under every Next-step headline, one of them stale ("hints sharpen on their own") | → the headline only, plus one short line |

### The top 10 cuts (by how much reading they remove)

1. The omen shelf's post-build modal (3 paragraphs), replaced by a toast.
2. The ShelfCard: the quote and the paragraph go. The card itself can go too.
3. The rite log (5 prose lines), replaced by the phase list and the rosette.
4. The "placed" prose line on each finished Kindling part (5 lines).
5. The Chapter end's finale, lore and Resplendent lore lines. They move to the journal.
6. The discovery reveal paragraph in the Discovery modal. It moves to the discovered page, collapsed.
7. The grandmother quote at the foot of every Task card.
8. The villager request lines, which become short labels with the full line as a hover title.
9. The Grimoire how-strip sentences and the Next-step "detail" paragraphs.
10. The dead content text: 9 note `hint`s that never show, the buff, omen and follower descriptions, shop descriptions, `HEARTH_RITE.description` and `resplendentCosmetic` (§3.14).

---

## 3. Per screen and file

Line numbers are from `main` at `1d31ef9`.

### 3.1 Grandmother's notes (`src/content/notes.ts`)

Where each field shows today: `text` appears only in the Grimoire journal. `quote` is the last line of the Task card. `hint` shows only when a note has **no** steps, which means only note 8 and the experiments note. The hints on notes 1–7 are never displayed.

| Location | Current | Class | Proposal |
|---|---|---|---|
| notes.ts:11 | "The house is cold, child. Under the floor is my circle. It sleeps…Start in the pantry." | M | Journal only (collapsed). The order it describes (light first, offering last) is already shown by the tracker and the Kindling panel |
| notes.ts:22, 35, 48, 63, 78, 93, 104 | Notes 2–8 `text` ("Light is the first ward…", "Salt keeps what is inside…", …) | M | Journal only, collapsed, one entry per note, titled with its task name ("Make the Light") |
| notes.ts:116 | EXPERIMENTS_NOTE text "You've found the edge of one of my small workings…" | M | Journal only |
| notes.ts:12, 23, 36, 49, 64, 79, 94, 105, 117 | `quote` × 9 ("The house is cold, child. Start in the pantry.", …) | C | Delete the field. The Task card gets a "Story ▸" link to the journal entry instead |
| notes.ts:13, 24, 37, 50, 65, 80, 95 | `hint` on notes 1–7 ("Search the pantry (Scavenging) for tallow.", …) | C | Dead text: never shown, because these notes have steps. Delete |
| notes.ts:106 | "Janko speeds up whatever you do. Chapter II comes in a later build." | S | "Janko: +30% speed on your current action · Chapter II: later build" |
| notes.ts:118 | "Pick a hidden recipe (the Dream pillow is a good first one) and try three things…Optional." | S | "Optional · place 3 items at the Circle · 1 glow per right item · start with Dream pillow" |
| notes.ts:69 | "Pour 24 tallow candles to read by" | S | "Pour 24 tallow candles" |
| notes.ts:71 | "Decipher 24 burnt pages: 21 for the Words, 3 for the Litany (Scholarship 3)" | S | "Decipher 24 pages (21 Words + 3 Litany) · Scholarship 3" |
| notes.ts:84 | "Finish a contract for a villager (Village tab)" | S | "Finish 1 contract" (the Go button already leads to the Village) |
| notes.ts (all other steps) | "Search the pantry 10 times", "Rob the old hives 16 times (Scavenging 3)", "Place the Light in the Circle"… | K | Already a verb, a count and a requirement |

### 3.2 Deciphered pages (`src/content/pages.ts`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| pages.ts:9, 14, 19, 24, 29, 34 | Titles ("Of the iron at the door", "Of chalk", "Of the Kupala herb", …) | K | Theme names, used in toasts and the journal. "Of the Kupala herb" is also a puzzle bridge (§5) |
| pages.ts:10, 15, 20, 25, 30 | Page texts ("Cold iron and salt. Whatever walks the lane…") | M | Journal, collapsed. Show a K line first: "Teaches: Iron ward (2 iron nail + 1 salt)" |
| pages.ts:35 | "The ink here is too dark to read. Beneath it, in pencil: 'Leave that page be. I didn't.'" | M | Journal, collapsed. The visible line is "Readable in Chapter 3" |

### 3.3 Grimoire content (`src/content/grimoire.ts`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| grimoire.ts:8, 21, 34, 47, 56 | Names (Dream pillow, Hearth mark, Threshold nail, Honey-light, Hana's soup) | K | Theme names |
| grimoire.ts:12, 25, 38 | Riddles ("…for sleep that listens: the bitter dream-herb…") | K | **Load-bearing** (hint I, the only free hint). Keep them word for word |
| grimoire.ts:13, 26, 39 | Category hints ("A herb from the forest edge", …) | K | Bought hint |
| grimoire.ts:50, 59 | Secret clues × 6 ("She kept bees for the light, not the honey.", …) | K | **Load-bearing**, bought hints. The flavourful first clues are the puzzle, so keep them |
| grimoire.ts:17 | "+10% speed on everything while you're away." | S | "+10% offline speed" |
| grimoire.ts:30 | "Your rites turn out one step better." | S | "+1 rite quality step" |
| grimoire.ts:43 | "Village trust grows half again as fast." | S | "Trust gains ×1.5" |
| grimoire.ts:52 | "A jar of soft light now glows in the window." | S | "Cosmetic: honey jar in the sanctum window" |
| grimoire.ts:61 | "Widow Hana's requests pay double for the rest of the chapter." | S | "Widow Hana's contracts pay ×2 (this chapter)" |
| grimoire.ts:18, 31, 53, 62 | Reveal lines ("The pillow smells of her…", "Hana tastes it and cries…") | M | The discovered recipe's page, collapsed ("Story ▸"). Removed from the Discovery modal |
| grimoire.ts:44 | Threshold nail reveal: "…a folded note: 'There was a child I could not keep. Find her…'" | M | Same, but it's a **plot thread** (the hidden 5th follower). Add a K line to the discovered page: "Opens: grandmother's hidden note (journal)" |
| grimoire.ts:83–87 | Curio stories × 5 ("A child's wooden horse, one leg whittled shorter…") | M | Grimoire › Curios, one short name per curio ("Wooden horse", "Horn button", "Pressed flower", "Tin whistle", "Warm key"), with the story collapsed or as a hover title |

### 3.4 Village contracts (`src/content/requests.ts`, `screens/Village.tsx`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| requests.ts:9 etc. | `from` ("Widow Hana", "The miller", …) | K | Who's asking: a theme name, and a secret refers to Hana |
| requests.ts:10 | "Nettle soup, for the widow Hana. My legs won't carry me to the ditch any more." | S | Label "Nettle soup" (**keep "Nettle soup"**: it's the Hana's soup secret's anchor, §5). The full line becomes a hover title |
| requests.ts:19 | "Something for the miller's cough. It rattles all night." | S | "Cough remedy" |
| requests.ts:27 | "Ash for the lye. The kettle's been cold a week." | S | "Lye ash" |
| requests.ts:35 | "Candles for my father's grave. He never liked the dark." | S | "Grave candles" |
| requests.ts:43 | "Salt across our doorstep. He says he hears someone wading behind him…" | S | "Doorstep salt" |
| requests.ts:51 | "A mark over the stable door. The cow won't milk." | S | "Stable mark" |
| requests.ts:60 | "Smoke out whatever is in my loft. It walks when we sleep." | S | "Smoke the loft" |
| requests.ts:68 | "Juniper smoke for the sickroom. The fever won't break." | S | "Sickroom smoke" |
| requests.ts:76 | "Iron by the cradle. Please. She cries at the window every night." | S | "Cradle iron" |
| requests.ts:85 | "Candles for the wake. Good ones. Grandfather should find his way." | S | "Wake candles" |
| requests.ts:93 | "A ward for the church door. Don't tell the priest who made it." | S | "Church ward" |
| requests.ts:15 | Hana aside: "Your grandmother made me a pillow once, for the bad dreams. Bitter-smelling. It worked." | S | **Load-bearing** (a free hint, +2 insight). "Grandmother made me a pillow for bad dreams. Bitter-smelling." Also keep it on the Dream pillow page as "Heard in the village" |
| requests.ts:56 | Kral aside: "She drew a mark on our hearth once, with her finger and the ashes. Salt on top…" | S | **Load-bearing.** "She drew a mark on our hearth in ash. Salt on top." Also on the recipe page |
| requests.ts:81 | Young mother aside: "…the witch kept a nail under her own door, and a yellow flower with it." | S | **Load-bearing.** Keep as it is, or trim to "The witch kept a nail under her door, and a yellow flower." Also on the recipe page |
| Village.tsx:28 | "Contracts" | K | |
| Village.tsx:29 | Tooltip: "Trust grows with every contract you finish. Higher trust brings better-paying work." | K | A good use of a tooltip |
| Village.tsx:30–31 | "Trust N · better work at N" | K | |
| Village.tsx:40 | "Helped ✓" | K | |
| Village.tsx:41 | "Someone will knock in Ns." | S | "Next contract in Ns" |
| Village.tsx:60 | "The village shop" | S | "Shop" |
| Village.tsx:66, 74 | "Needed for the Kindling's offering · you hold N" | K | Generated purpose |
| Village.tsx:93, 99 | "Need N more" / "Buy · N" | K | |
| Village.tsx:116 | Request text rendered as an italic `note-quote` | S | Render the short label in plain type, with the full line as `title` |
| Village.tsx:124 | "n/N delivered" | K | |
| Village.tsx:132 | "Pays N coin · +N trust" | K | The model line: the rest of the game should read like this |
| Village.tsx:135–139 | "Deliver and finish" / "Deliver what I have" / "Turn away" / tooltip "You have none of what they need yet" | K | |

### 3.5 Items and shop (`src/content/items.ts`, `shop.ts`, `components/ItemLookup.tsx`)

Item descriptions appear only in the item lookup dialog, as an italic line.

| Location | Current | Class | Proposal |
|---|---|---|---|
| items.ts (all names) | Nettle, Tallow, Hearth candle, Salt line, Grandmother's Litany… | K | Theme names |
| items.ts:4–11 | Categories ("Garden & forest", "House & village", …) | K | |
| items.ts:20 | Mugwort: "The dream-herb." | K | **Load-bearing:** it links the riddle's "bitter dream-herb" to Mugwort. Show it in plain type, and maybe also in the chip's tooltip |
| items.ts:21 | St John's wort: "The Kupala herb." | K | **Load-bearing:** it links "the Kupala herb" (Threshold nail riddle, page 3) to St John's wort |
| items.ts:28 | Burnt page: "What's left of grandmother's grimoire." | C | The lookup's Comes from / Used for already say it |
| items.ts:31 | Curio: "Odd keepsakes. Each one is read when found, and remembered in the Grimoire's margins." | S | "Collectible · +3 insight · story in Grimoire › Curios" |
| items.ts:50 | Litany: "The focus for the Hearth-Circle." | C | "Used for: the Kindling" already shows it |
| items.ts:52 | Bread: "For the offering of bread and salt." | C | Same |
| shop.ts:7 | "A round loaf, for the offering of bread and salt." | C | Dead: the shop shows the generated purpose ("Needed for the Kindling's offering") |
| shop.ts:8 | "From the butcher, for when the pantry runs short." | C | Dead: the shop shows "For tallow candle" |
| ItemLookup.tsx:156 | "Garden & forest · you hold N" | K | |
| ItemLookup.tsx:162 | "Not something you know how to get yet." | S | "Unknown" |
| ItemLookup.tsx:170 | "Nothing you know of yet." | S | "Nothing known" |
| ItemLookup.tsx:175–181 | "The Kindling of the Hearth-Circle (×N)", "A request from X", "Dream pillow (Grimoire)" | K | |
| ItemLookup.tsx:181 | "Something you haven't found yet" | K | **Load-bearing:** it tells the player the item is in an undiscovered recipe |
| ItemLookup.tsx:128 | Chip menu: "You don't know how to make this yet." | S | "Recipe unknown" |
| ItemLookup.tsx:92 | Tooltip "Short of X: you have N, need M" | K | |

### 3.6 The Kindling and the rite (`src/content/rite.ts`, `components/KindlingPanel.tsx`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| rite.ts:12, 18, 24, 30, 36 | Part names (The Light, The Ward, The Smoke, The Words, The Offering) | K | |
| rite.ts:15, 21, 27, 33, 39 | `placed` lines ("Candles at the four quarters. The chalk under them remembers being warm.") | C | The ✓ and the lit petal say it. The lines could survive as a journal entry "The Kindling", but that's not required |
| rite.ts:52 | "Kindling of the Hearth-Circle" | K | The rite's name |
| rite.ts:53 | description: "Wake the circle grandmother drew in the floor. It has been waiting for you." | C | Dead (never shown) |
| rite.ts:59–63 | Phase logs × 5 ("You kneel at the edge, by the bread and salt…") | M | Journal entry "The Kindling". In the panel, the phase list (✓ Light · ✓ Ward · ▶ Smoke …) and the pulsing petal replace the log |
| rite.ts:65 | Finale: "The circle wakes. The cellar door, nailed shut for years, stands open." | M | Journal. The chapter-end ledger already has "The cellar · open" |
| rite.ts:69 | Lore: "Under the floor, the circle goes deeper than the house…" | M | Journal |
| rite.ts:72 | resplendentLore: "In the cellar dark, a second circle, older than hers, answers the first." | M | Journal (a Resplendent-only entry). See the risk about "more lore" in §5 |
| rite.ts:73 | resplendentCosmetic: "An embroidered circle cloth, red on bone, appears on the table." | C | Dead (ChapterEnd hard-codes "an embroidered circle cloth"). Delete it, or use it as the ledger's source |
| rite.ts:84 | "A hearth candle at the heart of the circle" | S | "Hearth candle (uses 1)" |
| rite.ts:85 | "The Hearth mark (a hidden recipe) is yours" | S | "Hearth mark discovered (hidden recipe)" |
| rite.ts:86 | "A Still Night blessing active while it runs" | S | "Still Night active during the rite" |
| rite.ts:95 | Qualities (Sound, Fine, Resplendent) | K | |
| KindlingPanel.tsx:35–36 | Title, "n/5 placed" / "Performed: Fine" | K | |
| KindlingPanel.tsx:69 | Placed part's prose line | C | Show "✓ The Light" plus what was placed ("40 tallow candle · 8 beeswax candle"), or nothing |
| KindlingPanel.tsx:82–86 | "Yours to choose · brings X" / "Later · brings X" / "Make this next" | K | |
| KindlingPanel.tsx:105 | "Place in the Circle" / "Not ready yet" | K | |
| KindlingPanel.tsx:151 | "Wake it" | S | "The rite" (the button already says "Begin the rite") |
| KindlingPanel.tsx:159–163 | "Ritualism level 2/3" | K | |
| KindlingPanel.tsx:168 | "About 3 minutes. It runs by itself, even while you're away, and never fails." | S | "3 min · runs offline · can't fail" |
| KindlingPanel.tsx:169 | "Offerings (optional)" | K | |
| KindlingPanel.tsx:193 | "Outcome: Fine · none = Sound, 1–2 = Fine (choose a keepsake), all 3 = Resplendent (choose two, and more lore). The story rewards are the same either way." | S | "Outcome: **Fine** · 1–2 offerings: +1 keepsake · 3: +2 keepsakes, cloth". The "same story rewards" rule goes in a tooltip |
| KindlingPanel.tsx:196 | "Begin the rite" | K | |
| KindlingPanel.tsx:210–213 | "Phase 2 of 5 · The Ward" / "m:ss left" | K | |
| KindlingPanel.tsx:216 | "Outcome: Fine · it runs by itself." | S | "Outcome: Fine" |
| KindlingPanel.tsx:222–231 | RiteLog (renders the phase logs and the finale) | M | Replace it with the phase checklist. The logs go to the journal |

### 3.7 Keepsakes (`src/content/keepsakes.ts`, `components/KeepsakePick.tsx`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| keepsakes.ts:24, 30, 36 | Names (Grandmother's quilt, A jar of embers, Her reading glasses) | K | |
| keepsakes.ts:25 | "The house works 10% faster while you're away." | S | "+10% offline speed" |
| keepsakes.ts:31 | "The omen shelf holds one more omen." | S | "+1 omen slot" |
| keepsakes.ts:37 | "+1 insight from every page deciphered." | K | |
| keepsakes.ts:26, 32, 38 | Flavour ("Patched a hundred times. It still smells of her stove.") | M | A hover title on the card |
| KeepsakePick.tsx:15 | "The circle leaves something behind: choose one" / "What the circle left behind" | S | "Choose 1 keepsake" / "Keepsakes" |
| KeepsakePick.tsx:39 | "Kept for good. You can also choose later, from the chapter tracker." | S | "Permanent · or choose later from the tracker" |

### 3.8 Buffs, omens, upgrades, followers, talents (`src/content/`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| buffs.ts:9, 17, 23 | Names (Still Night, Surge, Blessing) | K | |
| buffs.ts:10 | "The house holds its breath." | C | Dead |
| buffs.ts:18 | "A step done; the work flies." | C | Dead |
| buffs.ts:24 | "The rooms are smoked clean." | C | Shown only as the tooltip on Smoke the rooms' buff chip (House.tsx:176). Use the generated effect as the tooltip instead |
| omens.ts:10 | "The wind drops and the dogs stop barking." | C | Dead |
| upgrades.ts:9–35 | Names (Omen shelf, Reading lamp, Herb drying rack, Mended shutters, Carved omen shelf) | K | |
| upgrades.ts:10 | "A place to keep omens. They start to turn up while you work (two fit), and the first comes with the shelf." | S | "Holds 2 omens · 1st omen included · omens drop ~1 per 100 actions". Better still, drop `description` and render `upgradeEffect()` plus one extra fact |
| upgrades.ts:16, 22 | "+15% Scholarship speed." / "+10% Herbalism yield." | K | Already ideal |
| upgrades.ts:28 | "The house keeps working for 36 hours while you're away, instead of 24." | S | "Offline cap 24h → 36h" |
| upgrades.ts:34 | "Room for 3 omens instead of 2." | K | (or "Holds 3 omens (was 2)") |
| followers.ts:8 | Janko: "A village orphan who heard the circle wake. He sleeps by the hearth." | C | Dead. At most, a hover title on Janko's ledger row |
| followers.ts:12 | Trait: name "Hearth-born", description "+20% more on Chandlery." | C | The description is dead (effects.ts generates the effect). Keep the name only if it gets shown |
| talents.ts (all names) | Quick fingers, Deep shelves, Grandmother's eye… | K | Theme names |
| talents.ts (most texts) | "+15% Scavenging speed.", "+25% Scavenging XP.", "Every 5th pick gives 1 extra." | K | Already spreadsheet style |
| talents.ts:55 | "Chance finds (salt, rags, curios) are 50% more likely." | S | "Scavenging chance finds ×1.5" |
| talents.ts:58 | "The pantry and the hives give 2 at a time (and twice the XP), but take 80% longer." | S | "Pantry & hives: ×2 output & XP · +80% time" |
| talents.ts:59, 81, 95, 117, 153 | "Chandlery is 12% faster." (and Scholarship, Ritualism, Chandlery, Sigilcraft) | S | "+12% Chandlery speed", to match "+15% Scavenging speed" |
| talents.ts:76 | "Candles come 2 at a time (and twice the XP), but each pour takes 80% longer." | S | "Candles: ×2 output & XP · +80% time" |
| talents.ts:77 | "A third of your candles also leave 1 ash (for sigils)." | S | "33% of candles: +1 ash" |
| talents.ts:94 | "Salt lines come 2 at a time (and twice the XP), but take 80% longer." | S | "Salt lines: ×2 output & XP · +80% time" |
| talents.ts:98 | "15% of workings use no materials." | S | "Sigilcraft: 15% chance of no inputs" |
| talents.ts:112 | "Smudge bundles come 2 at a time (and twice the XP), but take 80% longer." | S | "Smudge: ×2 output & XP · +80% time" |
| talents.ts:130 | "Half the pages you decipher need no candle or page." | S | "Decipher: 50% chance of no inputs" |
| talents.ts:139 | "10% chance a working comes doubled, XP too." (Copyist) | S | "Scholarship: 10% chance ×2 output & XP" ("working" is vague) |
| talents.ts:148 | "Smoking the rooms blesses them twice as long." | S | "Blessing lasts ×2 (30m)" |
| talents.ts:149 | "30% of rites use no materials." | S | "Minor rites: 30% chance of no inputs" |
| talents.ts:156 | "10% chance a blessing comes doubled, XP too." | S | "Ritualism: 10% chance ×2 output & XP" |

### 3.9 Task card, shelf card, projects (`components/TaskCard.tsx`, `ShelfCard.tsx`, `Projects.tsx`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| TaskCard.tsx:19 | "New: Make the Light" / "New: Experiments at the Circle" / "Chapter complete" | K | |
| TaskCard.tsx:26–31 | "New skill: Chandlery", "Opens the Grimoire" | K | |
| TaskCard.tsx:33–47 | Steps with ✓/▶, progress and reward | K | The heart of the card |
| TaskCard.tsx:49 | Note hint paragraph (note 8 and the experiments note) | S | See notes.ts:106 and :118 |
| TaskCard.tsx:53 | "Needs" + chips | K | |
| TaskCard.tsx:67, 71 | "Go: <step>" / "Continue" | K | |
| TaskCard.tsx:74 | "“quote” — grandmother" | C | Replace it with a small "Story ▸" link that opens the journal entry |
| ShelfCard.tsx:12 | "Side project: the omen shelf" | S | "Side project: Omen shelf". The whole card is a candidate to cut: the tracker block, New tag and ready toast already point to it |
| ShelfCard.tsx:13 | "“My omen shelf is bare. Build it again, and the house will start to notice things.” — grandmother" | C | |
| ShelfCard.tsx:15–16 | "House projects are optional. You build them once, from things you make, and they help for good. The omen shelf is the first: …" | S | "Optional · permanent · omens drop from any work; bless a skill for ×2 speed & finds (2m)" |
| ShelfCard.tsx:32, 35 | "Show me the projects" / "Later" | K | (or "Go" / "Later") |
| Projects.tsx:35 | "House projects" | K | |
| Projects.tsx:36 | "N ready to build" / "Optional · built once, kept for good" | S | "N ready" / "Optional · permanent" |
| Projects.tsx:54 | Project description (from upgrades.ts) | S | See §3.8. Render the generated effect |
| Projects.tsx:70 | "Build" (disabled tooltip with the reason) | K | |
| Projects.tsx:78 | "In the house: Reading lamp (+15% scholarship speed) · …" | K | |
| Projects.tsx:83 | "Grandmother kept her omens here: a still night, a bird at the window. Now they'll come to you too…" | C | Lore opener that duplicates p3 |
| Projects.tsx:84 | "Omens wait on the shelf, which holds two. The first is already there." | S | Toast "Omen shelf built · holds 2 · 1 omen waiting" (the shelf panel appears in the sidebar at the same moment) |
| Projects.tsx:85 | "When you want a push, bless a skill with one: twice as fast, and twice the chance finds, for 2 minutes. Nothing is lost…" | S | The OmenShelf row already shows "×2 speed, ×2 chance finds · 2m". Keep only "Full shelf: new omens are lost", as the shelf's tooltip |
| Projects.tsx:87 | "I'll keep them" | S | Goes with the modal. If the modal stays, "OK" |

### 3.10 Chapter end, away summary, discovery (`components/ChapterEnd.tsx`, `AwaySummary.tsx`, `DiscoveryModal.tsx`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| ChapterEnd.tsx:15 | "Chapter I · Hearth" | K | |
| ChapterEnd.tsx:17 | Sanctum painting | K | The flavour lives here, as intended |
| ChapterEnd.tsx:19 | Finale line | M | Journal |
| ChapterEnd.tsx:21 | "The Kindling was Fine." | K | (or "Quality: Fine") |
| ChapterEnd.tsx:23–41 | Ledger: skill caps, Janko + effect, the cellar, the cloth | K | Already spreadsheet style |
| ChapterEnd.tsx:44 | Lore line | M | Journal. Add "Story ▸ (new entries)" |
| ChapterEnd.tsx:45 | Resplendent lore line | M | Journal |
| ChapterEnd.tsx:47–48 | "Chapter II · Grave comes in a later build." | K | |
| ChapterEnd.tsx:51 | "Back to the house" | K | |
| AwaySummary.tsx:16 | "While you were away" | K | |
| AwaySummary.tsx:18–19 | "You were gone 30h. The house kept working for 24h, the limit for now." | S | "Away 30h · simulated 24h (cap)" |
| AwaySummary.tsx:22 | "Nothing was running." | K | |
| AwaySummary.tsx:27 | "Herbalism rose from 4 to 6." | S | A ledger row: "Herbalism · 4 → 6" |
| AwaySummary.tsx:30–37 | Item ledger "+N" | K | |
| AwaySummary.tsx:42 | "Steps done: …" | K | |
| AwaySummary.tsx:47 | "New: Make the Ward" | K | |
| AwaySummary.tsx:52 | "Page deciphered: Of chalk" | K | |
| AwaySummary.tsx:55 | "The Kindling of the Hearth-Circle went on without you (3m)." | S | "Kindling · +3m" |
| AwaySummary.tsx:58 | "The Kindling of the Hearth-Circle is complete (Fine)." | K | (or "Kindling · done (Fine)") |
| AwaySummary.tsx:61 | "A curio found. Read them in the Grimoire." | S | "Curios · +1" |
| AwaySummary.tsx:64 | "+N insight to spend in the Grimoire." | S | "Insight · +N" |
| AwaySummary.tsx:69 | "An omen appeared: Still Night (…). It waits on the shelf." | S | "Omen · Still Night (on shelf)" |
| AwaySummary.tsx:72 | "An omen passed unseen; the shelf was full." | S | "Omens lost (shelf full) · N" |
| AwaySummary.tsx:75 | "Out of tallow, so you went back to search the pantry." | S | "Out of tallow → Search the pantry" |
| AwaySummary.tsx:78 | "Work stopped: Out of tallow." | K | |
| DiscoveryModal.tsx:8 | "Discovered: Dream pillow" | K | |
| DiscoveryModal.tsx:10 | Rosette bloom | K | The visual carries the moment |
| DiscoveryModal.tsx:12 | rewardText (big) | K | |
| DiscoveryModal.tsx:13 | Reveal line | M | The discovered page, collapsed |
| DiscoveryModal.tsx:15 | "Close the book" | S | "Close" |

### 3.11 Top bar, tracker, omen shelf, talents, settings, feed and toasts

| Location | Current | Class | Proposal |
|---|---|---|---|
| TopBar.tsx:50, 84–93 | Action name, bar, "3.2s", "Stop" / "Kindling · phase 2/5" | K | |
| TopBar.tsx:63–69 | "Stopped: out of tallow." / "Next: Make the Light [Go]" | K | |
| TopBar.tsx:73 | "Nothing running. Pick something to do." | S | "Idle" |
| ChapterTracker.tsx:55–57 | "Chapter I · Hearth" + "n/7" | K | |
| ChapterTracker.tsx:99 | "step k of n" | K | |
| ChapterTracker.tsx:130 | Note hint (only for note 8) | S | See notes.ts:106 |
| ChapterTracker.tsx:133, 137 | "Place in the Circle" / "Go" | K | |
| ChapterTracker.tsx:148 | "???" | K | |
| ChapterTracker.tsx:159–168 | "Side project · The omen shelf" + chips + "Build it"/"Go" | K | The quiet pointer that makes the ShelfCard unnecessary |
| ChapterTracker.tsx:172 | "Chapter complete. Janko has joined you." | S | "Chapter complete · Janko joined (+30% speed)" |
| ChapterTracker.tsx:185 | "Choose a keepsake" / "Choose two keepsakes" | K | |
| ChapterTracker.tsx:213 | "Claim · +2 beeswax" | K | |
| ChapterTracker.tsx:220–221 | "Put 60 XP into…" / "+60 XP to the skill you choose" | K | |
| ChapterTracker.tsx:235 | "Choose what to make next. Any order works." / "Choose the next part." | S | "Choose the next part (any order)" |
| ChapterTracker.tsx:243 | "brings Sigilcraft" | K | |
| OmenShelf.tsx:33–35 | "Omen shelf" + "n/2" | K | |
| OmenShelf.tsx:38 | "Empty. Omens turn up now and then from any work (about 1 in 100 actions)." | S | "Empty · ~1 omen per 100 actions" |
| OmenShelf.tsx:47–53 | "Still Night · ×2 speed…, chance finds ×2 · 2m" + "Bless a skill" | K | |
| OmenShelf.tsx:64 | "working on it now" | S | "current" |
| OmenShelf.tsx:70 | "Already active (blessing the same skill again adds 2m):" | S | "Active · same skill again: +2m" |
| TalentPanel.tsx:24–33 | "Chandlery talents", "A talent to choose" / "Next choice at level N", "Reset" (tooltip "Free: clear every choice and pick again") | K | |
| TalentPanel.tsx:38 | "Take one of each pair. They pull different ways, and some help another skill. Switch any time, for free." | S | "One per pair · switch free", or cut it (the leaf tooltips already say "Switch to this one (free)") |
| TalentTree.tsx:33 | Leaf tooltips ("Opens at level N", "Taken", "Switch to this one (free)", "Take this one") | K | |
| SettingsModal.tsx:30–38 | "When work stops (out of an ingredient)" + options | K | |
| SettingsModal.tsx:41 | "This also applies while you're away." | S | "Applies offline too" |
| SettingsModal.tsx:48 | "Double insight from every hint source, for the story without the puzzle." | S | "×2 insight from all sources" |
| SettingsModal.tsx:56 | "Turn off flicker, glows and slide-ins." | K | |
| SettingsModal.tsx:62–67, SaveTools.tsx | Message duration, save/export/import/reset strings | K | |
| ActivityFeed.tsx:34 | "Quiet in the house." | S | "No activity yet" |
| useGame.ts:65 | Toast "Contract done — +N coin, and the village trusts you a little more." | S | "Contract done — +N coin · +1 trust" |
| useGame.ts:70, 83 | "Reading lamp is built — +15% Scholarship speed" / "The Light is placed · 1 of 5" | K | |
| useGame.ts:85 | "The rite begins — It runs by itself, about three minutes. Stay or step away." | S | "The rite begins — 3 min · runs offline" |
| useGame.ts:163, 168, 180 | Level toasts, "Rare find: Curio", "Page deciphered: X — New recipe: Y." | K | |
| useGame.ts:177 | "Curio found (2/5) — Read it in the Grimoire." | S | "Curio found (2/5) — +3 insight" (the story is in Grimoire › Curios) |
| useGame.ts:260 | "They tell you something — <aside>" | S | "Heard: <recipe name> — <short aside>". Also record the aside on the recipe page, because today the hint vanishes with the toast (§5) |
| useGame.ts:102–123 | Feed lines ("Step done: …", "Claimed: …", "Out of an ingredient: back to …") | K | |
| App.tsx:68 | Toast "You could build the omen shelf now — A house project: omens start to turn up once it's built." | S | "Omen shelf: ready to build — optional · omens start dropping" |

### 3.12 Grimoire and Circle screens, and guidance (`screens/Grimoire.tsx`, `screens/Circle.tsx`, `guidance.ts`)

| Location | Current | Class | Proposal |
|---|---|---|---|
| Grimoire.tsx:43 | "1 · Collect insight — From wrong tries at the Circle, pages past the sixth, curios and some villagers." | S | "1 · Earn insight ✦" (the sources list sits on every recipe page) |
| Grimoire.tsx:46 | "2 · Buy a hint — Spend it on what you want: a recipe's categories, one ingredient named, or a secret's clue." | S | "2 · Buy a hint (4–6 ✦)" |
| Grimoire.tsx:49 | "3 · Try it at the Circle — It glows once per right thing. The right set makes it, and its bonus is yours for good." | S | "3 · Test at the Circle (1 glow per right item)" |
| Grimoire.tsx:55 | "✦ N insight" | K | |
| Grimoire.tsx:59 | "None left to find." / "They show here once experiments open at the Circle." | S | "None left" / "Open with experiments" |
| Grimoire.tsx:69–70 | "Gives: …" / "n/3 known" | K | |
| Grimoire.tsx:82 | "The rest of the book" | S | "Journal" (the story section, §4) |
| Grimoire.tsx:84–88 | "Grandmother's notes (n)", "Deciphered pages (n)", "Curios (n/5)", "Secrets", "The black page" | K | |
| Grimoire.tsx:104 | "Rare finds from the attic (0.5%) and grandmother's chest (1%). Each one also brings 3 insight." | S | "Attic 0.5% · Chest 1% · +3 insight each" |
| Grimoire.tsx:108 | Curio story / "Not found yet" | M | The name visible, the story collapsed (§3.3) |
| Grimoire.tsx:120–126 | Notes journal (every note's full text) | K | This is where the notes belong. Make each entry collapsed, titled with its task |
| Grimoire.tsx:138 | "N left to find. Read clues with insight, then set the Circle to Free experiment and try sets of 3." / "You found every secret in this chapter." | S | "N left · clues 4 ✦ · test sets of 3 in Free experiment" / "All found" |
| Grimoire.tsx:150 | "Ink of the Unwritten." | K | A Chapter 3 teaser name |
| Grimoire.tsx:151 | "The ink is too dark to read. Not yet." | S | "Readable in Chapter 3" |
| Grimoire.tsx:178 | "(3 things)" / "Found" | K | |
| Grimoire.tsx:182 | Found secret's rewardText | K | |
| Grimoire.tsx:190 | "No clues read yet." | C | The "Read a clue · 4 ✦" button already says it |
| Grimoire.tsx:191 | "Read a clue" / "Read another clue" | K | |
| Grimoire.tsx:213 | "Gives …" | K | |
| Grimoire.tsx:216–224 | Next-step box (see guidance.ts) | S | Headline plus button. The detail goes (below) |
| Grimoire.tsx:228–253 | "Belongs" / "Crossed out" / "Still possible" | K | |
| Grimoire.tsx:230 | "Nothing confirmed yet" | S | "—" |
| Grimoire.tsx:247 | "Nothing you hold. Gather more kinds of things." | S | "None held" |
| Grimoire.tsx:256–270 | "Hints", I/II/III, "Where each thing comes from", "Name one ingredient"/"Name another" | K | |
| Grimoire.tsx:165 | Tooltip "Needs 6 insight; you have 3." | K | |
| Grimoire.tsx:272–276 | "✦ N to spend" + sources | K | |
| Grimoire.tsx:281 | "Your tries (n)" | K | |
| Grimoire.tsx:316 | Discovered page: reveal line (italic, first) | M | Move below the facts, collapsed as "Story ▸" |
| Grimoire.tsx:325 | "What it does: …" | K | Move it to the top, as "Gives" (to match the undiscovered page) |
| Grimoire.tsx:339 | "Nothing read yet. Burnt pages turn up in the attic." | S | "None yet · burnt pages: Search the attic" |
| Grimoire.tsx:342–343 | Page title + text | M | The title visible, the text collapsed (§3.2) |
| guidance.ts:41 | "Experiments open with grandmother's next note" / "That's where you test guesses at the Circle. Until then, collect hints: they sharpen on their own." | S | "Opens with experiments" and no detail. **The detail is stale:** since the third patch, hints are bought, not sharpened |
| guidance.ts:44 | "You know all 3: make it at the Circle" / "Place exactly these in the Circle to discover it." | S | Keep the headline, cut the detail (it repeats the headline) |
| guidance.ts:48–49 | "Try any 3 things at the Circle, or buy a hint" / "Use the riddle as a guide. The Circle glows once for each right thing, and each wrong try gives +1 insight…" | S | Headline, then "1 glow per right item · wrong try +1 ✦" |
| guidance.ts:54–55 | "2 of 3 known: find the last one" / "Narrow it down: 3 things to find" / "Keep what belongs, and swap the rest for things not crossed out yet." | S | Keep the headlines. Detail: "Swap one at a time" |
| guidance.ts:44–56 | Buttons "Make it at the Circle" / "Try at the Circle" / "Keep trying at the Circle" | K | |
| guidance.ts:61–66 | INSIGHT_SOURCES ("Wrong try +1", …) | K | The model: this is exactly the style wanted |
| guidance.ts:80 | "Discovered. +10% …" | K | |
| guidance.ts:82 | "None of these belong. They're crossed out and hidden from your list." | S | "0 right · all crossed out" (update guidance.test.ts:57, which matches /crossed out/) |
| guidance.ts:83–84 | "2 of 3 right, but not which. Swap one thing at a time to find the odd one out." | S | "2 of 3 right · swap one at a time". The "but not which" honesty is a logged GRIMOIRE §9.2 choice: keep "(not which)". guidance.test.ts:58 matches it |
| guidance.ts:86 | "Two of those match a secret. Swap the third." | K | |
| guidance.ts:88 | "No secret matches that set. A secret answers only its exact 3." | S | "No match · exact set of 3 only" |
| Circle.tsx:71 | "Later, the Circle will answer smaller workings too." | S | "Experiments: open later" (or cut) |
| Circle.tsx:78–79 | "Experiments" / "Optional" | K | |
| Circle.tsx:83 | Steps "Choose what to work on" / "Pick 3 things below" / "Place them in the Circle" | K | |
| Circle.tsx:91, 102, 105 | "Hidden recipe", "Free experiment: hunt secrets (no hints)", "Dream pillow (3 things)" | K | |
| Circle.tsx:112–117 | "Gives …", "Known 1/3: Mugwort · 2 crossed out (hidden below)" | K | |
| Circle.tsx:121 | "No glow count here: only a secret's exact 3 answers." | S | "No glows · exact set only" |
| Circle.tsx:169, 179 | "empty", "Closer!" | K | |
| Circle.tsx:186, 190 | "Place in the Circle · uses 1 of each" / "Clear" | K | |
| Circle.tsx:198 | "Pick from what you hold" | S | "Your items" |
| Circle.tsx:201, 206, 226 | "Hide proven wrong", "Nothing to place yet.", "Recent attempts" | K | |

### 3.13 House, generated labels, engine refusals

| Location | Current | Class | Proposal |
|---|---|---|---|
| House.tsx:113 | "About 2h 10m to level 20" / "At level 20, the cap for now" | K | |
| House.tsx:137–139 | "Unknown recipe · Lvl 6 · Learned from a burnt page (Scholarship)." | K | |
| House.tsx:159 | "Tier 2 · Lvl 3 · 4.0s · 12 xp" | K | |
| House.tsx:176 | Buff chip tooltip = Blessing's description ("The rooms are smoked clean.") | C | Use the generated effect as the tooltip |
| House.tsx:177 | "Blessing: +10% speed, all skills for 15m" | K | |
| House.tsx:214–217 | Rates: "900 tallow/h · 1.2k xp/h · next level in 4m · inputs last 12m" | K | |
| House.tsx:66, 79, 91 | Next skill: "You choose: see the chapter tracker" / "Your choice, once this part is placed" / "Next · once the Light is placed" | K | |
| House.tsx:248–258 | Start labels: "Start", "Level 6", "Needs 2 beeswax", "Rite under way" | K | |
| effects.ts:55 | Janko: "+20% more on Chandlery" | S | "+20% Chandlery speed" ("more" is ambiguous: it is speed) |
| effects.ts:45 | "Works 36h while you're away" | S | "Offline cap 36h" |
| effects.ts:21–29 | Buff effects ("×2 Herbalism speed", "+10% speed, all skills") | K | |
| tasks.ts:25–38 | taskName ("Search the pantry ×10", "Help a villager", "Make the Light", "Perform the Kindling…") | K | |
| tasks.ts:41–47 | noteUnlocks ("New skill: X", "Opens the Grimoire") | K | |
| tasks.ts:113–123 | rewardText ("+60 XP, any skill", "Surge: ×2 speed for 20s") | K | |
| format.ts:17–30 | Stop reasons ("Out of tallow", "Needs level 6", "Recipe not yet deciphered", "The rite is under way") | K | |
| format.ts:26 | "Not yet" (skill locked) | S | "Skill locked" |
| rite.ts (engine):28 | "Grandmother's notes haven't reached the circle yet." | S | "Not unlocked yet" |
| rite.ts (engine):33 | "Your Ritualism isn't high enough yet." | S | "Needs Ritualism 3" |
| commands.ts:154 | "The circle can't find that shape yet." | S | "Recipe not available yet" |
| commands.ts, rite.ts (other refusals) | "Not enough coin.", "Needs 6 insight (you have 3).", "The Circle takes 3 things.", "Already built."… | K | Plain already. Tests match "Needs 6 insight", "isn't ready" and "omen shelf first" |
| Sanctum.tsx:55–61 | Caption, **screen-reader only** ("The house is cold and dark. Moonlight on the floorboards…") | K | This is alt text, not visible fluff. Keep it; sanctum.test.ts matches its words |

### 3.14 Dead text (in the data, never shown to a player)

Delete these, or wire them in on purpose. They're counted as C above.

- `notes.ts` `hint` on notes 1–7 (7 lines): Task card and tracker show a hint only for notes without steps.
- `rite.ts` `HEARTH_RITE.description` and `resplendentCosmetic`.
- `buffs.ts` descriptions for Still Night and Surge; `omens.ts` Still Night description.
- `followers.ts` Janko `description` and `trait.description` (`trait.name` is also unused).
- `shop.ts` both `description`s (always replaced by the generated purpose).

---

## 4. The story system

**Aim:** everything written stays in the game, is one click away, and is never in the way. The screens read like a ledger, while the art (sanctum, rosette, embroidery, icons) and the names carry the mood.

### Where story lives

**The Grimoire journal.** Rename "The rest of the book" to **Journal**. Every entry is a one-line title, collapsed by default, with ▸ to open it.

| Section | Entries (title → story) |
|---|---|
| Grandmother's notes | Task name ("Make the Light") → the note's `text` |
| Deciphered pages | Page title + "Teaches: Iron ward" → page text |
| Curios (n/5) | Curio name ("Tin whistle") → its story |
| Discoveries | Recipe name + reward → reveal line (the Threshold nail's hidden note is flagged as a plot thread) |
| The Kindling | "Performed: Fine" → the 5 phase logs, the finale, the lore and (for Resplendent) the second-circle line. The 5 `placed` lines can go here too, or be deleted |
| The black page | "Readable in Chapter 3" → the pencil line |

An unread dot on new entries (like the tab dots) lets a lore-lover find new text, without a pop-up.

**Hover titles** carry one-line flavour on the element it belongs to: keepsake flavour, a contract's full sentence, Janko's description, and a curio's story in the Curios list.

**"Story ▸" links** replace prose in modals. They sit on the Task card (to that note), the Discovery modal (to that reveal) and Chapter end (to the Kindling entry).

### What stops popping up

- No modal has a paragraph of prose. The **Task card** keeps its steps, needs and Go button (gameplay) and loses the quote. The **Discovery modal** keeps the rosette and the reward. **Chapter end** keeps the painting and the ledger.
- The **ShelfCard** and the **omen-shelf built modal** go. The tracker's side-project block, the New tag, the ready toast and the shelf panel already carry the information.
- The **rite log** becomes a 5-row phase checklist next to the rosette. The rosette's pulsing petal is the "animation" of the rite.
- Contracts show a **short label** in plain type, not an italic quote.

### Content shape (for the rewrite)

- Notes: drop `quote` and the dead `hint`s, and keep `text` (journal). Optionally rename it `story` so it's clear it's not UI copy. Note 8 and the experiments note keep a short `hint`.
- Requests: add `label` ("Nettle soup"), and keep `text` as the hover title. Asides stay (shortened) and are **also saved** to the recipe (see §5).
- Grimoire entries: `rewardText` gets short. `reveal` becomes journal text.
- Rite: `phases[].log`, `finale`, `rewards.lore` and `resplendentLore` all become journal text. `placed` and `description` are deleted.
- Keepsakes: `text` short, `flavour` as a hover title.
- Upgrades: drop `description` and render `upgradeEffect()`, plus one extra fact where needed (the omen shelf's "1st omen included").

### Decisions this would change

CLAUDE.md says to ask before diverging from a logged decision. These are the ones affected:

- **CONCEPT.md, pillar "Lore is a reward"** (line ~92). Still true, but lore becomes an opt-in reward in the journal, not something pushed at the player.
- **CONCEPT.md decision log, UI feedback round:** "Each note appears once, as a modal story beat." The Task card stays as a modal, but it's a *task* beat, not a story beat.
- **DESIGN.md §8:** the Task card's closing quote, the ShelfCard "in grandmother's voice", the omen-shelf note after building, the rite log "in grandmother's voice", the keepsake cards' "italic line of lore", and the Chapter end's finale and lore lines.
- **DESIGN.md writing rule:** "Flavour is one short line at most." It would tighten to "flavour lives in names, art, hover titles and the journal".
- **GRIMOIRE.md §9.2:** "A discovery opens its own reveal dialog with the lore line and the reward." It becomes the reward only.

---

## 5. Risks: text that puzzles rely on

The Grimoire (see `docs/GRIMOIRE.md` §6, §8) builds hidden recipes and secrets out of words. Trimming the wrong line makes a puzzle unsolvable from the free hints, so it could only be solved by buying names. That would break the goal "a puzzle fan solves it from the riddle". **These are load-bearing:**

| Text | Where | What it unlocks | Rule for the rewrite |
|---|---|---|---|
| **Riddles** (hint I) | grimoire.ts:12, 25, 38 | The only free hint for each hidden recipe | Keep word for word |
| **Mugwort: "The dream-herb."** | items.ts:20 | Links the riddle's "bitter dream-herb" to Mugwort | Keep. Also show it in the chip's tooltip |
| **St John's wort: "The Kupala herb."** | items.ts:21 | Links "the Kupala herb" (Threshold nail riddle) to St John's wort | Keep. The page title "Of the Kupala herb" and page 3's text are a second bridge |
| **Category hints and secret clues** | grimoire.ts:13, 26, 39, 50, 59 | The bought hints. Clue 1s look like flavour but are the puzzle ("bees for the light" → Beeswax candle) | Keep |
| **Villager asides** | requests.ts:15, 56, 81 | Free hints (+2 insight each): "bitter-smelling pillow" → Mugwort; "ash… salt on top" → Hearth mark; "nail… yellow flower" → Iron nail + St John's wort | Keep, shortened. **Existing gap:** today an aside appears only as an 8-second toast (useGame.ts:260) and is recorded nowhere. Save it to the recipe page under Hints ("Heard in the village: …"). This matters more once contracts lose their prose |
| **Hana's contract: "Nettle soup, for the widow Hana"** | requests.ts:10 | Anchors the Hana's soup secret (clue 1, "A soup for a widow…"; clue 2 → Nettle) | The short label must stay **"Nettle soup"**, and `from` stays "Widow Hana" |
| **"Salt keeps what is inside, inside."** | notes.ts:35 (journal) | Soft support for Hana's clue 3 "what keeps things in" → Salt | It survives in the journal. Clue 3 alone is enough for most players |
| **Page 1: "Cold iron and salt… a nail"** | pages.ts:9–10 | Soft support for the Threshold nail riddle ("cold iron under the door") | It survives in the journal. The page title "Of the iron at the door" stays visible |
| **"Something you haven't found yet"** | ItemLookup.tsx:181 | Tells the player an item belongs to an undiscovered recipe | Keep |
| **Outcome lines** | guidance.ts:82–88 | Tell the player how to read the glow count and the "almost" flicker | Shorten, but keep "(not which)" and "swap one at a time". Keep the "almost" line as it is |
| **Experiments note hint** | notes.ts:118 | The only announcement that experiments exist and how they work | Keep it on the Task card, shortened |

**Other risks**

- **"More lore" as a reward.** A Resplendent rite is sold as "choose two, and more lore" (KindlingPanel.tsx:193, CONCEPT §5.4). If lore moves to the journal, say "+1 journal entry", or drop lore from the pitch and lean on the cloth and the second keepsake.
- **Curios still give insight when read.** Collapsing their stories doesn't change that, but the toast should say "+3 insight", not "Read it in the Grimoire", so the reward is visible.
- **The Threshold nail's plot thread** (the lost child, the hidden 5th follower) is currently told only in the reveal line. When it moves to the journal, add a visible K line ("Opens: grandmother's hidden note") so the thread isn't lost.
- **Tests that match text:** guidance.test.ts:57–59 (/crossed out/, /2 of 3 right, but not which/, /10% speed/), sanctum.test.ts (caption words), grimoire.test.ts:63 (/Needs 6 insight/), rite.test.ts:69 (/isn't ready/) and village.test.ts:156 (/omen shelf first/). The rewrite needs to update these alongside the strings.
- **docs/CHAPTER1.md and GRIMOIRE.md** quote several of these strings (glow lines, reveal lines, asides). Keep them in sync when the rewrite lands.
