"use client";

import * as React from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { EditFilledIcon } from "@/components/icons/EditFilledIcon";
import { SidebarAltSolidIcon } from "@/components/icons/SidebarAltSolidIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { clonePage, usePagesStore } from "@/features/pages/store";
import { useAllPages } from "@/features/pages/selectors";
import { groupPagesByDay } from "@/features/pages/pageGroups";
import type { Page } from "@/features/pages/types";
import { useSettingsStore } from "@/features/settings/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  PanelBody,
  PanelHeader,
  PanelActionRow,
  PanelSection,
} from "@/components/ui/panel-shell";
import { useToast } from "@/components/ui/toast";
import { useOverlayLayout } from "@/lib/useBreakpoint";
import { cn } from "@/lib/utils";
import { SidebarAuthCard } from "./SidebarAuthCard";

export function Sidebar() {
  const pages = useAllPages();
  const activePageId = usePagesStore((s) => s.activePageId);
  const groups = groupPagesByDay(pages, activePageId);
  const setSidebarOpen = useSettingsStore((s) => s.setSidebarOpen);
  const overlayLayout = useOverlayLayout();

  return (
    <div className="flex h-full w-full flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          Just Write
        </span>
        <div className="flex items-center gap-0.5">
          <button
            aria-label="New page"
            onClick={() => usePagesStore.getState().createPage()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
          >
            <EditFilledIcon className="h-5 w-5" />
          </button>
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
          >
            <SidebarAltSolidIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {groups.length === 0 ? (
          <button
            onClick={() => usePagesStore.getState().createPage()}
            className="mt-1 w-full rounded-xl px-3 py-8 text-sm text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
          >
            Write your first page
          </button>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <section key={group.dayKey}>
                <h2 className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-faint-fg">
                  {group.label}
                </h2>
                <ul className="space-y-0.5">
                  {group.pages.map((page) => (
                    <SidebarPageItem
                      key={page.id}
                      page={page}
                      active={page.id === activePageId}
                      overlayLayout={overlayLayout}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </nav>

      <SidebarAuthCard />
    </div>
  );
}

function SidebarPageItem({
  page,
  active,
  overlayLayout,
}: {
  page: Page;
  active: boolean;
  overlayLayout: boolean;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [draft, setDraft] = React.useState(page.title);
  const { show: toast, showUndo } = useToast();

  const title = page.title.trim() || "Untitled";

  const selectPage = () => {
    usePagesStore.getState().setActivePage(page.id);
    if (overlayLayout) {
      useSettingsStore.getState().setSidebarOpen(false);
    }
  };

  const startRename = () => {
    setDraft(page.title);
    setRenaming(true);
    setMenuOpen(false);
  };

  const commitRename = () => {
    usePagesStore.getState().renamePage(page.id, draft.trim());
    setRenaming(false);
  };

  const handleShare = async () => {
    setMenuOpen(false);
    const shareId = usePagesStore.getState().sharePage(page.id);
    const link = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copied");
    } catch {
      toast("Could not copy link");
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    const wasActive = page.id === usePagesStore.getState().activePageId;
    const snapshot = clonePage(page);

    usePagesStore.getState().deletePage(page.id);

    const placeholder = Object.values(usePagesStore.getState().pages).find(
      (p) => p.id !== snapshot.id && p.text.trim() === ""
    );

    showUndo("Page deleted", () => {
      const store = usePagesStore.getState();
      store.restorePage(snapshot, { activate: wasActive });
      if (placeholder && store.pages[placeholder.id]?.text.trim() === "") {
        store.deletePage(placeholder.id);
      }
    });
  };

  return (
    <li
      className={cn(
        "group relative flex items-center rounded-lg transition-colors",
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
          className="w-full rounded-lg bg-transparent px-3 py-2 text-[14px] text-fg outline-none ring-1 ring-[var(--ring)]"
        />
      ) : (
        <button
          onClick={selectPage}
          className="min-w-0 flex-1 truncate px-3 py-2 text-left text-[14px] pr-9"
        >
          <span
            className={cn(
              "truncate",
              active
                ? "font-medium text-fg"
                : "text-muted-fg group-hover:text-fg"
            )}
          >
            {title}
          </span>
        </button>
      )}

      {!renaming && overlayLayout ? (
        <>
          <button
            aria-label="Page options"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "absolute right-1 flex h-8 w-8 items-center justify-center rounded-md text-faint-fg transition-colors hover:bg-[var(--active)] hover:text-muted-fg"
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent side="bottom" className="max-h-[min(50vh,360px)]">
              <PanelHeader title={title} onClose={() => setMenuOpen(false)} />
              <PanelBody className="pb-6">
                <PanelSection>
                  <PanelActionRow
                    label="Rename"
                    leading={<Pencil className="h-4 w-4 shrink-0" />}
                    onClick={startRename}
                  />
                  <PanelActionRow
                    label="Share"
                    leading={<ShareIcon className="h-4 w-4 shrink-0" />}
                    onClick={handleShare}
                  />
                  <PanelActionRow
                    label="Delete"
                    leading={<Trash2 className="h-4 w-4 shrink-0" />}
                    onClick={handleDelete}
                    destructive
                  />
                </PanelSection>
              </PanelBody>
            </SheetContent>
          </Sheet>
        </>
      ) : !renaming ? (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Page options"
              className={cn(
                "absolute right-1 flex h-7 w-7 items-center justify-center rounded-md text-faint-fg transition-opacity hover:bg-[var(--active)] hover:text-muted-fg",
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-52">
            <DropdownMenuItem onSelect={startRename}>
              <Pencil className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleShare}>
              <ShareIcon className="h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator fullBleed />
            <DropdownMenuItem destructive onSelect={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
}
