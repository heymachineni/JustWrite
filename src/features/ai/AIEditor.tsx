"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import {
  Sparkles,
  ArrowUp,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Wand2,
} from "lucide-react";
import { generate, streamGenerate, type AIPreset } from "./mockAI";
import { cn } from "@/lib/utils";

interface Turn {
  prompt: string;
  preset: AIPreset;
  output: string;
  range: { from: number; to: number };
}

const presets: { id: AIPreset; label: string }[] = [
  { id: "proofread", label: "Proofread" },
  { id: "shorten", label: "Shorten" },
  { id: "improve", label: "Improve" },
];

export function AIEditor({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [showPresets, setShowPresets] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [partial, setPartial] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [turnIndex, setTurnIndex] = React.useState(-1);
  const stopRef = React.useRef<(() => void) | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open) {
      setPrompt("");
      setTurns([]);
      setTurnIndex(-1);
      setPartial("");
      setShowPresets(false);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      stopRef.current?.();
    }
  }, [open]);

  if (!open || !editor) return null;

  const selection = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(
    selection.from,
    selection.to,
    "\n"
  );
  const currentTurn = turnIndex >= 0 ? turns[turnIndex] : null;
  const display = streaming ? partial : currentTurn?.output ?? "";

  const run = (preset: AIPreset, p: string) => {
    const input = selectedText || editor.getText();
    const range = selection.empty
      ? { from: selection.from, to: selection.from }
      : { from: selection.from, to: selection.to };
    const full = generate(preset, p, input);
    setStreaming(true);
    setPartial("");
    stopRef.current?.();
    stopRef.current = streamGenerate(
      full,
      (chunk) => setPartial(chunk),
      () => {
        setStreaming(false);
        setTurns((prev) => {
          const next = [...prev, { prompt: p, preset, output: full, range }];
          setTurnIndex(next.length - 1);
          return next;
        });
      }
    );
  };

  const submit = () => {
    const p = prompt.trim();
    if (!p && !showPresets) return;
    run("ask", p);
  };

  const accept = () => {
    if (!currentTurn) return;
    const { range, output } = currentTurn;
    const blocks = output.split(/\n{2,}/).map((para) => ({
      type: "paragraph",
      content: para ? [{ type: "text", text: para.replace(/\n/g, " ") }] : [],
    }));
    if (range.from === range.to) {
      editor.chain().focus().insertContentAt(range.from, blocks).run();
    } else {
      editor.chain().focus().insertContentAt(range, blocks).run();
    }
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-24">
      <div
        className="fixed inset-0 -z-10"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-[var(--shadow)] animate-pop-in">
        {display && (
          <div className="max-h-72 overflow-y-auto whitespace-pre-wrap border-b border-border px-4 py-3 text-sm leading-relaxed text-fg">
            {display}
            {streaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-fg align-middle" />
            )}
          </div>
        )}

        <div className="flex items-end gap-2 px-3 py-2.5">
          <Sparkles className="mb-1.5 h-4 w-4 shrink-0 text-muted-fg" />
          <textarea
            ref={inputRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
              if (e.key === "Escape") onOpenChange(false);
            }}
            placeholder={
              selectedText ? "Edit the selection…" : "Ask the AI editor anything…"
            }
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-faint-fg"
          />
          <button
            aria-label="Presets"
            onClick={() => setShowPresets((s) => !s)}
            className={cn(
              "mb-0.5 flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              showPresets
                ? "bg-[var(--hover)] text-fg"
                : "text-muted-fg hover:bg-[var(--hover)]"
            )}
          >
            <Wand2 className="h-4 w-4" />
          </button>
          <button
            aria-label="Submit"
            onClick={submit}
            className="mb-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        {showPresets && !currentTurn && (
          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => run(p.id, p.label)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {currentTurn && !streaming && (
          <div className="flex items-center gap-1 border-t border-border px-3 py-2">
            <button
              aria-label="Previous turn"
              disabled={turnIndex <= 0}
              onClick={() => setTurnIndex((i) => Math.max(0, i - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-fg hover:bg-[var(--hover)] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next turn"
              disabled={turnIndex >= turns.length - 1}
              onClick={() => setTurnIndex((i) => Math.min(turns.length - 1, i + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-fg hover:bg-[var(--hover)] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-1 text-xs text-faint-fg">
              {turnIndex + 1} / {turns.length}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-fg hover:bg-[var(--hover)]"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </button>
              <button
                onClick={accept}
                className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-2.5 py-1.5 text-sm text-[var(--accent-fg)] hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" /> Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
