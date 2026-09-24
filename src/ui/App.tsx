import { useState } from "react";
import { ACTION_DEFS } from "../content/actions";
import type { SkillId } from "../content/skills";
import { HouseIcon } from "./art/icons";
import { EmbroideryBand } from "./art/ornaments";
import { AwaySummary } from "./components/AwaySummary";
import { Inventory } from "./components/Inventory";
import { Notes } from "./components/Notes";
import { SaveTools } from "./components/SaveTools";
import { Tabs, type TabDef } from "./components/Tabs";
import { Toasts } from "./components/Toasts";
import { TopBar } from "./components/TopBar";
import { formatStop } from "./format";
import { SkillActions, SkillNav } from "./screens/House";
import { useGame } from "./useGame";

type TabId = "house";

export function App() {
  const game = useGame();
  const { state } = game;
  const [tab, setTab] = useState<TabId>("house");
  const [skill, setSkill] = useState<SkillId>(state.active ? ACTION_DEFS[state.active.id].skill : "scavenging");

  // Tabs appear as the chapter opens them (Village, Circle and Grimoire arrive in later milestones).
  const tabs: TabDef<TabId>[] = [{ id: "house", label: "House", icon: <HouseIcon size={18} /> }];

  return (
    <div className="app">
      <TopBar state={state} onStop={game.stop} stopNote={game.lastStop && formatStop(game.lastStop.reason)} />
      <EmbroideryBand className="band" />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Places" />

      <div className="layout">
        <div className="main" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "house" && (
            <div className="house">
              <SkillNav state={state} skill={skill} onSelect={setSkill} />
              <SkillActions state={state} skill={skill} onStart={game.start} />
            </div>
          )}
        </div>
        <aside className="side">
          <Notes state={state} />
          <Inventory state={state} />
        </aside>
      </div>

      <footer className="footer">
        <SaveTools state={state} onLoad={game.load} onReset={game.reset} />
      </footer>

      <Toasts toasts={game.toasts} onDismiss={game.dismissToast} />
      {game.away && <AwaySummary away={game.away} onClose={game.dismissAway} />}
    </div>
  );
}
