import { POSTS, type PostRow } from "./data";

export const SUBQUERY_STAGES = ["FROM", "SUBQUERY", "WHERE", "SELECT"] as const;
export const COMPARE_OPS = [">", "<"] as const;
export type CompareOp = (typeof COMPARE_OPS)[number];

/** The inner query: SELECT AVG(likes_count) FROM posts — one number, computed once. */
export function subqueryAvgLikes(): number {
  const sum = POSTS.reduce((acc, r) => acc + r.likes_count, 0);
  return Math.round((sum / POSTS.length) * 10) / 10;
}

export interface SubqueryRowInfo {
  row: PostRow;
  included: boolean;
}

export function classifyBySubquery(op: CompareOp): SubqueryRowInfo[] {
  const avg = subqueryAvgLikes();
  return POSTS.map((row) => ({
    row,
    included: op === ">" ? row.likes_count > avg : row.likes_count < avg,
  }));
}
