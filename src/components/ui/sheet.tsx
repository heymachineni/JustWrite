"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const bottomSheetClass =
  "left-3 right-3 bottom-3 flex flex-col rounded-[16px] border border-border pb-3 data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down max-lg:bottom-[max(12px,env(safe-area-inset-bottom))] max-lg:left-3 max-lg:right-3";

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
          "fixed z-50 bg-bg shadow-[var(--shadow-lg)] outline-none",
          side === "bottom" && bottomSheetClass,
          side === "right" &&
            "inset-y-0 right-0 h-full w-full max-w-[360px] border-l border-border data-[state=open]:animate-sheet-right data-[state=closed]:animate-sheet-right-out",
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
