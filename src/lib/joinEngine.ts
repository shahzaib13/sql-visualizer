import { POSTS, USERS, type PostRow, type UserRow } from "./data";

export const JOIN_TYPES = ["INNER", "LEFT", "RIGHT", "FULL OUTER", "CROSS"] as const;
export type JoinType = (typeof JOIN_TYPES)[number];

export const JOIN_STAGES = ["FROM", "JOIN", "SELECT"] as const;
export type JoinStage = (typeof JOIN_STAGES)[number];

export interface JoinedRow {
  key: string;
  user: UserRow | null;
  post: PostRow | null;
}

// Walks left-to-right like MySQL does for each JOIN type
export function joinRows(joinType: JoinType): JoinedRow[] {
  const rows: JoinedRow[] = [];

  if (joinType === "CROSS") {
    // Cartesian product: every user paired with every post
    for (const user of USERS) {
      for (const post of POSTS) {
        rows.push({ key: `${user.username}-${post.id}`, user, post });
      }
    }
    return rows;
  }

  if (joinType === "INNER") {
    for (const user of USERS) {
      const matches = POSTS.filter((p) => p.username === user.username);
      matches.forEach((post) => rows.push({ key: `${user.username}-${post.id}`, user, post }));
    }
    return rows;
  }

  if (joinType === "LEFT") {
    for (const user of USERS) {
      const matches = POSTS.filter((p) => p.username === user.username);
      if (matches.length > 0) {
        matches.forEach((post) => rows.push({ key: `${user.username}-${post.id}`, user, post }));
      } else {
        rows.push({ key: `${user.username}-null`, user, post: null });
      }
    }
    return rows;
  }

  if (joinType === "RIGHT") {
    // All posts from right table
    for (const post of POSTS) {
      const user = USERS.find((u) => u.username === post.username) ?? null;
      rows.push({ key: `${user?.username ?? "null"}-${post.id}`, user, post });
    }
    return rows;
  }

  if (joinType === "FULL OUTER") {
    // All users + all posts (matching + left unmatched + right unmatched)
    const matchedPostIds = new Set<number>();
    for (const user of USERS) {
      const matches = POSTS.filter((p) => p.username === user.username);
      if (matches.length > 0) {
        matches.forEach((post) => {
          matchedPostIds.add(post.id);
          rows.push({ key: `${user.username}-${post.id}`, user, post });
        });
      } else {
        rows.push({ key: `${user.username}-null`, user, post: null });
      }
    }
    for (const post of POSTS) {
      if (!matchedPostIds.has(post.id)) {
        rows.push({ key: `null-${post.id}`, user: null, post });
      }
    }
    return rows;
  }

  return rows;
}

export function unmatchedUsers(): UserRow[] {
  return USERS.filter((u) => !POSTS.some((p) => p.username === u.username));
}
