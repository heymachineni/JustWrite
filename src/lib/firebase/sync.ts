import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";
import type { Page, Project } from "@/features/pages/types";
import { getClientFirestore } from "./firestore";
import {
  mergePages,
  mergeProjects,
  resolveActivePageId,
} from "./merge";

const BATCH_LIMIT = 400;

function pagesRef(db: Firestore, uid: string) {
  return collection(db, "users", uid, "pages");
}

function projectsRef(db: Firestore, uid: string) {
  return collection(db, "users", uid, "projects");
}

function metaRef(db: Firestore, uid: string) {
  return doc(db, "users", uid, "meta", "main");
}

export async function pullUserData(uid: string) {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not configured");

  const [pagesSnap, projectsSnap, metaDoc] = await Promise.all([
    getDocs(pagesRef(db, uid)),
    getDocs(projectsRef(db, uid)),
    getDoc(metaRef(db, uid)),
  ]);

  const pages: Record<string, Page> = {};
  pagesSnap.forEach((d) => {
    pages[d.id] = d.data() as Page;
  });

  const projects: Record<string, Project> = {};
  projectsSnap.forEach((d) => {
    projects[d.id] = d.data() as Project;
  });

  let activePageId: string | null = null;
  if (metaDoc.exists()) {
    activePageId = (metaDoc.data().activePageId as string | null) ?? null;
  }

  return { pages, projects, activePageId };
}

async function writeBatchChunked(
  db: Firestore,
  ops: Array<{ ref: ReturnType<typeof doc>; data?: unknown; delete?: boolean }>
) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const chunk = ops.slice(i, i + BATCH_LIMIT);
    for (const op of chunk) {
      if (op.delete) batch.delete(op.ref);
      else batch.set(op.ref, op.data as Record<string, unknown>);
    }
    await batch.commit();
  }
}

export async function pushUserData(
  uid: string,
  pages: Record<string, Page>,
  projects: Record<string, Project>,
  activePageId: string | null
) {
  const db = getClientFirestore();
  if (!db) throw new Error("Firestore not configured");

  const ops: Array<{
    ref: ReturnType<typeof doc>;
    data?: unknown;
    delete?: boolean;
  }> = [];

  for (const page of Object.values(pages)) {
    ops.push({
      ref: doc(db, "users", uid, "pages", page.id),
      data: page,
    });
  }

  for (const project of Object.values(projects)) {
    ops.push({
      ref: doc(db, "users", uid, "projects", project.id),
      data: project,
    });
  }

  ops.push({
    ref: metaRef(db, uid),
    data: { activePageId, syncedAt: Date.now() },
  });

  await writeBatchChunked(db, ops);
}

export async function pushPage(uid: string, page: Page) {
  const db = getClientFirestore();
  if (!db) return;
  await setDoc(doc(db, "users", uid, "pages", page.id), page);
}

export async function deleteRemotePage(uid: string, pageId: string) {
  const db = getClientFirestore();
  if (!db) return;
  await deleteDoc(doc(db, "users", uid, "pages", pageId));
}

export async function pushProject(uid: string, project: Project) {
  const db = getClientFirestore();
  if (!db) return;
  await setDoc(doc(db, "users", uid, "projects", project.id), project);
}

export async function deleteRemoteProject(uid: string, projectId: string) {
  const db = getClientFirestore();
  if (!db) return;
  await deleteDoc(doc(db, "users", uid, "projects", projectId));
}

export async function pushMeta(uid: string, activePageId: string | null) {
  const db = getClientFirestore();
  if (!db) return;
  await setDoc(metaRef(db, uid), { activePageId, syncedAt: Date.now() });
}

export async function mergeAndSyncOnSignIn(
  uid: string,
  local: {
    pages: Record<string, Page>;
    projects: Record<string, Project>;
    activePageId: string | null;
  }
) {
  const remote = await pullUserData(uid);

  const mergedPages = mergePages(local.pages, remote.pages);
  const mergedProjects = mergeProjects(local.projects, remote.projects);
  const activePageId = resolveActivePageId(
    mergedPages,
    local.activePageId,
    remote.activePageId
  );

  await pushUserData(uid, mergedPages, mergedProjects, activePageId);

  return { pages: mergedPages, projects: mergedProjects, activePageId };
}

export function subscribeRemoteChanges(
  uid: string,
  onRemoteChange: (change: {
    type: "page" | "project" | "meta";
    id?: string;
    page?: Page;
    project?: Project;
    activePageId?: string | null;
    removed?: boolean;
  }) => void
) {
  const db = getClientFirestore();
  if (!db) return () => {};

  const unsubPages = onSnapshot(pagesRef(db, uid), (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "removed") {
        onRemoteChange({ type: "page", id: change.doc.id, removed: true });
      } else {
        onRemoteChange({
          type: "page",
          id: change.doc.id,
          page: change.doc.data() as Page,
        });
      }
    });
  });

  const unsubProjects = onSnapshot(projectsRef(db, uid), (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "removed") {
        onRemoteChange({ type: "project", id: change.doc.id, removed: true });
      } else {
        onRemoteChange({
          type: "project",
          id: change.doc.id,
          project: change.doc.data() as Project,
        });
      }
    });
  });

  const unsubMeta = onSnapshot(metaRef(db, uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onRemoteChange({
        type: "meta",
        activePageId: (data.activePageId as string | null) ?? null,
      });
    }
  });

  return () => {
    unsubPages();
    unsubProjects();
    unsubMeta();
  };
}
