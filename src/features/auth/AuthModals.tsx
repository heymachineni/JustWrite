"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { OtpInput } from "./OtpInput";
import { signInWithToken } from "@/lib/firebase/client";
import { useAuthStore } from "./store";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModals() {
  const modalStep = useAuthStore((s) => s.modalStep);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const error = useAuthStore((s) => s.error);
  const sending = useAuthStore((s) => s.sending);
  const verifying = useAuthStore((s) => s.verifying);
  const closeModal = useAuthStore((s) => s.closeModal);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setModalStep = useAuthStore((s) => s.setModalStep);
  const setError = useAuthStore((s) => s.setError);
  const setSending = useAuthStore((s) => s.setSending);
  const setVerifying = useAuthStore((s) => s.setVerifying);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [otpInvalid, setOtpInvalid] = React.useState(false);
  const autoVerifyCodeRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (modalStep === "email") {
      setEmail(pendingEmail);
      setCode("");
      setOtpInvalid(false);
      autoVerifyCodeRef.current = null;
    }
  }, [modalStep, pendingEmail]);

  const handleSendCode = React.useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      setPendingEmail(trimmed);
      setModalStep("otp");
      setCode("");
      setOtpInvalid(false);
      autoVerifyCodeRef.current = null;
      if (data.devCode) {
        setDevCode(String(data.devCode));
        console.info(`[auth] sign-in code: ${data.devCode}`);
      }
    } catch {
      setError("Could not send code. Try again.");
    } finally {
      setSending(false);
    }
  }, [email, setError, setPendingEmail, setModalStep, setSending]);

  const handleVerify = React.useCallback(async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    setError(null);
    setOtpInvalid(false);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpInvalid(true);
        setError(data.error ?? "Invalid sign in code. Please try again.");
        autoVerifyCodeRef.current = code;
        return;
      }

      if (data.demo) {
        setUser({ uid: data.user.uid, email: data.user.email, demo: true });
        closeModal();
        return;
      }

      if (data.token) {
        const user = await signInWithToken(data.token);
        setUser({ uid: user.uid, email: user.email });
        closeModal();
      }
    } catch {
      setOtpInvalid(true);
      setError("Could not verify code. Try again.");
      autoVerifyCodeRef.current = code;
    } finally {
      setVerifying(false);
    }
  }, [
    code,
    pendingEmail,
    closeModal,
    setError,
    setUser,
    setVerifying,
  ]);

  React.useEffect(() => {
    if (modalStep !== "otp" || code.length !== 6 || verifying || sending) return;
    if (autoVerifyCodeRef.current === code) return;
    autoVerifyCodeRef.current = code;
    void handleVerify();
  }, [code, modalStep, verifying, sending, handleVerify]);

  const handleResend = async () => {
    setCode("");
    setOtpInvalid(false);
    setError(null);
    autoVerifyCodeRef.current = null;
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
      } else if (data.devCode) {
        setDevCode(String(data.devCode));
        console.info(`[auth] sign-in code: ${data.devCode}`);
      }
    } catch {
      setError("Could not resend code.");
    } finally {
      setSending(false);
    }
  };

  const emailHasError = modalStep === "email" && Boolean(error);

  return (
    <Dialog
      open={modalStep != null}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent showClose={false} className="rounded-2xl p-0">
        <button
          type="button"
          aria-label="Close"
          onClick={closeModal}
          className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>

        {modalStep === "email" && (
          <form
            className="p-5 pt-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendCode();
            }}
          >
            <DialogTitle className="text-[17px] tracking-tight">
              Continue with email
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px]">
              Sign in or create your account.
            </DialogDescription>

            <input
              type="email"
              name="email"
              autoFocus
              autoComplete="email"
              enterKeyHint="go"
              placeholder="Your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              aria-invalid={emailHasError}
              className={cn(
                "mt-4 w-full rounded-full border bg-bg px-4 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint-fg transition-colors",
                emailHasError
                  ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/25"
                  : "border-border focus:border-border-strong focus:ring-2 focus:ring-[var(--ring)]"
              )}
            />

            {error && (
              <p className="mt-2 text-[13px] text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className={cn(
                "mt-4 w-full rounded-full bg-fg py-2.5 text-[14px] font-medium text-bg transition-opacity",
                sending && "opacity-60"
              )}
            >
              {sending ? "Sending…" : "Continue"}
            </button>
          </form>
        )}

        {modalStep === "otp" && (
          <div className="p-5 pt-6">
            <DialogTitle className="text-[17px] tracking-tight">
              Check your email
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed">
              We sent a sign in code to{" "}
              <span className="font-semibold text-fg">{pendingEmail}</span>.
              <br />
              Look in your spam folder if you don&apos;t see it.
            </DialogDescription>

            {devCode && (
              <p className="mt-3 rounded-full bg-[var(--muted)] px-3 py-2 text-center font-mono text-[15px] font-medium tracking-widest text-fg">
                {devCode}
              </p>
            )}

            <div className="mt-5">
              <OtpInput
                value={code}
                onChange={(next) => {
                  setCode(next);
                  setOtpInvalid(false);
                  setError(null);
                  autoVerifyCodeRef.current = null;
                }}
                disabled={verifying || sending}
                invalid={otpInvalid}
              />
            </div>

            {error && (
              <p className="mt-3 text-center text-[13px] text-destructive">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => void handleVerify()}
                disabled={verifying || code.length !== 6}
                className={cn(
                  "w-full rounded-full bg-fg py-2.5 text-[14px] font-medium text-bg transition-opacity",
                  (verifying || code.length !== 6) && "opacity-60"
                )}
              >
                {verifying ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={sending || verifying}
                className="w-full rounded-full py-2.5 text-[14px] font-medium text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg disabled:opacity-50"
              >
                {sending ? "Sending…" : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
