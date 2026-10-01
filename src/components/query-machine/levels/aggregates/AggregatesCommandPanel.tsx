"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AGG_FUNCTIONS,
  AGG_STAGES,
  DISTINCT_COLUMNS,
  NUMERIC_COLUMNS,
  type AggFunction,
  type DistinctCol,
  type NumericCol,
} from "@/lib/aggregatesEngine";
import { POSTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAggregatesStore } from "@/store/useAggregatesStore";
import { SliderWithBubble } from "@/components/ui/SliderWithBubble";
import { QuizCard } from "@/components/query-machine/QuizCard";
import { TheoryCard } from "@/components/query-machine/TheoryCard";
import { ChallengeCard } from "@/components/query-machine/ChallengeCard";
import { CopySqlButton } from "@/components/query-machine/CopySqlButton";

function getSql(
  func: AggFunction,
  numericCol: NumericCol,
  distinctCol: DistinctCol,
  countMode: "*" | "DISTINCT format" | "likes_count"
): string {
  switch (func) {
    case "DISTINCT":
      return `SELECT DISTINCT ${distinctCol}\nFROM posts;`;
    case "COUNT":
      return `SELECT COUNT(${countMode})\nFROM posts;`;
    case "SUM":
      return `SELECT SUM(${numericCol})\nFROM posts;`;
    case "AVG":
      return `SELECT ROUND(AVG(${numericCol}), 1)\nFROM posts;`;
    case "MIN":
      return `SELECT MIN(${numericCol})\nFROM posts;`;
    case "MAX":
      return `SELECT MAX(${numericCol})\nFROM posts;`;
  }
}

function SqlBlock() {
  const stage = useAggregatesStore((s) => s.stage);
  const func = useAggregatesStore((s) => s.func);
  const numericCol = useAggregatesStore((s) => s.numericCol);
  const distinctCol = useAggregatesStore((s) => s.distinctCol);
  const countMode = useAggregatesStore((s) => s.countMode);
  const setStage = useAggregatesStore((s) => s.setStage);

  const rawSql = getSql(func, numericCol, distinctCol, countMode);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5 font-mono text-[12.5px] leading-[1.85]">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">SQL Query</span>
        <CopySqlButton sql={rawSql} />
      </div>
      <div>
        <div>
          <span
            onClick={() => setStage(2)}
            className={cn(
              "-my-px -mx-[3px] cursor-pointer rounded px-[3px] py-px transition-colors hover:bg-border",
              stage === 2 && "bg-accent/20 ring-1 ring-accent font-semibold"
            )}
          >
            <span className="font-bold text-code-kw">SELECT</span>{" "}
            {func === "DISTINCT" ? (
              <>
                <span className="font-bold text-code-kw">DISTINCT</span>{" "}
                <span className="text-code-val">{distinctCol}</span>
              </>
            ) : func === "COUNT" ? (
              <>
                <span className="font-bold text-code-fn">COUNT</span>
                <span className="text-code-val">({countMode})</span>
              </>
            ) : (
              <>
                <span className="font-bold text-code-fn">{func}</span>
                <span className="text-code-val">({numericCol})</span>
              </>
            )}
          </span>
        </div>
        <div>
          <span
            onClick={() => setStage(0)}
            className={cn(
              "-my-px -mx-[3px] cursor-pointer rounded px-[3px] py-px transition-colors hover:bg-border",
              stage === 0 && "bg-accent/20 ring-1 ring-accent font-semibold"
            )}
          >
            <span className="font-bold text-code-kw">FROM</span> posts;
          </span>
        </div>
      </div>
    </div>
  );
}

