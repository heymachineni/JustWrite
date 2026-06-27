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

  return NextResponse.json({
    ok: true,
    env: {
      firebaseJsonSet: Boolean(json),
      firebaseBase64Set: Boolean(base64),
      firebaseJsonValid,
      firebaseJsonError,
      firebaseConfigured: isFirebaseAdminConfigured(),
      resendKeySet: Boolean(process.env.RESEND_API_KEY),
      authEmailFrom: process.env.AUTH_EMAIL_FROM ?? "(default onboarding@resend.dev)",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
