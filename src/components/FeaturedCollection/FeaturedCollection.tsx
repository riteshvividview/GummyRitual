import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { products } from "../../data/products";
import { ProductCarousel } from "./ProductCarousel";
import { ProductStand } from "./ProductStand";
import styles from "./FeaturedCollection.module.css";

const kidsProducts = products.filter((product) => product.experience === "kids");

/**
 * Homepage section between the hero and "Our Gummies" — a premium product
 * carousel over a full-bleed background (ProductStand.tsx — a single
 * fixed image, no active-product logic). Products sit on an invisible
 * circular disc (see circularPositions.ts); see ProductCarousel.tsx for
 * the rotation mechanics.
 */
export function FeaturedCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.from(sectionRef.current.querySelectorAll(`.${styles.revealUp}`), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      // The whole carousel block glides/fades in as one unit, slightly
      // after the header — targets .carouselWrap (not individual cards),
      // so it never competes with ProductCarousel's own per-card GSAP
      // tweens for the same x/y/scale/opacity properties.
      gsap.from(sectionRef.current.querySelector(`.${styles.carouselWrap}`), {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.15,
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
      <ProductStand />
      <div className={styles.header}>
        <span className={`${styles.eyebrow} ${styles.revealUp}`}>Featured Collection</span>
        <h2 className={`${styles.headline} ${styles.revealUp}`}>
          <span className={styles.headlineLine}>Nutrition for</span>
          <span className={`${styles.headlineLine} ${styles.accent}`}>Brighter Tomorrows</span>
        </h2>
        <p className={`${styles.description} ${styles.revealUp}`}>
          Delicious, science-backed gummies crafted to support your child's everyday growth and
          well-being.
        </p>
      </div>

      <ProductCarousel products={kidsProducts} />
    </section>
  );
}
