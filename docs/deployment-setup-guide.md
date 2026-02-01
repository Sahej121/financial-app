# Production Setup Guide: CreditLeliya

Follow these steps to obtain the infrastructure and credentials needed for your live deployment.

---

## 1. Get a VPS (Virtual Private Server)
This is the "computer in the cloud" where your app will run 24/7.
- **Recommended**: [DigitalOcean](https://www.digitalocean.com/) (Sign up and create a "Droplet").
- **Specs**: 
    - **OS**: Ubuntu 22.04 LTS.
    - **Plan**: Basic (Regular or Shared CPU, $6/month is enough for start).
    - **Authentication**: Choose "SSH Keys" (more secure) or "Password".
- **Result**: You will get an **IP Address** (e.g., `123.45.67.89`).

---

## 2. Point Your Domain (DNS)
Connect `creditleliya.com` to your new server IP.
1. Log in to your domain registrar (GoDaddy, Namecheap, etc.).
2. Find **DNS Management**.
3. Add/Update two records:
   - **Type**: `A`, **Name**: `@`, **Value**: `[Your Server IP]`.
   - **Type**: `CNAME`, **Name**: `www`, **Value**: `creditleliya.com`.
- **Note**: It can take 1-2 hours for this to "propagate".

---

## 3. Obtain Security Secrets

### A. Google Client ID (for Login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project**.
3. Search for "APIs & Services" > "Credentials".
4. Configure the **OAuth Consent Screen** (User type: External).
5. Click **Create Credentials** > **OAuth client ID**.
6. **Application Type**: Web application.
7. **Authorized JavaScript origins**: `https://creditleliya.com`.
8. **Authorized redirect URIs**: `https://creditleliya.com/api/auth/google/callback`.

### B. Email App Password (for OTPs)
*If using Gmail:*
1. Enable **2-Step Verification** on your Gmail account security settings.
2. Go to **Google Account Settings** > **Security**.
3. Search for "**App Passwords**".
4. Select "Mail" and "Other (Custom name: CreditLeliya)".
5. Copy the 16-character code. **This is your `EMAIL_PASS`**.

### C. Groq API Key (for Doc Analysis)
1. Go to [Groq Console](https://console.groq.com/).
2. Click on **API Keys** in the sidebar.
3. Click **Create API Key**.

---

## 4. Final Deployment Steps
Once you have the IP and the keys:
1. I will help you SSH into the server.
2. We will run a script to install Node.js, Nginx, and PM2.
3. We will upload the build and start the app.
