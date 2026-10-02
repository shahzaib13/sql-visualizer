import { create } from "zustand";
import type { IndexStatus } from "@/lib/indexEngine";

interface IndexState {
  indexStatus: IndexStatus;
  targetUser: string;
  stage: number;

  setIndexStatus: (indexStatus: IndexStatus) => void;
  setTargetUser: (targetUser: string) => void;
  setStage: (stage: number) => void;
  toggleIndex: () => void;
  reset: () => void;
}

export const useIndexStore = create<IndexState>((set) => ({
  indexStatus: "btree",
  targetUser: "sara_khan",
  stage: 0,

  setIndexStatus: (indexStatus) => set({ indexStatus, stage: 0 }),
  setTargetUser: (targetUser) => set({ targetUser, stage: 0 }),
  setStage: (stage) => set({ stage }),
  toggleIndex: () =>
    set((s) => ({
      indexStatus: s.indexStatus === "btree" ? "none" : "btree",
      stage: 0,
    })),
  reset: () =>
    set({
      indexStatus: "btree",
      targetUser: "sara_khan",
      stage: 0,
    }),
}));
