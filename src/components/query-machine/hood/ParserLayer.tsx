"use client";

import { motion } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryStore } from "@/store/useQueryStore";
import { LayerShell } from "./LayerShell";

const CLAUSES = ["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT"];

export function ParserLayer() {
  const threshold = useQueryStore((s) => s.threshold);
  const [runId, setRunId] = useState(0);

  return (
    <LayerShell id="parser" index={1} title="Parser" subtitle="is the SQL text even valid?">
      <div className="mb-2.5 flex flex-wrap gap-1.5 font-mono">
        {CLAUSES.map((c, i) => (
          <span
            key={`${c}-${runId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel-2 py-1 pr-2.5 pl-1.5 text-[11px] font-semibold"
          >
            {c}
            <motion.span
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.07, type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className="h-2.5 w-2.5 text-ok" strokeWidth={3} />
            </motion.span>
          </span>
        ))}
      </div>
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] text-ok">
        <b className="text-text">Syntax OK</b> — 5 clauses recognised, WHERE likes_count &gt; {threshold} parses cleanly.
      </p>
      <button
        type="button"
        onClick={() => setRunId((r) => r + 1)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-[10.5px] font-bold text-text-muted hover:border-accent hover:text-accent"
      >
        <RefreshCw className="h-2.5 w-2.5" />
        re-run parser
      </button>
    </LayerShell>
  );
}
