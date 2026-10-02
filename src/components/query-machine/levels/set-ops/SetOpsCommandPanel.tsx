"use client";

import { motion } from "framer-motion";
import { GLOSSARY } from "@/lib/glossary";
import { combine, queryA, queryB, SET_OPS, SETOPS_STAGES } from "@/lib/setOpsEngine";
import { cn } from "@/lib/utils";
import { useSetOpsStore } from "@/store/useSetOpsStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";
import { Term } from "@/components/ui/Term";

function SqlBlock() {
  const stage = useSetOpsStore((s) => s.stage);
  const op = useSetOpsStore((s) => s.op);
  const setStage = useSetOpsStore((s) => s.setStage);

  const rawSql = `SELECT * FROM posts WHERE format = 'video'
${op}
SELECT * FROM posts WHERE likes_count > 400;`;

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">SQL Query</span>
        <CopySqlButton sql={rawSql} />
      </div>
      <div>
        <div
          onClick={() => setStage(0)}
          className={cn(
            "-mx-[3px] cursor-pointer rounded px-[3px] transition-colors hover:bg-border",
            stage === 0 && "bg-accent/16",
          )}
        >
          <span className="font-bold text-code-kw">SELECT</span> * <span className="font-bold text-code-kw">FROM</span> posts{" "}
          <span className="font-bold text-code-kw">WHERE</span> format = <span className="text-code-val">&apos;video&apos;</span>
        </div>
        <div
          onClick={() => setStage(2)}
          className={cn(
            "-mx-[3px] my-0.5 cursor-pointer rounded px-[3px] font-bold text-code-kw transition-colors hover:bg-border",
            stage === 2 && "bg-accent/16",
          )}
        >
          <Term term={op}>{op}</Term>
        </div>
        <div
          onClick={() => setStage(1)}
          className={cn(
            "-mx-[3px] cursor-pointer rounded px-[3px] transition-colors hover:bg-border",
            stage === 1 && "bg-accent/16",
          )}
        >
          <span className="font-bold text-code-kw">SELECT</span> * <span className="font-bold text-code-kw">FROM</span> posts{" "}
          <span className="font-bold text-code-kw">WHERE</span> likes_count &gt; <span className="text-code-num">400</span>;
        </div>
      </div>
    </div>
  );
}

function StatusLine() {
  const stage = useSetOpsStore((s) => s.stage);
  const op = useSetOpsStore((s) => s.op);
  const a = queryA();
  const b = queryB();
  const result = combine(op);

  const text = [
    `Query A (video posts) — ${a.length} rows`,
    `Query B (likes_count > 400) — ${b.length} rows`,
    `${op} — ${result.length} row(s) in the combined result`,
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
  const stage = useSetOpsStore((s) => s.stage);
  const setStage = useSetOpsStore((s) => s.setStage);

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-panel-2 p-1">
        {SETOPS_STAGES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(i)}
            className={cn(
              "rounded-md py-1.5 text-center font-mono text-[11px] font-semibold tracking-wide transition-colors",
              i === stage ? "bg-accent text-accent-ink shadow-xs" : "text-text-muted hover:text-text",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-text-muted">
        Click any stage above to trace query combination
      </p>
      <StatusLine />
    </div>
  );
}

function OpCard() {
  const op = useSetOpsStore((s) => s.op);
  const setOp = useSetOpsStore((s) => s.setOp);
  const a = queryA();
  const b = queryB();
  const result = combine(op);

  const note = {
    UNION: `Both result sets, stacked together — ${a.length} + ${b.length} rows minus the ${a.length + b.length - result.length} that appear in both = ${result.length}.`,
    INTERSECT: `Only rows that appear in both A and B survive — ${result.length} row(s) matched both conditions.`,
    EXCEPT: `Rows from A that are NOT in B — ${a.length} video posts minus the ones that also have likes_count > 400 = ${result.length}.`,
  }[op];

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">Combine with</label>
      <div className="flex flex-wrap gap-1.5">
        {SET_OPS.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOp(o)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all hover:-translate-y-px active:scale-95",
              o === op ? "border-ok bg-ok/18 text-ok" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">{note}</p>
    </div>
  );
}

export function SetOpsCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard level="set-ops" />
      <SqlBlock />
      <ExecutionTimeline />
      <div id="tour-controls-section" className="mt-5 flex flex-col gap-3">
        <OpCard />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <ChallengeCard level="set-ops" />
        <QuizCard level="set-ops" />
      </div>
    </div>
  );
}
