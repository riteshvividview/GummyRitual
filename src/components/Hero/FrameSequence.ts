/**
 * Frame-sequence loading, independent of any UI framework. Resolves the
 * provided hero frame folders to ordered URL lists via Vite's glob import
 * (so frames are fingerprinted/served correctly in production builds
 * without importing each frame module by hand), then exposes an
 * imperative, non-reactive image cache for scroll-driven rendering.
 *
 * Four sequences exist for the Kids hero, one per benefit:
 * - Immune Support:   src/assets/homepage/01-hero/videos/hero-page-orange-bear-video-bg-sync-with-scroll
 * - Healthy Growth:   src/assets/homepage/01-hero/videos/hero-page-pink-bear-video-bg-sync-with-scroll
 * - Better Focus:     src/assets/homepage/01-hero/videos/hero-page-green-bear-video-bg-sync-with-scroll
 * - Active Lifestyle: src/assets/homepage/01-hero/videos/hero-page-blue-bear-video-bg-sync-with-scroll
 * Naming convention: ezgif-frame-001.png ... ezgif-frame-120.png (3-digit, sequential, no gaps)
 * Format: PNG, 1280x720, RGB
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
  "../../assets/homepage/01-hero/videos/hero-page-orange-bear-video-bg-sync-with-scroll/*.png",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const rawPinkBearModules = import.meta.glob(
  "../../assets/homepage/01-hero/videos/hero-page-pink-bear-video-bg-sync-with-scroll/*.png",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const rawGreenBearModules = import.meta.glob(
  "../../assets/homepage/01-hero/videos/hero-page-green-bear-video-bg-sync-with-scroll/*.png",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const rawBlueBearModules = import.meta.glob(
  "../../assets/homepage/01-hero/videos/hero-page-blue-bear-video-bg-sync-with-scroll/*.png",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

/** Default hero frame sequence — "Immune Support". */
export const orangeBearFrameUrls: string[] = sortedFrameUrls(rawOrangeBearModules);
/** Swapped in when "Healthy Growth" is selected. */
export const pinkBearFrameUrls: string[] = sortedFrameUrls(rawPinkBearModules);
/** Swapped in when "Better Focus" is selected. */
export const greenBearFrameUrls: string[] = sortedFrameUrls(rawGreenBearModules);
/** Swapped in when "Active Lifestyle" is selected. */
export const blueBearFrameUrls: string[] = sortedFrameUrls(rawBlueBearModules);

export const KIDS_HERO_FRAME_ASPECT = 1280 / 720;
