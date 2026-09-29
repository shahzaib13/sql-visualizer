import { POSTS, type PostRow } from "./data";

export const GROUP_COLUMNS = ["format", "username"] as const;
export type GroupCol = (typeof GROUP_COLUMNS)[number];

export const METRIC_COLUMNS = ["likes_count", "views_count"] as const;
export type MetricCol = (typeof METRIC_COLUMNS)[number];

export const AGG_FNS = ["COUNT", "SUM", "AVG"] as const;
export type AggFn = (typeof AGG_FNS)[number];

export const GB_STAGES = ["FROM", "GROUP BY", "SELECT"] as const;
export type GbStage = (typeof GB_STAGES)[number];

export interface GroupResult {
  key: string;
  rows: PostRow[];
  value: number;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function groupRows(groupCol: GroupCol, metricCol: MetricCol, aggFn: AggFn): GroupResult[] {
  const buckets = new Map<string, PostRow[]>();
  for (const row of POSTS) {
    const key = String(row[groupCol]);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  return [...buckets.entries()]
    .map(([key, rows]) => {
      let value: number;
      if (aggFn === "COUNT") {
        value = rows.length;
      } else {
        const sum = rows.reduce((acc, r) => acc + r[metricCol], 0);
        value = aggFn === "SUM" ? sum : sum / rows.length;
      }
      return { key, rows, value: round1(value) };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function aggLabel(aggFn: AggFn, metricCol: MetricCol) {
  return aggFn === "COUNT" ? "COUNT(*)" : `${aggFn}(${metricCol})`;
}
