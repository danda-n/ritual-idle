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
  return `${Math.floor(ms / 1000)}s`;
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
