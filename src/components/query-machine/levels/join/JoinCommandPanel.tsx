"use client";

import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { USERS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { joinRows, JOIN_STAGES, JOIN_TYPES, unmatchedUsers } from "@/lib/joinEngine";
import { cn } from "@/lib/utils";
import { useJoinStore } from "@/store/useJoinStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { Term } from "@/components/ui/Term";

function useAutoPlay() {
  const isPlaying = useJoinStore((s) => s.isPlaying);
  const setPlaying = useJoinStore((s) => s.setPlaying);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(() => {
        useJoinStore.setState((s) => ({ stage: (s.stage + 1) % JOIN_STAGES.length }));
      }, 1600);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying]);

  return { isPlaying, togglePlay: () => setPlaying(!isPlaying) };
}

function SqlBlock() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const setStage = useJoinStore((s) => s.setStage);
  const activeName = JOIN_STAGES[stage];

  const parts: Record<string, React.ReactNode> = {
    SELECT: (
      <>
        <span className="font-bold text-code-kw">SELECT</span>{" "}
        <span className="text-code-val">u.username, u.full_name, p.format, p.likes_count</span>
      </>
    ),
    FROM: (
      <>
        <span className="font-bold text-code-kw">FROM</span> users u
      </>
    ),
    JOIN: (
      <>
        <Term term={`${joinType} JOIN`} className="font-bold text-code-kw">
          {joinType} JOIN
        </Term>{" "}
        posts p <Term term="ON" className="font-bold text-code-kw">ON</Term> u.username = p.username
      </>
    ),
  };

  const order: (typeof JOIN_STAGES)[number][] = ["SELECT", "FROM", "JOIN"];

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      {order.map((clause, i) => (
        <span key={clause}>
          <span
            onClick={() => setStage(JOIN_STAGES.indexOf(clause))}
            className={cn(
              "-my-px -mx-[3px] cursor-pointer rounded px-[3px] py-px transition-colors hover:bg-border",
              clause === activeName && "bg-accent/16",
            )}
          >
            {parts[clause]}
          </span>
          {i < order.length - 1 ? " " : ";"}
        </span>
      ))}
    </div>
  );
}

function StatusLine() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const rows = joinRows(joinType);
  const unmatched = unmatchedUsers().length;

  const text = [
    `FROM users u — ${USERS.length} rows loaded`,
    `${joinType} JOIN posts p ON u.username = p.username — ${rows.length} rows produced${
      joinType === "INNER" ? ` (${unmatched} user(s) with no posts dropped)` : ` (${unmatched} unmatched user(s) kept with NULL posts)`
    }`,
    `SELECT u.username, u.full_name, p.format, p.likes_count — ${rows.length} row(s) returned`,
  ][stage];

  return (
    <div className="mt-3.5 flex min-h-8 items-center overflow-hidden rounded-md border border-border bg-panel-2 px-3 py-2 font-mono text-[11.5px] text-flow">
      <motion.span key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {text}
      </motion.span>
    </div>
  );
}

function ExecutionTimeline() {
  const stage = useJoinStore((s) => s.stage);
  const setStage = useJoinStore((s) => s.setStage);
  const reset = useJoinStore((s) => s.reset);
  const { isPlaying, togglePlay } = useAutoPlay();

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="flex items-center gap-2.5">
        <div className="flex flex-none gap-1.5">
          <button
            type="button"
            onClick={reset}
            title="Reset"
            aria-label="Reset"
            className="grid h-8 w-8 flex-none place-items-center rounded-full border border-border bg-panel-2 text-text transition-all hover:-translate-y-px hover:border-accent active:scale-90"
          >
            <RotateCcw className="h-[13px] w-[13px]" />
          </button>
          <motion.button
            type="button"
            onClick={togglePlay}
            title="Play"
            aria-label="Play through stages"
            className="grid h-8 w-8 flex-none place-items-center rounded-full border border-accent bg-accent text-accent-ink active:scale-90"
            animate={isPlaying ? { boxShadow: ["0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent)", "0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent)"] } : {}}
            transition={isPlaying ? { duration: 1.6, repeat: Infinity } : {}}
          >
            <Play className="h-[13px] w-[13px]" />
          </motion.button>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-3">
          {JOIN_STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(i)}
              className={cn(
                "rounded-md px-1 py-2 text-center font-mono text-[10.5px] font-semibold tracking-wide text-text-muted transition-colors hover:text-text",
                i === stage && "bg-accent/12 text-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <StatusLine />
    </div>
  );
}

function JoinTypeCard() {
  const joinType = useJoinStore((s) => s.joinType);
  const setJoinType = useJoinStore((s) => s.setJoinType);
  const unmatched = unmatchedUsers();

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">Join type</label>
      <div className="flex flex-wrap gap-1.5">
        {JOIN_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setJoinType(t)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
              t === joinType ? "border-ok bg-ok/18 text-ok" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {t} JOIN
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        {joinType === "INNER"
          ? `Only users with at least one post survive — ${unmatched.map((u) => u.full_name).join(", ")} ${unmatched.length === 1 ? "has" : "have"} none, so ${unmatched.length === 1 ? "she's" : "they're"} dropped.`
          : `Every user is kept, even ${unmatched.map((u) => u.full_name).join(", ")} who ${unmatched.length === 1 ? "has" : "have"} no posts — their post columns just come back empty.`}
      </p>
    </div>
  );
}

export function JoinCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="This query doesn't read one table — it reads two, and stitches matching rows together. Each user in the users table gets paired up with every post that shares their username in the posts table, producing one wider row per pairing. JOIN runs early, right after FROM, before any filtering or sorting happens."
        keywords={[
          { term: "JOIN", note: GLOSSARY.JOIN },
          { term: "INNER JOIN", note: GLOSSARY["INNER JOIN"] },
          { term: "LEFT JOIN", note: GLOSSARY["LEFT JOIN"] },
          { term: "ON", note: GLOSSARY.ON },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div className="mt-5 flex flex-col gap-3">
        <JoinTypeCard />
        <QuizCard level="join" />
      </div>
    </div>
  );
}
