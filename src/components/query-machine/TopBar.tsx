"use client";

import * as Switch from "@radix-ui/react-switch";
import { Cog, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { STAGES } from "@/lib/queryEngine";
import { useQueryStore } from "@/store/useQueryStore";

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

export function TopBar() {
  const stage = useQueryStore((s) => s.stage);
  const hoodOpen = useQueryStore((s) => s.hoodOpen);
  const toggleHood = useQueryStore((s) => s.toggleHood);
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
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="rounded-full border border-border bg-panel-2 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-flow">
          {STAGES[stage]}
        </span>

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
