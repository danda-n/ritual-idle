import { useState, type KeyboardEvent } from "react";
import type { SkillId } from "../../content/skills";
import { BRANCHES, branchText, KEYSTONE_NEEDS, KEYSTONES, type BranchId } from "../../content/talents";
import type { GameState } from "../../engine/state";
import { canSpend, keystoneOpen, rankOf } from "../../engine/talents";
import { SkillIcon } from "../art/icons";

/**
 * A skill's talents as an embroidered tree of life: the skill at the root, a trunk rising to the
 * keystone flower, and four curling branches of three nodes each. Taken nodes fill with the
 * skill's colour; the next one you can take pulses; the flower blooms (free) when a branch is full.
 */

type Pt = [number, number];
const ROOT: Pt = [180, 262];
const CROWN: Pt = [180, 46];

/** Where each branch leaves the trunk and where its three nodes sit. */
const LAYOUT: Record<BranchId, { from: Pt; nodes: [Pt, Pt, Pt]; label: Pt; anchor: "start" | "end" }> = {
  tending: { from: [180, 214], nodes: [[136, 204], [98, 184], [66, 154]], label: [52, 132], anchor: "start" },
  swift: { from: [180, 146], nodes: [[138, 132], [104, 108], [80, 76]], label: [66, 56], anchor: "start" },
  plenty: { from: [180, 146], nodes: [[222, 132], [256, 108], [280, 76]], label: [294, 56], anchor: "end" },
  fortune: { from: [180, 214], nodes: [[224, 204], [262, 184], [294, 154]], label: [308, 132], anchor: "end" },
};

/** A smooth curve from the trunk through a branch's nodes. */
function branchPath(from: Pt, nodes: Pt[]): string {
  const pts = [from, ...nodes];
  let d = `M${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) {
    const y0 = pts[i - 1]![1];
    const [x1, y1] = pts[i]!;
    // Out first, then up: the limb curls upward like an embroidered vine.
    d += ` Q${x1} ${y0} ${x1} ${y1}`;
  }
  return d;
}

export function TalentTree({ state, skill, onTake }: { state: GameState; skill: SkillId; onTake: (b: BranchId) => void }) {
  const [focus, setFocus] = useState<{ branch: BranchId; rank: number } | "keystone" | null>(null);
  const bloomed = keystoneOpen(state, skill);
  const key = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const caption =
    focus === "keystone"
      ? `${KEYSTONES[skill].name}: ${KEYSTONES[skill].text} ${bloomed ? "(bloomed)" : `Blooms free when any branch has ${KEYSTONE_NEEDS} points.`}`
      : focus
        ? `${BRANCHES[focus.branch].name} ${focus.rank}: ${branchText(focus.branch, focus.rank)}`
        : "Point at a node to see what it does. Click a glowing one to take it.";

  return (
    <div className="talent-tree" data-skill={skill}>
      <svg viewBox="0 0 360 290" role="group" aria-label="Talent tree">
        {/* Trunk: a stitched line from the root to the crown */}
        <path className="tree-trunk" d={`M${ROOT[0]} ${ROOT[1] - 18} C 172 200, 188 120, ${CROWN[0]} ${CROWN[1] + 22}`} />
        {(Object.keys(LAYOUT) as BranchId[]).map((b) => {
          const L = LAYOUT[b];
          const rank = rankOf(state, skill, b);
          return (
            <g key={b} className="tree-branch">
              <path className={`tree-limb ${rank > 0 ? "is-grown" : ""}`} d={branchPath(L.from, L.nodes)} />
              {/* A few embroidered leaves along the limb */}
              {L.nodes.map(([x, y], i) => (
                <ellipse key={`leaf${i}`} className="tree-leaf" cx={x + (L.anchor === "start" ? 8 : -8)} cy={y + 12} rx="5" ry="2.2" transform={`rotate(${L.anchor === "start" ? -30 : 30} ${x} ${y})`} />
              ))}
              <text className="tree-label" x={L.label[0]} y={L.label[1]} textAnchor={L.anchor === "start" ? "start" : "end"}>
                {BRANCHES[b].name}
              </text>
              {L.nodes.map(([x, y], i) => {
                const r = i + 1;
                const taken = r <= rank;
                const next = r === rank + 1 && canSpend(state, skill, b) === null;
                const label = `${BRANCHES[b].name} ${r}: ${branchText(b, r)}${taken ? " (taken)" : next ? " (take it)" : ""}`;
                return (
                  <g
                    key={r}
                    className={`tree-node ${taken ? "is-taken" : next ? "is-next" : "is-locked"}`}
                    role="button"
                    tabIndex={next ? 0 : -1}
                    aria-label={label}
                    aria-disabled={!next}
                    onMouseEnter={() => setFocus({ branch: b, rank: r })}
                    onFocus={() => setFocus({ branch: b, rank: r })}
                    onMouseLeave={() => setFocus(null)}
                    onClick={() => next && onTake(b)}
                    onKeyDown={key(() => next && onTake(b))}
                  >
                    <title>{label}</title>
                    <circle cx={x} cy={y} r="12" />
                    <text x={x} y={y + 4} textAnchor="middle" className="tree-node-rank">
                      {r}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* The keystone: a flower crowning the trunk, blooming once a branch is full */}
        <g
          className={`tree-crown ${bloomed ? "is-bloomed" : ""}`}
          role="img"
          aria-label={`Keystone ${KEYSTONES[skill].name}: ${KEYSTONES[skill].text}${bloomed ? " (bloomed)" : ""}`}
          tabIndex={0}
          onMouseEnter={() => setFocus("keystone")}
          onFocus={() => setFocus("keystone")}
          onMouseLeave={() => setFocus(null)}
          transform={`translate(${CROWN[0]} ${CROWN[1]})`}
        >
          <title>{`${KEYSTONES[skill].name}: ${KEYSTONES[skill].text}`}</title>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} className="tree-petal" d="M0 -6 C 7 -12, 7 -24, 0 -30 C -7 -24, -7 -12, 0 -6 Z" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="7" className="tree-heart" />
        </g>
        {/* The root: the skill itself */}
        <g className="tree-root" transform={`translate(${ROOT[0] - 16} ${ROOT[1] - 16})`}>
          <circle cx="16" cy="16" r="18" />
          <g transform="translate(5 5)">
            <SkillIcon skill={skill} size={22} />
          </g>
        </g>
      </svg>
      <p className="tree-caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
