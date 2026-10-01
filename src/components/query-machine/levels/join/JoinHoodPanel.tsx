"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Link2, Sparkles, Table2, UserX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { POSTS, USERS } from "@/lib/data";
import { joinRows, JOIN_STAGES, type JoinType } from "@/lib/joinEngine";
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

function NodeCard({
  id,
  index,
  title,
  subtitle,
  badge,
  active,
  onClick,
  children,
}: {
  id?: string;
  index: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      layout
      animate={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)" : "none",
      }}
      className="w-full rounded-xl border bg-panel p-3.5 sm:p-4 shadow-[var(--shadow-row)] transition-all"
    >
      <div
        onClick={onClick}
        className="flex cursor-pointer items-center justify-between gap-2 border-b border-border pb-2.5"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "flex h-6 w-6 flex-none items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-xs",
              active ? "bg-accent text-accent-ink" : "border border-border bg-panel-2 text-text-muted",
            )}
          >
            {index}
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[12.5px] font-bold text-text truncate">{title}</div>
            {subtitle && <div className="text-[10.5px] text-text-muted mt-0.5 truncate">{subtitle}</div>}
          </div>
        </div>
        {badge}
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

const CX_A = 70;
const CX_B = 120;
const CY = 45;
const R = 34;

function JoinVennDiagram({ joinType }: { joinType: JoinType }) {
  let title = "";
  let description = "";

  if (joinType === "INNER") {
    title = "INNER JOIN (Intersection)";
    description = "Retains ONLY rows where users.username = posts.username exists in BOTH tables.";
  } else if (joinType === "LEFT") {
    title = "LEFT JOIN (All Left + Matches)";
    description = "Retains ALL users. If a user has no posts (e.g. @zara_iqbal), post columns are filled with NULL.";
  } else if (joinType === "RIGHT") {
    title = "RIGHT JOIN (All Right + Matches)";
    description = "Retains ALL posts. If a post has no user, user columns are filled with NULL.";
  } else if (joinType === "FULL OUTER") {
    title = "FULL OUTER JOIN (Complete Union)";
    description = "Retains ALL users and ALL posts. Unmatched rows on either side are filled with NULL.";
  } else if (joinType === "CROSS") {
    title = "CROSS JOIN (Cartesian Product)";
    description = "Pairs EVERY user with EVERY post. Result size = 10 users × 20 posts = 200 rows.";
  }

  return (
    <div className="mb-3 flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
      {joinType === "CROSS" ? (
        <div className="flex h-[80px] w-[140px] flex-none items-center justify-center rounded-lg border border-accent/20 bg-panel font-mono text-[12px] font-bold text-accent">
          10 × 20 = 200
        </div>
      ) : (
        <svg viewBox="0 0 190 90" className="h-[80px] w-[140px] flex-none">
          <defs>
            <clipPath id="join-lens">
              <circle cx={CX_B} cy={CY} r={R} />
            </clipPath>
          </defs>

          {/* Circle Outlines */}
          <circle cx={CX_A} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={1.5} />
          <circle cx={CX_B} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={1.5} />

          {/* Fill based on JoinType */}
          {joinType === "INNER" && (
            <motion.circle
              key="inner"
              initial={{ fillOpacity: 0 }}
              animate={{ fillOpacity: 0.85 }}
              transition={{ duration: 0.3 }}
              cx={CX_A}
              cy={CY}
              r={R}
              clipPath="url(#join-lens)"
              fill="var(--accent)"
            />
          )}

          {joinType === "LEFT" && (
            <>
              <motion.circle
                key="left-a"
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: 0.5 }}
                transition={{ duration: 0.3 }}
                cx={CX_A}
                cy={CY}
                r={R}
                fill="var(--accent)"
              />
              <motion.circle
                key="left-lens"
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: 0.95 }}
                transition={{ duration: 0.3 }}
                cx={CX_A}
                cy={CY}
                r={R}
                clipPath="url(#join-lens)"
                fill="var(--accent)"
              />
            </>
          )}

          {joinType === "RIGHT" && (
            <>
              <motion.circle
                key="right-b"
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: 0.5 }}
                transition={{ duration: 0.3 }}
                cx={CX_B}
                cy={CY}
                r={R}
                fill="var(--accent)"
              />
              <motion.circle
                key="right-lens"
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: 0.95 }}
                transition={{ duration: 0.3 }}
                cx={CX_A}
                cy={CY}
                r={R}
                clipPath="url(#join-lens)"
                fill="var(--accent)"
              />
            </>
          )}

          {joinType === "FULL OUTER" && (
            <>
              <circle cx={CX_A} cy={CY} r={R} fill="var(--accent)" fillOpacity={0.5} />
              <circle cx={CX_B} cy={CY} r={R} fill="var(--accent)" fillOpacity={0.5} />
              <circle cx={CX_A} cy={CY} r={R} clipPath="url(#join-lens)" fill="var(--accent)" fillOpacity={0.9} />
            </>
          )}

          {/* Labels A (users) and B (posts) */}
          <text x={CX_A - 14} y={CY + 4} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="var(--text)">
            users
          </text>
          <text x={CX_B - 2} y={CY + 4} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="var(--text)">
            posts
          </text>
        </svg>
      )}

      <div className="min-w-0 flex-1 text-left">
        <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-wider">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] text-text-muted leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}

