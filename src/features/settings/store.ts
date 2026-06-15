import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type FontStyle = "modern" | "draft" | "classic";
export type EditorMode = "markdown" | "richtext";

interface SettingsState {
  theme: Theme;
  font: FontStyle;
  editorMode: EditorMode;
  showToolbar: boolean;
  focusMode: boolean;
  sidebarOpen: boolean;
  showWordCount: boolean;
  _hydrated: boolean;

  setTheme: (t: Theme) => void;
  setFont: (f: FontStyle) => void;
  setEditorMode: (m: EditorMode) => void;
  toggleToolbar: () => void;
  setShowToolbar: (v: boolean) => void;
  toggleFocusMode: () => void;
  setFocusMode: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setShowWordCount: (v: boolean) => void;
  toggleWordCount: () => void;
  setHydrated: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      font: "modern",
      editorMode: "richtext",
      showToolbar: true,
      focusMode: false,
      sidebarOpen: true,
      showWordCount: false,
      _hydrated: false,

      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setEditorMode: (editorMode) => set({ editorMode }),
      toggleToolbar: () => set((s) => ({ showToolbar: !s.showToolbar })),
      setShowToolbar: (showToolbar) => set({ showToolbar }),
      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
      setFocusMode: (focusMode) => set({ focusMode }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setShowWordCount: (showWordCount) => set({ showWordCount }),
      toggleWordCount: () => set((s) => ({ showWordCount: !s.showWordCount })),
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "blank.settings.v1",
      partialize: (s) => ({
        theme: s.theme,
        font: s.font,
        editorMode: s.editorMode,
        showToolbar: s.showToolbar,
        sidebarOpen: s.sidebarOpen,
        showWordCount: s.showWordCount,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
