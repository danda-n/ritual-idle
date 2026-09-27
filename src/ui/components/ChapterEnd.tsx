import { FOLLOWERS } from "../../content/followers";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import type { GameState } from "../../engine/state";
import { EmbroideryBand } from "../art/ornaments";
import { Sanctum } from "../art/Sanctum";
import { Modal } from "./Modal";
import { Story } from "./Story";
import { followerEffects } from "../effects";
import { KeepsakePick, useKeepsakeChoice } from "./KeepsakePick";
import { chooseKeepsakes, type Result } from "../../engine/commands";
import { riteJournal } from "../../engine/rite";
import { QualityLadder } from "./QualityLadder";
import { ItemIcon } from "../art/items";
import { Tip } from "./Tip";
import { Term } from "./Term";

/**
 * The chapter's end, in sections: how the rite went (the quality ladder, with the offerings that
 * counted), what it gave (a ledger), the keepsakes to choose (changeable until you leave), and the
 * story, folded. Leaving keeps the chosen keepsakes.
 */
export function ChapterEnd({ state, onClose, act }: { state: GameState; onClose: () => void; act: (c: (s: GameState) => Result) => unknown }) {
  const quality = state.rite.completed!.quality;
  const janko = FOLLOWERS.janko;
  const { left, chosen, toggle } = useKeepsakeChoice(state);
  const leave = () => {
    if (chosen.length > 0) act((s) => chooseKeepsakes(s, chosen));
    onClose();
  };
  return (
    <Modal title="Chapter I · Hearth" onClose={leave}>
      <div className="chapter-painting">
        <Sanctum state={state} />
      </div>
      <section className="end-section" aria-labelledby="end-quality">
        <h3 id="end-quality">
          The rite: <span className={`quality-word q${quality}`}>{QUALITIES[quality]}</span>
        </h3>
        <QualityLadder state={state} done={state.rite.completed!} />
      </section>
      <section className="end-section" aria-labelledby="end-rewards">
        <h3 id="end-rewards">What it gave</h3>
        <ul className="ledger rewards-in">
          <li>
            <span>
              Skill <Term id="cap">caps</Term>
            </span>
            <span className="num">rise to {HEARTH_RITE.rewards.levelCap} (for Chapter II)</span>
          </li>
          <li>
            <Tip content={{ title: janko.name, note: janko.description }}>
              <span tabIndex={0}>
                A <Term id="follower">follower</Term>: {janko.name}
              </span>
            </Tip>
            <span>{followerEffects("janko").join(" · ")}</span>
          </li>
          <li>
            <span>The cellar</span>
            <span>open</span>
          </li>
          {quality === QUALITIES.length - 1 && (
            <li className="rare">
              <span>
                <ItemIcon item="circle_cloth" size={16} /> Embroidered circle cloth
              </span>
              <span>in your inventory · kept for Chapter II</span>
            </li>
          )}
        </ul>
      </section>
      {(left > 0 || state.keepsakes.length > 0) && (
        <section className="end-section">
          <KeepsakePick state={state} chosen={chosen} onToggle={toggle} />
        </section>
      )}
      {/* The finale and lore, collapsed; they're also the journal's Kindling entry. */}
      <Story lines={riteJournal(state).slice(HEARTH_RITE.phases.length)} />
      <EmbroideryBand className="band" />
      <p className="muted">
        <strong>Chapter II · Grave</strong> comes in a later build.
      </p>
      <button className="btn btn-primary" onClick={leave}>
        {chosen.length > 0 ? `Keep ${chosen.length === 1 ? "it" : "them"} · back to the house` : "Back to the house"}
      </button>
    </Modal>
  );
}
