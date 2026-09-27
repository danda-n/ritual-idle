import { BUFF_DEFS, type BuffId } from "../content/buffs";
import { FOLLOWERS, type FollowerId } from "../content/followers";
import { ITEMS, type ItemId } from "../content/items";
import { OMENS, type OmenId } from "../content/omens";
import { UPGRADE_DEFS, type UpgradeId } from "../content/upgrades";
import { SKILLS, SKILL_IDS, type SkillId } from "../content/skills";
import type { UpgradeEffect } from "../content/types";
import { ACTION_DEFS, type ActionId } from "../content/actions";
import type { TalentDef, TalentEffect } from "../content/talents";
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
  if (def.findMultiplier) out.push(`Chance finds ×${def.findMultiplier}, all skills`);
  if (def.xpBonus) out.push(`${pct(def.xpBonus)} XP, all skills`);
  if (def.saveChance) out.push(`${Math.round(def.saveChance * 100)}% of crafts use no inputs`);
  if (def.coinBonus) out.push(`Contracts pay ${pct(def.coinBonus)} coin`);
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
    case "find":
      return `${ITEMS[effect.item as ItemId].name} finds ×${effect.multiplier}`;
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

// ---------- Talents ----------

const actionName = (id: ActionId) => ACTION_DEFS[id].name;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
/** A chance as a percent: whole numbers, with one decimal under 10% (5% → 7.5%). */
const round = (n: number) => `${n < 0.1 ? Math.round(n * 1000) / 10 : Math.round(n * 100)}%`;

/**
 * What a talent effect does, generated from its numbers, in the same words everywhere:
 * "bulk" (always 2 per action, but slower) and "double" (a chance of twice as much) never read alike.
 * `skill` is the skill the talent belongs to.
 */
export function talentEffect(effect: TalentEffect, skill: SkillId): string {
  const own = SKILLS[skill].name;
  switch (effect.kind) {
    case "speed":
      return `${pct(effect.bonus)} ${skillName(effect.skill ?? skill)} speed`;
    case "xp":
      return `${pct(effect.bonus)} ${skillName(effect.skill ?? skill)} XP`;
    case "find":
      // Just the multiplier: the recipe rows show what it does to each chance.
      return effect.item ? `${ITEMS[effect.item].name} ×${effect.multiplier} as likely` : `${own} chance finds ×${effect.multiplier}`;
    case "bulk": {
      // Only the main output doubles; chance finds still roll once.
      const rolls = effect.actions.some((a) => ACTION_DEFS[a].outputs.some((o) => o.chance !== undefined));
      const what = `${list(effect.actions.map(actionName))}: makes 2 per action instead of 1, XP ×2${rolls ? " (chance finds still roll once)" : ""}`;
      if (effect.slower <= 0) return `${what}, no extra time`;
      const perHour = 2 / (1 + effect.slower) - 1;
      return `${what} · each takes ${round(effect.slower)} longer, so ${perHour >= 0 ? "+" : ""}${round(perHour)} per hour`;
    }
    case "double":
      return `${round(effect.chance)} of ${own} actions give double output and XP`;
    case "extra":
      return `${round(effect.chance)} chance of +1 of each sure ${own} output`;
    case "everyNth":
      return `Every ${effect.n}th ${own} action gives +1 of each sure output`;
    case "thrift": {
      const was = ACTION_DEFS[effect.action].inputs[effect.item] ?? 0;
      const now = Math.max(0, was - effect.less);
      return `${actionName(effect.action)}: ${now === 0 ? `no ${ITEMS[effect.item].name.toLowerCase()}` : `${now} ${ITEMS[effect.item].name.toLowerCase()}`} (was ${was})`;
    }
    case "save": {
      const crafts = Object.entries(ACTION_DEFS).filter(([, a]) => a.skill === skill && Object.keys(a.inputs).length > 0).map(([id]) => id);
      const all = crafts.every((id) => effect.actions.includes(id as ActionId));
      return all ? `${round(effect.chance)} of ${own} crafts use no inputs` : `${list(effect.actions.map(actionName))}: ${round(effect.chance)} chance to use no inputs`;
    }
    case "byproduct":
      return `${list(effect.actions.map(actionName))}: ${round(effect.chance)} chance of +1 ${ITEMS[effect.item].name.toLowerCase()}`;
    case "insight":
      return `${actionName(effect.action)}: +${effect.amount} insight each`;
    case "buffLength": {
      const buffs = [...new Set(Object.values(ACTION_DEFS).filter((a) => a.skill === skill && a.buff).map((a) => a.buff as BuffId))];
      if (buffs.length === 0) return `${own} buffs last ×${effect.multiplier}`;
      return buffs.map((b) => `${BUFF_DEFS[b].name} lasts ×${effect.multiplier} (${formatDuration(BUFF_DEFS[b].durationMs)} → ${formatDuration(BUFF_DEFS[b].durationMs * effect.multiplier)})`).join(" · ");
    }
    case "omenChance":
      return `Omens ×${effect.multiplier} as likely, from any work`;
  }
}

/** A talent's full text: each effect, generated, joined. */
export function talentText(t: TalentDef, skill: SkillId): string {
  return t.effects.map((e) => talentEffect(e, skill)).join(" · ");
}
