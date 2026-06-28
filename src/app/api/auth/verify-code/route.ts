export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { normalizeEmail, verifyOtp } from "@/lib/firebase/otp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(body.email ?? "");
    const code = (body.code ?? "").replace(/\D/g, "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (code.length !== 6) {
      return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }

    const valid = await verifyOtp(email, code);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid sign in code. Please try again." },
        { status: 401 }
      );
    }

    try {
      const { issueAuthTokenForEmail } = await import("@/lib/firebase/auth-server");
      const { token } = await issueAuthTokenForEmail(email);
      return NextResponse.json({ ok: true, token });
    } catch (error) {
      console.error("[auth/verify-code] token issue failed:", error);
      const message =
        error instanceof Error ? error.message : "Auth unavailable.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("[auth/verify-code]", error);
    return NextResponse.json(
      { error: "Could not verify code. Try again." },
      { status: 500 }
    );
  }
}
