import type { Page, Project, PagesSnapshot } from "@/features/pages/types";

export function mergePages(
  local: Record<string, Page>,
  remote: Record<string, Page>
): Record<string, Page> {
  const merged: Record<string, Page> = { ...remote };

  for (const [id, localPage] of Object.entries(local)) {
    const remotePage = merged[id];
    if (!remotePage || localPage.updatedAt >= remotePage.updatedAt) {
      merged[id] = localPage;
    }
  }

  return merged;
}

export function mergeProjects(
  local: Record<string, Project>,
  remote: Record<string, Project>
): Record<string, Project> {
  const merged: Record<string, Project> = { ...remote };

  for (const [id, localProject] of Object.entries(local)) {
    if (!merged[id]) {
      merged[id] = localProject;
    }
  }

  return merged;
}

export function resolveActivePageId(
  mergedPages: Record<string, Page>,
  localActive: string | null,
  remoteActive: string | null
): string | null {
  if (localActive && mergedPages[localActive]) return localActive;
  if (remoteActive && mergedPages[remoteActive]) return remoteActive;
  const first = Object.values(mergedPages).sort(
    (a, b) => b.updatedAt - a.updatedAt
  )[0];
  return first?.id ?? null;
}

export function snapshotFromState(
  pages: Record<string, Page>,
  projects: Record<string, Project>,
  activePageId: string | null
): PagesSnapshot & { activePageId: string | null } {
  return { pages, projects, activePageId };
}
