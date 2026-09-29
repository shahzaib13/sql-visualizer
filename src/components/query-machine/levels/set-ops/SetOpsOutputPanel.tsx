"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { combine, SETOPS_STAGES } from "@/lib/setOpsEngine";
import { useSetOpsStore } from "@/store/useSetOpsStore";

export function SetOpsOutputPanel() {
  const stage = useSetOpsStore((s) => s.stage);
  const op = useSetOpsStore((s) => s.op);
  const setStage = useSetOpsStore((s) => s.setStage);
  const computed = stage >= 2;
  const rows = combine(op);

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-[26px] font-bold">{computed ? rows.length : "?"}</span>
        <span className="text-[11.5px] text-text-muted">row{rows.length === 1 ? "" : "s"} returned</span>
      </div>

      {!computed ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
          Combine hasn&apos;t run yet — advance to the COMBINE stage to see the result.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 380, damping: 30 }}
              className="flex items-center gap-2.5 rounded-md border border-border bg-panel px-2.5 py-2 shadow-[var(--shadow-row)]"
            >
              <span className="w-5 flex-none font-mono text-[10px] text-text-muted">{String(row.id).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{row.username}</span>
              <span className="w-[42px] flex-none truncate font-mono text-[10.5px] text-text-muted">{row.format}</span>
              <span className="flex flex-none gap-2.5 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-bad">
                  <Heart className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
                  {row.likes_count}
                </span>
                <span className="flex items-center gap-1 text-flow">
                  <Eye className="h-2.5 w-2.5" />
                  {row.views_count}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {stage < SETOPS_STAGES.length - 1 && (
        <button
          type="button"
          onClick={() => setStage(stage + 1)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          Advance to {SETOPS_STAGES[stage + 1]}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
