import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function parseServiceAccountRaw(raw: string): Record<string, string> | null {
  try {
    const sa = JSON.parse(raw) as Record<string, string>;
    if (typeof sa.private_key === "string") {
      sa.private_key = normalizePrivateKey(sa.private_key);
    }
    return sa;
  } catch {
    return null;
  }
}

function getServiceAccount(): Record<string, string> | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  // Prefer base64 — raw JSON often breaks when pasted into Vercel.
  if (base64) {
    const fromBase64 = parseServiceAccountRaw(
      Buffer.from(base64, "base64").toString("utf8")
    );
    if (fromBase64) return fromBase64;
  }

  if (json) {
    const fromJson = parseServiceAccountRaw(json);
    if (fromJson) return fromJson;
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(getServiceAccount() && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

let adminApp: App | null = null;

function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;
  if (adminApp) return adminApp;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  try {
    adminApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          });
  } catch (error) {
    console.error("[firebase/admin] initializeApp failed:", error);
    return null;
  }

  return adminApp;
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminFirestore(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
