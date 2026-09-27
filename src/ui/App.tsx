import { useEffect, useState, type ReactNode } from "react";
import { ACTION_DEFS } from "../content/actions";
import type { SkillId } from "../content/skills";
import { dismissEnding, setSetting } from "../engine/commands";
import type { ItemId } from "../content/items";
import { isFeatureOpen, isSkillUnlocked } from "../engine/progress";
import { BookIcon, CircleRiteIcon, HouseIcon, LanternIcon, JarIcon } from "./art/icons";
import { EmbroideryBand } from "./art/ornaments";
import { AwaySummary } from "./components/AwaySummary";
import { DevPanel } from "./components/DevPanel";
import { ChapterEnd } from "./components/ChapterEnd";
import { DiscoveryModal } from "./components/DiscoveryModal";
import { ActivityFeed } from "./components/ActivityFeed";
import { Stores } from "./screens/Stores";
import { ChapterTracker } from "./components/ChapterTracker";
import { TaskCard } from "./components/TaskCard";
import { OmenShelf } from "./components/OmenShelf";
import { Projects } from "./components/Projects";
import { omenShelfSuggested, projectsReady } from "../engine/projects";
import { ChipContext } from "./chipContext";
import { ItemLookupModal } from "./components/ItemLookup";
import { SettingsModal } from "./components/SettingsModal";
import { Tabs, type TabDef } from "./components/Tabs";
import { Floats } from "./components/Floats";
import { Toasts } from "./components/Toasts";
import { TopBar } from "./components/TopBar";
import { formatStop } from "./format";
import { HouseHero, SkillActions, SkillNav } from "./screens/House";
import { Circle } from "./screens/Circle";
import { Grimoire } from "./screens/Grimoire";
import { Village } from "./screens/Village";
import type { Place } from "./tasks";
import { useGame } from "./useGame";

type TabId = "house" | "stores" | "grimoire" | "village" | "circle";

export function App() {
  const game = useGame();
  const { state } = game;
  const [tab, setTabState] = useState<TabId>("house");
  const [lookup, setLookup] = useState<ItemId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Tabs show a dot until first visited; visits are saved.
  const seen = (t: TabId) => state.settings.seenTabs.includes(t);
  const setTab = (t: TabId) => {
    setTabState(t);
    if (!seen(t)) game.act((s) => setSetting(s, "seenTabs", [...s.settings.seenTabs, t]));
  };

  useEffect(() => {
    document.documentElement.dataset.motion = state.settings.reducedMotion ? "reduced" : "";
  }, [state.settings.reducedMotion]);
  // Row density: roomy (the default), or 36px / 32px rows.
  useEffect(() => {
    const d = state.settings.density;
    if (d === "roomy") delete document.documentElement.dataset.density;
    else document.documentElement.dataset.density = d;
  }, [state.settings.density]);
  const [skill, setSkill] = useState<SkillId>(state.active ? ACTION_DEFS[state.active.id].skill : "scavenging");
  /** Take the player to where a task is done. */
  const goTo = (p: Place) => {
    setTab(p.tab);
    if (p.tab === "house" && "skill" in p) setSkill(p.skill);
    // After the tab renders, bring the projects panel into view.
    if ("anchor" in p) setTimeout(() => document.getElementById("projects-heading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  // The omen shelf, pointed out once it matters: a one-time toast when it could first be built.
  const shelfReady = omenShelfSuggested(state) && projectsReady(state).includes("omen_shelf");
  useEffect(() => {
    if (!shelfReady || state.settings.introsSeen.includes("omen_shelf_ready")) return;
    game.notify([{ title: "Omen shelf: ready to build", text: "Optional house project · omens start dropping" }]);
    game.act((s) => setSetting(s, "introsSeen", [...s.settings.introsSeen, "omen_shelf_ready"]));
  }, [shelfReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tabs appear as grandmother's notes open them; each shows a dot until first visited.
  const tabs: TabDef<TabId>[] = [
    { id: "house", label: "House", icon: <HouseIcon size={18} /> },
    { id: "stores", label: "Stores", icon: <JarIcon size={18} /> },
  ];
  const place = (id: TabId, label: string, icon: ReactNode) => tabs.push({ id, label, icon, badge: !seen(id) && tab !== id });
  if (isFeatureOpen(state, "grimoire")) place("grimoire", "Grimoire", <BookIcon size={18} />);
  if (isFeatureOpen(state, "village")) place("village", "Village", <LanternIcon size={18} />);
  if (isFeatureOpen(state, "circle")) place("circle", "Circle", <CircleRiteIcon size={18} />);

  return (
    <ChipContext.Provider value={{ state, lookup: setLookup, start: game.start }}>
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <TopBar state={state} onStop={game.stop} stopNote={game.lastStop && formatStop(game.lastStop.reason)} onSettings={() => setSettingsOpen(true)} onGo={goTo} />
      <EmbroideryBand />

      {/* One shell, a room per tab: data-place sets the tab's colour, light and hero. */}
      <div className="shell" data-place={tab} id="main" tabIndex={-1}>
        <div className="shell-main">
        <div className="tabs-row">
          <Tabs tabs={tabs} value={tab} onChange={setTab} label="Places" />
          <ActivityFeed feed={game.feed} />
        </div>
        <div className="main" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "stores" && <Stores state={state} />}
          {tab === "village" && <Village state={state} act={game.act} />}
          {tab === "grimoire" && <Grimoire state={state} act={game.act} onAttuned={() => setTab("circle")} />}
          {tab === "circle" && <Circle state={state} act={game.act} />}
          {tab === "house" && (
            <>
              <HouseHero state={state} />
              <div className="house">
                <SkillNav state={state} skill={skill} onSelect={setSkill} />
                <SkillActions state={state} skill={skill} onStart={game.start} act={game.act} />
              </div>
              {isSkillUnlocked(state, "chandlery") && <Projects state={state} act={game.act} />}
            </>
          )}
        </div>
        </div>
        <aside className="shell-side">
          <ChapterTracker state={state} onGo={goTo} act={game.act} />
          <OmenShelf state={state} act={game.act} />
        </aside>
      </div>

      {import.meta.env.DEV && (
        <footer className="footer">
          <DevPanel dev={game.dev} />
        </footer>
      )}

      <Toasts toasts={game.toasts} onDismiss={game.dismissToast} />
      <Floats />
      {game.away && <AwaySummary away={game.away} onClose={game.dismissAway} />}
      {game.discovery && !game.away && <DiscoveryModal id={game.discovery} onClose={game.dismissDiscovery} />}
      {state.rite.completed && !state.rite.completed.endingSeen && !game.away && !game.discovery && (
        <ChapterEnd state={state} act={game.act} onClose={() => game.act(dismissEnding)} />
      )}
      {game.story && !game.away && !game.discovery && (!state.rite.completed || state.rite.completed.endingSeen) && (
        <TaskCard note={game.story} state={state} onClose={game.dismissStory} onGo={goTo} />
      )}
      {lookup && <ItemLookupModal state={state} item={lookup} onClose={() => setLookup(null)} />}
      {settingsOpen && (
        <SettingsModal state={state} act={game.act} onLoad={game.load} onReset={game.reset} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
    </ChipContext.Provider>
  );
}
