"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { POSTS } from "@/lib/data";
import { classify, STAGES, type RowKind } from "@/lib/queryEngine";
import { Term } from "@/components/ui/Term";
import { SchemaCard, type SchemaColumn } from "./SchemaCard";
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
  const selectedCols = useQueryStore((s) => s.selectedCols);

  // Before SELECT runs, every column is still "in flight" — only once we're at or
  // past the SELECT stage do the un-picked columns actually get dropped.
  const selectRan = stage >= 2;
  const kept = (col: "format" | "likes_count" | "views_count") => !selectRan || selectedCols.includes(col);

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
      <span
        className={cn(
          "w-[42px] flex-none truncate font-mono text-[10.5px] text-text-muted transition-opacity",
          !kept("format") && "text-text-muted/35 line-through",
        )}
      >
        {row.format}
      </span>
      <span className="flex flex-none gap-2.5 font-mono text-[11px]">
        <span
          className={cn(
            "flex items-center gap-1 text-bad transition-opacity",
            !kept("likes_count") && "text-text-muted/35 line-through",
          )}
        >
          <Heart className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
          {row.likes_count}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-flow transition-opacity",
            !kept("views_count") && "text-text-muted/35 line-through",
          )}
        >
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

const SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

function SourceTable() {
  return (
    <div>
      <p className="mb-3 text-[11px] leading-relaxed text-text-muted">
        This is <b className="text-text">posts</b> — the table every query on this level reads from.
        Nothing here has been touched yet; it&apos;s the same {POSTS.length} rows every time.
      </p>
      <SchemaCard tableName="posts" columns={SCHEMA} />

      <div className="mt-3.5 flex items-center gap-2.5 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
        <span className="w-5 flex-none">id</span>
        <span className="min-w-0 flex-1">user</span>
        <span className="w-[46px] flex-none">format</span>
        <span className="w-[38px] flex-none">likes</span>
        <span className="w-[42px] flex-none">views</span>
      </div>
      <div className="mt-1.5 flex flex-col gap-2">
        {POSTS.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-2.5 rounded-md border border-border bg-panel px-2.5 py-2 shadow-[var(--shadow-row)]"
          >
            <span className="w-5 flex-none font-mono text-[10px] text-text-muted">
              {String(row.id).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{row.username}</span>
            <span className="w-[46px] flex-none font-mono text-[10.5px] text-text-muted">{row.format}</span>
            <span className="flex w-[38px] flex-none items-center gap-1 font-mono text-[11px] text-bad">
              <Heart className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
              {row.likes_count}
            </span>
            <span className="flex w-[42px] flex-none items-center gap-1 font-mono text-[11px] text-flow">
              <Eye className="h-2.5 w-2.5" />
              {row.views_count}
            </span>
          </div>
        ))}
      </div>
    </div>
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
  const [view, setView] = useState<"input" | "output">("output");

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
            {v}
          </button>
        ))}
      </div>

      {view === "input" ? (
        <SourceTable />
      ) : (
        <>
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

      {visibleIds.length > 0 && (
        <div className="mt-3.5 flex items-center gap-2.5 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
          <span className="w-5 flex-none">id</span>
          <span className="min-w-0 flex-1">user</span>
          <span className="w-[42px] flex-none">
            <Term term="format">format</Term>
          </span>
          <span className="flex flex-none gap-2.5">
            <span className="flex items-center gap-1 w-[38px]">
              <Term term="likes_count">likes</Term>
            </span>
            <span className="flex items-center gap-1 w-[42px]">
              <Term term="views_count">views</Term>
            </span>
          </span>
          <span className="w-[62px] flex-none">status</span>
        </div>
      )}
      <div className="mt-1.5 flex flex-col gap-2">
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
        </>
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
