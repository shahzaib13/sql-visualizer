export interface PostRow {
  id: number;
  username: string;
  format: "image" | "video";
  likes_count: number;
  views_count: number;
}

export const POSTS: PostRow[] = [
  { id: 1, username: "shah_zaib", format: "image", likes_count: 120, views_count: 450 },
  { id: 2, username: "ozain", format: "video", likes_count: 850, views_count: 3200 },
  { id: 3, username: "shah_zaib", format: "image", likes_count: 45, views_count: 150 },
  { id: 4, username: "dawood", format: "image", likes_count: 1050, views_count: 4100 },
  { id: 5, username: "abdullah", format: "video", likes_count: 340, views_count: 1200 },
  { id: 6, username: "asjal", format: "image", likes_count: 78, views_count: 290 },
  { id: 7, username: "ozain", format: "image", likes_count: 55, views_count: 180 },
  { id: 8, username: "dawood", format: "video", likes_count: 420, views_count: 1500 },
];

export const TOGGLE_COLUMNS = [
  { key: "format", label: "format" },
  { key: "likes_count", label: "likes_count" },
  { key: "views_count", label: "views_count" },
] as const;

export type ToggleColumnKey = (typeof TOGGLE_COLUMNS)[number]["key"];
export const ORDERABLE_COLUMNS = ["likes_count", "views_count"] as const;
export type OrderableColumn = (typeof ORDERABLE_COLUMNS)[number];
