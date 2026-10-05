import { useEffect, useRef } from "react";
import { gsap } from "../gsap/gsapConfig";

/**
 * Magnetic hover: while the cursor is over the element, it eases toward
 * the cursor within its own bounds, then springs back to rest on leave.
 * Purely a hover embellishment — the element needs no special handling to
 * remain fully clickable/usable without it (keyboard users and touch
 * devices never trigger it in the first place).
 *
 * Skipped on coarse-pointer (touch) devices and under
 * prefers-reduced-motion, where the button simply stays put.
 */
export function useMagneticButton<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [strength]);

  return ref;
}
