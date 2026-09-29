"use client";

import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { Check, Cog, Link2, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildShareUrl } from "@/lib/shareLink";
import { cn } from "@/lib/utils";
import { LEVELS, useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";

function useTheme() {
  // Starts null on purpose: the server can't know the client's theme, and the inline
  // head script already applied the right class before paint, so this only syncs
  // React's copy of that value post-mount — it never causes a visible flash.
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading client-only DOM state, must run post-mount to avoid an SSR mismatch
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("qm-theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

function LevelNav() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setLevel = useAppStore((s) => s.setLevel);
  const quizPassed = useProgressStore((s) => s.quizPassed);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = refs.current[currentLevel];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [currentLevel]);

  return (
    <div className="relative flex gap-0.5 rounded-lg border border-border bg-panel-2 p-[3px]">
      <motion.span
        className="absolute top-[3px] bottom-[3px] z-0 rounded-md bg-accent"
        animate={indicator}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
      {LEVELS.map((lvl) => (
        <button
          key={lvl.id}
          type="button"
          ref={(el) => {
            refs.current[lvl.id] = el;
          }}
          onClick={() => setLevel(lvl.id)}
          title={quizPassed[lvl.id] ? `${lvl.full} — quiz passed` : lvl.full}
          className={cn(
            "relative z-10 flex items-center gap-1 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold whitespace-nowrap transition-colors",
            currentLevel === lvl.id ? "text-accent-ink" : "text-text-muted hover:text-text",
          )}
        >
          {lvl.label}
          {quizPassed[lvl.id] && (
            <span
              className={cn(
                "grid h-3 w-3 flex-none place-items-center rounded-full",
                currentLevel === lvl.id ? "bg-accent-ink/25" : "bg-ok/20 text-ok",
              )}
            >
              <Check className="h-2 w-2" strokeWidth={4} />
            </span>
          )}
        </button>
      ))}
    </div>
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
        {copied ? "Copied!" : "Share"}
      </motion.span>
    </button>
  );
}

export function TopBar() {
  const hoodOpen = useAppStore((s) => s.hoodOpen);
  const toggleHood = useAppStore((s) => s.toggleHood);
  const { dark, toggle } = useTheme();

  return (
    <header className="flex flex-none flex-wrap items-center justify-between gap-4 border-b border-border bg-panel px-5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-gradient-to-br from-accent to-flow">
          <Cog className="h-4 w-4 text-white" strokeWidth={2.2} />
        </span>
        <div className="flex flex-col leading-tight">
          <b className="text-[15px] font-bold tracking-tight">Query Machine</b>
          <span className="text-[11.5px] text-text-muted">MySQL execution, level by level</span>
        </div>
        <span className="ml-1 hidden sm:block">
          <ProgressDots />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        <LevelNav />

        <ShareButton />

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle color theme"
          className="grid h-7 w-7 place-items-center rounded-md text-text-muted transition-colors hover:bg-panel-2 hover:text-text"
        >
          {dark === null ? null : dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <span className="text-[12.5px] font-semibold text-text-muted">Under the hood</span>
          <Switch.Root
            checked={hoodOpen}
            onCheckedChange={toggleHood}
            className="relative h-[22px] w-[38px] flex-none rounded-full border border-border bg-panel-2 transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent/30"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-text-muted transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-accent" />
          </Switch.Root>
        </label>
      </div>
    </header>
  );
}
