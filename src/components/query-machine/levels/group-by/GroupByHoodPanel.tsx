"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Layers, Table2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { aggLabel, GB_STAGES, groupRows } from "@/lib/groupByEngine";
import { cn } from "@/lib/utils";
import { useGroupByStore } from "@/store/useGroupByStore";
import { POSTS } from "@/lib/data";
import { BUCKET_COLORS, RowChip } from "../shared/RowChip";

export function GroupByHoodPanel() {
  const stage = useGroupByStore((s) => s.stage);
  const groupCol = useGroupByStore((s) => s.groupCol);
  const metricCol = useGroupByStore((s) => s.metricCol);
  const aggFn = useGroupByStore((s) => s.aggFn);
  const grouped = stage >= 1;
  const computed = stage >= 2;
  const groups = groupRows(groupCol, metricCol, aggFn);

  // Jump the scroll position back to the top whenever the command panel's stage
  // changes, so the new state is always what's on screen, not scrolled away.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  const firstGroup = groups[0];
  const caption = [
    `Every row is read from disk into memory first — all ${POSTS.length}, still one at a time, nothing grouped yet.`,
    `Rows with the same ${groupCol} slide together into one bucket — watch them travel. e.g. every row where ${groupCol} = "${firstGroup?.key}" lands in the same bucket.`,
    `Each bucket collapses to a single row: e.g. bucket "${firstGroup?.key}" has ${firstGroup?.rows.length} row${firstGroup?.rows.length === 1 ? "" : "s"}, so ${aggLabel(aggFn, metricCol)} = ${firstGroup?.value}.`,
  ][stage];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{GB_STAGES.length} · {GB_STAGES[stage]}
        </span>
      </div>
      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 3 clauses recognised
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
          <>
            <div className="mb-3 rounded-xl border border-border bg-panel p-3.5 shadow-[var(--shadow-row)]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-mono text-[12.5px] font-bold">
                  <Table2 className="h-3.5 w-3.5 text-text-muted" />
                  FROM posts
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
                  Base table
                </span>
              </div>
              <p className="mt-1.5 text-[10.5px] text-text-muted">
                Loads every row from the table — {POSTS.length} rows read, still flat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POSTS.map((row) => (
                <RowChip key={row.id} row={row} dimmed={false} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((g, i) => {
              const bucketColor = BUCKET_COLORS[i % BUCKET_COLORS.length];
              return (
                <motion.div
                  key={g.key}
                  layout
                  className="relative overflow-hidden rounded-2xl border-2 bg-panel shadow-sm transition-all"
                  style={{ borderColor: bucketColor }}
                >
                  {/* Bucket Top Rim / Opening */}
                  <div
                    className="flex items-center justify-between px-3.5 py-2.5"
                    style={{ backgroundColor: `color-mix(in srgb, ${bucketColor} 12%, var(--panel))` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-6 w-6 place-items-center rounded-lg text-white shadow-xs"
                        style={{ backgroundColor: bucketColor }}
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-[12px] font-bold text-text">
                        {groupCol} = &quot;{g.key}&quot;
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-panel px-2 py-0.5 font-mono text-[9.5px] font-bold text-text-muted">
                        {g.rows.length} rows collected
                      </span>

                      <AnimatePresence>
                        {computed && (
                          <motion.span
                            key={`${g.key}-${g.value}`}
                            initial={{ opacity: 0, scale: 0.5, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 450, damping: 20 }}
                            className="flex items-baseline gap-1 rounded-md bg-panel px-2 py-0.5 font-mono shadow-xs border border-border"
                          >
                            <span className="text-[9px] text-text-muted">{aggLabel(aggFn, metricCol)}:</span>
                            <span className="text-[13px] font-bold text-accent">{g.value}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Physics Drop Slit */}
                  <div
                    className="h-1 w-full opacity-60"
                    style={{ backgroundColor: bucketColor }}
                  />

                  {/* Bucket Interior: Rows fall into the basket */}
                  <div className="p-3.5">
                    <div className={cn("flex flex-wrap gap-2 transition-opacity", computed && "opacity-75")}>
                      {g.rows.map((row, ri) => (
                        <motion.div
                          key={row.id}
                          initial={{ y: -30, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{
                            delay: ri * 0.035,
                            type: "spring",
                            stiffness: 360,
                            damping: 22,
                          }}
                        >
                          <RowChip row={row} dimmed={computed} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
