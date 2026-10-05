import { useEffect, type RefObject } from "react";
import { gsap } from "../gsap/gsapConfig";

interface UseCursorParallaxGroupOptions {
  /** Fraction of the pointer's distance from the container's center applied
   * as the offset — see useCursorParallax for the single-element version
   * of this same pattern. */
  strength?: number;
  /** Clamps the offset so elements never drift far — this is a premium
   * hint of motion, not a drag-toward-cursor effect. */
  maxOffset?: number;
}

/**
 * Same idea as useCursorParallax, but for a group of elements queried by
 * selector within containerRef — useful for elements rendered from
 * .map() where individual refs aren't practical. Each element gets its own
 * eased quickTo tween toward an offset proportional to the pointer's
 * position relative to the container's center, and back to rest on
 * pointer leave. Skipped on coarse-pointer devices and under
 * prefers-reduced-motion.
 */
export function useCursorParallaxGroup(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  { strength = 0.025, maxOffset = 14 }: UseCursorParallaxGroupOptions = {}
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    const tweens = elements.map((el) => ({
      xTo: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" }),
      yTo: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" }),
    }));

    const handleMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      const x = gsap.utils.clamp(-maxOffset, maxOffset, relX * strength);
      const y = gsap.utils.clamp(-maxOffset, maxOffset, relY * strength);
      tweens.forEach(({ xTo, yTo }) => {
        xTo(x);
        yTo(y);
      });
    };

    const handleLeave = () => {
      tweens.forEach(({ xTo, yTo }) => {
        xTo(0);
        yTo(0);
      });
    };

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef, selector, strength, maxOffset]);
}
