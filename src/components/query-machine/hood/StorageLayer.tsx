"use client";

import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { POSTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useQueryStore } from "@/store/useQueryStore";
import { LayerShell } from "./LayerShell";

type PageState = "idle" | "hit" | "miss" | "skip";

export function StorageLayer() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const simIndex = useQueryStore((s) => s.simIndex);
  const setSimIndex = useQueryStore((s) => s.setSimIndex);
  const reached = stage >= 1;

  const states: { row: (typeof POSTS)[number]; state: PageState }[] = POSTS.map((row) => {
    const matches = row.likes_count > threshold;
    let state: PageState = "idle";
    if (reached) state = simIndex ? (matches ? "hit" : "skip") : matches ? "hit" : "miss";
    return { row, state };
  });

  const touched = states.filter((s) => s.state === "hit" || s.state === "miss").length;

  const caption = !reached
    ? "Not reached yet — the storage engine only touches disk once WHERE starts running."
    : simIndex
      ? `Index seek: the index on likes_count already knows which pages hold values > ${threshold}, so MySQL jumps straight to those and skips the rest entirely.`
      : `Full scan: without an index, MySQL has no way to know which rows match ahead of time — so it opens every page, checks likes_count > ${threshold} on each one, then throws away the misses.`;

  return (
    <LayerShell id="storage" index={4} title="Storage engine" subtitle="reads table pages off disk" live={reached}>
      <p className="mb-3 text-[11.5px] leading-relaxed text-text-muted">{caption}</p>

      <div className="flex flex-wrap gap-2">
        {states.map(({ row, state }, i) => (
          <motion.div
            key={row.id}
            animate={{
              scale: 1,
              borderColor:
                state === "hit" ? "var(--ok)" : state === "miss" ? "var(--bad)" : "var(--border)",
              backgroundColor:
                state === "hit"
                  ? "color-mix(in srgb, var(--ok) 16%, var(--panel))"
                  : state === "miss"
                    ? "color-mix(in srgb, var(--bad) 10%, var(--panel))"
                    : "var(--panel)",
              opacity: state === "idle" ? 0.55 : state === "skip" ? 0.4 : 1,
            }}
            whileInView={state !== "idle" ? { scale: [1, 1.16, 1] } : {}}
            transition={{ duration: 0.4, delay: i * 0.035 }}
            title={
              state === "hit"
                ? `P${row.id}: likes_count ${row.likes_count} > ${threshold} → read and kept`
                : state === "miss"
                  ? `P${row.id}: likes_count ${row.likes_count} ≤ ${threshold} → read, then rejected`
                  : state === "skip"
                    ? `P${row.id}: index knew ${row.likes_count} ≤ ${threshold} → never read`
                    : `P${row.id}: not reached yet`
            }
            className={cn(
              "relative flex h-11 w-11 flex-none flex-col items-center justify-center rounded-lg border-[1.5px] font-mono",
              state === "skip" && "border-dashed",
            )}
          >
            <span className="absolute top-0.5 left-1 text-[6.5px] opacity-60">P{row.id}</span>
            <span
              className={cn(
                "text-[9.5px] font-bold",
                state === "hit" && "text-ok",
                state === "miss" && "text-bad",
                (state === "idle" || state === "skip") && "text-text-muted",
              )}
            >
              {row.likes_count}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-3.5 text-[10.5px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm border-[1.5px] border-border bg-panel-2" />
          not read yet
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm border-[1.5px] border-ok bg-ok/30" />
          read
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm border-[1.5px] border-dashed border-warn" />
          skipped by index
        </span>
      </div>

      <p className="mt-2.5 font-mono text-[11.5px]">
        {reached ? (
          <>
            <b className="text-ok">{touched}</b> of 8 pages read
            {simIndex && <> — {8 - touched} skipped</>}.
          </>
        ) : (
          "waiting for WHERE…"
        )}
      </p>

      <label className="mt-3.5 flex cursor-pointer items-center gap-2 font-mono text-[11px] text-text-muted">
        <Switch.Root
          checked={simIndex}
          onCheckedChange={setSimIndex}
          className="relative h-[18px] w-[32px] flex-none rounded-full border border-border bg-panel-2 data-[state=checked]:border-ok data-[state=checked]:bg-ok/30"
        >
          <Switch.Thumb className="block h-3 w-3 translate-x-1 rounded-full bg-text-muted transition-transform data-[state=checked]:translate-x-[16px] data-[state=checked]:bg-ok" />
        </Switch.Root>
        simulate an index on likes_count
      </label>
    </LayerShell>
  );
}
