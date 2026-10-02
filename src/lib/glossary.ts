import type { Locale } from "@/lib/i18n/translations";

export const GLOSSARY_EN: Record<string, string> = {
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
  JOIN: "Combines rows from two separate tables into one wider row, matched on a shared column.",
  "INNER JOIN": "Keeps only the rows that have a match in both tables — anything unmatched, on either side, is dropped entirely.",
  "LEFT JOIN": "Keeps every row from the first (left) table no matter what — if there's no match on the right, those columns just come back empty.",
  ON: "The condition MySQL uses to decide which row from the first table belongs with which row from the second.",
  UNION: "Stacks the results of two SELECTs into one list and removes exact duplicate rows.",
  INTERSECT: "Keeps only the rows that show up in both SELECTs' results.",
  EXCEPT: "Keeps rows from the first SELECT that do NOT also appear in the second SELECT's results.",
  subquery: "A query nested inside another query. MySQL runs the inner one first and feeds its result into the outer query — as if it were typed there directly.",
  "scalar subquery": "A subquery that returns exactly one value — one row, one column — so it can stand in anywhere a single number is expected, like next to > or =.",
};

export const GLOSSARY_UR: Record<string, string> = {
  SELECT: "Chunta hai ke result mein kon se columns nazar aayein ge. Yeh aakhir mein chalta hai, halanke hum isay pehle likhte hain.",
  FROM: "Us table ka naam jahan se rows read karni hain — har query ka aaghaz yahin se hota hai.",
  WHERE: "Sirf un rows ko rakhta hai jo condition par poori utarti hain. Grouping ya sorting se pehle aik aik row ko check karta hai.",
  "GROUP BY": "Aik jesi column values wali rows ko aik group (bucket) mein ikatha karta hai, taake aap har group ka summary number nikal sakein.",
  HAVING: "WHERE jesa hi kaam karta hai, magar yeh GROUP BY ke baad banne walay pooray groups ko filter karta hai — WHERE aisa nahi kar sakta kyunke tab tak groups banay hi nahi hotay.",
  "ORDER BY": "Bachi hui rows ko tarteeb deta hai — chote se bara (ASC) ya baray se chota (DESC).",
  LIMIT: "Sorting ke baad sirf pehli N rows ko rakhta hai, aur baqi sab ko drop kar deta hai.",
  "COUNT(*)": "Ginta hai ke har group ya table mein kul kitni rows hain.",
  SUM: "Har group ke andar kisi column ki tamaam values ko jama karta hai.",
  AVG: "Har group ke andar kisi column ki values ka average (ausat) nikalta hai.",
  likes_count: "Is post par kitne likes hain.",
  views_count: "Is post ko kitni baar dekha gaya.",
  format: "Post image hai ya video.",
  username: "Kis user ne post kiya.",
  DESC: "Descending — barri value pehle.",
  ASC: "Ascending — choti value pehle.",
  index: "Column par aik aisi shortcut fehrist (jese kitaab ka index) jo MySQL ko seedha matching rows par le jati hai bajaye har row kholne ke.",
  JOIN: "Do alag tables ki rows ko shared matching column ki bunyad par jorh kar aik chori row banata hai.",
  "INNER JOIN": "Sirf un rows ko rakhta hai jo dono tables mein match karti hon — koi bhi unmatched row drop ho jati hai.",
  "LEFT JOIN": "Pehli (baayein) table ki har row ko lazmi rakhta hai — agar doosri table mein match na mile to khali (NULL) show karta hai.",
  ON: "Woh shart jis ki bunyad par MySQL faisla karta hai ke pehli table ki row doosri table ki kis row se jurti hai.",
  UNION: "Do SELECT queries ke nataij ko aik list mein mila deta hai aur duplicate rows ko nikaal deta hai.",
  INTERSECT: "Sirf un rows ko rakhta hai jo dono SELECT queries ke nataij mein aati hon.",
  EXCEPT: "Pehli query ki un rows ko rakhta hai jo doosri query ke result mein na hon.",
  subquery: "Aik query ke andar doosri nested query. MySQL pehle andar wali query chalata hai aur uska nateeja bahir wali query ko deta hai.",
  "scalar subquery": "Aisi subquery jo sirf 1 wahid value (1 row, 1 column) return karti hai, jese > ya = ke aagay lagai ja sakay.",
};

export const GLOSSARY = GLOSSARY_EN;

export function getGlossary(locale: Locale): Record<string, string> {
  return locale === "ur" ? GLOSSARY_UR : GLOSSARY_EN;
}

export type GlossaryTerm = keyof typeof GLOSSARY_EN;
