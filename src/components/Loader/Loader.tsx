import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useIsMobile } from "../../hooks/useMediaQuery";
import logo from "../../assets/gummyrituallogo.png";
import styles from "./Loader.module.css";

interface LoaderProps {
  progress: number;
  isComplete: boolean;
  onExited: () => void;
}

/** SVG ring geometry — viewBox is 220x220, radius chosen to leave room for
 * the stroke width without clipping. */
const RING_RADIUS = 92;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Small orange-family particles scattered around the ring — idle position
 * computed once (unit vector + radius), reused both for the resting CSS
 * position and as the direction each one bursts outward along on exit. */
const PARTICLE_COUNT = 14;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 2 === 0 ? 0.18 : -0.18);
  return {
    id: i,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    idleRadius: 6 + (i % 3) * 2.1, // rem, from center
    size: 0.2 + (i % 4) * 0.09, // rem
    opacity: 0.3 + (i % 3) * 0.22,
  };
});

/**
 * Full-viewport loading screen shown once per browser tab session (see
 * App.tsx / lib/preloaderSession.ts) while the critical-path image set
 * preloads. Purely presentational — knows nothing about *what* is
 * loading, just the percentage.
 *
 * Single accent color family throughout (orange/red), not a multi-color
 * palette. The exit choreographs three things together rather than a
 * plain fade: the ring/logo fade out, the solid backdrop collapses to a
 * point via a shrinking circular clip, and the particle field bursts
 * outward — timed to still be mid-flight after the backdrop has fully
 * cleared, so they read as flying out over the page as it's revealed
 * rather than just disappearing with the loader.
 */
export function Loader({ progress, isComplete, onExited }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const dashOffset = RING_CIRCUMFERENCE * (1 - clampedProgress / 100);

  useGSAP(
    () => {
      if (!isComplete || !rootRef.current) return;

      if (prefersReducedMotion) {
        onExited();
        return;
      }

      const root = rootRef.current;
      const contentTargets = root.querySelectorAll(`.${styles.ringWrap}, .${styles.subtitle}`);
      const ringGlow = root.querySelector(`.${styles.ringGlow}`);
      const particleEls = particlesRef.current
        ? Array.from(particlesRef.current.children)
        : [];

      // ringGlow (and every particle) has its own running CSS keyframe
      // animation — a CSS animation's live keyframe output overrides
      // inline styles every frame, so without stopping them first, GSAP's
      // tweens below would be computed but never actually visible.
      if (ringGlow) gsap.set(ringGlow, { animation: "none" });
      if (particleEls.length) gsap.set(particleEls, { animation: "none" });

      const fullRadius = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;
      gsap.set(root, { clipPath: `circle(${fullRadius}px at 50% 50%)` });

      const burstDistance = Math.max(window.innerWidth, window.innerHeight) * (isMobile ? 0.45 : 0.6);

      const tl = gsap.timeline({ onComplete: onExited });

      tl.addLabel("start")
        .to(ringGlow, { opacity: 1, scale: 1.3, duration: 0.25, ease: "power2.out" }, "start")
        .to(
          contentTargets,
          { opacity: 0, scale: 0.85, duration: isMobile ? 0.25 : 0.3, ease: "power2.inOut" },
          "start+=0.15"
        )
        .to(
          particleEls,
          {
            x: (i: number) => PARTICLES[i].dx * burstDistance,
            y: (i: number) => PARTICLES[i].dy * burstDistance,
            opacity: 0,
            scale: 0.4,
            duration: isMobile ? 0.9 : 1.1,
            stagger: 0.015,
            ease: "power2.in",
          },
          "start+=0.2"
        )
        .to(
          root,
          {
            clipPath: "circle(0px at 50% 50%)",
            duration: isMobile ? 0.65 : 0.8,
            ease: "power4.inOut",
          },
          "start+=0.35"
        );
    },
    { scope: rootRef, dependencies: [isComplete] }
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${Math.round(progress)}%`}
    >
      <span className={styles.aurora} aria-hidden="true" />
      <span className={`${styles.aurora} ${styles.auroraSecondary}`} aria-hidden="true" />

      <div className={styles.particles} ref={particlesRef} aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className={styles.particle}
            style={{
              left: `calc(50% + ${p.dx * p.idleRadius}rem)`,
              top: `calc(50% + ${p.dy * p.idleRadius}rem)`,
              width: `${p.size}rem`,
              height: `${p.size}rem`,
              marginLeft: `${-p.size / 2}rem`,
              marginTop: `${-p.size / 2}rem`,
              opacity: p.opacity,
              animationDelay: `${(p.id % 6) * 0.12}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.ringWrap}>
          <span className={styles.ringGlow} aria-hidden="true" />
          <span className={`${styles.decoRing} ${styles.decoRingOuter}`} aria-hidden="true" />
          <span className={`${styles.decoRing} ${styles.decoRingInner}`} aria-hidden="true" />
          <svg viewBox="0 0 220 220" className={styles.ringSvg} aria-hidden="true">
            <defs>
              <linearGradient id="loaderRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--kids-accent-orange-light)" />
                <stop offset="100%" stopColor="var(--kids-accent-red)" />
              </linearGradient>
            </defs>
            <circle className={styles.ringTrack} cx="110" cy="110" r={RING_RADIUS} />
            <circle
              className={styles.ringProgress}
              cx="110"
              cy="110"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className={styles.ringCenter}>
            <img src={logo} alt="The Gummy Rituals" className={styles.ringLogo} />
            <span className={styles.percent}>{Math.round(clampedProgress)}%</span>
          </div>
        </div>

        <p className={styles.subtitle}>
          Loading your experience
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </p>
      </div>
    </div>
  );
}
