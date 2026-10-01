import { create } from "zustand";
import type {
  AggFunction,
  NumericCol,
  DistinctCol,
} from "@/lib/aggregatesEngine";

interface AggregatesState {
  stage: number;
  func: AggFunction;
  numericCol: NumericCol;
  distinctCol: DistinctCol;
  countMode: "*" | "DISTINCT format" | "likes_count";
  setStage: (stage: number) => void;
  setFunc: (func: AggFunction) => void;
  setNumericCol: (col: NumericCol) => void;
  setDistinctCol: (col: DistinctCol) => void;
  setCountMode: (mode: "*" | "DISTINCT format" | "likes_count") => void;
  reset: () => void;
}

export const useAggregatesStore = create<AggregatesState>((set) => ({
  stage: 0,
  func: "SUM",
  numericCol: "likes_count",
  distinctCol: "format",
  countMode: "*",
  setStage: (stage) => set({ stage }),
  setFunc: (func) => set({ func, stage: 0 }),
  setNumericCol: (numericCol) => set({ numericCol, stage: 0 }),
  setDistinctCol: (distinctCol) => set({ distinctCol, stage: 0 }),
  setCountMode: (countMode) => set({ countMode, stage: 0 }),
  reset: () =>
    set({
      stage: 0,
      func: "SUM",
      numericCol: "likes_count",
      distinctCol: "format",
      countMode: "*",
    }),
}));
