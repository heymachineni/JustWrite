"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Copy,
  Share2,
  Pencil,
  Trash2,
  FolderInput,
  FileText,
} from "lucide-react";
import { usePagesStore } from "@/features/pages/store";
import { useProjectsList } from "@/features/pages/selectors";
import type { Page } from "@/features/pages/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTriggerStyled,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function PageRow({
  page,
  active,
  onShare,
}: {
  page: Page;
  active: boolean;
  onShare: (id: string) => void;
}) {
  const store = usePagesStore;
  const projects = useProjectsList();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [draft, setDraft] = React.useState(page.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id, data: { type: "page", projectId: page.projectId } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const title = page.title.trim() || "Untitled";

  const startRename = () => {
    setDraft(page.title);
    setRenaming(true);
  };
  const commitRename = () => {
    store.getState().renamePage(page.id, draft.trim());
    setRenaming(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center rounded-md text-sm",
        active ? "bg-[var(--active)]" : "hover:bg-[var(--hover)]"
      )}
    >
      {renaming ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="w-full rounded-md bg-transparent px-2.5 py-1.5 text-sm outline-none ring-1 ring-[var(--ring)]"
        />
      ) : (
        <button
          {...attributes}
          {...listeners}
          onClick={() => store.getState().setActivePage(page.id)}
          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-left"
        >
          {page.pinned ? (
            <Pin className="h-3.5 w-3.5 shrink-0 text-muted-fg group-hover:opacity-0" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-faint-fg" />
          )}
          <span
            className={cn(
              "truncate",
              active ? "text-fg" : "text-muted-fg group-hover:text-fg",
              !page.title.trim() && "italic text-faint-fg"
            )}
          >
            {title}
          </span>
        </button>
      )}

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Page options"
            className={cn(
              "absolute right-1.5 flex h-6 w-6 items-center justify-center rounded text-muted-fg transition-opacity hover:bg-[var(--active)] hover:text-fg",
              menuOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => store.getState().setPinned(page.id, !page.pinned)}
          >
            {page.pinned ? (
              <>
                <PinOff className="h-4 w-4" /> Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4" /> Pin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={startRename}>
            <Pencil className="h-4 w-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => store.getState().duplicatePage(page.id)}>
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onShare(page.id)}>
            <Share2 className="h-4 w-4" /> Share
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTriggerStyled>
              <FolderInput className="h-4 w-4" /> Move to
            </DropdownMenuSubTriggerStyled>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                disabled={page.projectId === null}
                onSelect={() => store.getState().movePageToProject(page.id, null)}
              >
                Top level
              </DropdownMenuItem>
              {projects.length > 0 && <DropdownMenuSeparator />}
              {projects.map((pr) => (
                <DropdownMenuItem
                  key={pr.id}
                  disabled={page.projectId === pr.id}
                  onSelect={() => store.getState().movePageToProject(page.id, pr.id)}
                >
                  {pr.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={() => store.getState().deletePage(page.id)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
