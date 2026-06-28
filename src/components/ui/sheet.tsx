"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { BOTTOM_SHEET_INSET, PANEL_FLOAT_RIGHT, PANEL_RADIUS, PANEL_SHELL } from "@/lib/panel-layout";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const bottomSheetClass = cn(
  BOTTOM_SHEET_INSET,
  "flex flex-col pb-3",
  PANEL_RADIUS,
  PANEL_SHELL,
  "data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down"
);

export function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "right";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in data-[state=closed]:opacity-0"
        style={{ animationDuration: "0.2s" }}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 outline-none",
          side === "bottom" && bottomSheetClass,
          side === "right" &&
            cn(
              PANEL_FLOAT_RIGHT,
              PANEL_SHELL,
              "h-auto w-full max-w-[360px] data-[state=open]:animate-sheet-right data-[state=closed]:animate-sheet-right-out"
            ),
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "px-5 text-center text-[15px] font-semibold tracking-tight text-fg",
        className
      )}
      {...props}
    />
  );
}
