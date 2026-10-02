"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AGG_FNS, GB_STAGES, GROUP_COLUMNS, METRIC_COLUMNS, aggLabel, groupRows } from "@/lib/groupByEngine";
import { POSTS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { useGroupByStore } from "@/store/useGroupByStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";

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

  const rawSql = `SELECT ${groupCol}, ${agg} AS value
FROM posts
GROUP BY ${groupCol};`;

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">SQL Query</span>
        <CopySqlButton sql={rawSql} />
      </div>
      <div>
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

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-panel-2 p-1">
        {GB_STAGES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(i)}
            className={cn(
              "rounded-md py-1.5 text-center font-mono text-[11px] font-semibold tracking-wide transition-colors",
              i === stage ? "bg-accent text-accent-ink shadow-xs" : "text-text-muted hover:text-text",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-text-muted">
        Click any stage above to watch rows group and aggregate
      </p>
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
      <TheoryCard level="group-by" />
      <SqlBlock />
      <ExecutionTimeline />
      <div id="tour-controls-section" className="mt-5 flex flex-col gap-3">
        <GroupByColumnCard />
        <AggregateCard />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <QuizCard level="group-by" />
        <ChallengeCard level="group-by" />
      </div>
    </div>
  );
}
