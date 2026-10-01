"use client";

import { motion } from "framer-motion";
import { Check, Target, Trophy } from "lucide-react";
import { passingCount } from "@/lib/queryEngine";
import { groupRows } from "@/lib/groupByEngine";
import { evaluateHaving } from "@/lib/havingEngine";
import { cn } from "@/lib/utils";
import type { LevelId } from "@/store/useAppStore";
import { useAggregatesStore } from "@/store/useAggregatesStore";
import { useGroupByStore } from "@/store/useGroupByStore";
import { useHavingStore } from "@/store/useHavingStore";
import { useJoinStore } from "@/store/useJoinStore";
import { useQueryStore } from "@/store/useQueryStore";
import { useSetOpsStore } from "@/store/useSetOpsStore";
import { useSubqueryStore } from "@/store/useSubqueryStore";

export function ChallengeCard({ level }: { level: LevelId }) {
  // Level 0: Filter
  const threshold = useQueryStore((s) => s.threshold);
  const filterPassing = passingCount(threshold);

  // Level 1: Aggregates
  const aggFunc = useAggregatesStore((s) => s.func);
  const aggNumericCol = useAggregatesStore((s) => s.numericCol);

  // Level 2: Group By
  const gbCol = useGroupByStore((s) => s.groupCol);
  const gbMetric = useGroupByStore((s) => s.metricCol);
  const gbFn = useGroupByStore((s) => s.aggFn);
  const gbGroups = groupRows(gbCol, gbMetric, gbFn);

  // Level 3: Having
  const hvCol = useHavingStore((s) => s.groupCol);
  const hvMetric = useHavingStore((s) => s.metricCol);
  const hvFn = useHavingStore((s) => s.aggFn);
  const hvOp = useHavingStore((s) => s.havingOp);
  const hvVal = useHavingStore((s) => s.havingValue);
  const hvResults = evaluateHaving(hvCol, hvMetric, hvFn, hvOp, hvVal);
  const hvPassing = hvResults.filter((r) => r.passes);

  // Level 4: Join
  const joinType = useJoinStore((s) => s.joinType);

  // Level 5: Set Ops
  const setOp = useSetOpsStore((s) => s.op);

  // Level 6: Subquery
  const subOp = useSubqueryStore((s) => s.op);

  let title = "";
  let prompt = "";
  let currentStatus = "";
  let isSolved = false;

  switch (level) {
    case "filter":
      title = "Filter Challenge";
      prompt = "Adjust the threshold slider so exactly 5 rows survive WHERE.";
      currentStatus = `${filterPassing} rows currently matching`;
      isSolved = filterPassing === 5;
      break;
    case "aggregates":
      title = "Aggregates Challenge";
      prompt = "Set function to MAX on 'likes_count' to find the top engagement record.";
      currentStatus = `Current: ${aggFunc}(${aggNumericCol})`;
      isSolved = aggFunc === "MAX" && aggNumericCol === "likes_count";
      break;
    case "group-by":
      title = "Group By Challenge";
      prompt = "Set GROUP BY to 'format' to bucket all posts into image vs video.";
      currentStatus = `Grouped by ${gbCol} (${gbGroups.length} buckets)`;
      isSolved = gbCol === "format";
      break;
    case "having":
      title = "HAVING Challenge";
      prompt = "Adjust HAVING condition so exactly 1 group passes.";
      currentStatus = `${hvPassing.length} groups currently passing`;
      isSolved = hvPassing.length === 1;
      break;
    case "join":
      title = "Join Challenge";
      prompt = "Switch to the join type that preserves users with zero posts (Zara).";
      currentStatus = `Current join: ${joinType} JOIN`;
      isSolved = joinType === "LEFT";
      break;
    case "set-ops":
      title = "Set Ops Challenge";
      prompt = "Select the operation that finds only posts shared by both Query A and B.";
      currentStatus = `Current operation: ${setOp}`;
      isSolved = setOp === "INTERSECT";
      break;
    case "subquery":
      title = "Subquery Challenge";
      prompt = "Change comparison to find posts with LESS likes than average.";
      currentStatus = `Operator: likes_count ${subOp} AVG`;
      isSolved = subOp === "<";
      break;
  }

  return (
    <div
      id="tour-challenge-card"
      className={cn(
        "rounded-xl border p-3.5 transition-all shadow-xs",
        isSolved
          ? "border-ok/40 bg-ok/5 ring-1 ring-ok/20"
          : "border-border bg-panel-2"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
          <Target className="h-3.5 w-3.5 text-accent" />
          {title}
        </p>
        {isSolved ? (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 font-mono text-[9px] font-bold text-ok"
          >
            <Trophy className="h-2.5 w-2.5" />
            Solved!
          </motion.span>
        ) : (
          <span className="font-mono text-[9.5px] text-text-muted">Interactive</span>
        )}
      </div>

      <p className="text-[11.5px] font-medium leading-snug text-text">{prompt}</p>

      <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/70 bg-panel px-2.5 py-1.5 font-mono text-[10.5px]">
        <span className="text-text-muted">{currentStatus}</span>
        {isSolved ? (
          <span className="flex items-center gap-1 font-bold text-ok">
            <Check className="h-3 w-3" strokeWidth={3} />
            Target Met
          </span>
        ) : (
          <span className="text-warn font-semibold">Keep tweaking</span>
        )}
      </div>
    </div>
  );
}
