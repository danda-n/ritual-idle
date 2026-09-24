// A tiny event bus for moments of feedback (floating "+1 Ash", "+12 coin", level-ups...).
// Game code emits; the Floats layer and a few components listen. Nothing here touches state.

export type FxTone = "item" | "rare" | "coin" | "level" | "good";

export type FxEvent =
  /** A short label that rises from the first element found among `anchors` (CSS selectors, in order). */
  | { kind: "float"; text: string; anchors: string[]; tone: FxTone }
  /** Something just unlocked (an action row to highlight). */
  | { kind: "unlocked"; ids: string[] }
  /** A request slot was just helped. */
  | { kind: "helped"; slot: number }
  /** A Kindling part was just placed in the Circle. */
  | { kind: "placed"; part: string };

type Listener = (e: FxEvent) => void;
const listeners = new Set<Listener>();

export function emitFx(e: FxEvent): void {
  for (const l of listeners) l(e);
}

export function onFx(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
