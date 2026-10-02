export type Locale = "en" | "ur";

export interface TranslationDictionary {
  topbar: {
    title: string;
    subtitle: string;
    tour: string;
    share: string;
    copied: string;
    quizzesCompleted: string;
    langEn: string;
    langUr: string;
  };
  headers: {
    commandDeck: string;
    commandDeckHint: string;
    underTheHood: string;
    underTheHoodHint: string;
    outputView: string;
    outputViewHint: string;
  };
  output: {
    inputTab: string;
    outputTab: string;
    tabAll: string;
    tabIncluded: string;
    tabCut: string;
    tabExcluded: string;
    returnedBySql: string;
    cutByLimitBadge: string;
    excludedBadge: string;
    datasetBreakdown: string;
    breakdownText: (total: number, inc: number, cut: number, exc: number) => string;
    rowsReturned: string;
    rawRowsIn: string;
    advanceTo: string;
    noRowsInView: string;
    selectNotRunYet: string;
    combineNotRunYet: string;
    passedCondition: (count: number) => string;
    excludedCondition: (count: number) => string;
    droppedBadge: string;
  };
  theory: {
    title: string;
    hintSubtitle: string;
    hide: string;
    show: string;
  };
  challenge: {
    badgeInteractive: string;
    badgeSolved: string;
    keepTweaking: string;
    targetMet: string;
  };
  quiz: {
    title: string;
    passed: string;
    hint: string;
    hide: string;
  };
  hood: {
    queryParsed: string;
    fromLoads: (count: number) => string;
    howMysqlFinds: string;
    indexConcept: string;
    checkEveryRow: string;
    useIndex: string;
    withoutIndexDesc: (total: number, dropped: number) => string;
    withIndexDesc: (passing: number, total: number) => string;
    rowsActuallyTouched: string;
    rowsCheckedOneByOne: string;
    selectColsSurvive: string;
    selectColsNotReached: string;
    orderNotReached: string;
    notReachedYet: string;
  };
  onboarding: {
    badge: string;
    skip: string;
    back: string;
    next: string;
    finish: string;
    step0Title: string;
    step0Desc: string;
    step1Title: string;
    step1Desc: string;
    step1Hint: string;
    step2Title: string;
    step2Desc: string;
    step2Hint: string;
    step3Title: string;
    step3Desc: string;
    step3Hint: string;
    step4Title: string;
    step4Desc: string;
    step4Hint: string;
    step5Title: string;
    step5Desc: string;
    step5Hint: string;
  };
  mobileNotice: {
    badge: string;
    title: string;
    desc1: string;
    desc2: string;
    screenNotice: string;
    recommendedWidth: string;
    copyLink: string;
    linkCopied: string;
    dismiss: string;
    pill: string;
  };
  common: {
    status: string;
    format: string;
    likes: string;
    views: string;
    user: string;
    id: string;
    executionTimeline: string;
    stepOf: (cur: number, total: number) => string;
  };
}

