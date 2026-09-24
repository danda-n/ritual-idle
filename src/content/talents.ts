import type { SkillId } from "./skills";

// Skill talents (docs/CHAPTER1.md §13). Every skill has the same three branches, 3 ranks each,
// plus one keystone of its own that opens after 3 points in any one branch.
// A point arrives every POINT_EVERY levels. Resetting is free.

export const POINT_EVERY = 3;
export const KEYSTONE_NEEDS = 3;

export const BRANCHES = {
  swift: { name: "Swift", maxRank: 3, perRank: 0.05, effect: "speed" },
  plenty: { name: "Plenty", maxRank: 3, perRank: 0.05, effect: "extra_output" },
  fortune: { name: "Fortune", maxRank: 3, perRank: 0.03, effect: "critical" },
} as const satisfies Record<string, { name: string; maxRank: number; perRank: number; effect: string }>;

export type BranchId = keyof typeof BRANCHES;
export const BRANCH_IDS = Object.keys(BRANCHES) as BranchId[];

/** What a branch does at a rank, in plain words. */
export function branchText(id: BranchId, rank: number): string {
  const pct = Math.round(BRANCHES[id].perRank * rank * 100);
  switch (id) {
    case "swift":
      return `+${pct}% speed`;
    case "plenty":
      return `${pct}% chance of 1 extra of each sure output`;
    case "fortune":
      return `${pct}% chance of a critical: double output and XP`;
  }
}

export type KeystoneEffect =
  /** Chance that guaranteed outputs come doubled. */
  | { kind: "double_output"; chance: number }
  /** Chance-based finds are this much more likely. */
  | { kind: "find_chance"; multiplier: number }
  /** Every nth completion of an action gives 1 extra of its sure outputs. */
  | { kind: "every_nth"; n: number }
  /** Chance a repetition uses no inputs. */
  | { kind: "save_inputs"; chance: number }
  /** Insight toward a hidden recipe from each completion (deciphering). */
  | { kind: "insight"; amount: number }
  /** Extra XP, as a fraction. */
  | { kind: "xp_bonus"; bonus: number };

export interface KeystoneDef {
  name: string;
  text: string;
  effect: KeystoneEffect;
}

export const KEYSTONES: Record<SkillId, KeystoneDef> = {
  scavenging: { name: "Keen eye", text: "Chance finds are 50% more likely.", effect: { kind: "find_chance", multiplier: 1.5 } },
  chandlery: { name: "Long-burning", text: "10% of what you pour comes in pairs.", effect: { kind: "double_output", chance: 0.1 } },
  sigilcraft: { name: "Steady hand", text: "15% of workings use no materials.", effect: { kind: "save_inputs", chance: 0.15 } },
  herbalism: { name: "Dew-picked", text: "Every 5th pick gives 1 extra.", effect: { kind: "every_nth", n: 5 } },
  scholarship: { name: "Marginalia", text: "Each page deciphered gives +1 insight toward a hidden recipe.", effect: { kind: "insight", amount: 1 } },
  ritualism: { name: "Devout", text: "Minor rites give 25% more XP.", effect: { kind: "xp_bonus", bonus: 0.25 } },
};
