"use client";

import * as React from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useSettingsStore,
  type Theme,
  type FontStyle,
} from "./store";
import { cn } from "@/lib/utils";

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
];

const fonts: { value: FontStyle; label: string; sample: string; cls: string }[] = [
  { value: "modern", label: "Modern", sample: "Ag", cls: "font-sans" },
  { value: "draft", label: "Draft", sample: "Ag", cls: "font-mono" },
  { value: "classic", label: "Classic", sample: "Ag", cls: "font-serif" },
];

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const theme = useSettingsStore((s) => s.theme);
  const font = useSettingsStore((s) => s.font);
  const showToolbar = useSettingsStore((s) => s.showToolbar);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFont = useSettingsStore((s) => s.setFont);
  const toggleToolbar = useSettingsStore((s) => s.toggleToolbar);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Tune the appearance. Everything saves automatically.
        </DialogDescription>

        <div className="mt-5 space-y-6">
          <Field label="Theme">
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors",
                    theme === t.value
                      ? "border-border-strong bg-[var(--hover)] text-fg"
                      : "border-border text-muted-fg hover:bg-[var(--hover)]"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Font">
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFont(f.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border px-3 py-3 transition-colors",
                    font === f.value
                      ? "border-border-strong bg-[var(--hover)]"
                      : "border-border hover:bg-[var(--hover)]"
                  )}
                >
                  <span className={cn("text-xl text-fg", f.cls)}>{f.sample}</span>
                  <span className="text-xs font-medium text-muted-fg">{f.label}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Editor">
            <button
              onClick={toggleToolbar}
              className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-[var(--hover)]"
            >
              <span className="text-fg">Formatting toolbar on selection</span>
              <span
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  showToolbar ? "bg-[var(--accent)]" : "bg-border-strong"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform",
                    showToolbar ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint-fg">
        {label}
      </p>
      {children}
    </div>
  );
}
