import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../gsap/gsapConfig";

export interface ScrollSequenceOptions {
  /** Container element that defines the pinned scroll range for this sequence. */
  trigger: React.RefObject<Element | null>;
  /** Canvas to draw each frame into. */
  canvas: React.RefObject<HTMLCanvasElement | null>;
  /** Ordered frame image sources (e.g. Blender-rendered PNG/WebP sequence). */
  frameUrls: string[];
  /** How long (in scroll distance) the sequence should play out, e.g. "+=300%". */
  end?: string;
  /** Pin the trigger element while the sequence plays. */
  pin?: boolean;
}

/**
 * Drives a canvas-rendered image sequence from scroll progress:
 *
 *   scroll progress -> GSAP ScrollTrigger -> frame index -> canvas draw
 *
 * This is the architectural seam for future Blender-rendered cinematic
 * sequences (pouch opening, product rotation, camera moves). Frames are
 * preloaded once, then drawn synchronously as ScrollTrigger reports
 * progress — no frame-by-frame tweening, so it stays perfectly locked to
 * scroll position regardless of scroll speed or direction.
 *
 * Intentionally not wired into any section yet.
 */
export function useScrollSequence({
  trigger,
  canvas,
  frameUrls,
  end = "+=300%",
  pin = true,
}: ScrollSequenceOptions) {
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (!trigger.current || !canvas.current || frameUrls.length === 0) return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    let isCancelled = false;
    imagesRef.current = frameUrls.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
      const canvasEl = canvas.current;
      if (!img || !canvasEl || !img.complete) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
    };

    const state = { frame: 0 };
    const tween = gsap.to(state, {
      frame: frameUrls.length - 1,
      ease: "none",
      snap: "frame",
      onUpdate: () => drawFrame(Math.round(state.frame)),
      scrollTrigger: {
        trigger: trigger.current,
        start: "top top",
        end,
        scrub: true,
        pin,
      },
    });

    imagesRef.current[0].onload = () => drawFrame(0);

    return () => {
      isCancelled = true;
      tween.scrollTrigger?.kill();
      tween.kill();
      if (isCancelled) imagesRef.current = [];
    };
  }, [trigger, canvas, frameUrls, end, pin]);
}

export { ScrollTrigger };
