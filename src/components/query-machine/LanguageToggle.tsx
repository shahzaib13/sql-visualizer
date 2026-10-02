"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-border bg-panel-2 p-1 shadow-[var(--shadow-row)] text-[11px]"
      title="Switch Language / Zubaan tabdeel karein"
    >
      <div className="flex items-center pl-1.5 pr-1 text-text-muted">
        <Languages className="h-3.5 w-3.5 text-accent" />
      </div>

      <div className="relative flex items-center">
        {(
          [
            { id: "en", label: "EN" },
            { id: "ur", label: "Roman Urdu" },
          ] as const
        ).map((item) => {
          const isActive = locale === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLocale(item.id)}
              className={cn(
                "relative z-10 rounded-lg px-2 py-1 font-mono font-bold transition-colors",
                isActive ? "text-accent-ink" : "text-text-muted hover:text-text",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-lang-pill"
                  className="absolute inset-0 rounded-lg bg-accent shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-20 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
