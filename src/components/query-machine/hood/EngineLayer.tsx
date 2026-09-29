"use client";

import { motion } from "framer-motion";
import { selectColsText, STAGES } from "@/lib/queryEngine";
import { useQueryStore } from "@/store/useQueryStore";
import { LayerShell } from "./LayerShell";

const TRUNK_Y: Record<string, number> = { FROM: 38, WHERE: 108, SELECT: 178, "ORDER BY": 248, LIMIT: 318 };
const TRUNK_X = 120;
const FLAG_W = 74;
const FLAG_H = 22;

function flagPath(w: number, h: number) {
  const r = 4;
  return `M${r} 0 H${w - 6} L${w} ${h / 2} L${w - 6} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
}

export function EngineLayer() {
  const stage = useQueryStore((s) => s.stage);
  const threshold = useQueryStore((s) => s.threshold);
  const selectedCols = useQueryStore((s) => s.selectedCols);
  const orderCol = useQueryStore((s) => s.orderCol);
  const orderDir = useQueryStore((s) => s.orderDir);
  const limit = useQueryStore((s) => s.limit);
  const setStage = useQueryStore((s) => s.setStage);

  const subText: Record<string, string> = {
    FROM: "posts",
    WHERE: `likes_count > ${threshold}`,
    SELECT: selectColsText(selectedCols),
    "ORDER BY": `${orderCol} ${orderDir}`,
    LIMIT: String(limit),
  };

  const activeY = TRUNK_Y[STAGES[stage]];

  return (
    <LayerShell id="engine" index={3} title="Execution engine" subtitle="runs the clauses in logical order" live>
      <p className="mb-2.5 text-[11.5px] leading-relaxed text-text-muted">
        The execution engine walks the chosen plan one stage at a time, exactly in the order below.
      </p>
      <svg viewBox="0 0 260 340" className="block h-auto w-full overflow-visible">
        {/* root -> FROM edge */}
        <motion.path
          d={`M${TRUNK_X} 46 L${TRUNK_X} ${TRUNK_Y.FROM - 16}`}
          fill="none"
          strokeWidth={2}
          initial={false}
          animate={{ stroke: "var(--flow)", strokeDasharray: "none" }}
        />
        {STAGES.slice(1).map((name, i) => {
          const prevY = TRUNK_Y[STAGES[i]];
          const y = TRUNK_Y[name];
          const flowing = STAGES.indexOf(name) <= stage;
          return (
            <motion.path
              key={name}
              d={`M${TRUNK_X} ${prevY + 16} L${TRUNK_X} ${y - 16}`}
              fill="none"
              strokeWidth={2}
              initial={false}
              animate={{
                stroke: flowing ? "var(--flow)" : "var(--border)",
                strokeDasharray: flowing ? "none" : "4 4",
              }}
              transition={{ duration: 0.28 }}
            />
          );
        })}

        <g>
          <circle cx={TRUNK_X} cy={30} r={12} fill="var(--flow)" stroke="var(--flow)" strokeWidth={2} />
          <text x={TRUNK_X} y={33} textAnchor="middle" fill="var(--text)" style={{ fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>
            SQL
          </text>
        </g>

        {STAGES.map((name) => {
          const y = TRUNK_Y[name];
          const reached = STAGES.indexOf(name) <= stage;
          const current = STAGES.indexOf(name) === stage;
          return (
            <g key={name} style={{ cursor: "pointer" }} onClick={() => setStage(STAGES.indexOf(name))}>
              {current && (
                <circle
                  className="animate-ring-grow"
                  cx={TRUNK_X}
                  cy={y}
                  r={11}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                />
              )}
              <motion.circle
                cx={TRUNK_X}
                cy={y}
                r={11}
                strokeWidth={2}
                initial={false}
                animate={{
                  fill: current ? "var(--accent)" : reached ? "var(--flow)" : "var(--panel-2)",
                  stroke: current ? "var(--accent)" : reached ? "var(--flow)" : "var(--border)",
                }}
                transition={{ duration: 0.28 }}
              />
              <motion.text
                x={TRUNK_X + 20}
                y={y - 2}
                textAnchor="start"
                initial={false}
                animate={{ fill: reached || current ? "var(--text)" : "var(--text-muted)" }}
                style={{ fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}
              >
                {name}
              </motion.text>
              <text x={TRUNK_X + 20} y={y + 10} textAnchor="start" fill="var(--text-muted)" opacity={0.85} style={{ fontSize: 7.6, fontFamily: "var(--font-jetbrains)" }}>
                {subText[name]}
              </text>
            </g>
          );
        })}

        <motion.g
          animate={{ x: TRUNK_X + 34, y: activeY - FLAG_H / 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <path d={flagPath(FLAG_W, FLAG_H)} fill="var(--accent)" style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,.25))" }} />
          <text x={FLAG_W / 2 + 4} y={FLAG_H / 2 + 3.5} textAnchor="middle" fill="#fff" style={{ fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>
            {STAGES[stage]}
          </text>
        </motion.g>
      </svg>
    </LayerShell>
  );
}
