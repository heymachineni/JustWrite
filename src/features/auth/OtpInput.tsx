"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
  autoFocus = true,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  React.useEffect(() => {
    if (!autoFocus || disabled) return;
    const id = window.requestAnimationFrame(() => {
      inputsRef.current[0]?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [autoFocus, disabled]);

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, "").slice(-1);
    const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
    chars[index] = clean;
    const joined = chars.join("").slice(0, 6);
    onChange(joined);
    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-invalid={invalid}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "h-11 w-10 rounded-full border bg-bg text-center text-[17px] font-medium text-fg outline-none transition-colors",
            invalid
              ? "border-destructive text-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/25"
              : "border-border focus:border-border-strong focus:ring-2 focus:ring-[var(--ring)]",
            disabled && "opacity-50"
          )}
        />
      ))}
    </div>
  );
}
