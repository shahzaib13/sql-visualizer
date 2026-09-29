import { create } from "zustand";
import type { OrderableColumn, ToggleColumnKey } from "@/lib/data";

export type OutputFilter = "all" | "included" | "excluded" | "cut";

interface QueryState {
  stage: number;
  threshold: number;
  selectedCols: ToggleColumnKey[];
  orderCol: OrderableColumn;
  orderDir: "ASC" | "DESC";
  limit: number;
  simIndex: boolean;
  filter: OutputFilter;
  isPlaying: boolean;

  setStage: (stage: number) => void;
  setThreshold: (threshold: number) => void;
  toggleColumn: (key: ToggleColumnKey) => void;
  setOrderCol: (col: OrderableColumn) => void;
  toggleOrderDir: () => void;
  setLimit: (limit: number | ((prev: number) => number)) => void;
  setSimIndex: (on: boolean) => void;
  setFilter: (filter: OutputFilter) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  stage: 0,
  threshold: 400,
  selectedCols: ["likes_count", "views_count"] as ToggleColumnKey[],
  orderCol: "likes_count" as OrderableColumn,
  orderDir: "DESC" as const,
  limit: 5,
  simIndex: false,
  filter: "all" as OutputFilter,
};

export const useQueryStore = create<QueryState>((set) => ({
  ...DEFAULTS,
  isPlaying: false,

  setStage: (stage) => set({ stage, isPlaying: false }),
  setThreshold: (threshold) => set({ threshold }),
  toggleColumn: (key) =>
    set((s) => ({
      selectedCols: s.selectedCols.includes(key)
        ? s.selectedCols.filter((c) => c !== key)
        : [...s.selectedCols, key],
    })),
  setOrderCol: (orderCol) => set({ orderCol }),
  toggleOrderDir: () => set((s) => ({ orderDir: s.orderDir === "DESC" ? "ASC" : "DESC" })),
  setLimit: (limit) =>
    set((s) => ({
      limit: Math.min(8, Math.max(1, typeof limit === "function" ? limit(s.limit) : limit)),
    })),
  setSimIndex: (simIndex) => set({ simIndex }),
  setFilter: (filter) => set({ filter }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ ...DEFAULTS, isPlaying: false }),
}));
