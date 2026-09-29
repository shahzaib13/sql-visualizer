"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { POSTS } from "@/lib/data";
import { aggLabel } from "@/lib/groupByEngine";
import { evaluateHaving, HV_STAGES } from "@/lib/havingEngine";
import { cn } from "@/lib/utils";
import { useHavingStore } from "@/store/useHavingStore";
import { BUCKET_COLORS, RowChip } from "../shared/RowChip";

export function HavingHoodPanel() {
  const stage = useHavingStore((s) => s.stage);
  const groupCol = useHavingStore((s) => s.groupCol);
  const metricCol = useHavingStore((s) => s.metricCol);
  const aggFn = useHavingStore((s) => s.aggFn);
  const havingOp = useHavingStore((s) => s.havingOp);
  const havingValue = useHavingStore((s) => s.havingValue);

  const grouped = stage >= 1;
  const evaluated = stage >= 2;
  const selected = stage >= 3;
  const results = evaluateHaving(groupCol, metricCol, aggFn, havingOp, havingValue);
  const visibleResults = selected ? results.filter((r) => r.passes) : results;

  const caption = [
    "Every row from posts is still separate — nothing has been grouped yet.",
    `Rows with the same ${groupCol} slide together into one bucket.`,
    `HAVING checks each bucket's ${aggLabel(aggFn, metricCol)} against ${havingOp} ${havingValue} — failing buckets get rejected, not the rows inside them.`,
    "Rejected buckets are gone for good — SELECT only ever sees the survivors.",
  ][stage];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{HV_STAGES.length} · {HV_STAGES[stage]}
        </span>
      </div>
      <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 4 clauses recognised
        </div>
        <motion.p
          key={caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-border bg-panel p-2.5 text-[11.5px] leading-relaxed text-text-muted shadow-[var(--shadow-row)]"
        >
          {caption}
        </motion.p>

        {!grouped ? (
          <div className="flex flex-wrap gap-2">
            {POSTS.map((row) => (
              <RowChip key={row.id} row={row} dimmed={false} layoutPrefix="hv-row" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {visibleResults.map((g) => {
                const idx = results.indexOf(g);
                const color = BUCKET_COLORS[idx % BUCKET_COLORS.length];
                const rejected = evaluated && !g.passes;
                return (
                  <motion.div
                    key={g.key}
                    layout
                    initial={false}
                    exit={{ opacity: 0, scale: 0.85, height: 0, marginBottom: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className={cn("overflow-hidden rounded-2xl border-2 p-3", rejected && "border-dashed")}
                    style={{
                      borderColor: rejected ? "var(--bad)" : color,
                      opacity: rejected ? 0.55 : 1,
                    }}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold text-white"
                        style={{ backgroundColor: rejected ? "var(--bad)" : color }}
                      >
                        {groupCol} = &quot;{g.key}&quot;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-text">{g.value}</span>
                        {evaluated && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded-full text-white",
                              g.passes ? "bg-ok" : "bg-bad",
                            )}
                          >
                            {g.passes ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.rows.map((row) => (
                        <RowChip key={row.id} row={row} dimmed={evaluated} layoutPrefix="hv-row" />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
