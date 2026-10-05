import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../animations/gsap/gsapConfig";

let activeLenis: Lenis | null = null;

/**
 * Returns the currently active Lenis instance, if the smooth-scroll
 * provider is mounted. Useful for one-off `.scrollTo()` calls from
 * navigation links, buttons, etc.
 */
export function getLenis() {
  return activeLenis;
}

export interface UseLenisOptions {
  /** Disable smooth scrolling entirely (e.g. for prefers-reduced-motion). */
  enabled?: boolean;
}

/**
 * Initializes Lenis once, ties it to GSAP's ticker (so RAF loops stay in
 * sync instead of fighting each other) and keeps ScrollTrigger's measurements
 * correct on every Lenis scroll tick. Cleans up fully on unmount and guards
 * against duplicate initialization under React StrictMode's double-invoke.
 */
export function useLenis({ enabled = true }: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // StrictMode-safe: if a previous instance is still alive, tear it down first.
    if (activeLenis) {
      activeLenis.destroy();
      activeLenis = null;
    }

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      // Duration + easing (rather than bare lerp) is what gives the
      // noticeably smooth, premium momentum feel — Lenis's raw defaults are
      // subtle enough to feel close to native scroll on most trackpads/mice.
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
