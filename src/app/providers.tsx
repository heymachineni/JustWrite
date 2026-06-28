"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AuthModals } from "@/features/auth/AuthModals";
import { FirestoreSync } from "@/features/sync/FirestoreSync";
import { ShareSync } from "@/features/share/ShareSync";
import { useSettingsStore } from "@/features/settings/store";

function ThemeController() {
  const theme = useSettingsStore((s) => s.theme);

  React.useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.add("theme-transition");
      root.classList.toggle("dark", dark);
      // Drop the transition-suppression on the next frame.
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() =>
          root.classList.remove("theme-transition")
        )
      );
    };

    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeController />
        <ToastProvider>
          <TooltipProvider delayDuration={400} skipDelayDuration={200}>
            {children}
            <AuthModals />
            <FirestoreSync />
            <ShareSync />
          </TooltipProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
