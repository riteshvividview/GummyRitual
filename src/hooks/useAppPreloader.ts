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

/** Resolves once the hero's default (frame 0) image has loaded or errored
 * — reuses FrameSequence.ts's own cache via getFrameLoader().get(0), so
 * KidsHero/HeroCanvas later reuse this exact decoded Image instead of
 * loading it a second time. */
function heroFirstFrameReady(): Promise<void> {
  if (orangeBearFrameUrls.length === 0) return Promise.resolve();
  const img = getFrameLoader(orangeBearFrameUrls).get(0);
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
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
