"use client";

export const BACKSPACE_LIMIT_MESSAGE =
  "You can only delete the current word you're writing";

export function BackspaceLimitBanner({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      className={`fixed left-1/2 top-5 z-40 -translate-x-1/2 ${className ?? ""}`}
    >
      <span className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-[13px] font-medium text-muted-fg shadow-[var(--shadow)]">
        {BACKSPACE_LIMIT_MESSAGE}
      </span>
    </div>
  );
}
