"use client";

import { motion } from "framer-motion";
import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { ORDERABLE_COLUMNS, POSTS, TOGGLE_COLUMNS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { passingCount, selectColsText, STAGES } from "@/lib/queryEngine";
import { cn } from "@/lib/utils";
import { useQueryStore } from "@/store/useQueryStore";
import { SliderWithBubble } from "@/components/ui/SliderWithBubble";
import { Term } from "@/components/ui/Term";
import { TheoryCard } from "./TheoryCard";

const CLAUSE_ORDER = ["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT"] as const;
const EXEC_NO: Record<string, number> = { SELECT: 3, FROM: 1, WHERE: 2, "ORDER BY": 4, LIMIT: 5 };

function useAutoPlay() {
  const isPlaying = useQueryStore((s) => s.isPlaying);
  const setPlaying = useQueryStore((s) => s.setPlaying);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(() => {
        useQueryStore.setState((s) => ({ stage: (s.stage + 1) % STAGES.length }));
      }, 1600);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying]);

  return { isPlaying, togglePlay: () => setPlaying(!isPlaying) };
}

function StatusLine() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const selectedCols = useQueryStore((s) => s.selectedCols);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);
  const total = POSTS.length;
  const passing = passingCount(threshold);

  const text = [
    `FROM posts — ${total} rows loaded`,
    `WHERE likes_count > ${threshold} — ${passing} of ${total} rows match`,
    `SELECT ${selectColsText(selectedCols)} — ${selectedCols.length + 1} of 4 columns kept`,
    `ORDER BY ${orderCol} ${orderDir} — rows resorted`,
    `LIMIT ${limit} — ${Math.min(limit, passing)} row(s) returned`,
  ][stage];

  return (
    <div className="mt-3.5 flex min-h-8 items-center overflow-hidden rounded-md border border-border bg-panel-2 px-3 py-2 font-mono text-[11.5px] text-flow">
      {/* No AnimatePresence here on purpose — with mode="wait" this stalls permanently
          when the key changes faster than the exit+enter transition can settle (e.g.
          clicking through stage ticks quickly). A keyed remount still gets the fade-in
          via initial->animate; it just skips animating the old text out. */}
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </div>
  );
}

function SqlBlock() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const selectedCols = useQueryStore((s) => s.selectedCols);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);
  const setStage = useQueryStore((s) => s.setStage);
  const activeName = STAGES[stage];

  const parts: Record<string, React.ReactNode> = {
    SELECT: (
      <>
        <Term term="SELECT" className="font-bold text-code-kw">
          SELECT
        </Term>
        <sup>{EXEC_NO.SELECT}</sup>{" "}
        <span className="text-code-val">{selectColsText(selectedCols)}</span>
      </>
    ),
    FROM: (
      <>
        <Term term="FROM" className="font-bold text-code-kw">
          FROM
        </Term>
        <sup>{EXEC_NO.FROM}</sup> posts
      </>
    ),
    WHERE: (
      <>
        <Term term="WHERE" className="font-bold text-code-kw">
          WHERE
        </Term>
        <sup>{EXEC_NO.WHERE}</sup>{" "}
        <Term term="likes_count">likes_count</Term> &gt;{" "}
        <span className="text-code-num">{threshold}</span>
      </>
    ),
    "ORDER BY": (
      <>
        <Term term="ORDER BY" className="font-bold text-code-kw">
          ORDER BY
        </Term>
        <sup>{EXEC_NO["ORDER BY"]}</sup> <Term term={orderCol}>{orderCol}</Term>{" "}
        <Term term={orderDir}>{orderDir}</Term>
      </>
    ),
    LIMIT: (
      <>
        <Term term="LIMIT" className="font-bold text-code-kw">
          LIMIT
        </Term>
        <sup>{EXEC_NO.LIMIT}</sup> <span className="text-code-num">{limit}</span>
      </>
    ),
  };

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      {CLAUSE_ORDER.map((clause, i) => (
        <span key={clause}>
          <motion.span
            onClick={() => setStage(STAGES.indexOf(clause as (typeof STAGES)[number]))}
            className={cn(
              "-my-px -mx-[3px] cursor-pointer rounded px-[3px] py-px transition-colors hover:bg-border",
              clause === activeName && "bg-accent/16",
            )}
            animate={clause === activeName ? { backgroundColor: ["color-mix(in srgb, var(--accent) 55%, transparent)", "color-mix(in srgb, var(--accent) 16%, transparent)"] } : {}}
            transition={{ duration: 0.48 }}
          >
            {parts[clause]}
          </motion.span>
          {i < CLAUSE_ORDER.length - 1 ? " " : ";"}
        </span>
      ))}
    </div>
  );
}

function ExecutionTimeline() {
  const stage = useQueryStore((s) => s.stage);
  const setStage = useQueryStore((s) => s.setStage);
  const reset = useQueryStore((s) => s.reset);
  const { isPlaying, togglePlay } = useAutoPlay();

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">
        Execution timeline
      </p>
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
            {isPlaying ? <Pause className="h-[13px] w-[13px]" /> : <Play className="h-[13px] w-[13px]" />}
          </motion.button>
        </div>
        <div className="min-w-0 flex-1">
          <SliderWithBubble
            value={stage}
            min={0}
            max={STAGES.length - 1}
            onChange={setStage}
            formatBubble={(v) => STAGES[v]}
            ariaLabel="Execution stage"
            persistBubble
          />
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-5">
        {STAGES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(i)}
            className={cn(
              "rounded-md px-0.5 py-1.5 text-center font-mono text-[10px] font-semibold tracking-wide text-text-muted transition-colors hover:text-text",
              i === stage && "bg-accent/12 text-accent",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] text-text-muted">
        drag the handle, click a tick, or press play — the panes on the right follow along
      </p>
      <StatusLine />
    </div>
  );
}

