"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { joinRows, JOIN_STAGES } from "@/lib/joinEngine";
import { useJoinStore } from "@/store/useJoinStore";

export function JoinOutputPanel() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const setStage = useJoinStore((s) => s.setStage);
  const computed = stage >= 2;
  const rows = joinRows(joinType);

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-[26px] font-bold">{computed ? rows.length : "?"}</span>
        <span className="text-[11.5px] text-text-muted">row{rows.length === 1 ? "" : "s"} returned</span>
      </div>

      {!computed ? (
        <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
          SELECT hasn&apos;t run yet — advance to the SELECT stage to see the joined rows.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 border-b border-border bg-panel-2 px-3.5 py-2 font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
            <span>username</span>
            <span>full_name</span>
            <span>format</span>
            <span>likes</span>
          </div>
          {rows.map((r, i) => (
            <motion.div
              key={`${r.key}-${r.post?.id ?? "null"}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 380, damping: 30 }}
              className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 border-b border-border px-3.5 py-2.5 text-[12px] last:border-b-0"
            >
              <span className="truncate font-semibold">{r.user.username}</span>
              <span className="truncate text-text-muted">{r.user.full_name}</span>
              {r.post ? (
                <>
                  <span className="font-mono text-[11px] text-text-muted">{r.post.format}</span>
                  <span className="font-mono text-[11px] font-bold text-accent">{r.post.likes_count}</span>
                </>
              ) : (
                <span className="col-span-2 justify-self-start rounded-full bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-warn">
                  NULL
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {stage < JOIN_STAGES.length - 1 && (
        <button
          type="button"
          onClick={() => setStage(stage + 1)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          Advance to {JOIN_STAGES[stage + 1]}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
