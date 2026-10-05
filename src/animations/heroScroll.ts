import { useEffect, useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, gsap } from "./gsap/gsapConfig";
import { getFrameLoader, type FrameLoader } from "../components/Hero/FrameSequence";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useIsMobile, useMediaQuery } from "../hooks/useMediaQuery";

/**
 * Architecture:
 *
 *   User Scroll -> Lenis (smooth scroll) -> GSAP ScrollTrigger
 *     -> scroll progress [0, 1] -> frame index -> canvas.drawImage
 *
 * Frame rendering is entirely imperative (canvas + refs), never React
 * state, so scrolling never triggers a React re-render.
 *
 * The pinned ScrollTrigger is created once (recreated only if the
 * reduced-motion preference or mobile/desktop breakpoint changes) and is
 * intentionally decoupled from *which* frame sequence is active — the
 * active FrameLoader lives in a ref that a separate effect swaps in place.
 * Tearing the pin down and rebuilding it every time the caller swaps frame
 * sets (e.g. red bear -> blue bear) is fragile: GSAP can measure the new
 * pin against a not-yet-settled spacer mid-teardown, producing a wildly
 * oversized spacer that pushes the whole section down the page.
 */

const MAX_DPR = 2;
/** How much extra scroll distance (in viewport heights) the sequence plays out over. */
const SCROLL_LENGTH_VH = { desktop: 3.5, mobile: 2.25 };
/** Scroll progress (of the pinned sequence) past which the copy hides.
 * This is a threshold, not a scrub range — crossing it plays a fixed-
 * duration reveal/hide tween rather than tying opacity directly to scroll
 * position, and crossing back the other way reverses it. */
const COPY_FADE_THRESHOLD = 0.12;
const COPY_FADE_DURATION = 0.3;
/** Scroll progress (of the pinned sequence) over which the product/CTA
 * block eases down to its settled bottom position — it never fades, just
 * translates and then holds there for the rest of the scrub. */
const PRODUCT_SETTLE_PROGRESS = 0.3;
/** Clearance kept between the settled block and the section's bottom edge.
 * Larger below 1024px, where the benefit panel switches to its bottom-
 * center compact layout (see HeroDecor.module.css's .benefitPanelCompact,
 * gated at the same width in KidsHero.tsx) — the settled product block
 * needs to clear it vertically instead of just sitting beside it. */
const PRODUCT_SETTLE_BOTTOM_GAP = { desktop: 32, compactPanel: 140 };

export interface UseHeroFrameSequenceOptions {
  sectionRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Optional copy block that fades in on load, then fades out as the user
   * scrubs deeper into the pinned sequence so the product animation gets
   * full visual focus by the end. */
  copyRef?: RefObject<HTMLElement | null>;
  /** Optional product title + CTA block. Unlike copyRef, this never fades —
   * it eases down to a settled position near the bottom of the hero and
   * stays there for the rest of the scrub. */
  productRef?: RefObject<HTMLElement | null>;
  /** Optional mobile-only white scrim over the canvas — fades out in sync
   * with copyRef crossing COPY_FADE_THRESHOLD (boosted opacity while the
   * text is visible, cleared once it's hidden so the bg frames show
   * through). Never animated on desktop; see KidsHero.module.css. */
  scrimRef?: RefObject<HTMLElement | null>;
  frameUrls: string[];
  aspectRatio: number;
}

