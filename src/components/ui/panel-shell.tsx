"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PanelHeader({
  title,
  onClose,
  onBack,
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="relative shrink-0 border-b border-border px-5 pb-4 pt-4">
      {onBack ? (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="absolute left-2 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
      <h2 className="px-10 text-center text-[15px] font-semibold tracking-tight text-fg">
        {title}
      </h2>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-[var(--hover)] hover:text-fg"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2", className)}>
      {children}
    </div>
  );
}

export function PanelSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title && (
        <div className="mb-2.5 px-1">
          <h3 className="text-[13px] font-medium text-fg">{title}</h3>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
        {children}
      </div>
    </section>
  );
}

export function PanelRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const base = cn(
    "flex items-center justify-between gap-4 px-3.5 py-2.5",
    "border-b border-border last:border-b-0",
    onClick && "w-full text-left transition-colors hover:bg-[var(--hover)] active:bg-[var(--active)]",
    className
  );

  if (onClick) {
    return (
      <button type="button" className={base} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}

export function PanelNavRow({
  label,
  detail,
  onClick,
}: {
  label: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <PanelRow onClick={onClick}>
      <span className="text-[14px] text-muted-fg">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {detail && (
          <span className="text-[13px] text-faint-fg">{detail}</span>
        )}
        <ChevronRight className="h-4 w-4 text-faint-fg" />
      </span>
    </PanelRow>
  );
}

export function PanelActionRow({
  label,
  onClick,
  leading,
  trailing,
  destructive,
}: {
  label: string;
  onClick: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <PanelRow onClick={onClick}>
      <span
        className={cn(
          "flex items-center gap-2.5 text-[14px]",
          destructive ? "text-destructive" : "text-fg"
        )}
      >
        {leading}
        {label}
      </span>
      {trailing}
    </PanelRow>
  );
}

export function PanelSelectRow({
  label,
  selected,
  onClick,
  leading,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  leading?: React.ReactNode;
}) {
  return (
    <PanelRow onClick={onClick}>
      <span className="flex min-w-0 items-center gap-3">
        {leading}
        <span className="text-[14px] text-muted-fg">{label}</span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-fg" />}
    </PanelRow>
  );
}
