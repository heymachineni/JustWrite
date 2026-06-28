import type { Page } from "@/features/pages/types";

const FLUSH_MS = 1500;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

function pagePayload(page: Page, shareId: string) {
  return {
    shareId,
    title: page.title,
    content: page.content,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

export async function publishSharedPage(page: Page, shareId: string) {
  const res = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pagePayload(page, shareId)),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string" ? data.error : "Could not publish link."
    );
  }
}

export async function unpublishSharedPage(shareId: string) {
  const res = await fetch("/api/share", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shareId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string" ? data.error : "Could not stop sharing."
    );
  }
}

export function scheduleSharedPagePublish(page: Page, shareId: string) {
  const existing = pending.get(shareId);
  if (existing) clearTimeout(existing);

  pending.set(
    shareId,
    setTimeout(() => {
      pending.delete(shareId);
      void publishSharedPage(page, shareId).catch((err) => {
        console.error("[share] sync failed", err);
      });
    }, FLUSH_MS)
  );
}
