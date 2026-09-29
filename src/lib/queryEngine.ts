import { POSTS, type OrderableColumn, type PostRow, type ToggleColumnKey } from "./data";

export const STAGES = ["FROM", "WHERE", "SELECT", "ORDER BY", "LIMIT"] as const;
export type Stage = (typeof STAGES)[number];

export type RowKind = "neutral" | "included" | "cut" | "excluded";

export interface RowInfo {
  row: PostRow;
  rank: number;
  kind: RowKind;
}

export interface ClassifyParams {
  stage: number;
  threshold: number;
  orderCol: OrderableColumn;
  orderDir: "ASC" | "DESC";
  limit: number;
}

export interface ClassifyResult {
  byId: Map<number, RowInfo>;
  excludedCount: number;
  includedCount: number;
  cutCount: number;
}

/** Single source of truth: every panel (output list, hood diagrams, disk pages) derives from this. */
export function classify({ stage, threshold, orderCol, orderDir, limit }: ClassifyParams): ClassifyResult {
  const passing = POSTS.filter((r) => stage < 1 || r.likes_count > threshold);
  const excluded = stage >= 1 ? POSTS.filter((r) => r.likes_count <= threshold) : [];

  const dir = orderDir === "DESC" ? -1 : 1;
  const ordered = [...passing].sort(
    stage >= 3 ? (a, b) => (a[orderCol] - b[orderCol]) * dir : (a, b) => a.id - b.id,
  );

  const showCut = stage >= 4 && ordered.length > limit;
  const byId = new Map<number, RowInfo>();

  ordered.forEach((row, i) => {
    const isCut = showCut && i >= limit;
    byId.set(row.id, {
      row,
      rank: i,
      kind: isCut ? "cut" : stage >= 1 ? "included" : "neutral",
    });
  });
  excluded.forEach((row) => byId.set(row.id, { row, rank: -1, kind: "excluded" }));

  let includedCount = 0;
  let cutCount = 0;
  byId.forEach((v) => {
    if (v.kind === "included") includedCount++;
    if (v.kind === "cut") cutCount++;
  });

  return { byId, excludedCount: excluded.length, includedCount, cutCount };
}

export function passingCount(threshold: number): number {
  return POSTS.filter((r) => r.likes_count > threshold).length;
}

export function selectColsText(selectedCols: ToggleColumnKey[]): string {
  const order: string[] = ["username", "format", "likes_count", "views_count"];
  return order.filter((c) => c === "username" || selectedCols.includes(c as ToggleColumnKey)).join(", ");
}
