# Deployment Guide: Free Hosting

This guide provides step-by-step instructions for deploying the Financial App for **free** using modern cloud platforms.

## Stack Overview
- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Render](https://render.com/)
- **Database**: [Neon.tech](https://neon.tech/) (PostgreSQL)
- **Redis Cache**: [Upstash](https://upstash.com/) (Free Tier)

---

## Step 1: Database Setup (Neon.tech)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project called `financial-app`.
3. In the dashboard, copy the **Connection String**. It should look like this:
   `postgres://alex:abcd@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb`
4. Keep the separate parts (host, user, password, database) ready for later.

---

## Step 2: Redis Setup (Upstash)
1. Go to [Upstash](https://upstash.com/) and create a free account.
2. Create a new **Redis** database.
3. Copy the `REDIS_URL`. It should look like:
   `redis://default:token@cool-bird-12345.upstash.io:6379`

---

## Step 3: Backend Deployment (Render)
1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Create a new **Web Service**.
3. Point it to the `server` directory:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
4. In the **Environment Variables** section, add the following:
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_neon_connection_string
   REDIS_URL=your_upstash_redis_url
   JWT_SECRET=generate_a_random_long_string
   CLIENT_URL=https://your-frontend.vercel.app  # You'll get this in Step 4
   BASE_URL=https://your-backend.onrender.com
   DB_ALTER=true # Run once to sync schema, then set to false
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
5. Deploy the service and note the URL (e.g., `https://financial-app-api.onrender.com`).

---

## Step 4: Frontend Deployment (Vercel)
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Select the `client` directory:
   - **Root Directory**: `client`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Add these **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://financial-app-api.onrender.com/api
   ```
4. Deploy. Vercel will give you a domain like `https://financial-app.vercel.app`.

---

## Step 5: Custom Domain Setup (GoDaddy)
Since you own `creditleliya.com`, follow these steps to make your app professional:

### A. Main Website (Vercel)
1. In your **Vercel Project Settings**, go to **Domains**.
2. Add `creditleliya.com`. Vercel will give you two DNS records:
   - **A Record**: Point `@` to Vercel's IP.
   - **CNAME**: Point `www` to `cname.vercel-dns.com`.
3. Go to **GoDaddy DNS Management** for `creditleliya.com` and add these records.

### B. Backend API (Render)
1. In your **Render Web Service Settings**, scroll to **Custom Domains**.
2. Add `api.creditleliya.com`.
3. Render will give you a **CNAME** record.
4. Go to **GoDaddy** and add a CNAME record:
   - **Name/Host**: `api`
   - **Value**: Your Render `.onrender.com` URL.

---

## Step 6: Final Environment Updates
Once your domain is active, you **must** update these variables for CORS and Auth to work:

**Backend (Render Env Vars):**
- `CLIENT_URL`: `https://creditleliya.com`
- `BASE_URL`: `https://api.creditleliya.com`

**Frontend (Vercel Env Vars):**
- `REACT_APP_API_URL`: `https://api.creditleliya.com/api`

---

## Common Issues
- **DNS Propagation**: It can take 1-24 hours for GoDaddy to update. Use [whatsmydns.net](https://www.whatsmydns.net/) to check.
- **SSL Error**: Both Vercel and Render provide **free SSL certificates** automatically once the DNS is verified. You don't need to buy one from GoDaddy.
