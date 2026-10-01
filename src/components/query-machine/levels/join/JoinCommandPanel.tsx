"use client";

import { motion } from "framer-motion";
import { POSTS, USERS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { joinRows, JOIN_STAGES, JOIN_TYPES, unmatchedUsers } from "@/lib/joinEngine";
import { cn } from "@/lib/utils";
import { useJoinStore } from "@/store/useJoinStore";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";
import { Term } from "@/components/ui/Term";

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
    JOIN: joinType === "CROSS" ? (
      <>
        <Term term="CROSS JOIN" className="font-bold text-code-kw">
          CROSS JOIN
        </Term>{" "}
        posts p
      </>
    ) : (
      <>
        <Term term={`${joinType} JOIN`} className="font-bold text-code-kw">
          {joinType} JOIN
        </Term>{" "}
        posts p <Term term="ON" className="font-bold text-code-kw">ON</Term> u.username = p.username
      </>
    ),
  };

  const order: (typeof JOIN_STAGES)[number][] = ["SELECT", "FROM", "JOIN"];

  const rawSql = joinType === "CROSS"
    ? `SELECT u.username, u.full_name, p.format, p.likes_count\nFROM users u\nCROSS JOIN posts p;`
    : `SELECT u.username, u.full_name, p.format, p.likes_count\nFROM users u\n${joinType} JOIN posts p ON u.username = p.username;`;

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">SQL Query</span>
        <CopySqlButton sql={rawSql} />
      </div>
      <div>
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
    </div>
  );
}

function StatusLine() {
  const stage = useJoinStore((s) => s.stage);
  const joinType = useJoinStore((s) => s.joinType);
  const rows = joinRows(joinType);
  const unmatched = unmatchedUsers().length;

  const joinExplanation = {
    INNER: `INNER JOIN posts p ON u.username = p.username — ${rows.length} rows produced (${unmatched} user with no posts dropped)`,
    LEFT: `LEFT JOIN posts p ON u.username = p.username — ${rows.length} rows produced (${unmatched} unmatched user kept with NULL posts)`,
    RIGHT: `RIGHT JOIN posts p ON u.username = p.username — ${rows.length} rows produced (all ${POSTS.length} posts kept from right table)`,
    "FULL OUTER": `FULL OUTER JOIN posts p ON u.username = p.username — ${rows.length} rows produced (all users + all posts included)`,
    CROSS: `CROSS JOIN posts p — ${rows.length} rows produced (Cartesian product: ${USERS.length} users × ${POSTS.length} posts)`,
  }[joinType];

  const text = [
    `FROM users u — ${USERS.length} rows loaded`,
    joinExplanation,
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

  return (
    <div className="mt-5">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">Execution timeline</p>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-panel-2 p-1">
        {JOIN_STAGES.map((s, i) => (
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
        Click any stage above to watch table linking step-by-step
      </p>
      <StatusLine />
    </div>
  );
}

function JoinTypeCard() {
  const joinType = useJoinStore((s) => s.joinType);
  const setJoinType = useJoinStore((s) => s.setJoinType);
  const unmatched = unmatchedUsers();
  const rows = joinRows(joinType);

  const note = {
    INNER: `Only users with at least one matching post survive (${rows.length} rows) — ${unmatched.map((u) => u.full_name).join(", ")} has none, so she is dropped.`,
    LEFT: `All left-table users are kept (${rows.length} rows) — Zara has no posts, so her post columns are filled with NULL.`,
    RIGHT: `All right-table posts are kept (${rows.length} rows) — each post matches an author; Zara on the left is excluded.`,
    "FULL OUTER": `Complete union of both tables (${rows.length} rows) — all matching pairs plus Zara with NULL post values.`,
    CROSS: `Cartesian product (${USERS.length} users × ${POSTS.length} posts = ${rows.length} rows) — every user is paired with every post without an ON filter.`,
  }[joinType];

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
      <p className="mt-2.5 text-[10.5px] leading-snug text-text-muted">{note}</p>
    </div>
  );
}

export function JoinCommandPanel() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
      <TheoryCard
        goal="Think of a librarian holding two separate stacks of index cards: Borrower Cards (users) and Checkout Slips (posts). For every borrower card, the librarian cross-references checkout slips matching that card's member ID. In an INNER JOIN, borrowers with zero checkouts (like Zara) are dropped. In a LEFT JOIN, every borrower is kept, stapling a blank checkout slip if they haven't borrowed anything."
        keywords={[
          { term: "JOIN", note: GLOSSARY.JOIN },
          { term: "INNER JOIN", note: GLOSSARY["INNER JOIN"] },
          { term: "LEFT JOIN", note: GLOSSARY["LEFT JOIN"] },
          { term: "ON", note: GLOSSARY.ON },
        ]}
      />
      <SqlBlock />
      <ExecutionTimeline />
      <div id="tour-controls-section" className="mt-5 flex flex-col gap-3">
        <JoinTypeCard />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <ChallengeCard level="join" />
        <QuizCard level="join" />
      </div>
    </div>
  );
}
