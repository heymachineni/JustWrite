"use client";

/**
 * Exact thoughtless.my overlay: four fixed line bands above the clear typing row.
 * @see thoughtless-master/styles.css .overlay
 */
export function ThoughtlessOverlay() {
  return (
    <div
      className="thoughtless-overlay pointer-events-none absolute inset-x-0 top-0 z-10"
      style={{ height: "calc(4 * var(--focus-line-height))" }}
      aria-hidden
    >
      <div className="thoughtless-overlay-band thoughtless-overlay-band-1" />
      <div className="thoughtless-overlay-band thoughtless-overlay-band-2" />
      <div className="thoughtless-overlay-band thoughtless-overlay-band-3" />
      <div className="thoughtless-overlay-band thoughtless-overlay-band-4" />
    </div>
  );
}
