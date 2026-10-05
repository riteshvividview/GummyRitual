import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { HeroCanvas, type HeroCanvasPhase } from "./HeroCanvas";
import { BenefitPanel, SectionIndicator } from "./HeroDecor";
import {
  orangeBearFrameUrls,
  pinkBearFrameUrls,
  greenBearFrameUrls,
  blueBearFrameUrls,
  KIDS_HERO_FRAME_ASPECT,
} from "./FrameSequence";
import { useHeroFrameSequence } from "../../animations/heroScroll";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useMagneticButton } from "../../animations/cursor/useMagneticButton";
import { useIsMobile, useMediaQuery } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { getLenis } from "../../hooks/useLenis";
import { kidsHero } from "../../data/heroContent";
import styles from "./KidsHero.module.css";

const accentClass = {
  orange: styles.accentOrange,
  red: styles.accentRed,
} as const;

type HeroSequence = "orange" | "pink" | "green" | "blue";

/** Each benefit maps to its own frame sequence explicitly — this is not a
 * toggle, so clicking a benefit always shows its sequence regardless of
 * what's active now. */
const benefitSequence: Record<string, HeroSequence> = {
  "Immune Support": "orange",
  "Healthy Growth": "pink",
  "Better Focus": "green",
  "Active Lifestyle": "blue",
};

const sequenceFrameUrls: Record<HeroSequence, string[]> = {
  orange: orangeBearFrameUrls,
  pink: pinkBearFrameUrls,
  green: greenBearFrameUrls,
  blue: blueBearFrameUrls,
};

const sequenceThemeClass: Record<HeroSequence, string> = {
  orange: "",
  pink: styles.themePink,
  green: styles.themeGreen,
  blue: styles.themeBlue,
};

/** Matches HeroCanvas.module.css .canvasExit transition duration. */
const BLUR_OUT_MS = 300;
/** Matches HeroCanvas.module.css .canvasEnterEnd transition duration. */
const BLUR_IN_MS = 500;

/**
 * Kids homepage hero: a scroll-driven canvas image sequence (see
 * animations/heroScroll.ts) with HTML/CSS content overlaid on top. The
 * animation frames already contain the product/packaging composition —
 * this component only adds the surrounding site UI.
 */
