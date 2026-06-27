type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  [key: string]: unknown;
};

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function parseServiceAccountRaw(raw: string): ServiceAccount | null {
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (typeof sa.private_key === "string") {
      sa.private_key = normalizePrivateKey(sa.private_key);
    }
    return sa;
  } catch {
    return null;
  }
}

function getServiceAccount(): ServiceAccount | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

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

type AdminModule = typeof import("firebase-admin/app");
type AuthModule = typeof import("firebase-admin/auth");
type FirestoreModule = typeof import("firebase-admin/firestore");

let adminApp: import("firebase-admin/app").App | null = null;
let adminModules: {
  app: AdminModule;
  auth: AuthModule;
  firestore: FirestoreModule;
} | null = null;

async function loadAdminModules() {
  if (adminModules) return adminModules;

  const [app, auth, firestore] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth"),
    import("firebase-admin/firestore"),
  ]);

  adminModules = { app, auth, firestore };
  return adminModules;
}

async function getAdminApp() {
  if (!isFirebaseAdminConfigured()) return null;
  if (adminApp) return adminApp;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  try {
    const { app } = await loadAdminModules();
    adminApp =
      app.getApps().length > 0
        ? app.getApps()[0]
        : app.initializeApp({
            credential: app.cert(serviceAccount as import("firebase-admin/app").ServiceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          });
  } catch (error) {
    console.error("[firebase/admin] initializeApp failed:", error);
    return null;
  }

  return adminApp;
}

export async function getAdminAuth() {
  const app = await getAdminApp();
  if (!app) return null;
  const { auth } = await loadAdminModules();
  return auth.getAuth(app);
}

export async function getAdminFirestore() {
  const app = await getAdminApp();
  if (!app) return null;
  const { firestore } = await loadAdminModules();
  return firestore.getFirestore(app);
}
