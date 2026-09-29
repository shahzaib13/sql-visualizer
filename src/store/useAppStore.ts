import { create } from "zustand";

export const LEVELS = [
  { id: "filter", label: "0 · Filter & sort", full: "WHERE, ORDER BY, LIMIT" },
  { id: "group-by", label: "1 · Group by", full: "GROUP BY, aggregates" },
  { id: "having", label: "2 · Having", full: "HAVING filters groups" },
  { id: "join", label: "3 · Join", full: "Combine two tables" },
  { id: "set-ops", label: "4 · Set ops", full: "UNION, INTERSECT, EXCEPT" },
  { id: "subquery", label: "5 · Subquery", full: "A query nested inside another" },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

interface AppState {
  currentLevel: LevelId;
  hoodOpen: boolean;
  setLevel: (level: LevelId) => void;
  toggleHood: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLevel: "filter",
  hoodOpen: true,
  setLevel: (currentLevel) => set({ currentLevel }),
  toggleHood: () => set((s) => ({ hoodOpen: !s.hoodOpen })),
}));
