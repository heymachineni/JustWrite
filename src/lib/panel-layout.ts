/** Shared floating panel chrome — 12px inset on all sides. */
export const PANEL_FLOAT_INSET_Y = "top-3 bottom-3";
export const PANEL_FLOAT_LEFT = `${PANEL_FLOAT_INSET_Y} left-3`;
export const PANEL_FLOAT_RIGHT = `${PANEL_FLOAT_INSET_Y} right-3`;
export const PANEL_RADIUS = "rounded-[16px]";
export const PANEL_BORDER = "border border-border";
export const PANEL_SHADOW = "shadow-[var(--shadow-lg)]";
export const PANEL_SHELL = `${PANEL_RADIUS} ${PANEL_BORDER} ${PANEL_SHADOW} bg-bg`;

export const BOTTOM_SHEET_INSET =
  "left-3 right-3 bottom-3 max-lg:left-3 max-lg:right-3 max-lg:bottom-[max(12px,env(safe-area-inset-bottom))]";
