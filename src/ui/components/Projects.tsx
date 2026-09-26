import { useState, type ReactNode } from "react";
import type { ItemId } from "../../content/items";
import { UPGRADE_DEFS, UPGRADE_IDS, type UpgradeId } from "../../content/upgrades";
import { build, canBuild, type Result } from "../../engine/commands";
import { omenShelfSuggested, projectsReady } from "../../engine/projects";
import type { GameState } from "../../engine/state";
import { CandleIcon, HouseIcon, LeafIcon, MoonIcon } from "../art/icons";
import { upgradeEffect } from "../effects";
import { ItemChip } from "./ItemLookup";
import { Modal } from "./Modal";

type Act = (c: (s: GameState) => Result) => unknown;

const ICONS: Record<UpgradeId, (p: { size?: number }) => ReactNode> = {
  omen_shelf: MoonIcon,
  reading_lamp: CandleIcon,
  drying_rack: LeafIcon,
  mended_shutters: HouseIcon,
  carved_shelf: MoonIcon,
};

/**
 * House projects: side work, built once from things you make. Nothing on the main path needs
 * them. Built ones fold into one line at the bottom.
 */
export function Projects({ state, act }: { state: GameState; act: Act }) {
  const [omenNote, setOmenNote] = useState(false);
  const ready = projectsReady(state);
  const built = UPGRADE_IDS.filter((id) => state.upgrades.includes(id));
  const open = UPGRADE_IDS.filter((id) => !built.includes(id) && (!UPGRADE_DEFS[id].requires || built.includes(UPGRADE_DEFS[id].requires as UpgradeId)));
  return (
    <section className="panel projects" aria-labelledby="projects-heading">
      <div className="panel-title">
        <HouseIcon size={18} />
        <h2 id="projects-heading">House projects</h2>
        <span className="muted panel-aside">{ready.length > 0 ? <strong className="projects-ready">{ready.length} ready to build</strong> : "Optional · built once, kept for good"}</span>
      </div>
      <ul className="project-list">
        {open.map((id) => {
          const def = UPGRADE_DEFS[id];
          const Icon = ICONS[id];
          const reason = canBuild(state, id);
          const skill = "skill" in def.effect ? def.effect.skill : undefined;
          return (
            <li key={id} className={`project ${reason === null ? "ready" : ""} ${id === "omen_shelf" && omenShelfSuggested(state) ? "is-new" : ""}`} data-skill={skill}>
              <span className="project-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <div className="project-info">
                <strong>
                  {def.name}
                  {id === "omen_shelf" && omenShelfSuggested(state) && <span className="new-tag">New</span>}
                </strong>
                <p className="muted">{def.description}</p>
                <div className="action-io">
                  {(Object.entries(def.items) as [ItemId, number][]).map(([item, qty]) => (
                    <ItemChip key={item} item={item} need={qty} />
                  ))}
                </div>
              </div>
              <button
                className={`btn ${reason === null ? "btn-primary" : ""}`}
                disabled={reason !== null}
                title={reason ?? undefined}
                onClick={() => {
                  act((s) => build(s, id));
                  if (id === "omen_shelf") setOmenNote(true);
                }}
              >
                Build
              </button>
            </li>
          );
        })}
      </ul>
      {built.length > 0 && (
        <p className="muted project-built">
          In the house: {built.map((id) => `${UPGRADE_DEFS[id].name} (${upgradeEffect(UPGRADE_DEFS[id].effect).toLowerCase()})`).join(" · ")}
        </p>
      )}
      {omenNote && (
        <Modal title="The omen shelf" onClose={() => setOmenNote(false)}>
          <p>Grandmother kept her omens here: a still night, a bird at the window. Now they'll come to you too, now and then, from any work.</p>
          <p>Omens wait on the shelf, which holds two. The first is already there.</p>
          <p>When you want a push, bless a skill with one: twice as fast, and twice the chance finds, for 2 minutes. Nothing is lost by waiting, except omens that find the shelf full.</p>
          <button className="btn btn-primary" onClick={() => setOmenNote(false)}>
            I'll keep them
          </button>
        </Modal>
      )}
    </section>
  );
}
