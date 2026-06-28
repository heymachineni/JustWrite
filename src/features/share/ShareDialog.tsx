"use client";

import * as React from "react";
import { Link2, Copy, Check, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { usePagesStore } from "@/features/pages/store";
import { publishSharedPage, unpublishSharedPage } from "./publish";

export function ShareDialog({
  pageId,
  onOpenChange,
}: {
  pageId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const page = usePagesStore((s) => (pageId ? s.pages[pageId] : null));
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const { show: toast } = useToast();

  React.useEffect(() => {
    if (!pageId) setCopied(false);
  }, [pageId]);

  if (!page) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = page.shareId ? `${origin}/share/${page.shareId}` : "";

  const enableShare = async () => {
    setBusy(true);
    try {
      const shareId = usePagesStore.getState().sharePage(page.id);
      const updated = usePagesStore.getState().pages[page.id];
      if (!updated) return;
      await publishSharedPage(updated, shareId);
      toast("Link published");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not publish link."
      );
    } finally {
      setBusy(false);
    }
  };

  const disableShare = async () => {
    const shareId = page.shareId;
    setBusy(true);
    try {
      usePagesStore.getState().unsharePage(page.id);
      if (shareId) await unpublishSharedPage(shareId);
      toast("Sharing stopped");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not stop sharing."
      );
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Could not copy link");
    }
  };

  return (
    <Dialog open={!!pageId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Share this page</DialogTitle>
        <DialogDescription>
          Publish a read-only link anyone can open in their browser.
        </DialogDescription>

        <div className="mt-5 space-y-3">
          {!page.shared ? (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => void enableShare()}
            >
              <Globe className="h-4 w-4" />
              {busy ? "Publishing…" : "Publish link"}
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-[var(--muted)] px-3 py-2.5">
                <Link2 className="h-4 w-4 shrink-0 text-muted-fg" />
                <span className="min-w-0 truncate text-sm text-muted-fg">{link}</span>
                <Button
                  variant="subtle"
                  size="sm"
                  className="ml-auto shrink-0"
                  onClick={() => void copy()}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void disableShare()}
                className="text-sm text-muted-fg transition-colors hover:text-fg disabled:opacity-50"
              >
                {busy ? "Stopping…" : "Stop sharing"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
