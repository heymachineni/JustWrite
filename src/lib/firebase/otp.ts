import { randomInt } from "crypto";

const OTP_COLLECTION = "email_otps";
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function storeOtp(email: string, code: string): Promise<void> {
  const normalized = normalizeEmail(email);

  if (process.env.NODE_ENV === "development") {
    globalThis.__devOtpStore ??= new Map();
    globalThis.__devOtpStore.set(normalized, {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
  }

  const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
    "./admin"
  );

  if (!isFirebaseAdminConfigured()) {
    return;
  }

  const db = getAdminFirestore();
  if (!db) {
    console.warn("[auth] Firestore unavailable — OTP stored in memory only (dev).");
    return;
  }

  try {
    await db.collection(OTP_COLLECTION).doc(normalized).set({
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });
  } catch (error) {
    console.error("[auth] Failed to store OTP in Firestore:", error);
  }
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (process.env.NODE_ENV === "development") {
    const store = globalThis.__devOtpStore;
    const entry = store?.get(normalized);
    if (store && entry) {
      if (Date.now() > entry.expiresAt) {
        store.delete(normalized);
      } else if (entry.code === code) {
        store.delete(normalized);
        return true;
      }
    }
  }

  const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
    "./admin"
  );

  if (!isFirebaseAdminConfigured()) {
    return false;
  }

  const db = getAdminFirestore();
  if (!db) return false;

  const ref = db.collection(OTP_COLLECTION).doc(normalized);
  const snap = await ref.get();
  if (!snap.exists) return false;

  const data = snap.data() as {
    code: string;
    expiresAt: number;
    attempts: number;
  };

  if (Date.now() > data.expiresAt) {
    await ref.delete();
    return false;
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    await ref.delete();
    return false;
  }

  if (data.code !== code) {
    await ref.set({ ...data, attempts: data.attempts + 1 }, { merge: true });
    return false;
  }

  await ref.delete();
  return true;
}

export type SendOtpResult =
  | { method: "email" }
  | { method: "console"; devCode: string };

export class OtpEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OtpEmailError";
  }
}

export async function sendOtpEmail(
  email: string,
  code: string
): Promise<SendOtpResult> {
  const resendKey = process.env.RESEND_API_KEY;
  const from =
    process.env.AUTH_EMAIL_FROM ?? "Just Write <onboarding@resend.dev>";

  const subject = `Your code is ${code}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; line-height: 1.5;">
      <p style="margin: 0 0 16px; font-size: 15px;">Your one-time code to sign in is:</p>
      <div style="background: #f4f4f5; border-radius: 12px; padding: 20px 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 0.08em; color: #111;">${code}</h2>
      </div>
      <p style="margin: 20px 0 0; font-size: 13px; color: #6b7280;">
        Please ignore this email if you did not request a code.
      </p>
    </div>
  `;

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();

      if (process.env.NODE_ENV === "development") {
        console.info(`[auth] OTP for ${email}: ${code}`);
        console.warn(`[auth] Resend could not deliver (${res.status}): ${text}`);
        return { method: "console", devCode: code };
      }

      if (
        res.status === 403 &&
        text.includes("testing emails to your own email")
      ) {
        throw new OtpEmailError(
          "Resend testing only allows your account email. Use that address, or verify a domain at resend.com/domains."
        );
      }

      throw new Error(`Email failed: ${text}`);
    }
    return { method: "email" };
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[auth] OTP for ${email}: ${code}`);
    return { method: "console", devCode: code };
  }

  throw new Error(
    "Email delivery is not configured. Set RESEND_API_KEY or run in development."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __devOtpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}
