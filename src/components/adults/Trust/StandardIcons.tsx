import type { StandardIcon } from "../../../data/adults/adultSectionsContent";

/**
 * Fine line icons for the four standards. Every stroke uses
 * pathLength="1" so one CSS dash animation can draw any of them in.
 */
const PATHS: Record<StandardIcon, string[]> = {
  // Leaf with midrib and veins
  plant: [
    "M24 42 C 10 34, 8 18, 24 6 C 40 18, 38 34, 24 42 Z",
    "M24 42 L 24 14",
    "M24 30 L 17 23",
    "M24 24 L 31 17",
  ],
  // Sugar cube, struck through
  sugar: [
    "M14 18 L 24 13 L 34 18 L 34 31 L 24 36 L 14 31 Z",
    "M14 18 L 24 23 L 34 18",
    "M24 23 L 24 36",
    "M9 39 L 39 9",
  ],
  // Droplet, struck through
  colour: [
    "M24 7 C 24 7, 12 21, 12 29 A 12 12 0 0 0 36 29 C 36 21, 24 7, 24 7 Z",
    "M18 30 A 6 6 0 0 0 23 35",
    "M9 39 L 39 9",
  ],
  // Flask with a check
  tested: [
    "M19 7 L 29 7",
    "M21 7 L 21 19 L 11 38 A 2.5 2.5 0 0 0 13.5 41 L 34.5 41 A 2.5 2.5 0 0 0 37 38 L 27 19 L 27 7",
    "M15 31 L 33 31",
    "M19 26 L 22.5 29 L 29 22",
  ],
};

export function StandardIconSvg({ icon, className }: { icon: StandardIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      {PATHS[icon].map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ ["--i" as string]: i }} />
      ))}
    </svg>
  );
}
