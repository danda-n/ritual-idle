import { ACTION_DEFS, type ActionId } from "../../content/actions";
import { SKILLS } from "../../content/skills";
import { setSetting, type Result } from "../../engine/commands";
import { isRecipeKnown, isSkillUnlocked } from "../../engine/progress";
import type { Density, Fallback, GameState } from "../../engine/state";
import { Modal } from "./Modal";
import { SaveTools } from "./SaveTools";

const DENSITIES: [Density, string][] = [
  ["roomy", "Roomy"],
  ["comfortable", "Comfortable"],
  ["compact", "Compact"],
];

const GATHERING = (Object.keys(ACTION_DEFS) as ActionId[]).filter((id) => ["herbalism", "scavenging"].includes(ACTION_DEFS[id].skill));

export function SettingsModal({
  state,
  act,
  onLoad,
  onReset,
  onClose,
}: {
  state: GameState;
  act: (c: (s: GameState) => Result) => unknown;
  onLoad: (s: GameState) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const s = state.settings;
  const known = GATHERING.filter((id) => isSkillUnlocked(state, ACTION_DEFS[id].skill) && isRecipeKnown(state, id));
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="setting">
        <label className="field-label" htmlFor="fallback">
          When work stops (out of an ingredient)
        </label>
        <select id="fallback" className="field" value={s.fallback} onChange={(e) => act((st) => setSetting(st, "fallback", e.target.value as Fallback))}>
          <option value="last_gathering">Go back to the last thing I gathered</option>
          <option value="stop">Stop and wait for me</option>
          {known.map((id) => (
            <option key={id} value={id}>
              Switch to: {ACTION_DEFS[id].name} ({SKILLS[ACTION_DEFS[id].skill].name})
            </option>
          ))}
        </select>
        <p className="muted">Applies offline too</p>
      </div>

      <label className="setting toggle">
        <input type="checkbox" checked={s.grimoireAssist} onChange={(e) => act((st) => setSetting(st, "grimoireAssist", e.target.checked))} />
        <span>
          <strong>Grimoire assist</strong>
          <span className="muted"> ×2 insight from all sources</span>
        </span>
      </label>

      <label className="setting toggle">
        <input type="checkbox" checked={s.reducedMotion} onChange={(e) => act((st) => setSetting(st, "reducedMotion", e.target.checked))} />
        <span>
          <strong>Reduce motion</strong>
          <span className="muted"> Turn off flicker, glows and slide-ins.</span>
        </span>
      </label>

      <div className="setting">
        <span className="field-label" id="density-label">
          Row density
        </span>
        <span className="seg" role="group" aria-labelledby="density-label">
          {DENSITIES.map(([d, label]) => (
            <button key={d} type="button" aria-pressed={s.density === d} onClick={() => act((st) => setSetting(st, "density", d))}>
              {label}
            </button>
          ))}
        </span>
      </div>

      <div className="setting">
        <label className="field-label" htmlFor="toasts">
          How long messages stay
        </label>
        <select id="toasts" className="field" value={s.toastSeconds} onChange={(e) => act((st) => setSetting(st, "toastSeconds", Number(e.target.value)))}>
          <option value={5}>Short (5 seconds)</option>
          <option value={8}>Normal (8 seconds)</option>
          <option value={15}>Long (15 seconds)</option>
        </select>
      </div>

      <SaveTools state={state} onLoad={onLoad} onReset={onReset} />

      <button className="btn btn-primary" onClick={onClose}>
        Done
      </button>
    </Modal>
  );
}
