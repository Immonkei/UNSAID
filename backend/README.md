# UNSAID — Backend API

RESTful API backend for UNSAID, an anonymous emotional thought-sharing platform with moderation and automated Facebook Page publishing.

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Validation:** Zod
- **Security:** Helmet, CORS, Express-Rate-Limit, BCrypt, JWT

## Directory Structure
```
backend/
├── prisma/
│   ├── schema.prisma      # PostgreSQL database schema
│   └── seed.ts            # Seed script for initial admin user
├── src/
│   ├── config/            # Environment & Database config
│   ├── controllers/       # Post, Report, & Admin controllers
│   ├── middleware/        # Auth, rate limiting, and error handling
│   ├── routes/            # Post and Admin routing
│   ├── services/          # Post, moderation, & Facebook services
│   ├── validators/        # Zod schemas with privacy/spam protections
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server listener & graceful shutdown
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and configure your `DATABASE_URL` and `JWT_SECRET`.

3. **Database Migration & Seeding:**
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## REST API Endpoints

### Public Endpoints
- `GET /api/health` — Health check
- `GET /api/posts` — Get approved feed (`?category=...&page=1&limit=20`)
- `GET /api/posts/:id` — Get single approved post
- `GET /api/posts/categories` — Get allowed categories
- `POST /api/posts` — Submit an anonymous thought (Rate limited: 10/hr)
- `POST /api/posts/:id/like` — Like/unlike a post
- `POST /api/posts/:id/report` — Report a post

### Admin Endpoints (Protected by JWT)
- `POST /api/admin/login` — Admin authentication
- `GET /api/admin/posts` — List posts with filters (`?status=...&category=...&search=...`)
- `GET /api/admin/posts/pending` — Get pending submissions
- `PATCH /api/admin/posts/:id/approve` — Approve submission & trigger Facebook publish
- `PATCH /api/admin/posts/:id/reject` — Reject submission
- `DELETE /api/admin/posts/:id` — Delete post
- `POST /api/admin/posts/:id/facebook-publish` — Manual Facebook publish retry
- `GET /api/admin/reports` — List submitted reports
- `PATCH /api/admin/reports/:id` — Resolve or dismiss report
