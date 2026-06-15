"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { usePagesStore } from "@/features/pages/store";
import { usePagesInProject } from "@/features/pages/selectors";
import type { Project } from "@/features/pages/types";
import { PageRow } from "./PageRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ProjectRow({
  project,
  activePageId,
  onShare,
  isOver,
}: {
  project: Project;
  activePageId: string | null;
  onShare: (id: string) => void;
  isOver: boolean;
}) {
  const pages = usePagesInProject(project.id);
  const [expanded, setExpanded] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [draft, setDraft] = React.useState(project.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id, data: { type: "project" } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const commitRename = () => {
    usePagesStore.getState().renameProject(project.id, draft.trim() || "Untitled");
    setRenaming(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group relative flex items-center rounded-md text-sm",
          isOver ? "bg-[var(--active)] ring-1 ring-[var(--ring)]" : "hover:bg-[var(--hover)]"
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
            onClick={() => setExpanded((e) => !e)}
            className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-faint-fg transition-transform",
                expanded && "rotate-90"
              )}
            />
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-fg" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-muted-fg" />
            )}
            <span className="truncate font-medium text-muted-fg group-hover:text-fg">
              {project.name}
            </span>
            <span className="ml-auto pr-6 text-xs text-faint-fg">{pages.length}</span>
          </button>
        )}

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Project options"
              className={cn(
                "absolute right-1.5 flex h-6 w-6 items-center justify-center rounded text-muted-fg transition-opacity hover:bg-[var(--active)] hover:text-fg",
                menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                usePagesStore.getState().createPage({ projectId: project.id });
                setExpanded(true);
              }}
            >
              <Plus className="h-4 w-4" /> New page
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setDraft(project.name);
                setRenaming(true);
              }}
            >
              <Pencil className="h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => usePagesStore.getState().deleteProject(project.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-1.5">
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {pages.length === 0 ? (
              <p className="px-2.5 py-1 text-xs text-faint-fg">Empty</p>
            ) : (
              pages.map((p) => (
                <PageRow
                  key={p.id}
                  page={p}
                  active={p.id === activePageId}
                  onShare={onShare}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
