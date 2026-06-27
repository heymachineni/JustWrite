# Just Write

A calm place to write. Notes, drafts, and thoughts — without clutter, without noise.

Open the app and start typing. Sign in to save your work across devices.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in values. Or run:

```bash
node scripts/write-env-local.mjs ~/Downloads/justwrite-f5e83-firebase-adminsdk-fbsvc-11a05b4552.json
```

Then add `RESEND_API_KEY` to `.env.local`. **Never put secrets in `.env.example`.**

## Firebase setup

You need a Firebase project with **Authentication**, **Firestore**, and email delivery (Resend).

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (enable Google Analytics if you want — optional)

### 2. Authentication

1. **Build → Authentication → Get started**
2. No sign-in providers need to be enabled for OTP — we use custom tokens from the server
3. Under **Settings → Authorized domains**, add your production domain (and `localhost` for dev)

### 3. Firestore

1. **Build → Firestore Database → Create database**
2. Start in **production mode**
3. Deploy security rules from `firestore.rules` in this repo:

```bash
firebase deploy --only firestore:rules
```

Or paste the rules manually in the Firestore **Rules** tab.

### 4. Web app config (client)

1. **Project settings → General → Your apps → Web**
2. Register the app and copy:
   - API Key → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Auth domain → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Project ID → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### 5. Service account (server — OTP + custom tokens)

1. **Project settings → Service accounts → Generate new private key**
2. Minify the JSON to a single line and set `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env.local`

### 6. Email OTP (Resend)

Resend is a separate email service — Firebase does not send OTP emails for you.

1. Go to [resend.com](https://resend.com) and create a free account
2. **API Keys → Create API Key** → copy it to `RESEND_API_KEY` in `.env.local`
3. **Domains → Add domain** and verify DNS (production), **or** for testing use Resend’s sandbox sender:
   - `AUTH_EMAIL_FROM=Just Write <onboarding@resend.dev>`
   - Sandbox only delivers to the email you signed up with on Resend
4. Restart the dev server after editing `.env.local`

Without `RESEND_API_KEY`, dev mode prints the OTP code in your terminal instead.

### Environment variables

See `.env.example` for the full list.

## How sync works

When you sign in, local pages merge with your cloud library (newest `updatedAt` wins per page). All local-only pages upload to your account. Changes sync automatically while signed in.

## Stack

Next.js · TipTap · Zustand · Firebase · Tailwind
