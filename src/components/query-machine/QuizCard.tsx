"use client";

import { motion } from "framer-motion";
import { Check, HelpCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { QUIZZES } from "@/lib/quizzes";
import { cn } from "@/lib/utils";
import type { LevelId } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";

// Answers stay in local state — only the pass/fail outcome is persisted, via useProgressStore.
export function QuizCard({ level }: { level: LevelId }) {
  const questions = QUIZZES[level];
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const quizPassed = useProgressStore((s) => s.quizPassed[level]);
  const markQuizPassed = useProgressStore((s) => s.markQuizPassed);

  const allCorrect = picked.every((p, i) => p === questions[i].correctIndex);

  useEffect(() => {
    if (allCorrect) markQuizPassed(level);
  }, [allCorrect, level, markQuizPassed]);

  return (
    <div className="rounded-xl border border-border bg-panel-2 p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
          <HelpCircle className="h-3 w-3" />
          Check yourself
        </p>
        {(quizPassed || allCorrect) && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-ok"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            passed
          </motion.span>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        {questions.map((q, qi) => {
          const selected = picked[qi];
          const answered = selected !== null;
          const correct = selected === q.correctIndex;
          return (
            <div key={q.prompt}>
              <p className="mb-1.5 text-[11.5px] leading-snug text-text">{q.prompt}</p>
              <div className="flex flex-col gap-1">
                {q.choices.map((choice, ci) => {
                  const isSelected = selected === ci;
                  const showAsCorrect = answered && ci === q.correctIndex;
                  const showAsWrong = isSelected && !correct;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() =>
                        setPicked((prev) => prev.map((p, i) => (i === qi ? ci : p)))
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors",
                        showAsCorrect
                          ? "border-ok bg-ok/12 text-ok"
                          : showAsWrong
                            ? "border-bad bg-bad/12 text-bad"
                            : "border-border bg-panel text-text-muted hover:text-text",
                      )}
                    >
                      {showAsCorrect ? (
                        <Check className="h-3 w-3 flex-none" strokeWidth={3} />
                      ) : showAsWrong ? (
                        <X className="h-3 w-3 flex-none" strokeWidth={3} />
                      ) : (
                        <span className="h-3 w-3 flex-none rounded-full border border-current opacity-40" />
                      )}
                      {choice}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-[10.5px] leading-snug text-text-muted"
                >
                  {q.explain}
                </motion.p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
