# UNSAID — Production Deployment Guide

## 1. Architecture Overview
- **Frontend**: Next.js 16 (App Router) on **Vercel**
- **Backend**: Express + TypeScript + Prisma on **Render** / **Railway** / **Fly.io** (or standard Docker container)
- **Database**: PostgreSQL on **Supabase** (IPv4 Connection Pooler in Singapore `ap-southeast-1`)
- **Media Storage**: Supabase Storage Bucket (`unsaid-images`, public)

---

## 2. Environment Variables Checklist

### Backend (`backend/.env`)
| Variable | Value Description | Example / Production Setting |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | Supabase IPv4 Pooler (Transaction pooler, port 6543) | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Connection (Session pooler, port 5432) | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | 32+ character random secret string | Secure production secret |
| `CORS_ORIGIN` | Production frontend domain | `https://unsaid.me,https://unsaid-phi.vercel.app` |
| `SUPABASE_URL` | Supabase project endpoint | `https://iifwbcrugzlsxkhgmcvd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret | Set from Supabase Dashboard |
| `SUPABASE_STORAGE_BUCKET` | Image bucket name | `unsaid-images` |
| `FB_PAGE_ID` | Facebook Page ID (Optional) | `61594211796148` |
| `FB_PAGE_ACCESS_TOKEN` | Meta Graph API token (Optional) | Add once Meta appeal resolves |

### Frontend (`frontend/.env.production` or Vercel Dashboard)
| Variable | Value Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public backend URL | `https://api.unsaid.me/api` (or Render service URL) |

---

## 3. Backend Deployment (Render / Railway / Docker)

### Option A: Deploy via Docker (Recommended)
A multi-stage production [`backend/Dockerfile`](file:///C:/Users/Phanith/Documents/UNSAID/backend/Dockerfile) has been generated:
1. Link your GitHub repository to Railway or Render.
2. Select **Docker** as the runtime.
3. Configure the environment variables from the checklist above.
4. The service will automatically run `npx prisma generate`, build the TypeScript code, and start on port 5000.

### Option B: Deploy via Node Build Script
- **Build Command**: `npm ci && npx prisma generate && npm run build`
- **Start Command**: `npm start` (runs `node dist/server.js`)

---

## 4. Frontend Deployment (Vercel)
1. Import repository on [vercel.com](https://vercel.com).
2. Set Root Directory: `frontend`
3. Framework Preset: `Next.js`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`
5. Click **Deploy**.
