"use client";

import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Database,
  FileCode2,
  GitBranch,
  Key,
  Layers,
  ListOrdered,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { Term } from "@/components/ui/Term";
import { POSTS } from "@/lib/data";
import {
  DISTINCT_USERNAMES,
  runBTreeSeek,
  runFullTableScan,
  type UsernameKey,
} from "@/lib/indexEngine";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { useIndexStore } from "@/store/useIndexStore";

export function IndexCommandPanel() {
  const { locale } = useTranslation();
  const isUr = locale === "ur";

  const indexStatus = useIndexStore((s) => s.indexStatus);
  const setIndexStatus = useIndexStore((s) => s.setIndexStatus);
  const targetUser = useIndexStore((s) => s.targetUser);
  const setTargetUser = useIndexStore((s) => s.setTargetUser);
  const stage = useIndexStore((s) => s.stage);
  const setStage = useIndexStore((s) => s.setStage);

  const hasIndex = indexStatus === "btree";
  const scanResult = runFullTableScan(targetUser);
  const treeResult = runBTreeSeek(targetUser);

  const currentSql = hasIndex
    ? `CREATE INDEX idx_user ON posts(username);\n\nSELECT id, username, format, likes_count, views_count\nFROM posts\nWHERE username = '${targetUser}';`
    : `SELECT id, username, format, likes_count, views_count\nFROM posts\nWHERE username = '${targetUser}';`;


  return (
    <div className="scrollbar-thin flex h-full flex-1 flex-col gap-3.5 overflow-y-auto min-h-0 p-4 pb-20 text-text">
      {/* ----------------------------------------------------------------- */}
      {/* 1. COLLAPSIBLE THEORY CARD (Default Collapsed as in Image 3)      */}
      {/* ----------------------------------------------------------------- */}
      <TheoryCard level="index" />

      {/* ----------------------------------------------------------------- */}
      {/* 2. SQL QUERY BLOCK (Formatted with Syntax & Execution Badges)     */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-panel-2 p-3 font-mono text-[12px] leading-relaxed shadow-xs">
        <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
            SQL Query
          </span>
          <CopySqlButton sql={currentSql} />
        </div>

        <div className="text-[11.5px] leading-loose text-text">
          {hasIndex && (
            <div className="mb-1.5 text-ok font-semibold text-[11px] pb-1 border-b border-border/50">
              <Term term="CREATE INDEX" className="font-bold text-ok">
                CREATE INDEX
              </Term>{" "}
              idx_user ON <span className="font-bold text-accent">posts</span>(username);
            </div>
          )}
          <div>
            <Term term="SELECT" className="font-bold text-code-kw">
              SELECT
            </Term>
            <sup>3</sup> id, username, format, likes_count, views_count
          </div>
          <div>
            <Term term="FROM" className="font-bold text-code-kw">
              FROM
            </Term>
            <sup>1</sup> <span className="font-bold text-accent">posts</span>
          </div>
          <div>
            <Term term="WHERE" className="font-bold text-code-kw">
              WHERE
            </Term>
            <sup>2</sup> username ={" "}
            <span className="rounded bg-accent/20 px-1.5 py-0.5 font-bold text-accent">
              &apos;{targetUser}&apos;
            </span>
            ;
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. SINGLE SLEEK INDEX SWITCH: "USE INDEX" vs "WITHOUT INDEX"       */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-panel p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text">
              {isUr ? "Index Switch:" : "Index Toggle:"}
            </span>
          </div>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold",
              hasIndex
                ? "bg-ok/20 text-ok border border-ok/40"
                : "bg-warn/20 text-warn border border-warn/40",
            )}
          >
            {hasIndex
              ? isUr ? "Index Active (B-Tree)" : "Index Active (B-Tree)"
              : isUr ? "No Index (Table Scan)" : "No Index (Table Scan)"}
          </span>
        </div>

        {/* Sleek Segmented Switch */}
        <div className="grid grid-cols-2 rounded-lg border border-border bg-panel-2 p-1 gap-1">
          <button
            type="button"
            onClick={() => setIndexStatus("btree")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 font-mono text-[11px] font-extrabold transition-all",
              hasIndex
                ? "bg-ok text-white shadow-xs"
                : "text-text-muted hover:text-text",
            )}
          >
            <GitBranch className="h-3 w-3" />
            <span>{isUr ? "Use Index ⚡" : "Use Index ⚡"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIndexStatus("none")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 font-mono text-[11px] font-extrabold transition-all",
              !hasIndex
                ? "bg-warn text-white shadow-xs"
                : "text-text-muted hover:text-text",
            )}
          >
            <ListOrdered className="h-3 w-3" />
            <span>{isUr ? "Without Index 🐌" : "Without Index 🐌"}</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. TARGET USERNAME PICKER (From Real POSTS Data)                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="rounded-xl border border-border bg-panel p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[11px] font-bold text-text flex items-center gap-1.5">
            <span>🎯 {isUr ? "Target Username Chuno:" : "Select Target Username:"}</span>
          </label>
          <span className="font-mono text-[11px] font-black text-accent">
            @{targetUser}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {DISTINCT_USERNAMES.map((uname) => {
            const count = POSTS.filter((p) => p.username === uname).length;
            const isSelected = targetUser === uname;

            return (
              <button
                key={uname}
                type="button"
                onClick={() => setTargetUser(uname)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg py-1.5 px-1 font-mono transition-all text-center",
                  isSelected
                    ? "bg-accent text-accent-ink font-black shadow-xs ring-2 ring-accent/30 scale-102"
                    : "border border-border bg-panel-2 text-text hover:border-accent/40",
                )}
              >
                <span className="text-[11px] font-bold truncate max-w-[85px]">
                  @{uname.split("_")[0]}
                </span>
                <span className="text-[8.5px] opacity-75">
                  {count} {count === 1 ? "post" : "posts"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 rounded-lg border border-border bg-panel-2 p-2 flex items-center justify-between font-mono text-[10.5px]">
          <span className="text-text-muted">
            Matching: <b className="text-accent">{treeResult.matchingRows.length} rows</b>
          </span>
          <span className="font-bold text-ok">
            {hasIndex
              ? isUr ? `Tree: ${treeResult.totalHops} Hops ⚡` : `Tree: ${treeResult.totalHops} Hops ⚡`
              : isUr ? `Scan: 20 Rows 🐌` : `Scan: 20 Rows 🐌`}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. QUIZ & CHALLENGE CARDS                                         */}
      {/* ----------------------------------------------------------------- */}
      <QuizCard level="index" />
      <ChallengeCard level="index" />
    </div>
  );
}

