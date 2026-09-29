import type { LevelId } from "@/store/useAppStore";

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explain: string;
}

export const QUIZZES: Record<LevelId, QuizQuestion[]> = {
  filter: [
    {
      prompt: "MySQL runs a SELECT statement's clauses in a fixed order, no matter how you write them. Which one actually runs first?",
      choices: ["SELECT", "FROM", "ORDER BY", "LIMIT"],
      correctIndex: 1,
      explain: "FROM runs first — MySQL needs to know which table to read before it can filter, sort, or pick columns.",
    },
    {
      prompt: "WHERE likes_count > 400 removes some rows before ORDER BY runs. Can ORDER BY bring those rows back?",
      choices: ["Yes, if you sort by likes_count", "No — WHERE removes rows before ORDER BY ever sees them", "Only with LIMIT", "Only in newer MySQL versions"],
      correctIndex: 1,
      explain: "Once WHERE excludes a row, it's gone for the rest of the query — ORDER BY only ever sees the rows that survived.",
    },
  ],
  "group-by": [
    {
      prompt: "GROUP BY format collapses rows into buckets. What decides which bucket a row goes into?",
      choices: ["Its id", "Whether its format matches other rows' format", "Its likes_count", "The order it appears in the table"],
      correctIndex: 1,
      explain: "Rows with the same value in the GROUP BY column land in the same bucket — that's the whole rule.",
    },
    {
      prompt: "Does GROUP BY finish building its buckets before or after SELECT computes COUNT(*)?",
      choices: ["After", "Before", "At the same time", "Depends on the aggregate function"],
      correctIndex: 1,
      explain: "GROUP BY has to build the buckets first — SELECT then computes one aggregate value per bucket, not per row.",
    },
  ],
  having: [
    {
      prompt: "Why can't you write WHERE COUNT(*) > 2 to keep only groups with more than 2 posts?",
      choices: ["WHERE only works on numbers", "Groups don't exist yet when WHERE runs", "WHERE is faster than HAVING", "You'd need an index for that"],
      correctIndex: 1,
      explain: "WHERE runs before GROUP BY builds any groups, so there's nothing to check a group total against yet — that's exactly why HAVING exists.",
    },
    {
      prompt: "HAVING COUNT(*) > 2 rejects a group that only has 2 posts. What happens to those 2 rows?",
      choices: ["They get checked and filtered one by one", "The whole group — and every row in it — is dropped together", "They move into a different group", "Nothing changes for them"],
      correctIndex: 1,
      explain: "HAVING filters whole groups, not individual rows — a rejected group takes every row inside it down with it.",
    },
  ],
  join: [
    {
      prompt: "A user has zero posts. With INNER JOIN, what happens to that user's row?",
      choices: ["It appears once with NULL post columns", "It's dropped entirely — no match means no row", "It causes an error", "It appears once for every other user"],
      correctIndex: 1,
      explain: "INNER JOIN only keeps rows that have a match on both sides — no match means that row disappears completely.",
    },
    {
      prompt: "What actually changes if you switch that same query from INNER JOIN to LEFT JOIN?",
      choices: ["Nothing changes", "The unmatched user is now kept, with NULLs where the post columns would be", "Unmatched posts are now kept instead", "The join key changes"],
      correctIndex: 1,
      explain: "LEFT JOIN guarantees every row from the left (first) table survives — even with no match, just with empty columns on the right.",
    },
  ],
  "set-ops": [
    {
      prompt: "UNION combines two result sets. What does it do with a row that shows up in both?",
      choices: ["Shows it twice", "Shows it once — exact duplicates are removed", "Puts it in a separate group", "Throws an error"],
      correctIndex: 1,
      explain: "UNION treats the two result sets as one combined list and removes exact-duplicate rows, keeping just one copy.",
    },
    {
      prompt: "Which operator keeps rows from Query A that do NOT also appear in Query B?",
      choices: ["INTERSECT", "UNION", "EXCEPT", "JOIN"],
      correctIndex: 2,
      explain: "EXCEPT is a subtraction: everything in A, minus whatever also shows up in B.",
    },
  ],
  subquery: [
    {
      prompt: "In WHERE likes_count > (SELECT AVG(likes_count) FROM posts), which part does MySQL evaluate first?",
      choices: ["The outer WHERE", "The inner SELECT AVG(...)", "Both at the same time", "Whichever MySQL decides is faster"],
      correctIndex: 1,
      explain: "The outer WHERE can't be checked until it knows what number it's comparing against — so the inner query has to run first.",
    },
    {
      prompt: "What must a subquery return for it to be usable directly next to a > comparison, the way this one is?",
      choices: ["A full table", "A list of many values", "Exactly one value — one row, one column", "One value per outer row"],
      correctIndex: 2,
      explain: "That's what makes it a scalar subquery — exactly one value, so it can stand in anywhere a single number is expected.",
    },
  ],
};
