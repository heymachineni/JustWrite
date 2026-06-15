"use client";

export function MusicModeBanner({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed left-1/2 top-5 z-40 -translate-x-1/2">
      <span className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-[13px] font-medium text-muted-fg shadow-[var(--shadow)]">
        Don&apos;t let the music stop
      </span>
    </div>
  );
}
