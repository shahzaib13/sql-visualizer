export interface PostRow {
  id: number;
  username: string;
  format: "image" | "video";
  likes_count: number;
  views_count: number;
}

export const POSTS: PostRow[] = [
  { id: 1, username: "sara_khan", format: "image", likes_count: 210, views_count: 780 },
  { id: 2, username: "bilal_ahmed", format: "video", likes_count: 630, views_count: 2400 },
  { id: 3, username: "sara_khan", format: "video", likes_count: 95, views_count: 340 },
  { id: 4, username: "hamza_raza", format: "image", likes_count: 1080, views_count: 4200 },
  { id: 5, username: "ayesha_malik", format: "video", likes_count: 460, views_count: 1700 },
  { id: 6, username: "usman_tariq", format: "image", likes_count: 58, views_count: 210 },
  { id: 7, username: "bilal_ahmed", format: "image", likes_count: 340, views_count: 1250 },
  { id: 8, username: "zainab_qureshi", format: "video", likes_count: 720, views_count: 2900 },
  { id: 9, username: "hamza_raza", format: "video", likes_count: 150, views_count: 560 },
  { id: 10, username: "mariam_yousuf", format: "image", likes_count: 890, views_count: 3400 },
  { id: 11, username: "usman_tariq", format: "video", likes_count: 275, views_count: 990 },
  { id: 12, username: "ayesha_malik", format: "image", likes_count: 40, views_count: 130 },
  { id: 13, username: "dawood_khan", format: "image", likes_count: 610, views_count: 2200 },
  { id: 14, username: "sara_khan", format: "image", likes_count: 480, views_count: 1800 },
  { id: 15, username: "fatima_noor", format: "video", likes_count: 990, views_count: 3900 },
  { id: 16, username: "bilal_ahmed", format: "video", likes_count: 200, views_count: 750 },
  { id: 17, username: "zainab_qureshi", format: "image", likes_count: 65, views_count: 240 },
  { id: 18, username: "hamza_raza", format: "image", likes_count: 350, views_count: 1300 },
  { id: 19, username: "mariam_yousuf", format: "video", likes_count: 120, views_count: 430 },
  { id: 20, username: "usman_tariq", format: "image", likes_count: 800, views_count: 3100 },
];

export const TOGGLE_COLUMNS = [
  { key: "format", label: "format" },
  { key: "likes_count", label: "likes_count" },
  { key: "views_count", label: "views_count" },
] as const;

export type ToggleColumnKey = (typeof TOGGLE_COLUMNS)[number]["key"];
export const ORDERABLE_COLUMNS = ["likes_count", "views_count"] as const;
export type OrderableColumn = (typeof ORDERABLE_COLUMNS)[number];

export interface UserRow {
  username: string;
  full_name: string;
  country: string;
}

// One row per distinct POSTS.username, plus zara_iqbal — who has never posted —
// so INNER vs LEFT JOIN has something real to show: INNER drops her, LEFT keeps
// her with NULL post columns.
export const USERS: UserRow[] = [
  { username: "sara_khan", full_name: "Sara Khan", country: "Pakistan" },
  { username: "bilal_ahmed", full_name: "Bilal Ahmed", country: "UAE" },
  { username: "hamza_raza", full_name: "Hamza Raza", country: "Pakistan" },
  { username: "ayesha_malik", full_name: "Ayesha Malik", country: "UK" },
  { username: "usman_tariq", full_name: "Usman Tariq", country: "Pakistan" },
  { username: "zainab_qureshi", full_name: "Zainab Qureshi", country: "Canada" },
  { username: "mariam_yousuf", full_name: "Mariam Yousuf", country: "Pakistan" },
  { username: "dawood_khan", full_name: "Dawood Khan", country: "USA" },
  { username: "fatima_noor", full_name: "Fatima Noor", country: "Pakistan" },
  { username: "zara_iqbal", full_name: "Zara Iqbal", country: "Pakistan" },
];
