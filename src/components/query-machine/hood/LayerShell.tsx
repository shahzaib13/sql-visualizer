"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useQueryStore, type HoodLayerId } from "@/store/useQueryStore";

interface LayerShellProps {
  id: HoodLayerId;
  index: number;
  title: string;
  subtitle: string;
  live?: boolean;
  children: ReactNode;
}

export function LayerShell({ id, index, title, subtitle, live, children }: LayerShellProps) {
  const collapsed = useQueryStore((s) => s.collapsedLayers[id]);
  const toggle = useQueryStore((s) => s.toggleLayer);

  return (
    <section className="relative z-10 overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow)]">
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left hover:bg-panel-2"
      >
        <span
          className={cn(
            "grid h-6 w-6 flex-none place-items-center rounded-full border-[1.5px] border-border bg-panel-2 font-mono text-[11px] font-bold text-text-muted transition-colors",
            live && "border-accent bg-accent text-accent-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_20%,transparent)]",
          )}
        >
          {index}
        </span>
        <span className="flex-none text-[12.5px] font-bold">{title}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-text-muted">{subtitle}</span>
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5 flex-none text-text-muted" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: collapsed ? 0 : "auto" }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-border px-4 pt-3.5 pb-4">{children}</div>
      </motion.div>
    </section>
  );
}
