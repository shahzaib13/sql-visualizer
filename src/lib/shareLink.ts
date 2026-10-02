import { useAggregatesStore } from "@/store/useAggregatesStore";
import { useAppStore, type LevelId } from "@/store/useAppStore";
import { useGroupByStore } from "@/store/useGroupByStore";
import { useHavingStore } from "@/store/useHavingStore";
import { useJoinStore } from "@/store/useJoinStore";
import { useQueryStore } from "@/store/useQueryStore";
import { useSetOpsStore } from "@/store/useSetOpsStore";
import { useSubqueryStore } from "@/store/useSubqueryStore";
import { useIndexStore } from "@/store/useIndexStore";

// Explicit field lists per level — not a blind spread of getState() — so a
// shared link carries only the tunable knobs, never stale/dead store fields.
const SHAREABLE_FIELDS: Record<LevelId, readonly string[]> = {
  filter: ["stage", "threshold", "selectedCols", "orderCol", "orderDir", "limit", "simIndex", "filter"],
  aggregates: ["stage", "func", "numericCol", "distinctCol", "countMode"],
  "group-by": ["stage", "groupCol", "metricCol", "aggFn"],
  having: ["stage", "groupCol", "metricCol", "aggFn", "havingOp", "havingValue"],
  join: ["stage", "joinType"],
  "set-ops": ["stage", "op"],
  subquery: ["stage", "op"],
  index: ["stage", "mode", "indexStatus", "targetLikes", "writeLikes"],
};

const STORE_BY_LEVEL: Record<LevelId, { getState: () => object; setState: (s: object) => void }> = {
  filter: useQueryStore,
  aggregates: useAggregatesStore,
  "group-by": useGroupByStore,
  having: useHavingStore,
  join: useJoinStore,
  "set-ops": useSetOpsStore,
  subquery: useSubqueryStore,
  index: useIndexStore,
};

function pick(obj: Record<string, unknown>, keys: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

export function buildShareUrl(): string {
  const level = useAppStore.getState().currentLevel;
  const state = pick(STORE_BY_LEVEL[level].getState() as Record<string, unknown>, SHAREABLE_FIELDS[level]);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("level", level);
  url.searchParams.set("state", JSON.stringify(state));
  return url.toString();
}

export function applyShareUrlIfPresent() {
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") as LevelId | null;
  const stateParam = params.get("state");
  if (!level || !stateParam || !STORE_BY_LEVEL[level]) return;

  try {
    const parsed = JSON.parse(stateParam);
    STORE_BY_LEVEL[level].setState(parsed);
    useAppStore.getState().setLevel(level);
  } catch {
    // Malformed or outdated link — ignore silently rather than crash the app.
  }
}
