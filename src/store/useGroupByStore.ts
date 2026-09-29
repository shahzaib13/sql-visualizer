import { create } from "zustand";
import type { AggFn, GroupCol, MetricCol } from "@/lib/groupByEngine";

interface GroupByState {
  stage: number;
  groupCol: GroupCol;
  metricCol: MetricCol;
  aggFn: AggFn;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setGroupCol: (col: GroupCol) => void;
  setMetricCol: (col: MetricCol) => void;
  setAggFn: (fn: AggFn) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  groupCol: "format" as GroupCol,
  metricCol: "likes_count" as MetricCol,
  aggFn: "COUNT" as AggFn,
};

export const useGroupByStore = create<GroupByState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setGroupCol: (groupCol) => set({ groupCol }),
  setMetricCol: (metricCol) => set({ metricCol }),
  setAggFn: (aggFn) => set({ aggFn }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
