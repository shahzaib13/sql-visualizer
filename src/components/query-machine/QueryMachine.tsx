"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { useAppStore } from "@/store/useAppStore";
import { GroupByView } from "./levels/GroupByView";
import { HavingView } from "./levels/HavingView";
import { Level0View } from "./levels/Level0View";
import { TopBar } from "./TopBar";

export function QueryMachine() {
  const currentLevel = useAppStore((s) => s.currentLevel);

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-text">
        <TopBar />
        <div className="min-h-0 flex-1">
          {currentLevel === "filter" && <Level0View />}
          {currentLevel === "group-by" && <GroupByView />}
          {currentLevel === "having" && <HavingView />}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
