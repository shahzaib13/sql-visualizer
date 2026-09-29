import { create } from "zustand";
import type { AggFn, GroupCol, MetricCol } from "@/lib/groupByEngine";
import type { HavingOp } from "@/lib/havingEngine";

interface HavingState {
  stage: number;
  groupCol: GroupCol;
  metricCol: MetricCol;
  aggFn: AggFn;
  havingOp: HavingOp;
  havingValue: number;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setGroupCol: (col: GroupCol) => void;
  setMetricCol: (col: MetricCol) => void;
  setAggFn: (fn: AggFn) => void;
  setHavingOp: (op: HavingOp) => void;
  setHavingValue: (value: number) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  groupCol: "username" as GroupCol,
  metricCol: "likes_count" as MetricCol,
  aggFn: "COUNT" as AggFn,
  havingOp: ">" as HavingOp,
  havingValue: 1,
};

export const useHavingStore = create<HavingState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setGroupCol: (groupCol) => set({ groupCol }),
  setMetricCol: (metricCol) => set({ metricCol }),
  setAggFn: (aggFn) => set({ aggFn }),
  setHavingOp: (havingOp) => set({ havingOp }),
  setHavingValue: (havingValue) => set({ havingValue }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