function ExecutionTimeline() {
  const stage = useAggregatesStore((s) => s.stage);
  const setStage = useAggregatesStore((s) => s.setStage);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
          Execution Timeline
        </span>
        <span className="font-mono text-[10.5px] text-accent font-bold">
          Step {stage + 1} of {AGG_STAGES.length}
        </span>
      </div>

      {/* Interactive Slider Scrubber */}
      <div className="min-w-0 px-1 py-1">
        <SliderWithBubble
          value={stage}
          min={0}
          max={AGG_STAGES.length - 1}
          onChange={setStage}
          formatBubble={(v) => AGG_STAGES[v]}
          ariaLabel="Execution stage"
          persistBubble
        />
      </div>

      {/* Stage Step Buttons */}
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        {AGG_STAGES.map((s, idx) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(idx)}
            className={cn(
              "flex items-center justify-center rounded-md px-1 py-1.5 font-mono text-[10px] sm:text-[10.5px] font-bold leading-tight transition-all text-center",
              stage === idx
                ? "bg-accent text-accent-ink shadow-sm scale-[1.02]"
                : idx < stage
                ? "border border-accent/40 bg-accent/10 text-accent"
                : "border border-border bg-panel-2 text-text-muted hover:text-text"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusLine() {
  const stage = useAggregatesStore((s) => s.stage);
  const func = useAggregatesStore((s) => s.func);
  const numericCol = useAggregatesStore((s) => s.numericCol);
  const distinctCol = useAggregatesStore((s) => s.distinctCol);

  const stageDescriptions = [
    `Stage 1 (FROM): Reads all ${POSTS.length} rows into working memory. Aggregate calculation has not run yet.`,
    func === "DISTINCT"
      ? `Stage 2 (SCAN & DEDUPLICATE): Sieve inspects each row's '${distinctCol}'. Repeated values are discarded.`
      : `Stage 2 (SCAN & ACCUMULATE): Evaluates ${func} on '${numericCol}' across all ${POSTS.length} rows in the table.`,
    func === "DISTINCT"
      ? `Stage 3 (SELECT RESULT): Emits the final unique, deduplicated list of ${distinctCol}s.`
      : `Stage 3 (SELECT RESULT): Emits the final condensed 1x1 scalar summary number (${func} result).`,
  ];

  return (
    <div className="rounded-lg border border-border bg-panel-2 px-3 py-2.5 text-[12px] leading-relaxed text-text-muted">
      <AnimatePresence mode="wait">
        <motion.p
          key={`${stage}-${func}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
        >
          {stageDescriptions[stage]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function AggregatesCommandPanel() {
  const func = useAggregatesStore((s) => s.func);
  const setFunc = useAggregatesStore((s) => s.setFunc);
  const numericCol = useAggregatesStore((s) => s.numericCol);
  const setNumericCol = useAggregatesStore((s) => s.setNumericCol);
  const distinctCol = useAggregatesStore((s) => s.distinctCol);
  const setDistinctCol = useAggregatesStore((s) => s.setDistinctCol);
  const countMode = useAggregatesStore((s) => s.countMode);
  const setCountMode = useAggregatesStore((s) => s.setCountMode);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto min-h-0 p-4 pb-20 flex flex-col gap-4 text-text">
      {/* 1. Theory Card (Collapsed by default) */}
      <TheoryCard
        goal="Think of aggregate functions (SUM, AVG, MIN, MAX, COUNT) like a blender or calculator: they take all 20 rows and condense them into a single summary number. DISTINCT acts like a bouncer at a club door: if a value was already seen, the duplicate is thrown out, leaving only unique entries."
        keywords={[
          {
            term: "DISTINCT",
            note: "Eliminates duplicate values from a column so each unique value appears only once.",
          },
          {
            term: "COUNT(*)",
            note: "Counts total rows returned by the query.",
          },
          {
            term: "SUM(col)",
            note: "Adds all numbers in the specified column together into a single total.",
          },
          {
            term: "AVG(col)",
            note: "Calculates the arithmetic average: SUM(col) ÷ COUNT(*).",
          },
          {
            term: "MIN / MAX",
            note: "Finds the lowest (MIN) or highest (MAX) value across all rows.",
          },
        ]}
      />

      {/* 2. SQL Block */}
      <SqlBlock />

      {/* 3. Execution Timeline (Moved UP with Interactive Slider!) */}
      <ExecutionTimeline />

      {/* 4. Status Line */}
      <StatusLine />

      {/* 5. Function & Column Selector */}
      <div id="tour-controls-section" className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-3.5 shadow-sm">
        <span className="font-mono text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
          Query Settings
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {AGG_FUNCTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFunc(f)}
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-2 font-mono text-[12px] font-bold transition-all",
                func === f
                  ? "bg-accent text-accent-ink shadow-sm scale-[1.02]"
                  : "border border-border bg-panel-2 text-text-muted hover:border-accent/40 hover:text-text"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Function Context / Sub-knob */}
        <div className="mt-2 border-t border-border pt-2.5">
          {func === "DISTINCT" ? (
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-text-muted">Deduplicate Column:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {DISTINCT_COLUMNS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setDistinctCol(col)}
                    className={cn(
                      "rounded-md px-2 py-1.5 font-mono text-[11px] font-semibold transition-all",
                      distinctCol === col
                        ? "bg-accent/20 text-accent ring-1 ring-accent"
                        : "border border-border bg-panel-2 text-text-muted hover:text-text"
                    )}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          ) : func === "COUNT" ? (
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-text-muted">Count Mode:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["*", "DISTINCT format"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCountMode(mode)}
                    className={cn(
                      "rounded-md px-2 py-1.5 font-mono text-[11px] font-semibold transition-all",
                      countMode === mode
                        ? "bg-accent/20 text-accent ring-1 ring-accent"
                        : "border border-border bg-panel-2 text-text-muted hover:text-text"
                    )}
                  >
                    COUNT({mode})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-text-muted">Numeric Target Column:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {NUMERIC_COLUMNS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNumericCol(col)}
                    className={cn(
                      "rounded-md px-2 py-1.5 font-mono text-[11px] font-semibold transition-all",
                      numericCol === col
                        ? "bg-accent/20 text-accent ring-1 ring-accent"
                        : "border border-border bg-panel-2 text-text-muted hover:text-text"
                    )}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Challenge & Quiz Cards */}
      <ChallengeCard level="aggregates" />
      <QuizCard level="aggregates" />
    </div>
  );
}
