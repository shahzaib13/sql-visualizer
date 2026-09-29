"use client";

import { motion } from "framer-motion";
import { Check, Table2 } from "lucide-react";
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
            animate={{ fillOpacity: 0.4 }}
            transition={{ duration: 0.35 }}
            cx={CX_A}
            cy={CY}
            r={R}
            fill="var(--accent)"
            style={{ mixBlendMode: "multiply" }}
          />
          <motion.circle
            key="union-b"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.4 }}
            transition={{ duration: 0.35 }}
            cx={CX_B}
            cy={CY}
            r={R}
            fill="var(--accent)"
            style={{ mixBlendMode: "multiply" }}
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
            animate={{ fillOpacity: 0.55 }}
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
    <span className="rounded-full border border-border bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-text-muted">
      #{row.id} {row.format} · {row.likes_count}
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
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{SETOPS_STAGES.length} · {SETOPS_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 2 SELECTs + 1 set operator
        </div>

        <div
          onClick={() => setStage(0)}
          className={cn(
            "mb-3 cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-colors",
            stage === 0 ? "border-accent" : "border-border",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              Query A — format = &apos;video&apos;
            </span>
            <span className="rounded-full border border-flow/40 px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-flow">
              {a.length} rows
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {a.map((r) => (
              <RowChip key={r.id} row={r} />
            ))}
          </div>
        </div>

        <div
          onClick={() => setStage(1)}
          className={cn(
            "mb-3 cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-colors",
            stage === 1 ? "border-accent" : "border-border",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              Query B — likes_count &gt; 400
            </span>
            <span className="rounded-full border border-ok/40 px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-ok">
              {b.length} rows
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {b.map((r) => (
              <RowChip key={r.id} row={r} />
            ))}
          </div>
        </div>

        <div
          onClick={() => setStage(2)}
          className={cn(
            "cursor-pointer rounded-xl border bg-panel p-3.5 shadow-[var(--shadow-row)] transition-colors",
            stage === 2 ? "border-accent" : "border-border",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12px] font-bold">{op} the two result sets</span>
            {stage >= 2 && (
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-accent-ink">
                {result.length} row{result.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {stage >= 2 ? (
            <>
              <VennDiagram op={op} />
              <div className="mt-2 flex gap-2">
                <RegionColumn title="A only" rows={aOnly} included={op === "UNION" || op === "EXCEPT"} tone="a" />
                <RegionColumn title="Both" rows={overlap} included={op === "UNION" || op === "INTERSECT"} tone="overlap" />
                <RegionColumn title="B only" rows={bOnly} included={op === "UNION"} tone="b" />
              </div>
            </>
          ) : (
            <p className="mt-1.5 text-[10.5px] text-text-muted">Not reached yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
