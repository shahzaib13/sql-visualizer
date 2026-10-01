"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Check, Layers, Sparkles, Table2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { POSTS } from "@/lib/data";
import { classifyBySubquery, subqueryAvgLikes, SUBQUERY_STAGES } from "@/lib/subqueryEngine";
import { cn } from "@/lib/utils";
import { useSubqueryStore } from "@/store/useSubqueryStore";

function CenteredConnector({ flowing }: { flowing: boolean }) {
  return (
    <div className="my-1.5 flex justify-center">
      <div className="relative h-4 w-px overflow-hidden">
        <div className={cn("absolute inset-0", flowing ? "bg-flow" : "bg-border")} />
        {flowing && (
          <motion.div
            className="absolute inset-x-0 h-2 bg-gradient-to-b from-transparent via-accent to-transparent"
            animate={{ y: ["-8px", "16px"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
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

  // Autoscroll smoothly to the active stage node so user never loses sight of WHERE or SUBQUERY
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

      const target = document.getElementById(`subquery-node-${stage}`);
      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop = targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: Math.max(0, targetTop - 20),
        behavior: "smooth",
      });
    };

    // Immediate tick + delayed tick to account for Framer Motion height expansion
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
          Phase {stage + 1}/{SUBQUERY_STAGES.length} · {SUBQUERY_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 1 outer query wrapping 1 nested subquery
        </div>

        {/* NODE 0: FROM posts */}
        <div
          id="subquery-node-0"
          onClick={() => setStage(0)}
          className={cn(
            "w-full cursor-pointer rounded-xl border bg-panel p-3.5 sm:p-4 shadow-[var(--shadow-row)] transition-all",
            stage === 0 ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-6 w-6 flex-none items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-xs",
                  stage === 0 ? "bg-accent text-accent-ink" : "border border-border bg-panel-2 text-text-muted",
                )}
              >
                1
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[12.5px] font-bold text-text">
                <Table2 className="h-3.5 w-3.5 text-text-muted" />
                FROM posts
              </span>
            </div>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
              Base table ({POSTS.length} rows)
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-text-muted leading-relaxed">
            Loads every row from the table into working buffer memory before applying subquery filtering.
          </p>
        </div>

        <CenteredConnector flowing={stage >= 1} />

        {/* OUTER QUERY CONTAINER: Main Query containing Inner Subquery */}
        <div className="relative rounded-2xl border-2 border-dashed border-accent/40 bg-panel-2/50 p-3 sm:p-4 transition-all">
          {/* Outer Query Header Badge */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-accent uppercase">
                <Layers className="h-3 w-3" />
                Outer Query (Main) · Contains Nested Subquery
              </span>
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              WHERE likes_count {op}{" "}
              {stage >= 2 ? (
                <span className="rounded bg-accent/20 px-1.5 py-0.5 font-bold text-accent">
                  {avg}
                </span>
              ) : (
                <span className="italic text-text-muted">(awaiting inner query answer...)</span>
              )}
            </span>
          </div>

          {/* INNER SUBQUERY (RUNS FIRST) - NODE 1 */}
          <div
            id="subquery-node-1"
            onClick={() => setStage(1)}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-3.5 sm:p-4 transition-all shadow-sm bg-panel",
              stage === 1
                ? "border-accent ring-4 ring-accent/15"
                : stage > 1
                ? "border-ok/40"
                : "border-border opacity-85",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-xs",
                    stage === 1 ? "bg-accent text-accent-ink" : stage > 1 ? "bg-ok text-white" : "bg-panel-2 text-text-muted border border-border",
                  )}
                >
                  2
                </span>
                <span className="font-mono text-[12px] font-bold text-text">
                  Step 1: Inner Subquery (SELECT AVG(likes_count) FROM posts)
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[9px] font-bold whitespace-nowrap",
                  stage === 1 ? "bg-warn text-white" : stage > 1 ? "bg-ok/20 text-ok" : "border border-border text-text-muted",
                )}
              >
                {stage > 1 ? "Answer ready" : "Runs first"}
              </span>
            </div>

            <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
              This inner query runs first. MySQL inspects all {POSTS.length} posts, sums up their likes, and divides by {POSTS.length} to compute one average number.
            </p>

            <AnimatePresence>
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1">
                    {POSTS.map((r) => (
                      <span
                        key={r.id}
                        className="rounded border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[9.5px] text-text-muted"
                      >
                        {r.likes_count}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-accent/40 bg-accent/10 py-2.5">
                    <span className="font-mono text-[11px] text-text-muted">
                      sum ({POSTS.reduce((s, r) => s + r.likes_count, 0).toLocaleString()}) ÷ {POSTS.length} posts =
                    </span>
                    <motion.span
                      key={avg}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      className="rounded bg-accent px-2.5 py-0.5 font-mono text-[16px] font-bold text-accent-ink shadow-sm"
                    >
                      {avg}
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VALUE TRANSFER / POP-OUT ANIMATION TO OUTER WHERE */}
          <div className="my-2.5 flex items-center justify-center">
            {stage >= 2 ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[10.5px] font-semibold text-accent shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Average answer <b>{avg}</b> is plugged into the outer WHERE!</span>
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                <ArrowDown className="h-3 w-3 opacity-40" />
                <span>Waiting for inner subquery calculation...</span>
              </div>
            )}
          </div>

          {/* OUTER QUERY WHERE CLAUSE EVALUATION - NODE 2 */}
          <div
            id="subquery-node-2"
            onClick={() => setStage(2)}
            className={cn(
              "cursor-pointer rounded-xl border-2 p-3.5 sm:p-4 transition-all shadow-sm bg-panel",
              stage === 2
                ? "border-accent ring-4 ring-accent/15"
                : stage > 2
                ? "border-ok/40"
                : "border-border opacity-85",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-xs",
                    stage === 2 ? "bg-accent text-accent-ink" : stage > 2 ? "bg-ok text-white" : "bg-panel-2 text-text-muted border border-border",
                  )}
                >
                  3
                </span>
                <span className="font-mono text-[12px] font-bold text-text">
                  Step 2: Outer WHERE (likes_count {op} <span className="text-accent">{avg}</span>)
                </span>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] font-bold text-text-muted">
                Row comparison
              </span>
            </div>

            <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
              With the inner query replaced by <b className="text-text">{avg}</b>, MySQL evaluates each of the {POSTS.length} rows against this condition.
            </p>

            <AnimatePresence>
              {stage >= 2 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden space-y-2.5"
                >
                  <div className="flex gap-2">
                    <StatCard tone="ok" value={included.length} label="passed condition" />
                    <StatCard tone="bad" value={excluded.length} label="rejected condition" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {results.map(({ row, included: pass }) => (
                      <div
                        key={row.id}
                        className={cn(
                          "flex items-center justify-between rounded-md border px-2 py-1 font-mono text-[9.5px]",
                          pass ? "border-ok/40 bg-ok/10 text-ok font-bold" : "border-bad/30 bg-bad/5 text-bad/80 opacity-70",
                        )}
                      >
                        <span>#{row.id} ({row.likes_count})</span>
                        <span>{pass ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <p className="mt-2 text-[10.5px] italic text-text-muted">
                  Advance to stage 3 (WHERE) to evaluate table rows against {avg}.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <CenteredConnector flowing={stage >= 3} />

        {/* NODE 3: SELECT * */}
        <div
          id="subquery-node-3"
          onClick={() => setStage(3)}
          className={cn(
            "w-full cursor-pointer rounded-xl border bg-panel p-3.5 sm:p-4 shadow-[var(--shadow-row)] transition-all",
            stage === 3 ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-6 w-6 flex-none items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-xs",
                  stage === 3 ? "bg-accent text-accent-ink" : "border border-border bg-panel-2 text-text-muted",
                )}
              >
                4
              </span>
              <span className="font-mono text-[12.5px] font-bold text-text">SELECT *</span>
            </div>
            <span className="rounded-full border border-ok bg-ok/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-ok">
              {included.length} rows emitted
            </span>
          </div>

          {stage >= 3 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {included.map(({ row }) => (
                <span
                  key={row.id}
                  className="rounded-md border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-ok"
                >
                  #{row.id} @{row.username} ({row.likes_count} likes)
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[10.5px] text-text-muted">Advance to stage 4 (SELECT) to emit the final passing rows.</p>
          )}
        </div>
      </div>
    </div>
  );
}
