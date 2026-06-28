"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { usePagesStore } from "@/features/pages/store";
import { useSettingsStore } from "@/features/settings/store";
import {
  useFocusSettingsStore,
  useFocusSessionStore,
} from "@/features/focus/store";
import { useGlobalShortcuts } from "@/features/shortcuts/useGlobalShortcuts";
import { useOverlayLayout } from "@/lib/useBreakpoint";
import { WordCount } from "@/features/editor/WordCount";
import { PageDate } from "@/features/editor/PageDate";
import { Sidebar } from "@/features/sidebar/Sidebar";
import { TopBar } from "@/features/app/TopBar";
import { SidePanel, type PanelView } from "@/features/app/SidePanel";
import { IntroPanel } from "@/features/app/IntroPanel";
import { PANEL_FLOAT_LEFT, PANEL_SHELL } from "@/lib/panel-layout";
import { cn } from "@/lib/utils";
import { FocusTimeLimitBar } from "@/features/focus/FocusTimeLimitBar";
import { NightModeFeature } from "@/features/focus/NightModeFeature";
import { useTypingMusic } from "@/features/focus/useTypingMusic";
import { useTypewriterSound } from "@/features/focus/useTypewriterSound";
import { MusicModeBanner } from "@/features/focus/MusicModeBanner";
import { BackspaceLimitBanner } from "@/features/focus/BackspaceLimitBanner";
import { Editor } from "@/features/editor/Editor";

const SIDEBAR_WIDTH = 248;

