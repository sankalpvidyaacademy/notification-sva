# 🚀 Deployment Guide — Sankalp Notification System

Complete guide for deploying to Vercel with Firebase integration.

---

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (can sign in with GitHub)
- [Firebase](https://console.firebase.google.com) project created
- Node.js 18+ and Bun installed locally

---

## Phase 1: Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Name it: `sankalp-notification-system`
4. Disable Google Analytics (optional)
5. Click **Create Project**

### Step 2: Enable Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (we'll apply security rules later)
4. Select location: `asia-south1` (Mumbai) or closest to your users
5. Click **Done**

### Step 3: Register Web App & Get Config

1. In Firebase Console → **Project Settings** (gear icon) → **General**
2. Under **"Your apps"** → Click **Web icon** (`</>`)
3. Register app nickname: `sankalp-web`
4. **Do NOT** check "Firebase Hosting" (we use Vercel)
5. Copy the `firebaseConfig` object values:
   ```
   apiKey: "AIzaSy..."
   authDomain: "sankalp-xxxx.firebaseapp.com"
   projectId: "sankalp-xxxx"
   storageBucket: "sankalp-xxxx.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abcdef"
   ```

### Step 4: Generate Admin SDK Service Account

1. In Firebase Console → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely (contains secrets!)
4. Extract these values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### Step 5: Set Custom Claims for Admin

After deploying, set admin custom claims using Firebase Admin SDK:

```javascript
// Run in Firebase Console → Functions or locally
const admin = require('firebase-admin');
admin.initializeApp();

// Set admin claims for the admin user
admin.auth().setCustomUserClaims('ADMIN_UID', {
  role: 'ADMIN',
  userId: 'shobhit'
});
```

Or use the Firebase CLI:
```bash
firebase auth:import users.json
```

---

## Phase 2: GitHub Repository Setup

### Step 1: Initialize Git

```bash
cd /home/z/my-project
git init
git add .
git commit -m "Initial commit: Sankalp Notification System v5"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create repository: `sankalp-notification-system`
3. Do NOT initialize with README
4. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sankalp-notification-system.git
   git branch -M main
   git push -u origin main
   ```

---

## Phase 3: Vercel Deployment

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `sankalp-notification-system` repo
4. Click **Import**

### Step 2: Configure Build Settings

Vercel auto-detects Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `bun install` |

### Step 3: Add Environment Variables

In the Vercel project settings → **Environment Variables**, add ALL of these:

#### Client SDK (exposed to browser)
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` (from Step 3) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `sankalp-xxxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `sankalp-xxxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `sankalp-xxxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abcdef` |

#### Admin SDK (server-side only)
| Key | Value |
|-----|-------|
| `FIREBASE_PROJECT_ID` | `sankalp-xxxx` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@sankalp-xxxx.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Full private key including `-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----` |

#### Backend Switch
| Key | Value |
|-----|-------|
| `USE_FIREBASE` | `true` |

#### Database (fallback)
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:./dev.db` (not used with Firebase, but required for build) |

> ⚠️ **IMPORTANT**: For `FIREBASE_PRIVATE_KEY`, paste the entire key including the `-----BEGIN` and `-----END` lines. In Vercel, newlines are preserved automatically.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at: `https://sankalp-notification-system.vercel.app`

### Step 5: Verify Deployment

1. Visit your Vercel URL
2. Login with admin credentials (shobhit / Shobhit@1502)
3. Create a test notification
4. Verify it appears in the notification list
5. Check Vercel Functions logs for any errors

---

## Phase 4: Apply Firestore Security Rules

### Step 1: Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase in Project (if not already)

```bash
cd /home/z/my-project
firebase init firestore
# Select your Firebase project
# Use existing firestore.rules file
```

### Step 3: Apply Phase 1 Rules (Development)

Phase 1 rules are already in `firestore.rules` — they allow all authenticated reads/writes.

```bash
firebase deploy --only firestore:rules
```

### Step 4: Test Everything Works

1. Login to the deployed app
2. Create users, notifications, messages
3. Verify all CRUD operations work
4. Check Vercel function logs for errors

### Step 5: Apply Phase 2 Rules (Production)

⚠️ **ONLY after all testing is complete**

1. Copy Phase 2 rules to the root file:
   ```bash
   cp firestore-rules/firestore.rules.phase2 firestore.rules
   ```
2. Deploy the strict rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Test again to ensure nothing breaks

---

## Phase 5: Data Migration (If Migrating from SQLite)

If you have existing data in SQLite that needs to be moved to Firestore:

### Step 1: Set Firebase Environment Locally

Update your local `.env`:
```
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Step 2: Run Migration Script

```bash
bun run firebase/migrate-to-firestore.ts
```

This will:
- Read all data from SQLite
- Write to Firestore collections (users, notifications, messages)
- NOT delete data from SQLite (safe migration)

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Monitoring

- **Vercel**: Dashboard → Analytics → Monitor deployments & functions
- **Firebase**: Console → Firestore → Usage → Monitor reads/writes

### Backup Strategy

Firestore automatically backs up data. For additional safety:

1. Schedule automated exports:
   ```bash
   gcloud firestore export gs://your-bucket-name/backups/$(date +%Y%m%d)
   ```

---

## 🚨 Troubleshooting

### Build Fails on Vercel

- Check that all environment variables are set correctly
- Verify `FIREBASE_PRIVATE_KEY` includes the full key with newlines
- Check Vercel build logs for specific errors

### Firebase Admin SDK Initialization Fails

- Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- The private key must have actual `\n` characters, not escaped `\\n`
- Check that the service account has the correct permissions

### Firestore Permission Denied

- Ensure Phase 1 rules are applied during development
- If Phase 2 rules are applied, verify custom claims are set
- Check that `USE_FIREBASE=true` is set (Admin SDK bypasses rules)

### API Routes Return 500

- Check Vercel function logs: Dashboard → Functions → Logs
- Verify Firebase Admin SDK credentials
- Ensure `USE_FIREBASE=true` in Vercel environment variables

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `.env` | Local environment variables |
| `vercel.json` | Vercel deployment configuration |
| `.vercelignore` | Files excluded from Vercel deployment |
| `firebase.json` | Firebase CLI configuration |
| `firestore.rules` | Active Firestore rules (Phase 1 by default) |
| `firestore-rules/firestore.rules.phase1` | Development rules (open with auth) |
| `firestore-rules/firestore.rules.phase2` | Production rules (strict role-based) |
| `firebase/firebaseConfig.ts` | Client SDK configuration |
| `firebase/firebaseInit.ts` | Admin SDK initialization |
| `firebase/migrate-to-firestore.ts` | Data migration script |
| `src/adapters/appAdapter.ts` | Backend adapter (Prisma ↔ Firebase) |
| `src/services/*.firebase.ts` | Firebase service implementations |
| `src/services/*.prisma.ts` | Prisma service implementations |

---

## 🔄 Rollback Plan

If Firebase causes issues in production:

1. In Vercel Dashboard → Settings → Environment Variables
2. Change `USE_FIREBASE` to `false`
3. Redeploy (push a commit or click Redeploy)
4. App will fall back to Prisma/SQLite automatically
5. The adapter pattern ensures zero-downtime switching
