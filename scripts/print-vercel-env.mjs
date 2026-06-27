#!/usr/bin/env node
/**
 * Prints Vercel-ready values for Firebase service account.
 *
 * Usage:
 *   node scripts/print-vercel-env.mjs ~/Downloads/your-service-account.json
 */
import fs from "node:fs";
import path from "node:path";

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node scripts/print-vercel-env.mjs <path-to-service-account.json>");
  process.exit(1);
}

const abs = path.resolve(jsonPath.replace(/^~/, process.env.HOME ?? ""));
const sa = JSON.parse(fs.readFileSync(abs, "utf8"));
const oneLine = JSON.stringify(sa);
const base64 = Buffer.from(oneLine, "utf8").toString("base64");

console.log("Add these in Vercel → Settings → Environment Variables → Production:\n");
console.log("Option A (recommended) — FIREBASE_SERVICE_ACCOUNT_JSON_BASE64:");
console.log(base64);
console.log("\nOption B — FIREBASE_SERVICE_ACCOUNT_JSON (single line, copy all):");
console.log(oneLine);
console.log("\nAlso set:");
console.log("RESEND_API_KEY=re_...");
console.log('AUTH_EMAIL_FROM=Just Write <onboarding@resend.dev>');
console.log("\nAfter saving, redeploy from Deployments → ... → Redeploy.");
