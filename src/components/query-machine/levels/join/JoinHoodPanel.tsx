"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Table2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { POSTS, USERS, type UserRow } from "@/lib/data";
import { joinRows, JOIN_STAGES } from "@/lib/joinEngine";
import { cn } from "@/lib/utils";
import { useJoinStore } from "@/store/useJoinStore";
import { SchemaCard } from "@/components/query-machine/SchemaCard";

const USERS_SCHEMA = [
  { name: "username", type: "varchar(255)", pk: true },
  { name: "full_name", type: "varchar(255)" },
  { name: "country", type: "varchar(64)" },
];

const POSTS_SCHEMA = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)", fk: true },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

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

function UserMatchCard({ user, joinType, reached }: { user: UserRow; joinType: "INNER" | "LEFT"; reached: boolean }) {
  const matches = POSTS.filter((p) => p.username === user.username);
  const hasMatch = matches.length > 0;
  const dropped = reached && !hasMatch && joinType === "INNER";
  const keptWithNull = reached && !hasMatch && joinType === "LEFT";

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border-2 p-2.5",
        dropped ? "border-dashed border-border opacity-50" : keptWithNull ? "border-dashed border-warn/50" : "border-ok/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold">
          {user.full_name} <span className="text-text-muted">@{user.username}</span>
        </span>
        {reached &&
          (hasMatch ? (
            <span className="flex items-center gap-1 rounded-full bg-ok/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-ok">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
              {matches.length} match{matches.length === 1 ? "" : "es"}
            </span>
          ) : dropped ? (
            <span className="flex items-center gap-1 rounded-full bg-bad/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-bad">
              <X className="h-2.5 w-2.5" strokeWidth={3} />
              dropped
            </span>
          ) : (
            <span className="rounded-full bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-warn">NULL</span>
          ))}
      </div>
      {reached && hasMatch && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((p) => (
            <span
              key={p.id}
              className="rounded-full border border-border bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-text-muted"
            >
              {p.format} · {p.likes_count} likes
            </span>
          ))}
        </div>
      )}
      {reached && !hasMatch && (
        <p className="mt-1.5 text-[10px] text-text-muted">
          {dropped ? "No posts — no match, so this user is excluded entirely." : "No posts — kept anyway, post columns are NULL."}
        </p>
      )}
    </motion.div>
  );
}

export function JoinHoodPanel() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const setStage = useJoinStore((s) => s.setStage);
  const rows = joinRows(joinType);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">
          Phase {stage + 1}/{JOIN_STAGES.length} · {JOIN_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — 3 clauses recognised
        </div>

        {/* FROM */}
        <NodeShell index={1} active={stage === 0} reached={stage >= 0} onClick={() => setStage(0)}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[12.5px] font-bold">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              FROM users u
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
              Base table
            </span>
          </div>
          <p className="mt-1.5 text-[10.5px] text-text-muted">Loads every row from the table — {USERS.length} rows read.</p>
        </NodeShell>

        <Connector flowing={stage >= 1} />

        {/* JOIN */}
        <NodeShell index={2} active={stage === 1} reached={stage >= 1} onClick={() => setStage(1)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-bold">
              {joinType} JOIN posts p
            </span>
            {stage === 1 && (
              <span className="rounded-full bg-warn px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-white">
                Active bottleneck
              </span>
            )}
          </div>

          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-2 font-mono text-[10.5px] text-text-muted">
                  ON u.<span className="text-accent">username</span> = p.<span className="text-accent">username</span>
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1">
                    <SchemaCard tableName="users" columns={USERS_SCHEMA} highlight={["username"]} />
                  </div>
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                    <Link2 className="h-3 w-3" />
                  </span>
                  <div className="flex-1">
                    <SchemaCard tableName="posts" columns={POSTS_SCHEMA} highlight={["username"]} />
                  </div>
                </div>

                <p className="mt-3 mb-2 text-[9.5px] font-semibold tracking-wide text-text-muted uppercase">
                  Matching each user against posts:
                </p>
                <div className="flex flex-col gap-2">
                  {USERS.map((u) => (
                    <UserMatchCard key={u.username} user={u} joinType={joinType} reached={stage >= 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {stage < 1 && <p className="mt-1.5 text-[10.5px] text-text-muted">Not reached yet.</p>}
        </NodeShell>

        <Connector flowing={stage >= 2} />

        {/* SELECT */}
        <NodeShell index={3} active={stage === 2} reached={stage >= 2} onClick={() => setStage(2)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-bold">SELECT u.username, u.full_name, p.format, p.likes_count</span>
            {stage >= 2 && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
                {rows.length} row{rows.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {stage >= 2 ? (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {rows.map((r, i) => (
                <motion.div
                  key={`${r.key}-${r.post?.id ?? "null"}`}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-panel-2 px-2.5 py-1.5 font-mono text-[10.5px]"
                >
                  <span className="font-semibold">{r.user.username}</span>
                  <span className="text-text-muted">{r.user.full_name}</span>
                  {r.post ? (
                    <>
                      <span className="text-text-muted">·</span>
                      <span>{r.post.format}</span>
                      <span className="text-text-muted">·</span>
                      <span>{r.post.likes_count} likes</span>
                    </>
                  ) : (
                    <span className="rounded-full bg-warn/15 px-1.5 py-0.5 text-[9px] font-bold text-warn">NULL, NULL</span>
                  )}
                </motion.div>
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
