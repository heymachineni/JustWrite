"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { wordCount } from "@/features/pages/store";
import { useFocusSettingsStore, useFocusSessionStore } from "./store";
import { useToast } from "@/components/ui/toast";

function isTypingKey(key: string, meta: boolean, ctrl: boolean): boolean {
  if (meta || ctrl) return false;
  if (key === "Enter" || key === " ") return true;
  return key.length === 1;
}

export function useWordTargetLimit(editor: Editor | null) {
  const wordTargetLimit = useFocusSettingsStore((s) => s.wordTargetLimit);
  const limitRef = React.useRef(wordTargetLimit);
  limitRef.current = wordTargetLimit;
  const { show } = useToast();

  React.useEffect(() => {
    if (!editor || !wordTargetLimit) {
      useFocusSessionStore.getState().resetTargetNotification();
      return;
    }

    const check = () => {
      const count = wordCount(editor.getText());
      const state = useFocusSessionStore.getState();
      if (count >= wordTargetLimit) {
        if (!state.targetReachedNotified) {
          state.markTargetReached();
          show("Target reached");
        }
      } else if (state.targetReachedNotified) {
        state.resetTargetNotification();
      }
    };

    check();
    editor.on("update", check);
    return () => {
      editor.off("update", check);
    };
  }, [editor, wordTargetLimit, show]);

  const atOrOverLimit = React.useCallback((text: string) => {
    const limit = limitRef.current;
    return limit != null && wordCount(text) >= limit;
  }, []);

  return { atOrOverLimit, wordTargetLimit };
}

export function useWordTargetKeyBlock(
  editor: Editor | null,
  atOrOverLimit: (text: string) => boolean
) {
  React.useEffect(() => {
    if (!editor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!atOrOverLimit(editor.state.doc.textContent)) return;
      if (!isTypingKey(event.key, event.metaKey, event.ctrlKey)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", onKeyDown, true);
    return () => dom.removeEventListener("keydown", onKeyDown, true);
  }, [editor, atOrOverLimit]);
}
