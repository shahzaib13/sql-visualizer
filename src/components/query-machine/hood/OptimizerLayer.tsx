"use client";

import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { useQueryStore } from "@/store/useQueryStore";
import { passingCount } from "@/lib/queryEngine";
import { LayerShell } from "./LayerShell";

const WHERE = { x: 38, y: 64 };
const SCAN = { x: 206, y: 26 };
const IDX = { x: 206, y: 102 };

function ForkLeaf({ x, y, label, sub, chosen, reached, color }: { x: number; y: number; label: string; sub: string; chosen: boolean; reached: boolean; color: string }) {
  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={11}
        strokeWidth={2}
        initial={false}
        animate={{
          fill: reached && chosen ? color : "var(--panel-2)",
          stroke: reached && chosen ? color : "var(--border)",
          opacity: reached ? 1 : 0.45,
        }}
        transition={{ duration: 0.28 }}
      />
      <motion.text
        x={x}
        y={y + 3}
        textAnchor="middle"
        style={{ fontSize: 8.5, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}
        initial={false}
        animate={{ fill: reached && chosen ? "#fff" : "var(--text-muted)" }}
      >
        {label}
      </motion.text>
      <text
        x={x + 18}
        y={y + 3.5}
        textAnchor="start"
        fill="var(--text-muted)"
        style={{ fontSize: 8, fontFamily: "var(--font-inter)" }}
      >
        {sub}
      </text>
    </g>
  );
}

export function OptimizerLayer() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const simIndex = useQueryStore((s) => s.simIndex);
  const setSimIndex = useQueryStore((s) => s.setSimIndex);
  const reached = stage >= 1;
  const target = simIndex ? IDX : SCAN;
  const matchCount = passingCount(threshold);

  return (
    <LayerShell id="optimizer" index={2} title="Optimizer" subtitle="decides how WHERE gets run" live={stage === 1}>
      <p className="mb-2.5 text-[11.5px] leading-relaxed text-text-muted">
        For <b className="text-text">WHERE likes_count &gt; {threshold}</b>, the optimizer must pick how to
        find matching rows — this is the plan execution will follow.
      </p>

      <svg viewBox="0 0 300 128" className="block h-auto w-full overflow-visible">
        <motion.path
          d={`M${WHERE.x + 13} ${WHERE.y} C 140 ${WHERE.y}, 170 ${SCAN.y}, ${SCAN.x - 16} ${SCAN.y}`}
          fill="none"
          strokeWidth={2.5}
          initial={false}
          animate={{
            stroke: !simIndex ? "var(--flow)" : "var(--border)",
            strokeDasharray: !simIndex ? "none" : "4 4",
            opacity: reached ? 1 : 0.3,
          }}
          transition={{ duration: 0.4 }}
        />
        <motion.path
          d={`M${WHERE.x + 13} ${WHERE.y} C 140 ${WHERE.y}, 170 ${IDX.y}, ${IDX.x - 16} ${IDX.y}`}
          fill="none"
          strokeWidth={2.5}
          initial={false}
          animate={{
            stroke: simIndex ? "var(--ok)" : "var(--border)",
            strokeDasharray: simIndex ? "none" : "4 4",
            opacity: reached ? 1 : 0.3,
          }}
          transition={{ duration: 0.4 }}
        />

        <motion.circle cx={WHERE.x} cy={WHERE.y} r={13} initial={false} animate={{ fill: reached ? "var(--accent)" : "var(--panel-2)", stroke: reached ? "var(--accent)" : "var(--border)" }} />
        <text x={WHERE.x} y={WHERE.y + 3.5} textAnchor="middle" fill={reached ? "#fff" : "var(--text-muted)"} style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>
          WHERE
        </text>

        <ForkLeaf x={SCAN.x} y={SCAN.y} label="scan" sub="full scan" chosen={!simIndex} reached={reached} color="var(--flow)" />
        <ForkLeaf x={IDX.x} y={IDX.y} label="idx" sub="index seek" chosen={simIndex} reached={reached} color="var(--ok)" />

        <motion.g
          animate={{ x: target.x - 52, y: target.y - 32, opacity: reached ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <rect width={60} height={20} rx={5} fill="var(--ok)" style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,.25))" }} />
          <text x={30} y={13.5} textAnchor="middle" fill="#fff" style={{ fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>
            chosen path
          </text>
        </motion.g>
      </svg>

      <div className="mt-2.5 flex gap-2.5">
        <div className={`flex-1 rounded-lg border p-2.5 text-center transition-colors ${!simIndex ? "border-ok bg-ok/10" : "border-border bg-panel"}`}>
          <div className={`font-mono text-[18px] font-bold ${!simIndex ? "text-ok" : ""}`}>8</div>
          <div className="mt-0.5 text-[10px] text-text-muted">rows touched — full scan</div>
        </div>
        <div className={`flex-1 rounded-lg border p-2.5 text-center transition-colors ${simIndex ? "border-ok bg-ok/10" : "border-border bg-panel"}`}>
          <div className={`font-mono text-[18px] font-bold ${simIndex ? "text-ok" : ""}`}>{reached ? matchCount : "?"}</div>
          <div className="mt-0.5 text-[10px] text-text-muted">rows touched — index seek</div>
        </div>
      </div>

      <label className="mt-3.5 flex cursor-pointer items-center gap-2 font-mono text-[11px] text-text-muted">
        <Switch.Root
          checked={simIndex}
          onCheckedChange={setSimIndex}
          className="relative h-[18px] w-[32px] flex-none rounded-full border border-border bg-panel-2 data-[state=checked]:border-ok data-[state=checked]:bg-ok/30"
        >
          <Switch.Thumb className="block h-3 w-3 translate-x-1 rounded-full bg-text-muted transition-transform data-[state=checked]:translate-x-[16px] data-[state=checked]:bg-ok" />
        </Switch.Root>
        simulate an index on likes_count
      </label>
    </LayerShell>
  );
}
