"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useState, type ReactNode } from "react";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/store/useProgressStore";

export function Term({
  term,
  children,
  className,
}: {
  term: keyof typeof GLOSSARY;
  children: ReactNode;
  className?: string;
}) {
  const definition = GLOSSARY[term];
  const seen = useProgressStore((s) => Boolean(s.seenTerms[term]));
  const markTermSeen = useProgressStore((s) => s.markTermSeen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client only mount flag
    setMounted(true);
  }, []);

  if (!definition) return <>{children}</>;

  const isNew = mounted && !seen;

  const handleInteract = () => {
    if (isNew) markTermSeen(term);
  };

  return (
    <Tooltip.Root onOpenChange={(open) => open && handleInteract()}>
      <Tooltip.Trigger asChild>
        <span
          tabIndex={0}
          onMouseEnter={handleInteract}
          onFocus={handleInteract}
          className={cn(
            "cursor-help underline decoration-dotted decoration-text-muted/60 underline-offset-[3px] outline-none transition-all",
            isNew && "rounded bg-accent/10 px-1 py-0.5 ring-1 ring-accent/30 text-accent font-semibold animate-pulse",
            className,
          )}
        >
          {children}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={7}
          className="z-50 max-w-[230px] rounded-lg border border-border bg-panel px-3 py-2 text-[11.5px] leading-snug text-text shadow-[var(--shadow)]"
        >
          {definition}
          <Tooltip.Arrow className="fill-panel" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
