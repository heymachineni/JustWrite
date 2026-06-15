import type { Node as PMNode } from "@tiptap/pm/model";

const WORD_BREAK = /[\s\u00a0]/;

/** First document position of the word the cursor is in (after any leading whitespace). */
export function getCurrentWordStart(doc: PMNode, cursorPos: number): number {
  let pos = cursorPos;
  while (pos > 1) {
    const char = doc.textBetween(pos - 1, pos, "", "");
    if (!char || WORD_BREAK.test(char)) return pos;
    pos--;
  }
  return Math.max(1, pos);
}

/** Document position after the last character of the word at cursor. */
export function getCurrentWordEnd(doc: PMNode, cursorPos: number): number {
  let pos = cursorPos;
  const size = doc.content.size;
  while (pos < size - 1) {
    const char = doc.textBetween(pos, pos + 1, "", "");
    if (!char || WORD_BREAK.test(char)) return pos;
    pos++;
  }
  return pos;
}

export function isWithinCurrentWord(
  doc: PMNode,
  selection: { from: number; to: number; empty: boolean }
): { start: number; end: number } {
  const anchor = selection.from;
  return {
    start: getCurrentWordStart(doc, anchor),
    end: getCurrentWordEnd(doc, anchor),
  };
}

export function canBackspaceInCurrentWord(
  doc: PMNode,
  selection: { from: number; to: number; empty: boolean }
): boolean {
  const { from, to, empty } = selection;
  const { start, end } = isWithinCurrentWord(doc, selection);

  if (!empty) {
    return from >= start && to <= end;
  }

  return from > start;
}

export function canDeleteInCurrentWord(
  doc: PMNode,
  selection: { from: number; to: number; empty: boolean }
): boolean {
  const { from, to, empty } = selection;
  const { start, end } = isWithinCurrentWord(doc, selection);

  if (!empty) {
    return from >= start && to <= end;
  }

  return from < end;
}
