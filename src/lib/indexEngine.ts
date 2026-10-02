import { POSTS, type PostRow } from "@/lib/data";

export const DISTINCT_USERNAMES = [
  "ayesha_malik",
  "bilal_ahmed",
  "dawood_khan",
  "fatima_noor",
  "hamza_raza",
  "mariam_yousuf",
  "sara_khan",
  "usman_tariq",
  "zainab_qureshi",
] as const;

export type UsernameKey = (typeof DISTINCT_USERNAMES)[number];
export type IndexStatus = "none" | "btree";

export interface ScanRowResult {
  row: PostRow;
  isMatch: boolean;
  stepNum: number;
}

export interface FullScanResult {
  rows: ScanRowResult[];
  totalChecked: number;
  matchingRows: PostRow[];
  timeMs: number;
}

export function runFullTableScan(targetUser: string): FullScanResult {
  const rows: ScanRowResult[] = [];
  const matchingRows: PostRow[] = [];

  for (let i = 0; i < POSTS.length; i++) {
    const row = POSTS[i];
    const isMatch = row.username === targetUser;
    rows.push({ row, isMatch, stepNum: i + 1 });
    if (isMatch) {
      matchingRows.push(row);
    }
  }

  return {
    rows,
    totalChecked: POSTS.length, // Table scan must inspect ALL rows
    matchingRows,
    timeMs: 18.2,
  };
}

export interface BTreeHop {
  nodeUser: string;
  level: number;
  decision: "root" | "left" | "right" | "match";
  explanationEn: string;
  explanationUr: string;
}

export interface BTreeSeekResult {
  hops: BTreeHop[];
  visitedNodes: string[];
  discardedNodes: string[];
  matchingRows: PostRow[];
  totalHops: number;
  timeMs: number;
}

export function runBTreeSeek(targetUser: string): BTreeSeekResult {
  const hops: BTreeHop[] = [];
  const visitedNodes: string[] = [];
  const discardedNodes: string[] = [];
  const matchingRows = POSTS.filter((p) => p.username === targetUser);

  const ROOT = "hamza_raza";
  visitedNodes.push(ROOT);

  if (targetUser === ROOT) {
    hops.push({
      nodeUser: ROOT,
      level: 0,
      decision: "match",
      explanationEn: "Match found directly at Root node!",
      explanationUr: "Seedha Root node par mil gaya! (Sirf 1 Hop)",
    });
    return {
      hops,
      visitedNodes,
      discardedNodes: [
        "ayesha_malik",
        "bilal_ahmed",
        "dawood_khan",
        "fatima_noor",
        "mariam_yousuf",
        "sara_khan",
        "usman_tariq",
        "zainab_qureshi",
      ],
      matchingRows,
      totalHops: 1,
      timeMs: 0.3,
    };
  }

  if (targetUser < ROOT) {
    // Alphabetically before Hamza (A - F)
    hops.push({
      nodeUser: ROOT,
      level: 0,
      decision: "left",
      explanationEn: `'${targetUser}' < '${ROOT}' (alphabetically before) → Branch LEFT!`,
      explanationUr: `'${targetUser}' alphabet mein '${ROOT}' se pehle aata hai → BAAYEIN (Left) jao!`,
    });
    discardedNodes.push("mariam_yousuf", "sara_khan", "usman_tariq", "zainab_qureshi");

    const branch = "dawood_khan";
    visitedNodes.push(branch);

    if (targetUser === branch) {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "match",
        explanationEn: `Match found at '${branch}' in 2 hops!`,
        explanationUr: `Node '${branch}' par 2 hops mein mil gaya!`,
      });
      discardedNodes.push("ayesha_malik", "bilal_ahmed", "fatima_noor");
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 2, timeMs: 0.6 };
    }

    if (targetUser < branch) {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "left",
        explanationEn: `'${targetUser}' < '${branch}' → Discard right, jump to Leaf!`,
        explanationUr: `'${targetUser}' < '${branch}' se pehle hai → Leaf par chhalang!`,
      });
      discardedNodes.push("fatima_noor");
      visitedNodes.push(targetUser);
      hops.push({
        nodeUser: targetUser,
        level: 2,
        decision: "match",
        explanationEn: `Match found in Leaf node [${targetUser}]!`,
        explanationUr: `Leaf node [${targetUser}] mein mil gaya!`,
      });
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 3, timeMs: 0.8 };
    } else {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "right",
        explanationEn: `'${targetUser}' > '${branch}' → Discard left, jump to Leaf!`,
        explanationUr: `'${targetUser}' > '${branch}' ke baad hai → Leaf par chhalang!`,
      });
      discardedNodes.push("ayesha_malik", "bilal_ahmed");
      visitedNodes.push(targetUser);
      hops.push({
        nodeUser: targetUser,
        level: 2,
        decision: "match",
        explanationEn: `Match found in Leaf node [${targetUser}]!`,
        explanationUr: `Leaf node [${targetUser}] mein mil gaya!`,
      });
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 3, timeMs: 0.8 };
    }
  } else {
    // Alphabetically after Hamza (M - Z)
    hops.push({
      nodeUser: ROOT,
      level: 0,
      decision: "right",
      explanationEn: `'${targetUser}' > '${ROOT}' (alphabetically after) → Branch RIGHT!`,
      explanationUr: `'${targetUser}' alphabet mein '${ROOT}' ke baad aata hai → DAAYEIN (Right) jao!`,
    });
    discardedNodes.push("ayesha_malik", "bilal_ahmed", "dawood_khan", "fatima_noor");

    const branch = "sara_khan";
    visitedNodes.push(branch);

    if (targetUser === branch) {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "match",
        explanationEn: `Match found at '${branch}' in 2 hops!`,
        explanationUr: `Node '${branch}' par 2 hops mein mil gaya!`,
      });
      discardedNodes.push("mariam_yousuf", "usman_tariq", "zainab_qureshi");
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 2, timeMs: 0.6 };
    }

    if (targetUser < branch) {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "left",
        explanationEn: `'${targetUser}' < '${branch}' → Discard right, jump to Leaf [${targetUser}]!`,
        explanationUr: `'${targetUser}' < '${branch}' se pehle hai → Leaf [${targetUser}] par chhalang!`,
      });
      discardedNodes.push("usman_tariq", "zainab_qureshi");
      visitedNodes.push(targetUser);
      hops.push({
        nodeUser: targetUser,
        level: 2,
        decision: "match",
        explanationEn: `Match found in Leaf node [${targetUser}]!`,
        explanationUr: `Leaf node [${targetUser}] mein mil gaya!`,
      });
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 3, timeMs: 0.8 };
    } else {
      hops.push({
        nodeUser: branch,
        level: 1,
        decision: "right",
        explanationEn: `'${targetUser}' > '${branch}' → Discard left, jump to Leaf [${targetUser}]!`,
        explanationUr: `'${targetUser}' > '${branch}' ke baad hai → Leaf [${targetUser}] par chhalang!`,
      });
      discardedNodes.push("mariam_yousuf");
      visitedNodes.push(targetUser);
      hops.push({
        nodeUser: targetUser,
        level: 2,
        decision: "match",
        explanationEn: `Match found in Leaf node [${targetUser}]!`,
        explanationUr: `Leaf node [${targetUser}] mein mil gaya!`,
      });
      return { hops, visitedNodes, discardedNodes, matchingRows, totalHops: 3, timeMs: 0.8 };
    }
  }
}
