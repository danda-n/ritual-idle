import { FOLLOWERS } from "../../content/followers";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import type { GameState } from "../../engine/state";
import { EmbroideryBand, Rosette } from "../art/ornaments";
import { Modal } from "./Modal";
import { followerEffects } from "../effects";

export function ChapterEnd({ state, onClose }: { state: GameState; onClose: () => void }) {
  const quality = state.rite.completed!.quality;
  const janko = FOLLOWERS.janko;
  return (
    <Modal title="Chapter I · Hearth" onClose={onClose}>
      <div className="discovery-mark" aria-hidden="true">
        <Rosette size={64} />
      </div>
      <p className="note-quote">{HEARTH_RITE.finale}</p>
      <p>
        The Kindling was <strong>{QUALITIES[quality]}</strong>.
      </p>
      <ul className="ledger">
        <li>
          <span>Every skill can now reach</span>
          <span className="num">level {HEARTH_RITE.rewards.levelCap}</span>
        </li>
        <li>
          <span>A follower: {janko.name}</span>
          <span>{followerEffects("janko").join(" · ")}</span>
        </li>
        <li>
          <span>The cellar</span>
          <span>open</span>
        </li>
        {quality === QUALITIES.length - 1 && (
          <li>
            <span>{HEARTH_RITE.resplendentCosmetic}</span>
            <span />
          </li>
        )}
      </ul>
      <p className="text-2">{janko.description}</p>
      <p className="note-quote">{HEARTH_RITE.rewards.lore}</p>
      <EmbroideryBand className="band" />
      <p className="muted">
        <strong>To be continued: Chapter II · Grave.</strong> Keep playing: the house, the village and the Grimoire are still yours.
      </p>
      <button className="btn btn-primary" onClick={onClose}>
        Back to the house
      </button>
    </Modal>
  );
}
