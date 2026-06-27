type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  [key: string]: unknown;
};

let lastInitError: string | null = null;

export function getAdminInitError(): string | null {
  return lastInitError;
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function parseServiceAccountRaw(raw: string): ServiceAccount | null {
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (typeof sa.private_key === "string") {
      sa.private_key = normalizePrivateKey(sa.private_key);
    }
    if (
      !sa.project_id ||
      !sa.client_email ||
      typeof sa.private_key !== "string"
    ) {
      return null;
    }
    return sa;
  } catch {
    return null;
  }
}

function getServiceAccount(): ServiceAccount | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

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
  return Boolean(getServiceAccount());
}

type AdminModule = typeof import("firebase-admin/app");
type AuthModule = typeof import("firebase-admin/auth");
type FirestoreModule = typeof import("firebase-admin/firestore");

const APP_NAME = "just-write";

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
  lastInitError = null;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    lastInitError = "Service account env var missing or invalid.";
    return null;
  }

  if (adminApp) return adminApp;

  try {
    const { app } = await loadAdminModules();

    try {
      adminApp = app.getApp(APP_NAME);
      return adminApp;
    } catch {
      // Not initialized yet.
    }

    adminApp = app.initializeApp(
      {
        credential: app.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
        projectId: serviceAccount.project_id,
      },
      APP_NAME
    );
  } catch (error) {
    lastInitError =
      error instanceof Error ? error.message : "Firebase Admin init failed";
    console.error("[firebase/admin] initializeApp failed:", error);
    adminApp = null;
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
