/**
 * Background image-sequence frames for the "Why Gummy Rituals?" section,
 * resolved via Vite's glob import (fingerprinted/served correctly in
 * production builds without importing each frame by hand — same approach
 * as Hero/FrameSequence.ts).
 *
 * Source: src/assets/homepage/03-benefits/videos/bg-for-benefits/
 * Naming convention: ezgif-frame-001.png ... ezgif-frame-240.png (3-digit,
 * sequential, no gaps). Format: PNG, 1280x720, RGB.
 */

function sortedFrameUrls(modules: Record<string, string>): string[] {
  return Object.entries(modules)
    .sort(([a], [b]) => {
      const numA = Number(a.match(/(\d+)(?=\.\w+$)/)?.[0] ?? 0);
      const numB = Number(b.match(/(\d+)(?=\.\w+$)/)?.[0] ?? 0);
      return numA - numB;
    })
    .map(([, url]) => url);
}

const rawModules = import.meta.glob(
  "../../assets/homepage/03-benefits/videos/bg-for-benefits/*.png",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

export const benefitsFrameUrls: string[] = sortedFrameUrls(rawModules);

export const BENEFITS_FRAME_ASPECT = 1280 / 720;
