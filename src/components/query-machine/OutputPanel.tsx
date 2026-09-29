"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { POSTS } from "@/lib/data";
import { classify, STAGES, type RowKind } from "@/lib/queryEngine";
import { cn } from "@/lib/utils";
import { useQueryStore, type OutputFilter } from "@/store/useQueryStore";

const FILTERS: { key: OutputFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "included", label: "Included" },
  { key: "excluded", label: "Excluded" },
  { key: "cut", label: "Cut" },
];

const KIND_LABEL: Record<RowKind, string> = {
  neutral: "loaded",
  included: "included",
  cut: "cut",
  excluded: "excluded",
};

const KIND_BORDER: Record<RowKind, string> = {
  neutral: "border-l-border",
  included: "border-l-ok",
  cut: "border-l-warn",
  excluded: "border-l-bad",
};

const KIND_TAG: Record<RowKind, string> = {
  neutral: "border-border text-text-muted",
  included: "border-ok text-ok",
  cut: "border-warn text-warn",
  excluded: "border-bad text-bad",
};

const KIND_FLASH: Record<RowKind, string> = {
  neutral: "transparent",
  included: "color-mix(in srgb, var(--ok) 30%, var(--panel))",
  cut: "color-mix(in srgb, var(--warn) 26%, var(--panel))",
  excluded: "color-mix(in srgb, var(--bad) 28%, var(--panel))",
};

function useFilterIndicator(active: OutputFilter) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [style, setStyle] = useState({ left: 3, width: 60 });

  useEffect(() => {
    const el = refs.current[active];
    if (el) setStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return { refs, style };
}

function OutputRow({ id }: { id: number }) {
  const row = POSTS.find((r) => r.id === id)!;
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);

  const { byId } = classify({ stage, threshold, orderCol, orderDir, limit });
  const info = byId.get(id)!;

  // Flash once when this row's kind actually changes — tracked post-render (in the
  // effect), never mutated during render, so re-renders from unrelated state stay inert.
  const prevKindRef = useRef<RowKind>(info.kind);
  const [flashKind, setFlashKind] = useState<RowKind | null>(null);
  useEffect(() => {
    if (prevKindRef.current !== info.kind) {
      prevKindRef.current = info.kind;
      setFlashKind(info.kind);
      const t = setTimeout(() => setFlashKind(null), 720);
      return () => clearTimeout(t);
    }
  }, [info.kind]);

  const title =
    info.kind === "excluded"
      ? `Excluded: likes_count ${row.likes_count} is not > ${threshold}.`
      : info.kind === "cut"
        ? `Cut by LIMIT ${limit}: ranked #${info.rank + 1}.`
        : info.kind === "included"
          ? `In the result set, ranked #${info.rank + 1}.`
          : "Loaded, not filtered yet.";

  return (
    <motion.div
      layout
      layoutId={`row-${id}`}
      title={title}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      animate={{
        backgroundColor: flashKind ? [KIND_FLASH[flashKind], "var(--panel)"] : "var(--panel)",
        opacity: info.kind === "excluded" || info.kind === "cut" ? 0.7 : 1,
      }}
      className={cn(
        "flex items-center gap-2.5 rounded-md border border-border border-l-[3px] bg-panel px-2.5 py-2 shadow-[var(--shadow-row)]",
        KIND_BORDER[info.kind],
      )}
    >
      <span className="w-5 flex-none font-mono text-[10px] text-text-muted">
        {String(row.id).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{row.username}</span>
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
      <span className={cn("flex-none rounded-full border px-1.5 py-0.5 font-mono text-[8.5px] font-bold", KIND_TAG[info.kind])}>
        {KIND_LABEL[info.kind]}
      </span>
    </motion.div>
  );
}

export function OutputPanel() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);
  const filter = useQueryStore((s) => s.filter);
  const setFilter = useQueryStore((s) => s.setFilter);
  const setStage = useQueryStore((s) => s.setStage);
  const { refs, style } = useFilterIndicator(filter);

  const { byId, includedCount, excludedCount, cutCount } = classify({ stage, threshold, orderCol, orderDir, limit });

  const visibleIds = [...byId.entries()]
    .filter(([, info]) => filter === "all" || info.kind === filter)
    .sort(([, a], [, b]) => {
      if (a.kind === "excluded" && b.kind !== "excluded") return 1;
      if (b.kind === "excluded" && a.kind !== "excluded") return -1;
      return a.rank - b.rank;
    })
    .map(([id]) => id);

  const bigCount = filter === "all" ? 8 : filter === "included" ? includedCount : filter === "excluded" ? excludedCount : cutCount;

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <Tabs.Root value={filter} onValueChange={(v) => setFilter(v as OutputFilter)}>
        <Tabs.List className="relative flex gap-0.5 rounded-lg border border-border bg-panel p-[3px] shadow-[var(--shadow)]">
          <motion.span
            className="absolute top-[3px] bottom-[3px] z-0 rounded-md bg-accent"
            animate={style}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
          {FILTERS.map((f) => (
            <Tabs.Trigger
              key={f.key}
              value={f.key}
              ref={(el) => {
                refs.current[f.key] = el;
              }}
              className={cn(
                "relative z-10 rounded-md px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap text-text-muted transition-colors",
                filter === f.key && "text-accent-ink",
              )}
            >
              {f.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <div className="mt-3.5 flex items-baseline gap-2 font-mono">
        <span className="text-[26px] font-bold">{bigCount}</span>
        <span className="text-[11.5px] text-text-muted">
          row{bigCount === 1 ? "" : "s"} · {filter}
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {visibleIds.map((id) => (
            <OutputRow key={id} id={id} />
          ))}
        </AnimatePresence>
      </div>

      {visibleIds.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
          No rows in this view yet — drag the pipeline slider.
        </p>
      )}

      {stage < STAGES.length - 1 && (
        <button
          type="button"
          onClick={() => setStage(stage + 1)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          Advance to {STAGES[stage + 1]}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
