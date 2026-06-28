"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { buildExtensions } from "./extensions";
import { usePagesStore, wordCount } from "@/features/pages/store";
import { useSettingsStore } from "@/features/settings/store";
import { useFocusSettingsStore, useFocusSessionStore } from "@/features/focus/store";
import { useWordTargetLimit, useWordTargetKeyBlock } from "@/features/focus/useWordTargetLimit";
import { LinkPopover, type LinkTarget } from "./LinkPopover";
import {
  getCharShakeRange,
  dispatchCharShake,
  restartCharShakeAnimation,
} from "./charShakeExtension";
import {
  canBackspaceInCurrentWord,
  canDeleteInCurrentWord,
} from "@/features/focus/currentWordBoundary";
import { cn } from "@/lib/utils";

const AUTOSAVE_MS = 350;

export function Editor({
  pageId,
  onEditorReady,
  readOnly = false,
  focusMode = false,
  nightWriting = false,
}: {
  pageId: string;
  onEditorReady?: (editor: TiptapEditor | null) => void;
  readOnly?: boolean;
  focusMode?: boolean;
  nightWriting?: boolean;
}) {
  const font = useSettingsStore((s) => s.font);
  const editorMode = useSettingsStore((s) => s.editorMode);
  const disableBackspace = useFocusSettingsStore((s) => s.disableBackspace);
  const disablePaste = useFocusSettingsStore((s) => s.disablePaste);
  const wordTargetLimit = useFocusSettingsStore((s) => s.wordTargetLimit);
  const timePhase = useFocusSessionStore((s) => s.timePhase);

  const wordTargetLimitRef = React.useRef(wordTargetLimit);
  wordTargetLimitRef.current = wordTargetLimit;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [linkTarget, setLinkTarget] = React.useState<LinkTarget | null>(null);
  const shakeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const disableBackspaceRef = React.useRef(disableBackspace);
  disableBackspaceRef.current = disableBackspace;
  const focusModeRef = React.useRef(focusMode);
  focusModeRef.current = focusMode;
  const disablePasteRef = React.useRef(disablePaste);
  disablePasteRef.current = disablePaste;

  const timeLocked = timePhase === "ended";

  const editorRef = React.useRef<TiptapEditor | null>(null);

  const triggerCharShake = React.useCallback((key: string) => {
    const ed = editorRef.current;
    if (!ed) return;

    const range = getCharShakeRange(ed, key);
    if (!range) return;

    dispatchCharShake(ed, range);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restartCharShakeAnimation(ed.view.dom);
      });
    });

    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => {
      const current = editorRef.current;
      if (current && !current.isDestroyed) {
        dispatchCharShake(current, null);
      }
    }, 480);
  }, []);

  const triggerCharShakeRef = React.useRef(triggerCharShake);
  triggerCharShakeRef.current = triggerCharShake;

  const isDeletionAllowed = (
    view: {
      state: {
        doc: import("@tiptap/pm/model").Node;
        selection: { from: number; to: number; empty: boolean };
      };
    },
    key: string
  ) => {
    const { doc, selection } = view.state;
    if (key === "Backspace") return canBackspaceInCurrentWord(doc, selection);
    if (key === "Delete") return canDeleteInCurrentWord(doc, selection);
    return true;
  };

  const editor = useEditor(
    {
      extensions: buildExtensions(editorMode),
      content: "",
      editable: !readOnly && !timeLocked,
      immediatelyRender: false,
      autofocus: false,
      editorProps: {
        attributes: {
          class: "ProseMirror focus:outline-none",
          spellcheck: "true",
        },
        handleKeyDown: (_view, event) => {
          const limit = wordTargetLimitRef.current;
          if (
            limit &&
            wordCount(_view.state.doc.textContent) >= limit &&
            event.key.length === 1 &&
            !event.metaKey &&
            !event.ctrlKey
          ) {
            event.preventDefault();
            return true;
          }
          if (
            limit &&
            wordCount(_view.state.doc.textContent) >= limit &&
            (event.key === "Enter" || event.key === " ") &&
            !event.metaKey &&
            !event.ctrlKey
          ) {
            event.preventDefault();
            return true;
          }

          if (event.key === "Backspace" || event.key === "Delete") {
            if (disableBackspaceRef.current) {
              if (!isDeletionAllowed(_view, event.key)) {
                event.preventDefault();
                triggerCharShakeRef.current(event.key);
                return true;
              }
              return false;
            }
          }

          return false;
        },
        handlePaste: (_view, event) => {
          if (disablePasteRef.current) {
            event.preventDefault();
            return true;
          }
          const limit = wordTargetLimitRef.current;
          if (
            limit &&
            wordCount(_view.state.doc.textContent) >= limit
          ) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    [editorMode]
  );

  const { atOrOverLimit } = useWordTargetLimit(editor);
  useWordTargetKeyBlock(editor, atOrOverLimit);

  React.useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (!disableBackspaceRef.current) return;

      const ed = editorRef.current;
      if (!ed) return;

      if (isDeletionAllowed(ed.view, event.key)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      triggerCharShakeRef.current(event.key);
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", onKeyDown, true);
    return () => dom.removeEventListener("keydown", onKeyDown, true);
  }, [editor]);

  React.useEffect(() => {
    if (editor) editor.setEditable(!readOnly && !timeLocked);
  }, [editor, readOnly, timeLocked]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        useFocusSettingsStore.getState().disablePaste &&
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "v"
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const activeIdRef = React.useRef(pageId);
  activeIdRef.current = pageId;
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = React.useCallback((id: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    usePagesStore.getState().updatePage(id, {
      content: ed.getJSON() as JSONContent,
      text: ed.getText(),
    });
  }, []);

  const flush = React.useCallback(
    (id: string) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      commit(id);
    },
    [commit]
  );

  React.useEffect(() => {
    if (!editor || readOnly) return;
    const onUpdate = () => {
      const id = activeIdRef.current;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => commit(id), AUTOSAVE_MS);
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, commit, readOnly]);

  const prevIdRef = React.useRef<string | null>(null);
  const selMemory = React.useRef<Map<string, { from: number; to: number }>>(
    new Map()
  );

  React.useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const prev = prevIdRef.current;
    const isInitial = prev === null;
    const pageChanged = prev !== null && prev !== pageId;

    if (pageChanged) {
      const { from, to } = ed.state.selection;
      selMemory.current.set(prev, { from, to });
      flush(prev);
      const prevPage = usePagesStore.getState().pages[prev];
      if (prevPage && prevPage.text.trim() === "") {
        usePagesStore.getState().deletePage(prev);
        selMemory.current.delete(prev);
      }
    }

    const page = usePagesStore.getState().pages[pageId];
    ed.commands.setContent(page?.content ?? "", { emitUpdate: false });
    useFocusSessionStore.getState().resetTargetNotification();

    const size = ed.state.doc.content.size;
    const remembered = selMemory.current.get(pageId);
    if (remembered) {
      const from = Math.min(Math.max(1, remembered.from), size);
      const to = Math.min(Math.max(from, remembered.to), size);
      ed.commands.setTextSelection({ from, to });
    }

    if (!isInitial && pageChanged && !readOnly) ed.commands.focus();
    prevIdRef.current = pageId;
  }, [pageId, flush, readOnly]);

  React.useEffect(() => {
    const onBeforeUnload = () => flush(activeIdRef.current);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [flush]);

  React.useEffect(() => {
    if (readOnly) return;
    return () => flush(activeIdRef.current);
  }, [flush, readOnly]);

  React.useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  React.useEffect(() => {
    return () => onEditorReady?.(null);
  }, [onEditorReady]);

  const openLink = React.useCallback(() => {
    if (!editor || focusMode || editorMode === "richtext") return;
    const { from, to } = editor.state.selection;
    setLinkTarget({ from, to });
  }, [editor, focusMode, editorMode]);

  React.useEffect(() => {
    if (!editor || readOnly || focusMode || editorMode === "richtext") return;
    const handler = () => {
      if (editor.isFocused) openLink();
    };
    window.addEventListener("blank:link", handler);
    return () => window.removeEventListener("blank:link", handler);
  }, [editor, openLink, readOnly, focusMode, editorMode]);

  if (!editor) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  const rootClass = cn(nightWriting && "night-writing");

  return (
    <div
      ref={containerRef}
      className={cn("editor-root relative", rootClass)}
      data-font={font}
    >
      <EditorContent editor={editor} className={cn("min-h-[50vh]")} />
      {!readOnly && !focusMode && linkTarget && editorMode === "markdown" && (
        <LinkPopover
          editor={editor}
          target={linkTarget}
          containerRef={containerRef}
          onClose={() => setLinkTarget(null)}
        />
      )}
    </div>
  );
}
