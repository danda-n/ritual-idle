import type { BuffId } from "./buffs";
import type { OmenDef } from "./types";

// Omens drop like loot (online or offline), about every 4–5 minutes of work, are stored on the
// omen shelf, and are released when the player chooses: a short, strong push on one skill
// (docs/CHAPTER1.md §5). Never a time-lock.
export const OMENS = {
  still_night: {
    name: "Still Night",
    description: "The wind drops and the dogs stop barking.",
    dropChance: 1 / 100,
    buff: "still_night",
  },
} as const satisfies Record<string, OmenDef<BuffId>>;

export type OmenId = keyof typeof OMENS;
