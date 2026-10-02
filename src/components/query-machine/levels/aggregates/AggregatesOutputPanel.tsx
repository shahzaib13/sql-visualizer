"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import {
  AGG_STAGES,
  computeDistinct,
  computeNumericScan,
} from "@/lib/aggregatesEngine";
import { POSTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAggregatesStore } from "@/store/useAggregatesStore";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";
import { useTranslation } from "@/lib/i18n/useTranslation";

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function AggregatesOutputPanel() {
  const { t } = useTranslation();
  const [view, setView] = useState<"output" | "input">("output");
  const stage = useAggregatesStore((s) => s.stage);
  const setStage = useAggregatesStore((s) => s.setStage);
  const func = useAggregatesStore((s) => s.func);
  const numericCol = useAggregatesStore((s) => s.numericCol);
  const distinctCol = useAggregatesStore((s) => s.distinctCol);
  const countMode = useAggregatesStore((s) => s.countMode);

  const distinctData = computeDistinct(distinctCol);
  const numericData = computeNumericScan(numericCol);

  const isComputed = stage === 2;

  // Scalar value calculation
  let scalarVal: string | number = 0;
  let scalarColumnLabel = `${func}(${numericCol})`;

  if (func === "COUNT") {
    scalarVal = countMode === "DISTINCT format" ? 2 : POSTS.length;
    scalarColumnLabel = `COUNT(${countMode})`;
  } else if (func === "SUM") {
    scalarVal = numericData.totalSum.toLocaleString();
    scalarColumnLabel = `SUM(${numericCol})`;
  } else if (func === "AVG") {
    scalarVal = numericData.avg;
    scalarColumnLabel = `AVG(${numericCol})`;
  } else if (func === "MIN") {
    scalarVal = numericData.minVal.toLocaleString();
    scalarColumnLabel = `MIN(${numericCol})`;
  } else if (func === "MAX") {
    scalarVal = numericData.maxVal.toLocaleString();
    scalarColumnLabel = `MAX(${numericCol})`;
  }

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-4 text-text">
      {/* Input vs Output View Switcher */}
      <div className="flex rounded-lg border border-border bg-panel-2 p-0.5">
        {(["input", "output"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "flex-1 rounded-md py-1.5 font-mono text-[11px] font-semibold transition-colors",
              view === v ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text"
            )}
          >
            {v === "input" ? t.output.inputTab : t.output.outputTab}
          </button>
        ))}
      </div>

      {view === "input" ? (
        <div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{POSTS.length}</span>
            <span className="text-[11.5px] text-text-muted">raw source rows in posts</span>
          </div>
          <p className="mt-1 mb-3 text-[11px] text-text-muted leading-relaxed">
            Raw rows before applying <b className="font-mono text-text">{func}</b>. Aggregates summarize all 20 rows into 1 value, whereas DISTINCT eliminates duplicate rows.
          </p>

          <SchemaCard
            tableName="posts"
            columns={POSTS_SCHEMA}
            highlight={[func === "DISTINCT" ? distinctCol : numericCol]}
          />

          <div className="w-full min-w-0 pb-2">
            <div className="mt-3.5 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
              <span className="w-4 flex-none">id</span>
              <span className={cn("min-w-0 flex-1 truncate", func === "DISTINCT" && distinctCol === "username" && "text-accent font-bold")}>
                user
              </span>
              <span className={cn("w-12 flex-none text-center", func === "DISTINCT" && distinctCol === "format" && "text-accent font-bold")}>
                format
              </span>
              <span className={cn("w-10 flex-none text-right", numericCol === "likes_count" && "text-accent font-bold")}>
                likes
              </span>
              <span className={cn("w-11 flex-none text-right", numericCol === "views_count" && "text-accent font-bold")}>
                views
              </span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {POSTS.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]"
                >
                  <span className="w-4 flex-none font-mono text-[10px] text-text-muted">
                    {String(r.id).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-text">{r.username}</span>
                  <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">
                    {r.format}
                  </span>
                  <span className="flex w-10 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-bad font-semibold">
                    <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                    {r.likes_count}
                  </span>
                  <span className="flex w-11 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-flow font-semibold">
                    <Eye className="h-2.5 w-2.5" />
                    {r.views_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">
              {!isComputed ? "?" : func === "DISTINCT" ? distinctData.uniqueValues.length : 1}
            </span>
            <span className="text-[11.5px] text-text-muted">
              {func === "DISTINCT" ? "unique rows returned" : "scalar row returned"}
            </span>
          </div>

          {!isComputed ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
              <p>{t.output.selectNotRunYet}</p>
              <button
                type="button"
                onClick={() => setStage(2)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-mono text-[11px] font-bold text-accent-ink"
              >
                {t.output.advanceTo} SELECT
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : func === "DISTINCT" ? (
            /* Output for DISTINCT */
            <div className="mt-4 w-full min-w-0 pb-2">
              <div className="w-full overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
                <div className="border-b border-border bg-panel-2 px-3.5 py-2 font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
                  {distinctCol}
                </div>
                {distinctData.uniqueValues.map((u, i) => (
                  <motion.div
                    key={u.value}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border-b border-border px-3.5 py-2.5 last:border-b-0 text-[12.5px]"
                  >
                    <span className="font-mono font-bold text-text">{u.value}</span>
                    <span className="font-mono text-[11px] text-text-muted">
                      ({u.count} occurrence{u.count === 1 ? "" : "s"})
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* Output for Scalar Aggregates (COUNT, SUM, AVG, MIN, MAX) */
            <div className="mt-4 w-full min-w-0 pb-2">
              <div className="w-full overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
                <div className="border-b border-border bg-panel-2 px-3.5 py-2 font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
                  {scalarColumnLabel}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4"
                >
                  <span className="font-mono text-[24px] font-bold text-accent">
                    {scalarVal}
                  </span>
                  <span className="rounded bg-accent/15 px-2 py-1 font-mono text-[10.5px] font-semibold text-accent">
                    1 x 1 Scalar Matrix
                  </span>
                </motion.div>
              </div>

              <div className="mt-3 rounded-lg border border-border bg-panel-2 p-3 text-[11.5px] text-text-muted leading-relaxed">
                💡 <b>Aggregate Result:</b> In SQL, when you run <code className="text-code-fn">{func}()</code> without a <code className="text-code-kw">GROUP BY</code> clause, the entire table is treated as one single group, yielding exactly <b>1 row</b> with the final calculation.
              </div>
            </div>
          )}

          {stage < AGG_STAGES.length - 1 && (
            <button
              type="button"
              onClick={() => setStage(stage + 1)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
            >
              {t.output.advanceTo} {AGG_STAGES[stage + 1]}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