export function KidsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const productContentRef = useRef<HTMLDivElement>(null);
  const productTitleRef = useRef<HTMLParagraphElement>(null);
  const productCtaRowRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();
  // The benefit panel always renders — never hidden — but switches to a
  // compact bottom-center layout below tablet width instead of the desktop
  // bottom-right card, so it stays interactive at every viewport.
  const isCompactBenefitPanel = useMediaQuery("(max-width: 1023px)");
  // The side "NATURAL INGREDIENTS..." rail is dropped entirely on mobile —
  // there isn't room for it once the product block needs the full width to
  // keep its CTAs on one line (see the mobile block in KidsHero.module.css).
  const isMobile = useIsMobile();

  const addToCartRef = useMagneticButton<HTMLButtonElement>();
  const viewProductRef = useMagneticButton<HTMLAnchorElement>();

  const [activeSequence, setActiveSequence] = useState<HeroSequence>("orange");
  const [canvasPhase, setCanvasPhase] = useState<HeroCanvasPhase>("idle");

  useEffect(() => {
    // Explicitly set true on setup (not just relying on the initial ref
    // value) — otherwise React StrictMode's dev-only mount->cleanup->remount
    // dance leaves this permanently false after the phantom cleanup runs,
    // silently blocking every guarded update below.
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Page-load entrance: title reveals first, then the CTA row follows
  // shortly after — a small staggered reveal rather than the whole block
  // arriving as one flat unit.
  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      if (!productTitleRef.current || !productCtaRowRef.current) return;

      gsap
        .timeline({ delay: 0.35 })
        .from(productTitleRef.current, { opacity: 0, y: 18, duration: 0.6, ease: "power3.out" })
        .from(
          productCtaRowRef.current,
          { opacity: 0, y: 18, duration: 0.6, ease: "power3.out" },
          "-=0.35"
        );
    },
    { scope: sectionRef, dependencies: [] }
  );

  useHeroFrameSequence({
    sectionRef,
    canvasRef,
    copyRef,
    productRef,
    scrimRef,
    frameUrls: sequenceFrameUrls[activeSequence],
    aspectRatio: KIDS_HERO_FRAME_ASPECT,
  });

  /**
   * Blur-to-focus cut: the outgoing frame racks out of focus and fades,
   * like a camera pulling focus away. The new frame is then snapped (no
   * transition) to a blurred/invisible starting point and eased back to
   * sharp focus — a two-shot cut rather than a dissolve. See
   * HeroCanvas.module.css for the actual filter/opacity values per phase.
   *
   * The product title/CTA row rides the exact same timing via GSAP tweens
   * on productContentRef, so the text swap reads as part of the same cut
   * rather than an instant, jarring text change.
   */
  function switchToSequence(target: HeroSequence) {
    setCanvasPhase("out");

    if (productContentRef.current && !prefersReducedMotion) {
      gsap.to(productContentRef.current, {
        opacity: 0,
        y: -10,
        duration: BLUR_OUT_MS / 1000,
        ease: "power2.in",
        overwrite: true,
      });
    }

    window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setActiveSequence(target);
      setCanvasPhase("zoomInStart");

      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        setCanvasPhase("in");

        if (productContentRef.current) {
          if (prefersReducedMotion) {
            gsap.set(productContentRef.current, { opacity: 1, y: 0 });
          } else {
            gsap.fromTo(
              productContentRef.current,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: BLUR_IN_MS / 1000,
                ease: "power2.out",
                overwrite: true,
              }
            );
          }
        }

        window.setTimeout(() => {
          if (isMountedRef.current) setCanvasPhase("idle");
        }, BLUR_IN_MS);
      });
    }, BLUR_OUT_MS);
  }

  function handleSelectBenefit(label: string) {
    const target = benefitSequence[label];
    if (!target || target === activeSequence) return;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1, onComplete: () => switchToSequence(target) });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      switchToSequence(target);
    }
  }

  const productTitle = kidsHero.productTitles[activeSequence];

  return (
    <section ref={sectionRef} className={styles.section}>
      <HeroCanvas canvasRef={canvasRef} phase={canvasPhase} />

      <div className={styles.content}>
        <div className={styles.scrim} ref={scrimRef} aria-hidden="true" />
        <div className={styles.copyColumn}>
          <div className={styles.copy} ref={copyRef}>
            <h1 className={`${styles.headline} ${sequenceThemeClass[activeSequence]}`}>
              {kidsHero.headline.lines.map((line, index) => (
                <span
                  key={index}
                  className={`${styles.headlineLine} ${
                    line.accent ? accentClass[line.accent] : ""
                  }`}
                >
                  {line.text}
                </span>
              ))}
            </h1>
            <p className={styles.description}>{kidsHero.description}</p>
          </div>

          <div className={styles.productBlock} ref={productRef}>
            <div className={styles.productContent} ref={productContentRef}>
              <p className={styles.productTitle} ref={productTitleRef}>
                {productTitle}
              </p>
              <div className={styles.productCtaRow} ref={productCtaRowRef}>
                <button type="button" className={styles.ctaPrimary} ref={addToCartRef}>
                  <ShoppingBag size={16} strokeWidth={2.25} />
                  {kidsHero.productCta.addToCart}
                </button>
                <a className={styles.ctaSecondary} href="/our-gummies" ref={viewProductRef}>
                  {kidsHero.productCta.viewProduct}
                  <span className={styles.ctaIcon}>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isMobile && <SectionIndicator activeBear={activeSequence} />}
      <BenefitPanel
        compact={isCompactBenefitPanel}
        activeBear={activeSequence}
        onSelectBenefit={handleSelectBenefit}
      />
    </section>
  );
}
