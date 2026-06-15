"use client";

import { use } from "react";
import { SharedView } from "@/features/share/SharedView";

export default function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = use(params);
  return <SharedView shareId={shareId} />;
}
