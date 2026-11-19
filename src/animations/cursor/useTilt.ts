import { useEffect, useRef } from "react";
import { gsap } from "../gsap/gsapConfig";

interface TiltOptions {
  /** Max rotation in degrees. */
  max?: number;
  /** Extra lift in px toward the viewer while hovered. */
  lift?: number;
  /** Children with [data-depth="n"] shift by n × this many px. */
  shift?: number;
}

/**
 * Pointer tilt for a product stage: the element rotates toward the cursor
 * and [data-depth] children shift by depth, so a pack, its shadow and its
 * backdrop separate into layers. Fine-pointer only (touch gets nothing —
 * no hover-only meaning is attached), and reduced motion opts out.
 */
export function useTilt<T extends HTMLElement>({ max = 8, lift = 0, shift = 14 }: TiltOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });
    const z = gsap.quickTo(el, "z", { duration: 0.8, ease: "power3.out" });
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]")).map((node) => ({
      d: Number(node.dataset.depth) || 0,
      x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * max * 2);
      rx(-ny * max * 2);
      z(lift);
      layers.forEach((l) => {
        l.x(nx * shift * l.d);
        l.y(ny * shift * l.d);
      });
    };
    const leave = () => {
      rx(0);
      ry(0);
      z(0);
      layers.forEach((l) => {
        l.x(0);
        l.y(0);
      });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max, lift, shift]);

  return ref;
}
