import { groupRows, type AggFn, type GroupCol, type GroupResult, type MetricCol } from "./groupByEngine";

export const HAVING_OPS = [">", ">=", "<", "<="] as const;
export type HavingOp = (typeof HAVING_OPS)[number];

export const HV_STAGES = ["FROM", "GROUP BY", "HAVING", "SELECT"] as const;

export interface HavingGroupResult extends GroupResult {
  passes: boolean;
}

function compare(a: number, op: HavingOp, b: number): boolean {
  switch (op) {
    case ">":
      return a > b;
    case ">=":
      return a >= b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
  }
}

export function evaluateHaving(
  groupCol: GroupCol,
  metricCol: MetricCol,
  aggFn: AggFn,
  op: HavingOp,
  value: number,
): HavingGroupResult[] {
  return groupRows(groupCol, metricCol, aggFn).map((g) => ({ ...g, passes: compare(g.value, op, value) }));
}
