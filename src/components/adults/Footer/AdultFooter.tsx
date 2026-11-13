import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultFooterContent as content } from "../../../data/adults/adultFooterContent";
import footerImage from "../../../assets/adults/footer/footer-adults.webp";
import footerDepth from "../../../assets/adults/footer/footer-adults-depth.webp";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { PlateCanvas } from "../common/PlateCanvas";
import logo from "../../../assets/gummyrituallogo.png";
import styles from "./AdultFooter.module.css";

/**
 * Adults footer. The wall, lilac waves, plinth and the four pouches are
 * one photograph (1983×793) with its own depth map. On desktop the footer
 * keeps that exact ratio, renders the photo through the depth shader (a
 * subtle parallax that follows the cursor, like the hero), and lays text
 * only on the photo's empty areas: a band across the top (above the
 * pouches) and the left side above the waves. Below 1024px the copy
 * stacks on the wall colour and the plain photo sits beneath it.
 */
export function AdultFooter() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useGSAP(
    () => {
      const footer = ref.current;
      if (reduced || !footer) return;
      // The footer ends the page, so its scroll range is "top enters the
      // viewport" → "page bottom".
      const range = { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: 0.6 };

      // 1 · Copy fades in, staggered, once.
      gsap.from(footer.querySelectorAll("[data-reveal]"), {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.07,
        scrollTrigger: { trigger: footer, start: "top 80%" },
      });

      // 2 · Scroll parallax: each block settles down into place at its own
      //     speed (data-depth). It starts *above* its resting spot, so text
      //     never drifts down into the pouches.
      footer.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = Number(el.dataset.depth) || 1;
        gsap.fromTo(el, { y: -depth * (isMobile ? 20 : 36) }, { y: 0, ease: "none", scrollTrigger: range });
      });

      // 3 · The photograph settles out of a slight zoom anchored at its top
      //     edge, so the pouches only ever sit lower (never up into the
      //     copy) and no edge is uncovered. Full-photo layout only (1024px+).
      const photo = footer.querySelector<HTMLElement>("[data-photo]");
      if (photo && window.matchMedia("(min-width: 1024px)").matches) {
        gsap.fromTo(
          photo,
          { scale: 1.07, transformOrigin: "50% 0%" },
          { scale: 1, ease: "none", scrollTrigger: range }
        );
      }
    },
    { scope: ref, dependencies: [reduced, isMobile] }
  );

  return (
    <footer ref={ref} className={styles.footer}>
      {isMobile ? (
        <img src={footerImage} alt="" aria-hidden className={styles.photo} loading="lazy" decoding="async" data-photo />
      ) : (
        <div className={styles.photo} aria-hidden data-photo>
          <PlateCanvas
            urls={[footerImage]}
            depthUrls={[footerDepth]}
            alts={[""]}
            transition="depth"
            parallax={reduced ? 0 : 0.012}
            grain={0}
            pointerLight={0.03}
          />
        </div>
      )}

      <div className={styles.content}>
        {/* Left side of the photo is clear all the way down: brand, then links. */}
        <div className={styles.left}>
          <div className={styles.brand} data-reveal data-depth="0.6">
            <img src={logo} alt="The Gummy Ritual" className={styles.logo} />
            <p className={styles.tagline}>{content.brand.tagline}</p>
            <p className={styles.description}>{content.brand.description}</p>
            <ul className={styles.socials}>
              {content.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className={styles.social} aria-label={s.label}>
                    <i className={`fa-brands ${s.icon}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className={styles.links} aria-label="Footer">
            {content.columns.map((col) => (
              <div key={col.heading} className={styles.linkCol} data-reveal data-depth="1">
                <p className={styles.linkHeading}>{col.heading}</p>
                <ul className={styles.linkList}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className={styles.link}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Top-right band, above the pouches. */}
        <form className={styles.newsletter} onSubmit={(e) => e.preventDefault()} data-reveal>
            <p className={styles.newsHeading}>{content.newsletter.heading}</p>
            <p className={styles.newsText}>{content.newsletter.description}</p>
            <div className={styles.field}>
              <input
                type="email"
                required
                placeholder={content.newsletter.placeholder}
                aria-label={content.newsletter.placeholder}
                className={styles.input}
              />
              <button type="submit" className={styles.submit} aria-label="Subscribe">
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
        </form>

        <ul className={styles.standards} data-reveal data-depth="0.8">
          {content.standards.map((s) => (
            <li key={s.label} className={styles.standard}>
              <span className={styles.standardIcon}>
                <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
              </span>
              {s.label}
            </li>
          ))}
        </ul>

        <div className={styles.legal} data-depth="0.25">
          <p className={styles.copyright}>
            {content.legal.copyright}
            {content.legal.links.map((l) => (
              <a key={l.label} href={l.href} className={styles.legalLink}>
                {l.label}
              </a>
            ))}
          </p>
          <div className={styles.payments}>
            <span className={styles.paymentLabel}>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              {content.legal.paymentLabel}
            </span>
            <ul className={styles.paymentIcons}>
              {content.legal.paymentIcons.map((p) => (
                <li key={p.label}>
                  <i className={`fa-brands ${p.icon}`} aria-label={p.label} title={p.label} />
                </li>
              ))}
              <li className={styles.upi} aria-label="UPI" title="UPI">
                UPI
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
