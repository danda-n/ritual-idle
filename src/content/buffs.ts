import type { ItemId } from "./items";
import type { SkillId } from "./skills";
import type { BuffDef } from "./types";

const MIN = 60_000;

export const BUFFS = {
  still_night: {
    name: "Still Night",
    description: "The house holds its breath.",
    durationMs: 15 * MIN,
    // You choose the skill when you release it.
    blessSkill: { speed: 0.5, chanceMultiplier: 2 },
  },
  surge: {
    name: "Surge",
    description: "A step done; the work flies.",
    durationMs: 20_000,
    speed: { herbalism: 1, scavenging: 1, chandlery: 1, sigilcraft: 1, scholarship: 1, ritualism: 1 },
  },
  blessing: {
    name: "Blessing",
    description: "The rooms are smoked clean.",
    durationMs: 15 * MIN,
    speed: { herbalism: 0.1, scavenging: 0.1, chandlery: 0.1, sigilcraft: 0.1, scholarship: 0.1, ritualism: 0.1 },
  },
} as const satisfies Record<string, BuffDef<SkillId, ItemId>>;

export type BuffId = keyof typeof BUFFS;

/** Widened view for engine code that reads optional fields generically. */
export const BUFF_DEFS: Record<BuffId, BuffDef<SkillId, ItemId>> = BUFFS;
