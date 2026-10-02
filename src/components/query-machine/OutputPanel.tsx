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
import { useTranslation } from "@/lib/i18n/useTranslation";

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
  included: "border-l-ok border-ok/30",
  cut: "border-l-warn border-warn/30",
  excluded: "border-l-bad border-bad/20",
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

function TableHeader() {
  return (
    <div className="mt-2 mb-1 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
      <span className="w-4 flex-none">id</span>
      <span className="min-w-0 flex-1 truncate">user</span>
      <span className="w-12 flex-none text-center">
        <Term term="format">format</Term>
      </span>
      <span className="flex flex-none gap-2">
        <span className="flex items-center justify-end w-10">
          <Term term="likes_count">likes</Term>
        </span>
        <span className="flex items-center justify-end w-11">
          <Term term="views_count">views</Term>
        </span>
      </span>
      <span className="w-16 flex-none text-right">status</span>
    </div>
  );
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
        opacity: info.kind === "excluded" ? 0.62 : info.kind === "cut" ? 0.85 : 1,
      }}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border border-l-[3px] bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px] transition-colors",
        KIND_BORDER[info.kind],
        info.kind === "included" && "border-ok/35 shadow-[0_0_12px_-4px_rgba(52,211,153,0.15)]",
      )}
    >
      <span className="w-4 flex-none font-mono text-[10px] text-text-muted">
        {String(row.id).padStart(2, "0")}
      </span>
      <span className={cn("min-w-0 flex-1 truncate font-semibold text-text", info.kind === "excluded" && "text-text-muted")}>
        {row.username}
      </span>
      <span
        className={cn(
          "w-12 flex-none text-center truncate font-mono text-[10px] text-text-muted transition-opacity",
          !kept("format") && "text-text-muted/35 line-through",
        )}
      >
        {row.format}
      </span>
      <span className="flex flex-none gap-2 font-mono text-[10.5px]">
        <span
          className={cn(
            "flex w-10 items-center justify-end gap-0.5 text-bad transition-opacity",
            !kept("likes_count") && "text-text-muted/35 line-through",
          )}
        >
          <Heart className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
          {row.likes_count}
        </span>
        <span
          className={cn(
            "flex w-11 items-center justify-end gap-0.5 text-flow transition-opacity",
            !kept("views_count") && "text-text-muted/35 line-through",
          )}
        >
          <Eye className="h-2.5 w-2.5" />
          {row.views_count}
        </span>
      </span>
      <span
        className={cn(
          "flex-none rounded-full border px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-center",
          info.kind === "included" && "border-ok/40 bg-ok/15 text-ok",
          info.kind === "cut" && "border-warn/40 bg-warn/15 text-warn",
          info.kind === "excluded" && "border-bad/30 bg-bad/10 text-bad",
          info.kind === "neutral" && "border-border bg-panel-2 text-text-muted",
        )}
      >
        {info.kind === "included"
          ? `✓ #${info.rank + 1} IN`
          : info.kind === "cut"
            ? `✂ #${info.rank + 1} CUT`
            : info.kind === "excluded"
              ? "✗ EXCLUDED"
              : "LOADED"}
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

      <div className="w-full min-w-0 pb-2">
        <div className="mt-3.5 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
          <span className="w-4 flex-none">id</span>
          <span className="min-w-0 flex-1 truncate">user</span>
          <span className="w-12 flex-none text-center">format</span>
          <span className="w-10 flex-none text-right">likes</span>
          <span className="w-11 flex-none text-right">views</span>
        </div>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {POSTS.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px]"
            >
              <span className="w-4 flex-none font-mono text-[10px] text-text-muted">
                {String(row.id).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-text">{row.username}</span>
              <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">{row.format}</span>
              <span className="flex w-10 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-bad font-semibold">
                <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                {row.likes_count}
              </span>
              <span className="flex w-11 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-flow font-semibold">
                <Eye className="h-2.5 w-2.5" />
                {row.views_count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OutputPanel() {
  const { t, locale } = useTranslation();
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

  const includedIds = [...byId.entries()]
    .filter(([, info]) => info.kind === "included")
    .sort(([, a], [, b]) => a.rank - b.rank)
    .map(([id]) => id);

  const cutIds = [...byId.entries()]
    .filter(([, info]) => info.kind === "cut")
    .sort(([, a], [, b]) => a.rank - b.rank)
    .map(([id]) => id);

  const excludedIds = [...byId.entries()]
    .filter(([, info]) => info.kind === "excluded")
    .map(([id]) => id);

  const visibleIds = [...byId.entries()]
    .filter(([, info]) => filter === "all" || info.kind === filter)
    .sort(([, a], [, b]) => {
      if (a.kind === "excluded" && b.kind !== "excluded") return 1;
      if (b.kind === "excluded" && a.kind !== "excluded") return -1;
      return a.rank - b.rank;
    })
    .map(([id]) => id);

  const countFor = (key: OutputFilter) => {
    if (key === "all") return POSTS.length;
    if (key === "included") return includedCount;
    if (key === "cut") return cutCount;
    if (key === "excluded") return excludedCount;
    return 0;
  };

  const getTabLabel = (key: OutputFilter) => {
    if (key === "all") return t.output.tabAll;
    if (key === "included") return t.output.tabIncluded;
    if (key === "cut") return t.output.tabCut;
    return t.output.tabExcluded;
  };

  const bigCount = filter === "all" ? POSTS.length : filter === "included" ? includedCount : filter === "excluded" ? excludedCount : cutCount;
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
            {v === "input" ? t.output.inputTab : t.output.outputTab}
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
              {FILTERS.map((f) => {
                const count = countFor(f.key);
                return (
                  <Tabs.Trigger
                    key={f.key}
                    value={f.key}
                    ref={(el) => {
                      refs.current[f.key] = el;
                    }}
                    className={cn(
                      "relative z-10 flex-1 min-w-0 rounded-md px-1 sm:px-1.5 py-1.5 text-[11px] font-semibold text-center truncate transition-colors flex items-center justify-center gap-1",
                      filter === f.key ? "text-accent-ink" : "text-text-muted hover:text-text",
                    )}
                  >
                    <span>{getTabLabel(f.key)}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold leading-tight",
                        filter === f.key
                          ? "bg-accent-ink/20 text-accent-ink"
                          : f.key === "included"
                            ? "bg-ok/15 text-ok"
                            : f.key === "cut"
                              ? "bg-warn/15 text-warn"
                              : f.key === "excluded"
                                ? "bg-bad/15 text-bad"
                                : "bg-panel-2 text-text-muted",
                      )}
                    >
                      {count}
                    </span>
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Tabs.Root>

          <div className="mt-3.5 flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{bigCount}</span>
            <span className="text-[11.5px] text-text-muted">
              row{bigCount === 1 ? "" : "s"} · {getTabLabel(filter)}
            </span>
          </div>

          {/* Educational Explanation Box when "All" is active */}
          {filter === "all" && (
            <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-border bg-panel-2 p-2.5 text-[11px] text-text-muted leading-relaxed">
              <span className="text-sm select-none">💡</span>
              <div>
                <span className="font-semibold text-text">{t.output.datasetBreakdown}</span>{" "}
                {t.output.breakdownText(POSTS.length, includedCount, cutCount, excludedCount)}
              </div>
            </div>
          )}

          {/* Grouped Display when "All" is selected */}
          {filter === "all" ? (
            <div className="mt-4 flex flex-col gap-4 pb-2">
              {/* Group 1: INCLUDED IN RESULT */}
              {includedIds.length > 0 && (
                <div className="rounded-xl border border-ok/35 bg-ok/[0.04] p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok text-accent-ink text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="text-[12px] font-bold text-ok uppercase tracking-wider">
                        1. Included in Result Set ({includedIds.length})
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-ok bg-ok/10 border border-ok/25 px-2 py-0.5 rounded-full font-semibold">
                      Returned by SQL
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-2 px-0.5">
                    Passed <code className="text-text font-mono font-semibold">likes_count &gt; {threshold}</code> and within <code className="text-text font-mono font-semibold">LIMIT {limit}</code>.
                  </p>
                  <TableHeader />
                  <div className="mt-1 flex flex-col gap-1.5">
                    {includedIds.map((id) => (
                      <OutputRow key={id} id={id} />
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: CUT BY LIMIT */}
              {cutIds.length > 0 && (
                <div className="rounded-xl border border-warn/35 bg-warn/[0.04] p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warn text-accent-ink text-[10px] font-bold">
                        ✂
                      </span>
                      <span className="text-[12px] font-bold text-warn uppercase tracking-wider">
                        2. Cut by LIMIT ({cutIds.length})
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-warn bg-warn/10 border border-warn/25 px-2 py-0.5 rounded-full font-semibold">
                      Rank #{limit + 1}–#{limit + cutIds.length}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-2 px-0.5">
                    Passed the WHERE filter, but dropped because <code className="text-text font-mono font-semibold">LIMIT {limit}</code> only takes the top {limit}.
                  </p>
                  <TableHeader />
                  <div className="mt-1 flex flex-col gap-1.5">
                    {cutIds.map((id) => (
                      <OutputRow key={id} id={id} />
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: EXCLUDED BY WHERE */}
              {excludedIds.length > 0 && (
                <div className="rounded-xl border border-bad/25 bg-bad/[0.02] p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bad/20 text-bad text-[10px] font-bold">
                        ✗
                      </span>
                      <span className="text-[12px] font-bold text-bad uppercase tracking-wider">
                        3. Excluded by WHERE ({excludedIds.length})
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-bad bg-bad/10 border border-bad/20 px-2 py-0.5 rounded-full font-semibold">
                      likes ≤ {threshold}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-2 px-0.5">
                    Failed <code className="text-text font-mono font-semibold">WHERE likes_count &gt; {threshold}</code>. Dropped during the filter stage.
                  </p>
                  <TableHeader />
                  <div className="mt-1 flex flex-col gap-1.5">
                    {excludedIds.map((id) => (
                      <OutputRow key={id} id={id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single filter tab active */
            <div className="w-full min-w-0 pb-2">
              {visibleIds.length > 0 && <TableHeader />}
              <div className="mt-1.5 flex flex-col gap-1.5">
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
            </div>
          )}
        </>
      )}

      {stage < STAGES.length - 1 && (
        <button
          type="button"
          onClick={() => setStage(stage + 1)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          {t.output.advanceTo} {STAGES[stage + 1]}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
