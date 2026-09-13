# UNSAID — Project Specification

*"Say what you can't say."*

UNSAID is an anonymous platform where people can share thoughts, feelings, confessions, stories, and messages they never had the courage or opportunity to say.

Approved submissions appear on the website and can automatically be published to the project's Facebook Page.

---

## 1. Product Goal

Create a safe, simple, emotional, anonymous community where anyone can submit an unsaid thought without creating an account.

The website is the main submission and community platform. The Facebook Page acts as a public distribution channel for approved thoughts.

**Core flow**

```
User
  ↓
Write Unsaid Thought
  ↓
Anonymous Submission
  ↓
Backend Validation / Spam Check
  ↓
Database
  ↓
Moderation
  ↓
Approved
  ├── Website
  └── Facebook Page
```

---

## 2. MVP User Features

### 2.1 Home Page

- UNSAID logo/name
- Short tagline
- "Share your thought" button
- Latest anonymous thoughts
- Categories
- Short About section

### 2.2 Submit Thought

Users do not need an account.

**Form fields**
- Thought content (textarea)
- Category (select)
- Agree to community rules (checkbox)
- Submit anonymously (button)

**Categories:** Love, Heartbreak, Life, Family, Friendship, Overthinking, Motivation, Regret, Letting Go, Other

**Requirements**
- Content is required
- Reasonable character limit
- Category is required
- User must agree to community rules
- Submission must be anonymous publicly
- Validate and sanitize input on the server

---

## 3. Anonymous System

The public must never see the submitter's identity.

Public post shape:
```json
{
  "content": "I still miss her.",
  "author": "Anonymous"
}
```

**Never expose:** email, phone number, IP address, device information, account information, or any other identifying information.

Technical information may be retained when necessary for security and abuse prevention, but must never be exposed publicly.

The platform should also attempt to detect and prevent users from posting unnecessary personal information.

---

## 4. Post Lifecycle

```
PENDING
   │
   ├── APPROVED
   │      │
   │      └── Eligible for publication
   │
   └── REJECTED
```

Keep publication status **separate** from moderation status so a Facebook API failure can never change the moderation decision.

**moderation_status:** `PENDING` / `APPROVED` / `REJECTED`
**facebook_status:** `NOT_PUBLISHED` / `PUBLISHING` / `PUBLISHED` / `FAILED`

---

## 5. Public Feed

Approved thoughts appear on the website with category, content, "— Anonymous", timestamp, like count, and report action.

**MVP interactions:** Like, Report, View post

**Not in v1:** Comments (adds significant moderation/abuse complexity — defer to later).

---

## 6. Admin Dashboard (`/admin`)

Used to moderate submissions and manage the platform.

**Capabilities**
- Login
- View pending / approved / rejected posts
- Approve posts
- Reject posts
- Delete posts
- Search posts
- Filter by category
- Review reports
- View Facebook publishing status

---

## 7. Facebook Integration

Automatic publishing to the project's Facebook Page after admin approval.

```
Post Submitted → Moderation → Admin Approves → Backend → Meta Graph API → Facebook Page
```

**Stored fields:** `facebook_post_id`, `facebook_status`, `facebook_published_at`, `facebook_error`

**Security requirements**
- Use a Facebook Page, not a personal profile
- Keep Meta credentials on the server
- Never expose access tokens to the frontend
- Never hard-code secrets into source code
- Store secrets in environment variables
- Handle API failures gracefully
- Log publishing errors without exposing credentials
- Verify Meta API permissions and Page access-token requirements against current Meta docs during implementation

---

## 8. Reporting System

Every public post has a 🚩 Report action.

**Reasons:** Spam, Harassment, Hate speech, Sexual content, Personal information, Threat, Other

**Table:** `reports (id, post_id, reason, status, created_at)`

Admin can review and resolve reports.

---

## 9. Content Moderation

A post must **never** auto-appear on Facebook immediately after submission.

```
User Submission → Input Validation → Spam/Abuse Checks → PENDING → Admin Review → APPROVED → Facebook + Website
```

**Future:** AI-assisted moderation classifying content as Safe / Potentially unsafe / Requires manual review — AI assists, never the sole gate.

---

## 10. Security Requirements

- Helmet
- CORS configuration
- Rate limiting (e.g. 10 submissions/hour per client)
- Input validation
- Request body size limits
- SQL injection protection
- XSS protection
- Secure admin authentication
- Environment variables
- Error handling
- Security logging

The server must never trust data simply because the frontend validated it.

---

## 11. Database Design (PostgreSQL)

**users** — admin accounts only initially
```
id, email, password_hash, role, created_at
```
Roles: `ADMIN`, `MODERATOR`

