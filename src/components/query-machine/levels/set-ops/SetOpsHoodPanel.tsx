"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, ChevronRight, Table2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { PostRow } from "@/lib/data";
import { combine, queryA, queryB, regions, SETOPS_STAGES, type SetOp } from "@/lib/setOpsEngine";
import { cn } from "@/lib/utils";
import { useSetOpsStore } from "@/store/useSetOpsStore";

const CX_A = 75;
const CX_B = 125;
const CY = 55;
const R = 42;

function VennDiagram({ op }: { op: SetOp }) {
  return (
    <svg viewBox="0 0 200 110" className="mx-auto block h-[104px] w-full max-w-[220px]">
      <defs>
        <clipPath id="setops-lens">
          <circle cx={CX_B} cy={CY} r={R} />
        </clipPath>
      </defs>

      <circle cx={CX_A} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={1.5} />
      <circle cx={CX_B} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={1.5} />

      {op === "UNION" && (
        <>
          <motion.circle
            key="union-a"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.35 }}
            transition={{ duration: 0.35 }}
            cx={CX_A}
            cy={CY}
            r={R}
            fill="var(--accent)"
          />
          <motion.circle
            key="union-b"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.35 }}
            transition={{ duration: 0.35 }}
            cx={CX_B}
            cy={CY}
            r={R}
            fill="var(--accent)"
          />
          <motion.circle
            key="union-lens"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.6 }}
            transition={{ duration: 0.35 }}
            cx={CX_A}
            cy={CY}
            r={R}
            clipPath="url(#setops-lens)"
            fill="var(--accent)"
          />
        </>
      )}
      {op === "INTERSECT" && (
        <motion.circle
          key="intersect-lens"
          initial={{ fillOpacity: 0 }}
          animate={{ fillOpacity: 0.85 }}
          transition={{ duration: 0.35 }}
          cx={CX_A}
          cy={CY}
          r={R}
          clipPath="url(#setops-lens)"
          fill="var(--accent)"
        />
      )}
      {op === "EXCEPT" && (
        <>
          <motion.circle
            key="except-a"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.6 }}
            transition={{ duration: 0.35 }}
            cx={CX_A}
            cy={CY}
            r={R}
            fill="var(--accent)"
          />
          <circle cx={CX_A} cy={CY} r={R} clipPath="url(#setops-lens)" fill="var(--panel)" />
        </>
      )}

      <text x={48} y={18} fontSize={11} fontFamily="ui-monospace, monospace" fontWeight={700} fill="var(--text-muted)">
        A
      </text>
      <text x={146} y={18} fontSize={11} fontFamily="ui-monospace, monospace" fontWeight={700} fill="var(--text-muted)">
        B
      </text>
    </svg>
  );
}

function RowChip({ row }: { row: PostRow }) {
  return (
    <span className="rounded-md border border-border bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-text">
      #{row.id} {row.format} · <b className="text-accent">{row.likes_count}</b>
    </span>
  );
}

function RegionColumn({
  title,
  rows,
  included,
  tone,
}: {
  title: string;
  rows: PostRow[];
  included: boolean;
  tone: "a" | "overlap" | "b";
}) {
  const toneBorder = { a: "border-flow/40", overlap: "border-accent/50", b: "border-ok/40" }[tone];
  return (
    <div
      className={cn(
        "flex-1 rounded-lg border-2 p-2.5 transition-opacity",
        toneBorder,
        !included && "opacity-35",
      )}
    >
      <p className="mb-1.5 font-mono text-[9.5px] font-bold tracking-wide text-text-muted uppercase">
        {title} <span className="text-text">({rows.length})</span>
      </p>
      <div className="flex flex-wrap gap-1">
        {rows.length === 0 ? (
          <span className="text-[10px] text-text-muted">none</span>
        ) : (
          rows.map((r) => <RowChip key={r.id} row={r} />)
        )}
      </div>
    </div>
  );
}

