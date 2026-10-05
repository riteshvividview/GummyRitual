import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Moon, Sun, Utensils, type LucideIcon } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useCursorParallax } from "../../animations/cursor/useCursorParallax";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { dailyRoutineContent } from "../../data/dailyRoutineContent";
import backgroundImage from "../../assets/homepage/05-daily-routine/images/Day to Night Gummy Dreamscape bg image.png";
import styles from "./DailyRoutine.module.css";

const momentIcon: Record<string, LucideIcon> = { sun: Sun, moon: Moon };
const stepIcon: Record<string, LucideIcon> = { sun: Sun, moon: Moon, utensils: Utensils };

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Kids homepage section 5 — "Made for Little Rituals". The whole
 * day-to-night scene (girl at breakfast, gummy-bear nightlight, sleeping
 * child, sun/moon markers along the arc) is baked into the background
 * photo itself — this component only lays text and two floating glass
 * cards on top of it, plus the bottom routine stepper.
 */
export function DailyRoutine() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const morningCardRef = useCursorParallax<HTMLDivElement>(photoAreaRef, {
    strength: 0.012,
    maxOffset: 10,
  });
  const eveningCardRef = useCursorParallax<HTMLDivElement>(photoAreaRef, {
    strength: 0.016,
    maxOffset: 12,
  });

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      if (!prefersReducedMotion) {
        gsap.from(sectionRef.current.querySelectorAll(`.${styles.revealUp}`), {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        });
      }

      // Scroll parallax on the background photo — a slow vertical drift as
      // the section passes through the viewport, so the scene itself
      // feels like it has depth rather than being a flat pasted-in image.
      if (!prefersReducedMotion && bgImageRef.current) {
        gsap.fromTo(
          bgImageRef.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.photoArea} ref={photoAreaRef}>
        <img
          ref={bgImageRef}
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className={`${styles.bgImage} img-fade`}
          loading="lazy"
          onLoad={(event) => event.currentTarget.classList.add("img-fade-loaded")}
        />
        <div className={styles.scrimLeft} aria-hidden="true" />

        <div className={styles.copyBlock}>
          <span className={`${styles.eyebrow} ${styles.revealUp}`}>
            {dailyRoutineContent.eyebrow}
          </span>
          <h2 className={styles.headline}>
            {dailyRoutineContent.headline.map((line) => (
              <span key={line} className={`${styles.headlineLine} ${styles.revealUp}`}>
                {line}
              </span>
            ))}
          </h2>
          <p className={`${styles.description} ${styles.revealUp}`}>
            {dailyRoutineContent.description}
          </p>
        </div>

        {dailyRoutineContent.moments.map((moment) => {
          const Icon = momentIcon[moment.icon];
          const cardRef = moment.theme === "light" ? morningCardRef : eveningCardRef;
          return (
            <div
              key={moment.id}
              ref={cardRef}
              className={`${styles.momentCard} ${styles[`moment${capitalize(moment.theme)}`]} ${
                styles[`momentPosition${capitalize(moment.id)}`]
              } ${styles.revealUp}`}
            >
              <span className={styles.momentIcon}>
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <div className={styles.momentText}>
                <p className={styles.momentTitle}>{moment.title}</p>
                <p className={styles.momentDescription}>{moment.description}</p>
              </div>
              <span className={styles.momentArrow} aria-hidden="true">
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            </div>
          );
        })}
      </div>

      <ul className={styles.stepperRow}>
        {dailyRoutineContent.steps.map((step, index) => {
          const Icon = stepIcon[step.icon];
          const isLast = index === dailyRoutineContent.steps.length - 1;
          return (
            <li key={step.id} className={`${styles.step} ${styles.revealUp}`}>
              <span
                className={`${styles.stepIcon} ${step.active ? styles.stepIconActive : ""}`}
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <div className={styles.stepText}>
                <p className={styles.stepLabel}>{step.label}</p>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {!isLast && <span className={styles.stepConnector} aria-hidden="true" />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
