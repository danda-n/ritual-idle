import type { SkillId } from "./skills";

// Followers help; they are not a management game (docs/CONCEPT.md, Q3).
// Chapter 1 has only "assist me": the follower speeds up whatever you're doing.
export const FOLLOWERS = {
  janko: {
    name: "Janko",
    description: "A village orphan who heard the circle wake. He sleeps by the hearth.",
    rank: "Initiate",
    /** Speed bonus to your current action. */
    assist: 0.3,
    trait: { name: "Hearth-born", description: "+20% more on Chandlery.", skill: "chandlery" as SkillId, bonus: 0.2 },
  },
} as const;

export type FollowerId = keyof typeof FOLLOWERS;
