"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { Transaction } from "@tiptap/pm/state";
import {
  primeTypewriterAudio,
  playTypewriterClick,
  releaseTypewriterAudio,
} from "./typewriterAudio";

const MAX_CLICKS_PER_UPDATE = 4;

function isTypingKey(key: string, meta: boolean, ctrl: boolean, alt: boolean): boolean {
  if (meta || ctrl || alt) return false;
  if (key === "Backspace" || key === "Delete") return false;
  if (key === "Enter" || key === " ") return true;
  return key.length === 1;
}

function isUserTyping(transaction: Transaction): boolean {
  if (!transaction.docChanged) return false;
  if (transaction.getMeta("addToHistory") === false) return false;
  return true;
}

/**
 * Typewriter click on each keystroke. Mutually exclusive with typing music.
 */
export function useTypewriterSound(active: boolean, editor: Editor | null) {
  const activeRef = React.useRef(active);
  activeRef.current = active;

  const playClick = React.useCallback(async () => {
    if (!activeRef.current) return;
    const ctx = await primeTypewriterAudio();
    if (!ctx) return;
    playTypewriterClick(ctx);
  }, []);

  React.useEffect(() => {
    if (!active) {
      releaseTypewriterAudio();
      return;
    }

    primeTypewriterAudio();

    return () => {
      releaseTypewriterAudio();
    };
  }, [active]);

  // Keydown — reliable, runs in user-gesture context
  React.useEffect(() => {
    if (!active || !editor) return;

    const dom = editor.view.dom;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTypingKey(event.key, event.metaKey, event.ctrlKey, event.altKey)) {
        return;
      }
      playClick();
    };

    dom.addEventListener("keydown", onKeyDown);
    return () => dom.removeEventListener("keydown", onKeyDown);
  }, [active, editor, playClick]);

  // Update fallback for input paths that skip keydown (e.g. some mobile IME)
  React.useEffect(() => {
    if (!active || !editor) return;

    let prevLen = editor.getText().length;

    const onUpdate = ({ transaction }: { transaction: Transaction }) => {
      if (!isUserTyping(transaction) || !editor.isEditable) return;

      const len = editor.getText().length;
      const delta = Math.max(0, len - prevLen);
      prevLen = len;
      if (delta === 0) return;

      const clicks = Math.min(delta, MAX_CLICKS_PER_UPDATE);
      for (let i = 0; i < clicks; i++) {
        window.setTimeout(() => playClick(), i * 24);
      }
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [active, editor, playClick]);
}
