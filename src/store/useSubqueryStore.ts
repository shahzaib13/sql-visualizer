import { create } from "zustand";
import type { CompareOp } from "@/lib/subqueryEngine";

interface SubqueryState {
  stage: number;
  op: CompareOp;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setOp: (op: CompareOp) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  op: ">" as CompareOp,
};

export const useSubqueryStore = create<SubqueryState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setOp: (op) => set({ op }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
