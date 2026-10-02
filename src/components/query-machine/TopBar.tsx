"use client";

import { motion } from "framer-motion";
import { Check, Cog, Compass, Link2 } from "lucide-react";
import { useState } from "react";
import { buildShareUrl } from "@/lib/shareLink";
import { cn } from "@/lib/utils";
import { LEVELS, useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "@/lib/i18n/useTranslation";

function JourneyMap() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const quizPassed = useProgressStore((s) => s.quizPassed);
  const visited = useProgressStore((s) => s.visited);

  return (
    <nav
      id="tour-journey-map"
      aria-label="Curriculum Journey"
      className="flex items-center gap-1 rounded-xl border border-border bg-panel-2 px-2.5 py-1.5 shadow-[var(--shadow-row)]"
    >
      {LEVELS.map((lvl, idx) => {
        const isCurrent = currentLevel === lvl.id;
        const isPassed = Boolean(quizPassed[lvl.id]);
        const isVisited = Boolean(visited[lvl.id]) || isCurrent || isPassed;
        const hasNext = idx < LEVELS.length - 1;

        return (
          <div key={lvl.id} className="flex items-center">
            <button
              type="button"
              onClick={() => setLevel(lvl.id)}
              title={`${lvl.label} — ${lvl.full}${isPassed ? " (Quiz Passed)" : ""}`}
              className={cn(
                "group relative flex items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-all",
                isCurrent
                  ? "bg-panel text-text shadow-xs ring-1 ring-border"
                  : "text-text-muted hover:bg-panel/60 hover:text-text",
              )}
            >
              <div
                className={cn(
                  "relative grid h-5 w-5 flex-none place-items-center rounded-full font-mono text-[10px] font-bold transition-transform",
                  isPassed
                    ? "bg-ok text-white"
                    : isCurrent
                      ? "scale-105 bg-accent text-accent-ink ring-2 ring-accent/30"
                      : isVisited
                        ? "border border-border bg-panel text-text"
                        : "border border-border/70 bg-panel-2 text-text-muted",
                )}
              >
                {isPassed ? <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> : <span>{idx}</span>}
              </div>

              <span
                className={cn(
                  "hidden font-mono text-[11px] whitespace-nowrap capitalize md:inline",
                  isCurrent ? "font-bold text-text" : "font-medium",
                )}
              >
                {lvl.id.replace("-", " ")}
              </span>
            </button>

            {hasNext && (
              <div className="mx-0.5 h-[2px] w-2.5 flex-none overflow-hidden rounded-full bg-border sm:w-3.5">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isPassed ? "bg-ok" : isCurrent ? "bg-accent/60" : "bg-transparent",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function ProgressDots() {
  const quizPassed = useProgressStore((s) => s.quizPassed);
  const passedCount = LEVELS.filter((l) => quizPassed[l.id]).length;

  return (
    <div className="flex items-center gap-1.5" title={`${passedCount} of ${LEVELS.length} level quizzes passed`}>
      <div className="flex gap-[3px]">
        {LEVELS.map((l) => (
          <motion.span
            key={l.id}
            animate={{
              backgroundColor: quizPassed[l.id] ? "var(--ok)" : "var(--border)",
              scale: quizPassed[l.id] ? 1 : 0.85,
            }}
            className="h-[6px] w-[6px] rounded-full"
          />
        ))}
      </div>
      <span className="font-mono text-[10px] font-semibold text-text-muted">
        {passedCount}/{LEVELS.length}
      </span>
    </div>
  );
}

function ShareButton() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Copy a link to this exact state — level, stage, and every control"
      className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-text-muted transition-colors hover:border-accent hover:text-text"
    >
      <Link2 className="h-3.5 w-3.5" />
      <motion.span key={copied ? "copied" : "share"} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {copied ? t.topbar.copied : t.topbar.share}
      </motion.span>
    </button>
  );
}

function TourButton() {
  const { t } = useTranslation();
  const resetOnboarding = useProgressStore((s) => s.resetOnboarding);

  return (
    <button
      type="button"
      onClick={resetOnboarding}
      title="Replay interactive guide tour"
      className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <Compass className="h-3.5 w-3.5 text-accent" />
      <span>{t.topbar.tour}</span>
    </button>
  );
}

export function TopBar() {
  const { t } = useTranslation();

  return (
    <header className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 sm:px-5 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-gradient-to-br from-accent to-flow">
          <Cog className="h-4 w-4 text-white" strokeWidth={2.2} />
        </span>
        <div className="flex flex-col leading-tight">
          <b className="text-[15px] font-bold tracking-tight">{t.topbar.title}</b>
          <span className="text-[11px] text-text-muted">{t.topbar.subtitle}</span>
        </div>
        <span className="ml-1 hidden sm:block">
          <ProgressDots />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <JourneyMap />
        <LanguageToggle />
        <TourButton />
        <ShareButton />
      </div>
    </header>
  );
}
