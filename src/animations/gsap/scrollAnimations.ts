import { gsap, ScrollTrigger } from "./gsapConfig";

/**
 * Reusable GSAP + ScrollTrigger patterns.
 *
 * These are intentionally generic (no section-specific animation logic
 * lives here) so content and animation stay decoupled — this keeps each
 * future section portable to a Shopify `.liquid` section without dragging
 * animation code along with it.
 *
 * Every helper returns the created GSAP instance (Tween/Timeline) so
 * callers can `.revert()` / `.kill()` it during cleanup (e.g. inside a
 * useGSAP scope or a useEffect return).
 */

export interface RevealOptions {
  /** Element(s) to animate in. */
  target: gsap.TweenTarget;
  /** Element that triggers the reveal; defaults to `target`. */
  trigger?: Element | string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  start?: string;
}

/** Simple fade/slide "reveal on scroll into view" animation. */
export function createRevealAnimation({
  target,
  trigger,
  from = { autoAlpha: 0, y: 40 },
  to = { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" },
  start = "top 85%",
}: RevealOptions) {
  return gsap.fromTo(target, from, {
    ...to,
    scrollTrigger: {
      trigger: trigger ?? (target as Element | string),
      start,
      toggleActions: "play none none reverse",
    },
  });
}

export interface ParallaxOptions {
  target: gsap.TweenTarget;
  trigger?: Element | string;
  /** Distance in px the element travels across the scroll range. */
  distance?: number;
  scrub?: boolean | number;
}

/** Scroll-scrubbed parallax translation, tied to scroll progress rather than time. */
export function createParallax({
  target,
  trigger,
  distance = 100,
  scrub = true,
}: ParallaxOptions) {
  return gsap.to(target, {
    y: -distance,
    ease: "none",
    scrollTrigger: {
      trigger: trigger ?? (target as Element | string),
      start: "top bottom",
      end: "bottom top",
      scrub,
    },
  });
}

export interface PinnedSectionOptions {
  trigger: Element | string;
  /** Pixels (or "+=N") of scroll distance the pin should last for. */
  end?: string;
  pinSpacing?: boolean;
  onUpdate?: (self: ScrollTrigger) => void;
}

/** Pins a section in place while its internal timeline/progress advances. */
export function createPinnedSection({
  trigger,
  end = "+=100%",
  pinSpacing = true,
  onUpdate,
}: PinnedSectionOptions) {
  return ScrollTrigger.create({
    trigger,
    start: "top top",
    end,
    pin: true,
    pinSpacing,
    scrub: true,
    onUpdate,
  });
}

/**
 * Builds a timeline driven entirely by scroll progress (scrub), useful as
 * the base for pinned cinematic sections (product reveals, camera moves).
 * Add tweens to the returned timeline with `.to()` / `.fromTo()`.
 */
export function createScrollTimeline({
  trigger,
  start = "top top",
  end = "+=100%",
  pin = false,
  scrub = true,
}: {
  trigger: Element | string;
  start?: string;
  end?: string;
  pin?: boolean;
  scrub?: boolean | number;
}) {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end,
      pin,
      scrub,
    },
  });
}
