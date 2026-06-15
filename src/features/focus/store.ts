import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimeLimitMinutes = 1 | 3 | 5;

interface FocusSettingsState {
  disableBackspace: boolean;
  disablePaste: boolean;
  timeLimitMinutes: TimeLimitMinutes | null;
  nightModeEnabled: boolean;
  musicModeEnabled: boolean;
  typewriterSoundEnabled: boolean;
  wordTargetLimit: number | null;

  toggleDisableBackspace: () => void;
  toggleDisablePaste: () => void;
  setTimeLimitMinutes: (m: TimeLimitMinutes | null) => void;
  setNightModeEnabled: (v: boolean) => void;
  setMusicModeEnabled: (v: boolean) => void;
  setTypewriterSoundEnabled: (v: boolean) => void;
  toggleTypewriterSound: () => void;
  setWordTargetLimit: (n: number | null) => void;
}

export const useFocusSettingsStore = create<FocusSettingsState>()(
  persist(
    (set) => ({
      disableBackspace: false,
      disablePaste: false,
      timeLimitMinutes: null,
      nightModeEnabled: false,
      musicModeEnabled: false,
      typewriterSoundEnabled: false,
      wordTargetLimit: null,

      toggleDisableBackspace: () =>
        set((s) => ({ disableBackspace: !s.disableBackspace })),
      toggleDisablePaste: () => set((s) => ({ disablePaste: !s.disablePaste })),
      setTimeLimitMinutes: (timeLimitMinutes) => set({ timeLimitMinutes }),
      setNightModeEnabled: (nightModeEnabled) => set({ nightModeEnabled }),
      setMusicModeEnabled: (musicModeEnabled) =>
        set((s) => ({
          musicModeEnabled,
          ...(musicModeEnabled ? { typewriterSoundEnabled: false } : {}),
        })),
      setTypewriterSoundEnabled: (typewriterSoundEnabled) =>
        set((s) => {
          if (typewriterSoundEnabled && s.musicModeEnabled) return s;
          return { typewriterSoundEnabled };
        }),
      toggleTypewriterSound: () =>
        set((s) => {
          if (s.musicModeEnabled) return s;
          return { typewriterSoundEnabled: !s.typewriterSoundEnabled };
        }),
      setWordTargetLimit: (wordTargetLimit) => set({ wordTargetLimit }),
    }),
    {
      name: "blank.focus.v1",
      partialize: (s) => ({
        disableBackspace: s.disableBackspace,
        disablePaste: s.disablePaste,
        timeLimitMinutes: s.timeLimitMinutes,
        nightModeEnabled: s.nightModeEnabled,
        musicModeEnabled: s.musicModeEnabled,
        typewriterSoundEnabled: s.typewriterSoundEnabled,
        wordTargetLimit: s.wordTargetLimit,
      }),
    }
  )
);

/** Ephemeral session state for focus timers (not persisted). */
interface FocusSessionState {
  timePhase: "idle" | "waiting" | "running" | "ended";
  timeStartedAt: number | null;
  nightProgress: number;
  nightComplete: boolean;
  targetReachedNotified: boolean;
  resetTimeSession: () => void;
  startTimeSession: () => void;
  endTimeSession: () => void;
  setNightProgress: (n: number) => void;
  completeNight: () => void;
  resetNight: () => void;
  markTargetReached: () => void;
  resetTargetNotification: () => void;
}

export const useFocusSessionStore = create<FocusSessionState>((set) => ({
  timePhase: "idle",
  timeStartedAt: null,
  nightProgress: 0,
  nightComplete: false,
  targetReachedNotified: false,

  resetTimeSession: () => set({ timePhase: "idle", timeStartedAt: null }),
  startTimeSession: () =>
    set({ timePhase: "running", timeStartedAt: Date.now() }),
  endTimeSession: () => set({ timePhase: "ended", timeStartedAt: null }),
  setNightProgress: (nightProgress) => set({ nightProgress }),
  completeNight: () => set({ nightComplete: true, nightProgress: 100 }),
  resetNight: () => set({ nightProgress: 0, nightComplete: false }),
  markTargetReached: () => set({ targetReachedNotified: true }),
  resetTargetNotification: () => set({ targetReachedNotified: false }),
}));
