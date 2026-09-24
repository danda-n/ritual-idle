import { completedCount } from "../../engine/progress";
import { isDiscovered } from "../../engine/grimoire";
import { activeBuffs, omenCapacity } from "../../engine/modifiers";
import { storedOmens } from "../../engine/omens";
import type { GameState } from "../../engine/state";

// The living sanctum: grandmother's room, drawn in code as a woodcut/papercut scene.
// Everything shown is derived from real progress; nothing here changes state.

export interface SanctumView {
  lit: boolean; // candles and hearth
  salted: boolean; // salt line across the threshold
  ironed: boolean; // iron nails over the door
  circleAwake: boolean;
  cellarOpen: boolean;
  performing: boolean;
  rack: boolean;
  lamp: boolean;
  shelf: boolean;
  omens: number;
  /** Jars on the shelf: how many omens it can hold. */
  capacity: number;
  pillow: boolean;
  honey: boolean;
  janko: boolean;
  cloth: boolean;
  smoke: boolean;
}

export function sanctumView(state: GameState): SanctumView {
  const done = (id: Parameters<typeof completedCount>[1]) => completedCount(state, id) > 0;
  const has = (u: string) => (state.upgrades as string[]).includes(u);
  return {
    lit: done("tallow_candle"),
    salted: done("salt_line"),
    ironed: done("iron_ward"),
    circleAwake: done("bless_threshold") || state.rite.completed !== null,
    cellarOpen: state.rite.completed !== null,
    performing: state.rite.performing !== null,
    rack: has("drying_rack"),
    lamp: has("reading_lamp"),
    shelf: has("omen_shelf") || state.stats.omensSeen > 0,
    omens: storedOmens(state),
    capacity: omenCapacity(state),
    pillow: isDiscovered(state, "dream_pillow"),
    honey: isDiscovered(state, "honey_light"),
    janko: state.followers.includes("janko"),
    cloth: (state.rite.completed?.quality ?? 0) >= 2,
    smoke: activeBuffs(state).some((b) => b.id === "blessing"),
  };
}

/** One sentence for screen readers and the caption. */
export function describeSanctum(v: SanctumView): string {
  if (v.cellarOpen) return "The circle is awake, and the cellar door stands open. Warm light climbs the steps.";
  if (v.performing) return "The circle burns bright. The rite is under way.";
  if (v.circleAwake) return "The chalk circle in the floor glows faintly, as if it remembers you.";
  if (v.salted || v.ironed) return "Candlelight, and a line of salt across the threshold. Nothing comes in uninvited.";
  if (v.lit) return "A candle burns on grandmother's table. The room is starting to feel lived in.";
  return "The house is cold and dark. Moonlight on the floorboards, ash in the hearth.";
}

