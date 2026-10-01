"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { POSTS } from "@/lib/data";
import { combine, SETOPS_STAGES } from "@/lib/setOpsEngine";
import { cn } from "@/lib/utils";
import { useSetOpsStore } from "@/store/useSetOpsStore";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function SetOpsOutputPanel() {
  const stage = useSetOpsStore((s) => s.stage);
  const op = useSetOpsStore((s) => s.op);
  const setStage = useSetOpsStore((s) => s.setStage);
  const [view, setView] = useState<"input" | "output">("output");
  const computed = stage >= 2;
  const rows = combine(op);

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
        <div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{POSTS.length}</span>
            <span className="text-[11.5px] text-text-muted">raw rows in posts table</span>
          </div>
          <p className="mt-1 mb-3 text-[11px] text-text-muted leading-relaxed">
            Full source table before Query A (<span className="text-accent font-semibold">format = &apos;image&apos;</span>) and Query B (<span className="text-flow font-semibold">likes &gt;= 500</span>) pull their sets.
          </p>

          <SchemaCard
            tableName="posts"
            columns={POSTS_SCHEMA}
            highlight={["format", "likes_count"]}
          />

          <div className="w-full min-w-0 pb-2">
            <div className="mt-3.5 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
              <span className="w-4 flex-none">id</span>
              <span className="min-w-0 flex-1 truncate">user</span>
              <span className="w-12 flex-none text-center">format</span>
              <span className="w-10 flex-none text-right">likes</span>
              <span className="w-12 flex-none text-right">match</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {POSTS.map((r) => {
                const inA = r.format === "image";
                const inB = r.likes_count >= 500;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]"
                  >
                    <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(r.id).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-text">{r.username}</span>
                    <span className={cn("w-12 flex-none text-center font-mono text-[10px]", inA ? "text-accent font-bold" : "text-text-muted")}>
                      {r.format}
                    </span>
                    <span className={cn("w-10 flex-none text-right font-mono text-[10.5px]", inB ? "text-flow font-bold" : "text-text-muted")}>
                      {r.likes_count}
                    </span>
                    <span className="flex w-12 flex-none items-center justify-end gap-1 font-mono text-[9px] font-bold">
                      {inA && <span className="rounded bg-accent/15 px-1 text-accent">A</span>}
                      {inB && <span className="rounded bg-flow/15 px-1 text-flow">B</span>}
                      {!inA && !inB && <span className="text-text-muted">—</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{computed ? rows.length : "?"}</span>
            <span className="text-[11.5px] text-text-muted">row{rows.length === 1 ? "" : "s"} returned</span>
          </div>

          {!computed ? (
            <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
              Combine hasn&apos;t run yet — advance to the COMBINE stage to see the result.
            </p>
          ) : (
            <div className="mt-4 w-full min-w-0 pb-2">
              <div className="w-full flex flex-col gap-1.5">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, type: "spring", stiffness: 380, damping: 30 }}
                    className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px]"
                  >
                    <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(row.id).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-text">{row.username}</span>
                    <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">{row.format}</span>
                    <span className="flex flex-none gap-2 font-mono text-[10.5px]">
                      <span className="flex items-center gap-0.5 text-bad font-semibold">
                        <Heart className="h-2 w-2 fill-current" strokeWidth={0} />
                        {row.likes_count}
                      </span>
                      <span className="flex items-center gap-0.5 text-flow font-semibold">
                        <Eye className="h-2 w-2" />
                        {row.views_count}
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {stage < SETOPS_STAGES.length - 1 && (
            <button
              type="button"
              onClick={() => setStage(stage + 1)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
            >
              Advance to {SETOPS_STAGES[stage + 1]}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
