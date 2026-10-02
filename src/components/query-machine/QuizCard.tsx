"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, HelpCircle, Lightbulb, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { QUIZZES } from "@/lib/quizzes";
import { cn } from "@/lib/utils";
import type { LevelId } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

const CELEBRATION_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i * 360) / 12,
  dist: 28 + (i % 3) * 12,
  color: ["var(--ok)", "var(--accent)", "var(--flow)", "var(--warn)"][i % 4],
}));

export function QuizCard({ level }: { level: LevelId }) {
  const { t } = useTranslation();
  const questions = QUIZZES[level];
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [celebrating, setCelebrating] = useState(false);
  const quizPassed = useProgressStore((s) => s.quizPassed[level]);
  const markQuizPassed = useProgressStore((s) => s.markQuizPassed);
  const previouslyPassed = useRef(quizPassed);

  const allCorrect = picked.every((p, i) => p === questions[i].correctIndex);

  useEffect(() => {
    if (allCorrect) {
      markQuizPassed(level);
      if (!previouslyPassed.current) {
        setCelebrating(true);
        previouslyPassed.current = true;
        const timer = setTimeout(() => setCelebrating(false), 1400);
        return () => clearTimeout(timer);
      }
    }
  }, [allCorrect, level, markQuizPassed]);

  return (
    <motion.div
      animate={
        celebrating
          ? {
              scale: [1, 1.025, 1],
              boxShadow: [
                "0 0 0px var(--ok)",
                "0 0 20px color-mix(in srgb, var(--ok) 35%, transparent)",
                "0 0 0px transparent",
              ],
            }
          : {}
      }
      transition={{ duration: 0.8 }}
      className="relative rounded-xl border border-border bg-panel-2 p-3.5"
    >
      {/* Celebration burst */}
      <AnimatePresence>
        {celebrating && (
          <div className="pointer-events-none absolute -top-2 right-6 z-30">
            {CELEBRATION_PARTICLES.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const x = Math.cos(rad) * p.dist;
              const y = Math.sin(rad) * p.dist;
              return (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x, y, scale: [0, 1.2, 0.6], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
          <HelpCircle className="h-3 w-3" />
          {t.quiz.title}
        </p>
        {(quizPassed || allCorrect) && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 rounded-full bg-ok/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-ok"
          >
            <Sparkles className="h-2.5 w-2.5" />
            {t.quiz.passed}
          </motion.span>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        {questions.map((q, qi) => {
          const selected = picked[qi];
          const answered = selected !== null;
          const correct = selected === q.correctIndex;
          const hintOpen = Boolean(showHint[qi]);

          return (
            <div key={q.prompt}>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="text-[11.5px] leading-snug text-text">{q.prompt}</p>
                {q.hint && !answered && (
                  <button
                    type="button"
                    onClick={() => setShowHint((h) => ({ ...h, [qi]: !h[qi] }))}
                    title="Need a hint?"
                    className="flex flex-none items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold text-text-muted transition-colors hover:bg-panel hover:text-warn"
                  >
                    <Lightbulb className="h-2.5 w-2.5" />
                    {hintOpen ? t.quiz.hide : t.quiz.hint}
                  </button>
                )}
              </div>

              {hintOpen && !answered && q.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-2 rounded-md border border-warn/30 bg-warn/10 px-2.5 py-1.5 font-mono text-[10px] text-warn"
                >
                  💡 <b>Hint:</b> {q.hint}
                </motion.div>
              )}

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
    </motion.div>
  );
}
