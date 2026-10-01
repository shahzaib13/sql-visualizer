"use client";

import { motion } from "framer-motion";
import { POSTS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { classifyBySubquery, COMPARE_OPS, subqueryAvgLikes, SUBQUERY_STAGES } from "@/lib/subqueryEngine";
import { cn } from "@/lib/utils";
import { useSubqueryStore } from "@/store/useSubqueryStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";
import { Term } from "@/components/ui/Term";

function SqlBlock() {
  const stage = useSubqueryStore((s) => s.stage);
  const op = useSubqueryStore((s) => s.op);
  const setStage = useSubqueryStore((s) => s.setStage);

  const rawSql = `SELECT *
FROM posts
WHERE likes_count ${op} (
  SELECT AVG(likes_count) FROM posts
);`;

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">SQL Query</span>
        <CopySqlButton sql={rawSql} />
      </div>
      <div>
        <div
          onClick={() => setStage(3)}
          className={cn(
            "-mx-[3px] cursor-pointer rounded px-[3px] transition-colors hover:bg-border",
            stage === 3 && "bg-accent/16",
          )}
        >
          <span className="font-bold text-code-kw">SELECT</span> *
        </div>
        <div
          onClick={() => setStage(0)}
          className={cn(
            "-mx-[3px] cursor-pointer rounded px-[3px] transition-colors hover:bg-border",
            stage === 0 && "bg-accent/16",
          )}
        >
          <span className="font-bold text-code-kw">FROM</span> posts
        </div>
        <div
          onClick={() => setStage(2)}
          className={cn(
            "-mx-[3px] cursor-pointer rounded px-[3px] transition-colors hover:bg-border",
            stage === 2 && "bg-accent/16",
          )}
        >
          <span className="font-bold text-code-kw">WHERE</span> likes_count{" "}
          <span className="font-bold text-accent">{op}</span> (
        </div>
        <div
          onClick={() => setStage(1)}
          className={cn(
            "-mx-[3px] my-0.5 ml-4 cursor-pointer rounded border-l-2 border-accent/40 py-0.5 pl-2.5 transition-colors hover:bg-border",
            stage === 1 && "bg-accent/16",
          )}
        >
          <Term term="scalar subquery" className="font-bold text-code-kw">
            SELECT
          </Term>{" "}
          <span className="text-code-val">AVG(likes_count)</span> <span className="font-bold text-code-kw">FROM</span> posts
        </div>
        <div>);</div>
      </div>
    </div>
  );
}

function StatusLine() {
  const stage = useSubqueryStore((s) => s.stage);
  const op = useSubqueryStore((s) => s.op);
  const avg = subqueryAvgLikes();
  const results = classifyBySubquery(op);
  const included = results.filter((r) => r.included).length;

  const text = [
    `FROM posts — ${POSTS.length} rows loaded`,
    `Inner SELECT AVG(likes_count) FROM posts — resolves to a single number: ${avg}`,
    `WHERE likes_count ${op} ${avg} — ${included} of ${POSTS.length} rows match`,
    `SELECT * — ${included} row(s) returned`,
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
  const stage = useSubqueryStore((s) => s.stage);
  const setStage = useSubqueryStore((s) => s.setStage);

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-panel-2 p-1">
        {SUBQUERY_STAGES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(i)}
            className={cn(
              "rounded-md py-1.5 text-center font-mono text-[10.5px] font-semibold tracking-wide transition-colors",
              i === stage ? "bg-accent text-accent-ink shadow-xs" : "text-text-muted hover:text-text",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-text-muted">
        Click any stage above to trace outer and inner query execution
      </p>
      <StatusLine />
    </div>
  );
}

function OpCard() {
  const op = useSubqueryStore((s) => s.op);
  const setOp = useSubqueryStore((s) => s.setOp);
  const avg = subqueryAvgLikes();
  const included = classifyBySubquery(op).filter((r) => r.included).length;

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <label className="mb-2 text-[11px] font-semibold tracking-wide text-text-muted">
        Compare likes_count against the subquery
      </label>
      <div className="flex flex-wrap gap-1.5">
        {COMPARE_OPS.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOp(o)}
            className={cn(
              "rounded-md border px-3 py-1 font-mono text-[13px] font-bold transition-all hover:-translate-y-px active:scale-95",
              o === op ? "border-accent bg-accent/16 text-accent" : "border-border bg-panel text-text-muted hover:text-text",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">
        {op === ">"
          ? `Above-average posts: likes_count > ${avg} — ${included} rows qualify.`
          : `Below-average posts: likes_count < ${avg} — ${included} rows qualify.`}
      </p>
    </div>
  );
}

export function SubqueryCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="Think of a visitor asking the librarian a question that requires solving another question first: &ldquo;Bring me all books that are thicker than the library's average book.&rdquo; The librarian can't check any single book until they first calculate the overall average across the entire catalog (312 likes). Once that inner number is known, the librarian returns to the shelves and compares each book against it."
        keywords={[
          { term: "subquery", note: GLOSSARY.subquery },
          { term: "scalar subquery", note: GLOSSARY["scalar subquery"] },
          { term: "AVG", note: GLOSSARY.AVG },
          { term: "WHERE", note: GLOSSARY.WHERE },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div id="tour-controls-section" className="mt-5 flex flex-col gap-3">
        <OpCard />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <ChallengeCard level="subquery" />
        <QuizCard level="subquery" />
      </div>
    </div>
  );
}
