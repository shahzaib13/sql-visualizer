"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface TheoryKeyword {
  term: string;
  note: string;
}

// Sits above the SQL block on every level — collapsed by default so SQL and controls are immediately visible.
export function TheoryCard({ goal, keywords }: { goal: string; keywords: TheoryKeyword[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 rounded-xl border border-border bg-panel-2 transition-all hover:border-border/80">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors hover:bg-border/30"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-5 w-5 flex-none place-items-center rounded-md bg-accent/15 text-accent">
            <Lightbulb className="h-3 w-3" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-bold tracking-wide text-text uppercase">
              What this query does
            </span>
            {!isOpen && (
              <span className="block truncate text-[10.5px] text-text-muted">
                Click to view library analogy & key concepts
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-none items-center gap-1 text-[10.5px] font-semibold text-accent">
          <span>{isOpen ? "Hide" : "Show theory"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border px-3.5 pb-3.5 pt-2.5"
          >
            <p className="text-[11.5px] leading-relaxed text-text">{goal}</p>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-2.5">
              {keywords.map((k) => (
                <div key={k.term} className="flex items-start gap-2 text-[11px] leading-snug">
                  <span className="mt-px flex-none rounded bg-code-kw/15 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-code-kw">
                    {k.term}
                  </span>
                  <span className="text-text-muted">{k.note}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
