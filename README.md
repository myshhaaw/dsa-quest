# DSA Quest

A gamified, full-stack data structures & algorithms academy: an RPG-style roadmap, LeetCode-style
coding challenges with boss battles, and **Sage** — a specialized AI mentor with five distinct
teaching modes. Built with Next.js 14, PostgreSQL/Prisma, and the Anthropic API.

![status](https://img.shields.io/badge/status-MVP--complete-8B5CF6)

## What's actually functional (not mocked)

- **Auth**: real registration/login with bcrypt-hashed passwords and signed JWT session cookies.
- **Roadmap**: topics unlock based on prerequisite completion, computed from real lesson/problem
  progress in the database.
- **Lessons & quizzes**: markdown lessons, graded quizzes, XP awarded once per lesson.
- **Code execution**: a real grading pipeline — submissions run against a full test suite (hidden
  + sample cases) via a language-agnostic test harness, with a pluggable sandboxed backend (see
  [Code execution architecture](#code-execution-architecture) below).
- **Gamification**: XP/leveling curve, coins, daily/weekly quests, achievements, and streaks are
  all computed and persisted server-side, not just displayed.
- **Mastery & spaced repetition**: an SM-2-style scheduler queues problems for review, and a
  weakest-topic recommender suggests what to solve next.
- **AI mentor (Sage)**: five real modes (Hint, Socratic, Debug, Complexity, Interview) backed by
  the Anthropic Messages API, with mode-specific system prompts and per-mode chat history.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Components + Route Handlers) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom JWT session cookies (`jose` + `bcryptjs`) — no third-party auth vendor required |
| Styling | Tailwind CSS, custom "obsidian/arcane" design system |
| Charts | Recharts |
| AI | `@anthropic-ai/sdk` |
| Code execution | Judge0 (sandboxed, recommended) with an in-process demo-mode fallback |

## Quickstart (local, zero external services except one API key)

```bash
cp .env.example .env
# edit .env: at minimum set JWT_SECRET and ANTHROPIC_API_KEY

docker compose up -d db        # starts Postgres only
npm install
npm run db:push                # creates tables from prisma/schema.prisma
npm run db:seed                # loads 6 topics, 18 problems, quests, achievements, a demo user
npm run dev
```

Visit `http://localhost:3000`. Sign up, or sign in with the seeded demo account:

```
email:    demo@dsaquest.app
password: quested123
```

Without `JUDGE0_API_URL` set, code submissions run in **demo mode** (see below) — JavaScript
submissions work out of the box; Python demo mode requires `python3` to be on the host machine
running the Next.js server (it is **not** available on serverless platforms like Vercel — see
below).

## Code execution architecture

This is the part of a DSA platform that's dangerous to get wrong: you're running arbitrary,
untrusted code submitted by users. `src/lib/execution/` makes the backend pluggable:

- **`harness.ts`** — wraps the learner's function with a small runner that calls it against every
  test case and prints one JSON array of results. One execution grades a whole problem instead of
  spinning up one sandboxed run per test case.
- **`judge0.ts`** — submits that harness to a [Judge0](https://github.com/judge0/judge0) instance
  (self-hosted or the hosted RapidAPI offering). Judge0 runs each submission in an isolated,
  resource-limited container (via `isolate`), with CPU/wall-time limits. **This is the backend you
  should use in any real deployment.**
- **`demoRunner.ts`** — an in-process fallback (Node's `vm` module for JavaScript, a bare
  subprocess for Python) used automatically when `JUDGE0_API_URL` is not set. It exists so the app
  is fully runnable with zero external services for local development and demos. **It is
  explicitly not securely sandboxed** (no filesystem/network isolation, no resource limits beyond
  a wall-clock timeout) and must not be exposed to untrusted users in production.
- **`index.ts`** — picks a backend based on environment configuration and turns its raw output
  into an `ACCEPTED / WRONG_ANSWER / RUNTIME_ERROR / TIME_LIMIT_EXCEEDED / COMPILE_ERROR` verdict.

**To enable real sandboxed execution**, set one of:

```bash
# Self-hosted Judge0 (see docker-compose.yml's judge0 profile, or Judge0's own docs)
JUDGE0_API_URL="http://localhost:2358"

# Judge0 via RapidAPI (https://rapidapi.com/judge0-official/api/judge0-ce)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="..."
```

Adding a new backend (e.g. a different sandboxing service, or a queue-based worker architecture
for higher throughput) means implementing the same `(language, harnessSource, timeLimitMs) => {
stdout, stderr }` shape and wiring it into `index.ts` — the rest of the app (grading, XP,
mastery, quests) doesn't need to change.

## External services & API keys

| Service | Required? | Used for | Env var(s) |
|---|---|---|---|
| PostgreSQL | Yes | All persistent data | `DATABASE_URL` |
| Anthropic API | Yes, for the AI mentor | Hint/Socratic/Debug/Complexity/Interview modes | `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL` |
| Judge0 | Recommended for production | Secure sandboxed code execution | `JUDGE0_API_URL`, optional `JUDGE0_API_KEY`/`JUDGE0_API_HOST` |

Nothing else is required — there's no third-party auth vendor, analytics SDK, or payment
processor wired in.

## Database schema (high level)

`prisma/schema.prisma` is the source of truth. Broad strokes:

- **Identity/progress**: `User`, `UserTopicProgress`, `UserLessonProgress`
- **Roadmap content**: `Topic` (with `prerequisiteSlugs` for gating) → `Lesson` → `QuizQuestion`
- **Problems**: `Problem` (starter code + solution per language, tags, `isBossBattle`) →
  `TestCase` (sample vs. hidden) → `Submission`
- **Personalization**: `UserTopicMastery` (accuracy + volume blended score),
  `ReviewSchedule` (SM-2-lite spaced repetition)
- **Gamification**: `Quest` / `UserQuest` (daily + weekly), `Achievement` / `UserAchievement`,
  `ActivityLog` (dashboard feed + streak source of truth)
- **AI mentor**: `AIMessage` (per-user, per-problem, per-mode conversation history)

## Project structure

```
prisma/
  schema.prisma        # data model
  seed.ts               # 6 topics, 8 lessons+quizzes, 18 problems, 5 quests, 9 achievements
src/
  app/
    (app)/              # authenticated routes — dashboard, roadmap, lessons, problems, quests
    api/                # auth, lesson completion, run/submit, AI mentor
    login/, register/, page.tsx   # public routes
  components/            # editor, results panel, AI mentor chat, mastery chart, quiz, etc.
  lib/
    execution/           # harness + Judge0 + demo runner (see above)
    ai.ts                # Sage's 5 modes
    gamification.ts       # XP curve, streaks, mastery
    srs.ts                # spaced repetition scheduler
    recommendations.ts     # "what should I solve next"
    quests.ts, achievements.ts
    roadmap.ts, auth.ts, prisma.ts, utils.ts
```

## Deployment

### Option A — Docker Compose (simplest, single VM/host)

```bash
cp .env.example .env   # fill in JWT_SECRET, ANTHROPIC_API_KEY, and optionally Judge0 vars
docker compose up -d db
docker compose run --rm app npm run db:push
docker compose run --rm app npm run db:seed
docker compose up -d app
```

The app is served on port 3000. Put a reverse proxy (Caddy/nginx/Traefik) in front for TLS.

### Option B — Vercel (app) + managed Postgres (Neon/Supabase/Railway)

1. Create a Postgres database with your provider of choice; copy its connection string into
   `DATABASE_URL`.
2. Push the repo to GitHub and import it into Vercel.
3. Set `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY` (and `JUDGE0_API_URL`/`JUDGE0_API_KEY` if
   using Judge0) as Vercel environment variables.
4. Vercel runs `npm run build`, which runs `prisma generate && next build` automatically.
5. Run migrations once, from your machine or a one-off job: `DATABASE_URL=... npm run db:push && npm run db:seed`.

**Note:** on Vercel (or any serverless platform), the demo-mode Python fallback won't work — there
is no `python3` binary in the function runtime. JavaScript demo-mode still works (it's pure
Node.js), but for real multi-language grading in a serverless deployment, configure `JUDGE0_API_URL`.

### Option C — Any Node host (Railway, Render, Fly.io, a VPS)

`npm run build && npm start`, with the same environment variables. The included `Dockerfile`
(multi-stage, Next.js `output: 'standalone'`) works as-is on any of these.

## Extending the content

Everything a learner sees — topics, lessons, quiz questions, problems, test cases, quests,
achievements — is data in `prisma/seed.ts`, not hardcoded UI. To add a new problem: add an entry
to a topic's `problems` array with starter code, a solution (used for future "reveal answer"-style
features — no current endpoint exposes it), and test cases, then re-run `npm run db:seed` (it
upserts, so it's safe to re-run against existing data).

The Python function name for each problem is derived automatically from the camelCase
`functionName` (e.g. `twoSum` → `two_sum`) — write your Python starter/solution code using that
snake_case name.

## Known simplifications (by design, given scope)

- The in-browser code editor is a plain `<textarea>` with tab-indent handling, not a full
  Monaco/CodeMirror integration — swapping one in is a contained change to
  `src/components/CodeEditor.tsx`.
- Linked-list and binary-tree problems take/return plain arrays (LeetCode's own level-order array
  format for trees) rather than custom class instances, so the judge only ever needs to compare
  JSON-serializable values across any sandboxed language.
- Spaced-repetition "quality" is derived automatically from solve outcome + attempt count rather
  than a self-reported rating.
- `UserTopicProgress` exists in the schema for future caching/denormalization, but topic
  lock/unlock state is currently computed live from lesson completion — no extra writes needed to
  keep it in sync.

## License

MIT — do whatever you'd like with it.
