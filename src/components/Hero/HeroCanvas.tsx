import { type RefObject } from "react";
import styles from "./HeroCanvas.module.css";

export type HeroCanvasPhase = "idle" | "out" | "zoomInStart" | "in";

const phaseClass: Record<HeroCanvasPhase, string> = {
  idle: "",
  out: styles.canvasExit,
  zoomInStart: styles.canvasEnterStart,
  in: styles.canvasEnterEnd,
};

interface HeroCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** Drives the blur-to-focus cut when swapping frame sequences — see
   * KidsHero.tsx switchToSequence for the phase sequencing. */
  phase?: HeroCanvasPhase;
}

/**
 * Purely presentational canvas element. All drawing is imperative and
 * lives in animations/heroScroll.ts — this component owns no frame logic
 * itself, so it stays trivial to reuse for a future Adult hero sequence.
 */
export function HeroCanvas({ canvasRef, phase = "idle" }: HeroCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${phaseClass[phase]}`}
      aria-hidden="true"
    />
  );
}
