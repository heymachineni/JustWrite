import type { JSONContent } from "@tiptap/react";

function applyMarks(text: string, marks?: JSONContent["marks"]): string {
  if (!marks) return text;
  let out = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        out = `**${out}**`;
        break;
      case "italic":
        out = `*${out}*`;
        break;
      case "strike":
        out = `~~${out}~~`;
        break;
      case "code":
        out = `\`${out}\``;
        break;
      case "underline":
        out = `<u>${out}</u>`;
        break;
      case "link":
        out = `[${out}](${mark.attrs?.href ?? ""})`;
        break;
    }
  }
  return out;
}

function inline(nodes: JSONContent[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") return applyMarks(n.text ?? "", n.marks);
      if (n.type === "hardBreak") return "  \n";
      return "";
    })
    .join("");
}

function block(node: JSONContent, depth = 0): string {
  switch (node.type) {
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      return `${"#".repeat(level)} ${inline(node.content)}`;
    }
    case "paragraph":
      return inline(node.content);
    case "horizontalRule":
      return "---";
    case "bulletList":
      return (node.content ?? [])
        .map((li) => `${"  ".repeat(depth)}- ${listItem(li, depth)}`)
        .join("\n");
    case "orderedList":
      return (node.content ?? [])
        .map((li, i) => `${"  ".repeat(depth)}${i + 1}. ${listItem(li, depth)}`)
        .join("\n");
    default:
      return inline(node.content);
  }
}

function listItem(li: JSONContent, depth: number): string {
  return (li.content ?? [])
    .map((child) =>
      child.type === "bulletList" || child.type === "orderedList"
        ? "\n" + block(child, depth + 1)
        : block(child, depth)
    )
    .join("");
}

export function toMarkdown(doc: JSONContent | null): string {
  if (!doc || !doc.content) return "";
  return doc.content
    .map((node) => block(node))
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename || "untitled"}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
