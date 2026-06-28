"use client";

import * as React from "react";
import { MoreVertical, ChevronRight, Check } from "lucide-react";
import { SidebarSolidIcon } from "@/components/icons/SidebarSolidIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { WaveIcon } from "@/components/icons/WaveIcon";
import { usePagesStore } from "@/features/pages/store";
import { useFocusSettingsStore } from "@/features/focus/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTriggerStyled,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useOverlayLayout } from "@/lib/useBreakpoint";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";
import { OptionsSheet } from "./OptionsSheet";
import {
  fonts,
  timeOptions,
  wordTargetPresets,
  useAppMenu,
} from "./useAppMenu";
import type { PanelView } from "./SidePanel";

const topBarBtn =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors";
const topBarIconIdle =
  "text-faint-fg hover:bg-[var(--hover)] hover:text-fg";
const topBarIconActive = "text-fg hover:bg-[var(--hover)]";
const topBarIconDisabled = "cursor-not-allowed text-faint-fg opacity-40";

function WordTargetCustomInput({
  current,
  onSet,
}: {
  current: number | null;
  onSet: (n: number | null) => void;
}) {
  const [value, setValue] = React.useState("");
  const isCustom =
    current != null &&
    !wordTargetPresets.some((p) => p.value === current);

  React.useEffect(() => {
    if (isCustom) setValue(String(current));
    else setValue("");
  }, [current, isCustom]);

  const commit = () => {
    const n = parseInt(value, 10);
    if (n > 0) onSet(n);
  };

  return (
    <div
      className="px-2 py-2"
      onPointerDown={(e) => e.preventDefault()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <input
        type="number"
        min={1}
        placeholder="Custom words"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") commit();
        }}
        className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none placeholder:text-faint-fg focus:border-border-strong"
      />
    </div>
  );
}

