import type { Result, Success } from "../../engine/commands";
import type { GameState } from "../../engine/state";
import { CircleRiteIcon } from "../art/icons";
import { KindlingPanel } from "../components/KindlingPanel";
import { PlaceHero } from "../components/PlaceHero";
import { HEARTH_RITE, PART_IDS } from "../../content/rite";
import { skillLevel } from "../../engine/simulate";
import { isFeatureOpen, stageChoices } from "../../engine/progress";
import { StageChoicePanel } from "../components/StageChoicePanel";

type Act = (command: (s: GameState) => Result) => Success | null;

export function Circle({ state, act }: { state: GameState; act: Act }) {
  const experiments = isFeatureOpen(state, "experiments");
  const choices = stageChoices(state);
  return (
    <>
      <PlaceHero
        icon={<CircleRiteIcon size={34} />}
        title="The Circle"
        term="circle"
        line="Grandmother drew it in the floor. It has been waiting for you."
        stats={[
          { label: "Parts placed", term: "kindling", value: <>{state.kindling.length}<span className="unit">/{PART_IDS.length}</span></>, accent: true },
          {
            label: "Ritualism",
            value: (
              <>
                {skillLevel(state, "ritualism")}
                <span className="unit">{skillLevel(state, "ritualism") >= HEARTH_RITE.skills.ritualism! ? "✓ ready" : `needs ${HEARTH_RITE.skills.ritualism}`}</span>
              </>
            ),
          },
        ]}
      />
      {choices.length > 0 && <StageChoicePanel state={state} choices={choices} act={act} />}
      <KindlingPanel state={state} act={act} />
      {experiments && <p className="circle-later">Experiments have their own tab: find grandmother's small workings, and bind charms.</p>}
    </>
  );
}
