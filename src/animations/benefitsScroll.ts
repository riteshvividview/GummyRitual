import { useEffect, useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, gsap } from "./gsap/gsapConfig";
import { getFrameLoader, type FrameLoader } from "./frameLoader";
import { useReducedMotion } from "../hooks/useReducedMotion";

const MAX_DPR = 2;
/** How many frames ahead of the current one to kick off loading during
 * active scroll, on top of whatever preloadRemaining has already warmed
 * in the background — so even a frame outside that window never waits on
 * a cold request. */
const PREFETCH_AHEAD = 8;

export interface UseBenefitsFrameSequenceOptions {
  sectionRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  frameUrls: string[];
  aspectRatio: number;
}

/**
 * Non-pinned scroll-synced background image sequence for the
 * "Why Gummy Rituals?" section. Unlike useHeroFrameSequence, this never
 * pins the section — the page scrolls through it at normal speed, and the
 * frame index is simply mapped to how far the section has scrolled through
 * the viewport (scroll progress -> ScrollTrigger -> frame index -> canvas
 * draw, same architecture as the hero, just without the pin/spacer).
 *
 * Uses the same shared FrameLoader as the hero (see animations/frameLoader.ts)
 * so this sequence gets the same background preloadRemaining() behavior —
 * started as soon as this component mounts (not gated on scrolling into
 * view), which is what gives the first scroll through this section a real
 * head start instead of loading frames cold, one scroll-tick at a time.
 */
export function useBenefitsFrameSequence({
  sectionRef,
  canvasRef,
  frameUrls,
  aspectRatio,
}: UseBenefitsFrameSequenceOptions) {
  const prefersReducedMotion = useReducedMotion();
  const loaderRef = useRef<FrameLoader | null>(null);
  const urlsKey = frameUrls.join("|");

  // Starts background preloading immediately on mount, independent of the
  // ScrollTrigger/canvas effect below — mirrors heroScroll.ts's own
  // useEffect for the same reason (never gate the background fetch behind
  // scroll-into-view; the whole point is a head start before the user gets
  // there).
  useEffect(() => {
    if (frameUrls.length === 0 || prefersReducedMotion) return;
    const loader = getFrameLoader(frameUrls);
    loaderRef.current = loader;
    loader.preloadRemaining();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsKey, prefersReducedMotion]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas || frameUrls.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const loader = getFrameLoader(frameUrls);
      loaderRef.current = loader;

      let currentIndex = 0;

      const drawFrame = (index: number) => {
        currentIndex = index;
        let sourceIndex = index;
        if (!loader.isLoaded(index)) {
          loader.get(index); // kick off loading even if we can't show it yet
          const nearest = loader.nearestLoaded(index);
          if (nearest === -1) return;
          sourceIndex = nearest;
        }

        const img = loader.get(sourceIndex);
        const cw = canvas.width;
        const ch = canvas.height;
        const canvasRatio = cw / ch;

        let sx: number;
        let sy: number;
        let sw: number;
        let sh: number;
        if (aspectRatio > canvasRatio) {
          sh = img.naturalHeight;
          sw = sh * canvasRatio;
          sx = (img.naturalWidth - sw) / 2;
          sy = 0;
        } else {
          sw = img.naturalWidth;
          sh = sw / canvasRatio;
          sx = 0;
          sy = (img.naturalHeight - sh) / 2;
        }

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      };

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        drawFrame(currentIndex);
      };

      resizeCanvas();
      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(section);

      const prefetchAhead = (index: number) => {
        for (let i = index + 1; i <= index + PREFETCH_AHEAD && i < frameUrls.length; i++) {
          loader.get(i);
        }
      };

      if (prefersReducedMotion) {
        // Static, representative frame — no scroll-driven scrubbing.
        const targetFrame = Math.floor((frameUrls.length - 1) * 0.4);
        loader.ready().then(() => drawFrame(targetFrame));
        return () => resizeObserver.disconnect();
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        pin: false,
        onUpdate: (self) => {
          const index = Math.round(self.progress * (frameUrls.length - 1));
          prefetchAhead(index);
          drawFrame(index);
        },
      });

      return () => {
        resizeObserver.disconnect();
        trigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, frameUrls] }
  );
}

export { gsap };
