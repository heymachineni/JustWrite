"use client";

import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuSubTrigger = DropdownPrimitive.SubTrigger;

const contentClass =
  "z-50 min-w-[11rem] overflow-hidden rounded-xl border border-border bg-bg-elevated p-1.5 shadow-[var(--shadow-lg)] animate-pop-in";

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(contentClass, className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.SubContent>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.SubContent
        className={cn(contentClass, className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

const itemClass =
  "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-fg outline-none transition-colors focus:bg-[var(--hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0";

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item> & {
  destructive?: boolean;
}) {
  return (
    <DropdownPrimitive.Item
      className={cn(itemClass, destructive && "text-red-500 focus:bg-red-500/10", className)}
      {...props}
    />
  );
}

export function DropdownMenuSubTriggerStyled({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.SubTrigger>) {
  return (
    <DropdownPrimitive.SubTrigger
      className={cn(itemClass, "data-[state=open]:bg-[var(--hover)]", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  fullBleed,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Separator> & {
  fullBleed?: boolean;
}) {
  return (
    <DropdownPrimitive.Separator
      className={cn(
        "h-px bg-border",
        fullBleed ? "-mx-1.5 my-1" : "my-1",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className={cn("px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-faint-fg", className)}
      {...props}
    />
  );
}
