# Author Support & Communication Portal

A web app that helps BookLeaf's team answer author queries faster and more consistently. Authors log in, see their books and royalties, and raise support tickets. Admins get a prioritised queue where every ticket arrives **already classified, scored and with an AI-drafted reply** based on BookLeaf's policies and the author's real data.

| | |
|---|---|
| **Live demo (app)** | https://author-support-portal-delta.vercel.app/ |
| **Live API** | https://author-support-portal-v3zb.onrender.com/api |
| **Health check | 	https://author-support-portal-v3zb.onrender.com/health |
| **Write-up** | 	docs/approach-note.pdf |

> **Note on the live demo:** the backend runs on a free tier that goes to sleep when unused. The first request after a pause can take up to about 50 seconds. Open the app once and give it a minute.

## Quick start for reviewers (2 minutes)

Log in at the live URL with these demo accounts.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bookleaf.test` | `Admin@123` |
| Author | `priya.sharma@email.com` | `Author@123` |

Every author from the dataset uses the password `Author@123`, with their own email from the dataset:
`priya.sharma`, `rohit.kapoor`, `ananya.reddy`, `vikram.joshi`, `meera.nair`, `arjun.malhotra`, `sneha.kulkarni`, `farhan.sheikh`, `kavita.deshmukh`, `diya.chatterjee` (all `@email.com`).

**Suggested walkthrough**
1. As **Priya**, open *Support Tickets* and click *Create Ticket*. Pick *Whispers of the Ganges* and write: "I published my book 4 months ago and still have not received any royalty."
2. As **admin** (a second browser or a private window), the ticket appears within about 10 seconds with a category and priority already set by the AI.
3. Open the ticket. The AI suggested reply uses the book's real numbers and the next payout date. Click *Use this draft*, edit it, and send.
4. Back as Priya, the reply appears on her ticket without a page refresh.

**Accounts that exercise the edge cases**
- **Sneha Kulkarni**: has a book still in production (*Midnight in Mysore*: no MRP, no publication date, no royalties).
- **Ananya Reddy, Arjun Malhotra, Kavita Deshmukh, Diya Chatterjee**: have books with royalty earned but nothing paid out yet.
- **Priya Sharma**: has one book fully paid and one with pending royalty.

## Features

**Author portal**
- Email and password login. Each author only ever sees their own data.
- **My Books:** title, ISBN, genre, publication date, status, MRP, copies sold, royalty earned / paid / pending, last payout date, cover image. Books in production show a progress bar instead of royalty figures.
- **Support Tickets:** submit a query (book dropdown or "General / Account Level", subject, description, optional attachment) and track every ticket with its replies. The list and the ticket page refresh by themselves every 10 seconds.

**Admin portal**
- **Ticket queue:** filter by status, category, priority, assignee and date range. Sorted by priority, then oldest first. Tickets unresolved for more than 48 hours show their age in red. Count cards and a "needs attention" strip (critical and unassigned).
- **AI auto-classification** into the six categories and a **priority score** (Critical, High, Medium, Low). Both can be overridden.
- **AI-drafted reply** shown when a ticket is opened: edit it, use it, regenerate it, or ignore it and write by hand.
- Ticket management: change status, assign to yourself, and add **internal notes** that authors can never see.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon) with Prisma 7 |
| Auth | JWT (Bearer token), bcrypt password hashing |
| Validation | Zod |
| AI | OpenAI `gpt-4o-mini` |
| Images | Cloudinary (only the URLs are stored in the database) |
| Hosting | Render (API), Vercel (frontend), Neon (database) |

## Run it locally

**Requirements:** Node.js 22 and a PostgreSQL database (a free Neon database works well).

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env` from the example (`copy .env.example .env` on Windows, `cp .env.example .env` on macOS and Linux) and fill it in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | A long random string (at least 16 characters). Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1d` |
| `CLIENT_ORIGIN` | Frontend address allowed by CORS, for example `http://localhost:5173` (no trailing slash) |
| `OPENAI_API_KEY` | Your OpenAI key. **Optional:** without it the app still works and uses the keyword fallback |
| `LLM_MODEL` | Defaults to `gpt-4o-mini` |
| `PORT` | Defaults to `5000` |

