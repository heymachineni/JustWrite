import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JSONContent } from "@tiptap/react";
import { uid } from "@/lib/utils";
import type { Page, Project } from "./types";

export function clonePage(page: Page): Page {
  return {
    ...page,
    content: page.content
      ? (JSON.parse(JSON.stringify(page.content)) as JSONContent)
      : null,
  };
}

export function deriveTitle(text: string): string {
  const firstLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  const trimmed = firstLine.trim().replace(/^#+\s*/, "");
  return trimmed.slice(0, 120);
}

export function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function createEmptyPage(partial: Partial<Page> = {}): Page {
  const now = Date.now();
  return {
    id: uid("p_"),
    title: "",
    content: null,
    text: "",
    createdAt: now,
    updatedAt: now,
    pinned: false,
    projectId: null,
    order: -now, // newer pages sort above older ones by default
    shared: false,
    shareId: null,
    wordGoal: null,
    ...partial,
  };
}

interface PagesState {
  pages: Record<string, Page>;
  projects: Record<string, Project>;
  activePageId: string | null;
  _hydrated: boolean;

  // lifecycle
  setHydrated: () => void;
  ensureInitialPage: () => void;

  // pages
  createPage: (opts?: { projectId?: string | null; activate?: boolean }) => string;
  deletePage: (id: string) => void;
  restorePage: (page: Page, opts?: { activate?: boolean }) => void;
  duplicatePage: (id: string) => string | null;
  updatePage: (
    id: string,
    patch: { content?: JSONContent | null; text?: string; title?: string }
  ) => void;
  renamePage: (id: string, title: string) => void;
  setPinned: (id: string, pinned: boolean) => void;
  setActivePage: (id: string | null) => void;
  reorderPage: (id: string, order: number, projectId: string | null) => void;
  movePageToProject: (id: string, projectId: string | null) => void;
  setWordGoal: (id: string, goal: number | null) => void;

  // sharing
  sharePage: (id: string) => string;
  unsharePage: (id: string) => void;

  // projects
  createProject: (name?: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string, opts?: { deletePages?: boolean }) => void;
  reorderProject: (id: string, order: number) => void;

  // maintenance
  pruneEmptyPages: (exceptId?: string | null) => void;
}

export const usePagesStore = create<PagesState>()(
  persist(
    (set, get) => ({
      pages: {},
      projects: {},
      activePageId: null,
      _hydrated: false,

      setHydrated: () => set({ _hydrated: true }),

      ensureInitialPage: () => {
        const { pages } = get();
        if (Object.keys(pages).length === 0) {
          const page = createEmptyPage();
          set({ pages: { [page.id]: page }, activePageId: page.id });
        } else if (!get().activePageId) {
          const first = Object.values(pages).sort(sortPages)[0];
          set({ activePageId: first?.id ?? null });
        }
        get().pruneEmptyPages(get().activePageId);
      },

      createPage: (opts) => {
        const state = get();
        const active = state.activePageId
          ? state.pages[state.activePageId]
          : null;
        const projectId = opts?.projectId ?? null;

        if (
          active &&
          active.text.trim() === "" &&
          active.projectId === projectId
        ) {
          return active.id;
        }

        const page = createEmptyPage({ projectId });
        set((s) => ({
          pages: { ...s.pages, [page.id]: page },
          activePageId: opts?.activate === false ? s.activePageId : page.id,
        }));
        get().pruneEmptyPages(get().activePageId);
        return page.id;
      },

      deletePage: (id) => {
        set((s) => {
          const pages = { ...s.pages };
          delete pages[id];
          let activePageId = s.activePageId;
          if (activePageId === id) {
            const remaining = Object.values(pages).sort(sortPages);
            activePageId = remaining[0]?.id ?? null;
          }
          return { pages, activePageId };
        });
        if (Object.keys(get().pages).length === 0) get().ensureInitialPage();
      },

      restorePage: (page, opts) =>
        set((s) => ({
          pages: { ...s.pages, [page.id]: page },
          activePageId: opts?.activate ? page.id : s.activePageId,
        })),

      duplicatePage: (id) => {
        const src = get().pages[id];
        if (!src) return null;
        const copy = createEmptyPage({
          content: src.content,
          text: src.text,
          title: src.title ? `${src.title} copy` : "",
          projectId: src.projectId,
        });
        set((s) => ({
          pages: { ...s.pages, [copy.id]: copy },
          activePageId: copy.id,
        }));
        return copy.id;
      },

      updatePage: (id, patch) => {
        set((s) => {
          const prev = s.pages[id];
          if (!prev) return s;
          const text = patch.text ?? prev.text;
          const title =
            patch.title ?? (patch.text !== undefined ? deriveTitle(text) : prev.title);
          return {
            pages: {
              ...s.pages,
              [id]: {
                ...prev,
                content: patch.content !== undefined ? patch.content : prev.content,
                text,
                title,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      renamePage: (id, title) =>
        set((s) =>
          s.pages[id]
            ? {
                pages: {
                  ...s.pages,
                  [id]: { ...s.pages[id], title, updatedAt: Date.now() },
                },
              }
            : s
        ),

      setPinned: (id, pinned) =>
        set((s) =>
          s.pages[id]
            ? { pages: { ...s.pages, [id]: { ...s.pages[id], pinned } } }
            : s
        ),

      setActivePage: (id) => set({ activePageId: id }),

      reorderPage: (id, order, projectId) =>
        set((s) =>
          s.pages[id]
            ? {
                pages: {
                  ...s.pages,
                  [id]: { ...s.pages[id], order, projectId },
                },
              }
            : s
        ),

      movePageToProject: (id, projectId) =>
        set((s) =>
          s.pages[id]
            ? {
                pages: {
                  ...s.pages,
                  [id]: { ...s.pages[id], projectId, order: -Date.now() },
                },
              }
            : s
        ),

      setWordGoal: (id, goal) =>
        set((s) =>
          s.pages[id]
            ? { pages: { ...s.pages, [id]: { ...s.pages[id], wordGoal: goal } } }
            : s
        ),

      sharePage: (id) => {
        const existing = get().pages[id];
        const shareId = existing?.shareId ?? uid("s_");
        set((s) =>
          s.pages[id]
            ? {
                pages: {
                  ...s.pages,
                  [id]: { ...s.pages[id], shared: true, shareId },
                },
              }
            : s
        );
        return shareId;
      },

      unsharePage: (id) =>
        set((s) =>
          s.pages[id]
            ? { pages: { ...s.pages, [id]: { ...s.pages[id], shared: false } } }
            : s
        ),

      createProject: (name = "New project") => {
        const project: Project = {
          id: uid("pr_"),
          name,
          order: -Date.now(),
          createdAt: Date.now(),
        };
        set((s) => ({ projects: { ...s.projects, [project.id]: project } }));
        return project.id;
      },

      renameProject: (id, name) =>
        set((s) =>
          s.projects[id]
            ? { projects: { ...s.projects, [id]: { ...s.projects[id], name } } }
            : s
        ),

      deleteProject: (id, opts) =>
        set((s) => {
          const projects = { ...s.projects };
          delete projects[id];
          const pages = { ...s.pages };
          for (const p of Object.values(pages)) {
            if (p.projectId === id) {
              if (opts?.deletePages) delete pages[p.id];
              else pages[p.id] = { ...p, projectId: null };
            }
          }
          return { projects, pages };
        }),

      reorderProject: (id, order) =>
        set((s) =>
          s.projects[id]
            ? { projects: { ...s.projects, [id]: { ...s.projects[id], order } } }
            : s
        ),

      pruneEmptyPages: (exceptId) =>
        set((s) => {
          if (Object.keys(s.pages).length <= 1) return s;
          const pages = { ...s.pages };
          for (const p of Object.values(pages)) {
            if (
              p.id !== exceptId &&
              p.id !== s.activePageId &&
              p.text.trim() === "" &&
              !p.pinned &&
              !p.shared
            ) {
              delete pages[p.id];
            }
          }
          return { pages };
        }),
    }),
    {
      name: "blank.pages.v1",
      partialize: (s) => ({
        pages: s.pages,
        projects: s.projects,
        activePageId: s.activePageId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/** Default sort: pinned first, then by manual order (newer/top = smaller). */
export function sortPages(a: Page, b: Page): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return a.order - b.order;
}
