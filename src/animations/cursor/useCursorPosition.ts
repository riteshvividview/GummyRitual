import { useEffect, useRef } from "react";
import { gsap } from "../gsap/gsapConfig";

/**
 * Tracks pointer position via a gsap.quickTo-driven ref, avoiding React
 * re-renders on every mousemove. Returns a ref to attach to the element
 * that should follow the cursor (a custom cursor dot, magnetic element, etc).
 *
 * Not wired into any UI yet — foundation for future cursor interactions.
 * Skipped automatically on touch-only devices since there is no cursor.
 */
export function useCursorFollow<T extends HTMLElement>() {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = targetRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const handleMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return targetRef;
}
