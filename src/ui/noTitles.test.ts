import { describe, expect, it } from "vitest";

// The game never uses the browser's own tooltips (the `title` attribute): they're slow, plain and
// distracting. Detail goes in a <Tip>; anything the player needs is written on screen. Component
// props named `title` (Modal, PlaceHero, SkillPicker) are fine: only DOM elements are checked.
const files = import.meta.glob("./**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

describe("no native tooltips", () => {
  it("no DOM element in the UI has a title attribute", () => {
    expect(Object.keys(files).length).toBeGreaterThan(20);
    const found: string[] = [];
    for (const [path, src] of Object.entries(files)) {
      for (const m of src.matchAll(/\stitle=/g)) {
        // The tag this attribute belongs to: the nearest "<name" before it.
        const before = src.slice(0, m.index);
        const tag = [...before.matchAll(/<([A-Za-z][\w.]*)/g)].pop()?.[1] ?? "";
        if (/^[a-z]/.test(tag)) found.push(`${path}: <${tag} title=…>`);
      }
    }
    expect(found).toEqual([]);
  });
});
