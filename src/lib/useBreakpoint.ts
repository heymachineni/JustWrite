"use client";

import * as React from "react";
import { getBreakpoint, mediaQueries, type Breakpoint } from "./breakpoints";
import { useMediaQuery } from "./useMediaQuery";

function getInitialBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  return getBreakpoint(window.innerWidth);
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState(getInitialBreakpoint);

  React.useEffect(() => {
    const update = () => setBreakpoint(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}

export function useOverlayLayout(): boolean {
  return useMediaQuery(mediaQueries.overlay);
}
