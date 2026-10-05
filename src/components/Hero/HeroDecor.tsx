import { useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { Leaf } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { kidsHero } from "../../data/heroContent";
import orangeBear from "../../assets/homepage/01-hero/images/orange-bear.png";
import pinkBear from "../../assets/homepage/01-hero/images/pink-bear.png";
import greenBear from "../../assets/homepage/01-hero/images/green-bear.png";
import blueBear from "../../assets/homepage/01-hero/images/blue-bear.png";
import styles from "./HeroDecor.module.css";

const bearImage: Record<string, string> = {
  orange: orangeBear,
  pink: pinkBear,
  green: greenBear,
  blue: blueBear,
};

/** Square-container fill for each bear on hover, and permanently while it's
 * the active hero sequence. */
const bearSquareColor: Record<string, string> = {
  orange: "#FDD7B5",
  pink: "#FBCEDD",
  green: "#D6EFBC",
  blue: "#C2E2FB",
};

/** Bounds for each of the 8 corner values — wide enough that every pick
 * feels genuinely different, not a cycle through a handful of presets. */
const BLOB_MIN = 20;
const BLOB_MAX = 80;
/** Matches KidsHero.tsx's BLUR_IN_MS — the morph must land exactly when the
 * canvas finishes racking back into focus, never keep animating after. */
const BLOB_MORPH_DURATION = 0.5;

function randomBlobValue() {
  return Math.round(BLOB_MIN + Math.random() * (BLOB_MAX - BLOB_MIN));
}

/** Generates a fresh random blob border-radius every call — true
 * randomness rather than a fixed palette, so it never visibly repeats. */
function generateBlobShape() {
  const h = Array.from({ length: 4 }, randomBlobValue);
  const v = Array.from({ length: 4 }, randomBlobValue);
  return `${h[0]}% ${h[1]}% ${h[2]}% ${h[3]}% / ${v[0]}% ${v[1]}% ${v[2]}% ${v[3]}%`;
}

interface SectionIndicatorProps {
  /** Smaller scale for narrow viewports (see HeroDecor.module.css). */
  compact?: boolean;
  /** Which product's on-pack benefits to display. */
  activeBear: string;
}

export function SectionIndicator({ compact = false, activeBear }: SectionIndicatorProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const benefits = kidsHero.productBenefits[activeBear as keyof typeof kidsHero.productBenefits];

  // Re-stagger the benefit list in every time the active product changes
  // (this also covers the initial mount, since the effect always runs once
  // regardless of dependency values).
  useGSAP(
    () => {
      if (prefersReducedMotion || !listRef.current) return;
      const items = listRef.current.querySelectorAll(`.${styles.sectionItem}`);
      gsap.fromTo(
        items,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.07, overwrite: true }
      );
    },
    { dependencies: [activeBear], scope: listRef }
  );

  // Morphs the eyebrow badge into a fresh random blob shape — on initial
  // mount (page load) and again every time the active product changes
  // (this single effect covers both, since it always runs once on mount
  // in addition to firing on every dependency change). Duration is capped
  // to land exactly as the canvas's blur-in fade finishes — the shape must
  // only be changing *while* the background is still fading into focus,
  // never keep morphing after it's already sharp/settled.
  useGSAP(
    () => {
      if (!eyebrowRef.current) return;
      const nextShape = generateBlobShape();

      if (prefersReducedMotion) {
        gsap.set(eyebrowRef.current, { borderRadius: nextShape });
      } else {
        gsap.to(eyebrowRef.current, {
          borderRadius: nextShape,
          duration: BLOB_MORPH_DURATION,
          ease: "power2.inOut",
        });
      }
    },
    { dependencies: [activeBear], scope: eyebrowRef }
  );

  return (
    <div
      className={`${styles.sideIndicator} ${compact ? styles.sideIndicatorCompact : ""}`}
      aria-hidden="true"
    >
      <div
        className={`${styles.sideEyebrow} ${compact ? styles.sideEyebrowCompact : ""}`}
        ref={eyebrowRef}
      >
        <Leaf size={compact ? 14 : 18} strokeWidth={1.75} className={styles.sideEyebrowIcon} />
        <p>{kidsHero.sideEyebrow}</p>
      </div>
      <ol className={styles.sectionList} ref={listRef}>
        {benefits?.map((label) => (
          <li
            key={label}
            className={`${styles.sectionItem} ${compact ? styles.sectionItemCompact : ""}`}
          >
            <span className={`${styles.sectionDot} ${compact ? styles.sectionDotCompact : ""}`} />
            <span className={`${styles.sectionLabel} ${compact ? styles.sectionLabelCompact : ""}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface BenefitPanelProps {
  /** Which bear's sequence is currently showing in the hero — that benefit
   * stays highlighted (colored square + zoomed bear) even without hovering. */
  activeBear?: string;
  /** Smaller scale + bottom-center placement for narrow viewports, instead
   * of the desktop bottom-right card (see HeroDecor.module.css). */
  compact?: boolean;
  onSelectBenefit?: (label: string) => void;
}

export function BenefitPanel({ activeBear, compact = false, onSelectBenefit }: BenefitPanelProps) {
  const [hoveredBear, setHoveredBear] = useState<string | null>(null);
  // Hover previews take priority; otherwise the panel reflects whichever
  // bear's sequence is actually active.
  const panelColor = bearSquareColor[hoveredBear ?? activeBear ?? ""];

  return (
    <div
      className={`${styles.benefitPanel} ${compact ? styles.benefitPanelCompact : ""}`}
      style={panelColor ? ({ "--panel-bg": panelColor } as CSSProperties) : undefined}
    >
      {kidsHero.benefits.map((benefit) => {
        const isActive = benefit.bear === activeBear;
        return (
          <button
            type="button"
            className={`${styles.benefitItem} ${compact ? styles.benefitItemCompact : ""} ${
              isActive ? styles.benefitItemActive : ""
            }`}
            key={benefit.label}
            style={{ "--square-bg": bearSquareColor[benefit.bear] } as CSSProperties}
            onClick={() => onSelectBenefit?.(benefit.label)}
            onMouseEnter={() => setHoveredBear(benefit.bear)}
            onMouseLeave={() => setHoveredBear(null)}
            onFocus={() => setHoveredBear(benefit.bear)}
            onBlur={() => setHoveredBear(null)}
          >
            <span className={`${styles.benefitSquare} ${compact ? styles.benefitSquareCompact : ""}`}>
              <span
                className={`${styles.benefitIcon} ${compact ? styles.benefitIconCompact : ""} ${
                  styles[`bear${capitalize(benefit.bear)}`]
                }`}
              >
                <img src={bearImage[benefit.bear]} alt="" className={styles.benefitBear} />
              </span>
            </span>
            <span className={`${styles.benefitLabel} ${compact ? styles.benefitLabelCompact : ""}`}>
              {benefit.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