export function AppShell() {
  const hydrated = usePagesStore((s) => s._hydrated);
  const settingsHydrated = useSettingsStore((s) => s._hydrated);
  const activePageId = usePagesStore((s) => s.activePageId);

  const sidebarOpen = useSettingsStore((s) => s.sidebarOpen);
  const focusMode = useSettingsStore((s) => s.focusMode);
  const hasSeenIntro = useSettingsStore((s) => s.hasSeenIntro);
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);
  const setFocusMode = useSettingsStore((s) => s.setFocusMode);
  const setHasSeenIntro = useSettingsStore((s) => s.setHasSeenIntro);

  const nightModeEnabled = useFocusSettingsStore((s) => s.nightModeEnabled);
  const musicModeEnabled = useFocusSettingsStore((s) => s.musicModeEnabled);
  const disableBackspace = useFocusSettingsStore((s) => s.disableBackspace);
  const typewriterSoundEnabled = useFocusSettingsStore(
    (s) => s.typewriterSoundEnabled
  );
  const nightComplete = useFocusSessionStore((s) => s.nightComplete);

  const overlayLayout = useOverlayLayout();

  const [editor, setEditor] = React.useState<TiptapEditor | null>(null);
  const [panelView, setPanelView] = React.useState<PanelView>(null);
  const [introOpen, setIntroOpen] = React.useState(false);

  const dismissIntro = React.useCallback(() => {
    setHasSeenIntro(true);
    setIntroOpen(false);
  }, [setHasSeenIntro]);

  const openAboutFromIntro = React.useCallback(() => {
    dismissIntro();
    setPanelView("about");
  }, [dismissIntro]);

  const openTermsFromIntro = React.useCallback(() => {
    dismissIntro();
    setPanelView("terms");
  }, [dismissIntro]);

  const openPrivacyFromIntro = React.useCallback(() => {
    dismissIntro();
    setPanelView("privacy");
  }, [dismissIntro]);

  const handleEditorReady = React.useCallback((ed: TiptapEditor | null) => {
    setEditor((prev) => (prev === ed ? prev : ed));
  }, []);

  const typewriterActive = typewriterSoundEnabled && !musicModeEnabled;

  useTypingMusic(
    musicModeEnabled && !nightModeEnabled && !focusMode,
    editor
  );
  useTypewriterSound(typewriterActive, editor);

  // Resolve persisted conflict: music and typewriter cannot both be on
  React.useEffect(() => {
    const s = useFocusSettingsStore.getState();
    if (s.musicModeEnabled && s.typewriterSoundEnabled) {
      useFocusSettingsStore.setState({ typewriterSoundEnabled: false });
    }
  }, []);

  React.useEffect(() => {
    if (hydrated) usePagesStore.getState().ensureInitialPage();
  }, [hydrated]);

  React.useEffect(() => {
    if (focusMode) {
      useFocusSessionStore.getState().resetTimeSession();
    }
  }, [focusMode]);

  const mobileSidebarInit = React.useRef(false);
  React.useEffect(() => {
    if (!settingsHydrated || mobileSidebarInit.current) return;
    mobileSidebarInit.current = true;
    if (window.innerWidth <= 767 && useSettingsStore.getState().sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [settingsHydrated, setSidebarOpen]);

  React.useEffect(() => {
    if (!settingsHydrated || hasSeenIntro) return;
    setIntroOpen(true);
    setSidebarOpen(false);
  }, [settingsHydrated, hasSeenIntro, setSidebarOpen]);

  const openLink = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent("blank:link"));
  }, []);

  useGlobalShortcuts({ openLink });

  const exitFocus = () => {
    if (editor && activePageId) {
      usePagesStore.getState().updatePage(activePageId, {
        content: editor.getJSON(),
        text: editor.getText(),
      });
    }
    setFocusMode(false);
    useFocusSessionStore.getState().resetTimeSession();
    editor?.setEditable(true);
  };

  if (!hydrated || !settingsHydrated || !activePageId) {
    return <div className="h-full w-full bg-bg" />;
  }

  const sidebarVisible = sidebarOpen && !focusMode;
  const nightWriting = nightModeEnabled && !nightComplete;

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      {!overlayLayout && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarVisible ? SIDEBAR_WIDTH : 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="relative h-full shrink-0 overflow-hidden border-r border-border"
        >
          <div style={{ width: SIDEBAR_WIDTH }} className="h-full">
            <Sidebar />
          </div>
        </motion.aside>
      )}

      {overlayLayout && (
        <AnimatePresence>
          {sidebarVisible && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                className={cn(
                  "fixed z-50 overflow-hidden",
                  PANEL_FLOAT_LEFT,
                  PANEL_SHELL
                )}
                style={{ width: SIDEBAR_WIDTH }}
                initial={{ x: -(SIDEBAR_WIDTH + 24) }}
                animate={{ x: 0 }}
                exit={{ x: -(SIDEBAR_WIDTH + 24) }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                <Sidebar />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {focusMode ? (
          <button
            onClick={exitFocus}
            className="fixed right-4 top-4 z-50 min-h-10 rounded-full border border-border bg-bg-elevated px-4 py-2.5 text-[14px] font-medium text-fg shadow-[var(--shadow)] transition-colors hover:bg-[var(--hover)] max-md:top-[max(1rem,env(safe-area-inset-top))] max-md:right-[max(1rem,env(safe-area-inset-right))]"
          >
            Exit focus
          </button>
        ) : (
          <TopBar
            sidebarOpen={sidebarOpen}
            activePageId={activePageId}
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenPanel={setPanelView}
          />
        )}

        <MusicModeBanner active={musicModeEnabled && !focusMode && !nightModeEnabled} />
        <BackspaceLimitBanner
          active={disableBackspace && !focusMode}
          className={
            musicModeEnabled && !focusMode && !nightModeEnabled
              ? "!top-14"
              : undefined
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[640px] px-6 pb-[45vh] pt-16 md:px-8">
            {!focusMode && !nightModeEnabled && <PageDate />}
            <Editor
              pageId={activePageId}
              onEditorReady={handleEditorReady}
              focusMode={focusMode}
              nightWriting={nightWriting}
            />
          </div>
        </div>

        {!focusMode && <WordCount editor={editor} />}
        <FocusTimeLimitBar editor={editor} enabled={!focusMode} />
        <NightModeFeature
          editor={editor}
          active={nightModeEnabled && !focusMode}
          pageId={activePageId}
        />
      </main>

      <SidePanel
        view={panelView}
        onClose={() => setPanelView(null)}
        onNavigate={setPanelView}
      />
      <IntroPanel
        open={introOpen}
        onStart={dismissIntro}
        onAbout={openAboutFromIntro}
        onTerms={openTermsFromIntro}
        onPrivacy={openPrivacyFromIntro}
      />
    </div>
  );
}
