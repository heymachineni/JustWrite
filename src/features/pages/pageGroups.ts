import type { Page } from "./types";

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isPageWritten(page: Page): boolean {
  return page.text.trim().length > 0;
}

export function formatPageDayLabel(dayTimestamp: number): string {
  const date = new Date(dayTimestamp);
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = today - 86400000;
  const day = startOfDay(date);

  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";

  return date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export type PageDayGroup = {
  label: string;
  dayKey: number;
  pages: Page[];
};

/** Pages visible in the sidebar: written pages plus the active draft (Untitled). */
export function pagesForSidebar(
  pages: Page[],
  activePageId: string | null
): Page[] {
  return pages.filter((p) => isPageWritten(p) || p.id === activePageId);
}

/** Sidebar pages grouped by last-updated calendar day, newest first. */
export function groupPagesByDay(
  pages: Page[],
  activePageId: string | null
): PageDayGroup[] {
  const visible = pagesForSidebar(pages, activePageId);
  const byDay = new Map<number, Page[]>();

  for (const page of visible) {
    const key = startOfDay(new Date(page.updatedAt));
    const list = byDay.get(key) ?? [];
    list.push(page);
    byDay.set(key, list);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => b - a)
    .map(([dayKey, dayPages]) => ({
      label: formatPageDayLabel(dayKey),
      dayKey,
      pages: dayPages.sort((a, b) => {
        const byCreated = b.createdAt - a.createdAt;
        if (byCreated !== 0) return byCreated;
        return b.updatedAt - a.updatedAt;
      }),
    }));
}
