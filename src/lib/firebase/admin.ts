import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getServiceAccount(): Record<string, string> | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return null;
  }
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

  adminApp =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount as ServiceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

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
