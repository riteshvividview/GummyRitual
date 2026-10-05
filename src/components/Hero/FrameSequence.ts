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

export interface FrameLoader {
  /** Total frame count in this loader's (possibly subsampled) sequence. */
  total: number;
  /** Returns the Image for a frame index, creating and starting its load on first access. */
  get(index: number): HTMLImageElement;
  /** True once the given frame has finished decoding. */
  isLoaded(index: number): boolean;
  /** Nearest frame index (by distance) that has already finished loading, or -1 if none have. */
  nearestLoaded(index: number): number;
  /** Resolves once the first frame has loaded (or failed) — gates first paint. */
  ready(): Promise<void>;
  /** Loads the remaining frames in the background without blocking the UI thread. */
  preloadRemaining(onProgress?: (loadedCount: number, total: number) => void): void;
}

/**
 * Builds an imperative frame loader over a URL list. Images are created
 * lazily (one Image object per frame, reused — never recreated), so
 * repeated scroll-driven access never re-decodes or re-allocates.
 */
function createFrameLoader(urls: string[]): FrameLoader {
  const images: (HTMLImageElement | undefined)[] = new Array(urls.length);
  const loaded = new Array<boolean>(urls.length).fill(false);
  let preloadStarted = false;

  function get(index: number): HTMLImageElement {
    const existing = images[index];
    if (existing) return existing;

    const img = new Image();
    img.decoding = "async";
    img.src = urls[index];
    img.addEventListener(
      "load",
      () => {
        loaded[index] = true;
      },
      { once: true }
    );
    images[index] = img;
    return img;
  }

  function isLoaded(index: number): boolean {
    return loaded[index] === true;
  }

  function nearestLoaded(index: number): number {
    if (loaded[index]) return index;
    for (let offset = 1; offset < urls.length; offset++) {
      const down = index - offset;
      if (down >= 0 && loaded[down]) return down;
      const up = index + offset;
      if (up < urls.length && loaded[up]) return up;
    }
    return -1;
  }

  function ready(): Promise<void> {
    const first = get(0);
    if (first.complete) return Promise.resolve();
    return new Promise((resolve) => {
      first.addEventListener("load", () => resolve(), { once: true });
      first.addEventListener("error", () => resolve(), { once: true });
    });
  }

  function preloadRemaining(onProgress?: (loadedCount: number, total: number) => void) {
    // Idempotent: the loader is now cached and reused across Kids/Adults
    // toggles (see getKidsHeroFrameLoader below), so this can be called
    // again on remount without spawning a second concurrent idle-loop that
    // competes with the first for bandwidth/idle time.
    if (preloadStarted) return;
    preloadStarted = true;

    let cursor = 1;

    const scheduleNext = () => {
      if (cursor >= urls.length) return;
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback;
      if (ric) ric(step);
      else setTimeout(step, 16);
    };

    const step = () => {
      if (cursor >= urls.length) return;
      const index = cursor;
      const img = get(index);

      const advance = () => {
        onProgress?.(loaded.filter(Boolean).length, urls.length);
        cursor += 1;
        scheduleNext();
      };

      if (img.complete) advance();
      else {
        img.addEventListener("load", advance, { once: true });
        img.addEventListener("error", advance, { once: true });
      }
    };

    scheduleNext();
  }

  return { total: urls.length, get, isLoaded, nearestLoaded, ready, preloadRemaining };
}

const loaderCache = new Map<string, FrameLoader>();

/**
 * Returns a shared FrameLoader for this exact URL set, creating it once and
 * reusing it on every subsequent call. Without this, switching Kids ->
 * Adults -> Kids would unmount/remount the hero and rebuild a brand-new
 * loader from scratch each time — discarding every already-loaded frame
 * (including frame 0) and forcing a visibly blank canvas until reloading
 * finished. Caching by URL set means a toggle back to Kids resumes from
 * whatever was already loaded, typically instantly.
 */
export function getFrameLoader(urls: string[]): FrameLoader {
  const key = urls.join("|");
  const cached = loaderCache.get(key);
  if (cached) return cached;

  const loader = createFrameLoader(urls);
  loaderCache.set(key, loader);
  return loader;
}
