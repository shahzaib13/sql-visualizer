"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect } from "react";
import { applyShareUrlIfPresent } from "@/lib/shareLink";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { AggregatesView } from "./levels/AggregatesView";
import { GroupByView } from "./levels/GroupByView";
import { HavingView } from "./levels/HavingView";
import { JoinView } from "./levels/JoinView";
import { Level0View } from "./levels/Level0View";
import { SetOpsView } from "./levels/SetOpsView";
import { SubqueryView } from "./levels/SubqueryView";
import { OnboardingTour } from "./OnboardingTour";
import { TopBar } from "./TopBar";

export function QueryMachine() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const markVisited = useProgressStore((s) => s.markVisited);

  useEffect(() => {
    applyShareUrlIfPresent();
  }, []);

  useEffect(() => {
    markVisited(currentLevel);
  }, [currentLevel, markVisited]);

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-text">
        <TopBar />
        <OnboardingTour />
        <div className="min-h-0 flex-1">
          {currentLevel === "filter" && <Level0View />}
          {currentLevel === "aggregates" && <AggregatesView />}
          {currentLevel === "group-by" && <GroupByView />}
          {currentLevel === "having" && <HavingView />}
          {currentLevel === "join" && <JoinView />}
          {currentLevel === "set-ops" && <SetOpsView />}
          {currentLevel === "subquery" && <SubqueryView />}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
