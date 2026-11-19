import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Plus } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useCursorParallax } from "../../animations/cursor/useCursorParallax";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { tasteTextureContent, type TextureCard } from "../../data/tasteTextureContent";
import backgroundImage from "../../assets/homepage/06-taste-texture/images/bg-image.png";
import textureImage from "../../assets/homepage/06-taste-texture/images/texture-bear-image.png";
import chewyBiteImage from "../../assets/homepage/06-taste-texture/images/chewy-bite-image.png";
import shapeImage from "../../assets/homepage/06-taste-texture/images/shape-bear-image.png";
import ingredientsImage from "../../assets/homepage/06-taste-texture/images/ingredients-bear-image.png";
import backgroundDepth from "../../assets/homepage/06-taste-texture/images/bg-image-depth.webp";
import textureDepth from "../../assets/homepage/06-taste-texture/images/texture-bear-image-depth.webp";
import chewyBiteDepth from "../../assets/homepage/06-taste-texture/images/chewy-bite-image-depth.webp";
import shapeDepth from "../../assets/homepage/06-taste-texture/images/shape-bear-image-depth.webp";
import ingredientsDepth from "../../assets/homepage/06-taste-texture/images/ingredients-bear-image-depth.webp";
import { PlateCanvas } from "../adults/common/PlateCanvas";
import styles from "./TasteTexture.module.css";

const cardDepthMap: Record<TextureCard["image"], string> = {
  texture: textureDepth,
  chewyBite: chewyBiteDepth,
  shape: shapeDepth,
  ingredients: ingredientsDepth,
};

const cardImageMap: Record<TextureCard["image"], string> = {
  texture: textureImage,
  chewyBite: chewyBiteImage,
  shape: shapeImage,
  ingredients: ingredientsImage,
};

/**
 * Kids homepage section 6 — "Taste & Texture". A row of expand-on-hover
 * cards: the active card widens to reveal its description and CTA while
 * the rest collapse to just an index + label, over a shared cinematic
 * pedestal backdrop.
 */
export function TasteTexture() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(tasteTextureContent.defaultActiveId);

  const bgImageRef = useCursorParallax<HTMLDivElement>(stageRef, {
    strength: 0.01,
    maxOffset: 14,
  });

  useGSAP(
    () => {
      if (!sectionRef.current || prefersReducedMotion) return;

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

      gsap.from(sectionRef.current.querySelectorAll(`.${styles.card}`), {
        opacity: 0,
        y: 36,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top 78%",
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  // Hover intent: sweeping the cursor across the row shouldn't open every
  // card it passes — only the one it settles on.
  const hoverTimer = useRef<number | undefined>(undefined);
  const cancelHover = () => window.clearTimeout(hoverTimer.current);
  const hoverTo = (id: string) => {
    cancelHover();
    hoverTimer.current = window.setTimeout(() => setActiveId(id), 90);
  };
  useEffect(() => cancelHover, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveId(id);
    }
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.stage} ref={stageRef}>
        <div ref={bgImageRef} className={styles.stageBackground} aria-hidden="true">
          <PlateCanvas
            urls={[backgroundImage]}
            depthUrls={[backgroundDepth]}
            alts={[""]}
            transition="depthFocus"
            parallax={0.025}
            pointerLight={0.2}
            grain={0.02}
          />
        </div>
        <div className={styles.stageScrim} aria-hidden="true" />

        <div className={styles.copyBlock}>
          <span className={`${styles.eyebrow} ${styles.revealUp}`}>
            {tasteTextureContent.eyebrow}
          </span>
          <h2 className={`${styles.headline} ${styles.revealUp}`}>
            {tasteTextureContent.headline.text}{" "}
            <span className={styles.accent}>{tasteTextureContent.headline.accentWord}</span>
          </h2>
        </div>

        <ul className={styles.cardRow}>
          {tasteTextureContent.cards.map((card) => {
            const isActive = card.id === activeId;
            return (
              <li
                key={card.id}
                className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
              >
                <div
                  className={styles.cardInner}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={card.label}
                  onMouseEnter={() => hoverTo(card.id)}
                  onMouseLeave={cancelHover}
                  onFocus={() => setActiveId(card.id)}
                  onClick={() => setActiveId(card.id)}
                  onKeyDown={(event) => handleKeyDown(event, card.id)}
                >
                  <div className={`${styles.cardImage} img-fade-loaded`}>
                    <PlateCanvas
                      urls={[cardImageMap[card.image]]}
                      depthUrls={[cardDepthMap[card.image]]}
                      alts={[""]}
                      transition="depthFocus"
                      parallax={0.035}
                      pointerLight={0.3}
                      grain={0.02}
                    />
                  </div>
                  <div className={styles.cardScrim} aria-hidden="true" />

                  <div className={styles.cardTop}>
                    <span className={styles.cardIndex}>{card.index}</span>
                    <span className={styles.cardLabel}>{card.label}</span>
                  </div>

                  <div className={styles.cardBottom}>
                    {isActive ? (
                      <>
                        <p className={styles.cardDescription}>{card.description}</p>
                        <span className={styles.cardCta}>
                          {card.ctaLabel}
                          <ArrowRight size={16} strokeWidth={2.5} />
                        </span>
                      </>
                    ) : (
                      <span className={styles.cardExpandMark} aria-hidden="true">
                        <Plus size={18} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
