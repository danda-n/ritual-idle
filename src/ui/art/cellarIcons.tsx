// Cellar and gear glyphs, from the design handoff (docs/design_handoff/reference/assets/cellar-icons.js and
// gear-icons.js): the same 24px grid, 1.75 stroke and currentColor as the rest of the set. Drafts for the
// illustrator's woodcut pass; the silhouettes are the spec. Generated from those files, so keep them in step.
import { Icon, type IconProps } from "./icons";

export const CELLAR_PATHS = {
  skrzat: "<path d=\"M7.5 8.5 5 3.5l4.2 2.6M16.5 8.5 19 3.5l-4.2 2.6\"/><circle cx=\"12\" cy=\"11\" r=\"5\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M10 10.5h.01M14 10.5h.01\"/><path d=\"M10.5 13.5c1 .7 2 .7 3 0\"/><path d=\"M9 16l-1.5 4.5M15 16l1.5 4.5\"/>",
  kikimora: "<path d=\"M12 2v20\"/><path d=\"M9 7.5c0-2 6-2 6 0v7c0 2-6 2-6 0Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M9 9.5l6 1.2M9 12.5l6 1.2\"/><path d=\"M8 19h8\"/><path d=\"M15 9c2.5.5 4 2 4.5 4.5\"/>",
  zmora: "<path d=\"M2.5 20h19\"/><path d=\"M4 20c0-2.2 1.8-3.5 4-3.5h9c2 0 3.5 1.3 3.5 3.5\"/><circle cx=\"12\" cy=\"6\" r=\"2.4\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M8.5 16.5 9 10.5c.2-1.3 1.5-2 3-2s2.8.7 3 2l.5 6\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M9 12.5 6.5 16M15 12.5l2.5 3.5\"/>",
  domovoi: "<path d=\"M6.5 9.5C7 5.5 9 3.5 12 3.5s5 2 5.5 6\"/><path d=\"M5.5 9.5h13\"/><path d=\"M10 12h.01M14 12h.01\"/><path d=\"M7 11.5c0 6 2 9.5 5 9.5s5-3.5 5-9.5\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M10 16c1.3 1 2.7 1 4 0M12 16v3\"/>",
  poultice: "<path d=\"M5.5 11c0-2.3 3-3.5 6.5-3.5s6.5 1.2 6.5 3.5l-1.2 7.5c-.3 1.6-2.7 2.5-5.3 2.5s-5-.9-5.3-2.5Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M9 7.5 12 3l3 4.5\"/><path d=\"M7 13.5h10\"/>",
  threadKnot: "<path d=\"M3.5 20.5c3-2 4.2-5 5-8.5\"/><circle cx=\"12\" cy=\"10\" r=\"3.5\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M15.5 12c1.5 2.5 2.8 5.5 5 8.5\"/><path d=\"M8.5 9c2-2.2 5-2.2 7 0\"/>",
  button: "<circle cx=\"12\" cy=\"12\" r=\"8\" fill=\"currentColor\" fill-opacity=\"0.2\"/><circle cx=\"12\" cy=\"12\" r=\"5.2\"/><path d=\"M10.5 10.5h.01M13.5 10.5h.01M10.5 13.5h.01M13.5 13.5h.01\"/>",
  spunThread: "<path d=\"M6.5 4h11M6.5 20h11\"/><path d=\"M8 4v16M16 4v16\"/><path d=\"M8 7.5l8 2.2M8 11.5l8 2.2M8 15.5l8 2.2\"/>",
  tangledLock: "<path d=\"M8 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9\"/><path d=\"M12 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9\"/><path d=\"M16 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9\"/><path d=\"M5.5 12h13\"/>",
  windowCharm: "<rect x=\"5\" y=\"3.5\" width=\"14\" height=\"17\" rx=\"1\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M12 3.5v17M5 12h14\"/><path d=\"M9 20.5v2M15 20.5v2\"/>",
  health: "<path d=\"M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 8a4 4 0 0 1 7.5 2c0 5.5-7.5 10-7.5 10Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  ward: "<path d=\"M12 3 5 6v5.5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M12 8v8M8.5 11.5h7\"/>",
  strike: "<path d=\"M12 3c3 3.8 5 6 5 9.8a5 5 0 0 1-10 0c0-2 .9-3.2 2-4.2.1 1.9 1 3 2.2 3.1 0-3-1.3-5 .8-8.7Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  speed: "<path d=\"M7 3.5h10M7 20.5h10\"/><path d=\"M8 3.5c0 4.5 4 5.5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5.5-4 8.5s4 4 4 8.5\"/><path d=\"M10 18h4\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  cellar: "<path d=\"M4.5 21V11a7.5 7.5 0 0 1 15 0v10\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M2.5 21h19\"/><path d=\"M12 3.5V21\"/><path d=\"M9.5 14h.01M14.5 14h.01\"/><path d=\"M4.5 11h15\"/>",
  lock: "<rect x=\"6\" y=\"11\" width=\"12\" height=\"9\" rx=\"1.5\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M8.5 11V8a3.5 3.5 0 0 1 7 0v3\"/>",
  saltPouch: "<path d=\"M9 7.5 7.5 4.5h9L15 7.5\"/><path d=\"M8 7.5h8\"/><path d=\"M8 7.5c-3 2.5-3.5 6-2.5 9 .8 2.5 3.4 3.5 6.5 3.5s5.7-1 6.5-3.5c1-3 .5-6.5-2.5-9\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M10 13.5h.01M13.5 15h.01M12 11.5h.01\"/>",
  ironAmulet: "<path d=\"M7 3c0 4 2 6 5 7 3-1 5-3 5-7\"/><path d=\"M12 10v1.5\"/><path d=\"M12 11.5l4 4.5-4 5-4-5Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M12 14v4\"/>",
  knife: "<path d=\"M4 20l4.5-4.5\"/><path d=\"M7 14l3 3\"/><path d=\"M9 15.5 19.5 4.5c.6 3.2-1 7-4.5 10L11.5 17Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  poker: "<path d=\"M6.5 17.5 18 6\"/><path d=\"M18 6l.8-3M18 6l3-.8\"/><circle cx=\"5\" cy=\"19\" r=\"2\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  tallowLantern: "<path d=\"M9 3.5h6M12 3.5V5.5\"/><path d=\"M7.5 7h9l-1 12h-7Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M6.5 7h11M7 19h10\"/><path d=\"M12 10.5c1.2 1.2 1.2 2.8 0 4-1.2-1.2-1.2-2.8 0-4Z\"/>",
  censer: "<path d=\"M8 3h8M12 3v3.5\"/><path d=\"M5.5 10h13c0 4.5-3 7.5-6.5 7.5S5.5 14.5 5.5 10Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M9 17.5l-1 3h8l-1-3\"/><path d=\"M10 6.5c-1 1 1 2 0 3M14 6.5c-1 1 1 2 0 3\"/>",
  shirt: "<path d=\"M9 3.5 4 6l1.5 4.5 2.5-1v11h8v-11l2.5 1L20 6l-5-2.5c-.5 1.5-1.5 2.5-3 2.5S9.5 5 9 3.5Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M9 17.5l1 1 1-1 1 1 1-1 1 1 1-1\"/>",
  herbBelt: "<path d=\"M2.5 10h19v4h-19Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><rect x=\"10\" y=\"9\" width=\"4\" height=\"6\" rx=\"0.5\"/><path d=\"M17 14v5M17 16.5c1.5 0 2.5-1 2.5-2.5\"/>",
  linen: "<path d=\"M4 6h16v12H4Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M4 9h16M4 15h16\"/><path d=\"M7 12l1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1\"/>",
  ironBlank: "<path d=\"M5 9l7-4 7 4-7 4Z\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M5 9v5l7 4 7-4V9M12 13v5\"/>",
  lanternFrame: "<path d=\"M8 4h8M12 2.5V4\"/><path d=\"M7 7h10M7 19h10M8 7v12M16 7v12M12 7v12\"/>",
  redThread: "<ellipse cx=\"11\" cy=\"12\" rx=\"5\" ry=\"7\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M6.5 9.5l9-2M6 13l10-2.5M6.5 16.5l9-2\"/><path d=\"M16 12c2 1 3 3 4 6\"/>",
  slotHand: "<path d=\"M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 5V4a1.5 1.5 0 0 1 3 0v7M14 6a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7.5-6 7.5-2.5 0-4-1.3-5.5-3.5L4 14a1.5 1.5 0 0 1 2.5-1.5L8 14\" fill=\"currentColor\" fill-opacity=\"0.2\"/>",
  anvil: "<path d=\"M4 8h13c0 2.5 1.5 3.5 3.5 3.5V8\"/><path d=\"M4 8c0 2.5 2 4 5 4h5\" fill=\"currentColor\" fill-opacity=\"0.2\"/><path d=\"M10 12v4M14 12v4M7 20h10l-2-4H9Z\"/>",
} as const;

export type CellarGlyph = keyof typeof CELLAR_PATHS;

/** One glyph from the handoff's cellar and gear sets. */
export function CellarIcon({ glyph, ...p }: IconProps & { glyph: CellarGlyph }) {
  return (
    <Icon {...p}>
      <g dangerouslySetInnerHTML={{ __html: CELLAR_PATHS[glyph] }} />
    </Icon>
  );
}
