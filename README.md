# Fund Intelligence Dashboard — Frontend

React frontend for the Nordic Analytics Fund Intelligence Dashboard. Connects to the [Fund Intelligence API](https://github.com/likhithashree01-beep/FundIntelligenceApi) to display fund metrics, NAV performance, and portfolio company data with JWT-authenticated access.

## Live demo

| | URL |
| --- | --- |
| Frontend | https://fund-intelligence-web.vercel.app |
| Backend API | https://fundintelligenceapi.onrender.com |

Sign in with `demo@nordic.io` / `demo123`.

### Deployment gotchas

- **Render cold start** — the backend runs on Render's free tier and sleeps after 15 min of inactivity. The first request after idle takes ~30 sec to wake up. Subsequent requests are instant.
- **SQLite resets on redeploy** — Render's filesystem is ephemeral; every new deploy starts with a fresh database. This is fine because the app auto-seeds on boot — data is always there when the server starts.
- **CORS** — currently set to `*` for simplicity. For a stricter production setup, set `CORS_ORIGIN=https://fund-intelligence-web.vercel.app` in Render's environment variables.
- **SPA routing** — `vercel.json` rewrites all routes to `index.html` so React Router handles navigation. Without it, direct URL access to `/login` or a hard refresh would return a 404 from Vercel.
- **Node version** — the backend is pinned to Node 20.x. `better-sqlite3` v11 fails to compile on Node 26 due to a breaking V8 API change.

## Repos

| Service | Repository |
| ------- | ---------- |
| Backend API | https://github.com/likhithashree01-beep/FundIntelligenceApi |
| Frontend (this repo) | https://github.com/likhithashree01-beep/FundIntelligenceWeb |

---

## (a) How to start both services

Both services are separate repositories and must be started independently. The frontend proxies `/api/*` to `http://localhost:4000` in dev, so the API must be running first.

### 1. Start the API (backend)

```bash
git clone https://github.com/likhithashree01-beep/FundIntelligenceApi
cd FundIntelligenceApi
npm install
cp .env.example .env       # safe fallbacks work for local dev
npm run dev                # http://localhost:4000
```

The SQLite database is created and seeded automatically on first boot — no manual setup needed.

### 2. Start the frontend

```bash
git clone https://github.com/likhithashree01-beep/FundIntelligenceWeb
cd FundIntelligenceWeb
npm install
cp .env.example .env       # optional for local dev
npm run dev                # http://localhost:5173
```

Open **http://localhost:5173** and sign in with:

```
Email:    demo@nordic.io
Password: demo123
```

### Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Vite dev server with HMR on port 5173 |
| `npm run build` | Type-check + production bundle |
| `npm test` | Vitest in watch mode |
| `npm run test:coverage` | Single run with V8 coverage report |
| `npm run lint` | ESLint |

---

## What's built

- **Login page** — JWT auth via `POST /api/auth/login`, token stored in `localStorage`, redirects to dashboard on success
- **Fund selector** — card list from `GET /api/funds`, auto-selects first fund on load
- **Metrics bar** — IRR, TVPI, DPI, RVPI, NAV, total commitments for the selected fund
- **NAV performance chart** — line chart from `GET /api/funds/:id/performance` via Recharts
- **Portfolio table** — full company list with `watch` (amber) and `at-risk` (rose) visual flags, MOIC calculated and colour-coded per row
- **Flag filter** — All / Watch / At risk buttons filter the portfolio table client-side
- **Dark mode** — system preference detected on first load, toggle in the header, persisted to `localStorage` with no flash on reload
- **Transparent token refresh** — on any 401, the client silently refreshes via `POST /api/auth/refresh` and retries the original request; concurrent 401s deduplicate into a single refresh call

---

## Stack

| Layer | Choice |
| ----- | ------ |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Server state | TanStack Query v5 |
| Routing | React Router v7 |
| Charts | Recharts |
| Tests | Vitest + React Testing Library |

---

## (b) Database schema & design decisions

The schema lives in the API repo at [`src/db/schema.sql`](https://github.com/likhithashree01-beep/FundIntelligenceApi/blob/main/src/db/schema.sql). Six tables:

| Table | Purpose |
| ----- | ------- |
| `users` | Auth identities — bcrypt-hashed passwords, no plaintext ever stored |
| `funds` | One row per fund; headline metrics (irr, tvpi, dpi, rvpi, nav) stored as a snapshot on the fund row |
| `nav_history` | Month-keyed NAV points; `UNIQUE(fund_id, month)` enforces one NAV per month at the DB level |
| `portfolio_companies` | Holdings per fund; indexed on `fund_id` for the detail-fetch path |
| `portfolio_company_flags` | Flags in a junction table — keeps the model extensible and lets the `?flag=` filter use an indexed equality match |

**Key decisions:**

- **Domain IDs as primary keys.** `fund-001`, `pc-001` come directly from the source data and appear in API responses, so keeping them as `TEXT` PKs avoids a lossy integer-to-string mapping.
- **Flags as a junction table, not a CSV column.** A `TEXT` flags column with comma-separated values would work at this scale, but it can't be efficiently indexed and breaks the moment flags need metadata (who set it, when). The junction table costs one join and buys correctness.
- **Monetary values as `INTEGER`.** The source data is whole-unit (not cents). Storing as-is preserves fidelity; a production schema would use `INTEGER` cents throughout and convert at the API layer.
- **`ON DELETE CASCADE` everywhere.** Removing a fund cleans up all child rows in one statement with no risk of orphans.
- **Composite index on `(fund_id, month)`.** The performance endpoint is a range scan over `nav_history` — this index serves it directly from the index without a table lookup.

---

## (c) API design decisions & trade-offs

**Two-token JWT auth (access + refresh)**
Short-lived access tokens (15 min) + longer refresh tokens (7 days), signed with **separate secrets** so a leaked signing key only compromises one token type. Both tokens carry a `type: 'access' | 'refresh'` claim; the auth middleware rejects a refresh token used as a bearer credential outright.

**Stateless refresh**
No refresh-token store — the server trusts the signature and the expiry. Trade-off: individual sessions cannot be revoked before the 7-day TTL. For production this would be backed by a token-ID table or Redis allow-list so a logout or compromise can invalidate a specific token immediately.

**Transparent refresh on the frontend**
The API client (`src/api/client.ts`) intercepts every 401, attempts one token refresh, and retries the original request — all invisible to React components. Concurrent 401s (e.g. three queries firing at once on mount) deduplicate into a single `POST /api/auth/refresh` via a singleton in-flight promise.

**Validation at the boundary**
Zod schemas guard every request body and query param. `YYYY-MM` is regex-validated server-side; `from > to` is rejected with a clear error message. Route handlers can trust their inputs.

**camelCase API / snake_case DB**
API responses match the original `funds.json` shape (camelCase). The mapping happens in the route layer. Keeps SQL idiomatic without leaking column names into the wire format.

**Tiered rate limiting**
Auth routes: 20 req / 15 min. API reads: 120 req / min. The tighter auth limit matches the real threat (credential stuffing); the looser read limit matches a dashboard that polls on a timer.

**Idempotent seed on boot**
`seed()` is a no-op if funds already exist. Running `npm run dev` on a fresh clone produces a working system with no extra steps.

---

## Frontend design decisions & trade-offs

**TanStack Query for server state**
Separates server state (fund list, fund detail, performance data) from UI state (selected fund, flag filter). Each query caches independently — switching between funds reuses cached data and doesn't re-fetch unnecessarily. `staleTime: 30s` prevents re-fetching on tab switch.

**Class-based dark mode via Tailwind v4**
`@variant dark (&:where(.dark, .dark *))` in CSS means the `dark` class on `<html>` activates all `dark:` utilities. An inline script in `index.html` reads `localStorage` and applies the class before React hydrates — eliminating the flash of unstyled content that a `useEffect` approach would cause.

**Auth event pattern to decouple API client from React**
The `apiRequest` function in `client.ts` has no React imports. When a refresh fails, it emits an `authExpired` event via a plain `Set` of callbacks. `AuthContext` subscribes to that event and flips `isAuthenticated` — keeping the API layer framework-agnostic.

**No global state manager**
React Context covers the two genuinely global concerns (auth state, theme). Everything else is either TanStack Query cache (server data) or local `useState` (selected fund, filter). Reaching for Redux or Zustand here would be over-engineering.

---

## (d) What I'd build next for production

**Auth & security**
- Refresh-token rotation and revocation — persist token IDs, rotate on every use, detect replay attacks
- Proper logout that invalidates the refresh token server-side
- HTTPS-only, `Secure` + `HttpOnly` cookies as an alternative to `localStorage` for token storage
- CORS allow-list locked to the actual frontend origin

**Features**
- Date range picker on the NAV chart (currently shows all available history)
- Fund comparison view — overlay two funds' NAV curves on the same chart
- Company detail drawer — click a portfolio company row to see full metadata
- Exportable portfolio table (CSV / PDF)
- Notifications for flag changes (a company moving from `watch` to `at-risk`)

**Data & backend**
- Real user management — registration, roles (analyst / partner / admin), audit log
- Pagination on `GET /api/funds` — three funds is fine, three thousand is not
- Computed analytics from raw cash-flow tables rather than stored metric snapshots
- PostgreSQL for multi-writer production workload; SQLite stays in place for dev/test
- Versioned migrations (Drizzle or numbered SQL files) instead of `CREATE TABLE IF NOT EXISTS`

**Observability**
- Ship logs to an aggregator (Loki / Datadog / CloudWatch)
- OpenTelemetry traces from the frontend through the API to the DB
- Sentry for unhandled client errors
- Real User Monitoring (Web Vitals — LCP, CLS, INP)

**Testing & CI**
- End-to-end tests with Playwright covering the full login → dashboard → filter flow
- GitHub Actions CI: lint + type-check + unit tests on every push
- API contract tests against an OpenAPI spec to catch backend/frontend drift early

---

## Tests

23 tests across 4 files, all passing:

```
src/lib/format.test.ts          12 tests — all 5 format helpers, edge cases incl. negatives
src/components/FlagBadge.test.tsx   3 tests — watch / at-risk / unknown flag rendering
src/components/FundSelector.test.tsx 3 tests — renders fund list, click fires onSelect
src/pages/LoginPage.test.tsx        5 tests — pre-fill, submit, 401 error, network error, loading state
```

```bash
npm test               # watch mode
npm run test:coverage  # single run + V8 coverage report
```

---

## Environment variables

See [`.env.example`](.env.example).

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `VITE_API_BASE_URL` | _(empty)_ | Absolute API URL for production builds. Empty = relative URLs, Vite proxy handles routing in dev. |
| `VITE_DEV_API_PROXY` | `http://localhost:4000` | Target for the Vite dev proxy. Override if the API runs on a different port. |
