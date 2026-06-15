"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UndoIcon } from "@/components/icons/UndoIcon";
import { cn } from "@/lib/utils";

type ToastState =
  | { type: "message"; text: string; position?: "top" | "bottom" }
  | {
      type: "confirm";
      text: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
  | {
      type: "undo";
      text: string;
      onUndo: () => void;
    };

type ToastContextValue = {
  show: (
    message: string,
    opts?: { position?: "top" | "bottom" }
  ) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  showUndo: (message: string, onUndo: () => void, durationMs?: number) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastPillClass =
  "flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2.5 shadow-[var(--shadow)]";

const toastLabelClass = "text-[13px] font-medium text-muted-fg";

const toastActionClass =
  "text-[13px] font-medium text-fg underline-offset-2 transition-colors hover:underline";

const toastMutedActionClass =
  "text-[13px] font-medium text-muted-fg underline-offset-2 transition-colors hover:text-fg hover:underline";

function ToastSeparator() {
  return (
    <span className="text-[13px] text-faint-fg" aria-hidden>
      ·
    </span>
  );
}

function ToastPill({ children }: { children: React.ReactNode }) {
  return <div className={toastPillClass}>{children}</div>;
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = React.useCallback(
    (text: string, opts?: { position?: "top" | "bottom" }) => {
      dismiss();
      setToast({ type: "message", text, position: opts?.position });
      timer.current = setTimeout(() => setToast(null), 2400);
    },
    [dismiss]
  );

  const showConfirm = React.useCallback(
    (text: string, onConfirm: () => void, onCancel?: () => void) => {
      dismiss();
      setToast({
        type: "confirm",
        text,
        onConfirm: () => {
          dismiss();
          onConfirm();
        },
        onCancel: () => {
          dismiss();
          onCancel?.();
        },
      });
    },
    [dismiss]
  );

  const showUndo = React.useCallback(
    (text: string, onUndo: () => void, durationMs = 2000) => {
      dismiss();
      setToast({ type: "undo", text, onUndo });
      timer.current = setTimeout(() => setToast(null), durationMs);
    },
    [dismiss]
  );

  const positionClass =
    toast?.type === "message" && toast.position === "top"
      ? "top-5"
      : "bottom-8";

  return (
    <ToastContext.Provider value={{ show, showConfirm, showUndo }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={
              toast.type === "message"
                ? toast.text
                : toast.type === "undo"
                  ? `undo-${toast.text}`
                  : "confirm"
            }
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed left-1/2 z-[100] -translate-x-1/2",
              positionClass
            )}
          >
            {toast.type === "message" ? (
              <ToastPill>
                <span className={toastLabelClass}>{toast.text}</span>
              </ToastPill>
            ) : toast.type === "undo" ? (
              <ToastPill>
                <span className={toastLabelClass}>{toast.text}</span>
                <ToastSeparator />
                <button
                  type="button"
                  onClick={() => {
                    dismiss();
                    toast.onUndo();
                  }}
                  className={cn(toastActionClass, "flex items-center gap-1.5")}
                >
                  <UndoIcon className="h-4 w-4 shrink-0" />
                  Undo
                </button>
              </ToastPill>
            ) : (
              <ToastPill>
                <span className={toastLabelClass}>{toast.text}</span>
                <ToastSeparator />
                <button type="button" onClick={toast.onConfirm} className={toastActionClass}>
                  Okay
                </button>
                <ToastSeparator />
                <button type="button" onClick={toast.onCancel} className={toastMutedActionClass}>
                  Not okay
                </button>
              </ToastPill>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
