import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
  );
}

let app: FirebaseApp | null = null;

export function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

function getAppInternal(): FirebaseApp | null {
  return getApp();
}

export function getClientAuth(): Auth | null {
  const firebaseApp = getAppInternal();
  return firebaseApp ? getAuth(firebaseApp) : null;
}

export async function signInWithToken(token: string): Promise<User> {
  const auth = getClientAuth();
  if (!auth) throw new Error("Firebase is not configured");
  const cred = await signInWithCustomToken(auth, token);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getClientAuth();
  if (!auth) return;
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  const auth = getClientAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
