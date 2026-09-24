import { FOLLOWERS } from "../../content/followers";
import { HEARTH_RITE, QUALITIES } from "../../content/rite";
import type { GameState } from "../../engine/state";
import { EmbroideryBand } from "../art/ornaments";
import { Sanctum } from "../art/Sanctum";
import { Modal } from "./Modal";
import { followerEffects } from "../effects";

export function ChapterEnd({ state, onClose }: { state: GameState; onClose: () => void }) {
  const quality = state.rite.completed!.quality;
  const janko = FOLLOWERS.janko;
  return (
    <Modal title="Chapter I · Hearth" onClose={onClose}>
      <div className="chapter-painting">
        <Sanctum state={state} />
      </div>
      <p className="note-quote">{HEARTH_RITE.finale}</p>
      <p>
        The Kindling was <strong>{QUALITIES[quality]}</strong>.
      </p>
      <ul className="ledger rewards-in">
        <li>
          <span>Skill caps</span>
          <span className="num">rise to {HEARTH_RITE.rewards.levelCap} (for Chapter II)</span>
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
            <span>Resplendent</span>
            <span>an embroidered circle cloth</span>
          </li>
        )}
      </ul>
      <p className="note-quote">{HEARTH_RITE.rewards.lore}</p>
      {quality === QUALITIES.length - 1 && <p className="note-quote">{HEARTH_RITE.resplendentLore}</p>}
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
