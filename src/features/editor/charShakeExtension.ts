import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type CharShakeRange = { from: number; to: number } | null;

export const charShakePluginKey = new PluginKey<CharShakeRange>("charShake");

function createCharShakePlugin(): Plugin {
  return new Plugin({
    key: charShakePluginKey,
    state: {
      init(): CharShakeRange {
        return null;
      },
      apply(tr, value): CharShakeRange {
        const meta = tr.getMeta(charShakePluginKey);
        if (meta !== undefined) return meta as CharShakeRange;
        return value;
      },
    },
    props: {
      decorations(state) {
        const range = charShakePluginKey.getState(state);
        if (!range) return DecorationSet.empty;

        const size = state.doc.content.size;
        const from = Math.max(1, Math.min(range.from, size - 1));
        const to = Math.max(from + 1, Math.min(range.to, size));
        if (to <= from) return DecorationSet.empty;

        return DecorationSet.create(state.doc, [
          Decoration.inline(from, to, {
            class: "editor-char-shake",
            "data-char-shake": "1",
          }),
        ]);
      },
    },
  });
}

export const CharShakeExtension = Extension.create({
  name: "charShake",
  addProseMirrorPlugins() {
    return [createCharShakePlugin()];
  },
});

export function getCharShakeRange(
  editor: {
    state: {
      selection: { from: number; to: number; empty: boolean };
      doc: { content: { size: number } };
    };
  },
  key: string
): { from: number; to: number } | null {
  const { from, to, empty } = editor.state.selection;
  const size = editor.state.doc.content.size;

  if (key === "Backspace") {
    if (!empty) {
      if (to <= 1) return null;
      return { from: to - 1, to };
    }
    if (from <= 1) return null;
    return { from: from - 1, to: from };
  }

  if (key === "Delete") {
    if (!empty) {
      if (from >= size - 1) return null;
      return { from, to: from + 1 };
    }
    if (from >= size - 1) return null;
    return { from, to: from + 1 };
  }

  return null;
}

export function dispatchCharShake(editor: Editor, range: CharShakeRange) {
  editor.view.dispatch(editor.state.tr.setMeta(charShakePluginKey, range));
}

export function restartCharShakeAnimation(root: ParentNode) {
  const el = root.querySelector(".editor-char-shake");
  if (!el) return;
  el.classList.remove("editor-char-shake-active");
  // Force reflow so repeated backspace retriggers the animation
  void (el as HTMLElement).offsetWidth;
  el.classList.add("editor-char-shake-active");
}
