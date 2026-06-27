export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  generateOtpCode,
  normalizeEmail,
  sendOtpEmail,
  storeOtp,
  OtpEmailError,
} from "@/lib/firebase/otp";
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const code = generateOtpCode();
    await storeOtp(email, code);
    const delivery = await sendOtpEmail(email, code);

    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");

    return NextResponse.json({
      ok: true,
      configured: isFirebaseAdminConfigured(),
      delivery: delivery.method,
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error("[auth/send-code]", error);
    if (error instanceof OtpEmailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Could not send code. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
