/**
 * Generic imperative image-sequence loader — shared by the Hero (pinned,
 * 4 color sequences) and WhyGummyRituals (non-pinned) scroll-synced
 * background animations. See components/Hero/FrameSequence.ts for the
 * Hero-specific URL resolution; this file only owns the loading/caching
 * mechanics, framework-agnostic and non-UI.
 */

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

/** How many frames preloadRemaining fetches concurrently per idle slice —
 * loading strictly one-at-a-time was too slow to meaningfully get ahead
 * of a user who starts scrolling within a second or two of page load;
 * browsers handle several concurrent image requests fine (HTTP/2
 * multiplexing), so this only costs bandwidth, not main-thread time. */
const PRELOAD_BATCH_SIZE = 4;

/**
 * Builds an imperative frame loader over a URL list. Images are created
 * lazily (one Image object per frame, reused — never recreated), so
 * repeated scroll-driven access never re-decodes or re-allocates.
 */
export function createFrameLoader(urls: string[]): FrameLoader {
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
    // Idempotent: the loader is cached and reused across remounts/toggles
    // (see getFrameLoader below), so this can be called again without
    // spawning a second concurrent idle-loop that competes with the first
    // for bandwidth/idle time.
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

      const batchEnd = Math.min(cursor + PRELOAD_BATCH_SIZE, urls.length);
      const batchIndices: number[] = [];
      for (let i = cursor; i < batchEnd; i++) batchIndices.push(i);
      cursor = batchEnd;

      let settled = 0;
      const onSettle = () => {
        settled += 1;
        onProgress?.(loaded.filter(Boolean).length, urls.length);
        if (settled === batchIndices.length) scheduleNext();
      };

      batchIndices.forEach((index) => {
        const img = get(index);
        if (img.complete) onSettle();
        else {
          img.addEventListener("load", onSettle, { once: true });
          img.addEventListener("error", onSettle, { once: true });
        }
      });
    };

    scheduleNext();
  }

  return { total: urls.length, get, isLoaded, nearestLoaded, ready, preloadRemaining };
}

const loaderCache = new Map<string, FrameLoader>();

/**
 * Returns a shared FrameLoader for this exact URL set, creating it once and
 * reusing it on every subsequent call. Without this, remounting/toggling
 * between sequences would discard every already-loaded frame and force a
 * visibly blank canvas until reloading finished. Caching by URL set means
 * returning to a previously-seen sequence resumes from whatever was
 * already loaded, typically instantly.
 */
export function getFrameLoader(urls: string[]): FrameLoader {
  const key = urls.join("|");
  const cached = loaderCache.get(key);
  if (cached) return cached;

  const loader = createFrameLoader(urls);
  loaderCache.set(key, loader);
  return loader;
}
