# UNSAID — Comprehensive Project Specification & Implementation Record

> *"Say what you can't say."*  
> *"Nobody knows it's me, but someone might understand."*

UNSAID is a minimal, melancholic, anonymous community and emotional archive platform where people can release thoughts, feelings, confessions, and unspoken dedications they never had the courage or opportunity to say out loud. Approved submissions appear on the platform and can automatically cross-publish to the project's official Facebook Page via Meta Graph API.

---

## 1. System Architecture

```
[ Client: Next.js 16 (App Router) ] 
       │ (CORS / REST / JSON)
       ▼
[ Backend: Node.js + Express 5 + TypeScript + Helmet + Rate Limit ]
       │ (Direct Pooler 5432 / Transaction Pooler 6543)
       ▼
[ Database & Storage: Supabase PostgreSQL + Prisma ORM + Supabase Storage ]
       │
       ▼
[ External: Meta Graph API (Facebook Page Auto-Publishing) ]
```

- **Frontend:** Next.js 16.3.5 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Sonner.
- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM (v6.19.3), Zod 3, Helmet, CORS, Express-Rate-Limit.
- **Database:** Supabase PostgreSQL (`aws-0-ap-southeast-1.pooler.supabase.com`), Prisma Client.
- **Storage:** Supabase Storage (`unsaid-images` bucket) with local fallback.
- **Audio Engine:** Native procedural Web Audio API (zero external audio file dependency).

---

## 2. Completed Features & Implementation Log

### 🎨 Visual & Experiential Design ("Midnight Aurora & Frosted Twilight")
- **Midnight Aurora Atmosphere:** `#08090d` canvas enriched with three procedural drifting aurora blooms (`animate-aurora-1/2/3`) in dusty blue (`#7C99B8`), indigo, and violet.
- **Choreographed Hero Sequence:** Staggered load animation respecting `prefers-reduced-motion` (bloom glow, rising pill, headline, animated left-to-right underline in `#7C99B8`, subtext, and CTA buttons).
- **Frosted Glass Cards:** Glass panels (`bg-[#0d1017]/75 backdrop-blur-2xl border-white/[0.08]`) with subtle watermark quotation marks (`“`), hover lift, and ambient glow.
- **Upgraded Navbar & Buttons:** Frosted glass navbar with live sanctuary pulse dot, and a frosted glass *"Leave a Thought"* CTA with a silver shimmer sweep animation (`animate-button-shimmer`).
- **Dynamic OpenGraph & Favicon:** Generates real-time 1200x630 OpenGraph social cards and dynamic feather SVG icons using Next.js `ImageResponse`.

### 💌 Core Confession & Moderation Workflow
- **Anonymous Submission (`/submit`):** Full textarea with live character counter (2,000 max), 10 emotional categories, image upload (5MB max via Supabase Storage), anti-doxxing regex validation, and real-time live preview card.
- **💌 Unsaid Letters / Recipient Dedications:** Users can address confessions to anyone (e.g., *"To: My younger self"*, *"To: The one that got away"*, *"To: S."*, *"To: Mom & Dad"*) with privacy filters rejecting phone numbers/emails. Displayed across cards, detail pages, quote cards, and Meta Facebook captions.
- **Moderator Dashboard (`/admin`):** Secure password hashing (`bcryptjs`) + JWT authentication. Includes a 4-card live metrics analytics dashboard (Pending Queue, Approved Feed, Total Submitted, Felt by Readers), approval/rejection queues, report dismissal, and manual Meta publishing retry.
- **Quiet Whispers (Unsent Replies):** Visitors can leave gentle anonymous notes of understanding on any confession (`GET / POST /api/posts/:id/whispers`) capped at 280 characters with anti-doxxing checks.
- **Quote Card Image Generator:** In-browser 1080x1080 canvas renderer that exports high-resolution aesthetic PNG cards with branding, recipient, quote text, and author attribution for Instagram stories.
- **Live Search & Server-Side Sorting:** Debounced search query + instant sort switch between **Latest** and **Most Felt** (sorted by like count).

