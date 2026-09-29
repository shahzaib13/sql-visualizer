import { create } from "zustand";
import type { SetOp } from "@/lib/setOpsEngine";

interface SetOpsState {
  stage: number;
  op: SetOp;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setOp: (op: SetOp) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  op: "UNION" as SetOp,
};

export const useSetOpsStore = create<SetOpsState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setOp: (op) => set({ op }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
