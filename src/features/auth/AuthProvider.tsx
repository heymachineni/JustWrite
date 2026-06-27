"use client";

import * as React from "react";
import {
  isFirebaseConfigured,
  signOutUser,
  subscribeAuth,
} from "@/lib/firebase/client";
import { useAuthStore } from "./store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  React.useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeAuth((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } else {
        const demo = useAuthStore.getState().user?.demo;
        if (!demo) setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const signOutLocal = useAuthStore((s) => s.signOutLocal);

  const signOut = async () => {
    if (user?.demo) {
      signOutLocal();
      return;
    }
    try {
      await signOutUser();
    } finally {
      signOutLocal();
    }
  };

  return {
    user,
    loading,
    isSignedIn: Boolean(user),
    openSignIn,
    signOut,
  };
}
