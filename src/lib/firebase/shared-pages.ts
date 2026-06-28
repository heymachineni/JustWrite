import type { JSONContent } from "@tiptap/react";

export const SHARED_PAGES_COLLECTION = "shared_pages";

export type SharedPageRecord = {
  title: string;
  content: JSONContent | null;
  createdAt: number;
  updatedAt: number;
};

export async function upsertSharedPage(
  shareId: string,
  data: SharedPageRecord
): Promise<void> {
  const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
    "./admin"
  );

  if (!isFirebaseAdminConfigured()) {
    throw new Error("Sharing is not configured.");
  }

  const db = await getAdminFirestore();
  if (!db) throw new Error("Sharing is not configured.");

  await db.collection(SHARED_PAGES_COLLECTION).doc(shareId).set(data);
}

export async function deleteSharedPage(shareId: string): Promise<void> {
  const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
    "./admin"
  );

  if (!isFirebaseAdminConfigured()) return;

  const db = await getAdminFirestore();
  if (!db) return;

  await db.collection(SHARED_PAGES_COLLECTION).doc(shareId).delete();
}

export async function getSharedPage(
  shareId: string
): Promise<SharedPageRecord | null> {
  const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
    "./admin"
  );

  if (!isFirebaseAdminConfigured()) return null;

  const db = await getAdminFirestore();
  if (!db) return null;

  const snap = await db.collection(SHARED_PAGES_COLLECTION).doc(shareId).get();
  if (!snap.exists) return null;

  const data = snap.data();
  if (!data || typeof data.updatedAt !== "number") return null;

  return {
    title: typeof data.title === "string" ? data.title : "",
    content: (data.content as JSONContent | null) ?? null,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : data.updatedAt,
    updatedAt: data.updatedAt,
  };
}
