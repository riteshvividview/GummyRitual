import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../../animations/gsap";
import { adultCollectionContent } from "../../../data/adults/adultSectionsContent";
import { adultProductOrder, adultProducts, type AdultProductId } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { adultImages } from "../common/adultImages";
import { ProductDrawer } from "./ProductDrawer";
import styles from "./TheEdit.module.css";

/**
 * 02 · The Edit.
 * A magazine-style shelf of five colour rooms. Desktop pins the section
 * and scrubs the shelf sideways while the page washes into the colour of
 * the room in focus; mobile is a native scroll-snap row. Any room opens
 * the product drawer.
 */
export function TheEdit() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [openId, setOpenId] = useState<AdultProductId | null>(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const scrollDriven = !isMobile && !reduced;

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const track = trackRef.current!;
      const washes = adultProductOrder.map((id) => adultProducts[id].wash);
      const lerpWash = gsap.utils.interpolate(washes);
      section.style.setProperty("--wash", washes[0]);

      // Intro reveal
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 75%" },
      });

      if (!scrollDriven) return;

      const distance = () => track.scrollWidth - window.innerWidth;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel-img]", track);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            section.style.setProperty("--wash", lerpWash(p) as string);
            if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
            const next = Math.round(p * (adultProductOrder.length - 1));
            setActive((prev) => (prev === next ? prev : next));
          },
        },
      });
      tl.to(track, { x: () => -distance() }, 0);
      // Inner-image drift so each room feels like a window, not a card.
      // The drift layer is 124% wide (left -12%), so ±5% of its width
      // (±6.2% of the card) never exposes an edge.
      panels.forEach((layer) => {
        tl.fromTo(layer, { xPercent: -5 }, { xPercent: 5 }, 0);
      });
    },
    { scope: sectionRef, dependencies: [scrollDriven], revertOnUpdate: true }
  );

  const close = useCallback(() => setOpenId(null), []);

  return (
    <section ref={sectionRef} id="adult-collection" className={styles.section} aria-label="The collection">
      <div ref={pinRef} className={styles.pin}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow} data-reveal>
              <span className={styles.eyebrowIndex}>02</span>
              {adultCollectionContent.eyebrow}
            </p>
            <h2 className={styles.headline} data-split>
              <span>{adultCollectionContent.headline[0]}</span>
              <em>{adultCollectionContent.headline[1]}</em>
            </h2>
          </div>
          <div className={styles.introSide} data-reveal>
            <p className={styles.description}>{adultCollectionContent.description}</p>
            {scrollDriven && (
              <div className={styles.progress} aria-hidden>
                <span className={styles.progressCount}>
                  {String(active + 1).padStart(2, "0")}
                  <i> / {String(adultProductOrder.length).padStart(2, "0")}</i>
                </span>
                <span className={styles.progressTrack}>
                  <span ref={barRef} className={styles.progressBar} />
                </span>
              </div>
            )}
          </div>
        </header>

        <div className={styles.viewport}>
          <div ref={trackRef} className={styles.track}>
            {adultProductOrder.map((id, i) => {
              const p = adultProducts[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.panel} ${scrollDriven && i === active ? styles.panelActive : ""}`}
                  style={{ ["--tint" as string]: p.tint, ["--deep" as string]: p.tintDeep }}
                  onClick={() => setOpenId(id)}
                  aria-label={`${p.name} — ${adultCollectionContent.viewLabel}`}
                >
                  <span className={styles.panelFrame}>
                    {/* GSAP drifts this layer; the image inside owns the hover zoom. */}
                    <span className={styles.panelDrift} data-panel-img>
                      <img
                        className={styles.panelImg}
                        src={adultImages.room(id)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  </span>
                  <span className={styles.panelMeta}>
                    <span className={styles.panelIndex}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.panelTitle}>{p.title}</span>
                    <span className={styles.panelSub}>
                      {p.benefits.join(" · ")}
                    </span>
                    <span className={styles.panelFoot}>
                      <span>{p.flavour}</span>
                      <span className={styles.panelCta}>{adultCollectionContent.viewLabel}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ProductDrawer productId={openId} onClose={close} />
    </section>
  );
}
