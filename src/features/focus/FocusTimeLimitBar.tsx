"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { Transaction } from "@tiptap/pm/state";
import { X } from "lucide-react";
import { useFocusSettingsStore, useFocusSessionStore } from "./store";
import { cn } from "@/lib/utils";

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isUserTyping(transaction: Transaction): boolean {
  if (!transaction.docChanged) return false;
  if (transaction.getMeta("addToHistory") === false) return false;
  return true;
}

function TimerPill({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 shadow-[var(--shadow)]",
          className
        )}
      >
        {children}
      </div>
      {onClose && (
        <button
          aria-label="Close"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-elevated text-muted-fg shadow-[var(--shadow)] transition-colors hover:bg-[var(--hover)] hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/** Time limit UI — independent from focus mode; only runs in normal editor view. */
export function FocusTimeLimitBar({
  editor,
  enabled,
}: {
  editor: Editor | null;
  enabled: boolean;
}) {
  const minutes = useFocusSettingsStore((s) => s.timeLimitMinutes);
  const phase = useFocusSessionStore((s) => s.timePhase);
  const startedAt = useFocusSessionStore((s) => s.timeStartedAt);
  const startTimeSession = useFocusSessionStore((s) => s.startTimeSession);
  const endTimeSession = useFocusSessionStore((s) => s.endTimeSession);
  const resetTimeSession = useFocusSessionStore((s) => s.resetTimeSession);

  const [progress, setProgress] = React.useState(0);
  const [confirmRetry, setConfirmRetry] = React.useState(false);
  const armedRef = React.useRef(false);

  const totalMs = minutes ? minutes * 60 * 1000 : 0;
  const active = enabled && minutes;

  React.useEffect(() => {
    if (!active) {
      resetTimeSession();
      setProgress(0);
      setConfirmRetry(false);
      armedRef.current = false;
      return;
    }
    resetTimeSession();
    useFocusSessionStore.setState({ timePhase: "waiting" });
    armedRef.current = false;
    const id = window.setTimeout(() => {
      armedRef.current = true;
    }, 400);
    return () => window.clearTimeout(id);
  }, [active, minutes, resetTimeSession]);

  React.useEffect(() => {
    if (!editor || !active) return;

    const onUpdate = ({ transaction }: { transaction: Transaction }) => {
      if (!armedRef.current || !isUserTyping(transaction)) return;

      const state = useFocusSessionStore.getState();
      if (state.timePhase === "waiting") {
        startTimeSession();
      }
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, active, startTimeSession]);

  React.useEffect(() => {
    if (phase !== "running" || !startedAt || !totalMs) return;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const p = Math.min(1, elapsed / totalMs);
      setProgress(p);

      if (p >= 1) {
        endTimeSession();
        editor?.setEditable(false);
      }
    };

    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [phase, startedAt, totalMs, endTimeSession, editor]);

  const handleClose = () => {
    resetTimeSession();
    editor?.setEditable(true);
    setProgress(0);
    setConfirmRetry(false);
    if (minutes && active) {
      useFocusSessionStore.setState({ timePhase: "waiting" });
      armedRef.current = false;
      window.setTimeout(() => {
        armedRef.current = true;
      }, 400);
    }
  };

  const handleConfirmRetry = () => {
    if (editor) {
      editor.commands.clearContent();
      editor.setEditable(true);
    }
    resetTimeSession();
    setConfirmRetry(false);
    setProgress(0);
    if (minutes) {
      useFocusSessionStore.setState({ timePhase: "waiting" });
      armedRef.current = false;
      window.setTimeout(() => {
        armedRef.current = true;
      }, 400);
    }
  };

  if (!active) return null;

  const waitLabel = formatRemaining(totalMs);

  if (phase === "waiting") {
    return (
      <TimerPill>
        <span className="text-[13px] font-medium text-muted-fg">
          Wait till {waitLabel}
        </span>
      </TimerPill>
    );
  }

  if (phase === "ended") {
    if (confirmRetry) {
      return (
        <TimerPill>
          <span className="text-[13px] font-medium text-muted-fg">
            Your writing will be cleared.
          </span>
          <span className="text-[13px] text-faint-fg">|</span>
          <button
            onClick={handleConfirmRetry}
            className="text-[13px] font-medium text-fg underline-offset-2 hover:underline"
          >
            Okay
          </button>
          <span className="text-[13px] text-faint-fg">|</span>
          <button
            onClick={() => setConfirmRetry(false)}
            className="text-[13px] font-medium text-muted-fg underline-offset-2 hover:text-fg hover:underline"
          >
            Not okay
          </button>
        </TimerPill>
      );
    }

    return (
      <TimerPill onClose={handleClose}>
        <span className="text-[13px] font-medium text-fg">Time is up</span>
        <span className="text-[13px] text-faint-fg">|</span>
        <button
          onClick={() => setConfirmRetry(true)}
          className="text-[13px] font-medium text-fg underline-offset-2 hover:underline"
        >
          Retry?
        </button>
      </TimerPill>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="h-1 w-full bg-[var(--muted)]">
        <div
          className="h-full bg-fg transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
