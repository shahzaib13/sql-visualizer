"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart, Table2 } from "lucide-react";
import { useState } from "react";
import { POSTS, USERS } from "@/lib/data";
import { joinRows, JOIN_STAGES } from "@/lib/joinEngine";
import { cn } from "@/lib/utils";
import { useJoinStore } from "@/store/useJoinStore";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";

const USERS_SCHEMA: SchemaColumn[] = [
  { name: "username", type: "varchar(255)", pk: true },
  { name: "full_name", type: "varchar(255)" },
  { name: "country", type: "varchar(64)" },
];

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)", fk: true },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function JoinOutputPanel() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const setStage = useJoinStore((s) => s.setStage);
  const [view, setView] = useState<"input" | "output">("output");
  const computed = stage >= 2;
  const rows = joinRows(joinType);

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-3 sm:p-4 text-text">
      {/* View Switcher */}
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
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[26px] font-bold">{USERS.length} + {POSTS.length}</span>
            <span className="text-[11.5px] text-text-muted">rows in source tables</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Two untouched tables before the <b className="font-mono text-text">JOIN</b> links them on <b className="font-mono text-accent">username</b>. Notice <b className="font-mono text-warn">zara_iqbal</b> has no posts!
          </p>

          {/* Database Schemas stacked cleanly */}
          <div className="flex flex-col gap-3">
            <SchemaCard tableName="users" columns={USERS_SCHEMA} highlight={["username"]} />
            <SchemaCard tableName="posts" columns={POSTS_SCHEMA} highlight={["username"]} />
          </div>

          <div className="mt-2 flex flex-col gap-3.5">
            {/* Users source table */}
            <div className="flex flex-col min-w-0">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-bold">
                <span className="flex items-center gap-1 text-text">
                  <Table2 className="h-3 w-3 text-accent" />
                  users ({USERS.length})
                </span>
                <span className="text-[9.5px] text-text-muted font-normal">PK: username</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {USERS.map((u) => {
                  const userPosts = POSTS.filter((p) => p.username === u.username);
                  const hasPosts = userPosts.length > 0;
                  return (
                    <div
                      key={u.username}
                      className={cn(
                        "flex items-center justify-between gap-1.5 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]",
                        !hasPosts && "border-warn/40 bg-warn/5"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-text">@{u.username}</div>
                        <div className="truncate text-[10px] text-text-muted">{u.full_name} · {u.country}</div>
                      </div>
                      {!hasPosts ? (
                        <span className="rounded-full bg-warn/15 border border-warn/30 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-amber-800 flex-none">
                          0 posts
                        </span>
                      ) : (
                        <span className="font-mono text-[9.5px] text-text-muted flex-none">
                          {userPosts.length} post{userPosts.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Posts source table */}
            <div className="flex flex-col min-w-0">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-bold">
                <span className="flex items-center gap-1 text-text">
                  <Table2 className="h-3 w-3 text-flow" />
                  posts ({POSTS.length})
                </span>
                <span className="text-[9.5px] text-text-muted font-normal">FK: username</span>
              </div>
              <div className="flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-0.5">
                {POSTS.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-row)]"
                  >
                    <span className="w-4 font-mono text-[10px] text-text-muted flex-none">#{p.id}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-[11px] text-text">@{p.username}</span>
                    <span className="font-mono text-[10px] text-text-muted flex-none">{p.format}</span>
                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-bad font-semibold flex-none">
                      <Heart className="h-2 w-2 fill-current" strokeWidth={0} />
                      {p.likes_count}
                    </span>
                  </div>
                ))}
              </div>
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
              SELECT hasn&apos;t run yet — advance to the SELECT stage to see the joined rows.
            </p>
          ) : (
            /* Responsive auto-fit table without horizontal overflow */
            <div className="w-full min-w-0 mt-3 pb-2">
              <div className="overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-row)]">
                {/* Table Header */}
                <div className="grid grid-cols-[minmax(0,1fr)_48px_44px] gap-2 border-b border-border bg-panel-2 px-3 py-2 font-mono text-[9.5px] font-bold tracking-wide text-text-muted uppercase">
                  <span className="truncate">user / name</span>
                  <span className="text-center">format</span>
                  <span className="text-right">likes</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <motion.div
                      key={`${r.key}-${r.post?.id ?? "null"}-${i}`}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015, type: "spring", stiffness: 380, damping: 30 }}
                      className="grid grid-cols-[minmax(0,1fr)_48px_44px] items-center gap-2 px-3 py-2 text-[11.5px]"
                    >
                      {r.user ? (
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-text">@{r.user.username}</div>
                          <div className="truncate text-[10px] text-text-muted">{r.user.full_name} · {r.user.country}</div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <span className="rounded-full bg-warn/15 border border-warn/30 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-amber-800">
                            NULL user
                          </span>
                        </div>
                      )}

                      {r.post ? (
                        <>
                          <span className="w-12 text-center rounded bg-panel-2 px-1 py-0.5 font-mono text-[10px] text-text-muted border border-border truncate">
                            {r.post.format}
                          </span>
                          <span className="w-11 text-right font-mono text-[11px] font-bold text-accent">
                            {r.post.likes_count}
                          </span>
                        </>
                      ) : (
                        <div className="col-span-2 text-right">
                          <span className="rounded-full bg-warn/15 border border-warn/30 px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-amber-800">
                            NULL post
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage < JOIN_STAGES.length - 1 && (
            <button
              type="button"
              onClick={() => setStage(stage + 1)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 font-mono text-[11.5px] font-bold text-accent-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
            >
              Advance to {JOIN_STAGES[stage + 1]}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
