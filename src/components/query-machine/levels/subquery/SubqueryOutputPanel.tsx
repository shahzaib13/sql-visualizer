"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { POSTS } from "@/lib/data";
import { classifyBySubquery, subqueryAvgLikes, SUBQUERY_STAGES } from "@/lib/subqueryEngine";
import { cn } from "@/lib/utils";
import { useSubqueryStore } from "@/store/useSubqueryStore";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";
import { useTranslation } from "@/lib/i18n/useTranslation";

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function SubqueryOutputPanel() {
  const { t } = useTranslation();
  const stage = useSubqueryStore((s) => s.stage);
  const op = useSubqueryStore((s) => s.op);
  const setStage = useSubqueryStore((s) => s.setStage);
  const [view, setView] = useState<"input" | "output">("output");
  const [filter, setFilter] = useState<"all" | "included" | "excluded">("all");
  const computed = stage >= 3;
  const avg = subqueryAvgLikes();
  const allResults = classifyBySubquery(op);
  const included = allResults.filter((r) => r.included);
  const excluded = allResults.filter((r) => !r.included);
  const totalLikes = POSTS.reduce((acc, p) => acc + p.likes_count, 0);

  const visibleRows =
    filter === "all" ? allResults : filter === "included" ? included : excluded;

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
      <div className="mb-3.5 flex gap-0.5 rounded-lg border border-border bg-panel p-[3px]">
        {(["input", "output"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "flex-1 rounded-md py-1.5 font-mono text-[11px] font-semibold transition-colors",
              view === v ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text",
            )}
          >
            {v === "input" ? t.output.inputTab : t.output.outputTab}
          </button>
        ))}
      </div>

      {view === "input" ? (
        <div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{POSTS.length}</span>
            <span className="text-[11.5px] text-text-muted">raw likes_count values</span>
          </div>
          <p className="mt-1 mb-3 text-[11px] text-text-muted leading-relaxed">
            The inner subquery runs <b className="font-mono text-text">SELECT AVG(likes_count) FROM posts</b> over these {POSTS.length} numbers.
          </p>

          <SchemaCard
            tableName="posts"
            columns={POSTS_SCHEMA}
            highlight={["likes_count"]}
          />

          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-lg border border-border bg-panel p-2 text-center font-mono">
            <div className="min-w-0">
              <div className="text-[9px] text-text-muted uppercase truncate">Rows</div>
              <div className="text-[13px] font-bold text-text truncate">{POSTS.length}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-text-muted uppercase truncate">Total Sum</div>
              <div className="text-[13px] font-bold text-text truncate">{totalLikes.toLocaleString()}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-text-muted uppercase truncate">Average</div>
              <div className="text-[13px] font-bold text-accent truncate">{avg}</div>
            </div>
          </div>

          <div className="w-full min-w-0 pb-2">
            <div className="mt-3.5 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
              <span className="w-4 flex-none">id</span>
              <span className="min-w-0 flex-1 truncate">user</span>
              <span className="w-12 flex-none text-right">likes</span>
              <span className="w-12 flex-none text-right">vs avg</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {POSTS.map((r) => {
                const diff = Math.round((r.likes_count - avg) * 10) / 10;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]"
                  >
                    <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(r.id).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-text">{r.username}</span>
                    <span className="flex w-14 flex-none items-center justify-end gap-1 font-mono text-[10.5px] text-bad font-semibold">
                      <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                      {r.likes_count}
                    </span>
                    <span className={cn("w-14 flex-none text-right font-mono text-[10px] font-bold", diff >= 0 ? "text-ok" : "text-warn")}>
                      {diff >= 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Subquery Filter Tabs */}
          <div className="flex gap-0.5 rounded-lg border border-border bg-panel p-[3px] shadow-[var(--shadow)]">
            {[
              { key: "all", label: t.output.tabAll, count: POSTS.length },
              { key: "included", label: t.output.tabIncluded, count: included.length },
              { key: "excluded", label: t.output.tabExcluded, count: excluded.length },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key as "all" | "included" | "excluded")}
                className={cn(
                  "flex-1 min-w-0 rounded-md px-1.5 py-1.5 text-[11px] font-semibold text-center truncate transition-colors flex items-center justify-center gap-1",
                  filter === f.key ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text",
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold leading-tight",
                    filter === f.key
                      ? "bg-accent-ink/20 text-accent-ink"
                      : f.key === "included"
                        ? "bg-ok/15 text-ok"
                        : f.key === "excluded"
                          ? "bg-bad/15 text-bad"
                          : "bg-panel-2 text-text-muted",
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{computed ? (filter === "all" ? POSTS.length : filter === "included" ? included.length : excluded.length) : "?"}</span>
            <span className="text-[11.5px] text-text-muted">
              {t.output.rowsReturned} · {filter}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[10.5px] text-text-muted">
            Condition: <span className="font-semibold text-text">likes_count {op} {avg}</span> (subquery avg)
          </p>

          {!computed ? (
            <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-[12px] text-text-muted">
              {t.output.selectNotRunYet}
            </p>
          ) : filter === "all" ? (
            <div className="mt-4 flex flex-col gap-4 pb-2">
              {/* Included Section */}
              {included.length > 0 && (
                <div className="rounded-xl border border-ok/35 bg-ok/[0.04] p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok text-accent-ink text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="text-[12px] font-bold text-ok uppercase tracking-wider">
                        {t.output.passedCondition(included.length)}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-ok bg-ok/10 border border-ok/25 px-2 py-0.5 rounded-full font-semibold">
                      {t.output.returnedBySql}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-2 px-0.5">
                    likes_count {op} {avg} (exceeds or matches threshold).
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {included.map(({ row }, i) => (
                      <motion.div
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, type: "spring", stiffness: 380, damping: 30 }}
                        className="flex items-center gap-2 rounded-md border border-border border-l-[3px] border-l-ok bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px]"
                      >
                        <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(row.id).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 truncate font-semibold text-text">{row.username}</span>
                        <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">{row.format}</span>
                        <span className="flex flex-none gap-2 font-mono text-[10.5px]">
                          <span className="flex items-center gap-0.5 text-bad font-semibold">
                            <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                            {row.likes_count}
                          </span>
                          <span className="flex items-center gap-0.5 text-flow font-semibold">
                            <Eye className="h-2.5 w-2.5" />
                            {row.views_count}
                          </span>
                        </span>
                        <span className="flex-none rounded-full border border-ok/40 bg-ok/15 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-ok">
                          ✓ IN
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Section */}
              {excluded.length > 0 && (
                <div className="rounded-xl border border-bad/25 bg-bad/[0.02] p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bad/20 text-bad text-[10px] font-bold">
                        ✗
                      </span>
                      <span className="text-[12px] font-bold text-bad uppercase tracking-wider">
                        {t.output.excludedCondition(excluded.length)}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-bad bg-bad/10 border border-bad/20 px-2 py-0.5 rounded-full font-semibold">
                      {t.output.droppedBadge}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-text-muted mb-2 px-0.5">
                    likes_count does not satisfy {op} {avg}.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {excluded.map(({ row }, i) => (
                      <motion.div
                        key={row.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, type: "spring", stiffness: 380, damping: 30 }}
                        className="flex items-center gap-2 rounded-md border border-border border-l-[3px] border-l-bad bg-panel px-2.5 py-1.5 opacity-60 shadow-[var(--shadow-row)] text-[11.5px]"
                      >
                        <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(row.id).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 truncate font-semibold text-text-muted">{row.username}</span>
                        <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">{row.format}</span>
                        <span className="flex flex-none gap-2 font-mono text-[10.5px]">
                          <span className="flex items-center gap-0.5 text-bad/70">
                            <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                            {row.likes_count}
                          </span>
                          <span className="flex items-center gap-0.5 text-flow/70">
                            <Eye className="h-2.5 w-2.5" />
                            {row.views_count}
                          </span>
                        </span>
                        <span className="flex-none rounded-full border border-bad/30 bg-bad/10 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-bad">
                          ✗ OUT
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 w-full min-w-0 pb-2">
              <div className="w-full flex flex-col gap-1.5">
                {visibleRows.map(({ row, included: isInc }, i) => (
                  <motion.div
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, type: "spring", stiffness: 380, damping: 30 }}
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-border border-l-[3px] bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px]",
                      isInc ? "border-l-ok" : "border-l-bad opacity-65",
                    )}
                  >
                    <span className="w-4 flex-none font-mono text-[10px] text-text-muted">{String(row.id).padStart(2, "0")}</span>
                    <span className={cn("min-w-0 flex-1 truncate font-semibold", isInc ? "text-text" : "text-text-muted")}>
                      {row.username}
                    </span>
                    <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">{row.format}</span>
                    <span className="flex flex-none gap-2 font-mono text-[10.5px]">
                      <span className="flex items-center gap-0.5 text-bad font-semibold">
                        <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                        {row.likes_count}
                      </span>
                      <span className="flex items-center gap-0.5 text-flow font-semibold">
                        <Eye className="h-2.5 w-2.5" />
                        {row.views_count}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex-none rounded-full border px-1.5 py-0.5 font-mono text-[8.5px] font-bold",
                        isInc ? "border-ok/40 bg-ok/15 text-ok" : "border-bad/30 bg-bad/10 text-bad",
                      )}
                    >
                      {isInc ? "✓ IN" : "✗ OUT"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {stage < SUBQUERY_STAGES.length - 1 && (
            <button
              type="button"
              onClick={() => setStage(stage + 1)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
            >
              {t.output.advanceTo} {SUBQUERY_STAGES[stage + 1]}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
