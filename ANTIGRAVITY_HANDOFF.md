# Query Machine — Handoff Brief (for continuing this project in a different AI tool)

You are continuing work on an already-built, working app. Read this whole file before
touching anything — it replaces the conversation history from the previous AI session.
Do not re-architect anything described below as "already working" — only build the
tasks listed in the **PLAN** section at the end.

## 1. What this project is

"Query Machine" is an interactive teaching tool that visualizes how MySQL actually
executes a SQL query, step by step, for absolute-beginner learners ("fellows" — the
author's students/mentees, not professional developers). Each level of the curriculum
picks one SQL concept (filtering, GROUP BY, HAVING, JOIN, set operations, subqueries)
and shows, visually and with animation, how MySQL processes rows through that concept —
not just the final result table.

Target audience: true beginners. Everything must be explained playfully, visually, and
without assuming prior SQL/DB knowledge. This is the single most important constraint —
when in doubt, favor the more beginner-friendly, more visual, more playful option.

Deployment target: Vercel. Will be shared with the author's fellows/students once done.

## 2. Tech stack (already set up — do not change)

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Zustand v5 for state (one store per level)
- Framer Motion for all animation
- `react-resizable-panels` for the resizable Command/Hood/Output layout
- `lucide-react` for icons
- Radix primitives (`@radix-ui/react-slider`, `-switch`, `-tabs`, `-tooltip`) where needed
- Working directory: `C:\Users\shahz\OneDrive\Desktop\sqlvisualizer` — **work only in this folder**

Run with `npm run dev`. Note: Next.js dev server with Turbopack does **not** pick up
brand-new files/folders via Fast Refresh — if you add a new file, you may need to
restart the dev server for it to be recognized. Editing existing files hot-reloads fine.

## 3. Non-negotiable working philosophy

These rules came from direct instruction earlier in the project and must keep being
followed for any new work:

1. **"Ponytail" philosophy — minimal code.** No speculative abstractions, no
   over-engineering, no unused flexibility "for later." Three similar lines of code
   beat a premature shared abstraction. A bug fix doesn't need surrounding cleanup.
2. **Act like a senior developer.** Proper state management (Zustand, one store per
   level, scoped correctly), clean component boundaries, no prop-drilling hacks, no
   global mutable state outside the stores.
3. **Make it unique, not "AI slop."** No generic purple-gradient SaaS-template look.
   The UI has its own visual identity already (see section 5) — match it, don't
   default to generic shadcn/Tailwind-starter aesthetics.
4. **Animate like a motion designer, not like a tutorial.** Every transition should
   feel intentional — eased, timed, with purpose (showing *how* data moves/changes),
   not just a fade-in slapped on everything.
5. **Don't pause for permission between small, already-agreed steps.** Work through a
   task list end-to-end and report at the end, the way the rest of this project was
   built (see PLAN section — it's written in exactly that spirit).
6. **No multi-line comments.** House style in this codebase: comments are at most one
   short line, and only written when the *why* isn't obvious from the code itself
   (hidden constraint, workaround, non-obvious invariant). No docstrings, no comment
   blocks explaining what a function does.

## 4. Architecture pattern — read this before writing any new level code

Every level (Filter / GroupBy / Having / Join / Set-Ops / Subquery) follows the exact
same four-piece pattern. If you add anything to a level, or add a new one, follow this
pattern exactly — don't invent a new structure.

```
src/lib/<level>Engine.ts         ← pure functions, single source of truth for that
                                    level's SQL semantics. No React, no state. Example:
                                    joinRows(), combine(), classifyBySubquery().
src/store/use<Level>Store.ts     ← Zustand store: { stage, ...level-specific params,
                                    isPlaying, setStage, reset, ... }. One store per
                                    level. Only useProgressStore uses `persist`
                                    (localStorage) — every other store intentionally
                                    resets on reload.
src/components/query-machine/levels/<level>/
  <Level>CommandPanel.tsx        ← left panel: TheoryCard (explains the SQL concept via
                                    the glossary), SqlBlock (live-highlighted SQL),
                                    option toggles (e.g. JoinType card), <QuizCard />.
  <Level>HoodPanel.tsx           ← middle panel: "Under the hood" — the actual step-by-
                                    step animated visualization of execution.
  <Level>OutputPanel.tsx         ← right panel: the resulting table + "Advance to next
                                    stage" button.
src/components/query-machine/levels/<Level>View.tsx
                                  ← thin ResizableShell wrapper gluing the 3 panels.
```

`src/store/useAppStore.ts` holds `LEVELS` (the ordered level list) and `currentLevel`.
`src/components/query-machine/QueryMachine.tsx` is the top-level router that renders
the right `<Level>View` for `currentLevel`.

Shared, cross-level components (do not duplicate — reuse):
- `SchemaCard.tsx` — renders a table's columns as an ER-diagram-style card. Supports
  `fk`/`pk` icons and a `highlight={["colName"]}` prop that tints a shared join-key
  column so two side-by-side cards visually read as related.
- `TheoryCard.tsx`, `Term.tsx` + `glossary.ts` — the glossary/tooltip system for SQL
  terms. `Term` renders a term with a tooltip pulled from `glossary.ts`.
- `QuizCard.tsx` + `quizzes.ts` — the per-level 2-question quiz widget, reads/writes
  `useProgressStore`.
- `TopBar.tsx` — level nav pills (with quiz-passed checkmark badges), `ProgressDots`,
  `ShareButton`.
- `shareLink.ts` — builds/parses `?level=&state=` share URLs. **Important**: each level
  has an explicit `SHAREABLE_FIELDS` allowlist here — never blindly spread full store
  state into the URL; only the intentionally-shareable knobs.

## 5. Visual language already established

- Dark/light theme toggle exists (`qm-theme` in localStorage, synced via a blocking
  inline script in `layout.tsx` to avoid flash-of-wrong-theme).
- Color tokens used throughout via CSS vars: `--accent`, `--ok`, `--flow`, `--panel`,
  `--panel-2`, `--border`, `--text`, `--text-muted` — defined in `globals.css`. Reuse
  these vars; don't hardcode hex colors in new components.
- Monospace (`ui-monospace`/JetBrains Mono) used for all SQL/data/row-chip text; the
  regular UI font (Inter) used for prose/labels.
- Small rounded "chip" components (`RowChip`) represent individual data rows throughout
  — e.g. `#4 video · 512` — this is the recurring visual atom for "a row of data."
  Reuse this pattern (`src/components/query-machine/levels/shared/RowChip.tsx`) instead
  of inventing a new row representation per level.
- `dotted-canvas` background class = the subtle dotted backdrop used behind "under the
  hood" panels to read as a technical/schematic surface.

### Known Framer Motion gotchas in this codebase (avoid re-discovering these)

1. If you animate SVG presentation attributes (`fill`, `stroke`, `r`, `fillOpacity`...)
   via the `animate` prop, you must give an explicit `initial` (or `initial={false}`),
   or Framer Motion throws trying to animate from `undefined`.
2. `AnimatePresence mode="wait"` can permanently stall if a keyed child's `key` changes
   again before the exit+enter transition finishes. Fix used everywhere in this project:
   drop `AnimatePresence` for simple text-swap cases; just use
   `<motion.span key={text} initial={...} animate={...}>` with no `exit` prop.
3. `mix-blend-mode: multiply` for showing two overlapping translucent shapes looks fine
   on a light background but washes to near-black on this app's dark theme panel
   background. Don't use blend-mode tricks for anything that must look correct in both
   themes — stack flat shapes at fixed opacity values instead (see
   `SetOpsHoodPanel.tsx`'s `VennDiagram` for the fixed version: three stacked circles at
   opacity 0.32/0.32/0.5 instead of blend-mode).
4. SVG `clipPath`-on-a-circle is the technique already used to draw geometric
   intersections (a "lens" shape) — reuse this, don't hand-roll intersection math.

## 6. Current state — what already exists and works

All 6 curriculum levels are built and functional: **Filter → GROUP BY → HAVING → JOIN
→ Set Operations (UNION/INTERSECT/EXCEPT) → Subquery**. Plus:

- Per-level 2-question quizzes with pass tracking (`QuizCard`, `quizzes.ts`)
- Persisted progress (visited levels + quiz-passed state) via `useProgressStore`
  (the only store using Zustand `persist`)
- Level-nav checkmark badges + progress-dot tracker in `TopBar`
- Shareable state links (`ShareButton` → copies a URL encoding the current level +
  that level's shareable params; auto-applies on load if present)
- Dark/light theme toggle
- Mock dataset: `USERS` (10 rows) + `POSTS` in `src/lib/data.ts`. `zara_iqbal` is a user
  with zero posts, deliberately, so INNER vs LEFT JOIN visibly differ.

This is a complete, working v1. Everything from here is iteration/polish, not a rebuild.

## 7. Known weak spots already diagnosed (don't rediscover — just fix, per the plan below)

- **JOIN level's "under the hood" visual is the single biggest clarity problem.**
  Currently (`JoinHoodPanel.tsx`) it shows two `SchemaCard`s with a shared `username`
  column highlighted (this part works, keep it) followed by a list of
  pre-computed `UserMatchCard`s — one per user, already showing "this user matched N
  posts." A beginner cannot see *how* the match actually happens, because the two
  source tables are never shown as raw, separate, untouched data before matching — the
  cards already present grouped results. There is also no raw "Input" view at all
  (Level 0 / Filter has an Input/Output toggle showing untouched data; JOIN does not).
- **The same missing-"Input"-view gap exists on every level except Filter (Level 0):**
  GroupBy, Having, Join, Set-Ops, and Subquery all jump straight into transforming data
  without first showing the learner the plain, untouched source table(s).
  - Set-Ops specifically: never shows the full raw `posts` table before splitting into
    Query A / Query B.
  - Subquery specifically: never shows a calm, flat list of all 20 `likes_count` values
    before they animate into the single AVG() number.

## 8. PLAN — execute these tasks in order, one after another, no pausing for approval between them

This mirrors how the rest of the app was built: work through the list top to bottom,
verify each item (`tsc --noEmit`, `eslint`, visually in the browser, dark+light theme,
mobile width) before moving to the next, and only stop if something is genuinely
ambiguous. Don't ask about each item individually — use the judgment calls described
below. Report a short summary at the end of all tasks, not after each one.

### Task 1 — Add an "Input" raw-data view to every level that's missing one
Mirror Level 0/Filter's existing Input/Output toggle pattern (check
`src/components/query-machine/OutputPanel.tsx` for the existing toggle implementation
and copy its interaction pattern, not its exact markup).
- **GroupBy / Having**: add an Input view showing the full raw `posts` table as plain
  row chips, reachable before the grouping animation begins.
- **Join**: add an Input view showing `users` and `posts` as two separate, plain,
  untouched row lists, side by side — no matching, no grouping, just "here is what's
  really in each table." This should be the *first* thing a learner sees before any
  matching logic runs.
- **Set-Ops**: add an Input view showing the full raw `posts` table before it gets
  split into Query A / Query B.
- **Subquery**: add an Input view showing a flat, calm list of all 20 `likes_count`
  values, before they animate/collapse into the single AVG() result.
Keep each implementation small and level-local — don't build one giant shared
"InputView" abstraction unless the four implementations turn out to be near-identical
(ponytail: don't abstract prematurely, but don't duplicate a genuinely identical
component four times either — use judgment once you've written the first one or two).

### Task 2 — Redesign JOIN's matching visual
Replace `UserMatchCard`'s pre-grouped list with a **two-column connector-line layout**:
`users` rendered as a column of row chips on the left, `posts` as a column of row chips
on the right, with animated SVG lines drawn between matched pairs as the join "runs."
Unmatched rows (e.g. `zara_iqbal` under INNER JOIN) sit alone with no line drawn to
them — this is what should make INNER vs LEFT JOIN viscerally obvious. This is a
mail-sorting / bipartite-matching visual, not a card-list. Animate the lines being
"drawn" with Framer Motion (e.g. `pathLength` animation on an SVG `<path>` or `<line>`),
staggered per row so it reads as a sequence, not all-at-once.
As a secondary, smaller flourish only (not the primary mechanism, since it won't scale
to 9 simultaneous matches): optionally add a one-time puzzle-piece "snap" animation the
first time a match forms, as a playful accent layered on top of the connector-line view.

### Task 3 — Level map
Replace (or supplement) the current tab-style `LevelNav` in `TopBar.tsx` with a more
game-like journey view: a winding path with 6 stops/nodes, each showing its own
checkmark state once visited/quiz-passed. Keep it lightweight — this is a visual
upgrade to existing nav state, not a new state system (reuse `useAppStore` and
`useProgressStore`, don't add new stores for this).

### Task 4 — Quiz-pass celebration
When `QuizCard` detects all answers correct and calls `markQuizPassed`, play a small
animated celebration (e.g. a brief particle/confetti burst or a satisfying scale+glow
pulse on the quiz card) instead of just updating the badge silently. Keep it tasteful
and quick (under ~1s) — this is a beginner-friendly reward moment, not a distraction.

### Task 5 — First-time onbooarding tour
On a learner's very first visit (no `useProgressStore` state yet), show 3 lightweight
coach-marks explaining what Command / Under the hood / Output panels are, before they
start interacting. Dismissible, shown once (track via `useProgressStore` or a simple
localStorage flag), never shown again after dismissal or after the first level is
visited.

### Task 6 — Consistent cross-level analogy/story
Pick **one** real-world analogy (e.g. a library: FROM = walking in, WHERE = a librarian
filtering books, GROUP BY = sorting into piles, HAVING = only keeping big-enough piles,
JOIN = matching a library card to a borrower, subquery = asking a question inside
another question) and thread a short version of it into each level's `TheoryCard` copy.
This is a copy/content task — update the explanatory text in each `*CommandPanel.tsx`'s
`TheoryCard` usage, don't change component structure.

### Task 7 — Subquery matryoshka visual
In `SubqueryHoodPanel.tsx`, visualize the inner `SELECT AVG(likes_count) FROM posts`
subquery as literally nested inside the outer query — a smaller box/frame inside a
bigger one (nesting-doll metaphor), animating the inner one resolving to a single value
first, then that value "popping out" into the outer WHERE clause comparison.

### Task 8 — GROUP BY physics buckets
In `GroupByHoodPanel.tsx`, instead of (or in addition to) the current border-color
grouping indicator, animate rows as small chips that physically "fall" or "slide" into
labeled basket/bucket icons representing each group — reinforcing the "rows are being
sorted into piles" mental model viscerally, not just via color.

### Task 9 — Glossary first-appearance nudge
The first time a `<Term>` component for a given glossary term appears on screen for a
given user (track via `useProgressStore` or localStorage, keyed by term), give it a
brief pulsing/glowing affordance so a beginner notices it's interactive and hoverable,
then stop pulsing permanently once that term has been seen/hovered once.

### Task 10 — Functionality additions
- **"Try it yourself" challenge mode**: after a level's quiz, offer 1 small interactive
  challenge per level (e.g. "adjust the controls so exactly 3 rows come out") with a
  pass/fail check against the level's existing `*Engine.ts` functions — reuse engine
  logic, don't duplicate SQL semantics.
- **Copy real SQL button**: a button (in `*CommandPanel.tsx`'s SqlBlock area) that
  copies the currently-displayed SQL query text to the clipboard, so a learner can
  paste it into a real MySQL client. Reuse the clipboard pattern already implemented in
  `TopBar.tsx`'s `ShareButton` (try/catch around `navigator.clipboard.writeText`,
  fallback to `window.prompt` if it throws).
- **Quiz hint button**: an optional "hint" button on each `QuizCard` question, shown
  before the learner answers, that reveals a short nudge tied to the relevant glossary
  term (don't reveal the answer outright — point them toward the concept).
- Do **not** add an Urdu/English toggle — explicitly out of scope, already decided.

### Final step — cross-level polish pass
After Tasks 1–10, do one pass across all 6 levels checking: no dead code left behind,
no console errors on a fresh load of each level (light + dark theme), `tsc --noEmit`
clean, `eslint --max-warnings=0` clean, `next build` succeeds, mobile-width (375px) has
no horizontal overflow on any panel. Fix anything found. Then report what was built.

## 9. Verification checklist to run before considering any task "done"

```bash
npx tsc --noEmit
npx eslint . --max-warnings=0
npm run build
```
Plus manual browser check: fresh tab, both themes, no console errors, test the actual
interaction (not just that it renders).