export const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  en: {
    topbar: {
      title: "Query Machine",
      subtitle: "MySQL execution, level by level",
      tour: "Tour",
      share: "Share",
      copied: "Copied!",
      quizzesCompleted: "level quizzes passed",
      langEn: "English",
      langUr: "Roman Urdu",
    },
    headers: {
      commandDeck: "COMMAND DECK",
      commandDeckHint: "Tweaks & controls",
      underTheHood: "UNDER THE HOOD",
      underTheHoodHint: "Visual execution pipeline",
      outputView: "OUTPUT VIEW",
      outputViewHint: "Live query output",
    },
    output: {
      inputTab: "Input",
      outputTab: "Output",
      tabAll: "All",
      tabIncluded: "Included",
      tabCut: "Cut",
      tabExcluded: "Excluded",
      returnedBySql: "Returned by SQL",
      cutByLimitBadge: "Cut by LIMIT",
      excludedBadge: "Excluded by Filter",
      datasetBreakdown: "Dataset Breakdown:",
      breakdownText: (total, inc, cut, exc) =>
        `Out of ${total} rows, only ${inc} are Returned by SQL. ${cut > 0 ? `${cut} are Cut by LIMIT, and ` : ""}${exc} are Excluded by WHERE condition.`,
      rowsReturned: "rows returned",
      rawRowsIn: "raw source rows in",
      advanceTo: "Advance to",
      noRowsInView: "No rows in this view yet — drag the pipeline slider.",
      selectNotRunYet: "SELECT hasn't run yet — advance to the SELECT stage to see the result.",
      combineNotRunYet: "Combine hasn't run yet — advance to the COMBINE stage to see the result.",
      passedCondition: (count) => `1. Passed Condition (${count} rows)`,
      excludedCondition: (count) => `2. Excluded by Condition (${count} rows)`,
      droppedBadge: "Dropped",
    },
    theory: {
      title: "What this query does",
      hintSubtitle: "Click to view library analogy & key concepts",
      hide: "Hide",
      show: "Show theory",
    },
    challenge: {
      badgeInteractive: "Interactive",
      badgeSolved: "Solved!",
      keepTweaking: "Keep tweaking",
      targetMet: "Target Met",
    },
    quiz: {
      title: "Check yourself",
      passed: "passed",
      hint: "Hint",
      hide: "Hide",
    },
    hood: {
      queryParsed: "Query parsed — 5 clauses recognised",
      fromLoads: (count) => `Loads every row from the table — ${count} rows read`,
      howMysqlFinds: "How MySQL finds the matching rows",
      indexConcept: "It can either check every row one by one, or use a shortcut called an index — like a book's index — to jump straight to the rows that match.",
      checkEveryRow: "Check every row",
      useIndex: "Use an index (jump to matches)",
      withoutIndexDesc: (total, dropped) => `Without an index, MySQL has no shortcut — it opens and checks every single row, all ${total} of them, even the ${dropped} that end up failing.`,
      withIndexDesc: (passing, total) => `With an index on likes_count, MySQL jumps straight to the matches — only ${passing} of ${total} rows are ever touched.`,
      rowsActuallyTouched: "Rows actually touched:",
      rowsCheckedOneByOne: "Rows checked, one by one:",
      selectColsSurvive: "Every column below was available — only the highlighted ones survive SELECT.",
      selectColsNotReached: "Not reached yet — every column below is still available.",
      orderNotReached: "Not reached yet — rows are still in load order.",
      notReachedYet: "Not reached yet.",
    },
    onboarding: {
      badge: "GUIDE TOUR",
      skip: "Skip Tour",
      back: "Back",
      next: "Next",
      finish: "Let's Explore! 🚀",
      step0Title: "Welcome to SQL Visualizer! 🚀",
      step0Desc: "Watch SQL queries execute visually step-by-step. See raw rows get scanned, filtered, grouped, and transformed into final query outputs in real-time.",
      step1Title: "The Command Deck 🎛️",
      step1Desc: "This is your remote control center! Adjust query sliders, toggle filter columns, change sort direction, or advance execution stages. Watch the SQL query update dynamically.",
      step1Hint: "👈 LOOK AT THE HIGHLIGHTED LEFT PANEL — your query control center!",
      step2Title: "How To Tweak & Control 🎛️",
      step2Desc: "Drag the sliders to change conditions like minimum likes. Tap column chips to include or exclude columns. Click ASC/DESC or JOIN tabs to watch everything adapt!",
      step2Hint: "👈 TRY TWEAKING CONTROLS ON THE LEFT to see the SQL update live!",
      step3Title: "Under The Hood (Visual Pipeline) ⚙️",
      step3Desc: "Peek inside MySQL's internal mechanics! See data flow on the conveyor belt, watch rows pass through conditional sieves, and observe grouping buckets live.",
      step3Hint: "👆 LOOK AT THE MIDDLE CONVEYOR BELT — rows being tested live!",
      step4Title: "Live Output & Results 📊",
      step4Desc: "Inspect the final returned rows. Compare input vs output tables, toggle between Included, Cut by Limit, and Excluded data, and see why each row succeeded or failed.",
      step4Hint: "👉 LOOK AT THE RIGHT PANEL — your live SQL query results!",
      step5Title: "Curriculum Journey & Quizzes 🏆",
      step5Desc: "Work your way through all 7 curriculum levels from basic WHERE filters to nested Subqueries. Test your intuition with interactive quizzes and earn checkmarks!",
      step5Hint: "👆 LOOK AT THE TOP NAVIGATION — click any level to learn and test yourself!",
    },
    mobileNotice: {
      badge: "Mobile & Tablet Design In Progress",
      title: "Desktop / Laptop Recommended 💻",
      desc1: "SQL Visualizer is designed as an interactive 3-column lab (Command Deck, Conveyor Belt, and Live Output).",
      desc2: "Our mobile and tablet responsive layout is in active development for Phase 2. For the best learning experience, please open on a Laptop or Desktop.",
      screenNotice: "Your Display:",
      recommendedWidth: "Recommended: ≥ 1024px",
      copyLink: "Copy Link to Open on Laptop",
      linkCopied: "Link Copied! Paste on Laptop",
      dismiss: "Dismiss & Preview Anyway (Desktop Mode)",
      pill: "Mobile View (WIP) — Tap for info",
    },
    common: {
      status: "status",
      format: "format",
      likes: "likes",
      views: "views",
      user: "user",
      id: "id",
      executionTimeline: "Execution Timeline",
      stepOf: (cur, total) => `Step ${cur} of ${total}`,
    },
  },

  ur: {
    topbar: {
      title: "Query Machine",
      subtitle: "MySQL execution, har marhalay par visually",
      tour: "Tour",
      share: "Share",
      copied: "Copy ho gaya!",
      quizzesCompleted: "level quizzes pass kiye",
      langEn: "English",
      langUr: "Roman Urdu",
    },
    headers: {
      commandDeck: "COMMAND DECK",
      commandDeckHint: "Query controls aur tweaks",
      underTheHood: "UNDER THE HOOD",
      underTheHoodHint: "Visual conveyor aur pipeline",
      outputView: "OUTPUT VIEW",
      outputViewHint: "Live query ka aakhri nateeja",
    },
    output: {
      inputTab: "Input",
      outputTab: "Output",
      tabAll: "All",
      tabIncluded: "Included",
      tabCut: "Cut",
      tabExcluded: "Excluded",
      returnedBySql: "Returned by SQL",
      cutByLimitBadge: "Cut by LIMIT",
      excludedBadge: "Excluded by Filter",
      datasetBreakdown: "Data ki Tafseel:",
      breakdownText: (total, inc, cut, exc) =>
        `Kul ${total} rows mein se sirf ${inc} rows SQL query ne Return ki hain. ${cut > 0 ? `${cut} rows LIMIT ki waja se cut huin, aur ` : ""}${exc} rows WHERE condition par poori nahi utrein.`,
      rowsReturned: "rows returned",
      rawRowsIn: "raw source rows in",
      advanceTo: "Aglay marhalay par jayein:",
      noRowsInView: "Is view mein abhi koi row nahi hai — pipeline slider aagay barhayein.",
      selectNotRunYet: "SELECT hasn't run yet — advance to the SELECT stage to see the result.",
      combineNotRunYet: "Combine hasn't run yet — advance to the COMBINE stage to see the result.",
      passedCondition: (count) => `1. Passed Condition (${count} rows)`,
      excludedCondition: (count) => `2. Excluded by Condition (${count} rows)`,
      droppedBadge: "Dropped",
    },
    theory: {
      title: "Yeh query kya karti hai",
      hintSubtitle: "Tafseel aur ahem mafahim dekhne ke liye click karein",
      hide: "Chupayein",
      show: "Theory Dekhein",
    },
    challenge: {
      badgeInteractive: "Mashq",
      badgeSolved: "Hal Ho Gaya!",
      keepTweaking: "Mazeed tweak karein",
      targetMet: "Hadaf Haasil!",
    },
    quiz: {
      title: "Apna Imtehan Lein",
      passed: "Kamyab",
      hint: "Ishaara",
      hide: "Chupayein",
    },
    hood: {
      queryParsed: "Query parse ho gayi — 5 clauses pehchani gayin",
      fromLoads: (count) => `Table se har row load hoti hai — ${count} rows read huin`,
      howMysqlFinds: "MySQL matching rows kaise dhoondta hai",
      indexConcept: "Yeh ya to har row ko aik aik kar ke check kar sakta hai, ya 'index' naam ka shortcut use karta hai — jese kitaab ki fehrist — taake seedha matching rows par chalaang lagaye.",
      checkEveryRow: "Har row check karein",
      useIndex: "Index use karein (direct jump)",
      withoutIndexDesc: (total, dropped) => `Index ke baghair, MySQL ke paas koi shortcut nahi — yeh tamam ${total} rows ko kholta aur check karta hai, un ${dropped} ko bhi jo fail ho jati hain.`,
      withIndexDesc: (passing, total) => `likes_count par index ke sath, MySQL seedha matches par chalaang lagata hai — ${total} mein se sirf ${passing} rows ko check kiya jata hai.`,
      rowsActuallyTouched: "Asal mein check ki gayi rows:",
      rowsCheckedOneByOne: "Aik aik kar ke check ki gayi rows:",
      selectColsSurvive: "Neechay har column mojood tha — sirf highlight kiye gaye columns SELECT ke baad bachtay hain.",
      selectColsNotReached: "Abhi yahan nahi pohnchay — neechay tamam columns abhi mojood hain.",
      orderNotReached: "Abhi yahan nahi pohnchay — rows abhi table ke order mein hain.",
      notReachedYet: "Abhi yahan tak query nahi pohnchi.",
    },
    onboarding: {
      badge: "TOUR RAHNAMAEE",
      skip: "Tour Skip karein",
      back: "Peechay",
      next: "Agla",
      finish: "Theek hai, Shuru Karein! 🚀",
      step0Title: "SQL Visualizer mein Khushamdeed! 🚀",
      step0Desc: "Dekhein SQL queries kis tarah marhala-war execute hoti hain. Har row ko scan, filter, group, aur final output bante live animation ke sath samjhein.",
      step1Title: "Command Deck (Aapka Remote Controller) 🎛️",
      step1Desc: "Yeh aapka remote controller hai! Yahan se query ke sliders hilayein, columns chunein, sort order badlein, ya execution step aagay barhayein. SQL query live update hogi.",
      step1Hint: "👈 BAAYEIN (LEFT) PANEL KO DEKHEIN — yeh aapka query control center hai!",
      step2Title: "Controls aur Tweaks Kaise Use Karein 🎛️",
      step2Desc: "Sliders ko drag kar ke likes ki limit badlein. Column chips par click kar ke columns shamil ya khatam karein. ASC/DESC ya JOIN tabs daba kar live tabdeeli dekhein!",
      step2Hint: "👈 CONTROLS KO TWEAK KAR KE DEKHEIN — SQL query foran update hogi!",
      step3Title: "Under The Hood (Visual Pipeline) ⚙️",
      step3Desc: "Database ke andar ki machine dekhein! Conveyor belt par data ka bahao, conditional chalni (sieve) se rows ka pass/fail hona, aur bucket grouping sab yahan nazar aata hai.",
      step3Hint: "👆 DARMIYAN (MIDDLE) MEIN CONVEYOR BELT DEKHEIN — rows live test ho rahi hain!",
      step4Title: "Live Output aur Results 📊",
      step4Desc: "Final query ka nateeja yahan dekhein. Input aur Output tables ka mawazna karein, Included, Cut by Limit, aur Excluded rows ko alag alag dekh kar samjhein.",
      step4Hint: "👉 DAAYEIN (RIGHT) PANEL KO DEKHEIN — aapka live SQL query result!",
      step5Title: "Curriculum Journey aur Quizzes 🏆",
      step5Desc: "Bunyadi WHERE filters se lekar nested Subqueries tak tamam 7 levels paar karein. Har level ke aakhir mein quiz hal kar ke checkmark hasil karein!",
      step5Hint: "👆 UPAR JOURNEY MAP DEKHEIN — kisi bhi level par click karein aur seekhein!",
    },
    mobileNotice: {
      badge: "Mobile & Tablet Design Par Kaam Jari Hai",
      title: "Desktop ya Laptop Behtar Hai 💻",
      desc1: "SQL Visualizer ko 3-column interactive lab (Command Deck, Conveyor Belt, aur Live Output) ke liye design kiya gaya hai.",
      desc2: "Mobile aur Tablet ka optimized design abhi Phase 2 mein banaya ja raha hai. Behtar aur mukammal tajurbay ke liye is website ko Laptop ya Desktop par open karein.",
      screenNotice: "Aapki Screen:",
      recommendedWidth: "Chahiye: ≥ 1024px",
      copyLink: "Laptop par kholne ke liye Link Copy karein",
      linkCopied: "Link Copy ho gaya! Laptop par paste karein",
      dismiss: "Dismiss karein aur preview dekhein (Desktop Mode)",
      pill: "Mobile View (WIP) — Tap for info",
    },
    common: {
      status: "status",
      format: "format",
      likes: "likes",
      views: "views",
      user: "user",
      id: "id",
      executionTimeline: "Execution Marhalay",
      stepOf: (cur, total) => `Marhala ${cur} of ${total}`,
    },
  },
};
