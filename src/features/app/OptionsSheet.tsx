"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  PanelBody,
  PanelHeader,
  PanelNavRow,
  PanelActionRow,
  PanelRow,
  PanelSection,
  PanelSelectRow,
} from "@/components/ui/panel-shell";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";
import {
  fonts,
  timeOptions,
  wordTargetPresets,
  useAppMenu,
} from "./useAppMenu";
import type { PanelView } from "./SidePanel";

export type OptionsScreen =
  | "root"
  | "text-style"
  | "editor-mode"
  | "advanced"
  | "time-limit"
  | "word-target";

const SCREEN_TITLES: Record<OptionsScreen, string> = {
  root: "Options",
  "text-style": "Text style",
  "editor-mode": "Editor mode",
  advanced: "Advanced",
  "time-limit": "Time limit",
  "word-target": "Word target",
};

export function OptionsSheet({
  open,
  onOpenChange,
  onOpenPanel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPanel: (view: PanelView) => void;
}) {
  const [stack, setStack] = React.useState<OptionsScreen[]>(["root"]);
  const screen = stack[stack.length - 1];

  const menu = useAppMenu((view) => {
    onOpenChange(false);
    window.setTimeout(() => onOpenPanel(view), 80);
  });

  React.useEffect(() => {
    if (!open) setStack(["root"]);
  }, [open]);

  const push = (next: OptionsScreen) => setStack((s) => [...s, next]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[min(92vh,720px)] flex flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <PanelHeader
            title={SCREEN_TITLES[screen]}
            onClose={() => onOpenChange(false)}
            onBack={stack.length > 1 ? pop : undefined}
          />

          <PanelBody>
            {screen === "root" && (
              <RootScreen menu={menu} onNavigate={push} />
            )}
            {screen === "text-style" && <TextStyleScreen menu={menu} />}
            {screen === "editor-mode" && <EditorModeScreen menu={menu} />}
            {screen === "advanced" && (
              <AdvancedScreen menu={menu} onNavigate={push} />
            )}
            {screen === "time-limit" && <TimeLimitScreen menu={menu} />}
            {screen === "word-target" && <WordTargetScreen menu={menu} />}
          </PanelBody>

          {screen === "root" ? (
            <div className="shrink-0 border-t border-border px-5 py-3">
              <p className="text-[12px] text-faint-fg">
                Version {APP_VERSION}
              </p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type MenuApi = ReturnType<typeof useAppMenu>;

function RootScreen({
  menu,
  onNavigate,
}: {
  menu: MenuApi;
  onNavigate: (screen: OptionsScreen) => void;
}) {
  return (
    <div className="space-y-7">
      <PanelSection>
        <PanelNavRow
          label="Text style"
          detail={fonts.find((f) => f.value === menu.font)?.label}
          onClick={() => onNavigate("text-style")}
        />
        <PanelActionRow
          label={menu.isDark ? "Light theme" : "Dark theme"}
          onClick={() => menu.setTheme(menu.isDark ? "light" : "dark")}
        />
        <PanelActionRow
          label="Shortcuts"
          onClick={() => menu.openPanel("shortcuts")}
        />
      </PanelSection>

      <PanelSection>
        <PanelActionRow
          label={menu.showWordCount ? "Hide counter" : "Show counter"}
          onClick={() => menu.toggleWordCount()}
        />
        <PanelActionRow
          label="Focus mode"
          onClick={() => menu.enterFocusMode()}
        />
        <PanelNavRow
          label="Editor mode"
          detail={
            menu.editorMode === "markdown" ? "Markdown" : "Rich text"
          }
          onClick={() => onNavigate("editor-mode")}
        />
        <PanelNavRow
          label="Advanced"
          onClick={() => onNavigate("advanced")}
        />
      </PanelSection>

      <PanelSection>
        <PanelActionRow
          label="About"
          onClick={() => menu.openPanel("about")}
        />
      </PanelSection>
    </div>
  );
}

function TextStyleScreen({ menu }: { menu: MenuApi }) {
  return (
    <PanelSection>
      {fonts.map((f) => (
        <PanelSelectRow
          key={f.value}
          label={f.label}
          selected={menu.font === f.value}
          onClick={() => menu.setFont(f.value)}
          leading={
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-base text-fg",
                f.sampleClass
              )}
            >
              Aa
            </span>
          }
        />
      ))}
    </PanelSection>
  );
}

function EditorModeScreen({ menu }: { menu: MenuApi }) {
  return (
    <PanelSection>
      <PanelSelectRow
        label="Markdown mode"
        selected={menu.editorMode === "markdown"}
        onClick={() => menu.setMode("markdown")}
      />
      <PanelSelectRow
        label="Rich text mode"
        selected={menu.editorMode === "richtext"}
        onClick={() => menu.setMode("richtext")}
      />
    </PanelSection>
  );
}

function AdvancedScreen({
  menu,
  onNavigate,
}: {
  menu: MenuApi;
  onNavigate: (screen: OptionsScreen) => void;
}) {
  return (
    <PanelSection>
      <PanelToggleRow
        label="Night time"
        checked={menu.nightModeEnabled}
        onToggle={() => menu.toggleNightMode()}
      />
      <PanelToggleRow
        label="Type to the music"
        checked={menu.musicModeEnabled}
        onToggle={() => menu.toggleMusicMode()}
      />
      <PanelToggleRow
        label="Disable backspace"
        checked={menu.disableBackspace}
        onToggle={() => menu.toggleDisableBackspace()}
      />
      <PanelToggleRow
        label="Disable paste"
        checked={menu.disablePaste}
        onToggle={() => menu.toggleDisablePaste()}
      />
      <PanelNavRow
        label="Time limit"
        detail={
          timeOptions.find((o) => o.value === menu.timeLimitMinutes)?.label ??
          "Off"
        }
        onClick={() => onNavigate("time-limit")}
      />
      <PanelNavRow
        label="Word target"
        detail={
          wordTargetPresets.find((o) => o.value === menu.wordTargetLimit)
            ?.label ??
          (menu.wordTargetLimit != null
            ? `${menu.wordTargetLimit} words`
            : "Off")
        }
        onClick={() => onNavigate("word-target")}
      />
    </PanelSection>
  );
}

function TimeLimitScreen({ menu }: { menu: MenuApi }) {
  return (
    <PanelSection>
      {timeOptions.map((opt) => (
        <PanelSelectRow
          key={opt.label}
          label={opt.label}
          selected={menu.timeLimitMinutes === opt.value}
          onClick={() => menu.setTimeLimitMinutes(opt.value)}
        />
      ))}
    </PanelSection>
  );
}

function WordTargetScreen({ menu }: { menu: MenuApi }) {
  const [value, setValue] = React.useState("");
  const isCustom =
    menu.wordTargetLimit != null &&
    !wordTargetPresets.some((p) => p.value === menu.wordTargetLimit);

  React.useEffect(() => {
    if (isCustom) setValue(String(menu.wordTargetLimit));
    else setValue("");
  }, [menu.wordTargetLimit, isCustom]);

  const commit = () => {
    const n = parseInt(value, 10);
    if (n > 0) menu.handleWordTarget(n);
  };

  return (
    <div className="space-y-7">
      <PanelSection>
        {wordTargetPresets.map((opt) => (
          <PanelSelectRow
            key={opt.label}
            label={opt.label}
            selected={menu.wordTargetLimit === opt.value}
            onClick={() => menu.handleWordTarget(opt.value)}
          />
        ))}
      </PanelSection>

      <div className="px-1">
        <input
          type="number"
          min={1}
          placeholder="Number of words"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          className="w-full rounded-xl border border-border bg-bg-elevated px-3.5 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint-fg focus:border-border-strong"
        />
      </div>
    </div>
  );
}

function PanelToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <PanelRow onClick={onToggle}>
      <span className="text-[14px] text-muted-fg">{label}</span>
      {checked && <Check className="h-4 w-4 shrink-0 text-fg" />}
    </PanelRow>
  );
}
