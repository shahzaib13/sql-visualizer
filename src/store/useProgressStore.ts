import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LevelId } from "./useAppStore";

interface ProgressState {
  visited: Partial<Record<LevelId, boolean>>;
  quizPassed: Partial<Record<LevelId, boolean>>;
  onboardingDismissed: boolean;
  seenTerms: Record<string, boolean>;
  markVisited: (level: LevelId) => void;
  markQuizPassed: (level: LevelId) => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;
  markTermSeen: (term: string) => void;
}

// The only persisted store — every other level's scrub state resets on reload on purpose.
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      visited: {},
      quizPassed: {},
      onboardingDismissed: false,
      seenTerms: {},
      markVisited: (level) => set((s) => (s.visited[level] ? s : { visited: { ...s.visited, [level]: true } })),
      markQuizPassed: (level) =>
        set((s) => (s.quizPassed[level] ? s : { quizPassed: { ...s.quizPassed, [level]: true } })),
      dismissOnboarding: () => set({ onboardingDismissed: true }),
      resetOnboarding: () => set({ onboardingDismissed: false }),
      markTermSeen: (term) =>
        set((s) => (s.seenTerms[term] ? s : { seenTerms: { ...s.seenTerms, [term]: true } })),
    }),
    { name: "qm-progress" },
  ),
);