Then create the tables, load the dataset, and start the server:

```bash
npx prisma generate        # builds the Prisma client
npx prisma migrate deploy  # creates the tables from the migration files
npm run db:seed            # loads the 10 authors, 18 books and the admin account
npm run dev                # http://localhost:5000
```

`npm run db:seed` is safe to run again: it updates existing rows and never creates duplicates. To start completely clean, run `npx prisma migrate reset` and then seed again.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev                # http://localhost:5173
```

### 3. Optional: cover images

The covers are already uploaded and their URLs are saved in `server/data/book_covers.json`, which the seed script reads. `server/scripts/upload-covers.js` is the one-off developer tool that uploaded them to Cloudinary (it needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env` and a local `images` folder named `BK001.jpg`, `BK002.jpg`...). You do not need to run it.

## Architecture

### Project structure

```
server/
├── prisma/
│   ├── schema.prisma          # data model
│   ├── migrations/            # migration history
│   └── seed.js                # loads the dataset, creates the admin
├── data/                      # bookleaf_sample_data.json, book_covers.json
├── scripts/upload-covers.js   # optional Cloudinary upload tool
└── src/
    ├── server.js / app.js     # start-up, Express setup
    ├── config/env.js          # validates environment variables on start
    ├── lib/prisma.js          # the single Prisma client
    ├── middleware/            # auth + roles, validation, rate limits, error handler
    ├── validators/            # Zod schemas
    ├── routes/                # URL -> controller
    ├── controllers/           # thin: read the request, call a service, send the response
    ├── services/              # business logic and database queries
    │   └── ai/                # llmClient, prompts, knowledgeBase, triage, draft, fallback
    └── utils/                 # AppError, royalty date maths

frontend/src/
├── api/          # one fetch wrapper + one file per resource
├── context/      # logged-in user
├── hooks/        # useFetch (loading, errors, 10-second polling)
├── routes/       # ProtectedRoute (login + role check)
├── layouts/      # sidebar layout shared by both roles
├── pages/        # login, author pages, admin queue, ticket details
└── components/   # shared UI, plus ticket/ and admin/ pieces
```

### Decisions and why

- **Layered backend (routes, controllers, services).** Controllers stay thin, all rules and queries live in services, and the AI code is isolated in `services/ai`. Each file has one job, which keeps the code easy to follow and to test.
- **Access control enforced where the data is read, not just on the routes.** Authors are filtered by their own id inside the database query, and a ticket that is not theirs returns `404` so they cannot tell it exists. Role checks (`requireRole`) guard every admin route. The response is also shaped per role: authors never receive category, priority, AI fields or internal notes.
- **PostgreSQL with Prisma.** The data is relational (authors, books, tickets, replies, notes). Prisma gives typed queries and a migration history. Status, category and priority are enums. The priority enum is declared Critical to Low, so sorting by it gives the urgent-first queue for free.
- **`category` and `aiCategory` are separate columns** (same for priority). The live value is what admins see and edit, while the AI's original suggestion is kept. An admin override is never lost, and an AI result that arrives late never overwrites an admin's choice.
- **`aiStatus` (`PENDING`, `DONE`, `FALLBACK`)** makes the AI's state visible in the data and the UI.
- **Polling instead of WebSockets.** A 10-second poll is simple, works on free hosting and proxies, and meets "near real time". See limitations for what I would use in production.
- **Validation and errors.** Every input goes through a Zod schema. All errors return one JSON shape, with no raw stack traces and no generic 500s for bad input.
- **Money is stored as `Decimal`** and converted to numbers at the API edge.
- **Images:** only the Cloudinary URL is stored, in `Book.coverImageUrl` (optional).

### Data model

`User` (role `ADMIN` or `AUTHOR`) · `Book` (belongs to an author) · `Ticket` (author, optional book, status, category, priority, AI fields, assignee, saved draft) · `TicketMessage` (replies, with an `isAssisted` flag recording that the reply started from the AI draft) · `InternalNote` (admin only). `TicketActivity` is in the schema for a future audit trail and is not used yet.

