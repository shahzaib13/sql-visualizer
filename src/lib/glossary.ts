export const GLOSSARY: Record<string, string> = {
  SELECT: "Picks which columns show up in the result. It runs last, even though we write it first.",
  FROM: "Names the table to read rows from — the starting point of every query.",
  WHERE: "Keeps only the rows that match a condition. Checked one row at a time, before grouping or sorting.",
  "GROUP BY": "Collapses rows that share the same value in a column into a single group, so you can summarize each group.",
  HAVING: "Same idea as WHERE, but it filters whole groups after GROUP BY — WHERE can't do this because groups don't exist yet when WHERE runs.",
  "ORDER BY": "Sorts the rows that are left, either smallest-to-largest (ASC) or largest-to-smallest (DESC).",
  LIMIT: "Keeps only the first N rows after sorting, and throws the rest away.",
  "COUNT(*)": "Counts how many rows are in each group.",
  SUM: "Adds up a column's values within each group.",
  AVG: "Averages a column's values within each group.",
  likes_count: "How many likes that post has.",
  views_count: "How many times that post was viewed.",
  format: "Whether the post is an image or a video.",
  username: "Who posted it.",
  DESC: "Descending — biggest value first.",
  ASC: "Ascending — smallest value first.",
  index: "A shortcut list MySQL can build on a column — like a book's index — so it can jump straight to matching rows instead of opening every single one.",
};

export type GlossaryTerm = keyof typeof GLOSSARY;
