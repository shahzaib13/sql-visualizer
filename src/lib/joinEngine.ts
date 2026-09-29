import { POSTS, USERS, type PostRow, type UserRow } from "./data";

export const JOIN_TYPES = ["INNER", "LEFT"] as const;
export type JoinType = (typeof JOIN_TYPES)[number];

export const JOIN_STAGES = ["FROM", "JOIN", "SELECT"] as const;
export type JoinStage = (typeof JOIN_STAGES)[number];

export interface JoinedRow {
  key: string;
  user: UserRow;
  post: PostRow | null;
}

// FROM users u {joinType} JOIN posts p ON u.username = p.username — walks left-to-right like MySQL does.
export function joinRows(joinType: JoinType): JoinedRow[] {
  const rows: JoinedRow[] = [];
  for (const user of USERS) {
    const matches = POSTS.filter((p) => p.username === user.username);
    if (matches.length > 0) {
      matches.forEach((post) => rows.push({ key: user.username, user, post }));
    } else if (joinType === "LEFT") {
      rows.push({ key: user.username, user, post: null });
    }
  }
  return rows;
}

export function unmatchedUsers(): UserRow[] {
  return USERS.filter((u) => !POSTS.some((p) => p.username === u.username));
}
