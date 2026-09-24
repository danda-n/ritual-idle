import { useState, type ReactNode } from "react";
import { ACTION_DEFS } from "../content/actions";
import type { SkillId } from "../content/skills";
import { isFeatureOpen } from "../engine/progress";
import { BookIcon, CircleRiteIcon, HouseIcon, LanternIcon } from "./art/icons";
import { EmbroideryBand } from "./art/ornaments";
import { AwaySummary } from "./components/AwaySummary";
import { DevPanel } from "./components/DevPanel";
import { DiscoveryModal } from "./components/DiscoveryModal";
import { Inventory } from "./components/Inventory";
import { Notes } from "./components/Notes";
import { OmenShelf } from "./components/OmenShelf";
import { SaveTools } from "./components/SaveTools";
import { Tabs, type TabDef } from "./components/Tabs";
import { Toasts } from "./components/Toasts";
import { TopBar } from "./components/TopBar";
import { formatStop } from "./format";
import { SkillActions, SkillNav } from "./screens/House";
import { Circle } from "./screens/Circle";
import { Grimoire } from "./screens/Grimoire";
import { Village } from "./screens/Village";
import { useGame } from "./useGame";

type TabId = "house" | "grimoire" | "village" | "circle";

export function App() {
  const game = useGame();
  const { state } = game;
  const [tab, setTabState] = useState<TabId>("house");
  // Tabs show a dot until first visited.
  const [seen, setSeen] = useState<Partial<Record<TabId, boolean>>>({ house: true });
  const setTab = (t: TabId) => {
    setTabState(t);
    setSeen((s) => ({ ...s, [t]: true }));
  };
  const [skill, setSkill] = useState<SkillId>(state.active ? ACTION_DEFS[state.active.id].skill : "scavenging");

  // Tabs appear as grandmother's notes open them; each shows a dot until first visited.
  const tabs: TabDef<TabId>[] = [{ id: "house", label: "House", icon: <HouseIcon size={18} /> }];
  const place = (id: TabId, label: string, icon: ReactNode) => tabs.push({ id, label, icon, badge: !seen[id] && tab !== id });
  if (isFeatureOpen(state, "grimoire")) place("grimoire", "Grimoire", <BookIcon size={18} />);
  if (isFeatureOpen(state, "village")) place("village", "Village", <LanternIcon size={18} />);
  if (isFeatureOpen(state, "circle")) place("circle", "Circle", <CircleRiteIcon size={18} />);

  return (
    <div className="app">
      <TopBar state={state} onStop={game.stop} stopNote={game.lastStop && formatStop(game.lastStop.reason)} />
      <EmbroideryBand className="band" />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Places" />

      <div className="layout">
        <div className="main" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "village" && <Village state={state} act={game.act} />}
          {tab === "grimoire" && <Grimoire state={state} act={game.act} onAttuned={() => setTab("circle")} />}
          {tab === "circle" && <Circle state={state} act={game.act} />}
          {tab === "house" && (
            <div className="house">
              <SkillNav state={state} skill={skill} onSelect={setSkill} />
              <SkillActions state={state} skill={skill} onStart={game.start} />
            </div>
          )}
        </div>
        <aside className="side">
          <Notes state={state} />
          <OmenShelf state={state} act={game.act} />
          <Inventory state={state} />
        </aside>
      </div>

      <footer className="footer">
        <SaveTools state={state} onLoad={game.load} onReset={game.reset} />
        {import.meta.env.DEV && <DevPanel dev={game.dev} />}
      </footer>

      <Toasts toasts={game.toasts} onDismiss={game.dismissToast} />
      {game.away && <AwaySummary away={game.away} onClose={game.dismissAway} />}
      {game.discovery && !game.away && <DiscoveryModal id={game.discovery} onClose={game.dismissDiscovery} />}
    </div>
  );
}