export function SetOpsHoodPanel() {
  const stage = useSetOpsStore((s) => s.stage);
  const op = useSetOpsStore((s) => s.op);
  const setStage = useSetOpsStore((s) => s.setStage);
  const a = queryA();
  const b = queryB();
  const { aOnly, overlap, bOnly } = regions();
  const result = combine(op);

  const bodyRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  // Autoscroll to the active stage node smoothly so the user never has to scroll manually
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

      const target = document.getElementById(`setops-node-${stage}`);
      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: Math.max(0, targetTop - 20),
        behavior: "smooth",
      });
    };

    const t1 = setTimeout(scrollToStage, 40);
    const t2 = setTimeout(scrollToStage, 180);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage]);

  return (
    <div className="flex h-full flex-col text-text">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{SETOPS_STAGES.length} · {SETOPS_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 2 SELECT queries + {op} operation
        </div>

        {/* Node 0: Query A */}
        <div
          id="setops-node-0"
          onClick={() => setStage(0)}
          className={cn(
            "cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-all",
            stage === 0 ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono text-[12.5px] font-bold">
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-mono",
                stage === 0 ? "bg-accent text-accent-ink" : "bg-panel-2 text-text-muted border border-border"
              )}>
                1
              </span>
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              Query A — format = &apos;video&apos;
            </span>
            <span className="rounded-full border border-flow/40 bg-flow/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-flow">
              {a.length} rows
            </span>
          </div>

          {stage === 0 ? (
            <div className="mt-2.5">
              <div className="text-[11px] text-text-muted mb-1.5">
                Scanning table for <code className="font-mono text-accent">format = &apos;video&apos;</code>. Filtered set ready:
              </div>
              <div className="flex flex-wrap gap-1">
                {a.map((r) => (
                  <RowChip key={r.id} row={r} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-1.5 text-[10.5px] text-text-muted flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-ok" />
              <span>Query A executed ({a.length} posts collected)</span>
            </div>
          )}
        </div>

        {/* Node 1: Query B */}
        <div
          id="setops-node-1"
          onClick={() => setStage(1)}
          className={cn(
            "cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-all",
            stage === 1 ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
            stage < 1 && "opacity-75"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono text-[12.5px] font-bold">
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-mono",
                stage === 1 ? "bg-accent text-accent-ink" : "bg-panel-2 text-text-muted border border-border"
              )}>
                2
              </span>
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              Query B — likes_count &gt; 400
            </span>
            <span className="rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-ok">
              {b.length} rows
            </span>
          </div>

          {stage === 1 ? (
            <div className="mt-2.5">
              <div className="text-[11px] text-text-muted mb-1.5">
                Scanning table for <code className="font-mono text-ok">likes_count &gt; 400</code>. Filtered set ready:
              </div>
              <div className="flex flex-wrap gap-1">
                {b.map((r) => (
                  <RowChip key={r.id} row={r} />
                ))}
              </div>
            </div>
          ) : stage > 1 ? (
            <div className="mt-1.5 text-[10.5px] text-text-muted flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-ok" />
              <span>Query B executed ({b.length} posts collected)</span>
            </div>
          ) : (
            <p className="mt-1.5 text-[10.5px] text-text-muted flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-text-muted" />
              Click here or advance to run Query B
            </p>
          )}
        </div>

        {/* Node 2: Combine with Set Operation & Venn Diagram */}
        <div
          id="setops-node-2"
          onClick={() => setStage(2)}
          className={cn(
            "cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-all",
            stage === 2 ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
            stage < 2 && "opacity-75"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <span className="flex items-center gap-2 font-mono text-[12.5px] font-bold">
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-mono",
                stage === 2 ? "bg-accent text-accent-ink" : "bg-panel-2 text-text-muted border border-border"
              )}>
                3
              </span>
              <span>{op} the two result sets</span>
            </span>
            {stage >= 2 ? (
              <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-accent-ink">
                {result.length} row{result.length === 1 ? "" : "s"} output
              </span>
            ) : (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] font-bold text-text-muted">
                Stage 3
              </span>
            )}
          </div>

          {stage >= 2 ? (
            <div className="mt-3">
              <VennDiagram op={op} />
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <RegionColumn title="A only" rows={aOnly} included={op === "UNION" || op === "EXCEPT"} tone="a" />
                <RegionColumn title="Both (Overlap)" rows={overlap} included={op === "UNION" || op === "INTERSECT"} tone="overlap" />
                <RegionColumn title="B only" rows={bOnly} included={op === "UNION"} tone="b" />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[10.5px] text-text-muted flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-text-muted" />
              Advance to stage 3 to view the Venn diagram and combined results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