function JoinBipartiteVisual({ joinType }: { joinType: JoinType }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const postRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const nullRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState<string | null>("zara_iqbal");
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);

  const hoveredPostItem = hoveredPost !== null ? POSTS.find((p) => p.id === hoveredPost) : null;
  const activeFocusUser = hoveredUser ?? hoveredPostItem?.username ?? selectedUser;

  const [lines, setLines] = useState<
    {
      id: string;
      username: string;
      postId: number | "null";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isDashed?: boolean;
    }[]
  >([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCoordinates = () => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      setSvgSize({ width: cRect.width, height: cRect.height });

      const newLines: typeof lines = [];

      USERS.forEach((u) => {
        const uEl = userRefs.current[u.username];
        if (!uEl) return;
        const uRect = uEl.getBoundingClientRect();
        const x1 = uRect.right - cRect.left;
        const y1 = uRect.top - cRect.top + uRect.height / 2;

        if (joinType === "CROSS") {
          if (!activeFocusUser || activeFocusUser === u.username) {
            POSTS.forEach((p) => {
              const pEl = postRefs.current[p.id];
              if (!pEl) return;
              const pRect = pEl.getBoundingClientRect();
              newLines.push({
                id: `${u.username}-${p.id}`,
                username: u.username,
                postId: p.id,
                x1,
                y1,
                x2: pRect.left - cRect.left,
                y2: pRect.top - cRect.top + pRect.height / 2,
              });
            });
          }
          return;
        }

        const matches = POSTS.filter((p) => p.username === u.username);
        if (matches.length > 0) {
          matches.forEach((p) => {
            const pEl = postRefs.current[p.id];
            if (!pEl) return;
            const pRect = pEl.getBoundingClientRect();
            const x2 = pRect.left - cRect.left;
            const y2 = pRect.top - cRect.top + pRect.height / 2;
            newLines.push({
              id: `${u.username}-${p.id}`,
              username: u.username,
              postId: p.id,
              x1,
              y1,
              x2,
              y2,
            });
          });
        } else if (joinType === "LEFT" || joinType === "FULL OUTER") {
          const nullEl = nullRef.current;
          if (nullEl) {
            const nRect = nullEl.getBoundingClientRect();
            const x2 = nRect.left - cRect.left;
            const y2 = nRect.top - cRect.top + nRect.height / 2;
            newLines.push({
              id: `${u.username}-null`,
              username: u.username,
              postId: "null",
              x1,
              y1,
              x2,
              y2,
              isDashed: true,
            });
          }
        }
      });

      setLines(newLines);
    };

    updateCoordinates();
    const handleResize = () => updateCoordinates();
    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(updateCoordinates);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, [joinType, activeFocusUser]);

  return (
    <div className="mt-3">
      {/* Quick user focus filter */}
      <div className="mb-2.5 rounded-lg border border-border bg-panel-2 p-2">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-text-muted uppercase">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            Inspect User Connections:
          </span>
          <span className="font-mono text-[9px] font-normal text-text-muted lowercase">
            click a user to trace matching posts
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[9.5px] font-semibold transition-colors",
              selectedUser === null ? "bg-accent text-accent-ink" : "bg-panel text-text-muted border border-border hover:text-text",
            )}
          >
            Show All
          </button>
          {USERS.map((u) => {
            const count = POSTS.filter((p) => p.username === u.username).length;
            const isSelected = selectedUser === u.username;
            return (
              <button
                key={u.username}
                type="button"
                onClick={() => setSelectedUser(isSelected ? null : u.username)}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9.5px] font-semibold transition-colors",
                  isSelected
                    ? "bg-accent text-accent-ink shadow-xs"
                    : count === 0
                    ? "bg-warn/10 text-warn border border-warn/30 hover:bg-warn/20"
                    : "bg-panel text-text-muted border border-border hover:text-text",
                )}
              >
                <span>@{u.username}</span>
                {count === 0 && <span className="text-[8px] font-bold">(0)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Bipartite Canvas with SVG connecting lines */}
      <div
        ref={containerRef}
        className="relative grid grid-cols-[1fr_40px_1fr] sm:grid-cols-[1fr_80px_1fr] gap-2 rounded-xl border border-border bg-panel-2 p-2.5 sm:p-3 overflow-hidden"
      >
        {/* SVG Bezier Curves overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full z-10"
          style={{ width: svgSize.width, height: svgSize.height }}
        >
          {lines.map((line) => {
            const isUserActive = !activeFocusUser || activeFocusUser === line.username;
            const isNull = line.postId === "null";

            // Cubic Bezier curve
            const midX = (line.x1 + line.x2) / 2;
            const pathD = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <path
                key={line.id}
                d={pathD}
                fill="none"
                stroke={isNull ? "var(--warn)" : isUserActive ? "var(--accent)" : "var(--border)"}
                strokeWidth={isUserActive ? 2 : 1}
                strokeDasharray={line.isDashed ? "4 4" : undefined}
                strokeOpacity={isUserActive ? 0.9 : 0.25}
                className="transition-all duration-200"
              />
            );
          })}
        </svg>

        {/* Left Column: Users */}
        <div className="flex flex-col gap-1.5 z-20">
          <div className="font-mono text-[10px] font-bold text-text-muted uppercase border-b border-border pb-1">
            users (Left)
          </div>
          {USERS.map((u) => {
            const postCount = POSTS.filter((p) => p.username === u.username).length;
            const isFocus = activeFocusUser === u.username;
            const isZero = postCount === 0;

            return (
              <div
                key={u.username}
                ref={(el) => {
                  userRefs.current[u.username] = el;
                }}
                onMouseEnter={() => setHoveredUser(u.username)}
                onMouseLeave={() => setHoveredUser(null)}
                onClick={() => setSelectedUser(selectedUser === u.username ? null : u.username)}
                className={cn(
                  "cursor-pointer rounded-lg border px-2 py-1.5 transition-all text-[11px]",
                  isFocus
                    ? "border-accent bg-accent/15 ring-2 ring-accent/30 font-bold"
                    : isZero
                    ? "border-warn/40 bg-warn/5 text-warn hover:border-warn"
                    : "border-border bg-panel hover:border-accent/40",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate font-semibold">@{u.username}</span>
                  {isZero ? (
                    <span className="rounded bg-warn/20 px-1 py-0.2 font-mono text-[8.5px] font-bold text-warn">
                      0 posts
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] text-text-muted">
                      {postCount} match{postCount > 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Gutter */}
        <div className="flex flex-col items-center justify-center font-mono text-[9px] text-text-muted/60 uppercase">
          <span>ON PK = FK</span>
        </div>

        {/* Right Column: Posts */}
        <div className="flex flex-col gap-1.5 z-20">
          <div className="font-mono text-[10px] font-bold text-text-muted uppercase border-b border-border pb-1">
            posts (Right)
          </div>

          {(joinType === "LEFT" || joinType === "FULL OUTER") && (
            <div
              ref={nullRef}
              className="rounded-lg border-2 border-dashed border-warn/50 bg-warn/10 px-2 py-1.5 text-center font-mono text-[10.5px] font-bold text-warn"
            >
              <div className="flex items-center justify-center gap-1">
                <UserX className="h-3 w-3" />
                <span>NULL Post Row</span>
              </div>
              <div className="text-[8.5px] font-normal text-text-muted">Assigned when user has no posts</div>
            </div>
          )}

          {POSTS.map((p) => {
            const isFocus = activeFocusUser === p.username;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  postRefs.current[p.id] = el;
                }}
                onMouseEnter={() => setHoveredPost(p.id)}
                onMouseLeave={() => setHoveredPost(null)}
                className={cn(
                  "cursor-pointer rounded-lg border px-2 py-1 text-[11px] transition-all",
                  isFocus
                    ? "border-accent bg-accent/15 ring-2 ring-accent/30 font-bold"
                    : "border-border bg-panel hover:border-accent/40",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9.5px] text-text-muted">#{p.id}</span>
                  <span className="truncate text-text-muted">@{p.username}</span>
                  <span className="flex items-center gap-0.5 font-mono text-[9.5px] text-bad">
                    <Heart className="h-2 w-2 fill-current" />
                    {p.likes_count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function JoinHoodPanel() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const setStage = useJoinStore((s) => s.setStage);
  const rows = joinRows(joinType);

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

      const target = document.getElementById(`join-node-${stage}`);
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
          Phase {stage + 1}/{JOIN_STAGES.length} · {JOIN_STAGES[stage]}
        </span>
      </div>

      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold text-ok">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Query parsed — {joinType} JOIN stitching 2 tables
        </div>

        {/* Stage 1: FROM */}
        <NodeCard
          id="join-node-0"
          index={1}
          active={stage === 0}
          onClick={() => setStage(0)}
          title={
            <span className="flex items-center gap-1.5">
              <Table2 className="h-3.5 w-3.5 text-text-muted" />
              FROM users u
            </span>
          }
          subtitle={`Loads every row from the users table — ${USERS.length} rows read.`}
          badge={
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
              Left table ({USERS.length} rows)
            </span>
          }
        >
          <div className="rounded-lg border border-border bg-panel-2 p-2.5 text-[11.5px] text-text-muted leading-relaxed">
            The database initializes its pipeline by buffering the primary driving table <b className="font-mono text-text">users</b> into memory before evaluating join criteria.
          </div>
        </NodeCard>

        <CenteredConnector flowing={stage >= 1} />

        {/* Stage 2: JOIN */}
        <NodeCard
          id="join-node-1"
          index={2}
          active={stage === 1}
          onClick={() => setStage(1)}
          title={`${joinType} JOIN posts p`}
          subtitle={
            joinType === "CROSS"
              ? "Cartesian product: pairs every user with every post"
              : "Matching condition: u.username = p.username"
          }
          badge={
            stage === 1 ? (
              <span className="rounded-full bg-warn px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-white">
                Active linking
              </span>
            ) : (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
                Stage 2
              </span>
            )
          }
        >
          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Venn Diagram Visual explaining this JOIN type */}
                <JoinVennDiagram joinType={joinType} />

                {/* Schemas side-by-side with Link icon */}
                <div className="flex items-center gap-2">
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

                {/* Bipartite Graph Linking Visual */}
                <JoinBipartiteVisual joinType={joinType} />
              </motion.div>
            )}
          </AnimatePresence>

          {stage < 1 && <p className="text-[11px] text-text-muted">Advance to stage 2 to inspect table relationships and matches.</p>}
        </NodeCard>

        <CenteredConnector flowing={stage >= 2} />

        {/* Stage 3: SELECT */}
        <NodeCard
          id="join-node-2"
          index={3}
          active={stage === 2}
          onClick={() => setStage(2)}
          title="SELECT u.username, u.full_name, p.format, p.likes_count"
          subtitle="Emits the joined and filtered tuple stream to the client"
          badge={
            stage >= 2 ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-accent">
                {rows.length} row{rows.length === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] font-bold whitespace-nowrap text-text-muted">
                Stage 3
              </span>
            )
          }
        >
          {stage >= 2 ? (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] text-text-muted mb-1">
                Joined tuples synthesized from memory:
              </div>
              <div className="max-h-[280px] overflow-y-auto flex flex-col gap-1.5 pr-1">
                {rows.map((r, i) => (
                  <motion.div
                    key={`${r.key}-${r.post?.id ?? "null"}-${i}`}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-panel-2 px-3 py-1.5 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">@{r.user?.username ?? "NULL"}</span>
                      <span className="text-text-muted text-[10px]">{r.user?.full_name ?? "No User Record"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.post ? (
                        <>
                          <span className="rounded bg-panel px-1.5 py-0.5 text-[10px] text-text-muted border border-border">
                            {r.post.format}
                          </span>
                          <span className="text-accent font-bold">{r.post.likes_count} likes</span>
                        </>
                      ) : (
                        <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[9px] font-bold text-warn">
                          NULL post
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-muted">Advance to stage 3 to emit the joined rows.</p>
          )}
        </NodeCard>
      </div>
    </div>
  );
}
