# 🚀 TrackPath Deployment Guide

This guide provides instructions to deploy **TrackPath** to popular cloud providers and production environments.

---

## ⚡ Option 1: Render.com (Recommended - Free & Fast)

Render can build and run both the Frontend and Backend automatically in a single unified web service.

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render.com](https://render.com) and click **"New +" ➔ "Web Service"**.
3. Select your TrackPath repository.
4. Configure the settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `(any strong random secret key)`
6. Click **"Deploy Web Service"**.

Render will automatically install dependencies, build the React frontend with Vite, and start the Express backend serving both the API and frontend at your assigned `.onrender.com` URL!

---

## 🚂 Option 2: Railway.app (1-Click Deploy)

1. Log in to [Railway.app](https://railway.app).
2. Click **"New Project" ➔ "Deploy from GitHub repo"**.
3. Select the TrackPath repository.
4. Add environment variables:
   - `PORT` = `5000`
   - `JWT_SECRET` = `(your secret key)`
5. Railway automatically detects `package.json`, runs `npm run build`, and starts the application.

---

## 🐳 Option 3: Docker / Self-Hosted VPS (AWS, GCP, DigitalOcean)

TrackPath includes a multi-stage `Dockerfile` and `docker-compose.yml`.

### Using Docker Compose:
```bash
# Clone repository
git clone <your-repo-url>
cd igot-ai-platform

# Build and start the container in background
docker compose up -d --build
```
Your app will be running live on `http://<your-server-ip>:5000`.

---

## 🌐 Option 4: Split Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on **Vercel** and the backend on **Render/Railway**:

### 1. Backend (Render / Railway):
Deploy the root repository with `npm start`. Note your backend URL (e.g. `https://trackpath-api.onrender.com`).

### 2. Frontend (Vercel):
1. Import repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend-react`.
3. Under **Environment Variables**, set:
   - `VITE_API_URL` = `https://trackpath-api.onrender.com`
4. Click **Deploy**. Vercel will build and serve the frontend at your `.vercel.app` domain with automatic SPA rewrites (`vercel.json` already configured).

---

## 🔑 Default Production Demo Accounts
| Role | Portal URL | Username / ID | Password |
| :--- | :--- | :--- | :--- |
| **Administrator** | `/admin` | `admin` | `admin123` |
| **Trainee** | `/trainee` | `trainee_demo` | `demo123` |
| **Employer** | `/employer` | `employer_demo` | `demo123` |
