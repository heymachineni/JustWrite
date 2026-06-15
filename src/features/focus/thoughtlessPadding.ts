import type { JSONContent } from "@tiptap/react";

export const THOUGHTLESS_PADDING_LINES = 4;

function isEmptyParagraph(node: JSONContent): boolean {
  if (node.type !== "paragraph") return false;
  if (!node.content || node.content.length === 0) return true;
  return node.content.every(
    (n) => n.type === "text" && (n.text ?? "").length === 0
  );
}

export function applyThoughtlessPadding(doc: JSONContent | null): JSONContent {
  const content = doc?.content ?? [];
  const padding = Array.from({ length: THOUGHTLESS_PADDING_LINES }, () => ({
    type: "paragraph" as const,
  }));
  return { type: "doc", content: [...padding, ...content] };
}

export function stripThoughtlessPadding(doc: JSONContent | null): JSONContent {
  const nodes = [...(doc?.content ?? [])];
  let removed = 0;
  while (
    removed < THOUGHTLESS_PADDING_LINES &&
    nodes.length > 0 &&
    isEmptyParagraph(nodes[0])
  ) {
    nodes.shift();
    removed++;
  }
  return { type: "doc", content: nodes.length ? nodes : [{ type: "paragraph" }] };
}
