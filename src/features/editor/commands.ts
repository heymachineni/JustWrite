import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Link2,
  Sparkles,
  Mic,
  type LucideIcon,
} from "lucide-react";

export interface SlashCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  keywords: string[];
  /** Runs after the typed "/query" has been removed from the doc. */
  run: (ctx: { editor: Editor; openLink: () => void; openAI: () => void; openDictation: () => void }) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    id: "h1",
    title: "Heading 1",
    subtitle: "Large section heading",
    icon: Heading1,
    keywords: ["title", "h1", "big", "heading"],
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    title: "Heading 2",
    subtitle: "Medium section heading",
    icon: Heading2,
    keywords: ["h2", "subtitle", "heading"],
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    title: "Heading 3",
    subtitle: "Small section heading",
    icon: Heading3,
    keywords: ["h3", "heading"],
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "bullet",
    title: "Bullet list",
    subtitle: "A simple bulleted list",
    icon: List,
    keywords: ["unordered", "bullet", "list", "ul"],
    run: ({ editor }) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "numbered",
    title: "Numbered list",
    subtitle: "An ordered list",
    icon: ListOrdered,
    keywords: ["ordered", "numbered", "list", "ol"],
    run: ({ editor }) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "divider",
    title: "Divider",
    subtitle: "Visually separate sections",
    icon: Minus,
    keywords: ["hr", "divider", "rule", "line", "separator"],
    run: ({ editor }) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "link",
    title: "Link",
    subtitle: "Insert or edit a link",
    icon: Link2,
    keywords: ["url", "link", "href"],
    run: ({ openLink }) => openLink(),
  },
  {
    id: "ai",
    title: "Ask AI editor",
    subtitle: "Write, edit, or ask a question",
    icon: Sparkles,
    keywords: ["ai", "assistant", "write", "edit", "improve"],
    run: ({ openAI }) => openAI(),
  },
  {
    id: "dictation",
    title: "Dictation",
    subtitle: "Speak to write",
    icon: Mic,
    keywords: ["voice", "speak", "dictate", "mic"],
    run: ({ openDictation }) => openDictation(),
  },
];