## How the AI integration works

**Model:** OpenAI `gpt-4o-mini`. It is inexpensive and fast, supports JSON output, and is good enough for classification and short policy-grounded replies. The model is called from one file (`llmClient.js`), so switching provider means changing that file only.

### 1. Classification and priority (on ticket creation)

- Runs **in the background** right after the ticket is saved, so the author never waits for the AI.
- One call returns JSON `{category, priority, reason}`. The answer is **validated against the allowed lists**; anything else is rejected and treated as a failure.
- The prompt defines each category and gives a priority rubric with examples (for example: no royalty for 6 months or more is Critical, any ISBN error is High, an author bio change is Low). It tells the model to judge by what the author describes, not by tone.
- It sends only the subject, the (clipped) description, and the book's title and status. No policies, no history. About 400 input tokens.

### 2. Drafted reply (when an admin opens a ticket)

- The system prompt holds the persona, BookLeaf's tone guidelines, firm rules, and **only the knowledge-base section for the ticket's category** plus the framing guidance for that kind of query.
- The user message holds the author's first name, the **real book record** (or a short list of the author's books for account-level queries), the ticket text, and the last three replies.
- **Facts the model should not work out are worked out in code and given to it as facts:** the next royalty payout deadline (`utils/dates.js`), whether pending royalty is above the Rs 1,000 minimum, and how long ago a book was published. Early drafts got these wrong; moving them into code fixed it.
- Rules in the prompt: never invent numbers, dates or policies; a book still in production is not earning royalties; never repeat the author's own claims about dates or amounts; plain text only.
- The admin always reviews the draft. The panel reminds them to check numbers and dates, and the sent reply records whether it came from the draft.

### Cost awareness

- Only the relevant policy section is sent, never the whole knowledge base or the full ticket history.
- Inputs are trimmed (subject, description and previous replies are clipped; at most the last three replies).
- Output is capped (120 tokens for classification, 450 for drafts), at low temperature.
- **Drafts are saved on the ticket**, so reopening a ticket costs nothing. A new draft is generated only on request or when the category changes.
- The AI endpoints are rate limited (20 requests per minute).
- Token usage is logged for every call. Measured on real tickets: roughly **440 tokens for classification and 1,180 for a draft**, about 1.6k tokens per ticket in total.

### Error handling and graceful degradation

- Every call has a 15-second timeout and one retry. A **circuit breaker** pauses AI calls for 60 seconds after three failures in a row, so an outage does not slow every request.
- If classification fails for any reason, including a missing, wrong or rate-limited key, **keyword rules** pick a category and priority and the ticket is marked `FALLBACK`. The admin queue shows "Rules-based" so people know to double-check it. The ticket is always created.
- If drafting fails, the API still returns normally with `available: false` and a message, and the admin simply writes the reply by hand.
- The API key lives only in the server's environment variables. It is never sent to the frontend and never committed.

## API documentation

