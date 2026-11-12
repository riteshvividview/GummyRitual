import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { ART, type OrnamentArt } from "./art";
import styles from "./Ornament.module.css";

/**
 * Master switch for every decorative illustration on the Adults page.
 * Set to false to return the page to its pre-ornament look.
 */
export const ADULT_ORNAMENTS = true;

interface OrnamentProps {
  art: OrnamentArt;
  /** Which placement (position/size/colour) from Ornament.module.css. */
  place: "needs" | "actives" | "day" | "flavours" | "trust" | "lineup";
  /** Px the drawing drifts against the scroll (0 = none). */
  parallax?: number;
  /** Degrees it turns across its pass through the viewport (0 = none). */
  turn?: number;
}

/**
 * A decorative line illustration that sits *behind* its section's content
 * and draws itself in as the section scrolls into view. Purely visual:
 * aria-hidden, no pointer events, drawn in full under reduced motion.
 *
 * Drop one inside any positioned section/host element. The host is
 * isolated (see the :has() rule in the CSS) so the art stays under the
 * content but above the section's own background.
 */
export function Ornament({ art, place, parallax = 0, turn = 0 }: OrnamentProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const layer = ref.current;
      if (!layer || reduced) return;
      const host = layer.parentElement!;
      const figure = layer.firstElementChild!;
      const strokes = layer.querySelectorAll("[data-draw]");
      const dots = layer.querySelectorAll("[data-dot]");

      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: host, start: "top 80%", end: "top 15%", scrub: 0.8 },
      });
      tl.to(strokes, { strokeDashoffset: 0, ease: "none", duration: 0.5, stagger: { amount: 0.5 } });
      if (dots.length) {
        gsap.set(dots, { scale: 0, transformOrigin: "50% 50%" });
        tl.to(dots, { scale: 1, ease: "back.out(2)", stagger: 0.04, duration: 0.3 }, 0.5);
      }

      if (parallax || turn) {
        gsap.fromTo(
          figure,
          { y: parallax, rotate: -turn / 2 },
          {
            y: -parallax,
            rotate: turn / 2,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
    },
    { scope: ref, dependencies: [reduced] }
  );

  if (!ADULT_ORNAMENTS) return null;
  const Art = ART[art];
  return (
    <span ref={ref} className={`${styles.layer} ${styles[place]}`} aria-hidden>
      <span className={styles.figure}>
        <Art />
      </span>
    </span>
  );
}
