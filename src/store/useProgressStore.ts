import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LevelId } from "./useAppStore";

interface ProgressState {
  visited: Partial<Record<LevelId, boolean>>;
  quizPassed: Partial<Record<LevelId, boolean>>;
  markVisited: (level: LevelId) => void;
  markQuizPassed: (level: LevelId) => void;
}

// The only persisted store — every other level's scrub state resets on reload on purpose.
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      visited: {},
      quizPassed: {},
      markVisited: (level) => set((s) => (s.visited[level] ? s : { visited: { ...s.visited, [level]: true } })),
      markQuizPassed: (level) =>
        set((s) => (s.quizPassed[level] ? s : { quizPassed: { ...s.quizPassed, [level]: true } })),
    }),
    { name: "qm-progress" },
  ),
);
