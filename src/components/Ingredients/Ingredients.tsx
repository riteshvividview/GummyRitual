import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useCursorParallax } from "../../animations/cursor/useCursorParallax";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ingredientsContent } from "../../data/ingredientsContent";
import { getIngredientImage } from "./ingredientImages";
import orangeBear from "../../assets/homepage/01-hero/images/orange-bear.png";
import pinkBear from "../../assets/homepage/01-hero/images/pink-bear.png";
import greenBear from "../../assets/homepage/01-hero/images/green-bear.png";
import blueBear from "../../assets/homepage/01-hero/images/blue-bear.png";
import styles from "./Ingredients.module.css";

const mascotImage: Record<string, string> = {
  orange: orangeBear,
  pink: pinkBear,
  green: greenBear,
  blue: blueBear,
};

const BG_TRANSITION_DURATION = 0.9;
const CONTENT_FADE_OUT_MS = 260;
const CONTENT_FADE_IN_MS = 520;

/**
 * Kids homepage section 4 — "Inside Every Gummy". Switching ingredients
 * crossfades the background (two stacked layers, plain opacity — see
 * below), the left info card, and the right-side benefits table, all via
 * GSAP rather than the instant React re-render it used to be.
 */
export function Ingredients() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<[HTMLImageElement | null, HTMLImageElement | null]>([null, null]);
  const frontLayerRef = useRef<0 | 1>(0);
  const isFirstRunRef = useRef(true);
  const isAnimatingRef = useRef(false);

  const infoCardRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const total = ingredientsContent.ingredients.length;
  const active = ingredientsContent.ingredients[activeIndex];

  // Subtle depth-layered cursor parallax on the right side — the table
  // panel drifts a little, the decorative mascot bear drifts more, so
  // they read as sitting at different depths as the pointer moves.
  const panelParallaxRef = useCursorParallax<HTMLDivElement>(photoAreaRef, {
    strength: 0.012,
    maxOffset: 10,
  });
  const mascotParallaxRef = useCursorParallax<HTMLImageElement>(photoAreaRef, {
    strength: 0.03,
    maxOffset: 22,
  });

  function goTo(nextIndex: number) {
    const normalized = ((nextIndex % total) + total) % total;
    if (normalized === activeIndex || isAnimatingRef.current) return;

    if (prefersReducedMotion) {
      setActiveIndex(normalized);
      return;
    }

    isAnimatingRef.current = true;
    const contentEls = [infoCardRef.current, panelContentRef.current].filter(
      (el): el is HTMLDivElement => el !== null
    );

    gsap.to(contentEls, {
      opacity: 0,
      y: -10,
      duration: CONTENT_FADE_OUT_MS / 1000,
      ease: "power2.in",
      overwrite: true,
    });

    window.setTimeout(() => {
      setActiveIndex(normalized);

      requestAnimationFrame(() => {
        gsap.fromTo(
          contentEls,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: CONTENT_FADE_IN_MS / 1000,
            ease: "power3.out",
            overwrite: true,
          }
        );

        const rows = panelContentRef.current?.querySelectorAll(`.${styles.benefitRow}`);
        if (rows?.length) {
          gsap.fromTo(
            rows,
            { opacity: 0, x: 14 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: "power3.out",
              stagger: 0.06,
              delay: 0.1,
            }
          );
        }

        isAnimatingRef.current = false;
      });
    }, CONTENT_FADE_OUT_MS);
  }

  useEffect(() => {
    const backgroundUrl = getIngredientImage(active.background);
    if (!backgroundUrl) return;

    const front = frontLayerRef.current;
    const back = front === 0 ? 1 : 0;
    const frontEl = layerRefs.current[front];
    const backEl = layerRefs.current[back];
    if (!frontEl || !backEl) return;

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      gsap.set(frontEl, { opacity: 1 });
      frontEl.src = backgroundUrl;
      return;
    }

    backEl.src = backgroundUrl;

    if (prefersReducedMotion) {
      gsap.set(backEl, { opacity: 1, zIndex: 2 });
      gsap.set(frontEl, { opacity: 0, zIndex: 1 });
      frontLayerRef.current = back;
      return;
    }

    gsap.set(backEl, { opacity: 0, zIndex: 2 });
    const tl = gsap.timeline({
      onComplete: () => {
        frontLayerRef.current = back;
      },
    });
    tl.to(backEl, { opacity: 1, duration: BG_TRANSITION_DURATION, ease: "power2.inOut" }).to(
      frontEl,
      { opacity: 0, duration: BG_TRANSITION_DURATION, ease: "power2.inOut" },
      "<"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

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
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.photoArea} ref={photoAreaRef}>
        <div className={styles.backgroundLayer} aria-hidden="true">
          <img
            ref={(el) => {
              layerRefs.current[0] = el;
            }}
            alt=""
            className={styles.bgImage}
          />
          <img
            ref={(el) => {
              layerRefs.current[1] = el;
            }}
            alt=""
            className={styles.bgImage}
          />
        </div>
        <div className={styles.scrimLeft} aria-hidden="true" />
        <div className={styles.scrimRight} aria-hidden="true" />

        <div className={`${styles.infoCard} ${styles.revealUp}`} ref={infoCardRef}>
          <span className={styles.infoCounter}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <p className={styles.infoTitle}>{active.label}</p>
          <p className={styles.infoDescription}>{active.description}</p>
        </div>

        <div className={styles.rightPanelWrap} ref={panelParallaxRef}>
          <div className={styles.infoPanel} ref={panelContentRef}>
            <span className={`${styles.eyebrowPill} ${styles.revealUp}`}>
              {ingredientsContent.eyebrow}
            </span>

            <h3 className={styles.panelHeading}>{active.label}</h3>

            <div className={styles.statBlock}>
              <span className={styles.statValue}>{active.stat.value}</span>
              <span className={styles.statLabel}>{active.stat.label}</span>
            </div>

            <table className={styles.benefitsTable}>
              <tbody>
                {active.benefits.map((benefit) => (
                  <tr key={benefit.title} className={styles.benefitRow}>
                    <th scope="row" className={styles.benefitRowTitle}>
                      {benefit.title}
                    </th>
                    <td className={styles.benefitRowDesc}>{benefit.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <img
          src={mascotImage[active.mascot]}
          alt=""
          aria-hidden="true"
          className={`${styles.mascot} ${styles.revealUp}`}
          ref={mascotParallaxRef}
        />

        <div className={styles.paginationControl}>
          <button
            type="button"
            className={styles.paginationArrow}
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous ingredient"
          >
            <ChevronLeft size={18} strokeWidth={2.25} />
          </button>
          <span className={styles.paginationCount}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={styles.paginationArrow}
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next ingredient"
          >
            <ChevronRight size={18} strokeWidth={2.25} />
          </button>
        </div>

        <ul className={styles.ingredientRow}>
          {ingredientsContent.ingredients.map((ingredient, index) => {
            const iconUrl = getIngredientImage(ingredient.icon);
            const isActive = index === activeIndex;
            return (
              <li key={ingredient.id}>
                <button
                  type="button"
                  className={`${styles.ingredientItem} ${isActive ? styles.ingredientItemActive : ""}`}
                  onClick={() => goTo(index)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Show ${ingredient.label}`}
                >
                  <span className={styles.ingredientIconWrap}>
                    {iconUrl && <img src={iconUrl} alt="" className={styles.ingredientIcon} />}
                  </span>
                  <span className={styles.ingredientLabel}>{ingredient.label}</span>
                  <span className={styles.ingredientDot} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
