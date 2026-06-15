"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { wordCount } from "@/features/pages/store";
import { useActivePage } from "@/features/pages/selectors";
import { useSettingsStore } from "@/features/settings/store";

export function WordCount({ editor }: { editor: Editor | null }) {
  const showWordCount = useSettingsStore((s) => s.showWordCount);
  const page = useActivePage();
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!editor) return;
    const update = () => setCount(wordCount(editor.getText()));
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  React.useEffect(() => {
    if (editor) setCount(wordCount(editor.getText()));
  }, [editor, page?.id]);

  if (!page || !showWordCount) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-10 tabular-nums text-[12px] text-faint-fg"
      aria-label={`${count} words`}
    >
      {count} {count === 1 ? "word" : "words"}
    </div>
  );
}
