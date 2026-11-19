import { useEffect, useState } from "react";
import { getFrameLoader, orangeBearFrameUrls } from "../components/Hero/FrameSequence";
import { criticalPreloadImages } from "../data/criticalPreloadImages";
import { preloadImages } from "./useImagePreloader";

interface UseAppPreloaderOptions {
  /** Skip the whole preload (e.g. the loader already ran this session). */
  skip?: boolean;
}

interface UseAppPreloaderResult {
  progress: number;
  isComplete: boolean;
}

/** Resolves once document fonts have settled, or immediately if the API
 * isn't available/supported — never hangs the loader on a missing API. */
function fontsReady(): Promise<void> {
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (!fonts?.ready) return Promise.resolve();
  return fonts.ready.then(() => undefined).catch(() => undefined);
}

/** Resolves once the hero's key frames (every 8th, ~16 frames) have
 * loaded or errored. With these in, the scroll scrub already spans the
 * whole hero animation the moment the page is revealed — the frames in
 * between stream in after (coarse-to-fine, see frameLoader.ts). Reuses the
 * shared loader cache, so the hero never fetches these twice. */
function heroFirstFrameReady(): Promise<void> {
  if (orangeBearFrameUrls.length === 0) return Promise.resolve();
  const loader = getFrameLoader(orangeBearFrameUrls);
  const keys: number[] = [];
  for (let i = 0; i < loader.total; i += 8) keys.push(i);
  return Promise.all(
    keys.map((i) => {
      const img = loader.get(i);
      if (img.complete) return undefined;
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    })
  ).then(() => undefined);
}

/**
 * Combines the critical-path image list, the hero's first frame, and font
 * readiness into one progress percentage — the single source the app
 * loader (components/Loader) renders.
 */
export function useAppPreloader({ skip = false }: UseAppPreloaderOptions = {}): UseAppPreloaderResult {
  const [settledUnits, setSettledUnits] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // +2 units: the hero frame-0 wait and the font-readiness wait, counted
  // alongside the flat image list so the bar reflects all three sources.
  const totalUnits = criticalPreloadImages.length + 2;

  useEffect(() => {
    if (skip) return;

    // Standard effect-cancellation (not a "has it started" ref) — under
    // StrictMode's dev double-invoke, the first run's results are
    // discarded via `cancelled` and the second run does the real work.
    // Letting both runs actually fetch is harmless (the browser serves
    // the second from its own HTTP cache almost instantly) and avoids a
    // ref-guard permanently blocking the second run from ever starting.
    let cancelled = false;
    const bump = () => {
      if (!cancelled) setSettledUnits((count) => count + 1);
    };

    Promise.all([
      preloadImages(criticalPreloadImages, { onProgress: bump }),
      heroFirstFrameReady().then(bump),
      fontsReady().then(bump),
    ]).then(() => {
      if (!cancelled) setIsComplete(true);
    });

    return () => {
      cancelled = true;
    };
  }, [skip]);

  const progress = totalUnits === 0 ? 100 : Math.round((settledUnits / totalUnits) * 100);

  return { progress: skip ? 100 : Math.min(progress, 100), isComplete: skip ? true : isComplete };
}
