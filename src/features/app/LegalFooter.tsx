"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LegalFooterLink = {
  label: string;
  onClick: () => void;
};

export function LegalFooter({
  links,
  className,
}: {
  links: LegalFooterLink[];
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px] text-faint-fg",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {links.map((link, index) => (
          <React.Fragment key={link.label}>
            {index > 0 ? <span aria-hidden>·</span> : null}
            <button
              type="button"
              onClick={link.onClick}
              className="transition-colors hover:text-muted-fg"
            >
              {link.label}
            </button>
          </React.Fragment>
        ))}
      </div>
      <span>© 2026 Just Write</span>
    </footer>
  );
}
