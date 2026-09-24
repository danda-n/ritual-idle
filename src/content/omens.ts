import type { BuffId } from "./buffs";
import type { OmenDef } from "./types";

// Omens drop like rare loot (online or offline), are stored on the omen shelf,
// and are released when the player chooses (docs/CHAPTER1.md §5). Never a time-lock.
export const OMENS = {
  still_night: {
    name: "Still Night",
    description: "The wind drops and the dogs stop barking. Release it for 15 minutes of quiet, clear work.",
    dropChance: 1 / 400,
    buff: "still_night",
  },
} as const satisfies Record<string, OmenDef<BuffId>>;

export type OmenId = keyof typeof OMENS;
