"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Check,
  CheckCircle2,
  Crown,
  Database,
  Eye,
  Heart,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  computeDistinct,
  computeNumericScan,
} from "@/lib/aggregatesEngine";
import { POSTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAggregatesStore } from "@/store/useAggregatesStore";

export function AggregatesHoodPanel() {
  const stage = useAggregatesStore((s) => s.stage);
  const func = useAggregatesStore((s) => s.func);
  const numericCol = useAggregatesStore((s) => s.numericCol);
  const distinctCol = useAggregatesStore((s) => s.distinctCol);
  const countMode = useAggregatesStore((s) => s.countMode);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage, func]);

  const [distinctFilter, setDistinctFilter] = useState<"all" | "unique" | "duplicates">("all");

  const distinctData = computeDistinct(distinctCol);
  const numericData = computeNumericScan(numericCol);

  const isLikes = numericCol === "likes_count";
  const unitLabel = isLikes ? "likes" : "views";

  // Scalar result for stage 2 (SELECT)
  let scalarVal: string | number = 0;
  let scalarFormula = "";
  if (func === "COUNT") {
    scalarVal = countMode === "DISTINCT format" ? 2 : POSTS.length;
    scalarFormula = countMode === "DISTINCT format" ? "2 unique formats counted" : "20 total table rows";
  } else if (func === "SUM") {
    scalarVal = numericData.totalSum.toLocaleString();
    scalarFormula = `Sum of ${numericCol} across all 20 rows`;
  } else if (func === "AVG") {
    scalarVal = numericData.avg;
    scalarFormula = `${numericData.totalSum.toLocaleString()} total ÷ 20 posts = ${numericData.avg}`;
  } else if (func === "MIN") {
    scalarVal = numericData.minVal.toLocaleString();
    scalarFormula = `Lowest ${unitLabel} in table (Post #${numericData.minRow.id} by @${numericData.minRow.username})`;
  } else if (func === "MAX") {
    scalarVal = numericData.maxVal.toLocaleString();
    scalarFormula = `Highest ${unitLabel} in table (Post #${numericData.maxRow.id} by @${numericData.maxRow.username})`;
  }

  const filteredDistinctStream = distinctData.stream.filter((item) => {
    if (distinctFilter === "unique") return !item.isDuplicate;
    if (distinctFilter === "duplicates") return item.isDuplicate;
    return true;
  });

  return (
    <div ref={containerRef} className="scrollbar-thin h-full flex-1 overflow-y-auto min-h-0 p-4 lg:p-6 text-text">
      {/* Top Banner: Status Header (Visual Only - No Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-xs">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold tracking-wider text-text-muted uppercase">
              Aggregates & Scalar Engine
            </div>
            <div className="font-mono text-[15px] font-bold text-text">
              {func === "DISTINCT"
                ? `SELECT DISTINCT ${distinctCol}`
                : func === "COUNT"
                ? `SELECT COUNT(${countMode})`
                : `SELECT ${func}(${numericCol})`}
            </div>
          </div>
        </div>

        {/* Read-only Stage Indicator Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-panel-2 px-3 py-1 font-mono text-[11px]">
          <span className="text-text-muted">Current Stage:</span>
          <span className="font-bold text-accent">
            {stage === 0 ? "1 · FROM" : stage === 1 ? "2 · SCAN & COMPUTE" : "3 · SELECT"}
          </span>
        </div>
      </div>

      {/* Main Body Driven Visually by STAGE */}
      <div className="mt-4 flex flex-col gap-4">
        {/* ========================================================================= */}
        {/* STAGE 0: FROM posts (Raw buffer loaded from disk)                          */}
        {/* ========================================================================= */}
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Stage Info Header */}
            <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-flow flex-none" />
                <div>
                  <h3 className="font-mono text-[13px] font-bold text-text">
                    Stage 1: FROM posts — Table Loaded into Working Memory
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-text-muted">
                    Database loads all <b className="text-text">20 raw rows</b> into buffer memory. Use the <b className="text-text">Execution Timeline slider</b> in the left panel to run the calculation.
                  </p>
                </div>
              </div>
            </div>

            {/* Raw Table Buffer */}
            <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
              <div className="flex items-center justify-between border-b border-border pb-2.5 font-mono text-[11px] text-text-muted">
                <span>Working Buffer (20 raw rows in memory)</span>
                <span className="text-accent font-semibold">
                  Target column for {func}: {func === "DISTINCT" ? distinctCol : numericCol}
                </span>
              </div>

              <div className="mt-2.5 flex max-h-[380px] flex-col gap-1.5 overflow-y-auto pr-1">
                {POSTS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10.5px] text-text-muted flex-none">#{r.id}</span>
                      <span className="truncate font-semibold text-text">@{r.username}</span>
                      <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[10.5px] text-text-muted border border-border flex-none">
                        {r.format}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] flex-none">
                      <span className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 border font-bold transition-colors",
                        numericCol === "likes_count"
                          ? "bg-bad/10 border-bad/30 text-bad"
                          : "bg-panel text-text-muted border-border"
                      )}>
                        <Heart className="h-3 w-3 fill-current" />
                        {r.likes_count} likes
                      </span>

                      <span className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 border font-bold transition-colors",
                        numericCol === "views_count"
                          ? "bg-flow/10 border-flow/30 text-flow"
                          : "bg-panel text-text-muted border-border"
                      )}>
                        <Eye className="h-3 w-3" />
                        {r.views_count} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1: SCAN & COMPUTE (The Calculation in Action)                        */}
        {/* ========================================================================= */}
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* DISTINCT Active Sieve */}
            {func === "DISTINCT" && (
              <div className="flex flex-col gap-3.5">
                {/* Preserved Unique Values Pool */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-accent">
                      <Sparkles className="h-4 w-4 flex-none" />
                      <span>Unique &apos;{distinctCol}&apos; Pool ({distinctData.uniqueValues.length})</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-text-muted">
                      {POSTS.length - distinctData.uniqueValues.length} duplicate rows discarded
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {distinctData.uniqueValues.map((u, i) => (
                      <div
                        key={u.value}
                        className="flex items-center gap-2 rounded-lg border-2 border-accent bg-panel px-3 py-1.5 shadow-xs"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink flex-none">
                          {i + 1}
                        </span>
                        <span className="font-mono text-[13.5px] font-extrabold text-text">
                          &apos;{u.value}&apos;
                        </span>
                        <span className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-text-muted border border-border">
                          {u.count} post{u.count === 1 ? "" : "s"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sieve Stream with filter tabs */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                    <span className="font-mono text-[11px] font-bold text-text-muted uppercase">
                      Live Sieve Stream
                    </span>
                    <div className="flex items-center gap-1">
                      {(["all", "unique", "duplicates"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDistinctFilter(mode)}
                          className={cn(
                            "rounded-md px-2.5 py-1 font-mono text-[10.5px] font-bold capitalize transition-colors",
                            distinctFilter === mode
                              ? "bg-accent text-accent-ink shadow-xs"
                              : "border border-border bg-panel-2 text-text-muted hover:text-text"
                          )}
                        >
                          {mode === "all"
                            ? `All (${POSTS.length})`
                            : mode === "unique"
                            ? `Unique (${distinctData.uniqueValues.length})`
                            : `Duplicates (${POSTS.length - distinctData.uniqueValues.length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {filteredDistinctStream.map((item, idx) => (
                      <motion.div
                        key={item.row.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px] transition-all",
                          item.isDuplicate
                            ? "border-border/60 bg-panel-2/60 text-text-muted opacity-80"
                            : "border-ok/40 bg-ok/5 text-text font-medium shadow-xs"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-text-muted flex-none">#{item.row.id}</span>
                          <span className="truncate font-semibold text-text">@{item.row.username}</span>
                          <span className="font-mono text-text-muted flex-none">→</span>
                          <span className="font-mono font-bold text-accent flex-none">&apos;{item.val}&apos;</span>
                        </div>

                        <div className="flex-none">
                          {item.isDuplicate ? (
                            <span className="flex items-center gap-1 rounded bg-bad/10 border border-bad/30 px-2 py-0.5 font-mono text-[10px] font-bold text-bad">
                              ✕ Duplicate of #{item.firstSeenPostId} (Skipped)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded bg-ok/10 border border-ok/40 px-2 py-0.5 font-mono text-[10px] font-extrabold text-ok">
                              <Check className="h-3 w-3" strokeWidth={3} /> 1st Seen (Saved)
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COUNT Active Counter */}
            {func === "COUNT" && (
              <div className="flex flex-col gap-3.5">
                <div className="rounded-xl border border-border bg-panel p-4 shadow-[var(--shadow-row)] text-center">
                  <div className="font-mono text-[11px] uppercase text-text-muted font-bold tracking-wider">
                    Total Count Tally
                  </div>
                  <div className="font-mono text-[36px] font-black text-accent tracking-tight mt-1">
                    {countMode === "DISTINCT format" ? "2 Unique Formats" : `${POSTS.length} Rows`}
                  </div>
                  <div className="text-[11.5px] text-text-muted font-medium mt-1">
                    COUNT steps through table rows one-by-one to tally total matched rows.
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POSTS.map((r, idx) => (
                    <div
                      key={r.id}
                      className="flex flex-col items-center justify-center rounded-lg border border-border bg-panel p-2.5 text-center shadow-[var(--shadow-row)]"
                    >
                      <span className="font-mono text-[9.5px] text-text-muted">Row #{r.id}</span>
                      <span className="font-mono text-[15px] font-extrabold text-accent">+{idx + 1}</span>
                      <span className="truncate max-w-[110px] text-[11px] font-semibold text-text">@{r.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUM Active Running Accumulator */}
            {func === "SUM" && (
              <div className="flex flex-col gap-3.5">
                {/* Header Summary: Clean White Card with Crisp High-Contrast Text */}
                <div className="rounded-xl border border-border bg-panel p-4 shadow-[var(--shadow-row)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10.5px] uppercase text-text-muted font-bold tracking-wider">
                        Cumulative Total Sum
                      </div>
                      <div className="font-mono text-[32px] font-black text-text tracking-tight mt-0.5">
                        {numericData.totalSum.toLocaleString()} <span className="text-[18px] font-bold text-accent">{unitLabel}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-panel-2 px-3 py-1.5 font-mono text-[11.5px] font-semibold text-text">
                      Formula: row₁ + row₂ + ... + row₂₀
                    </div>
                  </div>
                </div>

                {/* Addition Stream */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="flex items-center justify-between border-b border-border pb-2 font-mono text-[11px] text-text-muted font-bold">
                    <span>Row & Metric Added</span>
                    <span>Running Total Accumulator</span>
                  </div>

                  <div className="mt-2.5 flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {numericData.stream.map((item) => (
                      <div
                        key={item.row.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10.5px] text-text-muted flex-none">#{item.row.id}</span>
                          <span className="truncate font-semibold text-text">@{item.row.username}</span>
                          <span className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold flex-none border",
                            isLikes
                              ? "bg-bad/10 border-bad/30 text-bad"
                              : "bg-flow/10 border-flow/30 text-flow"
                          )}>
                            <Plus className="h-3 w-3" strokeWidth={2.5} />
                            {isLikes ? <Heart className="h-2.5 w-2.5 fill-current" /> : <Eye className="h-2.5 w-2.5" />}
                            {item.val.toLocaleString()} {unitLabel}
                          </span>
                        </div>

                        {/* High-Contrast Running Total Pill */}
                        <div className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1 font-mono flex-none shadow-xs">
                          <span className="text-[10px] text-text-muted font-bold uppercase">SUM:</span>
                          <span className="text-[13px] font-black text-text">
                            {item.runningTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AVG Active Calculation */}
            {func === "AVG" && (
              <div className="flex flex-col gap-3.5">
                {/* Formula Breakdown */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="font-mono text-[10.5px] uppercase text-text-muted font-bold tracking-wider">
                    Arithmetic Mean Formula
                  </div>
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                    <div className="rounded-lg bg-panel-2 p-2.5 border border-border text-center">
                      <div className="text-[9.5px] text-text-muted uppercase font-bold">SUM({numericCol})</div>
                      <div className="font-black text-text text-[17px] mt-0.5">{numericData.totalSum.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg bg-panel-2 p-2.5 border border-border text-center">
                      <div className="text-[9.5px] text-text-muted uppercase font-bold">COUNT(*)</div>
                      <div className="font-black text-text text-[17px] mt-0.5">{numericData.count} posts</div>
                    </div>
                    <div className="rounded-lg bg-accent/10 p-2.5 border-2 border-accent text-center">
                      <div className="text-[9.5px] text-accent uppercase font-black">Average Benchmark</div>
                      <div className="text-[18px] font-black text-accent mt-0.5">{numericData.avg} {unitLabel}</div>
                    </div>
                  </div>
                </div>

                {/* Row vs Average Stream */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="flex items-center justify-between border-b border-border pb-2 font-mono text-[11px] text-text-muted font-bold">
                    <span>Row & Metric Value</span>
                    <span>Deviation from Average ({numericData.avg})</span>
                  </div>

                  <div className="mt-2.5 flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {numericData.stream.map((item) => {
                      const diff = Math.round((item.val - numericData.avg) * 10) / 10;
                      const isAbove = diff >= 0;

                      return (
                        <div
                          key={item.row.id}
                          className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10.5px] text-text-muted flex-none">#{item.row.id}</span>
                            <span className="truncate font-semibold text-text">@{item.row.username}</span>
                            <span className={cn(
                              "flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold flex-none border",
                              isLikes
                                ? "bg-bad/10 border-bad/30 text-bad"
                                : "bg-flow/10 border-flow/30 text-flow"
                            )}>
                              {isLikes ? <Heart className="h-2.5 w-2.5 fill-current" /> : <Eye className="h-2.5 w-2.5" />}
                              {item.val.toLocaleString()} {unitLabel}
                            </span>
                          </div>

                          <div className="flex-none">
                            {isAbove ? (
                              <span className="flex items-center gap-1 rounded-full bg-ok/10 border border-ok/40 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-ok shadow-xs">
                                <TrendingUp className="h-3 w-3 text-ok" strokeWidth={2.5} />
                                +{diff} above avg
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 rounded-full bg-bad/10 border border-bad/30 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-bad shadow-xs">
                                <TrendingDown className="h-3 w-3 text-bad" strokeWidth={2.5} />
                                {diff} below avg
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MIN & MAX Active Scanner */}
            {(func === "MIN" || func === "MAX") && (
              <div className="flex flex-col gap-3.5">
                {/* Champion Banner Card */}
                <div className="rounded-xl border-2 border-accent bg-panel p-4 shadow-[var(--shadow-row)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                        <Crown className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[13px] font-extrabold text-text">
                        {func === "MAX" ? "Highest Record (MAX)" : "Lowest Record (MIN)"}
                      </span>
                    </div>
                    <span className="rounded-full bg-accent text-accent-ink px-3 py-0.5 font-mono text-[11.5px] font-bold shadow-xs">
                      {func === "MAX" ? numericData.maxVal : numericData.minVal} {unitLabel}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-panel-2 p-3">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-accent-ink font-mono text-[13px] font-bold">
                      #{func === "MAX" ? numericData.maxRow.id : numericData.minRow.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-[13.5px] text-text">
                        @{func === "MAX" ? numericData.maxRow.username : numericData.minRow.username}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted mt-0.5">
                        Format: <b className="text-text">{func === "MAX" ? numericData.maxRow.format : numericData.minRow.format}</b> ·{" "}
                        {unitLabel}: <b className="text-accent font-extrabold">{func === "MAX" ? numericData.maxVal : numericData.minVal}</b>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Scanner Stream */}
                <div className="rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
                  <div className="flex items-center justify-between border-b border-border pb-2 font-mono text-[11px] text-text-muted font-bold">
                    <span>Row Scanner (Looking for {func})</span>
                    <span>Status</span>
                  </div>

                  <div className="mt-2.5 flex max-h-[340px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {numericData.stream.map((item) => {
                      const isChampion =
                        func === "MAX"
                          ? item.val === numericData.maxVal
                          : item.val === numericData.minVal;

                      return (
                        <div
                          key={item.row.id}
                          className={cn(
                            "flex items-center justify-between gap-2.5 rounded-lg border px-3 py-2 text-[12px] transition-all",
                            isChampion
                              ? "border-2 border-accent bg-accent/10 shadow-xs"
                              : "border-border bg-panel-2"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] text-text-muted flex-none">#{item.row.id}</span>
                            <span className={cn(
                              "truncate font-semibold",
                              isChampion ? "text-accent font-bold" : "text-text"
                            )}>
                              @{item.row.username}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono flex-none">
                            <span className={cn(
                              "text-[12.5px]",
                              isChampion ? "font-black text-accent" : "font-semibold text-text"
                            )}>
                              {item.val.toLocaleString()} {unitLabel}
                            </span>
                            {isChampion && (
                              <span className="rounded-full bg-accent text-accent-ink px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                                🏆 {func}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: SELECT RESULT (The Grand Condensed Output)                        */}
        {/* ========================================================================= */}
        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Stage Info Header */}
            <div className="rounded-xl border border-ok/40 bg-ok/10 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-ok flex-none" />
                <div>
                  <h3 className="font-mono text-[14px] font-bold text-ok">
                    Stage 3: SELECT RESULT — Query Complete!
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-text-muted">
                    {func === "DISTINCT"
                      ? "MySQL has finished deduplicating the table and emits the unique result set."
                      : "MySQL has condensed all 20 source rows into exactly 1 scalar summary row."}
                  </p>
                </div>
              </div>
            </div>

            {/* Result Presentation */}
            {func === "DISTINCT" ? (
              <div className="rounded-xl border border-border bg-panel p-5 shadow-[var(--shadow-row)]">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Final Output: DISTINCT {distinctCol}
                  </span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] font-bold text-accent">
                    {distinctData.uniqueValues.length} rows returned
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {distinctData.uniqueValues.map((u, i) => (
                    <div
                      key={u.value}
                      className="flex items-center justify-between rounded-xl border border-border bg-panel-2 p-3.5 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-ink">
                          {i + 1}
                        </span>
                        <span className="font-mono text-[15px] font-black text-text">
                          &apos;{u.value}&apos;
                        </span>
                      </div>
                      <span className="font-mono text-[12px] text-text-muted font-medium">
                        Matched in <b className="text-text">{u.count}</b> rows
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Grand 1x1 Scalar Output Matrix */
              <div className="rounded-xl border border-border bg-panel p-6 shadow-[var(--shadow-row)] text-center">
                <div className="font-mono text-[11px] font-bold tracking-wider text-text-muted uppercase">
                  1x1 Scalar Result Emitted by SELECT
                </div>

                <div className="mt-4 flex flex-col items-center justify-center">
                  <div className="font-mono text-[44px] font-black text-accent tracking-tight">
                    {scalarVal}
                  </div>
                  <div className="mt-1 font-mono text-[13px] text-text-muted font-bold">
                    {scalarFormula}
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-border bg-panel-2 p-3.5 text-[12px] text-text-muted text-left leading-relaxed">
                  💡 <b>Why exactly 1 row?</b> In SQL, when you apply an aggregate function like <code className="font-mono font-bold text-accent">{func}()</code> without a <code className="font-mono text-text">{func === "COUNT" ? "" : "GROUP BY"}</code> clause, the database treats the entire table as one single group and summarizes it into a single scalar value.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
