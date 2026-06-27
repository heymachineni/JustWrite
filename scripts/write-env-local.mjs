#!/usr/bin/env node
/**
 * Creates .env.local from your Firebase service account JSON file.
 *
 * Usage:
 *   node scripts/write-env-local.mjs ~/Downloads/justwrite-f5e83-firebase-adminsdk-fbsvc-11a05b4552.json
 *
 * Then add RESEND_API_KEY manually if needed.
 */
import fs from "node:fs";
import path from "node:path";

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node scripts/write-env-local.mjs <path-to-service-account.json>");
  process.exit(1);
}

const abs = path.resolve(jsonPath.replace(/^~/, process.env.HOME ?? ""));
const sa = JSON.parse(fs.readFileSync(abs, "utf8"));

const envPath = path.join(process.cwd(), ".env.local");
let existing = "";
if (fs.existsSync(envPath)) {
  existing = fs.readFileSync(envPath, "utf8");
}

const resendMatch = existing.match(/^RESEND_API_KEY=(.*)$/m);
const resendKey = resendMatch?.[1]?.trim() ?? "";

const content = `# Auto-generated — do not commit
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQJPcIKfGScl1NlqF08r_Fbzxo7g8o3oY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=justwrite-f5e83.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=justwrite-f5e83

FIREBASE_SERVICE_ACCOUNT_JSON=${JSON.stringify(JSON.stringify(sa))}

RESEND_API_KEY=${resendKey}
AUTH_EMAIL_FROM=Just Write <onboarding@resend.dev>
`;

fs.writeFileSync(envPath, content);
console.log(`Wrote ${envPath}`);
if (!resendKey) {
  console.log("Add RESEND_API_KEY to .env.local for email delivery.");
}
