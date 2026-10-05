import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { getLenis } from "./useLenis";

/**
 * Direction-based header visibility: hides once the user scrolls down past
 * `hideAfter`, and reveals again on ANY upward scroll movement — even a
 * single pixel, from anywhere on the page — since scrolling up reads as
 * the user trying to get back to the header/top. Always visible near the
 * very top regardless of direction.
 */
export function useHideOnScroll(hideAfter = 80) {
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const evaluate = (y: number) => {
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y <= 4) {
        setHidden(false);
        return;
      }
      if (delta < 0) {
        // Any upward movement reveals it immediately.
        setHidden(false);
        return;
      }
      if (delta > 0 && y > hideAfter) {
        setHidden(true);
      }
    };

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
  }, [hideAfter]);

  return hidden;
}
