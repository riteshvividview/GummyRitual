import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useIsMobile } from "../../hooks/useMediaQuery";
import styles from "./Loader.module.css";

interface LoaderProps {
  progress: number;
  isComplete: boolean;
  onExited: () => void;
}

/**
 * Full-viewport loading screen shown once per browser tab session (see
 * App.tsx / lib/preloaderSession.ts) while the critical-path image set
 * preloads. Purely presentational — knows nothing about *what* is
 * loading, just the percentage.
 */
export function Loader({ progress, isComplete, onExited }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isComplete || !rootRef.current) return;

      if (prefersReducedMotion) {
        onExited();
        return;
      }

      const fadeTargets = rootRef.current.querySelectorAll(
        `.${styles.motif}, .${styles.wordmark}, .${styles.progress}`
      );

      const tl = gsap.timeline({ onComplete: onExited });
      tl.to(fadeTargets, {
        opacity: 0,
        y: -8,
        scale: 0.94,
        duration: isMobile ? 0.3 : 0.4,
        ease: "power2.inOut",
      }).to(
        rootRef.current,
        {
          opacity: 0,
          duration: isMobile ? 0.35 : 0.5,
          ease: "power2.inOut",
        },
        isMobile ? "-=0.1" : "-=0.15"
      );
    },
    { scope: rootRef, dependencies: [isComplete] }
  );

  return (
    <div
      ref={rootRef}
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${Math.round(progress)}%`}
    >
      <div className={styles.motif} aria-hidden="true">
        <svg viewBox="0 0 64 64" className={styles.motifSvg}>
          <path
            d="M32 8c-3 0-5.5 2-6.5 5-3-1.5-6.5-.5-8.5 2-2 2.5-2 6 0 8.5-2.5 1-4.5 3.5-4.5 6.5 0 4 3.5 7.5 7.5 7.5.5 0 1 0 1.5-.2 1 3.5 4 6.2 7.8 6.7.7 1.8 2.5 3 4.7 3s4-1.2 4.7-3c3.8-.5 6.8-3.2 7.8-6.7.5.2 1 .2 1.5.2 4 0 7.5-3.5 7.5-7.5 0-3-2-5.5-4.5-6.5 2-2.5 2-6 0-8.5-2-2.5-5.5-3.5-8.5-2-1-3-3.5-5-6.5-5z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className={styles.wordmark}>
        The Gummy
        <br />
        Rituals
      </p>
      <div className={styles.progress}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <span className={styles.progressLabel}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
