"use client";

import * as React from "react";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  SquarePen,
  Focus,
  PanelLeft,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Share2,
  Download,
  Copy,
  Pin,
  PinOff,
  Trash2,
  FileText,
  Search,
} from "lucide-react";
import { usePagesStore } from "@/features/pages/store";
import { useAllPages, useActivePage } from "@/features/pages/selectors";
import { useSettingsStore } from "@/features/settings/store";
import { fuzzyScore } from "@/lib/fuzzy";
import { toMarkdown, downloadMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function CommandCenter({
  open,
  onOpenChange,
  onShare,
  onOpenSettings,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onShare: (id: string) => void;
  onOpenSettings: () => void;
}) {
  const pages = useAllPages();
  const activePage = useActivePage();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  const theme = useSettingsStore((s) => s.theme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 animate-fade-in" />
        <DialogPrimitive.Content
          aria-label="Command center"
          className="fixed left-1/2 top-[18%] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-[var(--shadow)] animate-pop-in outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            Command center
          </DialogPrimitive.Title>
          <Command
            shouldFilter={true}
            filter={(value, search) => {
              const score = fuzzyScore(search, value);
              return score === null ? 0 : Math.max(0.0001, score);
            }}
            onKeyDown={(e) => {
              // Cmd/Ctrl+O creates a new page even from the search input.
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "o") {
                e.preventDefault();
                run(() => usePagesStore.getState().createPage());
              }
            }}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-faint-fg" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Ask anything, or search your pages…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-faint-fg"
              />
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-fg">
                No results.
              </Command.Empty>

              <Command.Group
                heading="Actions"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint-fg"
              >
                <Item
                  value="new page create"
                  onSelect={() => run(() => usePagesStore.getState().createPage())}
                  icon={<SquarePen className="h-4 w-4" />}
                  label="New page"
                  hint="⌘O"
                />
                <Item
                  value="toggle focus mode"
                  onSelect={() =>
                    run(() => useSettingsStore.getState().toggleFocusMode())
                  }
                  icon={<Focus className="h-4 w-4" />}
                  label="Toggle focus mode"
                  hint="⌘⇧F"
                />
                <Item
                  value="toggle sidebar"
                  onSelect={() => run(() => useSettingsStore.getState().toggleSidebar())}
                  icon={<PanelLeft className="h-4 w-4" />}
                  label="Toggle sidebar"
                  hint="⌘J"
                />
                <Item
                  value={`switch to ${nextTheme} theme`}
                  onSelect={() =>
                    run(() => useSettingsStore.getState().setTheme(nextTheme))
                  }
                  icon={
                    nextTheme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )
                  }
                  label={`Switch to ${nextTheme} theme`}
                />
                <Item
                  value="open settings preferences"
                  onSelect={() => run(onOpenSettings)}
                  icon={<SettingsIcon className="h-4 w-4" />}
                  label="Settings"
                />
              </Command.Group>

              {activePage && (
                <Command.Group
                  heading="Current page"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint-fg"
                >
                  <Item
                    value="share current page link"
                    onSelect={() => run(() => onShare(activePage.id))}
                    icon={<Share2 className="h-4 w-4" />}
                    label="Share page"
                  />
                  <Item
                    value="export markdown download current page"
                    onSelect={() =>
                      run(() =>
                        downloadMarkdown(
                          activePage.title || "untitled",
                          toMarkdown(activePage.content)
                        )
                      )
                    }
                    icon={<Download className="h-4 w-4" />}
                    label="Export as Markdown"
                  />
                  <Item
                    value="duplicate current page"
                    onSelect={() =>
                      run(() => usePagesStore.getState().duplicatePage(activePage.id))
                    }
                    icon={<Copy className="h-4 w-4" />}
                    label="Duplicate page"
                  />
                  <Item
                    value="pin unpin current page"
                    onSelect={() =>
                      run(() =>
                        usePagesStore
                          .getState()
                          .setPinned(activePage.id, !activePage.pinned)
                      )
                    }
                    icon={
                      activePage.pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )
                    }
                    label={activePage.pinned ? "Unpin page" : "Pin page"}
                  />
                  <Item
                    value="delete current page"
                    onSelect={() =>
                      run(() => usePagesStore.getState().deletePage(activePage.id))
                    }
                    icon={<Trash2 className="h-4 w-4" />}
                    label="Delete page"
                    destructive
                  />
                </Command.Group>
              )}

              <Command.Group
                heading="Pages"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint-fg"
              >
                {pages.map((p) => (
                  <Item
                    key={p.id}
                    value={`page ${p.title || "untitled"} ${p.text.slice(0, 80)} ${p.id}`}
                    onSelect={() =>
                      run(() => usePagesStore.getState().setActivePage(p.id))
                    }
                    icon={<FileText className="h-4 w-4" />}
                    label={p.title.trim() || "Untitled"}
                  />
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Item({
  value,
  onSelect,
  icon,
  label,
  hint,
  destructive,
}: {
  value: string;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  destructive?: boolean;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm outline-none transition-colors data-[selected=true]:bg-[var(--hover)]",
        destructive ? "text-red-500" : "text-fg"
      )}
    >
      <span className={cn(destructive ? "text-red-500" : "text-muted-fg")}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {hint && (
        <span className="ml-auto font-mono text-xs text-faint-fg">{hint}</span>
      )}
    </Command.Item>
  );
}