function ThresholdCard() {
  const threshold = useQueryStore((s) => s.threshold);
  const setThreshold = useQueryStore((s) => s.setThreshold);
  const passing = passingCount(threshold);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-1 flex items-center justify-between gap-1.5 text-[11px] font-semibold tracking-wide text-text-muted">
        <span>
          <Term term="WHERE">WHERE</Term> <Term term="likes_count">likes_count</Term> &gt;{" "}
          <span className="font-mono text-accent">
            <motion.span
              key={threshold}
              initial={{ scale: 1.3, color: "var(--warn)" }}
              animate={{ scale: 1, color: "var(--accent)" }}
              transition={{ duration: 0.28 }}
              className="inline-block"
            >
              {threshold}
            </motion.span>
          </span>
        </span>
      </label>
      <SliderWithBubble
        value={threshold}
        min={0}
        max={1100}
        step={10}
        onChange={setThreshold}
        formatBubble={(v) => `> ${v}`}
        ariaLabel="Likes threshold"
      />
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        <b className="text-text">{passing}</b> of {POSTS.length} rows currently pass this filter.
      </p>
    </div>
  );
}

function SelectColumnsCard() {
  const selectedCols = useQueryStore((s) => s.selectedCols);
  const toggleColumn = useQueryStore((s) => s.toggleColumn);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">
        <Term term="SELECT">SELECT</Term> columns
      </label>
      <div className="flex flex-wrap gap-1.5">
        {TOGGLE_COLUMNS.map((c) => {
          const on = selectedCols.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleColumn(c.key)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
                on ? "border-ok bg-ok/18 text-ok" : "border-border bg-panel text-text-muted hover:text-text",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        username is always kept — toggle the rest on or off.
      </p>
    </div>
  );
}

function OrderByCard() {
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const setOrderCol = useQueryStore((s) => s.setOrderCol);
  const toggleOrderDir = useQueryStore((s) => s.toggleOrderDir);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">
        <Term term="ORDER BY">ORDER BY</Term>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {ORDERABLE_COLUMNS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setOrderCol(c)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
              c === orderCol ? "border-accent bg-accent/16 text-accent" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleOrderDir}
        className="mt-2 flex w-fit items-center gap-1 rounded-md border border-border bg-panel px-2 py-1 font-mono text-[11px] font-bold text-text hover:border-accent"
        title={orderDir === "DESC" ? GLOSSARY.DESC : GLOSSARY.ASC}
      >
        {orderDir}
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[11px] w-[11px]"
          animate={{ rotate: orderDir === "ASC" ? 180 : 0 }}
          transition={{ duration: 0.28 }}
        >
          <path d="M12 4v16M6 14l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        sorts the surviving rows before LIMIT trims them.
      </p>
    </div>
  );
}

function LimitCard() {
  const limit = useQueryStore((s) => s.limit);
  const setLimit = useQueryStore((s) => s.setLimit);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">
        <Term term="LIMIT">LIMIT</Term>
      </label>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setLimit((v) => v - 1)}
          aria-label="Decrease limit"
          className="grid h-6 w-6 place-items-center rounded-md border border-border bg-panel hover:border-accent active:scale-90"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[14px] text-center font-mono font-bold">
          <motion.span
            key={limit}
            initial={{ scale: 1.3, color: "var(--warn)" }}
            animate={{ scale: 1, color: "var(--text)" }}
            transition={{ duration: 0.28 }}
            className="inline-block"
          >
            {limit}
          </motion.span>
        </span>
        <button
          type="button"
          onClick={() => setLimit((v) => v + 1)}
          aria-label="Increase limit"
          className="grid h-6 w-6 place-items-center rounded-md border border-border bg-panel hover:border-accent active:scale-90"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        keeps only the top <b className="text-text">{limit}</b> row{limit === 1 ? "" : "s"} after sorting.
      </p>
    </div>
  );
}

export function CommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="This query asks MySQL for a short, sorted list of the best-performing posts: keep only the ones with enough likes, drop the columns nobody asked for, arrange what's left, and hand back just the top few — like asking &ldquo;show me the 5 most-liked video posts.&rdquo; SQL doesn't run top to bottom: MySQL always executes these five clauses in the fixed order shown below. Scrub the slider, press ▶, or click a clause to watch it happen."
        keywords={[
          { term: "SELECT", note: GLOSSARY.SELECT },
          { term: "FROM", note: GLOSSARY.FROM },
          { term: "WHERE", note: GLOSSARY.WHERE },
          { term: "ORDER BY", note: GLOSSARY["ORDER BY"] },
          { term: "LIMIT", note: GLOSSARY.LIMIT },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div className="mt-5 flex flex-col gap-3">
        <ThresholdCard />
        <SelectColumnsCard />
        <OrderByCard />
        <LimitCard />
      </div>
    </div>
  );
}
