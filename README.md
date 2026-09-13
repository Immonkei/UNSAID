# UNSAID

> *"Say what you can't say."*
>
> *"Nobody knows it's me, but someone might understand."*

UNSAID is a safe, minimal, emotional anonymous platform where anyone can submit thoughts, confessions, feelings, or messages they never had the courage or opportunity to say out loud. Approved submissions appear on the public feed and can automatically be published to the project's Facebook Page.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons
- **Backend:** Node.js, Express, TypeScript, Zod, Helmet, CORS, Express-Rate-Limit
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Authentication:** BCrypt password hashing + JWT for admin/moderation
- **Social Publishing:** Meta Graph API (Facebook Page integration)
- **Containerization:** Docker Compose for local PostgreSQL

---

## 📁 Repository Structure

```
UNSAID/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema (users, posts, reports, likes)
│   │   └── seed.ts             # Initial admin account seed
│   ├── src/
│   │   ├── config/             # env.ts & database.ts
│   │   ├── controllers/        # post.controller.ts, admin.controller.ts
│   │   ├── middleware/         # auth, rateLimit, error
│   │   ├── routes/             # post.routes.ts, admin.routes.ts
│   │   ├── services/           # post, moderation, facebook (Meta Graph API)
│   │   ├── validators/         # Zod schemas with privacy/spam detection
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entrypoint with graceful shutdown
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home feed & category filtering
│   │   ├── submit/page.tsx     # Anonymous submission page
│   │   ├── post/[id]/page.tsx  # Single thought view
│   │   └── admin/
│   │       ├── page.tsx        # Moderation dashboard (Approve, Reject, FB publish, Reports)
│   │       └── login/page.tsx  # Secure moderator sign-in
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostFeed.tsx
│   │   ├── SubmitForm.tsx
│   │   └── CategoryFilter.tsx
│   ├── lib/api.ts              # Frontend API client
│   └── types/post.ts           # TypeScript interfaces
├── docker-compose.yml          # Local PostgreSQL database
├── UNSAID_PROJECT_SPEC.md      # Full specification
└── package.json                # Root automation scripts
```

---

## 🚀 Quick Start Guide

### 1. Start the PostgreSQL Database

Using Docker Desktop:
```bash
docker compose up -d
```
*Or use any existing PostgreSQL instance (e.g. Neon, Supabase, local PostgreSQL) and set the `DATABASE_URL` in `backend/.env`.*

### 2. Configure Backend Environment

Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/unsaid?schema=public"
JWT_SECRET="your_secret_key"
ADMIN_EMAIL="admin@unsaid.me"
ADMIN_PASSWORD="Admin1234!"

# Optional: Meta / Facebook Page Graph API
FB_PAGE_ID=""
FB_PAGE_ACCESS_TOKEN=""
FB_API_VERSION="v19.0"
```

### 3. Run Database Migrations & Admin Seed

```bash
npm run db:migrate
npm run db:seed
```
*Creates initial admin account: `admin@unsaid.me` / `Admin1234!`.*

### 4. Start Development Servers

**Backend:**
```bash
npm run dev:backend
# Running at http://localhost:5000
```

**Frontend:**
```bash
npm run dev:frontend
# Running at http://localhost:3000
```

---

## 🔒 Security & Anonymity Highlights

- **Zero Identity Footprint:** Public API never returns IP addresses, device identifiers, or timestamps of submission; all thoughts are attributed strictly to `"Anonymous"`.
- **Anti-Doxxing Regex:** Thought submissions are validated with automated pattern checks rejecting phone numbers and email addresses.
- **Strict Rate Limiting:** Submissions are capped at 10 thoughts/hour per client; login endpoints are protected against brute-force attacks.
- **Decoupled Facebook Integration:** Moderation status is strictly separated from Meta API publishing status so Facebook network issues never block or alter moderation decisions.
