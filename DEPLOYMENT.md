# CodePulse — Production Deployment Guide

CodePulse is fully containerized and production-ready for automated 1-click cloud deployments on **Render**, **Railway**, **Docker / VPS**, or a split **Vercel + Supabase / Render** setup.

---

## ? Option 1: 1-Click Render.com Deployment (Recommended — All-In-One Free Tier)

Render can deploy both the PostgreSQL database and the full-stack web service simultaneously using the included [`render.yaml`](./render.yaml).

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** ? **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Render will provision:
   - A free **PostgreSQL Database** (`codepulse-db`)
   - A web service running Node.js + React static bundle with automatic database migration (`npx prisma db push`) and seed setup.
5. Click **Apply** — your platform will be live with an SSL URL (e.g. `https://codepulse.onrender.com`).

---

## ?? Option 2: Docker & Docker Compose (Self-Hosted VPS / AWS EC2 / DigitalOcean)

The platform includes a production multi-stage [`Dockerfile`](./Dockerfile) and [`docker-compose.yml`](./docker-compose.yml).

### Quick Start with Docker Compose:
```bash
# Clone and enter directory
git clone <your-repo-url>
cd CodePulse

# Build and start both PostgreSQL & CodePulse App
docker compose up -d --build
```
- PostgreSQL will run on port `5432` with persistent volumes.
- The web app + API will run on `http://localhost:5000` (or `http://<your-server-ip>:5000`).

---

## ?? Option 3: Railway.app Deployment

1. Go to [railway.app](https://railway.app) and create a **New Project**.
2. Click **Provision PostgreSQL**.
3. Add a **New Service** from your GitHub Repository.
4. In the service settings, add Environment Variables:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`: Any 32+ character random string
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
5. Set the Build Command:
   ```bash
   npm run install:all && npm run build --prefix client && npx prisma generate --prefix server
   ```
6. Set the Start Command:
   ```bash
   cd server && npx prisma db push && node prisma/seed.js && node server.js
   ```

---

## ?? Option 4: Split Hosting (Vercel Frontend + Render/Railway Backend)

If you prefer hosting the client on **Vercel**:
1. Deploy `server/` on Render or Railway using the steps above.
2. In Vercel, import the repo and select **Root Directory** as `client`.
3. Add an Environment Variable in Vercel:
   - `VITE_API_URL`: `https://<your-backend-url>/api`
4. Click **Deploy**. The included [`vercel.json`](./vercel.json) handles client-side SPA routing rewrites.

---

## ?? Initial Production Credentials

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@codepulse.dev` | `password123` |
| **Dr. Vikramaditya (Mentor)** | `vikram@codepulse.dev` | `password123` |
| **Ananya Sharma (Mentor)** | `ananya@codepulse.dev` | `password123` |
