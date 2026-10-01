import { create } from "zustand";

export const LEVELS = [
  { id: "filter", label: "0 · Filter & sort", full: "WHERE, ORDER BY, LIMIT" },
  { id: "aggregates", label: "1 · Aggregates & Distinct", full: "DISTINCT, COUNT, SUM, AVG, MIN, MAX" },
  { id: "group-by", label: "2 · Group by", full: "GROUP BY, aggregates" },
  { id: "having", label: "3 · Having", full: "HAVING filters groups" },
  { id: "join", label: "4 · Join", full: "Combine two tables" },
  { id: "set-ops", label: "5 · Set ops", full: "UNION, INTERSECT, EXCEPT" },
  { id: "subquery", label: "6 · Subquery", full: "A query nested inside another" },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

interface AppState {
  currentLevel: LevelId;
  setLevel: (level: LevelId) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLevel: "filter",
  setLevel: (currentLevel) => set({ currentLevel }),
}));
