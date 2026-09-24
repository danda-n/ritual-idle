import { BUFF_DEFS, type BuffId } from "../content/buffs";
import { FOLLOWERS, type FollowerId } from "../content/followers";
import { ITEMS, type ItemId } from "../content/items";
import { SHOP, type UpgradeId } from "../content/shop";
import { SKILLS, SKILL_IDS, type SkillId } from "../content/skills";
import type { UpgradeEffect } from "../content/types";
import { formatDuration } from "./format";

// Plain statements of what things do, generated from the game data so they can never
// drift from the real numbers. Lead with these; flavour text comes second, if at all.

const pct = (n: number) => `+${Math.round(n * 100)}%`;
const skillName = (s: string) => SKILLS[s as SkillId]?.name ?? s;

/** What a buff does, in plain words. For a skill blessing, `skill` names the blessed skill. */
export function buffEffects(id: BuffId, skill?: SkillId): string[] {
  const def = BUFF_DEFS[id];
  const out: string[] = [];
  if (def.blessSkill) {
    const b = def.blessSkill;
    if (skill) out.push(`×${1 + b.speed} ${skillName(skill)} speed`, `${skillName(skill)} chance finds ×${b.chanceMultiplier}`);
    else out.push(`×${1 + b.speed} speed on one skill you choose`, `Chance finds ×${b.chanceMultiplier} in that skill`);
  }
  const speed = Object.entries(def.speed ?? {}) as [SkillId, number][];
  if (speed.length === SKILL_IDS.length && new Set(speed.map(([, v]) => v)).size === 1) out.push(`${pct(speed[0]![1])} speed, all skills`);
  // The Major Rite has a fixed length, so Ritualism speed only helps minor rites.
  else for (const [skill, bonus] of speed) out.push(`${pct(bonus)} ${skillName(skill)} speed${skill === "ritualism" ? " (minor rites)" : ""}`);
  for (const [item, mult] of Object.entries(def.chanceMultiplier ?? {}) as [ItemId, number][]) out.push(`${ITEMS[item].name}s ×${mult} as likely`);
  return out;
}

export function buffDuration(id: BuffId): string {
  return formatDuration(BUFF_DEFS[id].durationMs);
}

export function upgradeEffect(effect: UpgradeEffect): string {
  switch (effect.kind) {
    case "speed":
      return `${pct(effect.bonus)} ${skillName(effect.skill)} speed`;
    case "extra_yield":
      return `${pct(effect.chance)} ${skillName(effect.skill)} yield`;
    case "omen_capacity":
      return `Holds ${effect.capacity} omens`;
    case "offline_cap":
      return `Works ${effect.hours}h while you're away`;
  }
}

export function upgradeEffectFor(id: UpgradeId): string {
  return upgradeEffect(SHOP[id].effect);
}

export function followerEffects(id: FollowerId): string[] {
  const f = FOLLOWERS[id];
  return [`${pct(f.assist)} speed to whatever you do`, `${pct(f.trait.bonus)} more on ${skillName(f.trait.skill)}`];
}
