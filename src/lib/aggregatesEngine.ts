import { POSTS, type PostRow } from "./data";

export const AGG_FUNCTIONS = ["DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX"] as const;
export type AggFunction = (typeof AGG_FUNCTIONS)[number];

export const AGG_STAGES = ["FROM", "SCAN & COMPUTE", "SELECT"] as const;
export type AggStage = (typeof AGG_STAGES)[number];

export const NUMERIC_COLUMNS = ["likes_count", "views_count"] as const;
export type NumericCol = (typeof NUMERIC_COLUMNS)[number];

export const DISTINCT_COLUMNS = ["format", "username"] as const;
export type DistinctCol = (typeof DISTINCT_COLUMNS)[number];

export interface DistinctRowInfo {
  row: PostRow;
  val: string;
  isDuplicate: boolean;
  firstSeenPostId: number;
}

export interface DistinctResult {
  uniqueValues: { value: string; count: number }[];
  stream: DistinctRowInfo[];
}

export function computeDistinct(col: DistinctCol): DistinctResult {
  const seen = new Set<string>();
  const firstSeenMap = new Map<string, number>();
  const counts = new Map<string, number>();
  const stream: DistinctRowInfo[] = [];

  for (const row of POSTS) {
    const val = String(row[col]);
    const isDup = seen.has(val);
    if (!isDup) {
      seen.add(val);
      firstSeenMap.set(val, row.id);
    }
    counts.set(val, (counts.get(val) || 0) + 1);
    stream.push({
      row,
      val,
      isDuplicate: isDup,
      firstSeenPostId: firstSeenMap.get(val)!,
    });
  }

  const uniqueValues = Array.from(counts.entries()).map(([value, count]) => ({
    value,
    count,
  }));

  return { uniqueValues, stream };
}

export interface NumericScanRowInfo {
  row: PostRow;
  val: number;
  runningTotal: number;
  runningMin: number;
  runningMax: number;
  isCurrentMin: boolean;
  isCurrentMax: boolean;
}

export function computeNumericScan(col: NumericCol) {
  let running = 0;
  let runningMin = Infinity;
  let runningMax = -Infinity;
  let minRow: PostRow = POSTS[0];
  let maxRow: PostRow = POSTS[0];

  const stream: NumericScanRowInfo[] = [];

  for (const row of POSTS) {
    const val = row[col];
    running += val;
    const isMin = val < runningMin;
    const isMax = val > runningMax;
    if (isMin) {
      runningMin = val;
      minRow = row;
    }
    if (isMax) {
      runningMax = val;
      maxRow = row;
    }

    stream.push({
      row,
      val,
      runningTotal: running,
      runningMin,
      runningMax,
      isCurrentMin: isMin,
      isCurrentMax: isMax,
    });
  }

  const totalSum = running;
  const count = POSTS.length;
  const avg = Math.round((totalSum / count) * 10) / 10;
  const minVal = runningMin;
  const maxVal = runningMax;

  return {
    stream,
    totalSum,
    count,
    avg,
    minVal,
    minRow,
    maxVal,
    maxRow,
  };
}
