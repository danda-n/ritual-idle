import { PART_DEFS, type PartId } from "../../content/rite";
import { SKILLS } from "../../content/skills";
import { GLOSSARY } from "../../content/glossary";
import { chooseStage, type Result } from "../../engine/commands";
import type { GameState } from "../../engine/state";
import { SkillIcon } from "../art/icons";
import { ItemIcon } from "../art/items";
import { itemName } from "../format";
import { stageInfo } from "../tasks";
import { Term } from "./Term";

/**
 * The choice of the next part, made at the Circle (the sidebar only points here): one large card
 * per part with the skill it brings, what that skill is, what you'll make, what it uses from skills
 * you have, and what it opens. You'll make all three; this only sets the order.
 */
export function StageChoicePanel({ state, choices, act }: { state: GameState; choices: PartId[]; act: (c: (s: GameState) => Result) => unknown }) {
  return (
    <section className="stage-choice-panel" aria-labelledby="stage-choice-heading">
      <header>
        <h2 id="stage-choice-heading">Choose the next part</h2>
        <p className="muted">
          {state.middleOrder.length === 0 ? "You'll make all three, in any order. Each brings a new skill." : "Two left: pick which comes next."}
        </p>
      </header>
      <div className="stage-cards">
        {choices.map((p) => {
          const info = stageInfo(p);
          return (
            <article key={p} className="stage-card" data-skill={info.skill}>
              <div className="stage-card-head">
                <SkillIcon skill={info.skill} size={30} />
                <div>
                  <h3>{PART_DEFS[p].name}</h3>
                  <span className="muted">brings {SKILLS[info.skill].name}</span>
                </div>
              </div>
              <p className="stage-card-about">{info.about}</p>
              <dl className="stage-card-facts">
                <dt>You'll make</dt>
                <dd>
                  {info.items.map(([item, qty]) => (
                    <span key={item} className="stage-card-item">
                      <ItemIcon item={item} size={15} /> <span className="num">{qty}</span> {itemName(item).toLowerCase()}
                    </span>
                  ))}
                </dd>
                {info.uses.length > 0 && (
                  <>
                    <dt>Uses</dt>
                    <dd>{info.uses.map((i) => itemName(i).toLowerCase()).join(", ")} (from skills you have)</dd>
                  </>
                )}
                {info.opens.length > 0 && (
                  <>
                    <dt>Opens</dt>
                    <dd>
                      <span>
                      {info.opens.map((t, i) => (
                        <span key={t}>
                          {i > 0 && ", then "}
                          <Term id={t}>{t === "experiment" ? "Experiments" : GLOSSARY[t].name.replace(/^The /, "the ")}</Term>
                        </span>
                      ))}
                      </span>
                    </dd>
                  </>
                )}
              </dl>
              <button className="btn stage-card-go" onClick={() => act((s) => chooseStage(s, p))}>
                Make {PART_DEFS[p].name.replace(/^The /, "the ")} next
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
