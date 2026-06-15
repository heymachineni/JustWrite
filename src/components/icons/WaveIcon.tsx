import { cn } from "@/lib/utils";

export function WaveIcon({
  className,
  active = false,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("wave-icon", active && "wave-icon--live", className)}
      aria-hidden
    >
      {active ? (
        <path
          className="wave-icon__wave"
          d="M3 12c1.8-3.5 3.6-3.5 5.4 0s3.6 3.5 5.4 0 3.6-3.5 5.4 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          className="wave-icon__line"
          d="M4 12h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
