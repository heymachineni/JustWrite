"use client";

import * as React from "react";
import { usePagesStore } from "@/features/pages/store";
import { useAuthStore } from "@/features/auth/store";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  mergeAndSyncOnSignIn,
  subscribeRemoteChanges,
  pushPage,
  deleteRemotePage,
  pushProject,
  deleteRemoteProject,
  pushMeta,
} from "@/lib/firebase/sync";
import { useToast } from "@/components/ui/toast";

const FLUSH_MS = 1500;

export function FirestoreSync() {
  const user = useAuthStore((s) => s.user);
  const pagesHydrated = usePagesStore((s) => s._hydrated);
  const { show: toast } = useToast();

  const syncingRef = React.useRef(false);
  const uidRef = React.useRef<string | null>(null);
  const pendingPages = React.useRef(new Set<string>());
  const pendingProjects = React.useRef(new Set<string>());
  const pendingDeletes = React.useRef(new Set<string>());
  const pendingProjectDeletes = React.useRef(new Set<string>());
  const flushTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = React.useCallback(async () => {
    const uid = uidRef.current;
    if (!uid || syncingRef.current) return;

    const state = usePagesStore.getState();
    const pageIds = [...pendingPages.current];
    const projectIds = [...pendingProjects.current];
    const pageDeletes = [...pendingDeletes.current];
    const projectDeletes = [...pendingProjectDeletes.current];

    pendingPages.current.clear();
    pendingProjects.current.clear();
    pendingDeletes.current.clear();
    pendingProjectDeletes.current.clear();

    try {
      for (const id of pageDeletes) {
        await deleteRemotePage(uid, id);
      }
      for (const id of pageIds) {
        const page = state.pages[id];
        if (page) await pushPage(uid, page);
      }
      for (const id of projectDeletes) {
        await deleteRemoteProject(uid, id);
      }
      for (const id of projectIds) {
        const project = state.projects[id];
        if (project) await pushProject(uid, project);
      }
    } catch (err) {
      console.error("[sync] flush failed", err);
    }
  }, []);

  const scheduleFlush = React.useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => flush(), FLUSH_MS);
  }, [flush]);

  const scheduleMetaPush = React.useCallback((activePageId: string | null) => {
    const uid = uidRef.current;
    if (!uid) return;
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => pushMeta(uid, activePageId), FLUSH_MS);
  }, []);

  // Initial merge on sign-in
  React.useEffect(() => {
    if (!user || user.demo || !isFirebaseConfigured() || !pagesHydrated) return;

    let cancelled = false;

    (async () => {
      syncingRef.current = true;
      try {
        const local = usePagesStore.getState();
        const merged = await mergeAndSyncOnSignIn(user.uid, {
          pages: local.pages,
          projects: local.projects,
          activePageId: local.activePageId,
        });

        if (cancelled) return;

        usePagesStore.getState().applySnapshot(merged);
        pendingPages.current.clear();
        pendingProjects.current.clear();
        pendingDeletes.current.clear();
        pendingProjectDeletes.current.clear();
        uidRef.current = user.uid;
        toast("Your pages are saved to your account");
      } catch (err) {
        console.error("[sync] sign-in merge failed", err);
        toast("Could not sync your pages");
      } finally {
        syncingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.demo, pagesHydrated, toast]);

  // Remote listener
  React.useEffect(() => {
    if (!user || user.demo || !isFirebaseConfigured()) {
      uidRef.current = null;
      return;
    }

    uidRef.current = user.uid;

    const unsub = subscribeRemoteChanges(user.uid, (change) => {
      if (syncingRef.current) return;

      if (change.type === "page" && change.id) {
        if (change.removed) {
          const local = usePagesStore.getState().pages[change.id];
          if (!local) return;
          return;
        }
        if (!change.page) return;
        const local = usePagesStore.getState().pages[change.page.id];
        if (local && local.updatedAt >= change.page.updatedAt) return;
        usePagesStore.getState().applyRemotePage(change.page);
      }

      if (change.type === "project" && change.id) {
        if (change.removed) return;
        if (!change.project) return;
        usePagesStore.getState().applyRemoteProject(change.project);
      }

      if (change.type === "meta" && change.activePageId !== undefined) {
        const localActive = usePagesStore.getState().activePageId;
        if (localActive && usePagesStore.getState().pages[localActive]) return;
        usePagesStore.setState({ activePageId: change.activePageId });
      }
    });

    return unsub;
  }, [user?.uid, user?.demo]);

  // Local changes → cloud
  React.useEffect(() => {
    if (!user || user.demo || !isFirebaseConfigured()) return;

    const unsub = usePagesStore.subscribe((state, prev) => {
      if (syncingRef.current || !uidRef.current) return;

      for (const id of Object.keys(state.pages)) {
        const page = state.pages[id];
        const prevPage = prev.pages[id];
        if (!prevPage || page.updatedAt !== prevPage.updatedAt) {
          pendingPages.current.add(id);
        }
      }

      for (const id of Object.keys(prev.pages)) {
        if (!state.pages[id]) {
          pendingDeletes.current.add(id);
        }
      }

      for (const id of Object.keys(state.projects)) {
        const project = state.projects[id];
        const prevProject = prev.projects[id];
        if (!prevProject || project.name !== prevProject.name || project.order !== prevProject.order) {
          pendingProjects.current.add(id);
        }
      }

      for (const id of Object.keys(prev.projects)) {
        if (!state.projects[id]) {
          pendingProjectDeletes.current.add(id);
        }
      }

      if (state.activePageId !== prev.activePageId) {
        scheduleMetaPush(state.activePageId);
      }

      if (
        pendingPages.current.size ||
        pendingDeletes.current.size ||
        pendingProjects.current.size ||
        pendingProjectDeletes.current.size
      ) {
        scheduleFlush();
      }
    });

    return () => {
      unsub();
      if (flushTimer.current) clearTimeout(flushTimer.current);
      if (metaTimer.current) clearTimeout(metaTimer.current);
    };
  }, [user?.uid, user?.demo, scheduleFlush, scheduleMetaPush]);

  return null;
}
