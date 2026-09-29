"use client";

import { motion } from "framer-motion";
import type { PostRow } from "@/lib/data";

export const BUCKET_COLORS = ["var(--accent)", "var(--flow)", "var(--ok)", "var(--warn)", "var(--bad)"];

export function RowChip({
  row,
  dimmed,
  layoutPrefix = "row",
}: {
  row: PostRow;
  dimmed: boolean;
  layoutPrefix?: string;
}) {
  return (
    <motion.div
      layoutId={`${layoutPrefix}-${row.id}`}
      layout
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      animate={{ opacity: dimmed ? 0.55 : 1, scale: dimmed ? 0.92 : 1 }}
      className="flex flex-none items-center gap-1.5 rounded-full border border-border bg-panel px-2.5 py-1 font-mono text-[10.5px] font-semibold shadow-[var(--shadow-row)]"
    >
      <span className="text-text-muted">#{row.id}</span>
      {row.username}
    </motion.div>
  );
}
