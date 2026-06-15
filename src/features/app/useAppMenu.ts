"use client";

import * as React from "react";
import { usePagesStore } from "@/features/pages/store";
import {
  useSettingsStore,
  type FontStyle,
  type EditorMode,
} from "@/features/settings/store";
import {
  useFocusSettingsStore,
  useFocusSessionStore,
  type TimeLimitMinutes,
} from "@/features/focus/store";
import {
  playTypewriterClickOnce,
  primeTypewriterAudio,
} from "@/features/focus/typewriterAudio";
import type { PanelView } from "./SidePanel";

export const fonts: {
  value: FontStyle;
  label: string;
  sampleClass: string;
}[] = [
  { value: "modern", label: "Modern", sampleClass: "font-sans" },
  { value: "classic", label: "Classic", sampleClass: "font-serif" },
  { value: "draft", label: "Mono", sampleClass: "font-mono" },
];

export const timeOptions: { label: string; value: TimeLimitMinutes | null }[] = [
  { label: "Off", value: null },
  { label: "1 minute", value: 1 },
  { label: "3 minutes", value: 3 },
  { label: "5 minutes", value: 5 },
];

export const wordTargetPresets: { label: string; value: number | null }[] = [
  { label: "Off", value: null },
  { label: "100 words", value: 100 },
  { label: "250 words", value: 250 },
  { label: "500 words", value: 500 },
  { label: "1,000 words", value: 1000 },
];

function useResolvedDark() {
  const theme = useSettingsStore((s) => s.theme);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const resolve = () =>
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(resolve());
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setIsDark(mq.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [theme]);

  return isDark;
}

export function useAppMenu(onOpenPanel: (view: PanelView) => void) {
  const font = useSettingsStore((s) => s.font);
  const editorMode = useSettingsStore((s) => s.editorMode);
  const showWordCount = useSettingsStore((s) => s.showWordCount);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFont = useSettingsStore((s) => s.setFont);
  const setEditorMode = useSettingsStore((s) => s.setEditorMode);
  const toggleWordCount = useSettingsStore((s) => s.toggleWordCount);
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);

  const disableBackspace = useFocusSettingsStore((s) => s.disableBackspace);
  const disablePaste = useFocusSettingsStore((s) => s.disablePaste);
  const timeLimitMinutes = useFocusSettingsStore((s) => s.timeLimitMinutes);
  const wordTargetLimit = useFocusSettingsStore((s) => s.wordTargetLimit);
  const nightModeEnabled = useFocusSettingsStore((s) => s.nightModeEnabled);
  const musicModeEnabled = useFocusSettingsStore((s) => s.musicModeEnabled);
  const typewriterSoundEnabled = useFocusSettingsStore(
    (s) => s.typewriterSoundEnabled
  );
  const toggleDisableBackspace = useFocusSettingsStore(
    (s) => s.toggleDisableBackspace
  );
  const toggleDisablePaste = useFocusSettingsStore((s) => s.toggleDisablePaste);
  const setTimeLimitMinutes = useFocusSettingsStore(
    (s) => s.setTimeLimitMinutes
  );
  const setWordTargetLimit = useFocusSettingsStore(
    (s) => s.setWordTargetLimit
  );
  const setNightModeEnabled = useFocusSettingsStore(
    (s) => s.setNightModeEnabled
  );
  const setMusicModeEnabled = useFocusSettingsStore(
    (s) => s.setMusicModeEnabled
  );
  const toggleTypewriterSound = useFocusSettingsStore(
    (s) => s.toggleTypewriterSound
  );
  const createPage = usePagesStore((s) => s.createPage);

  const typewriterBlocked = musicModeEnabled;
  const typewriterOn = typewriterSoundEnabled && !typewriterBlocked;
  const isDark = useResolvedDark();

  const enterFocusMode = () => {
    setSidebarOpen(false);
    useSettingsStore.getState().setFocusMode(true);
  };

  const toggleNightMode = () => {
    const next = !nightModeEnabled;
    if (next) {
      setMusicModeEnabled(false);
      createPage();
      useFocusSessionStore.getState().resetNight();
    }
    setNightModeEnabled(next);
  };

  const toggleMusicMode = () => {
    const next = !musicModeEnabled;
    if (next) {
      setNightModeEnabled(false);
      useFocusSessionStore.getState().resetNight();
      setMusicModeEnabled(true);
    } else {
      setMusicModeEnabled(false);
    }
  };

  const setMode = (mode: EditorMode) => {
    setEditorMode(mode);
    useFocusSessionStore.getState().resetTargetNotification();
  };

  const handleWordTarget = (value: number | null) => {
    setWordTargetLimit(value);
    useFocusSessionStore.getState().resetTargetNotification();
  };

  const openPanel = (view: PanelView) => {
    onOpenPanel(view);
  };

  return {
    font,
    editorMode,
    showWordCount,
    isDark,
    disableBackspace,
    disablePaste,
    timeLimitMinutes,
    wordTargetLimit,
    nightModeEnabled,
    musicModeEnabled,
    typewriterOn,
    typewriterBlocked,
    setTheme,
    setFont,
    toggleWordCount,
    setMode,
    handleWordTarget,
    setTimeLimitMinutes,
    toggleNightMode,
    toggleMusicMode,
    toggleDisableBackspace,
    toggleDisablePaste,
    enterFocusMode,
    openPanel,
    toggleTypewriterSound: () => {
      if (typewriterBlocked) return;
      const next = !typewriterSoundEnabled;
      toggleTypewriterSound();
      if (next) {
        primeTypewriterAudio().then(() => playTypewriterClickOnce());
      }
    },
  };
}
