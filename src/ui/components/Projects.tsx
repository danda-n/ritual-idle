import type { ReactNode } from "react";
import type { ItemId } from "../../content/items";
import { UPGRADE_DEFS, UPGRADE_IDS, type UpgradeId } from "../../content/upgrades";
import { build, canBuild, type Result } from "../../engine/commands";
import { omenShelfSuggested, projectsReady } from "../../engine/projects";
import { openProjects } from "../../engine/estimates";
import type { GameState } from "../../engine/state";
import { CandleIcon, HouseIcon, LanternIcon, LeafIcon, MoonIcon } from "../art/icons";
import { upgradeEffect } from "../effects";
import { ItemChip } from "./ItemLookup";
import { ItemIcon } from "../art/items";
import { Term } from "./Term";

type Act = (c: (s: GameState) => Result) => unknown;

const ICONS: Record<UpgradeId, (p: { size?: number }) => ReactNode> = {
  omen_shelf: MoonIcon,
  salt_crock: (p) => <ItemIcon item="salt" {...p} />,
  reading_lamp: CandleIcon,
  drying_rack: LeafIcon,
  notice_board: LanternIcon,
  second_board: LanternIcon,
  herb_stall: LeafIcon,
  wax_trader: CandleIcon,
  carved_shelf: MoonIcon,
};

/**
 * House projects: side work, built once from things you make. Nothing on the main path needs
 * them. Built ones fold into one line at the bottom.
 */
export function Projects({ state, act }: { state: GameState; act: Act }) {
  const ready = projectsReady(state);
  const built = UPGRADE_IDS.filter((id) => state.upgrades.includes(id));
  const open = openProjects(state);
  return (
    <section className="panel projects" aria-labelledby="projects-heading">
      <div className="panel-title">
        <HouseIcon size={18} />
        <h2 id="projects-heading">
          <Term id="project">House projects</Term>
        </h2>
        <span className="muted panel-aside">{ready.length > 0 ? <strong className="projects-ready">{ready.length} ready</strong> : "Optional · permanent"}</span>
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
                <p className="project-effect">
                  {upgradeEffect(def.effect)}
                  {def.extra && ` · ${def.extra}`}
                </p>
                {/* What it's for; the omen shelves explain the new word. */}
                <p className="muted project-blurb">
                  {def.effect.kind === "omen_capacity" && (
                    <>
                      <Term id="omen">Omens</Term>
                      {" · "}
                    </>
                  )}
                  {def.blurb}
                </p>
                <div className="action-io">
                  {(Object.entries(def.items) as [ItemId, number][]).map(([item, qty]) => (
                    <ItemChip key={item} item={item} need={qty} />
                  ))}
                </div>
              </div>
              <button
                className={`btn ${reason === null ? "btn-primary" : ""}`}
                disabled={reason !== null}
                onClick={() => act((s) => build(s, id))}
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
    </section>
  );
}
