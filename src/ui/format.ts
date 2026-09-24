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
  return reason.kind === "missing_input" ? `Out of ${itemName(reason.item).toLowerCase()}` : `Needs level ${reason.level}`;
}
