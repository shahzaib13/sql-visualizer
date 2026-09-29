import { create } from "zustand";
import type { JoinType } from "@/lib/joinEngine";

interface JoinState {
  stage: number;
  joinType: JoinType;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setJoinType: (type: JoinType) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  joinType: "INNER" as JoinType,
};

export const useJoinStore = create<JoinState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setJoinType: (joinType) => set({ joinType }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
