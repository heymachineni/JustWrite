import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";
import type { EditorMode } from "@/features/settings/store";
import { CharShakeExtension } from "./charShakeExtension";

export const PLACEHOLDER_TEXT = "Start writing\u2026";

export function buildExtensions(mode: EditorMode = "richtext"): Extensions {
  const isMarkdown = mode === "markdown";

  const starter = isMarkdown
    ? StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
        codeBlock: false,
        blockquote: false,
      })
    : StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
        link: false,
        underline: false,
        blockquote: false,
        codeBlock: false,
      });

  return [
    starter,
    CharShakeExtension,
    Placeholder.configure({
      placeholder: ({ node, pos }) => {
        if (!isMarkdown && node.type.name !== "paragraph") return "";
        if (node.type.name === "heading") return "Heading";
        return pos === 0 ? PLACEHOLDER_TEXT : "";
      },
      showOnlyWhenEditable: true,
    }),
  ];
}
