import { useEffect, useState } from "react";

export interface PreloadResult {
  loaded: number;
  total: number;
  failed: string[];
}

interface PreloadImagesOptions {
  onProgress?: (loaded: number, total: number) => void;
  /** Per-image cap so one slow/broken asset can never hang the whole
   * loader — it just counts as "settled" and the bar moves on. */
  perImageTimeoutMs?: number;
}

/**
 * Loads every URL via a plain `Image()` (same approach as
 * Hero/FrameSequence.ts) and resolves once all of them have settled —
 * loaded, errored, or timed out. Never rejects: a broken image is a
 * reason to log a warning, not to block the site from ever appearing.
 */
export function preloadImages(
  urls: string[],
  { onProgress, perImageTimeoutMs = 8000 }: PreloadImagesOptions = {}
): Promise<PreloadResult> {
  const total = urls.length;
  if (total === 0) {
    onProgress?.(0, 0);
    return Promise.resolve({ loaded: 0, total: 0, failed: [] });
  }

  let settledCount = 0;
  const failed: string[] = [];

  const settleOne = (url: string, ok: boolean): Promise<void> =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";

      const finish = () => {
        if (!ok) failed.push(url);
        settledCount += 1;
        onProgress?.(settledCount, total);
        resolve();
      };

      const timer = window.setTimeout(finish, perImageTimeoutMs);

      img.addEventListener(
        "load",
        () => {
          window.clearTimeout(timer);
          ok = true;
          finish();
        },
        { once: true }
      );
      img.addEventListener(
        "error",
        () => {
          window.clearTimeout(timer);
          ok = false;
          finish();
        },
        { once: true }
      );

      img.src = url;
    });

  return Promise.all(urls.map((url) => settleOne(url, false))).then(() => {
    if (failed.length > 0) {
      console.warn("[preloader] failed to load", failed.length, "of", total, "images:", failed);
    }
    return { loaded: total - failed.length, total, failed };
  });
}

interface UseImagePreloaderResult {
  progress: number;
  isComplete: boolean;
}

/**
 * React wrapper around preloadImages — runs once per distinct `urls` list,
 * StrictMode-double-invoke-safe (same guard shape as useLenis/FrameSequence).
 */
export function useImagePreloader(urls: string[], skip = false): UseImagePreloaderResult {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (skip) return;

    let cancelled = false;
    preloadImages(urls, {
      onProgress: (loaded) => {
        if (!cancelled) setLoadedCount(loaded);
      },
    }).then(() => {
      if (!cancelled) setIsComplete(true);
    });

    return () => {
      cancelled = true;
    };
  }, [urls, skip]);

  const total = urls.length;
  const progress = total === 0 ? 100 : Math.round((loadedCount / total) * 100);

  return { progress, isComplete: skip ? true : isComplete };
}
