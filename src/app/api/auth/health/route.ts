export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function GET() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  let firebaseJsonValid = false;
  let firebaseJsonError: string | null = null;

  if (json) {
    try {
      JSON.parse(json);
      firebaseJsonValid = true;
    } catch (error) {
      firebaseJsonError =
        error instanceof Error ? error.message : "Invalid JSON";
    }
  } else if (base64) {
    try {
      JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
      firebaseJsonValid = true;
    } catch (error) {
      firebaseJsonError =
        error instanceof Error ? error.message : "Invalid base64 JSON";
    }
  }

  let firestoreOk = false;
  let firestoreError: string | null = null;

  if (isFirebaseAdminConfigured()) {
    try {
      const { getAdminFirestore } = await import("@/lib/firebase/admin");
      const db = await getAdminFirestore();
      if (!db) {
        firestoreError = "Firestore client unavailable";
      } else {
        const ref = db.collection("_health").doc("ping");
        await ref.set({ at: Date.now() });
        await ref.delete();
        firestoreOk = true;
      }
    } catch (error) {
      firestoreError =
        error instanceof Error ? error.message : "Firestore check failed";
    }
  }

  return NextResponse.json({
    ok: true,
    env: {
      firebaseJsonSet: Boolean(json),
      firebaseBase64Set: Boolean(base64),
      firebaseJsonValid,
      firebaseJsonError,
      firebaseConfigured: isFirebaseAdminConfigured(),
      firestoreOk,
      firestoreError,
      resendKeySet: Boolean(process.env.RESEND_API_KEY),
      authEmailFrom: process.env.AUTH_EMAIL_FROM ?? "(default onboarding@resend.dev)",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
