"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";

export interface LinkTarget {
  from: number;
  to: number;
}

function normalizeUrl(input: string): string {
  const url = input.trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

export function LinkPopover({
  editor,
  target,
  containerRef,
  onClose,
}: {
  editor: Editor;
  target: LinkTarget;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const empty = target.from === target.to;
  const existingHref = editor.getAttributes("link").href as string | undefined;
  const selectedText = empty
    ? ""
    : editor.state.doc.textBetween(target.from, target.to, " ");

  const [url, setUrl] = React.useState(existingHref ?? "");
  const [text, setText] = React.useState(selectedText);
  const urlRef = React.useRef<HTMLInputElement>(null);

  const coords = editor.view.coordsAtPos(target.from);
  const container = containerRef.current?.getBoundingClientRect();
  const top = coords.bottom - (container?.top ?? 0) + 8;
  const left = coords.left - (container?.left ?? 0);

  React.useEffect(() => {
    const id = window.setTimeout(() => urlRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const save = () => {
    const href = normalizeUrl(url);
    if (!href) {
      // Cancelling with an empty URL must fully restore the original text.
      onClose();
      return;
    }
    if (empty) {
      const label = text.trim() || href;
      editor
        .chain()
        .focus()
        .insertContentAt(target.from, [
          { type: "text", text: label, marks: [{ type: "link", attrs: { href } }] },
        ])
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: target.from, to: target.to })
        .extendMarkRange("link")
        .setLink({ href })
        .run();
    }
    onClose();
  };

  const remove = () => {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: target.from, to: target.to })
      .extendMarkRange("link")
      .unsetLink()
      .run();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={onClose} />
      <div
        className="absolute z-50 w-72 rounded-lg border border-border bg-bg-elevated p-2 shadow-[var(--shadow)] animate-pop-in"
        style={{ top, left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {empty && (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text"
            className="mb-1.5 w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-border-strong"
          />
        )}
        <input
          ref={urlRef}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder="Paste or type a link…"
          className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-border-strong"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          {existingHref ? (
            <Button variant="ghost" size="sm" onClick={remove} className="text-red-500">
              Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
