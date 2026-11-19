/**
 * Frame-sequence loading, independent of any UI framework. Resolves the
 * provided hero frame folders to ordered URL lists via Vite's glob import
 * (so frames are fingerprinted/served correctly in production builds
 * without importing each frame module by hand), then exposes an
 * imperative, non-reactive image cache for scroll-driven rendering.
 *
 * Two sequences exist for the Kids hero, one per product:
 * - Daily Nutrition (Multivitamin): .../hero-page-orange-bear-video-bg-sync-with-scroll
 * - Strong Bones (Calcium):         .../hero-page-pink-bear-video-bg-sync-with-scroll
 * Naming convention: ezgif-frame-001.webp ... ezgif-frame-120.webp (3-digit, sequential, no gaps)
 * Format: WebP q80 (scripts/frames-to-webp.mjs) — ~50KB/frame vs ~1.3MB PNG
 */

export { type FrameLoader, getFrameLoader } from "../../animations/frameLoader";

function sortedFrameUrls(modules: Record<string, string>): string[] {
  return Object.entries(modules)
    .sort(([a], [b]) => {
      const numA = Number(a.match(/(\d+)(?=\.\w+$)/)?.[0] ?? 0);
      const numB = Number(b.match(/(\d+)(?=\.\w+$)/)?.[0] ?? 0);
      return numA - numB;
    })
    .map(([, url]) => url);
}

const rawOrangeBearModules = import.meta.glob(
  "../../assets/homepage/01-hero/videos/hero-page-orange-bear-video-bg-sync-with-scroll/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const rawPinkBearModules = import.meta.glob(
  "../../assets/homepage/01-hero/videos/hero-page-pink-bear-video-bg-sync-with-scroll/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

/** Default hero frame sequence — "Immune Support". */
export const orangeBearFrameUrls: string[] = sortedFrameUrls(rawOrangeBearModules);
/** Swapped in when "Healthy Growth" is selected. */
export const pinkBearFrameUrls: string[] = sortedFrameUrls(rawPinkBearModules);

export const KIDS_HERO_FRAME_ASPECT = 1280 / 720;
