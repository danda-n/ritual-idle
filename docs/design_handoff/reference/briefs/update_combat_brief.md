UPDATE TO THE COMBAT BRIEF: gear and a new Crafting skill replace the consumable loadout.

WHAT CHANGED IN THE DESIGN
- The four consumable slots (Ward, Light, Remedy, Charm), where wards and candles burned per foe, are gone.
- Instead the player wears GEAR: five durable slots, each holding one PIECE that is never used up:
  - Amulet: gives Ward (softens blows) and a tag
  - Hand: gives Strike (how hard you hit) and a tag
  - Lantern: gives Strike and a tag
  - Garment: gives Health and softer special attacks
  - Belt: holds remedies
  Plus one Charm (as before).
- Weakness now works through the pieces' tags. If the Hand or Lantern carries the foe's feared tag, your blows are x1.5. If the Amulet does, its blows are halved.
- Consumables are now very small: only REMEDIES (one kind, carried in the Belt, used by the healing rule) and the charm. Remedies are a help, not a need: you "catch your breath" between foes. So drop every "supplies left" readout. Show only "Remedies left" (and only when remedies are carried), plus the charm's uses left.
- A fight now ends only when you stop or you're driven off. Remove the "a supply ran out" end state.
- Losing costs the remedies used on that foe and its loot. Gear is never lost.

A NEW SKILL: CRAFTING (it makes the gear)
- Crafting is a skill like the others on the House tab. Its page has the usual recipe rows (repeatable COMPONENTS: stitched linen, iron blank, lantern frame, red thread, red thread knot) and its talents.
- Its page also opens a new CRAFTING WINDOW, a large dialog or panel. This is a new screen to design and should make crafting feel good:
  1. Choose a slot (Amulet, Hand, Lantern, Garment, Belt), then a piece from that slot's list. Locked pieces show their Crafting level.
  2. The piece's card:
     - base stats by TIER
     - its FIXED AFFIX (its identity: a tag or trait, always the same)
     - its RANDOM AFFIX slot, with the pool it rolls from and each option's value range (e.g. "Strike +1-2 · Speed +3-5% · telling blows +2-3%")
     - its SET if any
     - the materials with have/need (short ones in the existing red "short" chip style)
     - one red Craft button
  3. The roll: after Craft, the random slot shows 2 OPTIONS side by side (3 once a Cellar project, the Workbench, is built), each with its rolled value. The player CHOOSES ONE, and the piece is done.
     - This is the moment of surprise: a short, satisfying reveal that stays calm and readable. With reduced motion, it shows without animation.
     - A strong roll may be marked "high roll" in words. Never gold: gold means rare only.
  4. A piece already held can be:
     - REFORGED: re-roll its random affix, the new options beside the current one, with a clear "Keep the old one"
     - UPGRADED IN PLACE to the next tier, showing what it adds and costs. Tier 2 is locked for now: "Chapter II materials".
  States to show: nothing crafted yet · choosing between 2 options · between 3 · reforging (old vs new) · upgrade locked · not enough materials.
- Tiers: tier 1 pieces have 1 fixed + 1 random affix. Later tiers grow to 2 fixed + 2 random, so the card layout must fit up to four affix lines.
- Sets: matching pieces give a set bonus, shown on the gear panel. Example: "Grandmother's set · 3 pieces: +10% Ward · the first special attack each fight misses".

LAYOUT CHANGES
- Cellar tab, the chosen foe's column: replace "the loadout (four slots)" with a GEAR PANEL:
  - the five slots, each showing its piece (icon, name, tier, tag, and each affix on its own line)
  - a mark where a piece's tag matches this foe's known weakness
  - the set bonus when two or more pieces match
  - remedies (kind, count, "Belt holds 13") and the charm
  - an empty slot says so in words
  Keep the healing line, the readiness tag, "Same as last time" and saved loadouts, and the red Begin button.
- The slot picker now lists PIECES the player holds for that slot: icon, name, tier, tag, affixes, and a weakness-match mark. The same picker style is used for the remedy and the charm. One quiet link at the bottom: "Make more: Crafting ›".
- Running fight: "supplies left per slot" becomes "remedies left · charm uses left". Everything else stays.
- The introduction dialog, section 3, becomes "Gear": the five slots, and Crafting makes the pieces (choose one of the rolled options for each random affix). Section 6 "Losing" says it costs remedies and that foe's loot, never gear.
- Deliver a crafting.html next to cellar.html.

NEW ART TO ADD TO THE LIST
- Gear pieces: salt pouch, iron amulet, iron knife, hearth poker, tallow lantern, censer, embroidered shirt (red cross-stitch border), herb belt.
- Components: stitched linen, iron blank, lantern frame, red thread.
- The five slot glyphs: Amulet, Hand, Lantern, Garment, Belt.
- A skill colour for Crafting as well as Warding: distinct from each other and from the six existing skill colours.
- The four foe portraits are attached (woodcut style). Use them on the foe cards, the boss card and the Bestiary, and derive small glyphs from them.

NEW MOCK DATA (replaces the loadout mock)
- Player: Warding 7, Crafting 8, Health 73 (52 from level, +15 shirt, +6 pouch).
- Gear:
  - Amulet: Salt pouch, tier 1 (Ward 10 · salt · Health +6)
  - Hand: Iron knife, tier 1 (Strike 5 · iron · Speed +4%)
  - Lantern: Tallow lantern, tier 1 (Strike 3 · fire · loot chances +12%)
  - Garment: Embroidered shirt, tier 1 (Health +15 · special attacks −20% · +1 Health per foe beaten)
  - Belt: Herb belt, tier 1 (holds 10 · remedies heal +10% · holds +3)
  - Set: Grandmother's set, 3 pieces (+10% Ward · the first special attack each fight misses)
- Remedies: chamomile x13 (heals 4). Charm: Window charm (63 uses left). Healing line: 40%.
- Running fight: Skrzat 11/20, you 68/73. Last blows: "You 6.9" · "Skrzat 1.3" · "You 12.4 · telling blow" · "Skrzat 1.5".
- Crafting window mock: crafting a Censer (Crafting 6).
  - Base Strike 4, fixed affix: smoke.
  - Rolled options: "Strike +2 (high roll)" and "Warding XP +7%".
  - Materials: 1 lantern frame (have 2), 2 mugwort incense (have 1: short).

NEW WORDS (use exactly): Crafting · gear · piece · tier · affix (fixed, random) · set · reforge · upgrade · component · Amulet, Hand, Lantern, Garment, Belt. Buttons: Craft · Choose · Reforge · Keep the old one · Upgrade.
REMOVED WORDS: Ward / Light / Remedy as slot names ("Ward" stays as a stat), supplies, "Supplies last about N foes".