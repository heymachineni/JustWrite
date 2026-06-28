"use client";

import * as React from "react";
import { usePagesStore } from "@/features/pages/store";
import { scheduleSharedPagePublish } from "./publish";

export function ShareSync() {
  React.useEffect(() => {
    const unsub = usePagesStore.subscribe((state, prev) => {
      for (const id of Object.keys(state.pages)) {
        const page = state.pages[id];
        const prevPage = prev.pages[id];

        if (!page.shared || !page.shareId) continue;
        if (!prevPage?.shared && page.shared) {
          scheduleSharedPagePublish(page, page.shareId);
          continue;
        }
        if (prevPage && page.updatedAt !== prevPage.updatedAt) {
          scheduleSharedPagePublish(page, page.shareId);
        }
      }
    });

    return unsub;
  }, []);

  return null;
}
