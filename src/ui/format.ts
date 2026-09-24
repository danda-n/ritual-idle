import { ITEMS, type ItemId } from "../content/items";
import type { StopReason } from "../engine/simulate";

export function itemName(id: ItemId): string {
  return ITEMS[id].name;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (totalMin > 0) return `${m}m`;
  return `${Math.max(1, Math.round(ms / 1000))}s`;
}

export function formatStop(reason: StopReason): string {
  switch (reason.kind) {
    case "missing_input":
      return `Out of ${itemName(reason.item).toLowerCase()}`;
    case "level_too_low":
      return `Needs level ${reason.level}`;
    case "recipe_unknown":
      return "Recipe not yet deciphered";
    case "skill_locked":
      return "Not yet";
    case "rite_in_progress":
      return "The rite is under way";
  }
}

/** mm:ss (or h:mm:ss) for countdowns. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** Compact rates: 1,200 → "1.2k", 45.2 → "45". */
export function formatRate(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}
