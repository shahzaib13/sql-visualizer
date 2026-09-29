"use client";

import { AnimatePresence, motion } from "framer-motion";
import { aggLabel, GB_STAGES, groupRows } from "@/lib/groupByEngine";
import { cn } from "@/lib/utils";
import { useGroupByStore } from "@/store/useGroupByStore";
import type { PostRow } from "@/lib/data";
import { POSTS } from "@/lib/data";

const BUCKET_COLORS = ["var(--accent)", "var(--flow)", "var(--ok)", "var(--warn)", "var(--bad)"];

function RowChip({ row, dimmed }: { row: PostRow; dimmed: boolean }) {
  return (
    <motion.div
      layoutId={`gb-row-${row.id}`}
      layout
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      animate={{ opacity: dimmed ? 0.55 : 1, scale: dimmed ? 0.92 : 1 }}
      className="flex flex-none items-center gap-1.5 rounded-full border border-border bg-panel px-2.5 py-1 font-mono text-[10.5px] font-semibold shadow-[var(--shadow-row)]"
    >
      <span className="text-text-muted">#{row.id}</span>
      {row.username}
    </motion.div>
  );
}

export function GroupByHoodPanel() {
  const stage = useGroupByStore((s) => s.stage);
  const groupCol = useGroupByStore((s) => s.groupCol);
  const metricCol = useGroupByStore((s) => s.metricCol);
  const aggFn = useGroupByStore((s) => s.aggFn);
  const grouped = stage >= 1;
  const computed = stage >= 2;
  const groups = groupRows(groupCol, metricCol, aggFn);

  const caption = [
    "Every row from posts is still separate — nothing has been grouped yet.",
    `Rows with the same ${groupCol} slide together into one bucket — watch them travel.`,
    `Each bucket collapses to a single row: ${aggLabel(aggFn, metricCol)} computed per group.`,
  ][stage];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">{GB_STAGES[stage]}</span>
      </div>
      <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-xl border border-border bg-panel p-2.5 text-[11.5px] leading-relaxed text-text-muted shadow-[var(--shadow-row)]"
          >
            {caption}
          </motion.p>
        </AnimatePresence>

        {!grouped ? (
          <div className="flex flex-wrap gap-2">
            {POSTS.map((row) => (
              <RowChip key={row.id} row={row} dimmed={false} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((g, i) => (
              <motion.div
                key={g.key}
                layout
                className="rounded-2xl border-2 p-3"
                style={{ borderColor: BUCKET_COLORS[i % BUCKET_COLORS.length] }}
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 font-mono text-[11px] font-bold text-white"
                    style={{ backgroundColor: BUCKET_COLORS[i % BUCKET_COLORS.length] }}
                  >
                    {groupCol} = &quot;{g.key}&quot;
                  </span>
                  <AnimatePresence mode="wait">
                    {computed && (
                      <motion.span
                        key={`${g.key}-${g.value}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="font-mono text-lg font-bold text-text"
                      >
                        {g.value}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className={cn("flex flex-wrap gap-2 transition-all", computed && "opacity-70")}>
                  {g.rows.map((row) => (
                    <RowChip key={row.id} row={row} dimmed={computed} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
