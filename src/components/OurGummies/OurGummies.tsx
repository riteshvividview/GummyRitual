import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Heart, ShieldPlus, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useCursorParallax } from "../../animations/cursor/useCursorParallax";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ourGummies } from "../../data/ourGummiesContent";
import sectionImage from "../../assets/homepage/02-our-gummies/images/home-page-second-section.png";
import leafFeature from "../../assets/homepage/02-our-gummies/images/leaf-feature-img.png";
import strawberryFeature from "../../assets/homepage/02-our-gummies/images/strawberry-feature-img.png";
import bearFeature from "../../assets/homepage/02-our-gummies/images/orange-bear-feature-img.png";
import sunFeature from "../../assets/homepage/02-our-gummies/images/sun-feature-img.png";
import styles from "./OurGummies.module.css";

const iconMap: Record<string, LucideIcon> = {
  shieldPlus: ShieldPlus,
  trendingUp: TrendingUp,
  zap: Zap,
  heart: Heart,
};

const trustImageMap: Record<string, string> = {
  leaf: leafFeature,
  strawberry: strawberryFeature,
  bear: bearFeature,
  sun: sunFeature,
};

/**
 * Kids homepage section 2 — "Our Gummies".
 */
export function OurGummies() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const backgroundImageRef = useCursorParallax<HTMLImageElement>(contentRef, {
    strength: 0.012,
    maxOffset: 10,
  });

  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current) return;

      const benefitItems = sectionRef.current.querySelectorAll(`.${styles.benefitItem}`);
      const trustItems = sectionRef.current.querySelectorAll(`.${styles.trustItem}`);

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

      gsap.from(benefitItems, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
        },
      });

      gsap.from(trustItems, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 20%",
        },
      });

      // Parallax drift on the trust-strip text (label + description) —
      // alternating direction per item so they read as sitting at slightly
      // different depths rather than moving in lockstep. Previously this
      // was on the illustrations themselves; moved to the text instead.
      const trustTexts = sectionRef.current.querySelectorAll(`.${styles.trustText}`);
      trustTexts.forEach((text, index) => {
        gsap.to(text, {
          y: index % 2 === 0 ? -18 : 18,
          ease: "none",
          scrollTrigger: {
            trigger: text,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.content} ref={contentRef}>
        <img
          src={sectionImage}
          alt=""
          className={`${styles.backgroundImage} img-fade`}
          ref={backgroundImageRef}
          loading="lazy"
          onLoad={(event) => event.currentTarget.classList.add("img-fade-loaded")}
        />
        <div className={styles.scrimLeft} aria-hidden="true" />
        <div className={styles.copyColumn}>
          <span className={`${styles.eyebrow} ${styles.revealUp}`}>{ourGummies.eyebrow}</span>
          <h2 className={styles.headline}>
            {ourGummies.headline.lines.map((line, index) => (
              <span
                key={index}
                className={`${styles.headlineLine} ${styles.revealUp} ${
                  line.accent ? styles.accent : ""
                }`}
              >
                {line.text}
                {index === ourGummies.headline.lines.length - 1 && (
                  <> {ourGummies.headline.trailingWord}</>
                )}
              </span>
            ))}
          </h2>
          <p className={`${styles.description} ${styles.revealUp}`}>{ourGummies.description}</p>

          <ul className={styles.benefitList}>
            {ourGummies.benefits.map((benefit) => {
              const Icon = iconMap[benefit.icon];
              return (
                <li key={benefit.label} className={styles.benefitItem}>
                  <span className={`${styles.benefitIcon} ${styles[`tint${capitalize(benefit.tint)}`]}`}>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className={styles.benefitLabel}>{benefit.label}</span>
                  <span className={styles.benefitDescription}>{benefit.description}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={styles.trustStrip}>
        <svg
          className={styles.trustWave}
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,48 C240,88 480,8 720,32 C960,56 1200,88 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
        <ul className={styles.trustList}>
          {ourGummies.trustPoints.map((point) => (
            <li key={point.label} className={styles.trustItem}>
              <img
                src={trustImageMap[point.image]}
                alt=""
                className={`${styles.trustIcon} img-fade`}
                loading="lazy"
                onLoad={(event) => event.currentTarget.classList.add("img-fade-loaded")}
              />
              <div className={styles.trustText}>
                <p className={styles.trustLabel}>{point.label}</p>
                <p className={styles.trustDescription}>{point.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
