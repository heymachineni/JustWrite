"use client";

import { useActivePage } from "@/features/pages/selectors";

export function PageDate() {
  const page = useActivePage();
  if (!page) return null;

  const date = new Date(page.createdAt);
  const label = date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  return (
    <time
      dateTime={date.toISOString()}
      className="mb-6 block text-[13px] font-medium tracking-wide text-faint-fg"
    >
      {label}
    </time>
  );
}
