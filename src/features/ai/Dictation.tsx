"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Mic, X } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function Dictation({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [interim, setInterim] = React.useState("");
  const [unsupported, setUnsupported] = React.useState(false);
  const recRef = React.useRef<any>(null);
  const silenceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!open || !editor) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setUnsupported(true);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    recRef.current = rec;

    const resetSilence = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      // Auto-detect end of speech after a short pause.
      silenceTimer.current = setTimeout(() => onOpenChange(false), 2600);
    };

    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) {
        editor.chain().focus().insertContent(finalText.replace(/^\s+/, "") + " ").run();
      }
      setInterim(interimText);
      resetSilence();
    };
    rec.onerror = () => onOpenChange(false);

    try {
      rec.start();
      resetSilence();
    } catch {
      /* already started */
    }

    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setInterim("");
    };
  }, [open, editor, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-pop-in">
      <div className="flex items-center gap-3 rounded-full border border-border bg-bg-elevated px-4 py-2.5 shadow-[var(--shadow)]">
        {unsupported ? (
          <span className="text-sm text-muted-fg">
            Dictation isn’t supported in this browser.
          </span>
        ) : (
          <>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <Mic className="h-4 w-4 text-fg" />
            <span className="max-w-xs truncate text-sm text-muted-fg">
              {interim || "Listening…"}
            </span>
          </>
        )}
        <button
          aria-label="Stop dictation"
          onClick={() => onOpenChange(false)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-fg hover:bg-[var(--hover)] hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
