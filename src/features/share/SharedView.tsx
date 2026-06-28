"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { FileText } from "lucide-react";
import { buildExtensions } from "@/features/editor/extensions";
import { formatRelativeTime } from "@/lib/utils";

interface SharedPage {
  title: string;
  content: JSONContent | null;
  updatedAt: number;
  createdAt: number;
}

export function SharedView({ shareId }: { shareId: string }) {
  const [page, setPage] = React.useState<SharedPage | null | undefined>(
    undefined
  );

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/share/${encodeURIComponent(shareId)}`);
        if (cancelled) return;
        if (!res.ok) {
          setPage(null);
          return;
        }
        const data = (await res.json()) as SharedPage;
        setPage(data);
      } catch {
        if (!cancelled) setPage(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  const editor = useEditor(
    {
      extensions: buildExtensions(),
      content: page?.content ?? "",
      editable: false,
      immediatelyRender: false,
    },
    [page?.content]
  );

  if (page === undefined) {
    return <div className="h-full w-full bg-bg" />;
  }

  if (page === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <FileText className="h-8 w-8 text-faint-fg" strokeWidth={1.5} />
        <h1 className="text-lg font-semibold text-fg">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-fg">
          This link may have been unshared, or the page is no longer available.
        </p>
      </div>
    );
  }

  const date = new Date(page.createdAt);
  const dateLabel = date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-full w-full overflow-y-auto bg-bg">
      <div className="mx-auto w-full max-w-[640px] px-6 py-16 md:px-8">
        <p className="mb-6 text-[13px] font-medium text-faint-fg">{dateLabel}</p>
        <p className="mb-8 text-[12px] text-faint-fg">
          Shared · updated {formatRelativeTime(page.updatedAt)}
        </p>
        <div className="editor-root" data-font="modern">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
