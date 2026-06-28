"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EditPencilIcon } from "@/components/icons/EditPencilIcon";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { PANEL_FLOAT_RIGHT, PANEL_SHELL } from "@/lib/panel-layout";
import { LegalFooter } from "@/features/app/LegalFooter";
import { cn } from "@/lib/utils";

export function IntroPanel({
  open,
  onStart,
  onAbout,
  onTerms,
  onPrivacy,
}: {
  open: boolean;
  onStart: () => void;
  onAbout: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "mobile";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="intro-backdrop"
            className="fixed inset-0 z-[60] bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onStart}
          />
          <motion.aside
            key="intro-panel"
            className={cn(
              "fixed z-[61] flex flex-col overflow-hidden",
              isMobile
                ? "inset-0 bg-bg"
                : cn(PANEL_FLOAT_RIGHT, PANEL_SHELL, "w-full max-w-[400px]")
            )}
            initial={isMobile ? { opacity: 0 } : { x: "105%" }}
            animate={isMobile ? { opacity: 1 } : { x: 0 }}
            exit={isMobile ? { opacity: 0 } : { x: "105%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <IntroContent
              onStart={onStart}
              onAbout={onAbout}
              onTerms={onTerms}
              onPrivacy={onPrivacy}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function IntroContent({
  onStart,
  onAbout,
  onTerms,
  onPrivacy,
}: {
  onStart: () => void;
  onAbout: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] md:px-7 md:pt-7">
        <EditPencilIcon className="text-fg" />

        <h1 className="mt-8 text-[26px] font-semibold leading-[1.15] tracking-tight text-fg md:text-[28px]">
          Just Write
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-fg">
          Open a page, just writing. That&apos;s the whole setup.
        </p>

        <div className="mt-8 space-y-4 text-[15px] leading-[1.65] text-fg/90">
          <p>
            A distraction-free writing app that lives in your browser. Open a
            tab, start typing. Nothing to install first.
          </p>
          <p>
            The internet is loud. Ads, popups, toolbars everywhere. We wanted
            one calm page for the words that actually matter in your life.
          </p>
          <p>
            Draft a thought, homework, an email, a blog post, a to-do list, or
            anything in between. One editor, zero fuss.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-6 py-5 md:px-7 md:pb-7">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-fg py-3 text-[15px] font-medium text-bg transition-opacity hover:opacity-90"
        >
          Start writing
        </button>

        <LegalFooter
          className="mt-5"
          links={[
            { label: "About", onClick: onAbout },
            { label: "Terms", onClick: onTerms },
            { label: "Privacy", onClick: onPrivacy },
          ]}
        />
      </div>
    </div>
  );
}
