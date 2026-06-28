"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  shortcutGroups,
  markdownItems,
  type ShortcutItem,
  type MarkdownItem,
} from "@/lib/shortcuts-data";
import { KeyCombo } from "@/components/ui/kbd";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  PanelBody,
  PanelHeader,
  PanelSection,
  PanelRow,
} from "@/components/ui/panel-shell";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { PANEL_FLOAT_RIGHT, PANEL_SHELL } from "@/lib/panel-layout";
import { TermsContent, PrivacyContent } from "@/features/app/legal-content";
import { LegalFooter } from "@/features/app/LegalFooter";
import { cn } from "@/lib/utils";

export type PanelView = "shortcuts" | "about" | "terms" | "privacy" | null;

const PANEL_TITLES: Record<Exclude<PanelView, null>, string> = {
  shortcuts: "Shortcuts",
  about: "About",
  terms: "Terms",
  privacy: "Privacy",
};

export function SidePanel({
  view,
  onClose,
  onNavigate,
}: {
  view: PanelView;
  onClose: () => void;
  onNavigate?: (view: Exclude<PanelView, null>) => void;
}) {
  const breakpoint = useBreakpoint();
  const useBottomSheet = breakpoint === "mobile";

  React.useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onClose]);

  const panelContent = view ? (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title={PANEL_TITLES[view]} onClose={onClose} />
      <PanelBody className={view === "about" ? "pb-4" : undefined}>
        {view === "shortcuts" && <ShortcutsContent />}
        {view === "about" && <AboutContent />}
        {view === "terms" && <TermsContent />}
        {view === "privacy" && <PrivacyContent />}
      </PanelBody>
      {view === "about" && onNavigate ? (
        <div className="shrink-0 border-t border-border px-5 py-4 md:px-6">
          <LegalFooter
            links={[
              { label: "Terms", onClick: () => onNavigate("terms") },
              { label: "Privacy", onClick: () => onNavigate("privacy") },
            ]}
          />
        </div>
      ) : null}
    </div>
  ) : null;

  if (useBottomSheet) {
    return (
      <Sheet open={view != null} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="max-h-[min(92vh,720px)]">
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AnimatePresence>
      {view && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            className={cn(
              "fixed z-50 flex w-full max-w-[360px] flex-col overflow-hidden",
              PANEL_FLOAT_RIGHT,
              PANEL_SHELL
            )}
            initial={{ x: "calc(100% + 12px)" }}
            animate={{ x: 0 }}
            exit={{ x: "calc(100% + 12px)" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            {panelContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ShortcutsContent() {
  return (
    <div className="space-y-7">
      {shortcutGroups.map((group) => (
        <PanelSection key={group.title} title={group.title}>
          {group.items.map((item) => (
            <KeyboardShortcutRow key={item.label} item={item} />
          ))}
        </PanelSection>
      ))}

      <PanelSection title="Markdown">
        {markdownItems.map((item) => (
          <MarkdownShortcutRow key={item.label} item={item} />
        ))}
      </PanelSection>
    </div>
  );
}

function KeyboardShortcutRow({ item }: { item: ShortcutItem }) {
  return (
    <PanelRow>
      <span className="text-[14px] text-muted-fg">{item.label}</span>
      <KeyCombo keys={item.keys} />
    </PanelRow>
  );
}

function MarkdownShortcutRow({ item }: { item: MarkdownItem }) {
  return (
    <PanelRow>
      <span className="text-[14px] text-muted-fg">{item.label}</span>
      <code className="rounded-md border border-border bg-[var(--muted)] px-2 py-0.5 font-mono text-[12px] text-fg">
        {item.syntax}
      </code>
    </PanelRow>
  );
}

function AboutContent() {
  return (
    <div className="space-y-4 text-[15px] leading-[1.65] text-muted-fg">
      <p>
        I made Just Write because I love writing. Thoughts, rough ideas, random
        notes, all in one place. I could not find a tool that felt simple enough
        to open every day without fighting the interface.
      </p>
      <p>
        This is the app I want to use myself. If it helps you get words on the
        page, that makes me happy.
      </p>
    </div>
  );
}
