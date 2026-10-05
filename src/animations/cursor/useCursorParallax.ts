import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "../gsap/gsapConfig";

interface UseCursorParallaxOptions {
  /** Fraction of the pointer's distance from the container's center applied
   * as the offset — small, since this drives a background image, not a UI
   * element chasing the cursor (see useMagneticButton for that pattern). */
  strength?: number;
  /** Clamps the offset so the image never pans far enough to reveal an
   * edge — keep this within whatever overscan the image's own
   * transform: scale() already provides. */
  maxOffset?: number;
}

/**
 * Subtle cursor-parallax: while the pointer moves within containerRef, the
 * returned ref's element eases toward an offset proportional to the
 * pointer's position relative to the container's center, and back to rest
 * on pointer leave. Skipped on coarse-pointer (touch) devices and under
 * prefers-reduced-motion, where the element simply stays put.
 */
export function useCursorParallax<T extends HTMLElement>(
  containerRef: RefObject<HTMLElement | null>,
  { strength = 0.04, maxOffset = 24 }: UseCursorParallaxOptions = {}
) {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const el = targetRef.current;
    if (!container || !el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });

    const handleMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      xTo(gsap.utils.clamp(-maxOffset, maxOffset, relX * strength));
      yTo(gsap.utils.clamp(-maxOffset, maxOffset, relY * strength));
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef, strength, maxOffset]);

  return targetRef;
}
