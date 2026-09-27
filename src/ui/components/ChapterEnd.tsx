import { FOLLOWERS } from "../../content/followers";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import type { GameState } from "../../engine/state";
import { EmbroideryBand } from "../art/ornaments";
import { Sanctum } from "../art/Sanctum";
import { Modal } from "./Modal";
import { Story } from "./Story";
import { followerEffects } from "../effects";
import { KeepsakePick } from "./KeepsakePick";
import type { Result } from "../../engine/commands";
import { riteJournal } from "../../engine/rite";

export function ChapterEnd({ state, onClose, act }: { state: GameState; onClose: () => void; act: (c: (s: GameState) => Result) => unknown }) {
  const quality = state.rite.completed!.quality;
  const janko = FOLLOWERS.janko;
  return (
    <Modal title="Chapter I · Hearth" onClose={onClose}>
      <div className="chapter-painting">
        <Sanctum state={state} />
      </div>
      <p>
        Quality: <strong>{QUALITIES[quality]}</strong>
      </p>
      <ul className="ledger rewards-in">
        <li>
          <span>Skill caps</span>
          <span className="num">rise to {HEARTH_RITE.rewards.levelCap} (for Chapter II)</span>
        </li>
        <li title={janko.description}>
          <span>A follower: {janko.name}</span>
          <span>{followerEffects("janko").join(" · ")}</span>
        </li>
        <li>
          <span>The cellar</span>
          <span>open</span>
        </li>
        {quality === QUALITIES.length - 1 && (
          <li>
            <span>Resplendent</span>
            <span>{HEARTH_RITE.resplendentCosmetic}</span>
          </li>
        )}
      </ul>
      <KeepsakePick state={state} act={act} />
      {/* The finale and lore, collapsed; they're also the journal's Kindling entry. */}
      <Story lines={riteJournal(state).slice(HEARTH_RITE.phases.length)} />
      <EmbroideryBand className="band" />
      <p className="muted">
        <strong>Chapter II · Grave</strong> comes in a later build.
      </p>
      <button className="btn btn-primary" onClick={onClose}>
        Back to the house
      </button>
    </Modal>
  );
}
