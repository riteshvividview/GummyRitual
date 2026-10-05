/**
 * Product + stand images for the Featured Collection carousel, resolved
 * via Vite's glob import (fingerprinted/served correctly in production
 * builds without importing each file by hand, and — importantly — this
 * doesn't error at build time if a given file doesn't exist yet, unlike a
 * direct `import` would). Same approach as Hero/FrameSequence.ts and
 * WhyGummyRituals/benefitsFrames.ts.
 *
 * Drop files into src/assets/homepage/01a-featured-collection/images/ —
 * product images named to match each product's `image` field in
 * src/data/products.ts, and the stand/platform photo as
 * STAND_IMAGE_FILENAME below. Until a given file exists, getProductImage
 * returns undefined and the caller falls back to a placeholder.
 */

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

const rawModules = import.meta.glob(
  "../../assets/homepage/01a-featured-collection/images/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const imagesByFilename: Record<string, string> = Object.fromEntries(
  Object.entries(rawModules).map(([path, url]) => [basename(path), url])
);

export function getProductImage(filename?: string): string | undefined {
  if (!filename) return undefined;
  return imagesByFilename[filename];
}

/** A three-slot platform — the center slot is taller than the two side
 * slots (see circularPositions.ts's CENTER_SLOT_LIFT/SIDE_SLOT_DROP,
 * which nudge the 3 visible product cards to match). */
export const STAND_IMAGE_FILENAME = "bg-with-three-slot-stand-for-products.png";
