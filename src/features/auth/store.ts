import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  uid: string;
  email: string | null;
  demo?: boolean;
};

type AuthModalStep = "email" | "otp" | null;

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  modalStep: AuthModalStep;
  pendingEmail: string;
  error: string | null;
  sending: boolean;
  verifying: boolean;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  openSignIn: () => void;
  closeModal: () => void;
  setPendingEmail: (email: string) => void;
  setModalStep: (step: AuthModalStep) => void;
  setError: (error: string | null) => void;
  setSending: (sending: boolean) => void;
  setVerifying: (verifying: boolean) => void;
  signOutLocal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      modalStep: null,
      pendingEmail: "",
      error: null,
      sending: false,
      verifying: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      openSignIn: () =>
        set({ modalStep: "email", error: null, pendingEmail: "" }),
      closeModal: () =>
        set({ modalStep: null, error: null, sending: false, verifying: false }),
      setPendingEmail: (pendingEmail) => set({ pendingEmail }),
      setModalStep: (modalStep) => set({ modalStep, error: null }),
      setError: (error) => set({ error }),
      setSending: (sending) => set({ sending }),
      setVerifying: (verifying) => set({ verifying }),
      signOutLocal: () => set({ user: null }),
    }),
    {
      name: "blank.auth.v1",
      partialize: (s) => ({
        user: s.user?.demo ? s.user : null,
      }),
    }
  )
);