export function useHeroFrameSequence({
  sectionRef,
  canvasRef,
  copyRef,
  productRef,
  scrimRef,
  frameUrls,
  aspectRatio,
}: UseHeroFrameSequenceOptions) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  // Matches the benefit panel's own compact breakpoint (see KidsHero.tsx) —
  // not the same as isMobile, which gates frame-count/scroll-length instead.
  const isCompactPanel = useMediaQuery("(max-width: 1023px)");
  const currentIndexRef = useRef(0);
  const loaderRef = useRef<FrameLoader | null>(null);
  const drawFrameRef = useRef<(index: number) => void>(() => {});

  // Mobile devices get every other frame to roughly halve decode/memory cost
  // while keeping the animation intact (per architecture requirement: never
  // drop the animation outright on mobile, only lighten it).
  const activeUrls = isMobile ? frameUrls.filter((_, i) => i % 2 === 0) : frameUrls;
  const urlsKey = activeUrls.join("|");

  useGSAP(
    () => {
      const section = sectionRef.current;
      const canvas = canvasRef.current;
      if (!section || !canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let isMounted = true;

      const copyEl = copyRef?.current ?? null;
      const scrimEl = scrimRef?.current ?? null;
      if (copyEl) {
        if (prefersReducedMotion) {
          gsap.set(copyEl, { opacity: 1, y: 0 });
        } else {
          gsap.fromTo(
            copyEl,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.15 }
          );
        }
      }

      // Entrance and product-switch animations for this element live in
      // KidsHero.tsx (staggered title/CTA reveal, and a fade synced to the
      // canvas's blur-to-focus cut) — this hook only owns its scroll-driven
      // settle position, never its opacity, so the two don't fight over the
      // same properties.
      const productEl = productRef?.current ?? null;
      let productSettleY = 0;
      const measureProductSettle = () => {
        if (!productEl) return;
        const sectionRect = section.getBoundingClientRect();
        const productRect = productEl.getBoundingClientRect();
        const currentY = Number(gsap.getProperty(productEl, "y")) || 0;
        const restingBottom = productRect.bottom - currentY;
        const bottomGap = isCompactPanel
          ? PRODUCT_SETTLE_BOTTOM_GAP.compactPanel
          : PRODUCT_SETTLE_BOTTOM_GAP.desktop;
        productSettleY = Math.max(0, sectionRect.bottom - restingBottom - bottomGap);
      };

      const drawFrame = (index: number) => {
        const canvasEl = canvasRef.current;
        const loader = loaderRef.current;
        if (!canvasEl || !isMounted || !loader) return;
        currentIndexRef.current = index;

        let sourceIndex = index;
        if (!loader.isLoaded(index)) {
          loader.get(index); // kick off loading even if we can't show it yet
          const nearest = loader.nearestLoaded(index);
          if (nearest === -1) return;
          sourceIndex = nearest;
        }

        const img = loader.get(sourceIndex);
        const cw = canvasEl.width;
        const ch = canvasEl.height;
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
      drawFrameRef.current = drawFrame;

      const resizeCanvas = () => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const rect = canvasEl.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvasEl.width = Math.max(1, Math.round(rect.width * dpr));
        canvasEl.height = Math.max(1, Math.round(rect.height * dpr));
        drawFrame(currentIndexRef.current);
        measureProductSettle();
      };

      // Prefetch a small window ahead of the current frame so fast scrubbing
      // doesn't outrun the loader.
      function prefetchAhead(index: number) {
        const loader = loaderRef.current;
        if (!loader) return;
        for (let i = index + 1; i <= index + 6 && i < loader.total; i++) {
          loader.get(i);
        }
      }

      // Size the drawing buffer immediately so the canvas never briefly
      // renders at its 300x150 default (which would stretch/blur under the
      // 100%-cover CSS size) before the first ResizeObserver callback fires.
      resizeCanvas();

      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(section);

      if (prefersReducedMotion) {
        // Static, representative frame — no pin, no scroll takeover.
        return () => {
          isMounted = false;
          resizeObserver.disconnect();
        };
      }

      const scrollLength = isMobile ? SCROLL_LENGTH_VH.mobile : SCROLL_LENGTH_VH.desktop;

      // Tracks which side of the threshold the copy (and mobile scrim) are
      // currently animated toward, so onUpdate only fires a new tween on an
      // actual crossing — not a scroll-synced interpolation.
      let copyVisible = true;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * scrollLength}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          const loader = loaderRef.current;
          if (!loader) return;
          const index = Math.round(self.progress * (loader.total - 1));
          prefetchAhead(index);
          drawFrame(index);

          if (copyEl || scrimEl) {
            const shouldBeVisible = self.progress < COPY_FADE_THRESHOLD;
            if (shouldBeVisible !== copyVisible) {
              copyVisible = shouldBeVisible;
              if (copyEl) {
                gsap.to(copyEl, {
                  opacity: shouldBeVisible ? 1 : 0,
                  y: shouldBeVisible ? 0 : -24,
                  duration: COPY_FADE_DURATION,
                  ease: "power2.out",
                  overwrite: true,
                });
              }
              if (scrimEl && isMobile) {
                gsap.to(scrimEl, {
                  opacity: shouldBeVisible ? 1 : 0,
                  duration: COPY_FADE_DURATION,
                  ease: "power2.out",
                  overwrite: true,
                });
              }
            }
          }

          if (productEl) {
            // Never fades — eases toward its settled bottom position and
            // holds there (clamped) for the remainder of the scrub.
            const t = gsap.utils.clamp(0, 1, self.progress / PRODUCT_SETTLE_PROGRESS);
            gsap.set(productEl, { y: t * productSettleY });
          }
        },
      });

      return () => {
        isMounted = false;
        resizeObserver.disconnect();
      };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, isMobile, isCompactPanel] }
  );

  // Swaps the active loader whenever the requested URL set changes —
  // entirely independent of the pin/ScrollTrigger above, so switching frame
  // sequences never touches pin measurements or spacer layout.
  useEffect(() => {
    if (activeUrls.length === 0) return;

    const loader = getFrameLoader(activeUrls);
    loaderRef.current = loader;
    if (!prefersReducedMotion) loader.preloadRemaining();

    const targetFrame = prefersReducedMotion
      ? Math.floor(loader.total * 0.4)
      : currentIndexRef.current;

    let cancelled = false;
    loader.ready().then(() => {
      if (cancelled || loaderRef.current !== loader) return;
      drawFrameRef.current(targetFrame);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsKey, prefersReducedMotion]);
}

export { gsap };
