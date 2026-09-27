import { BUFF_DEFS, type BuffId } from "../content/buffs";
import { FOLLOWERS, type FollowerId } from "../content/followers";
import { ITEMS, type ItemId } from "../content/items";
import { OMENS, type OmenId } from "../content/omens";
import { UPGRADE_DEFS, type UpgradeId } from "../content/upgrades";
import { SKILLS, SKILL_IDS, type SkillId } from "../content/skills";
import type { UpgradeEffect } from "../content/types";
import { formatDuration } from "./format";

// Plain statements of what things do, generated from the game data so they can never
// drift from the real numbers. Lead with these; flavour lives in names, art, hover titles and the
// Grimoire journal.

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
      return `Offline cap ${effect.hours}h`;
  }
}

export function upgradeEffectFor(id: UpgradeId): string {
  return upgradeEffect(UPGRADE_DEFS[id].effect);
}

export function followerEffects(id: FollowerId): string[] {
  const f = FOLLOWERS[id];
  return [`${pct(f.assist)} speed on your current action`, `${pct(f.trait.bonus)} ${skillName(f.trait.skill)} speed`];
}

/**
 * The toast for a finished project: what it does, and for an omen shelf, what's stored and what
 * blessing a skill gives ("Holds 2 omens · 1 Still Night stored · bless a skill: ×2 speed, 2m").
 */
export function builtText(id: UpgradeId, stored: Partial<Record<OmenId, number>>): string {
  const parts = [upgradeEffectFor(id)];
  if (UPGRADE_DEFS[id].effect.kind === "omen_capacity") {
    for (const [omen, n] of Object.entries(stored) as [OmenId, number][]) {
      if (!n) continue;
      const buff = BUFF_DEFS[OMENS[omen].buff];
      parts.push(`${n} ${OMENS[omen].name} stored`);
      if (buff.blessSkill) parts.push(`bless a skill: ×${1 + buff.blessSkill.speed} speed, ${buffDuration(OMENS[omen].buff)}`);
    }
  }
  return parts.join(" · ");
}
