import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { adultTogetherContent as content } from "../../../data/adults/adultSectionsContent";
import loop from "../../../assets/adults/05b-together/together-loop.mp4";
import poster from "../../../assets/adults/05b-together/together-poster.jpg";
import styles from "./BetterTogether.module.css";

/**
 * Between 05 (Day) and 06 (Texture): friends sharing gummies.
 *
 * Desktop: the section pins. The film starts as a small window between
 * the two halves of the headline; on scroll the window opens to full
 * bleed while the words part to the edges and fade, then a single
 * line settles over the film. Mobile / reduced motion: no pin — the
 * film sits full width with the copy over it.
 */
export function BetterTogether() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;
      const q = gsap.utils.selector(root);

      if (isMobile) {
        gsap.from(q("[data-film]"), {
          clipPath: "inset(8% 6% 8% 6% round 1.4rem)",
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "top 20%", scrub: 0.5 },
        });
        gsap.from(q("[data-after] > *"), {
          y: 24, autoAlpha: 0, stagger: 0.08, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 40%" },
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "+=160%", pin: true, scrub: 0.8 },
      });
      tl.fromTo(
        q("[data-film]"),
        { clipPath: "inset(31% 36% 31% 36% round 2rem)" },
        { clipPath: "inset(0% 0% 0% 0% round 0rem)", duration: 1 }
      )
        .fromTo(q("[data-video]"), { scale: 1.35 }, { scale: 1.04, duration: 1 }, 0)
        .to(q("[data-word='l']"), { xPercent: -60, autoAlpha: 0, duration: 0.7 }, 0)
        .to(q("[data-word='r']"), { xPercent: 60, autoAlpha: 0, duration: 0.7 }, 0)
        .fromTo(q("[data-shade]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6)
        .from(q("[data-after] > *"), { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" }, 0.75)
        .to({}, { duration: 0.35 }); // hold before releasing the pin
    },
    { scope: ref, dependencies: [reduced, isMobile] }
  );

  return (
    <section ref={ref} className={styles.section} aria-label={content.eyebrow}>
      <div className={styles.film} data-film>
        <video
          className={styles.video}
          data-video
          src={loop}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className={styles.shade} data-shade aria-hidden />
      </div>

      <h2 className={styles.headline} aria-hidden>
        <span data-word="l">{content.wordLeft}</span>
        <span data-word="r">{content.wordRight}</span>
      </h2>

      <div className={styles.after} data-after>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <p className={styles.line}>{content.line}</p>
        <p className={styles.sub}>{content.sub}</p>
      </div>
    </section>
  );
}
