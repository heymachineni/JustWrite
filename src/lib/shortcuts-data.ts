import { modKeyLabel } from "./utils";

const mod = modKeyLabel();

export type ShortcutItem = {
  label: string;
  keys: string;
};

export type MarkdownItem = {
  label: string;
  syntax: string;
};

export type ShortcutGroup = {
  title: string;
  items: ShortcutItem[];
};

export const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Pages",
    items: [
      { label: "New page", keys: `${mod}O` },
      { label: "Open pages", keys: `${mod}\\` },
    ],
  },
  {
    title: "Formatting",
    items: [
      { label: "Bold", keys: `${mod}B` },
      { label: "Italic", keys: `${mod}I` },
      { label: "Link", keys: `${mod}⇧U` },
    ],
  },
];

export const markdownItems: MarkdownItem[] = [
  { label: "Bold", syntax: "**text**" },
  { label: "Italic", syntax: "*text*" },
  { label: "Heading", syntax: "# " },
  { label: "Bullet list", syntax: "- " },
  { label: "Numbered list", syntax: "1. " },
  { label: "Divider", syntax: "---" },
];

/** Split a combo like ⌘⇧U or Ctrl+B into individual key tokens. */
export function parseKeyCombo(combo: string): string[] {
  if (combo.includes("+")) {
    return combo.split("+").map((part) => part.trim()).filter(Boolean);
  }

  const symbols = ["⌘", "⇧", "⌥", "⌃"];
  const parts: string[] = [];
  let rest = combo;

  while (rest.length > 0) {
    const symbol = symbols.find((s) => rest.startsWith(s));
    if (symbol) {
      parts.push(symbol);
      rest = rest.slice(symbol.length);
      continue;
    }
    parts.push(rest);
    break;
  }

  return parts;
}
