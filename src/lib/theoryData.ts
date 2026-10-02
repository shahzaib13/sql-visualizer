import type { LevelId } from "@/store/useAppStore";
import type { Locale } from "@/lib/i18n/translations";
import { getGlossary } from "@/lib/glossary";

export interface TheoryKeywordItem {
  term: string;
  note: string;
}

export interface LevelTheoryData {
  goal: string;
  keywords: TheoryKeywordItem[];
}

const THEORY_DATA_EN: Record<LevelId, (glossary: Record<string, string>) => LevelTheoryData> = {
  filter: (g) => ({
    goal: "Library Analogy: Think of MySQL like visiting a vast library. FROM is finding the right bookshelf ('posts'). WHERE is the librarian tossing out books that don't meet your criteria before you read them. SELECT is pulling the exact fields you asked for. ORDER BY stacks the remaining books by popularity, and LIMIT is carrying home only the top few.",
    keywords: [
      { term: "SELECT", note: g["SELECT"] },
      { term: "FROM", note: g["FROM"] },
      { term: "WHERE", note: g["WHERE"] },
      { term: "ORDER BY", note: g["ORDER BY"] },
      { term: "LIMIT", note: g["LIMIT"] },
    ],
  }),

  aggregates: () => ({
    goal: "Library Analogy: Think of aggregate functions (SUM, AVG, MIN, MAX, COUNT) like a blender or calculator: they take all 20 rows and condense them into a single summary number. DISTINCT acts like a bouncer at a club door: if a value was already seen, the duplicate is thrown out, leaving only unique entries.",
    keywords: [
      {
        term: "DISTINCT",
        note: "Eliminates duplicate values from a column so each unique value appears only once.",
      },
      {
        term: "COUNT(*)",
        note: "Counts total rows returned by the query.",
      },
      {
        term: "SUM(col)",
        note: "Adds all numbers in the specified column together into a single total.",
      },
      {
        term: "AVG(col)",
        note: "Calculates the arithmetic average: SUM(col) ÷ COUNT(*).",
      },
      {
        term: "MIN / MAX",
        note: "Finds the lowest (MIN) or highest (MAX) value across all rows.",
      },
    ],
  }),

  "group-by": (g) => ({
    goal: "Library Analogy: In our library, GROUP BY is sorting books into different piles by category (e.g. by format: image vs video). Once sorted into distinct piles, aggregate functions like COUNT() or AVG() calculate one summary number for each pile, rather than for each individual book.",
    keywords: [
      { term: "GROUP BY", note: g["GROUP BY"] },
      { term: "COUNT(*)", note: g["COUNT(*)"] },
      { term: "SUM", note: g["SUM"] },
      { term: "AVG", note: g["AVG"] },
    ],
  }),

  having: (g) => ({
    goal: "Library Analogy: Think of a librarian inspecting the filled genre bins: only bins holding at least 3 books are kept for the display cart, while sparse bins get wheeled away. HAVING runs strictly after GROUP BY — WHERE inspects individual index cards before binning, but HAVING inspects the summarized bins after tallying.",
    keywords: [
      { term: "GROUP BY", note: g["GROUP BY"] },
      { term: "HAVING", note: g["HAVING"] },
      { term: "COUNT(*)", note: g["COUNT(*)"] },
    ],
  }),

  join: (g) => ({
    goal: "Library Analogy: Think of a librarian holding two separate stacks of index cards: Borrower Cards (users) and Checkout Slips (posts). For every borrower card, the librarian cross-references checkout slips matching that card's member ID. In an INNER JOIN, borrowers with zero checkouts (like Zara) are dropped. In a LEFT JOIN, every borrower is kept, stapling a blank checkout slip if they haven't borrowed anything.",
    keywords: [
      { term: "JOIN", note: g["JOIN"] },
      { term: "INNER JOIN", note: g["INNER JOIN"] },
      { term: "LEFT JOIN", note: g["LEFT JOIN"] },
      { term: "ON", note: g["ON"] },
    ],
  }),

  "set-ops": (g) => ({
    goal: "Library Analogy: Think of two teachers submitting recommended reading lists to the library: Teacher A (all video-related materials) and Teacher B (all high-impact items with 400+ likes). UNION combines both recommendation slips while discarding duplicates so no book is bought twice. INTERSECT finds books on both teachers' wishlists. EXCEPT keeps Teacher A's picks unless Teacher B already recommended them.",
    keywords: [
      { term: "UNION", note: g["UNION"] },
      { term: "INTERSECT", note: g["INTERSECT"] },
      { term: "EXCEPT", note: g["EXCEPT"] },
    ],
  }),

  subquery: (g) => ({
    goal: "Library Analogy: Think of a visitor asking the librarian a question that requires solving another question first: 'Bring me all books that are thicker than the library's average book.' The librarian can't check any single book until they first calculate the overall average across the entire catalog (312 likes). Once that inner number is known, the librarian returns to the shelves and compares each book against it.",
    keywords: [
      { term: "subquery", note: g["subquery"] },
      { term: "scalar subquery", note: g["scalar subquery"] },
      { term: "AVG", note: g["AVG"] },
      { term: "WHERE", note: g["WHERE"] },
    ],
  }),

  index: () => ({
    goal: "Library Analogy: Imagine an encyclopedic 1,000-page book. Without an index at the back, if you want to find 'Postgres', you have to flip through every single page from 1 to 1,000 (Full Table Scan — slow and painful). With an alphabetical Index at the back, you jump straight to letter 'P', read page 610, and flip straight there (B-Tree Seek — 25x faster!). The Catch (Write Penalty): Every time the publisher inserts or deletes a new paragraph, they must stop and update the index at the back of the book (INSERT / UPDATE is slower).",
    keywords: [
      { term: "INDEX", note: "A sorted auxiliary data structure (B-Tree) that speeds up data retrieval." },
      { term: "B-TREE", note: "Balanced search tree keeping data sorted for fast O(log N) lookups." },
      { term: "TABLE SCAN", note: "Checking every single row from disk sequentially because no index exists." },
      { term: "INDEX SEEK", note: "Navigating the B-Tree root-to-leaf directly to matching rows." },
      { term: "WRITE PENALTY", note: "The extra disk writes and CPU rebalance needed to maintain indexes during INSERT/UPDATE." },
    ],
  }),
};

