/** Layout breakpoints — aligned with Tailwind `md` (768) and a tablet tier at 1024. */
export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function getBreakpoint(width: number): Breakpoint {
  if (width <= BREAKPOINTS.mobileMax) return "mobile";
  if (width <= BREAKPOINTS.tabletMax) return "tablet";
  return "desktop";
}

export const mediaQueries = {
  mobile: `(max-width: ${BREAKPOINTS.mobileMax}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobileMax + 1}px) and (max-width: ${BREAKPOINTS.tabletMax}px)`,
  overlay: `(max-width: ${BREAKPOINTS.tabletMax}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tabletMax + 1}px)`,
} as const;
