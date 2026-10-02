"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Table2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { POSTS } from "@/lib/data";
import { classify, passingCount, selectColsText, STAGES } from "@/lib/queryEngine";
import { cn } from "@/lib/utils";
import { useQueryStore } from "@/store/useQueryStore";
import { Term } from "@/components/ui/Term";
import { useTranslation } from "@/lib/i18n/useTranslation";

const ALL_COLUMNS = ["username", "format", "likes_count", "views_count"] as const;

function Connector({ flowing }: { flowing: boolean }) {
  return (
    <div className="relative ml-[15px] h-6 w-px flex-none overflow-hidden">
      <div className={cn("absolute inset-0", flowing ? "bg-flow" : "bg-border")} />
      {flowing && (
        <motion.div
          className="absolute inset-x-0 h-3 bg-gradient-to-b from-transparent via-accent to-transparent"
          animate={{ y: ["-16px", "24px"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

function StatCard({
  tone,
  value,
  label,
  icon,
}: {
  tone: "ok" | "bad" | "neutral";
  value: number;
  label: string;
  icon?: React.ReactNode;
}) {
  const toneClasses = {
    ok: "border-ok/40 bg-ok/10 text-ok",
    bad: "border-bad/40 bg-bad/10 text-bad",
    neutral: "border-border bg-panel text-text-muted",
  }[tone];

  return (
    <div className={cn("flex flex-1 items-center gap-2 rounded-lg border px-3 py-2", toneClasses)}>
      {icon}
      <div>
        <div className="font-mono text-[15px] font-bold leading-none">{value}</div>
        <div className="mt-1 text-[9.5px] leading-none opacity-80">{label}</div>
      </div>
    </div>
  );
}

function NodeShell({
  index,
  active,
  reached,
  onClick,
  children,
}: {
  index: number;
  active: boolean;
  reached: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div id={`hood-node-${index}`} className="flex scroll-mt-4 gap-3">
      <div className="flex flex-none flex-col items-center pt-0.5">
        <motion.button
          type="button"
          onClick={onClick}
          animate={{
            backgroundColor: active ? "var(--accent)" : reached ? "var(--flow)" : "var(--panel-2)",
            borderColor: active ? "var(--accent)" : reached ? "var(--flow)" : "var(--border)",
            color: active || reached ? "#fff" : "var(--text-muted)",
          }}
          className="grid h-8 w-8 flex-none place-items-center rounded-full border-2 font-mono text-[11px] font-bold"
        >
          {index}
        </motion.button>
      </div>
      <motion.div
        layout
        animate={{
          borderColor: active ? "var(--accent)" : "var(--border)",
          boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent)" : "none",
        }}
        className="mb-1 flex-1 rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)]"
      >
        {children}
      </motion.div>
    </div>
  );
}

function Badge({ tone = "neutral", children }: { tone?: "accent" | "ok" | "warn" | "neutral"; children: React.ReactNode }) {
  const toneClasses = {
    accent: "bg-accent text-accent-ink",
    ok: "bg-ok text-white",
    warn: "bg-warn text-white",
    neutral: "border border-border text-text-muted",
  }[tone];
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap", toneClasses)}>
      {children}
    </span>
  );
}

export function PipelineHoodPanel() {
  const { t, locale } = useTranslation();
  const isUr = locale === "ur";
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const selectedCols = useQueryStore((s) => s.selectedCols);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);
  const simIndex = useQueryStore((s) => s.simIndex);
  const setSimIndex = useQueryStore((s) => s.setSimIndex);
  const setStage = useQueryStore((s) => s.setStage);

  const total = POSTS.length;
  const cls = classify({ stage, threshold, orderCol, orderDir, limit });
  const passing = passingCount(threshold);
  const dropped = total - passing;
  const kept = Math.min(limit, passing);
  const cut = Math.max(0, passing - limit);

  const passingRows = POSTS.filter((r) => r.likes_count > threshold);
  const beforeOrderIds = passingRows.map((r) => r.id);
  const orderSign = orderDir === "DESC" ? -1 : 1;
  const afterOrderIds = [...passingRows].sort((a, b) => (a[orderCol] - b[orderCol]) * orderSign).map((r) => r.id);

  // Follow the command panel's stage — without this the active node can be
  // scrolled off-screen and a control change looks like it did nothing.
  const bodyRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const scrollToStage = () => {
      const container = bodyRef.current;
      if (!container) return;

      if (stage === 0) {
        container.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.getElementById(`hood-node-${stage + 1}`);
      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: Math.max(0, targetTop - 20),
        behavior: "smooth",
      });
    };

    const timer = setTimeout(scrollToStage, 40);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{STAGES.length} · {STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          {t.hood.queryParsed}
        </div>

        {/* FROM */}
        <NodeShell index={1} active={stage === 0} reached={stage >= 0} onClick={() => setStage(0)}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[12.5px] font-bold">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              FROM posts
            </span>
            <Badge tone="neutral">Base table</Badge>
          </div>
          <p className="mt-1.5 text-[10.5px] text-text-muted">{t.hood.fromLoads(total)}</p>
        </NodeShell>

        <Connector flowing={stage >= 1} />

        {/* WHERE — the rich node */}
        <NodeShell index={2} active={stage === 1} reached={stage >= 1} onClick={() => setStage(1)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-bold">
              WHERE likes_count &gt; <span className="text-accent">{threshold}</span>
            </span>
            {stage === 1 && <Badge tone="warn">Active bottleneck</Badge>}
          </div>

          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex gap-2">
                  <StatCard tone="ok" value={passing} label="pass → engine" icon={<ArrowRight className="h-3.5 w-3.5" />} />
                  <StatCard tone="bad" value={dropped} label="discarded" icon={<X className="h-3.5 w-3.5" />} />
                </div>

                <div className="mt-3 rounded-lg border border-border bg-panel-2 p-2.5">
                  <p className="mb-1.5 text-[10px] font-bold tracking-wide text-text-muted uppercase">
                    {t.hood.howMysqlFinds}
                  </p>
                  <p className="mb-2 text-[10px] leading-snug text-text-muted">
                    {t.hood.indexConcept}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSimIndex(false)}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-1.5 font-mono text-[10.5px] font-semibold transition-colors",
                        !simIndex ? "border-flow bg-flow/15 text-flow" : "border-border text-text-muted",
                      )}
                    >
                      {t.hood.checkEveryRow}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimIndex(true)}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-1.5 font-mono text-[10.5px] font-semibold transition-colors",
                        simIndex ? "border-ok bg-ok/15 text-ok" : "border-border text-text-muted",
                      )}
                    >
                      {t.hood.useIndex}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] leading-snug text-text-muted">
                    {simIndex
                      ? t.hood.withIndexDesc(passing, total)
                      : t.hood.withoutIndexDesc(total, dropped)}
                  </p>
                </div>

                <p className="mt-2.5 mb-1 text-[9.5px] font-semibold tracking-wide text-text-muted uppercase">
                  {simIndex ? t.hood.rowsActuallyTouched : t.hood.rowsCheckedOneByOne}
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: total }).map((_, i) => {
                    const id = i + 1;
                    const row = cls.byId.get(id);
                    const isPass = row?.kind !== "excluded";
                    const skipped = simIndex && !isPass;
                    return (
                      <span
                        key={id}
                        title={skipped ? `Row ${id} — skipped, index knew it wouldn't match` : `Row ${id}`}
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded border font-mono text-[8px] font-bold",
                          skipped
                            ? "border-dashed border-border text-text-muted opacity-40"
                            : isPass
                              ? "border-ok/50 bg-ok/15 text-ok"
                              : "border-bad/50 bg-bad/10 text-bad",
                        )}
                      >
                        {id}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {stage < 1 && (
            <p className="mt-1.5 text-[10.5px] text-text-muted">
              {isUr ? "Abhi yahan tak nahi pohnche." : "Not reached yet."}
            </p>
          )}
        </NodeShell>

        <Connector flowing={stage >= 2} />

        {/* SELECT */}
        <NodeShell index={3} active={stage === 2} reached={stage >= 2} onClick={() => setStage(2)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-bold">SELECT {selectColsText(selectedCols)}</span>
            <Badge tone="neutral">
              {isUr
                ? `${selectedCols.length + 1} / ${ALL_COLUMNS.length} columns`
                : `${selectedCols.length + 1} of ${ALL_COLUMNS.length} cols`}
            </Badge>
          </div>
          <p className="mt-1.5 mb-2 text-[10.5px] text-text-muted">
            {stage >= 2
              ? isUr
                ? "Neeche har column available tha — sirf highlighted columns SELECT se bachte hain."
                : "Every column below was available — only the highlighted ones survive SELECT."
              : isUr
                ? "Abhi yahan tak nahi pohnche — sab columns abhi available hain."
                : "Not reached yet — every column below is still available."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_COLUMNS.map((col) => {
              const isKept = col === "username" || selectedCols.includes(col);
              const decided = stage >= 2;
              return (
                <span
                  key={col}
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-semibold transition-all",
                    !decided
                      ? "border-border bg-panel text-text-muted"
                      : isKept
                        ? "border-ok bg-ok/15 text-ok"
                        : "border-border bg-panel text-text-muted/40 line-through",
                  )}
                >
                  {col}
                </span>
              );
            })}
          </div>
        </NodeShell>

        <Connector flowing={stage >= 3} />

        {/* ORDER BY */}
        <NodeShell index={4} active={stage === 3} reached={stage >= 3} onClick={() => setStage(3)}>
          <span className="font-mono text-[12.5px] font-bold">
            ORDER BY {orderCol} {orderDir}
          </span>
          {stage >= 3 ? (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 flex-wrap gap-1 rounded-md border border-border bg-panel-2 p-1.5">
                {beforeOrderIds.map((id) => (
                  <span key={id} className="grid h-5 w-5 place-items-center rounded bg-panel font-mono text-[9px] text-text-muted">
                    {id}
                  </span>
                ))}
              </div>
              <ArrowRight className="h-3.5 w-3.5 flex-none text-text-muted" />
              <div className="flex flex-1 flex-wrap gap-1 rounded-md border border-accent/40 bg-accent/10 p-1.5">
                {afterOrderIds.map((id) => (
                  <motion.span
                    key={id}
                    layout
                    className="grid h-5 w-5 place-items-center rounded bg-accent font-mono text-[9px] font-bold text-accent-ink"
                  >
                    {id}
                  </motion.span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-[10.5px] text-text-muted">
              {isUr
                ? "Abhi yahan tak nahi pohnche — rows abhi original load order mein hain."
                : "Not reached yet — rows are still in load order."}
            </p>
          )}
        </NodeShell>

        <Connector flowing={stage >= 4} />

        {/* LIMIT */}
        <NodeShell index={5} active={stage === 4} reached={stage >= 4} onClick={() => setStage(4)}>
          <span className="font-mono text-[12.5px] font-bold">LIMIT {limit}</span>
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 flex gap-2 overflow-hidden"
              >
                <StatCard
                  tone="ok"
                  value={kept}
                  label={isUr ? "kept" : "returned"}
                  icon={<Check className="h-3.5 w-3.5" />}
                />
                <StatCard
                  tone="neutral"
                  value={cut}
                  label={isUr ? "cut off" : "cut off"}
                  icon={<X className="h-3.5 w-3.5" />}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </NodeShell>
      </div>
    </div>
  );
}
