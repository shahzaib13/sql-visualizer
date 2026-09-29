"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { AGG_FNS, GB_STAGES, GROUP_COLUMNS, METRIC_COLUMNS, aggLabel, groupRows } from "@/lib/groupByEngine";
import { POSTS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { useGroupByStore } from "@/store/useGroupByStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";

function useAutoPlay() {
  const isPlaying = useGroupByStore((s) => s.isPlaying);
  const setPlaying = useGroupByStore((s) => s.setPlaying);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(() => {
        useGroupByStore.setState((s) => ({ stage: (s.stage + 1) % GB_STAGES.length }));
      }, 1600);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying]);

  return { isPlaying, togglePlay: () => setPlaying(!isPlaying) };
}

function SqlBlock() {
  const stage = useGroupByStore((s) => s.stage);
  const groupCol = useGroupByStore((s) => s.groupCol);
  const metricCol = useGroupByStore((s) => s.metricCol);
  const aggFn = useGroupByStore((s) => s.aggFn);
  const setStage = useGroupByStore((s) => s.setStage);
  const activeName = GB_STAGES[stage];
  const agg = aggLabel(aggFn, metricCol);

  const parts: Record<string, React.ReactNode> = {
    SELECT: (
      <>
        <span className="font-bold text-code-kw">SELECT</span> {groupCol},{" "}
        <span className="text-code-val">{agg}</span> <span className="text-text-muted">AS value</span>
      </>
    ),
    FROM: (
      <>
        <span className="font-bold text-code-kw">FROM</span> posts
      </>
    ),
    "GROUP BY": (
      <>
        <span className="font-bold text-code-kw">GROUP BY</span> {groupCol}
      </>
    ),
  };

  const order: (typeof GB_STAGES)[number][] = ["SELECT", "FROM", "GROUP BY"];

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      {order.map((clause, i) => (
        <span key={clause}>
          <span
            onClick={() => setStage(GB_STAGES.indexOf(clause))}
            className={cn(
              "-my-px -mx-[3px] cursor-pointer rounded px-[3px] py-px transition-colors hover:bg-border",
              clause === activeName && "bg-accent/16",
            )}
          >
            {parts[clause]}
          </span>
          {i < order.length - 1 ? " " : ";"}
        </span>
      ))}
    </div>
  );
}

function StatusLine() {
  const stage = useGroupByStore((s) => s.stage);
  const groupCol = useGroupByStore((s) => s.groupCol);
  const metricCol = useGroupByStore((s) => s.metricCol);
  const aggFn = useGroupByStore((s) => s.aggFn);
  const groups = groupRows(groupCol, metricCol, aggFn);

  const text = [
    `FROM posts — ${POSTS.length} rows loaded, still flat`,
    `GROUP BY ${groupCol} — collapsed into ${groups.length} groups`,
    `SELECT ${groupCol}, ${aggLabel(aggFn, metricCol)} — ${groups.length} row(s) returned`,
  ][stage];

  return (
    <div className="mt-3.5 flex min-h-8 items-center overflow-hidden rounded-md border border-border bg-panel-2 px-3 py-2 font-mono text-[11.5px] text-flow">
      <motion.span key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {text}
      </motion.span>
    </div>
  );
}

function ExecutionTimeline() {
  const stage = useGroupByStore((s) => s.stage);
  const setStage = useGroupByStore((s) => s.setStage);
  const reset = useGroupByStore((s) => s.reset);
  const { isPlaying, togglePlay } = useAutoPlay();

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="flex items-center gap-2.5">
        <div className="flex flex-none gap-1.5">
          <button
            type="button"
            onClick={reset}
            title="Reset"
            aria-label="Reset"
            className="grid h-8 w-8 flex-none place-items-center rounded-full border border-border bg-panel-2 text-text transition-all hover:-translate-y-px hover:border-accent active:scale-90"
          >
            <RotateCcw className="h-[13px] w-[13px]" />
          </button>
          <motion.button
            type="button"
            onClick={togglePlay}
            title="Play"
            aria-label="Play through stages"
            className="grid h-8 w-8 flex-none place-items-center rounded-full border border-accent bg-accent text-accent-ink active:scale-90"
            animate={isPlaying ? { boxShadow: ["0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent)", "0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent)"] } : {}}
            transition={isPlaying ? { duration: 1.6, repeat: Infinity } : {}}
          >
            <Play className="h-[13px] w-[13px]" />
          </motion.button>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-3">
          {GB_STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(i)}
              className={cn(
                "rounded-md px-1 py-2 text-center font-mono text-[10.5px] font-semibold tracking-wide text-text-muted transition-colors hover:text-text",
                i === stage && "bg-accent/12 text-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <StatusLine />
    </div>
  );
}

function GroupByColumnCard() {
  const groupCol = useGroupByStore((s) => s.groupCol);
  const setGroupCol = useGroupByStore((s) => s.setGroupCol);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">GROUP BY column</label>
      <div className="flex flex-wrap gap-1.5">
        {GROUP_COLUMNS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setGroupCol(c)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
              c === groupCol ? "border-accent bg-accent/16 text-accent" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        rows with the same {groupCol} collapse into one group.
      </p>
    </div>
  );
}

function AggregateCard() {
  const aggFn = useGroupByStore((s) => s.aggFn);
  const metricCol = useGroupByStore((s) => s.metricCol);
  const setAggFn = useGroupByStore((s) => s.setAggFn);
  const setMetricCol = useGroupByStore((s) => s.setMetricCol);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">Aggregate function</label>
      <div className="flex flex-wrap gap-1.5">
        {AGG_FNS.map((fn) => (
          <button
            key={fn}
            type="button"
            onClick={() => setAggFn(fn)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
              fn === aggFn ? "border-ok bg-ok/18 text-ok" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {fn}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {aggFn !== "COUNT" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <label className="mb-1.5 block text-[10.5px] font-semibold tracking-wide text-text-muted">on column</label>
            <div className="flex flex-wrap gap-1.5">
              {METRIC_COLUMNS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMetricCol(c)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
                    c === metricCol ? "border-accent bg-accent/16 text-accent" : "border-border bg-panel text-text-muted hover:text-text",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        {aggFn === "COUNT" ? "counts how many rows fell into each group." : `computes the ${aggFn.toLowerCase()} of ${metricCol} within each group.`}
      </p>
    </div>
  );
}

export function GroupByCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="This query stops looking at posts one row at a time. Instead it sorts every row into buckets that share the same value — for example, every image post in one bucket and every video post in another — and then calculates a single summary number for each bucket, like &ldquo;how many posts are in this bucket?&rdquo; GROUP BY runs before SELECT: MySQL first builds the buckets, then computes one value per bucket."
        keywords={[
          { term: "GROUP BY", note: GLOSSARY["GROUP BY"] },
          { term: "COUNT(*)", note: GLOSSARY["COUNT(*)"] },
          { term: "SUM", note: GLOSSARY.SUM },
          { term: "AVG", note: GLOSSARY.AVG },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div className="mt-5 flex flex-col gap-3">
        <GroupByColumnCard />
        <AggregateCard />
        <QuizCard level="group-by" />
      </div>
    </div>
  );
}
