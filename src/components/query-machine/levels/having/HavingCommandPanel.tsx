"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { AGG_FNS, GROUP_COLUMNS, groupRows, METRIC_COLUMNS, aggLabel } from "@/lib/groupByEngine";
import { evaluateHaving, HAVING_OPS, HV_STAGES } from "@/lib/havingEngine";
import { POSTS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { useHavingStore } from "@/store/useHavingStore";
import { SliderWithBubble } from "@/components/ui/SliderWithBubble";
import { TheoryCard } from "@/components/query-machine/TheoryCard";

function useAutoPlay() {
  const isPlaying = useHavingStore((s) => s.isPlaying);
  const setPlaying = useHavingStore((s) => s.setPlaying);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(() => {
        useHavingStore.setState((s) => ({ stage: (s.stage + 1) % HV_STAGES.length }));
      }, 1600);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying]);

  return { isPlaying, togglePlay: () => setPlaying(!isPlaying) };
}

function SqlBlock() {
  const stage = useHavingStore((s) => s.stage);
  const groupCol = useHavingStore((s) => s.groupCol);
  const metricCol = useHavingStore((s) => s.metricCol);
  const aggFn = useHavingStore((s) => s.aggFn);
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);
  const setStage = useHavingStore((s) => s.setStage);
  const activeName = HV_STAGES[stage];
  const agg = aggLabel(aggFn, metricCol);

  const parts: Record<string, React.ReactNode> = {
    SELECT: (
      <>
        <span className="font-bold text-code-kw">SELECT</span> {groupCol}, <span className="text-code-val">{agg}</span>
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
    HAVING: (
      <>
        <span className="font-bold text-code-kw">HAVING</span> {agg} {havingOp} <span className="text-code-num">{havingValue}</span>
      </>
    ),
  };

  const order: (typeof HV_STAGES)[number][] = ["SELECT", "FROM", "GROUP BY", "HAVING"];

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      {order.map((clause, i) => (
        <span key={clause}>
          <span
            onClick={() => setStage(HV_STAGES.indexOf(clause))}
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
  const stage = useHavingStore((s) => s.stage);
  const groupCol = useHavingStore((s) => s.groupCol);
  const metricCol = useHavingStore((s) => s.metricCol);
  const aggFn = useHavingStore((s) => s.aggFn);
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);
  const results = evaluateHaving(groupCol, metricCol, aggFn, havingOp, havingValue);
  const passing = results.filter((r) => r.passes).length;

  const text = [
    `FROM posts — ${POSTS.length} rows loaded, still flat`,
    `GROUP BY ${groupCol} — collapsed into ${results.length} groups`,
    `HAVING ${aggLabel(aggFn, metricCol)} ${havingOp} ${havingValue} — ${passing} of ${results.length} groups survive`,
    `SELECT ${groupCol}, ${aggLabel(aggFn, metricCol)} — ${passing} row(s) returned`,
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
  const stage = useHavingStore((s) => s.stage);
  const setStage = useHavingStore((s) => s.setStage);
  const reset = useHavingStore((s) => s.reset);
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
        <div className="grid min-w-0 flex-1 grid-cols-4">
          {HV_STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(i)}
              className={cn(
                "rounded-md px-1 py-2 text-center font-mono text-[10px] font-semibold tracking-wide text-text-muted transition-colors hover:text-text",
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
  const groupCol = useHavingStore((s) => s.groupCol);
  const setGroupCol = useHavingStore((s) => s.setGroupCol);

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
    </div>
  );
}

function AggregateCard() {
  const aggFn = useHavingStore((s) => s.aggFn);
  const metricCol = useHavingStore((s) => s.metricCol);
  const setAggFn = useHavingStore((s) => s.setAggFn);
  const setMetricCol = useHavingStore((s) => s.setMetricCol);

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
    </div>
  );
}

function HavingCard() {
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);
  const aggFn = useHavingStore((s) => s.aggFn);
  const metricCol = useHavingStore((s) => s.metricCol);
  const setHavingOp = useHavingStore((s) => s.setHavingOp);
  const setHavingValue = useHavingStore((s) => s.setHavingValue);
  const groupCol = useHavingStore((s) => s.groupCol);
  // Derived from the actual data (not a guessed constant) so the slider's range
  // always covers every group's value, whichever column/aggregate is picked.
  const groupValues = groupRows(groupCol, metricCol, aggFn).map((g) => g.value);
  const maxVal = Math.ceil(Math.max(...groupValues, 1) * 1.2);

  return (
    <div className="rounded-xl border-2 border-accent/40 bg-panel-2 p-3.5">
      <label className="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-wide text-text-muted">
        <span>
          HAVING {aggLabel(aggFn, metricCol)} {havingOp} <span className="font-mono text-accent">{havingValue}</span>
        </span>
      </label>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {HAVING_OPS.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setHavingOp(op)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold transition-all hover:-translate-y-px active:scale-95",
              op === havingOp ? "border-accent bg-accent/16 text-accent" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {op}
          </button>
        ))}
      </div>
      <SliderWithBubble
        value={havingValue}
        min={0}
        max={maxVal}
        step={aggFn === "COUNT" ? 1 : 5}
        onChange={setHavingValue}
        formatBubble={(v) => `${havingOp} ${v}`}
        ariaLabel="Having threshold"
      />
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        HAVING filters <b className="text-text">groups</b>, after aggregation — WHERE filters individual rows,
        before grouping.
      </p>
    </div>
  );
}

export function HavingCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="This query groups rows first, computes one number per group, and then throws away whole groups that don't meet a condition — like &ldquo;only show me usernames with more than 2 posts.&rdquo; HAVING runs after GROUP BY: it can only test the group's summary number, never a raw column, which is why it needs its own clause instead of reusing WHERE."
        keywords={[
          { term: "GROUP BY", note: GLOSSARY["GROUP BY"] },
          { term: "HAVING", note: GLOSSARY.HAVING },
          { term: "COUNT(*)", note: GLOSSARY["COUNT(*)"] },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div className="mt-5 flex flex-col gap-3">
        <GroupByColumnCard />
        <AggregateCard />
        <HavingCard />
      </div>
    </div>
  );
}
