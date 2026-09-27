import type { ItemId } from "./items";
import type { SkillId } from "./skills";
import type { BuffDef } from "./types";

const MIN = 60_000;

export const BUFFS = {
  still_night: {
    name: "Still Night",
    durationMs: 2 * MIN,
    // You choose the skill when you release it: twice as fast, twice the chance finds.
    blessSkill: { speed: 1, chanceMultiplier: 2 },
  },
  surge: {
    name: "Surge",
    durationMs: 20_000,
    speed: { herbalism: 1, scavenging: 1, chandlery: 1, sigilcraft: 1, scholarship: 1, ritualism: 1 },
  },
  blessing: {
    name: "Blessing",
    durationMs: 15 * MIN,
    speed: { herbalism: 0.1, scavenging: 0.1, chandlery: 0.1, sigilcraft: 0.1, scholarship: 0.1, ritualism: 0.1 },
  },
  // Charms (content/charms.ts): used from Experiments or the Inventory.
  charm_window: { name: "Window charm", durationMs: 10 * MIN, findMultiplier: 1.5 },
  charm_pillow: { name: "Dream pillow", durationMs: 10 * MIN, xpBonus: 0.25 },
  charm_mark: { name: "Hearth mark", durationMs: 10 * MIN, saveChance: 0.15 },
  charm_nail: { name: "Threshold nail", durationMs: 10 * MIN, coinBonus: 0.5 },
} as const satisfies Record<string, BuffDef<SkillId, ItemId>>;

export type BuffId = keyof typeof BUFFS;

/** Widened view for engine code that reads optional fields generically. */
export const BUFF_DEFS: Record<BuffId, BuffDef<SkillId, ItemId>> = BUFFS;
