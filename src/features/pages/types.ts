import type { JSONContent } from "@tiptap/react";

export interface Page {
  id: string;
  title: string;
  /** ProseMirror document as JSON for lossless round-tripping. */
  content: JSONContent | null;
  /** Plain-text mirror used for search and word counts. */
  text: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  projectId: string | null;
  /** Fractional ordering key for drag-and-drop without sibling churn. */
  order: number;
  shared: boolean;
  shareId: string | null;
  /** Optional per-page word goal. */
  wordGoal: number | null;
}

export interface Project {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface PagesSnapshot {
  pages: Record<string, Page>;
  projects: Record<string, Project>;
}
