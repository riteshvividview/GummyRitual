import styles from "./AdultHero.module.css";

/**
 * Placeholder only. The Adults experience gets its own frame sequence,
 * typography (Fraunces, already loaded — see index.html), palette,
 * copy and animation treatment in a future session; it must not reuse
 * Kids styling. Sized to match KidsHero so switching modes doesn't
 * shift page layout.
 */
export function AdultHero() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>DAILY WELLBEING RITUALS</span>
        <h1 className={styles.headline}>The Adults experience is coming soon.</h1>
        <p className={styles.description}>
          A separate, editorial visual system for Gummy Rituals Adults is in
          progress — check back shortly.
        </p>
      </div>
    </section>
  );
}
