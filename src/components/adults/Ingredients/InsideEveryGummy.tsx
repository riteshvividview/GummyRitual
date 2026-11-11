import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { adultIngredientsContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { PlateCanvas, type PlateCanvasHandle } from "../common/PlateCanvas";
import { adultImages } from "../common/adultImages";
import styles from "./InsideEveryGummy.module.css";

const { ingredients } = adultIngredientsContent;
const SCENE_URLS = ingredients.map((i) => adultImages.ingredient(i.id));
/** Lift the backdrop behind the text column for dark ink; deepen it for cream text. */
const SCENE_LIGHT = ingredients.map((i) => (i.dark ? -0.32 : 0.62));
const SCENE_ALTS = ingredients.map(
  (i) => `${i.name} beside a ${adultProducts[i.product].flavour.toLowerCase()} gummy on travertine`
);

/**
 * 04 · Inside every gummy.
 * Same interaction as the Kids "Inside Every Gummy" section, rebuilt in
 * the Adults language: full-bleed studio scenes that dissolve into each
 * other through a grain-edged shader, an editorial info column, and a
 * selector strip of ingredient objects.
 */
export function InsideEveryGummy() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<PlateCanvasHandle>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const shown = useRef(0);
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const goTo = useCallback(
    (target: number) => {
      if (target === active && !tweenRef.current?.isActive()) return;
      tweenRef.current?.kill();
      const from = shown.current;
      setActive(target);
      const state = { m: 0 };
      tweenRef.current = gsap.to(state, {
        m: 1,
        duration: reduced ? 0 : 1.25,
        ease: "power2.inOut",
        onUpdate: () => {
          plateRef.current?.setState(from, target, state.m);
          if (state.m > 0.5) shown.current = target;
        },
        onComplete: () => {
          shown.current = target;
        },
      });
    },
    [active, reduced]
  );

  useGSAP(
    () => {
      const section = sectionRef.current!;
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        y: 36,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 65%" },
      });
      gsap.from(section.querySelectorAll("[data-icon]"), {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 45%" },
      });
    },
    { scope: sectionRef }
  );

  const ing = ingredients[active];
  const product = adultProducts[ing.product];

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${ing.dark ? styles.dark : ""}`}
      style={{ ["--tone" as string]: ing.tone, ["--deep" as string]: product.tintDeep }}
      aria-labelledby="adult-ingredients-title"
    >
      <div className={styles.scene}>
        <PlateCanvas
          key={isMobile ? "m" : "d"}
          ref={plateRef}
          urls={SCENE_URLS}
          alts={SCENE_ALTS}
          transition="dissolve"
          focus={isMobile ? [0.22, 0.5] : [0.35, 0.5]}
          grain={0}
          pointerLight={0.05}
          wallLight={isMobile ? undefined : SCENE_LIGHT}
          lightSide="right"
        />

        <header className={styles.heading}>
          <p className={styles.eyebrow} data-reveal>
            <span className={styles.eyebrowIndex}>04</span>
            {adultIngredientsContent.eyebrow}
          </p>
          <h2 id="adult-ingredients-title" className={styles.headline} data-split>
            <span>{adultIngredientsContent.headline[0]}</span>
            <span>{adultIngredientsContent.headline[1]}</span>
          </h2>
        </header>

        <article className={styles.card} aria-live="polite">
          <div key={ing.id} className={styles.cardInner}>
            <p className={styles.cardFor}>
              <span className={styles.cardDot} style={{ background: product.tint }} aria-hidden />
              In {product.title}
            </p>
            <h3 className={styles.cardName}>{ing.name}</h3>
            <p className={styles.cardSummary}>{ing.summary}</p>
            <div className={styles.stat}>
              <span className={styles.statValue}>{ing.stat.value}</span>
              <span className={styles.statLabel}>{ing.stat.label}</span>
            </div>
            <ul className={styles.points}>
              {ing.points.map((pt) => (
                <li key={pt.title}>
                  <span className={styles.pointTitle}>{pt.title}</span>
                  <span className={styles.pointText}>{pt.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <nav className={styles.strip} aria-label="Ingredients">
        <ul className={styles.stripList}>
          {ingredients.map((item, i) => {
            const p = adultProducts[item.product];
            return (
              <li key={item.id} data-icon>
                <button
                  type="button"
                  className={`${styles.chip} ${i === active ? styles.chipActive : ""}`}
                  onClick={() => goTo(i)}
                  aria-pressed={i === active}
                  style={{ ["--tint" as string]: p.tint }}
                >
                  <span className={styles.chipIcon}>
                    <img src={adultImages.ingredientIcon(item.id)} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className={styles.chipName}>{item.name}</span>
                  <span className={styles.chipProduct}>{p.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
