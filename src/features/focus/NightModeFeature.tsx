"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { useFocusSessionStore } from "./store";
import { NightModeBanner } from "./NightModeBanner";
import { useToast } from "@/components/ui/toast";

const NIGHT_GOAL = 100;

export function NightModeFeature({
  editor,
  active,
  pageId,
}: {
  editor: Editor | null;
  active: boolean;
  pageId: string;
}) {
  const nightProgress = useFocusSessionStore((s) => s.nightProgress);
  const nightComplete = useFocusSessionStore((s) => s.nightComplete);
  const setNightProgress = useFocusSessionStore((s) => s.setNightProgress);
  const completeNight = useFocusSessionStore((s) => s.completeNight);
  const resetNight = useFocusSessionStore((s) => s.resetNight);

  const [showBanner, setShowBanner] = React.useState(false);
  const prevLen = React.useRef(0);
  const { show } = useToast();

  React.useEffect(() => {
    if (!active) {
      resetNight();
      setShowBanner(false);
      prevLen.current = editor?.getText().length ?? 0;
      return;
    }

    resetNight();
    setShowBanner(true);
    prevLen.current = 0;
  }, [active, pageId, resetNight, editor]);

  React.useEffect(() => {
    if (!active || !editor) return;

    const onUpdate = () => {
      const state = useFocusSessionStore.getState();
      if (state.nightComplete) return;

      if (showBanner) setShowBanner(false);

      const len = editor.getText().length;
      const delta = Math.max(0, len - prevLen.current);
      prevLen.current = len;
      if (delta === 0) return;

      const next = Math.min(NIGHT_GOAL, state.nightProgress + delta * 3.2);
      setNightProgress(next);

      if (next >= NIGHT_GOAL) {
        completeNight();
        show("See what you wrote.");
      }
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [active, editor, showBanner, setNightProgress, completeNight, show]);

  if (!active) return null;

  return (
    <>
      <NightModeBanner
        visible={showBanner}
        message="Write in the Dark. Don't be afraid of what will come out."
      />
      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="h-1 w-full bg-[var(--muted)]">
          <div
            className="h-full bg-fg transition-[width] duration-150"
            style={{ width: `${nightProgress}%` }}
          />
        </div>
      </div>
    </>
  );
}
