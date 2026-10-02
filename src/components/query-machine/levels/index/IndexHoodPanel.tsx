"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Flame,
  GitBranch,
  Layers,
  ListOrdered,
  Scissors,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { POSTS } from "@/lib/data";
import {
  DISTINCT_USERNAMES,
  runBTreeSeek,
  runFullTableScan,
} from "@/lib/indexEngine";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { useIndexStore } from "@/store/useIndexStore";

export function IndexHoodPanel() {
  const { locale } = useTranslation();
  const isUr = locale === "ur";

  const indexStatus = useIndexStore((s) => s.indexStatus);
  const targetUser = useIndexStore((s) => s.targetUser);
  const setTargetUser = useIndexStore((s) => s.setTargetUser);

  const hasIndex = indexStatus === "btree";
  const scanResult = runFullTableScan(targetUser);
  const treeResult = runBTreeSeek(targetUser);

  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when switching index status or target
  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(hasIndex ? "hood-node-tree" : "hood-node-scan");
      if (!el || !container) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = el.getBoundingClientRect();
      const targetTop = targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: Math.max(0, targetTop - 16),
        behavior: "smooth",
      });
    }, 40);

    return () => clearTimeout(timer);
  }, [hasIndex, targetUser]);

  // Branch separation logic at Level 0 (Root)
  const isTargetAtRoot = targetUser === "hamza_raza";
  const isTargetLeftTree = targetUser < "hamza_raza";
  const isTargetRightTree = targetUser > "hamza_raza";

  // Sub-branch separation logic at Level 1 (Dawood)
  const isTargetAtDawood = targetUser === "dawood_khan";
  const isTargetDawoodLeft = isTargetLeftTree && targetUser < "dawood_khan"; // ayesha, bilal
  const isTargetDawoodRight = isTargetLeftTree && targetUser > "dawood_khan"; // fatima

  // Sub-branch separation logic at Level 1 (Sara)
  const isTargetAtSara = targetUser === "sara_khan";
  const isTargetSaraLeft = isTargetRightTree && targetUser < "sara_khan"; // mariam
  const isTargetSaraRight = isTargetRightTree && targetUser > "sara_khan"; // usman, zainab

  return (
    <div className="flex h-full flex-col text-text">
      {/* Top Banner */}
      <div className="flex flex-none items-center justify-between border-b border-border bg-panel px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold text-[12px]">
            {hasIndex ? "🌳" : "📏"}
          </span>
          <span className="font-mono text-[12.5px] font-bold text-text">
            {hasIndex
              ? isUr ? "B-Tree Index Active (O(log N) Seek)" : "B-Tree Index Active (O(log N) Seek)"
              : isUr ? "Full Table Scan Active (O(N) Sequential Scan)" : "Full Table Scan Active (O(N) Sequential Scan)"}
          </span>
        </div>

        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold border",
            hasIndex ? "bg-ok/15 text-ok border-ok/30" : "bg-warn/15 text-warn border-warn/30",
          )}
        >
          {hasIndex
            ? isUr ? `Sirf ${treeResult.totalHops} Hops mein mila (0.6 ms) ⚡` : `Found in ${treeResult.totalHops} Hops (0.6 ms) ⚡`
            : isUr ? "20 / 20 Rows Read (18.2 ms) 🐌" : "20 / 20 Rows Read (18.2 ms) 🐌"}
        </span>
      </div>

      {/* Main Scrollable Canvas */}
      <div ref={bodyRef} className="dotted-canvas scrollbar-thin flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* ================================================================= */}
        {/* CASE 1: WITHOUT INDEX (FULL TABLE SCAN — WRAPPED ROWS)            */}
        {/* ================================================================= */}
        {!hasIndex && (
          <div id="hood-node-scan" className="rounded-xl border border-warn/40 bg-panel p-4 shadow-sm flex flex-col gap-3.5 scroll-mt-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-warn" />
                <span className="font-mono text-[12.5px] font-bold text-text uppercase">
                  {isUr ? "Sequential Row-by-Row Disk Inspection (20/20 rows)" : "Sequential Row-by-Row Disk Inspection (20/20 rows)"}
                </span>
              </div>
              <span className="rounded-full bg-warn/15 border border-warn/30 px-2 py-0.5 font-mono text-[9.5px] font-bold text-warn">
                18.2 ms · 20 Disk Page Reads
              </span>
            </div>

            <p className="text-[11.5px] text-text-muted leading-relaxed">
              {isUr ? (
                <>
                  Index na hone ki waja se MySQL ko poori <code className="text-text font-bold">posts</code> table ki tamam 20 rows ko shuru se aakhir tak ek ek kar ke parhna parta hai:
                </>
              ) : (
                <>
                  Without an index, MySQL is forced to inspect every single row from disk sequentially from start to finish:
                </>
              )}
            </p>

            {/* Wrapped Grid of All 20 Rows */}
            <div className="rounded-xl border border-border bg-panel-2 p-3">
              <div className="text-[9.5px] font-mono font-bold uppercase text-text-muted mb-2 tracking-wider">
                {isUr ? "ROWS CHECKED, ONE BY ONE:" : "ROWS CHECKED, ONE BY ONE:"}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {scanResult.rows.map(({ row, isMatch, stepNum }) => (
                  <div
                    key={row.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold border transition-all",
                      isMatch
                        ? "border-ok bg-ok/20 text-ok ring-2 ring-ok scale-102 shadow-xs font-black"
                        : "border-bad/40 bg-bad/10 text-bad opacity-80",
                    )}
                  >
                    <span className="text-[10px] text-text-muted">#{stepNum}</span>
                    <span className="text-text">@{row.username.split("_")[0]}</span>
                    {isMatch ? (
                      <span className="text-ok font-bold">✓</span>
                    ) : (
                      <span className="text-bad font-semibold">✕</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-warn/10 border border-warn/30 p-2.5 text-[11.5px] text-warn leading-relaxed flex items-center justify-between">
              <span>
                ⚠️ {isUr
                  ? `Table Scan ka Nuqsan: Matching posts milne ke baad bhi computer ko aakhir tak saari rows scan karni pareen!`
                  : `Table Scan Cost: Even after finding matches, MySQL must continue scanning all 20 rows to the end!`}
              </span>
              <span className="font-mono text-[10px] font-bold shrink-0 ml-2">
                20 / 20 Inspected
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* CASE 2: WITH INDEX (REIMAGINED AUTHENTIC VISUAL B-TREE DIAGRAM)   */}
        {/* ================================================================= */}
        {hasIndex && (
          <div id="hood-node-tree" className="rounded-xl border border-accent/40 bg-panel p-4 shadow-sm flex flex-col gap-4 scroll-mt-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-accent" />
                <span className="font-mono text-[12.5px] font-bold text-accent uppercase">
                  {isUr ? "Alphabetical B-Tree Index (posts.username)" : "Alphabetical B-Tree Index (posts.username)"}
                </span>
              </div>
              <span className="rounded-full bg-ok/15 border border-ok/30 px-2 py-0.5 font-mono text-[9.5px] font-bold text-ok">
                ⚡ {isUr ? `Found in ${treeResult.totalHops} Hops (25x Faster!)` : `Found in ${treeResult.totalHops} Hops (25x Faster!)`}
              </span>
            </div>

            <p className="text-[11.5px] text-text-muted leading-relaxed">
              {isUr ? (
                <>
                  B-Tree index dictionary ki tarah alphabet (A-Z) ke mutabiq keys ko organize karta hai. Har parent node key compare kar ke foran aadhi table discard kar deta hai!
                </>
              ) : (
                <>
                  The B-Tree index organizes usernames alphabetically like a dictionary. Each parent node compares the key and instantly eliminates 50% of names in a single hop!
                </>
              )}
            </p>

            {/* REAL-TIME DECISION BANNER */}
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent text-accent-ink px-2 py-0.5 font-black text-[10px]">
                  {isUr ? "SEEKING" : "SEEKING"}
                </span>
                <span className="text-text font-extrabold text-[12.5px]">
                  @{targetUser}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-[11.5px]">
                {isTargetAtRoot ? (
                  <span className="text-ok">✓ {isUr ? "Target seedha Root Node par mil gaya (1 hop)!" : "Target is Root Node (Found in 1 hop!)"}</span>
                ) : isTargetLeftTree ? (
                  <span className="text-accent">
                    &apos;{targetUser.split("_")[0]}&apos; &lt; &apos;hamza&apos; ➔ {isUr ? "Baayein (LEFT) jao" : "Go LEFT"} · ✂️ {isUr ? "Daayein M-Z 50% Discarded!" : "Right M-Z 50% Discarded!"}
                  </span>
                ) : (
                  <span className="text-accent">
                    &apos;{targetUser.split("_")[0]}&apos; &gt; &apos;hamza&apos; ➔ {isUr ? "Daayein (RIGHT) jao" : "Go RIGHT"} · ✂️ {isUr ? "Baayein A-F 50% Discarded!" : "Left A-F 50% Discarded!"}
                  </span>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* REIMAGINED VISUAL TREE CANVAS (DIRECT LINES + CLEAN NODES)  */}
            {/* ----------------------------------------------------------- */}
            <div className="w-full overflow-x-auto scrollbar-thin rounded-xl border border-border bg-panel-2 p-3 shadow-inner">
              <div className="min-w-[760px] w-full flex justify-center py-2">
                <svg viewBox="0 0 800 425" className="w-full h-auto select-none max-w-[840px]">
                  {/* ======================================================= */}
                  {/* 1. BRANCHING LINES FROM ROOT TO LEVEL 1 NODES           */}
                  {/* ======================================================= */}
                  {/* Left Branch Line (Root -> Dawood) */}
                  <line
                    x1="400"
                    y1="86"
                    x2="210"
                    y2="155"
                    stroke={isTargetLeftTree ? "#10b981" : isTargetAtRoot ? "var(--accent)" : "var(--border)"}
                    strokeWidth={isTargetLeftTree ? 3.5 : 1.5}
                    strokeDasharray={isTargetRightTree ? "4,4" : "none"}
                    opacity={isTargetRightTree ? 0.35 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetLeftTree && (
                    <circle cx="305" cy="120.5" r="4.5" fill="#10b981" className="animate-ping" />
                  )}

                  {/* Right Branch Line (Root -> Sara) */}
                  <line
                    x1="400"
                    y1="86"
                    x2="590"
                    y2="155"
                    stroke={isTargetRightTree ? "#10b981" : isTargetAtRoot ? "var(--accent)" : "var(--border)"}
                    strokeWidth={isTargetRightTree ? 3.5 : 1.5}
                    strokeDasharray={isTargetLeftTree ? "4,4" : "none"}
                    opacity={isTargetLeftTree ? 0.35 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetRightTree && (
                    <circle cx="495" cy="120.5" r="4.5" fill="#10b981" className="animate-ping" />
                  )}

                  {/* ======================================================= */}
                  {/* 2. BRANCHING LINES FROM LEVEL 1 TO LEVEL 2 LEAF NODES   */}
                  {/* ======================================================= */}
                  {/* Dawood -> Leaf 1 (A-B) */}
                  <line
                    x1="210"
                    y1="225"
                    x2="105"
                    y2="302"
                    stroke={isTargetDawoodLeft ? "#10b981" : "var(--border)"}
                    strokeWidth={isTargetDawoodLeft ? 3.5 : 1.5}
                    strokeDasharray={isTargetDawoodRight || isTargetRightTree ? "4,4" : "none"}
                    opacity={isTargetDawoodRight || isTargetRightTree ? 0.3 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetDawoodLeft && (
                    <circle cx="157.5" cy="263.5" r="4" fill="#10b981" className="animate-ping" />
                  )}

                  {/* Dawood -> Leaf 2 (F) */}
                  <line
                    x1="210"
                    y1="225"
                    x2="315"
                    y2="302"
                    stroke={isTargetDawoodRight ? "#10b981" : "var(--border)"}
                    strokeWidth={isTargetDawoodRight ? 3.5 : 1.5}
                    strokeDasharray={isTargetDawoodLeft || isTargetRightTree ? "4,4" : "none"}
                    opacity={isTargetDawoodLeft || isTargetRightTree ? 0.3 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetDawoodRight && (
                    <circle cx="262.5" cy="263.5" r="4" fill="#10b981" className="animate-ping" />
                  )}

                  {/* Sara -> Leaf 3 (M) */}
                  <line
                    x1="590"
                    y1="225"
                    x2="485"
                    y2="302"
                    stroke={isTargetSaraLeft ? "#10b981" : "var(--border)"}
                    strokeWidth={isTargetSaraLeft ? 3.5 : 1.5}
                    strokeDasharray={isTargetSaraRight || isTargetLeftTree ? "4,4" : "none"}
                    opacity={isTargetSaraRight || isTargetLeftTree ? 0.3 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetSaraLeft && (
                    <circle cx="537.5" cy="263.5" r="4" fill="#10b981" className="animate-ping" />
                  )}

                  {/* Sara -> Leaf 4 (U-Z) */}
                  <line
                    x1="590"
                    y1="225"
                    x2="695"
                    y2="302"
                    stroke={isTargetSaraRight ? "#10b981" : "var(--border)"}
                    strokeWidth={isTargetSaraRight ? 3.5 : 1.5}
                    strokeDasharray={isTargetSaraLeft || isTargetLeftTree ? "4,4" : "none"}
                    opacity={isTargetSaraLeft || isTargetLeftTree ? 0.3 : 1}
                    className="transition-all duration-300"
                  />
                  {isTargetSaraRight && (
                    <circle cx="642.5" cy="263.5" r="4" fill="#10b981" className="animate-ping" />
                  )}

                  {/* ======================================================= */}
                  {/* 3. SPLIT RANGE BADGES (FLOATING DIRECTLY ON BRANCHES)   */}
                  {/* ======================================================= */}
                  {/* Root Left Split Badge (A - F) */}
                  <foreignObject x={305 - 85} y={120.5 - 13} width={170} height={26}>
                    <div
                      className={cn(
                        "w-full h-full rounded-md px-1.5 flex items-center justify-center font-mono text-[10px] font-bold border shadow-xs transition-all",
                        isTargetLeftTree
                          ? "border-ok bg-ok/20 text-ok ring-1 ring-ok/40 font-black"
                          : isTargetRightTree
                          ? "border-bad/30 bg-bad/10 text-bad opacity-70"
                          : "border-border bg-panel text-text-muted",
                      )}
                    >
                      <span>⬅️ A - F (&lt; &apos;hamza&apos;)</span>
                      {isTargetRightTree && <span className="ml-1 text-[9px] font-black">✂️ 50%</span>}
                    </div>
                  </foreignObject>

                  {/* Root Right Split Badge (M - Z) */}
                  <foreignObject x={495 - 85} y={120.5 - 13} width={170} height={26}>
                    <div
                      className={cn(
                        "w-full h-full rounded-md px-1.5 flex items-center justify-center font-mono text-[10px] font-bold border shadow-xs transition-all",
                        isTargetRightTree
                          ? "border-ok bg-ok/20 text-ok ring-1 ring-ok/40 font-black"
                          : isTargetLeftTree
                          ? "border-bad/30 bg-bad/10 text-bad opacity-70"
                          : "border-border bg-panel text-text-muted",
                      )}
                    >
                      <span>➡️ M - Z (&gt; &apos;hamza&apos;)</span>
                      {isTargetLeftTree && <span className="ml-1 text-[9px] font-black">✂️ 50%</span>}
                    </div>
                  </foreignObject>

                  {/* Dawood Left Split Badge (A - B) */}
                  <foreignObject x={157.5 - 68} y={263.5 - 12} width={136} height={24}>
                    <div
                      className={cn(
                        "w-full h-full rounded px-1 flex items-center justify-center font-mono text-[9px] font-bold border transition-all",
                        isTargetDawoodLeft
                          ? "border-ok bg-ok/20 text-ok font-black ring-1 ring-ok"
                          : isTargetLeftTree && !isTargetAtDawood
                          ? "border-bad/30 bg-bad/10 text-bad opacity-60"
                          : "border-border bg-panel text-text-muted opacity-40",
                      )}
                    >
                      <span>⬅️ A-B (&lt; &apos;dawood&apos;)</span>
                      {isTargetDawoodRight && <span className="ml-0.5">✂️</span>}
                    </div>
                  </foreignObject>

                  {/* Dawood Right Split Badge (F) */}
                  <foreignObject x={262.5 - 58} y={263.5 - 12} width={116} height={24}>
                    <div
                      className={cn(
                        "w-full h-full rounded px-1 flex items-center justify-center font-mono text-[9px] font-bold border transition-all",
                        isTargetDawoodRight
                          ? "border-ok bg-ok/20 text-ok font-black ring-1 ring-ok"
                          : isTargetLeftTree && !isTargetAtDawood
                          ? "border-bad/30 bg-bad/10 text-bad opacity-60"
                          : "border-border bg-panel text-text-muted opacity-40",
                      )}
                    >
                      <span>➡️ F (&gt; &apos;dawood&apos;)</span>
                      {isTargetDawoodLeft && <span className="ml-0.5">✂️</span>}
                    </div>
                  </foreignObject>

                  {/* Sara Left Split Badge (M) */}
                  <foreignObject x={537.5 - 58} y={263.5 - 12} width={116} height={24}>
                    <div
                      className={cn(
                        "w-full h-full rounded px-1 flex items-center justify-center font-mono text-[9px] font-bold border transition-all",
                        isTargetSaraLeft
                          ? "border-ok bg-ok/20 text-ok font-black ring-1 ring-ok"
                          : isTargetRightTree && !isTargetAtSara
                          ? "border-bad/30 bg-bad/10 text-bad opacity-60"
                          : "border-border bg-panel text-text-muted opacity-40",
                      )}
                    >
                      <span>⬅️ M (&lt; &apos;sara&apos;)</span>
                      {isTargetSaraRight && <span className="ml-0.5">✂️</span>}
                    </div>
                  </foreignObject>

                  {/* Sara Right Split Badge (U - Z) */}
                  <foreignObject x={642.5 - 68} y={263.5 - 12} width={136} height={24}>
                    <div
                      className={cn(
                        "w-full h-full rounded px-1 flex items-center justify-center font-mono text-[9px] font-bold border transition-all",
                        isTargetSaraRight
                          ? "border-ok bg-ok/20 text-ok font-black ring-1 ring-ok"
                          : isTargetRightTree && !isTargetAtSara
                          ? "border-bad/30 bg-bad/10 text-bad opacity-60"
                          : "border-border bg-panel text-text-muted opacity-40",
                      )}
                    >
                      <span>➡️ U-Z (&gt; &apos;sara&apos;)</span>
                      {isTargetSaraLeft && <span className="ml-0.5">✂️</span>}
                    </div>
                  </foreignObject>

                  {/* ======================================================= */}
                  {/* 4. ACTUAL NODE CARDS (CLEAN INDIVIDUAL NODES)           */}
                  {/* ======================================================= */}
                  {/* LEVEL 0: ROOT NODE (@hamza_raza) */}
                  <foreignObject x={400 - 130} y={12} width={260} height={74}>
                    <div
                      onClick={() => setTargetUser("hamza_raza")}
                      className={cn(
                        "w-full h-full rounded-xl border-2 px-3 py-2 text-center transition-all cursor-pointer shadow-md select-none flex flex-col justify-between",
                        isTargetAtRoot
                          ? "border-ok bg-ok/20 ring-4 ring-ok/30 scale-102"
                          : "border-accent bg-panel ring-2 ring-accent/20 hover:border-accent/80",
                      )}
                    >
                      <div className="flex items-center justify-between text-[9.5px] font-mono font-bold uppercase text-accent">
                        <span>🌳 ROOT · LEVEL 0</span>
                        <span className="rounded bg-accent/20 px-1 py-0.2 text-[8.5px] text-accent font-extrabold">
                          Hop #1
                        </span>
                      </div>
                      <div className="font-mono text-[15px] font-black text-text leading-tight">
                        @hamza_raza
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-text-muted border-t border-border/50 pt-0.5">
                        <span>Partition A-Z</span>
                        <span className="font-bold text-accent">2 posts</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* LEVEL 1: LEFT BRANCH NODE (@dawood_khan) */}
                  <foreignObject x={210 - 100} y={155} width={200} height={70}>
                    <div
                      onClick={() => setTargetUser("dawood_khan")}
                      className={cn(
                        "w-full h-full rounded-xl border-2 px-3 py-2 text-center transition-all cursor-pointer shadow-sm select-none flex flex-col justify-between",
                        isTargetAtDawood
                          ? "border-ok bg-ok/20 ring-4 ring-ok/30 scale-102"
                          : isTargetLeftTree
                          ? "border-accent bg-panel ring-2 ring-accent/30 shadow-md"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-accent">
                        <span>BRANCH · LEVEL 1</span>
                        <span className="text-[8.5px] text-text-muted">Divider</span>
                      </div>
                      <div className="font-mono text-[13.5px] font-black text-text leading-tight">
                        @dawood_khan
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] font-mono text-text-muted border-t border-border/50 pt-0.5">
                        <span>A-B ⬅️ | ➡️ F</span>
                        <span className="font-bold text-accent">Hop #2</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* LEVEL 1: RIGHT BRANCH NODE (@sara_khan) */}
                  <foreignObject x={590 - 100} y={155} width={200} height={70}>
                    <div
                      onClick={() => setTargetUser("sara_khan")}
                      className={cn(
                        "w-full h-full rounded-xl border-2 px-3 py-2 text-center transition-all cursor-pointer shadow-sm select-none flex flex-col justify-between",
                        isTargetAtSara
                          ? "border-ok bg-ok/20 ring-4 ring-ok/30 scale-102"
                          : isTargetRightTree
                          ? "border-accent bg-panel ring-2 ring-accent/30 shadow-md"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-accent">
                        <span>BRANCH · LEVEL 1</span>
                        <span className="text-[8.5px] text-text-muted">Divider</span>
                      </div>
                      <div className="font-mono text-[13.5px] font-black text-text leading-tight">
                        @sara_khan
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] font-mono text-text-muted border-t border-border/50 pt-0.5">
                        <span>M ⬅️ | ➡️ U-Z</span>
                        <span className="font-bold text-accent">Hop #2</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* ======================================================= */}
                  {/* LEVEL 2: 4 LEAF NODES (MULTI-KEY LEAF PAGES)            */}
                  {/* ======================================================= */}
                  {/* LEAF 1: A - B (Ayesha & Bilal) */}
                  <foreignObject x={15} y={302} width={180} height={102}>
                    <div
                      className={cn(
                        "w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between transition-all shadow-xs",
                        isTargetDawoodLeft
                          ? "border-ok bg-panel shadow-md ring-2 ring-ok/30"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-text-muted uppercase border-b border-border/50 pb-0.5 px-1">
                        <span>🍃 LEAF · A - B</span>
                        <span>Hop #3</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {["ayesha_malik", "bilal_ahmed"].map((uname) => {
                          const isMatch = targetUser === uname;
                          const count = POSTS.filter((p) => p.username === uname).length;
                          return (
                            <button
                              key={uname}
                              type="button"
                              onClick={() => setTargetUser(uname)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-1.5 py-1 font-mono text-[10.5px] transition-all text-left border",
                                isMatch
                                  ? "border-ok bg-ok text-white font-black shadow-md ring-2 ring-ok scale-102"
                                  : "border-border bg-panel-2 text-text hover:border-accent/40",
                              )}
                            >
                              <span className="truncate max-w-[105px]">@{uname}</span>
                              <span className={cn("text-[8.5px] font-bold shrink-0", isMatch ? "text-white" : "text-text-muted")}>
                                {isMatch ? "✓ MATCH" : `${count}p`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </foreignObject>

                  {/* LEAF 2: F (Fatima) */}
                  <foreignObject x={235} y={302} width={160} height={102}>
                    <div
                      className={cn(
                        "w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between transition-all shadow-xs",
                        isTargetDawoodRight
                          ? "border-ok bg-panel shadow-md ring-2 ring-ok/30"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-text-muted uppercase border-b border-border/50 pb-0.5 px-1">
                        <span>🍃 LEAF · F</span>
                        <span>Hop #3</span>
                      </div>
                      <div className="flex flex-col gap-1 justify-center flex-1">
                        {["fatima_noor"].map((uname) => {
                          const isMatch = targetUser === uname;
                          const count = POSTS.filter((p) => p.username === uname).length;
                          return (
                            <button
                              key={uname}
                              type="button"
                              onClick={() => setTargetUser(uname)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-1.5 py-1.5 font-mono text-[10.5px] transition-all text-left border",
                                isMatch
                                  ? "border-ok bg-ok text-white font-black shadow-md ring-2 ring-ok scale-102"
                                  : "border-border bg-panel-2 text-text hover:border-accent/40",
                              )}
                            >
                              <span className="truncate max-w-[95px]">@{uname}</span>
                              <span className={cn("text-[8.5px] font-bold shrink-0", isMatch ? "text-white" : "text-text-muted")}>
                                {isMatch ? "✓ MATCH" : `${count} posts`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </foreignObject>

                  {/* LEAF 3: M (Mariam) */}
                  <foreignObject x={405} y={302} width={160} height={102}>
                    <div
                      className={cn(
                        "w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between transition-all shadow-xs",
                        isTargetSaraLeft
                          ? "border-ok bg-panel shadow-md ring-2 ring-ok/30"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-text-muted uppercase border-b border-border/50 pb-0.5 px-1">
                        <span>🍃 LEAF · M</span>
                        <span>Hop #3</span>
                      </div>
                      <div className="flex flex-col gap-1 justify-center flex-1">
                        {["mariam_yousuf"].map((uname) => {
                          const isMatch = targetUser === uname;
                          const count = POSTS.filter((p) => p.username === uname).length;
                          return (
                            <button
                              key={uname}
                              type="button"
                              onClick={() => setTargetUser(uname)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-1.5 py-1.5 font-mono text-[10.5px] transition-all text-left border",
                                isMatch
                                  ? "border-ok bg-ok text-white font-black shadow-md ring-2 ring-ok scale-102"
                                  : "border-border bg-panel-2 text-text hover:border-accent/40",
                              )}
                            >
                              <span className="truncate max-w-[95px]">@{uname}</span>
                              <span className={cn("text-[8.5px] font-bold shrink-0", isMatch ? "text-white" : "text-text-muted")}>
                                {isMatch ? "✓ MATCH" : `${count} posts`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </foreignObject>

                  {/* LEAF 4: U - Z (Usman & Zainab) */}
                  <foreignObject x={605} y={302} width={180} height={102}>
                    <div
                      className={cn(
                        "w-full h-full rounded-xl border-2 p-1.5 flex flex-col justify-between transition-all shadow-xs",
                        isTargetSaraRight
                          ? "border-ok bg-panel shadow-md ring-2 ring-ok/30"
                          : "border-border bg-panel opacity-35 grayscale-75",
                      )}
                    >
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-text-muted uppercase border-b border-border/50 pb-0.5 px-1">
                        <span>🍃 LEAF · U - Z</span>
                        <span>Hop #3</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {["usman_tariq", "zainab_qureshi"].map((uname) => {
                          const isMatch = targetUser === uname;
                          const count = POSTS.filter((p) => p.username === uname).length;
                          return (
                            <button
                              key={uname}
                              type="button"
                              onClick={() => setTargetUser(uname)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-1.5 py-1 font-mono text-[10.5px] transition-all text-left border",
                                isMatch
                                  ? "border-ok bg-ok text-white font-black shadow-md ring-2 ring-ok scale-102"
                                  : "border-border bg-panel-2 text-text hover:border-accent/40",
                              )}
                            >
                              <span className="truncate max-w-[105px]">@{uname}</span>
                              <span className={cn("text-[8.5px] font-bold shrink-0", isMatch ? "text-white" : "text-text-muted")}>
                                {isMatch ? "✓ MATCH" : `${count}p`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </foreignObject>
                </svg>
              </div>
            </div>

            {/* STEP-BY-STEP SEEK EXPLANATION LOG */}
            <div className="flex flex-col gap-1.5 font-mono text-[11px]">
              {treeResult.hops.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-2.5",
                    h.decision === "match"
                      ? "border-ok/40 bg-ok/10 text-ok font-bold"
                      : "border-border bg-panel-2 text-text",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span>{isUr ? h.explanationUr : h.explanationEn}</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-bold">
                    Node [@{h.nodeUser.split("_")[0]}]
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-ok/10 border border-ok/30 p-2.5 text-[11.5px] text-ok flex items-center justify-between">
              <span>
                🎉 {isUr
                  ? `Tree Index ne sirf ${treeResult.totalHops} hops mein matching rows ke memory pointers pakad liye!`
                  : `The tree index jumped directly to matching memory pointers in ${treeResult.totalHops} hops!`}
              </span>
              <span className="font-mono text-[10px] font-bold">
                0.6 ms (25x Faster ⚡)
              </span>
            </div>
          </div>
        )}

        {/* Matched Rows Preview */}
        <div className="rounded-xl border border-ok/40 bg-ok/5 p-3.5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-ok/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok text-white font-bold text-[10px]">
                ✓
              </span>
              <span className="font-mono text-[12px] font-bold text-text">
                Matching Posts: @{targetUser} ({treeResult.matchingRows.length} {treeResult.matchingRows.length === 1 ? "post" : "posts"})
              </span>
            </div>
            <span className="rounded bg-ok px-2 py-0.5 font-mono text-[9.5px] font-black text-white">
              {hasIndex ? `Direct Pointers` : `Scan Filter`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {treeResult.matchingRows.map((post) => (
              <div key={post.id} className="rounded-lg border border-border bg-panel p-2 font-mono text-[10.5px]">
                <div className="flex items-center justify-between text-[9.5px] text-text-muted mb-0.5">
                  <span className="font-bold text-ok">Post #{post.id}</span>
                  <span className="uppercase text-[8.5px]">{post.format}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted text-[10px]">
                  <span>likes: <b className="text-accent">{post.likes_count}</b></span>
                  <span>views: <b className="text-flow">{post.views_count}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
