import type { ItemId } from "./items";
import type { SkillId } from "./skills";
import type { BuffDef } from "./types";

const MIN = 60_000;

export const BUFFS = {
  still_night: {
    name: "Still Night",
    description: "Scholarship and Ritualism go 50% faster, and burnt pages turn up twice as often.",
    durationMs: 15 * MIN,
    speed: { scholarship: 0.5, ritualism: 0.5 },
    chanceMultiplier: { burnt_page: 2 },
  },
  blessing: {
    name: "Blessing",
    description: "The rooms are smoked clean: every skill goes 10% faster.",
    durationMs: 15 * MIN,
    speed: { herbalism: 0.1, scavenging: 0.1, chandlery: 0.1, sigilcraft: 0.1, scholarship: 0.1, ritualism: 0.1 },
  },
} as const satisfies Record<string, BuffDef<SkillId, ItemId>>;

export type BuffId = keyof typeof BUFFS;

/** Widened view for engine code that reads optional fields generically. */
export const BUFF_DEFS: Record<BuffId, BuffDef<SkillId, ItemId>> = BUFFS;