**posts**
```
id, content, category, moderation_status, facebook_status,
facebook_post_id, facebook_published_at, facebook_error,
created_at, approved_at
```

**reports**
```
id, post_id, reason, status, created_at, resolved_at
```

**likes** *(post-MVP)*
```
id, post_id, anonymous_identifier, created_at
```

---

## 12. REST API

**Public**
```
GET  /api/posts
GET  /api/posts/:id
GET  /api/categories
POST /api/posts
POST /api/posts/:id/report
POST /api/posts/:id/like
```

**Admin**
```
POST   /api/admin/login
GET    /api/admin/posts
GET    /api/admin/posts/pending
PATCH  /api/admin/posts/:id/approve
PATCH  /api/admin/posts/:id/reject
DELETE /api/admin/posts/:id
GET    /api/admin/reports
```

**Facebook** — handled internally by `facebookService.publishPost()`, never exposed as a public endpoint.

---

## 13. Backend Architecture

Modular monolith (no microservices for MVP).

```
backend/
├── src/
│   ├── config/          (database.ts, env.ts)
│   ├── controllers/     (post, report, admin)
│   ├── routes/          (post, report, admin)
│   ├── services/        (post, moderation, facebook)
│   ├── middleware/      (auth, rateLimit, error)
│   ├── validators/      (post.validator.ts)
│   ├── app.ts
│   └── server.ts
├── prisma/schema.prisma
├── .env / .env.example
├── package.json
└── README.md
```

---

## 14. Frontend Architecture

Next.js + TypeScript

```
frontend/
├── app/
│   ├── page.tsx
│   ├── submit/page.tsx
│   ├── post/[id]/page.tsx
│   └── admin/
├── components/
│   ├── PostCard.tsx
│   ├── PostFeed.tsx
│   ├── SubmitForm.tsx
│   ├── CategoryFilter.tsx
│   └── Navbar.tsx
├── lib/api.ts
└── types/post.ts
```

---

## 15. Recommended Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Validation | Zod |
| Auth | Secure admin session or JWT |
| API | REST |
| Social | Meta Graph API (Facebook Page) |
| Deployment | Vercel (frontend), Render/Railway (backend), Supabase/Neon (Postgres) — finalize at deploy time |

---

## 16. Design Direction

Not a generic social-media clone.

**Brand feeling:** Minimal, Emotional, Anonymous, Calm, Cinematic, Personal

**Visual direction:** Dark/off-white background, modern clean typography, minimal rounded cards, very subtle animations. Palette: black, white, dark blue, soft gray, one small accent color. The words are the main focus.

---

## 17. Development Phases

1. **Foundation** — repo, frontend/backend scaffolds, TypeScript config, env vars, PostgreSQL + Prisma setup, project structure
2. **Posts** — post API (create/get/get-one), categories, validation, DB integration
3. **Moderation** — admin auth, pending/approve/reject/delete
4. **Public Website** — homepage, feed, submit page, post cards, category filtering, responsive design
5. **Security** — rate limiting, input sanitization, validation, abuse prevention, secure auth, error handling, logging
6. **Facebook** — create Page, configure Meta app + Page access + Graph API, publish approved posts, store post ID, handle failures
7. **Community** — likes, reports, search, trending thoughts
8. **Production** — deploy frontend/backend, production DB, domain, monitoring, logging, backups

---

## 18. Future Features

🔥 Trending · 💬 Comments · ❤️ Reactions · 🔍 Search · 🏷️ Hashtags · 🌙 Dark mode · 📱 PWA · 🔔 Notifications · 🤖 AI moderation · 📊 Admin analytics · 📸 Auto quote-card generation · 📘 Auto FB publishing · 📸 Instagram sharing

**Quote-card idea:** `User Thought → UNSAID Branding → Generate Quote Image → Facebook/Instagram` — makes the social presence visually recognizable.

---

## 19. MVP Definition of Done

End-to-end flow works: a stranger submits a thought anonymously → it's stored in PostgreSQL → an admin moderates and approves it → it appears on the website and (optionally) the Facebook Page — and the submitter's identity remains private throughout.

---

## 20. Development Order (build one step at a time)

1. Product requirements + database design
2. GitHub + project structure
3. Express REST API
4. PostgreSQL + Prisma
5. Post submission
6. Moderation system
7. Next.js UI
8. Security hardening
9. Meta/Facebook integration
10. Deployment

Each step should be implemented, tested, and understood before moving to the next. Do not build the entire system at once.

---

## 21. Product Principle

> "Nobody knows it's me, but someone might understand."

The technology should stay in the background. The thoughts and emotions are the product.
