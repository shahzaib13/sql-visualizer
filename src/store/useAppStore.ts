import { create } from "zustand";
import type { Locale } from "@/lib/i18n/translations";

export const LEVELS = [
  { id: "filter", label: "0 · Filter & sort", full: "WHERE, ORDER BY, LIMIT" },
  { id: "aggregates", label: "1 · Aggregates & Distinct", full: "DISTINCT, COUNT, SUM, AVG, MIN, MAX" },
  { id: "group-by", label: "2 · Group by", full: "GROUP BY, aggregates" },
  { id: "having", label: "3 · Having", full: "HAVING filters groups" },
  { id: "join", label: "4 · Join", full: "Combine two tables" },
  { id: "set-ops", label: "5 · Set ops", full: "UNION, INTERSECT, EXCEPT" },
  { id: "subquery", label: "6 · Subquery", full: "A query nested inside another" },
  { id: "index", label: "7 · Index & B-Tree", full: "CREATE INDEX, Seek vs Scan, Read/Write Cost" },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

interface AppState {
  currentLevel: LevelId;
  locale: Locale;
  setLevel: (level: LevelId) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLevel: "filter",
  locale: "ur",
  setLevel: (currentLevel) => set({ currentLevel }),
  setLocale: (locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sqlviz_locale", locale);
    }
    set({ locale });
  },
  toggleLocale: () =>
    set((s) => {
      const next = s.locale === "ur" ? "en" : "ur";
      if (typeof window !== "undefined") {
        localStorage.setItem("sqlviz_locale", next);
      }
      return { locale: next };
    }),
}));
