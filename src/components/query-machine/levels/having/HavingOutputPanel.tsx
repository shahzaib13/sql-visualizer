"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { POSTS } from "@/lib/data";
import { aggLabel } from "@/lib/groupByEngine";
import { evaluateHaving, HV_STAGES } from "@/lib/havingEngine";
import { cn } from "@/lib/utils";
import { useHavingStore } from "@/store/useHavingStore";
import { BUCKET_COLORS } from "../shared/RowChip";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";
import { useTranslation } from "@/lib/i18n/useTranslation";

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function HavingOutputPanel() {
  const { t } = useTranslation();
  const stage = useHavingStore((s) => s.stage);
  const groupCol = useHavingStore((s) => s.groupCol);
  const metricCol = useHavingStore((s) => s.metricCol);
  const aggFn = useHavingStore((s) => s.aggFn);
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);
  const setStage = useHavingStore((s) => s.setStage);
  const [view, setView] = useState<"input" | "output">("output");
  const selected = stage >= 3;

  const results = evaluateHaving(groupCol, metricCol, aggFn, havingOp, havingValue);
  const passing = results.filter((r) => r.passes);

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <div className="mb-3.5 flex gap-0.5 rounded-lg border border-border bg-panel p-[3px]">
        {(["input", "output"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "flex-1 rounded-md py-1.5 font-mono text-[11px] font-semibold capitalize transition-colors",
              view === v ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text",
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
            Raw rows before grouping and HAVING filtering. The query will evaluate{" "}
            <b className="font-mono text-text">HAVING {aggLabel(aggFn, metricCol)} {havingOp} {havingValue}</b> on each group.
          </p>

          <SchemaCard
            tableName="posts"
            columns={POSTS_SCHEMA}
            highlight={[groupCol, metricCol]}
          />

          <div className="w-full min-w-0 pb-2">
            <div className="mt-3.5 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
              <span className="w-4 flex-none">id</span>
              <span className="min-w-0 flex-1 truncate">user</span>
              <span className={cn("w-12 flex-none text-center", groupCol === "format" && "text-accent font-bold")}>format</span>
              <span className="w-10 flex-none text-right">likes</span>
              <span className="w-11 flex-none text-right">views</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {POSTS.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]"
                >
                  <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(r.id).padStart(2, "0")}</span>
                  <span className={cn("min-w-0 flex-1 truncate font-semibold text-text", groupCol === "username" && "text-accent")}>
                    {r.username}
                  </span>
                  <span className={cn("w-12 flex-none text-center font-mono text-[10px]", groupCol === "format" ? "font-bold text-accent" : "text-text-muted")}>
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
            <span className="text-[26px] font-bold">{selected ? passing.length : "?"}</span>
            <span className="text-[11.5px] text-text-muted">row{passing.length === 1 ? "" : "s"} returned</span>
          </div>

      {!selected ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
          SELECT hasn&apos;t run yet — advance to the SELECT stage to see which groups survived HAVING.
        </p>
      ) : (
        <div className="mt-4 w-full min-w-0 pb-2">
          <div className="w-full overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
            <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border bg-panel-2 px-3.5 py-2 font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
              <span>{groupCol}</span>
              <span>{aggLabel(aggFn, metricCol)}</span>
            </div>
            {passing.map((g, i) => (
              <motion.div
                key={g.key}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 380, damping: 30 }}
                className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border px-3.5 py-2.5 last:border-b-0"
              >
                <span className="flex items-center gap-2 text-[12.5px] font-semibold">
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ backgroundColor: BUCKET_COLORS[results.indexOf(g) % BUCKET_COLORS.length] }}
                  />
                  {g.key}
                  <span className="font-mono text-[10.5px] font-normal text-text-muted">
                    ({g.rows.length} row{g.rows.length === 1 ? "" : "s"})
                  </span>
                </span>
                <span className="font-mono text-[15px] font-bold text-ok">{g.value}</span>
              </motion.div>
            ))}
            {passing.length === 0 && (
              <p className="px-3.5 py-4 text-center text-[12px] text-text-muted">
                No groups survived HAVING — try loosening the threshold.
              </p>
            )}
          </div>
        </div>
      )}

      {stage < HV_STAGES.length - 1 && (
        <button
          type="button"
          onClick={() => setStage(stage + 1)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          {t.output.advanceTo} {HV_STAGES[stage + 1]}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
        </>
      )}
    </div>
  );
}
