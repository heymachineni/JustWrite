"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function SidebarAuthCard() {
  const { user, isSignedIn, openSignIn, signOut } = useAuth();

  if (isSignedIn && user) {
    return (
      <div className="shrink-0 border-t border-border p-3">
        <div className="rounded-xl border border-border bg-bg-elevated p-3.5">
          <p className="truncate text-[12px] text-muted-fg">
            {user.email}
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-2.5 w-full rounded-lg border border-border py-2 text-[13px] font-medium text-fg transition-colors hover:bg-[var(--hover)]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border p-3">
      <div className="rounded-xl border border-border bg-bg-elevated p-3.5">
        <p className="text-[13px] font-medium text-fg">
          Get the full experience
        </p>
        <p className="mt-1 text-[12px] text-muted-fg">
          Sign in to save your pages.
        </p>
        <button
          type="button"
          onClick={openSignIn}
          className={cn(
            "mt-3 w-full rounded-lg bg-fg py-2 text-[13px] font-medium text-bg transition-opacity hover:opacity-90"
          )}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
