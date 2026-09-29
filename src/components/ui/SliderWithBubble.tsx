"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SliderWithBubbleProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatBubble: (value: number) => string;
  ariaLabel: string;
  /** Keep the bubble visible after release (used for the stage scrubber). */
  persistBubble?: boolean;
  trackClassName?: string;
}

export function SliderWithBubble({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatBubble,
  ariaLabel,
  persistBubble = false,
  trackClassName,
}: SliderWithBubbleProps) {
  const [dragging, setDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const showBubble = dragging || persistBubble;

  return (
    <div className="relative pt-6">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            // Thumb is 16px wide, so its center drifts 8px inside the track at
            // the ends — raw `${pct}%` alone puts the bubble off-thumb there.
            style={{ left: `calc(${pct}% + ${8 - pct * 0.16}px)` }}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-ink shadow-[var(--shadow)]"
          >
            {formatBubble(value)}
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-accent" />
          </motion.div>
        )}
      </AnimatePresence>

      <RadixSlider.Root
        className="relative flex h-4 w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        onValueChange={([v]) => onChange(v)}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
      >
        <RadixSlider.Track className={cn("relative h-[5px] grow rounded-full bg-border", trackClassName)}>
          <RadixSlider.Range className="absolute h-full rounded-full bg-gradient-to-r from-flow to-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block h-4 w-4 rounded-full border-[3px] border-panel bg-accent shadow-[0_0_0_1px_var(--accent)] outline-none transition-transform active:scale-125"
          style={{ boxShadow: "0 0 0 1px var(--accent)" }}
        />
      </RadixSlider.Root>
    </div>
  );
}
