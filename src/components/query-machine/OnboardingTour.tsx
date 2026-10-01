"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Gift,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------- */
/* 6 Custom Animated Illustrations (Kid-friendly, visual, dynamic)          */
/* ------------------------------------------------------------------------- */

/** Graphic 1: The Remote Control (Gamepad + Live SQL Bubble) */
function ControllerGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-b from-accent/10 via-panel to-panel-2 p-3">
      <div className="absolute h-20 w-20 rounded-full bg-accent/20 blur-xl" />

      <div className="relative flex w-full max-w-[270px] items-center justify-between gap-3">
        {/* Game Controller Pad */}
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-accent/30 bg-panel px-3 py-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-accent/40 animate-ping" />
            <span className="font-mono text-[10px] font-bold text-accent uppercase">REMOTE</span>
          </div>
          {/* Animated Slider Track */}
          <div className="relative h-2 w-24 rounded-full bg-panel-2 border border-border overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 w-3 rounded-full bg-accent shadow-xs"
              animate={{ left: ["3px", "58px", "24px", "58px", "3px"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          {/* Push buttons */}
          <div className="flex gap-1.5">
            <span className="h-3 w-6 rounded-md bg-accent/20 border border-accent/40 font-mono text-[7.5px] font-bold text-accent flex items-center justify-center">
              +1
            </span>
            <span className="h-3 w-6 rounded-md bg-flow/20 border border-flow/40 font-mono text-[7.5px] font-bold text-flow flex items-center justify-center">
              DESC
            </span>
          </div>
        </div>

        {/* Live SQL Output Bubble */}
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex-1 rounded-xl border border-border bg-panel p-2 shadow-xs"
        >
          <div className="flex items-center gap-1 text-[9px] font-mono text-text-muted">
            <Sparkles className="h-2.5 w-2.5 text-accent" />
            <span>SQL Updates Live:</span>
          </div>
          <div className="mt-1 rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent border border-accent/30 truncate">
            WHERE likes &gt; 250
          </div>
          <div className="mt-1 flex items-center gap-1 text-[8.5px] text-ok font-semibold">
            <Check className="h-2.5 w-2.5" />
            <span>Zero code typing needed!</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Graphic 2: Interactive Tweaks (Sliders, Column Chips, Sort Toggle) */
function TweaksGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-b from-accent/10 via-panel to-panel-2 p-2.5">
      <div className="absolute h-20 w-20 rounded-full bg-accent/20 blur-xl" />

      <div className="relative flex w-full max-w-[280px] flex-col gap-2">
        {/* 1. Animated Slider Control */}
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5 shadow-xs">
          <span className="font-mono text-[9px] font-bold text-text-muted uppercase">🎚️ SLIDER:</span>
          <div className="relative h-2 flex-1 rounded-full bg-panel-2 border border-border overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 w-3 rounded-full bg-accent shadow-xs"
              animate={{ left: ["4px", "72px", "32px", "72px", "4px"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.span
            className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            likes &gt; 400
          </motion.span>
        </div>

        {/* 2. Column Chips & Sort Buttons */}
        <div className="flex items-center justify-between gap-1.5 font-mono text-[9px]">
          <div className="flex items-center gap-1">
            <span className="rounded bg-accent text-accent-ink px-1.5 py-0.5 font-bold shadow-xs">
              ✓ user
            </span>
            <span className="rounded bg-accent text-accent-ink px-1.5 py-0.5 font-bold shadow-xs">
              ✓ format
            </span>
            <span className="rounded border border-border bg-panel-2 px-1.5 py-0.5 text-text-muted">
              views
            </span>
          </div>

          <motion.div
            className="flex items-center gap-1 rounded border border-flow/40 bg-flow/10 px-1.5 py-0.5 font-bold text-flow"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>DESC ⬇</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** Graphic 3: The Magic Factory (Conveyor Belt + Scanner Funnel) */
function FactoryGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-flow/20 bg-gradient-to-b from-flow/10 via-panel to-panel-2 p-3">
      <div className="absolute h-20 w-20 rounded-full bg-flow/20 blur-xl" />

      <div className="relative flex w-full max-w-[280px] flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
          <span className="text-text-muted">INSPECTION CONVEYOR</span>
          <span className="text-flow">MySQL ENGINE</span>
        </div>

        {/* Conveyor Belt */}
        <div className="relative flex h-10 w-full items-center justify-around rounded-lg border border-border bg-panel px-2 shadow-xs overflow-hidden">
          {/* Moving Packages */}
          <motion.div
            className="flex items-center gap-1.5 rounded-md border border-ok/50 bg-ok/10 px-2 py-1 font-mono text-[10px] font-bold text-ok"
            animate={{ x: [-10, 8, -10] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>📦 #1</span>
            <span className="text-[9px]">800 likes ✓</span>
          </motion.div>

          <div className="h-6 w-px bg-border" />

          {/* Scanner Funnel */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-flow shadow-[0_0_8px_var(--flow)]"
            />
            <span className="text-[8px] font-mono text-flow font-bold">SCANNER</span>
          </div>

          <div className="h-6 w-px bg-border" />

          <motion.div
            className="flex items-center gap-1.5 rounded-md border border-bad/40 bg-bad/10 px-2 py-1 font-mono text-[10px] font-bold text-bad"
            animate={{ x: [8, -10, 8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>📦 #2</span>
            <span className="text-[9px]">50 likes ✗</span>
          </motion.div>
        </div>

        {/* Roller wheels */}
        <div className="flex justify-around px-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full border border-text-muted/40 bg-panel-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Graphic 4: The Results Chest (Gift Chest + Input/Output Toggle) */
function ChestGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-ok/20 bg-gradient-to-b from-ok/10 via-panel to-panel-2 p-3">
      <div className="absolute h-20 w-20 rounded-full bg-ok/20 blur-xl" />

      <div className="relative flex w-full max-w-[270px] items-center justify-between gap-3">
        {/* Treasure Chest */}
        <div className="relative flex flex-col items-center">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-12 w-14 items-center justify-center rounded-xl border-2 border-ok bg-panel shadow-md text-ok"
          >
            <Gift className="h-6 w-6" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-1 text-accent text-xs"
            animate={{ y: [-4, -12], opacity: [0, 1, 0], scale: [0.6, 1.1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <span className="mt-1 font-mono text-[9px] font-bold text-ok uppercase">RESULTS</span>
        </div>

        {/* Toggle Pill Animation */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center rounded-lg border border-border bg-panel-2 p-0.5 font-mono text-[9.5px]">
            <span className="flex-1 rounded-md px-1.5 py-0.5 text-center text-text-muted">
              Input (20)
            </span>
            <span className="flex-1 rounded-md bg-accent px-1.5 py-0.5 text-center font-bold text-accent-ink shadow-xs">
              Output (5)
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border bg-panel p-1.5 font-mono text-[10px]">
            <div className="flex justify-between items-center text-text">
              <span className="font-bold">@zara_iqbal</span>
              <span className="text-accent font-bold">890 likes</span>
            </div>
            <div className="flex justify-between items-center text-text">
              <span className="font-bold">@omar_farooq</span>
              <span className="text-accent font-bold">750 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Graphic 5: Puzzle Quests (Trophy + Mission Target) */
function MissionGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-warn/20 bg-gradient-to-b from-warn/10 via-panel to-panel-2 p-3">
      <div className="absolute h-20 w-20 rounded-full bg-warn/20 blur-xl" />

      <div className="relative flex w-full max-w-[270px] items-center justify-between gap-3">
        {/* Shiny Trophy */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-warn bg-warn/15 text-warn shadow-md"
          >
            <Trophy className="h-6 w-6" />
          </motion.div>
          <span className="mt-1 font-mono text-[9px] font-bold text-warn uppercase">CHALLENGE</span>
        </div>

        {/* Mission Quest Card */}
        <div className="flex-1 flex flex-col gap-1 rounded-xl border border-border bg-panel p-2 shadow-xs">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="font-bold text-text-muted uppercase">Puzzle Mission</span>
            <span className="rounded bg-ok/15 text-ok font-bold px-1">Check Live</span>
          </div>
          <p className="text-[10.5px] font-semibold text-text leading-tight">
            &quot;Filter for exactly 5 video posts&quot;
          </p>
          <div className="mt-1 flex items-center justify-between rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[9.5px]">
            <span className="text-text-muted">Target: 5 rows</span>
            <span className="font-bold text-ok flex items-center gap-0.5">
              <Check className="h-3 w-3" /> Solved!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Graphic 6: Learning Journey (Rocket + Level Planets) */
function RocketGraphic() {
  return (
    <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-b from-accent/10 via-panel to-panel-2 p-3">
      <div className="absolute h-20 w-20 rounded-full bg-accent/20 blur-xl" />

      <div className="relative flex w-full max-w-[280px] flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
          <span className="text-text-muted">CURRICULUM JOURNEY</span>
          <span className="text-accent flex items-center gap-1">
            <Zap className="h-3 w-3 fill-current" /> Level 0 to 6
          </span>
        </div>

        {/* Rocket Flight Path */}
        <div className="relative flex items-center justify-between px-1 pt-1">
          <div className="absolute left-2 right-2 top-3 h-0.5 border-t-2 border-dashed border-border" />

          {/* Level Checkpoints */}
          {["Filter", "Aggs", "Group", "Having", "Join", "Sets", "SubQ"].map((lvl, idx) => (
            <div key={lvl} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                animate={idx <= 2 ? { scale: [1, 1.15, 1] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.2 }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-bold shadow-xs",
                  idx <= 2
                    ? "bg-accent text-accent-ink"
                    : "border border-border bg-panel text-text-muted",
                )}
              >
                {idx <= 1 ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : idx}
              </motion.div>
              <span className="font-mono text-[7.5px] font-bold text-text-muted">{lvl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 6 Simple, Punchy Steps (Kid-Friendly Copy with Directional Hints)        */
/* ------------------------------------------------------------------------- */

interface StepDef {
  targetId: string;
  beacon: string;
  arrowEmoji: string;
  directionHint: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  tip: string;
  graphic: React.ReactNode;
}

const TOUR_STEPS: StepDef[] = [
  {
    targetId: "tour-command-panel",
    beacon: "1. The Command Deck",
    arrowEmoji: "👈",
    directionHint: "LOOK AT THE HIGHLIGHTED LEFT PANEL",
    badge: "1 of 6 · Left Panel",
    title: "The Command Deck 🎮",
    subtitle: "Your database control center",
    desc: "Look at the glowing panel on your left! This entire deck is your remote control. Watch the SQL query at the top — it builds itself automatically as you adjust controls below.",
    tip: "💡 Everything on this deck lets you control what the database does.",
    graphic: <ControllerGraphic />,
  },
  {
    targetId: "tour-controls-section",
    beacon: "2. Interactive Controls",
    arrowEmoji: "👈",
    directionHint: "LOOK AT THE SLIDERS & BUTTONS",
    badge: "2 of 6 · Tweaks & Filters",
    title: "How To Tweak & Control 🎛️",
    subtitle: "Sliders, column chips, and sort buttons",
    desc: "Look at the sliders and buttons highlighted on your left! Drag the slider to change numbers (like likes > 400), click column chips to pick fields, and tap buttons to sort rows. No code typing required!",
    tip: "💡 Try moving the slider on the left to see the numbers jump!",
    graphic: <TweaksGraphic />,
  },
  {
    targetId: "tour-hood-panel",
    beacon: "3. The Magic Factory",
    arrowEmoji: "👉",
    directionHint: "LOOK AT THE HIGHLIGHTED MIDDLE PANEL",
    badge: "3 of 6 · Middle Panel",
    title: "Inside The Factory 🏭",
    subtitle: "Watch MySQL think in real time!",
    desc: "Look at the highlighted middle panel! This is the engine room. Watch rows travel like toys on a conveyor belt, get tested by your rules, and sort into neat buckets.",
    tip: "💡 Click stages like WHERE or SELECT to see data flow!",
    graphic: <FactoryGraphic />,
  },
  {
    targetId: "tour-output-panel",
    beacon: "4. The Results Chest",
    arrowEmoji: "👉",
    directionHint: "LOOK AT THE HIGHLIGHTED RIGHT PANEL",
    badge: "4 of 6 · Right Panel",
    title: "The Results Chest 🎁",
    subtitle: "Inspect winners and raw data",
    desc: "Look at the highlighted right panel! Here is your final answer. Switch to 'Output' to see the winners, or flip to 'Input' anytime to inspect all raw data before the query ran.",
    tip: "💡 You can drag the panel borders to resize them anytime.",
    graphic: <ChestGraphic />,
  },
  {
    targetId: "tour-challenge-card",
    beacon: "5. Puzzle Mission",
    arrowEmoji: "👈",
    directionHint: "LOOK AT THE CHALLENGE CARD ON THE LEFT",
    badge: "5 of 6 · Challenge Mission",
    title: "Puzzle Quests 🏆",
    subtitle: "Test your skills with fun mini-games!",
    desc: "Look at the mission card highlighted at the bottom of the left deck! Can you tweak the sliders so exactly 5 rows survive? Your answer is checked automatically live!",
    tip: "💡 Solve the challenge to earn your victory checkmark!",
    graphic: <MissionGraphic />,
  },
  {
    targetId: "tour-journey-map",
    beacon: "6. Level Journey",
    arrowEmoji: "👆",
    directionHint: "LOOK AT THE TOP BAR NAVIGATION",
    badge: "6 of 6 · Top Navigation",
    title: "Level Up Journey 🚀",
    subtitle: "Climb through 7 visual stages!",
    desc: "Look at the top bar! From basic Filtering and Aggregates to cool Joins and Subqueries — each level unlocks a new superpower and quiz checkmark!",
    tip: "💡 Click 'Tour' in the top bar anytime to replay this guide.",
    graphic: <RocketGraphic />,
  },
];

/* ------------------------------------------------------------------------- */
/* Main Onboarding Tour Component                                            */
/* ------------------------------------------------------------------------- */

export function OnboardingTour() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const onboardingDismissed = useProgressStore((s) => s.onboardingDismissed);
  const dismissOnboarding = useProgressStore((s) => s.dismissOnboarding);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  // Track target element bounding rect & autoscroll smoothly to it
  useEffect(() => {
    if (!mounted || onboardingDismissed) return;

    const findTarget = () => {
      const el =
        document.getElementById(current.targetId) ||
        document.getElementById(`${current.targetId}-mobile`);

      if (!el) {
        setTargetRect(null);
        return;
      }

      // Autoscroll element smoothly into comfortable view
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    findTarget();
    const interval = setInterval(findTarget, 50);
    const stopTimer = setTimeout(() => clearInterval(interval), 450);

    const handleResizeOrScroll = () => findTarget();
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [step, mounted, onboardingDismissed, current.targetId]);

  // Keyboard accessibility
  useEffect(() => {
    if (!mounted || onboardingDismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissOnboarding();
      } else if (e.key === "ArrowRight") {
        if (isLast) dismissOnboarding();
        else setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setStep((s) => Math.max(0, s - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, onboardingDismissed, isLast, dismissOnboarding]);

  if (!mounted || onboardingDismissed) return null;

  const handleNext = () => {
    if (isLast) {
      dismissOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  /* ------------------------------------------------------------------------- */
  /* Smart Card Placement Calculation                                          */
  /* ------------------------------------------------------------------------- */
  const computeCardStyle = (): React.CSSProperties => {
    if (typeof window === "undefined" || window.innerWidth < 768) {
      return { position: "fixed", bottom: 12, left: 12, right: 12 };
    }

    const cardWidth = 390;
    const padding = 20;

    if (!targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    // Step 6: Journey Map is at the top bar -> place card centered below it
    if (current.targetId === "tour-journey-map") {
      const leftPos = Math.max(
        padding,
        Math.min(
          window.innerWidth - cardWidth - padding,
          targetRect.left + (targetRect.width - cardWidth) / 2,
        ),
      );
      return {
        position: "fixed",
        top: targetRect.top + targetRect.height + 16,
        left: leftPos,
      };
    }

    // Step 1: Left Panel -> Place card to the right of left panel
    if (current.targetId === "tour-command-panel") {
      return {
        position: "fixed",
        top: 75,
        left: Math.min(targetRect.left + targetRect.width + 24, window.innerWidth - cardWidth - padding),
      };
    }

    // Step 2: Controls Section -> Place card to the right of controls
    if (current.targetId === "tour-controls-section") {
      return {
        position: "fixed",
        top: Math.max(75, targetRect.top - 20),
        left: Math.min(targetRect.left + targetRect.width + 24, window.innerWidth - cardWidth - padding),
      };
    }

    // Step 4: Right Panel -> Place card to the left of right panel
    if (current.targetId === "tour-output-panel") {
      return {
        position: "fixed",
        top: 75,
        left: Math.max(padding, targetRect.left - cardWidth - 24),
      };
    }

    // Step 3: Middle Panel -> Place card on the left panel area
    if (current.targetId === "tour-hood-panel") {
      return {
        position: "fixed",
        top: 75,
        left: padding + 16,
      };
    }

    // Step 5: Challenge Card -> Place card to the right, near bottom
    if (current.targetId === "tour-challenge-card") {
      return {
        position: "fixed",
        bottom: 30,
        left: Math.min(targetRect.left + targetRect.width + 24, window.innerWidth - cardWidth - padding),
      };
    }

    return {
      position: "fixed",
      top: 90,
      left: Math.min(targetRect.left + targetRect.width + 20, window.innerWidth - cardWidth - padding),
    };
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* ===================================================================== */}
      {/* 1. TRUE SVG SPOTLIGHT CUTOUT BACKDROP                                 */}
      {/* The background is deeply dimmed (72% dark slate),                     */}
      {/* while the target hole is 100% TRANSPARENT and brilliantly crisp!      */}
      {/* ===================================================================== */}
      <svg className="fixed inset-0 pointer-events-none z-40 h-full w-full">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White fills entire viewport to render dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out transparent window over target element */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx={16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Dark translucent backdrop */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* ===================================================================== */}
      {/* 2. GLOWING SPOTLIGHT BORDER FRAME & BEACON MARKER                    */}
      {/* ===================================================================== */}
      {targetRect && (
        <motion.div
          key={current.targetId}
          initial={false}
          animate={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          style={{
            boxShadow:
              "0 0 0 3px var(--accent), 0 0 35px var(--accent), inset 0 0 20px color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
          className="pointer-events-none fixed z-40 rounded-2xl border-2 border-accent ring-4 ring-accent/30"
        >
          {/* Animated Pulsing Beacon Marker on Target */}
          <div className="absolute -top-3.5 left-4 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-[10.5px] font-black text-accent-ink shadow-lg animate-bounce">
            <span>{current.beacon}</span>
          </div>
        </motion.div>
      )}

      {/* Click outside backdrop catcher to advance tour smoothly */}
      <div
        onClick={handleNext}
        className="pointer-events-auto fixed inset-0 z-40 opacity-0 cursor-pointer"
        title="Click to advance"
      />

      {/* ===================================================================== */}
      {/* 3. SMART FLOATING COACHMARK CARD                                      */}
      {/* ===================================================================== */}
      <div style={computeCardStyle()} className="pointer-events-auto z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="w-full max-w-[390px] rounded-2xl border-2 border-accent/40 bg-panel p-4 sm:p-5 shadow-2xl backdrop-blur-md"
          >
            {/* Top Directional Pointer Pill (Guides user's gaze immediately!) */}
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-1.5 rounded-lg bg-accent/15 border border-accent/30 px-2.5 py-1 text-[10.5px] font-black text-accent shadow-xs">
                <span className="text-[13px]">{current.arrowEmoji}</span>
                <span>{current.directionHint}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={dismissOnboarding}
                  className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold text-text-muted hover:bg-panel-2 hover:text-text transition-colors"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={dismissOnboarding}
                  aria-label="Close tour"
                  className="grid h-6 w-6 place-items-center rounded-md text-text-muted hover:bg-panel-2 hover:text-text transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Header: Badge & Step counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20 text-accent font-mono text-[10px] font-bold">
                  {step + 1}
                </span>
                <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
                  {current.badge}
                </span>
              </div>

              <span className="font-mono text-[10px] text-text-muted">
                Step {step + 1} / {TOUR_STEPS.length}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mt-2">
              <h3 className="text-[16px] font-black text-text tracking-tight">
                {current.title}
              </h3>
              <p className="text-[12px] font-bold text-accent mt-0.5">
                {current.subtitle}
              </p>
            </div>

            {/* Custom Visual Illustration */}
            <div className="my-2.5">{current.graphic}</div>

            {/* Short, Kid-Friendly Explanation */}
            <p className="text-[12px] leading-relaxed text-text font-medium">
              {current.desc}
            </p>

            {/* Action Tip */}
            <div className="mt-2.5 rounded-lg border border-accent/25 bg-accent/8 p-2 text-[11px] font-medium leading-snug text-text">
              {current.tip}
            </div>

            {/* Footer Navigation */}
            <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
              {/* Step indicator dots */}
              <div className="flex gap-1.5 items-center">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? "22px" : "6px",
                      backgroundColor: i === step ? "var(--accent)" : "var(--border)",
                    }}
                    aria-label={`Jump to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1 rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 font-mono text-[11px] font-bold text-text-muted hover:text-text transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 font-mono text-[11.5px] font-extrabold text-accent-ink shadow-sm transition-transform hover:-translate-y-px active:scale-[0.98]"
                >
                  {isLast ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Start Exploring!
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