function DesktopOptionsMenu({
  onOpenPanel,
}: {
  onOpenPanel: (view: PanelView) => void;
}) {
  const menu = useAppMenu((view) => {
    window.setTimeout(() => onOpenPanel(view), 80);
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu"
          className={cn(
            topBarBtn,
            topBarIconIdle,
            "data-[state=open]:bg-[var(--hover)] data-[state=open]:text-fg"
          )}
        >
          <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTriggerStyled className="justify-between">
            Text style
            <ChevronRight className="ml-auto h-4 w-4 text-faint-fg" />
          </DropdownMenuSubTriggerStyled>
          <DropdownMenuSubContent className="w-52">
            {fonts.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onSelect={() => menu.setFont(f.value)}
                className="gap-3"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-base text-fg",
                    f.sampleClass
                  )}
                >
                  Aa
                </span>
                <span>{f.label}</span>
                {menu.font === f.value && (
                  <Check className="ml-auto h-4 w-4 text-fg" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          onSelect={() => menu.setTheme(menu.isDark ? "light" : "dark")}
        >
          {menu.isDark ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => menu.openPanel("shortcuts")}>
          Shortcuts
        </DropdownMenuItem>

        <DropdownMenuSeparator fullBleed />

        <DropdownMenuItem onSelect={() => menu.toggleWordCount()}>
          {menu.showWordCount ? "Hide counter" : "Show counter"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => menu.enterFocusMode()}>
          Focus mode
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTriggerStyled className="justify-between">
            Editor mode
            <ChevronRight className="ml-auto h-4 w-4 text-faint-fg" />
          </DropdownMenuSubTriggerStyled>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem onSelect={() => menu.setMode("markdown")}>
              Markdown mode
              {menu.editorMode === "markdown" && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => menu.setMode("richtext")}>
              Rich text mode
              {menu.editorMode === "richtext" && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTriggerStyled className="justify-between">
            Advanced
            <ChevronRight className="ml-auto h-4 w-4 text-faint-fg" />
          </DropdownMenuSubTriggerStyled>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                menu.toggleNightMode();
              }}
            >
              Night time
              {menu.nightModeEnabled && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                menu.toggleMusicMode();
              }}
            >
              Type to the music
              {menu.musicModeEnabled && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                menu.toggleDisableBackspace();
              }}
            >
              Disable backspace
              {menu.disableBackspace && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                menu.toggleDisablePaste();
              }}
            >
              Disable paste
              {menu.disablePaste && (
                <Check className="ml-auto h-4 w-4 text-fg" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTriggerStyled className="justify-between">
                Time limit
                <ChevronRight className="ml-auto h-4 w-4 text-faint-fg" />
              </DropdownMenuSubTriggerStyled>
              <DropdownMenuSubContent>
                {timeOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.label}
                    onSelect={() => menu.setTimeLimitMinutes(opt.value)}
                  >
                    {opt.label}
                    {menu.timeLimitMinutes === opt.value && (
                      <Check className="ml-auto h-4 w-4 text-fg" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTriggerStyled className="justify-between">
                Word target
                <ChevronRight className="ml-auto h-4 w-4 text-faint-fg" />
              </DropdownMenuSubTriggerStyled>
              <DropdownMenuSubContent className="w-52">
                {wordTargetPresets.map((opt) => (
                  <DropdownMenuItem
                    key={opt.label}
                    onSelect={() => menu.handleWordTarget(opt.value)}
                  >
                    {opt.label}
                    {menu.wordTargetLimit === opt.value && (
                      <Check className="ml-auto h-4 w-4 text-fg" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator fullBleed />
                <WordTargetCustomInput
                  current={menu.wordTargetLimit}
                  onSet={menu.handleWordTarget}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator fullBleed />

        <DropdownMenuItem onSelect={() => menu.openPanel("about")}>
          About
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => menu.openPanel("terms")}>
          Terms
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => menu.openPanel("privacy")}>
          Privacy
        </DropdownMenuItem>
        <DropdownMenuLabel className="normal-case tracking-normal text-faint-fg">
          Version {APP_VERSION}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar({
  sidebarOpen,
  activePageId,
  onOpenSidebar,
  onOpenPanel,
}: {
  sidebarOpen: boolean;
  activePageId: string;
  onOpenSidebar: () => void;
  onOpenPanel: (view: PanelView) => void;
}) {
  const overlayLayout = useOverlayLayout();
  const [optionsOpen, setOptionsOpen] = React.useState(false);

  const musicModeEnabled = useFocusSettingsStore((s) => s.musicModeEnabled);
  const typewriterSoundEnabled = useFocusSettingsStore(
    (s) => s.typewriterSoundEnabled
  );
  const typewriterOn = typewriterSoundEnabled && !musicModeEnabled;
  const toggleTypewriterSound = useFocusSettingsStore(
    (s) => s.toggleTypewriterSound
  );

  const { show: toast } = useToast();

  const handleShare = async () => {
    const shareId = usePagesStore.getState().sharePage(activePageId);
    const link = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copied");
    } catch {
      toast("Could not copy link");
    }
  };

  const handleTypewriterToggle = () => {
    if (musicModeEnabled) return;
    const next = !typewriterSoundEnabled;
    toggleTypewriterSound();
    if (next) {
      import("@/features/focus/typewriterAudio").then((m) => {
        m.primeTypewriterAudio().then(() => m.playTypewriterClickOnce());
      });
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {!sidebarOpen && (
          <button
            aria-label="Open pages"
            onClick={onOpenSidebar}
            className={cn(topBarBtn, topBarIconIdle)}
          >
            <SidebarSolidIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label={
            musicModeEnabled
              ? "Typewriter sound unavailable while music mode is on"
              : typewriterOn
                ? "Turn off typewriter sound"
                : "Turn on typewriter sound"
          }
          aria-pressed={typewriterOn}
          disabled={musicModeEnabled}
          onClick={handleTypewriterToggle}
          className={cn(
            topBarBtn,
            musicModeEnabled
              ? topBarIconDisabled
              : typewriterOn
                ? topBarIconActive
                : topBarIconIdle
          )}
        >
          <WaveIcon className="h-5 w-5" active={typewriterOn} />
        </button>

        <button
          aria-label="Share page"
          onClick={handleShare}
          className={cn(topBarBtn, topBarIconIdle)}
        >
          <ShareIcon className="h-5 w-5" />
        </button>

        {overlayLayout ? (
          <>
            <button
              aria-label="Menu"
              onClick={() => setOptionsOpen(true)}
              className={cn(topBarBtn, topBarIconIdle)}
            >
              <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <OptionsSheet
              open={optionsOpen}
              onOpenChange={setOptionsOpen}
              onOpenPanel={onOpenPanel}
            />
          </>
        ) : (
          <DesktopOptionsMenu onOpenPanel={onOpenPanel} />
        )}
      </div>
    </header>
  );
}
