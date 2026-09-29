"use client";

import { STAGES } from "@/lib/queryEngine";
import { useQueryStore } from "@/store/useQueryStore";
import { EngineLayer } from "./hood/EngineLayer";
import { OptimizerLayer } from "./hood/OptimizerLayer";
import { ParserLayer } from "./hood/ParserLayer";
import { StorageLayer } from "./hood/StorageLayer";

export function HoodPanel() {
  const stage = useQueryStore((s) => s.stage);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">Under the hood</h2>
        <span className="font-mono text-[11px] text-text-muted">{STAGES[stage]}</span>
      </div>
      <div className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4">
        <p className="mb-3.5 rounded-xl border border-border bg-panel p-2.5 text-[11.5px] leading-relaxed text-text-muted shadow-[var(--shadow-row)]">
          MySQL doesn&apos;t run your query top to bottom. Text goes through four layers before you get a
          result — follow the line down.
        </p>
        <div className="relative flex flex-col gap-3.5">
          <div className="absolute top-[22px] bottom-[22px] left-[27px] z-0 w-0.5 bg-border" aria-hidden />
          <ParserLayer />
          <OptimizerLayer />
          <EngineLayer />
          <StorageLayer />
        </div>
      </div>
    </div>
  );
}
