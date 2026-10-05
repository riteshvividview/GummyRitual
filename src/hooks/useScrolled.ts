import { useEffect, useState } from "react";
import type Lenis from "lenis";
import { getLenis } from "./useLenis";

/**
 * True once the page has scrolled past `threshold` — used to shrink/raise
 * the floating header rather than hide it outright (see useHideOnScroll
 * for the direction-based hide behavior; the two compose independently).
 */
export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const evaluate = (y: number) => setScrolled(y > threshold);

    const lenis = getLenis();
    if (lenis) {
      const onLenisScroll = (instance: Lenis) => evaluate(instance.scroll);
      lenis.on("scroll", onLenisScroll);
      return () => {
        lenis.off("scroll", onLenisScroll);
      };
    }

    const onWindowScroll = () => evaluate(window.scrollY);
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, [threshold]);

  return scrolled;
}
