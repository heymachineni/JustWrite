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
  PanelRow,
  PanelSection,
} from "@/components/ui/panel-shell";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { cn } from "@/lib/utils";

export type PanelView = "shortcuts" | "about" | null;

const PANEL_TITLES: Record<Exclude<PanelView, null>, string> = {
  shortcuts: "Shortcuts",
  about: "About",
};

export function SidePanel({
  view,
  onClose,
}: {
  view: PanelView;
  onClose: () => void;
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
    <>
      <PanelHeader
        title={PANEL_TITLES[view]}
        onClose={onClose}
      />
      <PanelBody>
        {view === "shortcuts" ? <ShortcutsContent /> : <AboutContent />}
      </PanelBody>
    </>
  ) : null;

  if (useBottomSheet) {
    return (
      <Sheet open={view != null} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[min(92vh,720px)]"
        >
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-border bg-bg shadow-[var(--shadow-lg)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
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

      <PanelSection
        title="Markdown"
      >
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
      <code
        className="rounded-md border border-border bg-[var(--muted)] px-2 py-0.5 font-mono text-[12px] text-fg"
      >
        {item.syntax}
      </code>
    </PanelRow>
  );
}

function AboutContent() {
  return (
    <div className="space-y-4 text-[15px] leading-[1.65] text-muted-fg">
      <p>
        I made Just Write because I love writing — putting my thoughts, rough
        ideas, and random notes in one place — and couldn&apos;t find a genuinely
        simple tool that lets us focus and write without distractions.
      </p>
      <p>
        It&apos;s the app I want to use for myself, and nothing makes me happier
        than seeing others enjoy it too.
      </p>
    </div>
  );
}
