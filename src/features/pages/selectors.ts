"use client";

import { useShallow } from "zustand/react/shallow";
import { usePagesStore, sortPages } from "./store";
import type { Page, Project } from "./types";

export function useTopLevelPages(): Page[] {
  return usePagesStore(
    useShallow((s) =>
      Object.values(s.pages)
        .filter((p) => p.projectId === null)
        .sort(sortPages)
    )
  );
}

export function usePagesInProject(projectId: string): Page[] {
  return usePagesStore(
    useShallow((s) =>
      Object.values(s.pages)
        .filter((p) => p.projectId === projectId)
        .sort(sortPages)
    )
  );
}

export function useProjectsList(): Project[] {
  return usePagesStore(
    useShallow((s) =>
      Object.values(s.projects).sort((a, b) => a.order - b.order)
    )
  );
}

export function useAllPages(): Page[] {
  return usePagesStore(
    useShallow((s) =>
      Object.values(s.pages).sort((a, b) => b.updatedAt - a.updatedAt)
    )
  );
}

export function useActivePage(): Page | null {
  return usePagesStore((s) => (s.activePageId ? s.pages[s.activePageId] : null) ?? null);
}

export function useProjectCounts(): Record<string, number> {
  return usePagesStore(
    useShallow((s) => {
      const counts: Record<string, number> = {};
      for (const p of Object.values(s.pages)) {
        if (p.projectId) counts[p.projectId] = (counts[p.projectId] ?? 0) + 1;
      }
      return counts;
    })
  );
}
