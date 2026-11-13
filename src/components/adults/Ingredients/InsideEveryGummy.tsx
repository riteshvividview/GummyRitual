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
const SCENE_DEPTH = ingredients.map((i) => adultImages.ingredientDepth(i.id));
/** Text colours per scene — interpolated in step with the scene change. */
const PALETTE = ingredients.map((i) => {
  const fg = i.ink ?? (i.dark ? "#fbf5ec" : "#1a120d");
  const muted = i.inkMuted ?? (i.dark ? "rgba(251, 245, 236, 0.88)" : "rgba(26, 18, 13, 0.84)");
  const line = i.dark || i.ink ? "rgba(251, 245, 236, 0.3)" : "rgba(26, 18, 13, 0.24)";
  // labels sit on the busiest part of the backdrop: keep only a hint of the scene tint
  const label = "#ffffff";
  return { fg, muted, line, label, tone: i.tone };
});
/** Lift the backdrop behind the text column for dark ink; deepen it for cream text. */
/** Bright backdrops (pale pinks, peach, lilac, sage) need a deeper shade behind the text. */
const DEEPER: Record<string, number> = { hyaluronic: -0.5, "vitamin-c": -0.5, biotin: -0.5, magnesium: -0.5, zinc: -0.42 };
const SCENE_LIGHT = ingredients.map((i) => DEEPER[i.id] ?? (i.dark ? -0.32 : 0.62));
const SCENE_ALTS = ingredients.map(
  (i) => `${i.name} beside a ${adultProducts[i.product].flavour.toLowerCase()} gummy on travertine`
);

/**
 * 04 · Inside every gummy.
 * Same interaction as the Kids "Inside Every Gummy" section, rebuilt in
 * the Adults language: full-bleed studio scenes that change through a
 * depth-map transition (backdrop first, subject last — same as the hero;
 * hover parallax at rest),
 * an editorial info column whose colours move in step with the scene, and
 * a grid of ingredient objects.
 */
export function InsideEveryGummy() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<PlateCanvasHandle>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const shown = useRef(0);
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  /** The chosen ingredient (selector highlight follows clicks at once). */
  const [selected, setSelected] = useState(0);

  /** Text colours + backdrop tone, blended between two scenes. */
  const applyColors = useCallback((from: number, to: number, m: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const a = PALETTE[from];
    const b = PALETTE[to];
    const lerp = gsap.utils.interpolate;
    el.style.setProperty("--fg", lerp(a.fg, b.fg, m));
    el.style.setProperty("--fg-muted", lerp(a.muted, b.muted, m));
    el.style.setProperty("--fg-line", lerp(a.line, b.line, m));
    el.style.setProperty("--fg-label", lerp(a.label, b.label, m));
    el.style.setProperty("--tone", lerp(a.tone, b.tone, m));
  }, []);

  useGSAP(() => applyColors(0, 0, 0), { scope: sectionRef });

  const goTo = useCallback(
    (target: number) => {
      if (target === shown.current && !tweenRef.current?.isActive()) return;
      tweenRef.current?.kill();
      const from = shown.current;
      setSelected(target);
      const state = { m: 0 };
      let swapped = false;
      tweenRef.current = gsap.to(state, {
        m: 1,
        duration: reduced ? 0 : 1.1,
        ease: "sine.inOut",
        onUpdate: () => {
          plateRef.current?.setState(from, target, state.m);
          applyColors(from, target, state.m);
          // the words change at the midpoint, with the scene
          if (!swapped && state.m >= 0.5) {
            swapped = true;
            shown.current = target;
            setActive(target);
          }
        },
        onComplete: () => {
          shown.current = target;
          setActive(target);
        },
      });
    },
    [reduced, applyColors]
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
      className={styles.section}
      style={{ ["--deep" as string]: product.tintDeep }}
      aria-labelledby="adult-ingredients-title"
    >
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

      <div className={styles.scene}>
        <PlateCanvas
          key={isMobile ? "m" : "d"}
          ref={plateRef}
          urls={SCENE_URLS}
          depthUrls={SCENE_DEPTH}
          parallax={isMobile ? 0.018 : 0.03}
          alts={SCENE_ALTS}
          transition="depthFocus"
          focus={isMobile ? [0.22, 0.5] : [0.35, 0.5]}
          grain={0}
          pointerLight={-0.08}
          wallLight={isMobile ? undefined : SCENE_LIGHT}
          lightSide="right"
        />

        {/* Right column: heading, info and selector stack — never overlap. */}
        <div className={styles.column}>

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
                    className={`${styles.chip} ${i === selected ? styles.chipActive : ""}`}
                    onClick={() => goTo(i)}
                    aria-pressed={i === selected}
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
      </div>

    </section>
  );
}
