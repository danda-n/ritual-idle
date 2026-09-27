import type { SkillId } from "./skills";

// Followers help; they are not a management game (docs/CONCEPT.md, Q3).
// Chapter 1 has only "assist me": the follower speeds up whatever you're doing.
export const FOLLOWERS = {
  janko: {
    name: "Janko",
    /** One line of flavour: the hover title on his chapter-end row. */
    description: "A village orphan who heard the circle wake.",
    rank: "Initiate",
    /** Speed bonus to your current action. */
    assist: 0.3,
    /** Extra speed on one skill (its effect line is generated in src/ui/effects.ts). */
    trait: { skill: "chandlery" as SkillId, bonus: 0.2 },
  },
} as const;

export type FollowerId = keyof typeof FOLLOWERS;