export function Sanctum({ state }: { state: GameState }) {
  const v = sanctumView(state);
  const label = describeSanctum(v);
  return (
    <figure className={`sanctum ${v.lit ? "is-lit" : "is-dark"} ${v.performing ? "is-performing" : ""}`}>
      <svg viewBox="0 0 800 260" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-950)" strokeWidth="1.6" />
          </pattern>
          <pattern id="planks" width="80" height="14" patternUnits="userSpaceOnUse">
            <rect width="80" height="14" fill="var(--ink-800)" />
            <line x1="0" y1="13.5" x2="80" y2="13.5" stroke="var(--ink-950)" strokeWidth="1.5" />
            <line x1="52" y1="0" x2="52" y2="14" stroke="var(--ink-950)" strokeWidth="1" />
          </pattern>
          <radialGradient id="candleGlow">
            <stop offset="0" stopColor="var(--gold-400)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--gold-400)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireGlow">
            <stop offset="0" stopColor="var(--ember-300)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--ember-600)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cellarGlow" cx="0.5" cy="0.2">
            <stop offset="0" stopColor="var(--gold-400)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--gold-600)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Wall, beams and floor */}
        <rect width="800" height="260" fill="var(--ink-900)" />
        <rect width="800" height="260" fill="url(#hatch)" opacity={v.lit ? 0.35 : 0.7} />
        <rect x="0" y="0" width="800" height="18" fill="var(--ink-950)" />
        <line x1="0" y1="18" x2="800" y2="18" stroke="var(--bone-500)" strokeWidth="1" opacity="0.35" />
        <rect x="0" y="205" width="800" height="55" fill="url(#planks)" />
        <line x1="0" y1="205" x2="800" y2="205" stroke="var(--bone-500)" strokeWidth="1" opacity="0.3" />

        {/* Window with moon */}
        <g transform="translate(58 38)">
          <path d="M0 110V40a50 50 0 0 1 100 0v70Z" fill="#0d1420" stroke="var(--bone-300)" strokeWidth="3" />
          <circle cx="66" cy="34" r="14" fill="var(--bone-100)" />
          <circle cx="72" cy="30" r="12" fill="#0d1420" />
          <path d="M50 -10v120M0 55h100" stroke="var(--bone-300)" strokeWidth="3" />
          <rect x="-8" y="108" width="116" height="8" fill="var(--bone-500)" />
          {v.honey && (
            <g className="honey">
              <circle cx="84" cy="98" r="18" fill="url(#candleGlow)" />
              <rect x="76" y="88" width="16" height="20" rx="3" fill="var(--gold-400)" opacity="0.85" />
              <rect x="75" y="85" width="18" height="4" fill="var(--bone-300)" />
            </g>
          )}
        </g>
        {/* Moonlight on the floor when the room is dark */}
        {!v.lit && <path d="M70 205 170 205 230 260 40 260Z" fill="var(--bone-100)" opacity="0.07" />}

        {/* Bench and dream pillow under the window */}
        <rect x="52" y="180" width="118" height="10" fill="var(--ink-600)" />
        <rect x="60" y="190" width="8" height="15" fill="var(--ink-600)" />
        <rect x="154" y="190" width="8" height="15" fill="var(--ink-600)" />
        {v.pillow && <ellipse cx="96" cy="175" rx="26" ry="8" fill="var(--bone-300)" stroke="var(--ember-600)" strokeWidth="1.5" strokeDasharray="3 2" />}

        {/* Drying rack with herb bundles */}
        {v.rack && (
          <g>
            <line x1="200" y1="30" x2="410" y2="30" stroke="var(--ink-600)" strokeWidth="5" />
            {[215, 245, 275, 305, 335, 365, 395].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="30" x2={x} y2="42" stroke="var(--bone-500)" strokeWidth="1" />
                <path d={`M${x - 7} 42h14l-4 ${22 + (i % 3) * 5}h-6Z`} fill={i % 2 ? "#6f7a45" : "#8a7a3a"} />
              </g>
            ))}
          </g>
        )}

        {/* Omen shelf with moon jars */}
        {v.shelf && (
          <g>
            <rect x="300" y="96" width="120" height="6" fill="var(--ink-600)" />
            {[318, 358, 398].slice(0, Math.max(v.capacity, v.omens)).map((x, i) => {
              const glowing = i < v.omens;
              return (
                <g key={x}>
                  {glowing && <circle cx={x} cy="84" r="16" fill="url(#candleGlow)" />}
                  <rect x={x - 7} y="76" width="14" height="20" rx="3" fill={glowing ? "var(--bone-100)" : "var(--ink-700)"} stroke="var(--bone-500)" strokeWidth="1" />
                </g>
              );
            })}
          </g>
        )}

        {/* Grandmother's table */}
        <rect x="210" y="160" width="210" height="10" fill="var(--ink-600)" />
        <rect x="222" y="170" width="10" height="35" fill="var(--ink-600)" />
        <rect x="398" y="170" width="10" height="35" fill="var(--ink-600)" />
        {v.cloth && <path d="M235 160h160l-8 18h-144Z" fill="var(--bone-100)" opacity="0.9" />}
        {v.cloth && <path d="M245 165h140" stroke="var(--ember-600)" strokeWidth="3" strokeDasharray="6 4" />}
        {/* The grimoire */}
        <path d="M300 160l-26-4v-8l26 4 26-4v8Z" fill="var(--ember-600)" />
        <path d="M300 152v8" stroke="var(--ink-950)" strokeWidth="1" />
        {/* Candles */}
        {[236, 256, 384].map((x, i) => (
          <g key={x}>
            {v.lit && <circle cx={x} cy={136 - i * 4} r="26" fill="url(#candleGlow)" />}
            <rect x={x - 4} y={140 - i * 4} width="8" height={20 + i * 4} fill="var(--bone-300)" />
            {v.lit ? (
              <path className="flame" d={`M${x} ${127 - i * 4}c4 5 4 9 0 12-4-3-4-7 0-12Z`} fill="var(--gold-400)" />
            ) : (
              <line x1={x} y1={140 - i * 4} x2={x} y2={136 - i * 4} stroke="var(--ink-950)" strokeWidth="1.5" />
            )}
          </g>
        ))}
        {/* Reading lamp */}
        {v.lamp && (
          <g>
            {v.lit && <circle cx="350" cy="130" r="30" fill="url(#candleGlow)" />}
            <path d="M338 160h24l-6-8h-12Z" fill="var(--ink-700)" />
            <rect x="346" y="126" width="8" height="26" rx="3" fill="var(--gold-600)" opacity="0.9" />
            <path d="M340 126h20l-4-8h-12Z" fill="var(--ink-700)" />
          </g>
        )}
        {/* Blessing smoke */}
        {v.smoke && (
          <g className="smoke" fill="none" stroke="var(--bone-300)" strokeWidth="2" strokeLinecap="round" opacity="0.35">
            <path d="M250 110c-10-14 10-22 0-38s8-24 0-40" />
            <path d="M380 108c10-14-10-22 0-38" />
          </g>
        )}

        {/* The threshold door, salt line and iron */}
        <g>
          <rect x="468" y="70" width="74" height="135" fill="var(--ink-950)" stroke="var(--ink-600)" strokeWidth="4" />
          <path d="M478 80h54M478 110h54M478 140h54M478 170h54" stroke="var(--ink-800)" strokeWidth="3" />
          <circle cx="532" cy="140" r="3" fill="var(--bone-500)" />
          {v.ironed && [482, 505, 528].map((x) => <path key={x} d={`M${x} 60l3 10`} stroke="var(--bone-300)" strokeWidth="3" strokeLinecap="round" />)}
          {v.salted && <path d="M462 206h86" stroke="var(--bone-100)" strokeWidth="3" strokeDasharray="2 2" />}
        </g>

        {/* The hearth */}
        <g>
          <path d="M600 205V90h160v115h-22V130a58 58 0 0 0-116 0v75Z" fill="var(--ink-700)" stroke="var(--bone-500)" strokeWidth="2" />
          <path d="M600 90h160M596 84h168" stroke="var(--bone-500)" strokeWidth="3" />
          {[110, 150, 190].map((y) => (
            <path key={y} d={`M602 ${y}h16M742 ${y}h16`} stroke="var(--ink-950)" strokeWidth="2" />
          ))}
          <rect x="622" y="130" width="116" height="75" fill="var(--ink-950)" />
          {v.lit ? (
            <g className="fire">
              <circle cx="680" cy="190" r="50" fill="url(#fireGlow)" />
              <path d="M656 205c-4-18 10-22 8-38 10 8 12 16 12 22 4-8 2-20 10-28 6 14 14 22 10 44Z" fill="var(--ember-300)" />
              <path d="M668 205c0-10 6-12 8-20 4 6 8 10 6 20Z" fill="var(--gold-400)" />
            </g>
          ) : (
            <path d="M650 205c8-6 50-6 60 0Z" fill="var(--bone-500)" opacity="0.5" />
          )}
          {/* Janko, a small papercut figure by the fire */}
          {v.janko && (
            <g fill="var(--ink-950)" stroke="var(--gold-600)" strokeWidth="1.2">
              <circle cx="588" cy="170" r="8" />
              <path d="M576 205c0-18 4-26 12-26s12 8 12 26Z" />
            </g>
          )}
        </g>

        {/* The chalk circle */}
        <g className="floor-circle">
          {(v.circleAwake || v.performing) && <ellipse cx="480" cy="232" rx="120" ry="24" fill="url(#candleGlow)" opacity={v.performing ? 1 : 0.6} />}
          <ellipse cx="480" cy="232" rx="104" ry="18" fill="none" stroke={v.circleAwake ? "var(--gold-400)" : "var(--bone-500)"} strokeWidth="2" strokeDasharray="5 4" opacity={v.circleAwake ? 1 : 0.45} />
          <ellipse cx="480" cy="232" rx="78" ry="12" fill="none" stroke={v.circleAwake ? "var(--gold-600)" : "var(--bone-500)"} strokeWidth="1" opacity={v.circleAwake ? 0.9 : 0.3} />
        </g>

        {/* The cellar trapdoor */}
        <g>
          {v.cellarOpen ? (
            <>
              <path d="M300 222h56l8 20h-72Z" fill="var(--ink-950)" />
              <path d="M300 222h56l8 20h-72Z" fill="url(#cellarGlow)" />
              <path d="M300 222l-4-34h56l4 34" fill="var(--ink-700)" stroke="var(--bone-500)" strokeWidth="1.5" />
            </>
          ) : (
            <path d="M300 222h56l8 20h-72Z" fill="var(--ink-700)" stroke="var(--ink-950)" strokeWidth="2" />
          )}
        </g>

        {/* Darkness before the first candle */}
        {!v.lit && <rect width="800" height="260" fill="var(--ink-950)" opacity="0.45" />}
      </svg>
      <figcaption className="sanctum-caption">{label}</figcaption>
    </figure>
  );
}
