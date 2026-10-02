"use client";

import { Eye, Heart } from "lucide-react";
import { useState } from "react";
import { POSTS } from "@/lib/data";
import { runBTreeSeek } from "@/lib/indexEngine";
import { SchemaCard, type SchemaColumn } from "@/components/query-machine/SchemaCard";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { useIndexStore } from "@/store/useIndexStore";

const POSTS_SCHEMA: SchemaColumn[] = [
  { name: "id", type: "int", pk: true },
  { name: "username", type: "varchar(255)" },
  { name: "format", type: "varchar(10)" },
  { name: "likes_count", type: "int" },
  { name: "views_count", type: "int" },
];

export function IndexOutputPanel() {
  const { t, locale } = useTranslation();
  const isUr = locale === "ur";

  const [view, setView] = useState<"input" | "output">("output");
  const indexStatus = useIndexStore((s) => s.indexStatus);
  const targetUser = useIndexStore((s) => s.targetUser);

  const hasIndex = indexStatus === "btree";
  const treeResult = runBTreeSeek(targetUser);
  const matchingPosts = treeResult.matchingRows;

  return (
    <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
      {/* Standard Segmented Pill Toggle (Input / Output) */}
      <div className="flex gap-0.5 rounded-lg border border-border bg-panel p-[3px]">
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

      {view === "output" ? (
        <div className="flex flex-col gap-3">
          {/* Big Rows Returned Counter + Performance Pill (Matching Image 4) */}
          <div className="flex items-baseline justify-between font-mono">
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold text-text">{matchingPosts.length}</span>
              <span className="text-[11.5px] text-text-muted">
                {matchingPosts.length === 1
                  ? isUr ? "row wapis aayi" : "row returned"
                  : isUr ? "rows wapis aayin" : "rows returned"}
              </span>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold border font-mono",
                hasIndex
                  ? "bg-ok/15 text-ok border-ok/30"
                  : "bg-warn/15 text-warn border-warn/30"
              )}
            >
              {hasIndex
                ? isUr ? "⚡ 0.6 ms (Index Seek)" : "⚡ 0.6 ms (Index Seek)"
                : isUr ? "🐌 18.2 ms (Table Scan)" : "🐌 18.2 ms (Table Scan)"}
            </span>
          </div>

          {/* Clean Output Cards (Exact Match to Image 4) */}
          <div className="flex flex-col gap-1.5 pb-2">
            {matchingPosts.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px]"
              >
                <span className="w-4 flex-none font-mono text-[10px] text-text-muted">
                  {String(row.id).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-text">
                  {row.username}
                </span>
                <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">
                  {row.format}
                </span>
                <span className="flex w-10 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-bad font-semibold">
                  <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                  {row.likes_count}
                </span>
                <span className="flex w-11 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-flow font-semibold">
                  <Eye className="h-2.5 w-2.5" />
                  {row.views_count}
                </span>
              </div>
            ))}
          </div>

          {matchingPosts.length === 0 && (
            <div className="p-8 text-center text-text-muted text-[12px]">
              {isUr ? "Koi rows wapis nahi aayin." : "No rows returned for this query."}
            </div>
          )}
        </div>
      ) : (
        /* Input Table View (All 20 rows of POSTS with SchemaCard) */
        <div className="flex flex-col gap-3">
          <p className="text-[11px] leading-relaxed text-text-muted">
            {isUr ? (
              <>
                Yeh <b className="text-text">posts</b> table hai jahan se query data read kar rahi hai. Total{" "}
                <b className="font-mono text-text">{POSTS.length} rows</b> disk par mojood hain.
              </>
            ) : (
              <>
                This is <b className="text-text">posts</b> — the table every query on this level reads from.
                Total <b className="font-mono text-text">{POSTS.length} rows</b> exist on disk.
              </>
            )}
          </p>
          <SchemaCard tableName="posts" columns={POSTS_SCHEMA} highlight={["username"]} />

          <div className="w-full min-w-0 pb-2">
            <div className="mt-2 flex items-center gap-2 px-2.5 font-mono text-[9px] font-bold tracking-wide text-text-muted/70 uppercase">
              <span className="w-4 flex-none">id</span>
              <span className="min-w-0 flex-1 truncate">user</span>
              <span className="w-12 flex-none text-center">format</span>
              <span className="w-10 flex-none text-right">likes</span>
              <span className="w-11 flex-none text-right">views</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {POSTS.map((row) => {
                const isMatch = row.username === targetUser;
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 shadow-[var(--shadow-row)] text-[11.5px] transition-colors",
                      isMatch && "border-accent/60 bg-accent/5 ring-1 ring-accent/30",
                    )}
                  >
                    <span className="w-4 flex-none font-mono text-[10px] text-text-muted">
                      {String(row.id).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate font-semibold",
                        isMatch ? "text-accent font-bold" : "text-text"
                      )}
                    >
                      {row.username}
                    </span>
                    <span className="w-12 flex-none text-center font-mono text-[10px] text-text-muted">
                      {row.format}
                    </span>
                    <span className="flex w-10 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-bad font-semibold">
                      <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                      {row.likes_count}
                    </span>
                    <span className="flex w-11 flex-none items-center justify-end gap-0.5 font-mono text-[10.5px] text-flow font-semibold">
                      <Eye className="h-2.5 w-2.5" />
                      {row.views_count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