Base URL: `/api`. Send `Authorization: Bearer <token>` on every route except login. Success responses are `{ "data": ... }` (lists also include `meta`). Errors always look like:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request data", "details": [{ "field": "subject", "message": "..." }] } }
```

### Auth

| Method | Endpoint | Who | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Body `{ email, password }`. Returns `{ token, user }`. Limited to 10 failed attempts per 15 minutes per IP. |
| GET | `/auth/me` | Any | The logged-in user. |

### Books

| Method | Endpoint | Who | Description |
|---|---|---|---|
| GET | `/books` | Any | Authors get their own books. Admins get all books with the author's name. |

### Tickets

| Method | Endpoint | Who | Description |
|---|---|---|---|
| GET | `/tickets` | Any | Authors: their own tickets, newest first. Admins: the queue, unresolved only by default, sorted by priority then oldest. Query: `status` (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `category`, `priority`, `assignedTo` (`me` or `unassigned`), `from`, `to` (dates), `page`, `limit` (max 100). Admin-only filters are ignored for authors. |
| POST | `/tickets` | Author | Body `{ bookId?, subject (5-150), description (10-5000) }`. Omit `bookId` for General / Account Level. The book must belong to the author. |
| GET | `/tickets/stats` | Admin | Counts for the dashboard: total, open, inProgress, resolved, closed, unassigned, critical. |
| GET | `/tickets/:id` | Any | One ticket with its replies. Admins also get internal notes and AI fields. Authors get `404` for tickets that are not theirs. |
| PATCH | `/tickets/:id` | Admin | Any of `{ status, category, priority, assignedTo: "me" \| null }`. Changing the category discards the saved AI draft. |
| POST | `/tickets/:id/messages` | Admin | Body `{ content, status?, isAssisted? }`. The reply the author sees. The first reply moves an open ticket to In Progress and assigns it to the sender. |
| POST | `/tickets/:id/notes` | Admin | Body `{ content }`. A private note. |
| GET | `/tickets/:id/draft` | Admin | The AI draft: `{ draft, available, cached, generatedAt }` or `{ draft: null, available: false, reason }`. |
| POST | `/tickets/:id/draft/regenerate` | Admin | Writes a fresh draft. |

`GET /health` (outside `/api`) returns `{ "status": "ok" }`.

### Error codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_BOOK` | Bad input |
| 401 | `UNAUTHENTICATED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` | Missing, expired or wrong credentials |
| 403 | `FORBIDDEN` | Wrong role |
| 404 | `NOT_FOUND` | Unknown route, or a ticket the user may not see |
| 429 | `RATE_LIMITED` | Too many login or AI requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details are logged, never returned) |

## Deployment

- **Database:** Neon (PostgreSQL).
- **API (Render):** root directory `server`; build command `npm install && npx prisma generate && npx prisma migrate deploy`; start command `npm start`; health check path `/health`. Environment variables as in the table above, plus `NODE_VERSION=22`.
- **Frontend (Vercel):** root directory `frontend`; environment variable `VITE_API_URL=https://author-support-portal-v3zb.onrender.com/api`. `frontend/vercel.json` rewrites every path to `index.html` so refreshing a page works.
- After the first deploy, set `CLIENT_ORIGIN` on the API to the Vercel address.

## Assumptions

- Royalty quarters are **calendar quarters** (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec), and the payout deadline is 45 days after quarter end. The drafts say royalties are paid "by" that date, not "on" it.
- The dataset's three status texts are mapped onto a nine-stage `BookStatus` enum (`Published & Live` is `PUBLISHED`, and the two production states are `COVER_DESIGN` and `TYPESETTING`).
- Authors do not see priority, category or AI details. Those are for the support team.
- ISBNs are shown exactly as given in the dataset (they contain `XXXX` placeholders).
- All demo author accounts share one password, for easy testing only.
- File attachments are UI only, as the brief allows. The form tells the author that attachments are not uploaded.

## Known limitations and what I would improve

- **No automated tests yet.** I tested manually against the dataset, including the failure cases (backend down, AI key wrong, wrong role). Next: API tests with Supertest and an evaluation set of sample tickets to measure classification accuracy and draft quality.
- **AI drafts can still slip.** In testing I saw small errors, such as repeating an author's own claim about timing. Humans review every draft. In production I would add an automatic check that compares the numbers and dates in a draft against the data before showing it.
- **Classification runs inside the web process.** If the server restarts mid-call, the ticket stays "AI pending" until an admin opens it (which classifies it). Production would use a job queue with retries.
- **Polling, not push.** I would use server-sent events or WebSockets, plus email notifications when a ticket gets a reply.
- **Attachments are not uploaded.** Next: signed direct-to-storage uploads.
- **Login token is kept in `sessionStorage`.** I would move to httpOnly cookies with refresh tokens. Rate limits are in memory, so they need Redis when running more than one instance.
- **Ticket text is untrusted input to the model** (prompt injection). The output only ever goes to a human reviewer as a draft, but production should add input and output checks.
- Authors cannot reply inside a ticket (not in the brief), there is no full-text ticket search, the audit-trail table is unused, and the free hosting tiers have cold starts.