### 🕯️ Interactive Community Features
- **🕯️ Virtual Candle Vigil ("You Are Not Alone"):** Real-time interactive vigil counter with a glowing golden flame and beacon animation. Readers can light a silent candle to comfort strangers in the dark.
- **🎵 Ambient Night Soundscapes Audio Player:** Built directly into the navbar with procedural Web Audio:
  - 🌧️ *Rain on Glass* (pink noise + resonance lowpass)
  - 🚂 *Distant Train* (54Hz sub-bass triangle + rhythmic rail click bursts)
  - 📼 *Tape Hiss* (vintage cassette warmth + gentle vinyl crackle)
  - Seamless loop, volume slider, and zero external MP3 network requests.
- **🎲 "Serendipity" / Random Thought of the Night:** Floating frosted glass button in the lower-left corner allowing readers to draw random, unexpected confessions from any stranger across time.
- **🛡️ Gentle Crisis & Distress Care Helper:** Real-time client-side regex detection of self-harm or suicidal keywords in the submit form that warmly offers the 988 Lifeline and international directories ([findahelpline.com](https://findahelpline.com)) without blocking the writer's expression.
- **🏷️ Emotional Mood Tags Bar:** Horizontal one-click pill filters (`#UnsentLetters`, `#3AMThoughts`, `#Heartache`, `#LettingGo`, `#Closure`, `#FirstLove`) on the home feed and submit drawer.

---

## 3. Security & Anonymity Hardening

1. **Zero Personal Identification:** No IP addresses, device identifiers, user accounts, or submission timestamps are ever stored or exposed in public responses.
2. **Anti-Doxxing Regex:** Validates both the `content` and `recipient` fields to strictly block phone numbers (`PHONE_REGEX`) and email addresses (`EMAIL_REGEX`).
3. **Strict Rate Limiting:**
   - Submissions: 10 requests / hour per client IP (`submissionLimiter`).
   - Admin Login: 5 requests / 15 minutes per IP (`loginLimiter`).
   - General API: 120 requests / minute per IP (`generalLimiter`).
4. **Body Size Limiter:** Requests strictly limited to `50kb` to protect against payload denial-of-service.
5. **Dynamic CORS:** Supports production domain, `localhost:3000`, and automatic Vercel preview domains (`/^https:\/\/.*\.vercel\.app$/`).
6. **HTTP Security Headers:** Powered by `helmet` with custom `crossOriginResourcePolicy: { policy: 'cross-origin' }` to allow verified image asset loading.

---

## 4. Vercel Deployment Guide

### Deploying the Frontend (Vercel)
1. In Vercel, import the repository and select the **`frontend`** directory as the Root Directory.
2. Framework Preset: **Next.js**.
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g. `https://unsaid-api.vercel.app/api` or `https://api.unsaid.me/api`).
   - `NEXT_PUBLIC_APP_URL`: `https://unsaid.me` (or your frontend Vercel URL).
4. Click **Deploy**.

### Deploying the Backend (Vercel / Render / Railway)
1. If deploying to Vercel, configure Root Directory as **`backend`**.
2. Environment Variables:
   - `DATABASE_URL`: Your Supabase pooler URL (Port 6543 with `?pgbouncer=true`).
   - `DIRECT_URL`: Supabase direct connection URL (Port 5432).
   - `JWT_SECRET`: High-entropy 64-character secret.
   - `CLIENT_ORIGIN`: Your frontend Vercel domain.
   - `NODE_ENV`: `production`.
   - `FB_PAGE_ID` & `FB_PAGE_ACCESS_TOKEN`: (Optional Meta Graph API keys).
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase credentials for image uploads.
3. Build Command: `npm run build` (runs `prisma generate && tsc`).
4. Start Command: `npm start`.

---

## 5. Future Roadmap

1. **⏳ Time Capsule / Scheduled Delivery:** Allow submitters to seal a confession with a future unlocking date (e.g. 1 year from today), hiding content until that date arrives.
2. **🔥 Cathartic "Burn into Embers" Mode:** A therapeutic option to write what cannot be said, click *"Burn into Fire"*, and watch the letters disintegrate into glowing CSS ember particles without persisting to the database.
3. **📱 Progressive Web App (PWA):** Enable offline reading, night-time push notifications, and home screen installation on iOS and Android.
4. **🤖 AI Sentiment Tagging & Moderation Assistant:** Automatic sentiment classification and pre-flagging of abusive content using edge LLMs.
5. **🌐 Multi-Language Localization:** Support internationalization (i18n) for global anonymous letters in Spanish, French, Japanese, and Khmer.
