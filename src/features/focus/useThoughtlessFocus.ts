"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

/** Mirrors thoughtless `forceFocus`: caret at end, scroll to bottom. */
export function forceThoughtlessFocus(
  editor: Editor,
  scrollEl: HTMLElement | null
) {
  const el = editor.view.dom as HTMLElement;
  const doc = editor.state.doc;
  const end = doc.content.size;
  const pos = Math.max(1, end - 1);

  editor.commands.setTextSelection(pos);
  el.focus();

  if (scrollEl) {
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }
  el.scrollTop = el.scrollHeight;
}

export function useThoughtlessFocus(
  editor: Editor | null,
  scrollRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  locked: boolean
) {
  const lockedRef = React.useRef(locked);
  lockedRef.current = locked;

  const force = React.useCallback(() => {
    if (!editor || !active || lockedRef.current) return;
    forceThoughtlessFocus(editor, scrollRef.current);
  }, [editor, active, scrollRef]);

  const forceFromEvent = React.useCallback(
    (e?: Event) => {
      if (e) e.preventDefault();
      force();
    },
    [force]
  );

  React.useEffect(() => {
    if (!editor || !active) return;

    const dom = editor.view.dom as HTMLElement;

    force();
    editor.on("update", force);

    const onSelectionChange = () => {
      if (editor.isFocused) force();
    };

    window.addEventListener("resize", forceFromEvent, { passive: true });
    document.addEventListener("selectionchange", onSelectionChange);
    dom.addEventListener("pointerdown", forceFromEvent);
    dom.addEventListener("pointerup", forceFromEvent);
    dom.addEventListener("click", forceFromEvent);

    return () => {
      editor.off("update", force);
      window.removeEventListener("resize", forceFromEvent);
      document.removeEventListener("selectionchange", onSelectionChange);
      dom.removeEventListener("pointerdown", forceFromEvent);
      dom.removeEventListener("pointerup", forceFromEvent);
      dom.removeEventListener("click", forceFromEvent);
    };
  }, [editor, active, force, forceFromEvent]);
}
