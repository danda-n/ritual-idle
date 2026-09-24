// XP curve from docs/CHAPTER1.md §10: XP to next level = BASE × GROWTH^(level − 1), eased for levels 1–3.

export const XP_BASE = 245;
export const XP_GROWTH = 1.14;
export const MAX_LEVEL = 99;

/** The first levels come quicker (a ramp on levels 1–3), so the opening minutes move. */
export const EARLY_RAMP = [0.35, 0.55, 0.8] as const;

export function xpToNext(level: number): number {
  return Math.floor(XP_BASE * XP_GROWTH ** (level - 1) * (EARLY_RAMP[level - 1] ?? 1));
}

const TOTAL_XP: number[] = [0, 0]; // TOTAL_XP[L] = total XP needed to reach level L
for (let l = 1; l < MAX_LEVEL; l++) TOTAL_XP.push(TOTAL_XP[l]! + xpToNext(l));

export function xpForLevel(level: number): number {
  return TOTAL_XP[Math.min(Math.max(level, 1), MAX_LEVEL)]!;
}

export function levelForXp(xp: number, cap: number): number {
  let level = 1;
  while (level < cap && xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** Progress (0–1) through the current level; 1 when sitting at the cap. */
export function levelProgress(xp: number, cap: number): number {
  const level = levelForXp(xp, cap);
  if (level >= cap) return 1;
  const start = xpForLevel(level);
  return (xp - start) / (xpForLevel(level + 1) - start);
}
