import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { footerContent } from "../../data/footerContent";
import footerBackground from "../../assets/footer/footer-background-image.png";
import logo from "../../assets/gummyrituallogo.png";
import styles from "./Footer.module.css";

/**
 * Site footer. The bear, product pouches, mini gummy bears and the
 * colorful wave background are all baked into footer-background-image.png
 * itself — this component only lays text content on top of it, matched
 * to the image's own 1983x793 proportions via aspect-ratio so everything
 * stays aligned at any viewport width.
 */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !footerRef.current) return;

      gsap.from(footerRef.current.querySelectorAll(`.${styles.revealUp}`), {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: footerRef, dependencies: [prefersReducedMotion] }
  );

  function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Not wired to a real email service yet — just stop the page reload.
    event.preventDefault();
  }

  return (
    <footer ref={footerRef} className={styles.footer}>
      <img
        src={footerBackground}
        alt=""
        aria-hidden="true"
        className={`${styles.bgImage} img-fade`}
        loading="lazy"
        onLoad={(event) => event.currentTarget.classList.add("img-fade-loaded")}
      />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={`${styles.brandCol} ${styles.revealUp}`}>
            <img src={logo} alt="The Gummy Rituals" className={styles.logoImage} />
            <p className={styles.tagline}>
              {footerContent.brand.tagline.map((line) => (
                <span key={line} className={styles.taglineLine}>
                  {line}
                </span>
              ))}
            </p>
            <p className={styles.brandDescription}>{footerContent.brand.description}</p>
            <ul className={styles.socialList}>
              {footerContent.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} className={styles.socialLink} aria-label={social.label}>
                    <i className={`fa-brands ${social.icon}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className={styles.linksGrid} aria-label="Footer">
            {footerContent.columns.map((column) => (
              <div key={column.heading} className={`${styles.linkCol} ${styles.revealUp}`}>
                <p className={styles.linkColHeading}>{column.heading}</p>
                <ul className={styles.linkList}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className={styles.link}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <form
            className={`${styles.newsletterCard} ${styles.revealUp}`}
            onSubmit={handleNewsletterSubmit}
          >
            <p className={styles.newsletterHeading}>{footerContent.newsletter.heading}</p>
            <p className={styles.newsletterDescription}>{footerContent.newsletter.description}</p>
            <div className={styles.newsletterField}>
              <input
                type="email"
                required
                placeholder={footerContent.newsletter.placeholder}
                className={styles.newsletterInput}
                aria-label={footerContent.newsletter.placeholder}
              />
              <button type="submit" className={styles.newsletterSubmit} aria-label="Subscribe">
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>

        <ul className={`${styles.trustRow} ${styles.revealUp}`}>
          {footerContent.trustBadges.map((badge) => (
            <li key={badge.label} className={styles.trustItem}>
              <span className={`${styles.trustIcon} ${styles[`tint${capitalize(badge.tint)}`]}`}>
                <i className={`fa-solid ${badge.icon}`} aria-hidden="true" />
              </span>
              <span className={styles.trustLabel}>{badge.label}</span>
            </li>
          ))}
        </ul>

        <div className={styles.legalBar}>
          <p className={styles.copyright}>{footerContent.legal.copyright}</p>
          <div className={styles.paymentRow}>
            <span className={styles.paymentLabel}>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              {footerContent.legal.paymentLabel}
            </span>
            <ul className={styles.paymentIcons}>
              {footerContent.legal.paymentIcons.map((payment) => (
                <li key={payment.label}>
                  <i
                    className={`fa-brands ${payment.icon}`}
                    aria-label={payment.label}
                    title={payment.label}
                  />
                </li>
              ))}
              <li className={styles.upiMark} aria-label="UPI" title="UPI">
                UPI
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
