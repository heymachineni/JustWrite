"use client";

import * as React from "react";
import { usePagesStore } from "@/features/pages/store";
import { useSettingsStore } from "@/features/settings/store";

export function useGlobalShortcuts(handlers: { openLink: () => void }) {
  const ref = React.useRef(handlers);
  ref.current = handlers;

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "o") {
        e.preventDefault();
        usePagesStore.getState().createPage();
        return;
      }
      if (mod && key === "\\") {
        if (useSettingsStore.getState().focusMode) return;
        e.preventDefault();
        useSettingsStore.getState().toggleSidebar();
        return;
      }
      if (mod && e.shiftKey && key === "u") {
        e.preventDefault();
        ref.current.openLink();
        return;
      }
      if (key === "Escape" && useSettingsStore.getState().focusMode) {
        e.preventDefault();
        useSettingsStore.getState().setFocusMode(false);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
