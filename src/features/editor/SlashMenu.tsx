"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { slashCommands, type SlashCommand } from "./commands";
import { fuzzyScore } from "@/lib/fuzzy";
import { cn } from "@/lib/utils";

interface SlashState {
  query: string;
  from: number;
  to: number;
  top: number;
  left: number;
}

function matchCommands(query: string): SlashCommand[] {
  if (!query) return slashCommands;
  const scored: { cmd: SlashCommand; score: number }[] = [];
  for (const cmd of slashCommands) {
    const haystack = [cmd.title, ...cmd.keywords].join(" ");
    const score = fuzzyScore(query, haystack);
    if (score !== null) scored.push({ cmd, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.cmd);
}

export function SlashMenu({
  editor,
  containerRef,
  openLink,
  openAI,
  openDictation,
}: {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  openLink: () => void;
  openAI: () => void;
  openDictation: () => void;
}) {
  const [state, setState] = React.useState<SlashState | null>(null);
  const [index, setIndex] = React.useState(0);

  const filtered = React.useMemo(
    () => (state ? matchCommands(state.query) : []),
    [state]
  );

  // Refs keep the keydown handler reading the latest values without rebinding.
  const stateRef = React.useRef(state);
  const filteredRef = React.useRef(filtered);
  const indexRef = React.useRef(index);
  stateRef.current = state;
  filteredRef.current = filtered;
  indexRef.current = index;

  const close = React.useCallback(() => setState(null), []);

  const select = React.useCallback(
    (cmd: SlashCommand | undefined) => {
      const s = stateRef.current;
      if (!cmd || !s) return;
      editor.chain().focus().deleteRange({ from: s.from, to: s.to }).run();
      cmd.run({ editor, openLink, openAI, openDictation });
      setState(null);
    },
    [editor, openLink, openAI, openDictation]
  );

  // Detect "/query" at the start of an empty paragraph line.
  React.useEffect(() => {
    const detect = () => {
      const { state: ps } = editor;
      const { selection } = ps;
      if (!selection.empty || !editor.isFocused) {
        setState(null);
        return;
      }
      const $from = selection.$from;
      if ($from.parent.type.name !== "paragraph") {
        setState(null);
        return;
      }
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\n");
      const m = /^\/(\S*)$/.exec(textBefore);
      if (!m) {
        setState(null);
        return;
      }
      const to = selection.from;
      const from = to - m[0].length;
      const coords = editor.view.coordsAtPos(from);
      const container = containerRef.current?.getBoundingClientRect();
      setState((prev) => {
        const next: SlashState = {
          query: m[1],
          from,
          to,
          top: coords.bottom - (container?.top ?? 0) + 8,
          left: coords.left - (container?.left ?? 0),
        };
        if (
          prev &&
          prev.query === next.query &&
          prev.from === next.from &&
          prev.to === next.to
        )
          return prev;
        return next;
      });
    };

    editor.on("transaction", detect);
    editor.on("focus", detect);
    return () => {
      editor.off("transaction", detect);
      editor.off("focus", detect);
    };
  }, [editor, containerRef]);

  React.useEffect(() => setIndex(0), [state?.query]);

  // Keyboard navigation, intercepted before ProseMirror handles the keys.
  React.useEffect(() => {
    const dom = editor.view.dom;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      const list = filteredRef.current;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIndex((i) => (list.length ? (i + 1) % list.length : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setIndex((i) => (list.length ? (i - 1 + list.length) % list.length : 0));
          break;
        case "Enter":
          e.preventDefault();
          select(list[indexRef.current]);
          break;
        case "Tab":
          e.preventDefault();
          select(list[indexRef.current]);
          break;
        case "Escape":
          e.preventDefault();
          setState(null);
          break;
      }
    };
    dom.addEventListener("keydown", onKeyDown, true);
    return () => dom.removeEventListener("keydown", onKeyDown, true);
  }, [editor, select]);

  if (!state || filtered.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Slash commands"
      className="absolute z-40 w-72 overflow-hidden rounded-lg border border-border bg-bg-elevated p-1 shadow-[var(--shadow)] animate-pop-in"
      style={{ top: state.top, left: state.left }}
      // Keep editor focus when interacting with the menu.
      onMouseDown={(e) => e.preventDefault()}
    >
      {filtered.map((cmd, i) => {
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.id}
            role="option"
            aria-selected={i === index}
            onMouseEnter={() => setIndex(i)}
            onClick={() => select(cmd)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
              i === index ? "bg-[var(--hover)]" : "bg-transparent"
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-fg">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-fg">
                {cmd.title}
              </span>
              <span className="block truncate text-xs text-muted-fg">
                {cmd.subtitle}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
