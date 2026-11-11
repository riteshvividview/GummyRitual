/** Shared geometry for the Light Dial (SVG + scroll-driven updates). */
export const DIAL_R = 52;
export const DIAL_C = 2 * Math.PI * DIAL_R;

/** Hour (0–24) → angle in degrees, 0h at the top, clockwise. */
export const hourToDeg = (h: number) => (h / 24) * 360;