const THEORY_DATA_UR: Record<LevelId, (glossary: Record<string, string>) => LevelTheoryData> = {
  filter: (g) => ({
    goal: "Library Analogy: MySQL ko aik barri library samjhein. FROM sahi almaari ('posts') dhoondna hai. WHERE librarian hai jo aapke parhne se pehle un kitabon ko nikaal phenkta hai jo aapki shart par poori nahi utrein. SELECT woh makhsoos safhay nikaalta hai jo aapne mangay. ORDER BY maqbooliyat ke hisaab se kitabein jamata hai, aur LIMIT sirf top kitabein ghar le janay deta hai.",
    keywords: [
      { term: "SELECT", note: g["SELECT"] },
      { term: "FROM", note: g["FROM"] },
      { term: "WHERE", note: g["WHERE"] },
      { term: "ORDER BY", note: g["ORDER BY"] },
      { term: "LIMIT", note: g["LIMIT"] },
    ],
  }),

  aggregates: () => ({
    goal: "Library Analogy: Aggregate functions (SUM, AVG, MIN, MAX, COUNT) ko calculator ya blender samjhein: yeh tamam 20 rows ko pohncha kar aik single summary number bana dete hain. DISTINCT aik darbaan (bouncer) ki tarah hai: agar koi value pehle dekh li ho to duplicate ko bahir phenk deta hai, sirf unique values bachti hain.",
    keywords: [
      {
        term: "DISTINCT",
        note: "Column se duplicate values ko khatam karta hai taake har value sirf aik baar aaye.",
      },
      {
        term: "COUNT(*)",
        note: "Query se wapis aane wali kul rows ki taadad ginta hai.",
      },
      {
        term: "SUM(col)",
        note: "Muntakhib column ke tamam numbers ko jama kar ke aik total banata hai.",
      },
      {
        term: "AVG(col)",
        note: "Hisabi ausat (arithmetic average) nikalta hai: SUM ÷ COUNT.",
      },
      {
        term: "MIN / MAX",
        note: "Tamam rows mein se sab se choti (MIN) ya sab se barri (MAX) value dhoondta hai.",
      },
    ],
  }),

  "group-by": (g) => ({
    goal: "Library Analogy: Hamari library mein GROUP BY kitabon ko unki category (jese image ya video format) ke hisaab se alag alag dheriyo mein banta hai. Dheriya banne ke baad, COUNT() ya AVG() har dheri ka aik summary number nikalte hain, bajaye har kitaab ke alag alag.",
    keywords: [
      { term: "GROUP BY", note: g["GROUP BY"] },
      { term: "COUNT(*)", note: g["COUNT(*)"] },
      { term: "SUM", note: g["SUM"] },
      { term: "AVG", note: g["AVG"] },
    ],
  }),

  having: (g) => ({
    goal: "Library Analogy: Librarian bhari hui genre dheriyo ka muaina karta hai: sirf woh dheriyan display cart par rakhi jati hain jin mein kam az kam 3 kitabein hon, jabke kam kitabon wali dheriyan hata di jati hain. HAVING hamesha GROUP BY ke baad chalta hai — WHERE pehle dheri banne se pehle check karta hai, jabke HAVING dheri banne ke baad poori dheri ko check karta hai.",
    keywords: [
      { term: "GROUP BY", note: g["GROUP BY"] },
      { term: "HAVING", note: g["HAVING"] },
      { term: "COUNT(*)", note: g["COUNT(*)"] },
    ],
  }),

  join: (g) => ({
    goal: "Library Analogy: Sochein librarian ke paas do alag index cards hain: Borrower Cards (users) aur Checkout Slips (posts). Har borrower card ke liye, librarian member ID match karta hai. INNER JOIN mein, jin users ne koi kitaab nahi li (jese Zara) unhe nikaal diya jata hai. LEFT JOIN mein, har borrower rehta hai, chahe unke aagay khali slip lagani paray.",
    keywords: [
      { term: "JOIN", note: g["JOIN"] },
      { term: "INNER JOIN", note: g["INNER JOIN"] },
      { term: "LEFT JOIN", note: g["LEFT JOIN"] },
      { term: "ON", note: g["ON"] },
    ],
  }),

  "set-ops": (g) => ({
    goal: "Library Analogy: Do teachers library ko sifarish shuda reading lists dete hain: Teacher A (video kitabein) aur Teacher B (400+ likes wali kitabein). UNION dono lists ko milata hai aur duplicates nikalta hai taake koi kitaab do baar na aye. INTERSECT dono teachers ki mushtarka kitabein dhoondta hai. EXCEPT Teacher A ki kitabein rakhta hai magar Teacher B wali hata deta hai.",
    keywords: [
      { term: "UNION", note: g["UNION"] },
      { term: "INTERSECT", note: g["INTERSECT"] },
      { term: "EXCEPT", note: g["EXCEPT"] },
    ],
  }),

  subquery: (g) => ({
    goal: "Library Analogy: Sochein koi visitor librarian se aisi cheez mangta hai jis ke liye pehle doosra hisaab lagana paray: 'Mujhe woh kitabein do jo library ki ausat kitaab se zyada pasand ki gayi hon.' Librarian pehle poori library ka average (312 likes) nikalta hai. Phir wapis almaari par ja kar har kitaab ko us average number se match karta hai.",
    keywords: [
      { term: "subquery", note: g["subquery"] },
      { term: "scalar subquery", note: g["scalar subquery"] },
      { term: "AVG", note: g["AVG"] },
      { term: "WHERE", note: g["WHERE"] },
    ],
  }),

  index: () => ({
    goal: "Library Analogy: Tasawwur karein aik 1,000 safhon ki barri kitaab hai. Baghair index ke agar aapko koi lafz dhoondna ho, to aapko safha 1 se 1,000 tak har safha aik aik kar ke parhna parre ga (Full Table Scan — boht sust aur thaka dainay wala). Lekin agar kitaab ke aakhir mein 'Index' mojood ho, to aap foran lafz dhoond kar seedha safha 610 par chalay jatay hain (B-Tree Seek — 25 guna taiz!). Nuqsaan (Write Penalty): Jab bhi musannif kitaab mein koi naya jumla likhta hai ya safha delete karta hai, to usay aakhir mein ja kar Index ko bhi update karna parta hai (INSERT / UPDATE sust hojata hai).",
    keywords: [
      { term: "INDEX", note: "Aik sorted auxiliary data structure (B-Tree) jo data dhoondne ki raftaar ko 100x taiz karta hai." },
      { term: "B-TREE", note: "Balanced tree structure jo values ko tarteeb mein rakhti hai foran O(log N) search ke liye." },
      { term: "TABLE SCAN", note: "Index na honay par poori table ki har row ko bari bari check karna." },
      { term: "INDEX SEEK", note: "B-Tree ke zariye seedha required row ke pointer par chhalang lagana." },
      { term: "WRITE PENALTY", note: "Har INSERT/UPDATE par index tree ko update aur balance karne ka izafi waqt aur kharcha." },
    ],
  }),
};

export function getLevelTheory(level: LevelId, locale: Locale): LevelTheoryData {
  const glossary = getGlossary(locale);
  const generator = locale === "ur" ? THEORY_DATA_UR[level] : THEORY_DATA_EN[level];
  return generator(glossary);
}
