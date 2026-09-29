import { POSTS, type PostRow } from "./data";

export const SET_OPS = ["UNION", "INTERSECT", "EXCEPT"] as const;
export type SetOp = (typeof SET_OPS)[number];

export const SETOPS_STAGES = ["QUERY A", "QUERY B", "COMBINE"] as const;

// Fixed, simple conditions on purpose — this level teaches how two result
// sets combine, not another round of tunable filters.
export function queryA(): PostRow[] {
  return POSTS.filter((p) => p.format === "video");
}

export function queryB(): PostRow[] {
  return POSTS.filter((p) => p.likes_count > 400);
}

export function combine(op: SetOp): PostRow[] {
  const a = queryA();
  const b = queryB();
  const bIds = new Set(b.map((r) => r.id));

  if (op === "INTERSECT") return a.filter((r) => bIds.has(r.id));
  if (op === "EXCEPT") return a.filter((r) => !bIds.has(r.id));

  // UNION: everything from both, exact-duplicate rows (same id) collapsed to one.
  const seen = new Set<number>();
  const result: PostRow[] = [];
  for (const r of [...a, ...b]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      result.push(r);
    }
  }
  return result.sort((x, y) => x.id - y.id);
}

export interface SetRegions {
  aOnly: PostRow[];
  overlap: PostRow[];
  bOnly: PostRow[];
}

export function regions(): SetRegions {
  const a = queryA();
  const b = queryB();
  const bIds = new Set(b.map((r) => r.id));
  const aIds = new Set(a.map((r) => r.id));
  return {
    aOnly: a.filter((r) => !bIds.has(r.id)),
    overlap: a.filter((r) => bIds.has(r.id)),
    bOnly: b.filter((r) => !aIds.has(r.id)),
  };
}
