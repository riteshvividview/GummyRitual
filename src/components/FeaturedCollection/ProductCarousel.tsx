import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useMagneticButton } from "../../animations/cursor/useMagneticButton";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Product } from "../../data/products";
import { ProductCard } from "./ProductCard";
import { getSlotAssignments, getCardTransform } from "./circularPositions";
import styles from "./FeaturedCollection.module.css";

interface ProductCarouselProps {
  products: Product[];
}

const TRANSITION_DURATION = 0.9;
const TRANSITION_EASE = "power3.inOut";

/**
 * Products arranged on an invisible circular disc (see circularPositions.ts
 * for the actual math) — not a horizontal slider. Up to MAX_VISIBLE sit in
 * an evenly-spaced, non-overlapping row with a subtle rotateY tilt: each
 * card's translate/scale/rotateY/opacity/z-index is driven imperatively by
 * GSAP whenever the active index changes, so the whole row visibly
 * reshuffles (new product enters, one leaves) rather than one card just
 * sliding over.
 */
/** Drag distance (px) past which a release commits to the next/previous
 * card instead of snapping back to the current one. */
const DRAG_COMMIT_THRESHOLD = 60;

export function ProductCarousel({ products }: ProductCarouselProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isAnimatingRef = useRef(false);
  const isFirstRunRef = useRef(true);
  // Each card's current resting x (updated every time the main layout
  // effect below runs) — drag reads from this to follow 1:1 from
  // wherever a card actually is, and to snap back to it on a cancelled
  // drag.
  const baseXRef = useRef<Map<string, number>>(new Map());
  const dragStateRef = useRef<{ pointerId: number; startX: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isTablet = useMediaQuery("(max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 639px)");
  // Spread shrinks the whole circular arrangement toward the identity
  // transform on narrower viewports — less translation, less rotation,
  // less scale difference — rather than a separate mobile layout, per the
  // "reduce translation/rotation/scale differences to prevent clipping"
  // requirement.
  const spread = isTablet ? 0.72 : 1;
  // Three in view on desktop/tablet; mobile shows just the active card —
  // at narrow widths there isn't room for even "peeking" neighbors
  // without them clipping/overlapping, so the rest fade out entirely
  // instead (handled by circularPositions' "hidden" bucket).
  const maxVisible = isMobile ? 1 : 3;

  const total = products.length;

  // "Cursor scrub" hover — the icon drifts toward the cursor within the
  // button's bounds (see useMagneticButton), then springs back on leave.
  // Targets a nested span, not the button itself, so it doesn't fight the
  // button's own CSS :hover scale (both would otherwise write to the same
  // `transform`, and the inline style GSAP sets always wins).
  const prevIconRef = useMagneticButton<HTMLSpanElement>(0.45);
  const nextIconRef = useMagneticButton<HTMLSpanElement>(0.45);

  useEffect(() => {
    const immediate = isFirstRunRef.current || prefersReducedMotion;
    isFirstRunRef.current = false;

    const assignments = getSlotAssignments(activeIndex, total, maxVisible);
    const visibleCount = Math.min(maxVisible, total);

    products.forEach((product, index) => {
      const el = cardElsRef.current.get(product.id);
      if (!el) return;

      const assignment = assignments.get(index) ?? { slotIndex: -1, visible: false };
      const t = getCardTransform(assignment, visibleCount, spread);
      baseXRef.current.set(product.id, t.x);
      const vars = {
        x: t.x,
        y: t.y,
        scale: t.scale,
        rotate: t.rotate,
        rotationY: t.rotateY,
        opacity: t.opacity,
        filter: `blur(${t.blur}px)`,
        zIndex: t.zIndex,
        pointerEvents: t.opacity < 0.05 ? "none" : "auto",
      };

      if (immediate) {
        gsap.set(el, vars);
      } else {
        gsap.to(el, { ...vars, duration: TRANSITION_DURATION, ease: TRANSITION_EASE, overwrite: true });
      }
    });

    if (immediate) {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      return;
    }

    const release = gsap.delayedCall(TRANSITION_DURATION, () => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    });
    return () => {
      release.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, spread, maxVisible, prefersReducedMotion, total]);

  function goTo(nextIndex: number) {
    if (isAnimatingRef.current) return;
    const normalized = ((nextIndex % total) + total) % total;
    if (normalized === activeIndex) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setActiveIndex(normalized);
  }

  function goPrev() {
    goTo(activeIndex - 1);
  }

  function goNext() {
    goTo(activeIndex + 1);
  }

  // Drag-to-navigate — 1:1 follow while dragging, then either commits to
  // the next/previous card (handing off to the same GSAP transition the
  // arrow buttons use) or snaps back to the current card's resting
  // position, same pattern as a typical touch carousel.
  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isAnimatingRef.current || event.button !== 0) return;
    dragStateRef.current = { pointerId: event.pointerId, startX: event.clientX };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    cardElsRef.current.forEach((el, productId) => {
      const baseX = baseXRef.current.get(productId) ?? 0;
      gsap.set(el, { x: baseX + delta });
    });
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    dragStateRef.current = null;
    setIsDragging(false);

    if (delta <= -DRAG_COMMIT_THRESHOLD) {
      goNext();
    } else if (delta >= DRAG_COMMIT_THRESHOLD) {
      goPrev();
    } else if (!prefersReducedMotion) {
      // Below the commit threshold — ease every dragged card back to its
      // resting x (the rest of its transform was never touched).
      cardElsRef.current.forEach((el, productId) => {
        gsap.to(el, {
          x: baseXRef.current.get(productId) ?? 0,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
      });
    } else {
      cardElsRef.current.forEach((el, productId) => {
        gsap.set(el, { x: baseXRef.current.get(productId) ?? 0 });
      });
    }
  }

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.carouselRow}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={goPrev}
          disabled={isAnimating}
          aria-label="Previous product"
        >
          <span className={styles.arrowIcon} ref={prevIconRef}>
            <ChevronLeft size={22} strokeWidth={2.25} />
          </span>
        </button>

        <div
          className={`${styles.stage} ${isDragging ? styles.stageDragging : ""}`}
          ref={stageRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured products"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goPrev();
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              goNext();
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              isActive={index === activeIndex}
              onSelect={() => goTo(index)}
              cardRef={(el) => {
                if (el) cardElsRef.current.set(product.id, el);
                else cardElsRef.current.delete(product.id);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={goNext}
          disabled={isAnimating}
          aria-label="Next product"
        >
          <span className={styles.arrowIcon} ref={nextIconRef}>
            <ChevronRight size={22} strokeWidth={2.25} />
          </span>
        </button>
      </div>

      <div className={styles.pagination} role="tablist" aria-label="Select product">
        {products.map((product, index) => (
          <button
            key={product.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Show ${product.name}`}
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
