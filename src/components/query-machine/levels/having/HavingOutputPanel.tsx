"use client";

import { motion } from "framer-motion";
import { aggLabel } from "@/lib/groupByEngine";
import { evaluateHaving } from "@/lib/havingEngine";
import { useHavingStore } from "@/store/useHavingStore";
import { BUCKET_COLORS } from "../shared/RowChip";

export function HavingOutputPanel() {
  const stage = useHavingStore((s) => s.stage);
  const groupCol = useHavingStore((s) => s.groupCol);
  const metricCol = useHavingStore((s) => s.metricCol);
  const aggFn = useHavingStore((s) => s.aggFn);
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);
  const selected = stage >= 3;

  const results = evaluateHaving(groupCol, metricCol, aggFn, havingOp, havingValue);
  const passing = results.filter((r) => r.passes);

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-[26px] font-bold">{selected ? passing.length : "?"}</span>
        <span className="text-[11.5px] text-text-muted">row{passing.length === 1 ? "" : "s"} returned</span>
      </div>

      {!selected ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
          SELECT hasn&apos;t run yet — advance to the SELECT stage to see which groups survived HAVING.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
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
      )}
    </div>
  );
}
