"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";

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
  if (!definition) return <>{children}</>;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "cursor-help underline decoration-dotted decoration-text-muted/60 underline-offset-[3px] outline-none",
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
