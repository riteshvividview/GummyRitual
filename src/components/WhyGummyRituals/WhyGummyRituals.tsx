import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Brain, Heart, ShieldPlus, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useBenefitsFrameSequence } from "../../animations/benefitsScroll";
import { useCursorParallax } from "../../animations/cursor/useCursorParallax";
import { useCursorParallaxGroup } from "../../animations/cursor/useCursorParallaxGroup";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { whyGummyRituals } from "../../data/whyGummyRitualsContent";
import { benefitsFrameUrls, BENEFITS_FRAME_ASPECT } from "./benefitsFrames";
import styles from "./WhyGummyRituals.module.css";

const iconMap: Record<string, LucideIcon> = {
  shieldPlus: ShieldPlus,
  trendingUp: TrendingUp,
  brain: Brain,
  zap: Zap,
  heart: Heart,
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Kids homepage section 3 — "Why Gummy Rituals?". The background is a
 * scroll-synced image sequence, same architecture as the hero
 * (scroll progress -> ScrollTrigger -> frame index -> canvas draw) but
 * never pinned — the page scrolls through this section at normal speed
 * while the frames scrub in sync (see animations/benefitsScroll.ts).
 */
export function WhyGummyRituals() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useBenefitsFrameSequence({
    sectionRef,
    canvasRef,
    frameUrls: benefitsFrameUrls,
    aspectRatio: BENEFITS_FRAME_ASPECT,
  });

  // Subtle cursor-parallax drift — "slightly move along with the cursor,
  // not completely follow" — on the CTA button and the pill tiles.
  // Targets .pillItem (the <li> wrapper) rather than .pill itself, since
  // .pill already carries the scroll-scrubbed entrance animation and the
  // zigzag offset, both of which also animate x/y; stacking a third x/y
  // tween on the exact same element would fight with those instead of
  // compositing cleanly like nested transforms do.
  const ctaRef = useCursorParallax<HTMLButtonElement>(sectionRef, { strength: 0.025, maxOffset: 10 });
  useCursorParallaxGroup(sectionRef, `.${styles.pillItem}`, { strength: 0.02, maxOffset: 12 });

  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.from(sectionRef.current.querySelectorAll(`.${styles.revealUp}`), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      // Scroll-scrubbed, not a fire-once stagger — each pill's reveal is
      // tied directly to scroll position (via the shared timeline's scrub),
      // so they visibly appear one after another as the user scrolls rather
      // than all animating together on first sight. scrub: 0.6 adds a
      // slight eased catch-up instead of snapping 1:1 to scroll position,
      // which is what reads as "smoother" here.
      const pills = sectionRef.current.querySelectorAll(`.${styles.pill}`);
      const pillTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current.querySelector(`.${styles.pillList}`),
          start: "top 85%",
          end: "bottom 55%",
          scrub: 0.6,
        },
      });
      pills.forEach((pill, index) => {
        // .from (not .fromTo) so each pill settles back at its own
        // CSS-driven zigzag offset (.pillOffset0/.pillOffset1) instead of
        // the slide-in animation overwriting it with a hardcoded x: 0.
        pillTimeline.from(pill, { opacity: 0, x: 36, ease: "power2.out", duration: 1 }, index);
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.scrimRight} aria-hidden="true" />
      {/* Mobile-only — see .scrimBottom in the CSS (display: none above
         639px). Darkens the lower portion of the photo the pills now sit
         over once they move to the bottom of the stacked mobile layout,
         so their white text stays legible without darkening the upper
         portion where the child's face is. */}
      <div className={styles.scrimBottom} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copyColumn}>
          <span className={`${styles.eyebrow} ${styles.revealUp}`}>{whyGummyRituals.eyebrow}</span>
          <h2 className={styles.headline}>
            {whyGummyRituals.headline.lines.map((line, index) => (
              <span
                key={index}
                className={`${styles.headlineLine} ${styles.revealUp} ${
                  line.accent ? styles.accent : ""
                }`}
              >
                {line.text}
              </span>
            ))}
          </h2>
          <p className={`${styles.description} ${styles.revealUp}`}>{whyGummyRituals.description}</p>

          <button
            type="button"
            ref={ctaRef}
            className={`${styles.ctaButton} ${styles.revealUp}`}
          >
            {whyGummyRituals.cta}
            <span className={styles.ctaIcon}>
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </button>
        </div>

        <ul className={styles.pillList}>
          {whyGummyRituals.benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon];
            return (
              <li key={benefit.label} className={styles.pillItem}>
                <div
                  className={`${styles.pill} ${styles[`pillOffset${index % 2}`]} ${
                    styles[`tint${capitalize(benefit.tint)}`]
                  }`}
                >
                  <span className={styles.pillIcon}>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className={styles.pillText}>
                    <span className={styles.pillLabel}>{benefit.label}</span>
                    <span className={styles.pillDescription}>{benefit.description}</span>
                  </span>
                  <span className={styles.pillArrow} aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
