import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, gsap } from "./gsap/gsapConfig";
import { useReducedMotion } from "../hooks/useReducedMotion";

const MAX_DPR = 2;
/** How many frames ahead of the current one to kick off loading, so normal
 * scroll speed doesn't outrun decoding. */
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
 */
export function useBenefitsFrameSequence({
  sectionRef,
  canvasRef,
  frameUrls,
  aspectRatio,
}: UseBenefitsFrameSequenceOptions) {
  const prefersReducedMotion = useReducedMotion();
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const loadedRef = useRef<boolean[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas || frameUrls.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      imagesRef.current = new Array(frameUrls.length);
      loadedRef.current = new Array(frameUrls.length).fill(false);

      const getImage = (index: number) => {
        const existing = imagesRef.current[index];
        if (existing) return existing;
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrls[index];
        img.addEventListener(
          "load",
          () => {
            loadedRef.current[index] = true;
          },
          { once: true }
        );
        imagesRef.current[index] = img;
        return img;
      };

      const nearestLoaded = (index: number) => {
        if (loadedRef.current[index]) return index;
        for (let offset = 1; offset < frameUrls.length; offset++) {
          const down = index - offset;
          if (down >= 0 && loadedRef.current[down]) return down;
          const up = index + offset;
          if (up < frameUrls.length && loadedRef.current[up]) return up;
        }
        return -1;
      };

      let currentIndex = 0;

      const drawFrame = (index: number) => {
        currentIndex = index;
        let sourceIndex = index;
        if (!loadedRef.current[index]) {
          getImage(index); // kick off loading even if we can't show it yet
          const nearest = nearestLoaded(index);
          if (nearest === -1) return;
          sourceIndex = nearest;
        }

        const img = getImage(sourceIndex);
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
          getImage(i);
        }
      };

      const firstImage = getImage(0);

      if (prefersReducedMotion) {
        // Static, representative frame — no scroll-driven scrubbing.
        const targetFrame = Math.floor((frameUrls.length - 1) * 0.4);
        const draw = () => drawFrame(targetFrame);
        if (firstImage.complete) draw();
        else firstImage.addEventListener("load", draw, { once: true });
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
