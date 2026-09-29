"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Table2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { POSTS } from "@/lib/data";
import { classifyBySubquery, subqueryAvgLikes, SUBQUERY_STAGES } from "@/lib/subqueryEngine";
import { cn } from "@/lib/utils";
import { useSubqueryStore } from "@/store/useSubqueryStore";

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
    <div className="flex gap-3">
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

function StatCard({ tone, value, label }: { tone: "ok" | "bad"; value: number; label: string }) {
  const toneClasses = tone === "ok" ? "border-ok/40 bg-ok/10 text-ok" : "border-bad/40 bg-bad/10 text-bad";
  return (
    <div className={cn("flex flex-1 items-center gap-2 rounded-lg border px-3 py-2", toneClasses)}>
      {tone === "ok" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      <div>
        <div className="font-mono text-[15px] font-bold leading-none">{value}</div>
        <div className="mt-1 text-[9.5px] leading-none opacity-80">{label}</div>
      </div>
    </div>
  );
}

export function SubqueryHoodPanel() {
  const stage = useSubqueryStore((s) => s.stage);
  const op = useSubqueryStore((s) => s.op);
  const setStage = useSubqueryStore((s) => s.setStage);
  const avg = subqueryAvgLikes();
  const results = classifyBySubquery(op);
  const included = results.filter((r) => r.included);
  const excluded = results.filter((r) => !r.included);

  const bodyRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{SUBQUERY_STAGES.length} · {SUBQUERY_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 1 outer query, 1 nested subquery
        </div>

        {/* FROM */}
        <NodeShell index={1} active={stage === 0} reached={stage >= 0} onClick={() => setStage(0)}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[12.5px] font-bold">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              FROM posts
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
              Base table
            </span>
          </div>
          <p className="mt-1.5 text-[10.5px] text-text-muted">Loads every row from the table — {POSTS.length} rows read.</p>
        </NodeShell>

        <Connector flowing={stage >= 1} />

        {/* SUBQUERY */}
        <NodeShell index={2} active={stage === 1} reached={stage >= 1} onClick={() => setStage(1)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-bold">Inner: AVG(likes_count)</span>
            {stage === 1 && (
              <span className="rounded-full bg-warn px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-white">
                Runs first
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[10.5px] text-text-muted">
            Even though it&apos;s written inside the outer query, MySQL evaluates this first — it has to, since the
            outer WHERE needs its answer.
          </p>
          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {POSTS.map((r) => (
                    <span
                      key={r.id}
                      className="rounded border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[9px] text-text-muted"
                    >
                      {r.likes_count}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2.5 rounded-lg border border-accent/40 bg-accent/10 py-3">
                  <span className="font-mono text-[10.5px] text-text-muted">collapses to one number:</span>
                  <motion.span
                    key={avg}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    className="font-mono text-[22px] font-bold text-accent"
                  >
                    {avg}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NodeShell>

        <Connector flowing={stage >= 2} />

        {/* WHERE */}
        <NodeShell index={3} active={stage === 2} reached={stage >= 2} onClick={() => setStage(2)}>
          <span className="font-mono text-[12.5px] font-bold">
            WHERE likes_count {op} <span className="text-accent">{avg}</span>
          </span>
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2 overflow-hidden"
              >
                <StatCard tone="ok" value={included.length} label="pass" />
                <StatCard tone="bad" value={excluded.length} label="fail" />
              </motion.div>
            )}
          </AnimatePresence>
          {stage < 2 && <p className="mt-1.5 text-[10.5px] text-text-muted">Not reached yet.</p>}
        </NodeShell>

        <Connector flowing={stage >= 3} />

        {/* SELECT */}
        <NodeShell index={4} active={stage === 3} reached={stage >= 3} onClick={() => setStage(3)}>
          <span className="font-mono text-[12.5px] font-bold">SELECT *</span>
          {stage >= 3 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {included.map(({ row }) => (
                <span
                  key={row.id}
                  className="rounded-full border border-ok bg-ok/15 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-ok"
                >
                  #{row.id} {row.username}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-[10.5px] text-text-muted">Not reached yet.</p>
          )}
        </NodeShell>
      </div>
    </div>
  );
}
