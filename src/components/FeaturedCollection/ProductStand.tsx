import { getProductImage } from "./productImages";
import styles from "./FeaturedCollection.module.css";

/**
 * Full-bleed background for the whole section (not just the carousel
 * stage) — always bg-orange.png, no active-product logic. Falls back to
 * a plain cream fill if that file isn't present.
 */
export function ProductStand() {
  const imageUrl = getProductImage("bg-orange.png");

  if (!imageUrl) {
    return <div className={styles.sectionBackgroundFallback} aria-hidden="true" />;
  }

  return (
    <>
      <img src={imageUrl} alt="" aria-hidden="true" className={styles.sectionBackground} />
      <div className={styles.sectionBackgroundOverlay} aria-hidden="true" />
    </>
  );
}
