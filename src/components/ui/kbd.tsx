import { parseKeyCombo } from "@/lib/shortcuts-data";
import { cn } from "@/lib/utils";

const keyCapClass =
  "inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-bg px-1.5 font-mono text-[11px] font-medium leading-none text-muted-fg shadow-[0_1px_0_rgba(0,0,0,0.04)]";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd className={cn(keyCapClass, className)}>
      {children}
    </kbd>
  );
}

export function KeyCombo({
  keys,
  className,
}: {
  keys: string;
  className?: string;
}) {
  const parts = parseKeyCombo(keys);

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {parts.map((part, i) => (
        <Kbd key={`${part}-${i}`}>{part}</Kbd>
      ))}
    </span>
  );
}
