"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Link2,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

function useSelectionVersion(editor: Editor) {
  const [, force] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    editor.on("selectionUpdate", force);
    editor.on("transaction", force);
    return () => {
      editor.off("selectionUpdate", force);
      editor.off("transaction", force);
    };
  }, [editor]);
}

export function SelectionToolbar({
  editor,
  containerRef,
  openLink,
}: {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  openLink: () => void;
}) {
  useSelectionVersion(editor);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(
    null
  );

  React.useEffect(() => {
    const update = () => {
      const { state } = editor;
      const { from, to, empty } = state.selection;
      if (empty || !editor.isFocused) {
        setPos(null);
        return;
      }
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const container = containerRef.current?.getBoundingClientRect();
      const cTop = container?.top ?? 0;
      const cLeft = container?.left ?? 0;
      setPos({
        top: Math.min(start.top, end.top) - cTop - 46,
        left: (start.left + end.left) / 2 - cLeft,
      });
    };
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, containerRef]);

  if (!pos) return null;

  return (
    <div
      className="absolute z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-bg-elevated p-1 shadow-[var(--shadow)] animate-pop-in"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <TBtn
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </TBtn>
      <Divider />
      <TBtn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <Bold className="h-4 w-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <Italic className="h-4 w-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </TBtn>
      <Divider />
      <TBtn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <List className="h-4 w-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </TBtn>
      <Divider />
      <TBtn active={editor.isActive("link")} onClick={openLink} label="Link">
        <Link2 className="h-4 w-4" />
      </TBtn>
    </div>
  );
}

function TBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-[var(--accent)] text-[var(--accent-fg)]"
          : "text-muted-fg hover:bg-[var(--hover)] hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-border" />;
}
