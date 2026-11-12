import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../../../animations/gsap";
import { adultNeedsContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts } from "../../../data/adults/adultProducts";
import { useIsMobile } from "../../../hooks/useMediaQuery";
import { adultImages } from "../common/adultImages";
import { Ornament } from "../ornaments/Ornament";
import styles from "./BodyAsks.module.css";

const { needs } = adultNeedsContent;

/**
 * 03 · What does your body ask for?
 * A typographic index — five words in Gloock beside one photograph.
 * On desktop the word nearest the middle of the screen activates as you
 * scroll (so it never depends on hover); hover, focus and tap all
 * select too. The photo wipes up from below and the page takes on the
 * product's wash.
 */
export function BodyAsks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const activeRef = useRef(0);
  const isMobile = useIsMobile();

  const select = (i: number) => {
    if (i === activeRef.current) return;
    setPrev(activeRef.current);
    activeRef.current = i;
    setActive(i);
  };

  useGSAP(
    () => {
      const section = sectionRef.current!;
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        y: 50,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%" },
      });
      if (isMobile) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-need]", section);
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && select(i),
        });
      });
    },
    { scope: sectionRef, dependencies: [isMobile], revertOnUpdate: true }
  );

  const need = needs[active];
  const product = adultProducts[need.product];

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ ["--wash" as string]: product.wash, ["--deep" as string]: product.tintDeep }}
      aria-labelledby="adult-needs-title"
    >
      <Ornament art="sprig" place="needs" parallax={30} />
      <div className={styles.inner}>
        <div className={styles.listCol}>
          <p className={styles.eyebrow} data-reveal>
            <span className={styles.eyebrowIndex}>03</span>
            {adultNeedsContent.eyebrow}
          </p>
          <h2 id="adult-needs-title" className={styles.headline} data-split>
            {adultNeedsContent.headline}
          </h2>

          <ol className={styles.list}>
            {needs.map((n, i) => {
              const p = adultProducts[n.product];
              const isActive = i === active;
              return (
                <li key={n.id} data-need className={styles.row}>
                  <button
                    type="button"
                    className={`${styles.word} ${isActive ? styles.wordActive : ""}`}
                    onClick={() => select(i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && select(i)}
                    onFocus={() => select(i)}
                    aria-pressed={isActive}
                    data-reveal
                  >
                    <span className={styles.wordIndex}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.wordText}>{n.word}.</span>
                    <span className={styles.wordProduct}>{p.title}</span>
                  </button>
                  <div className={`${styles.detail} ${isActive ? styles.detailOpen : ""}`}>
                    <div className={styles.detailInner}>
                      <p className={styles.detailLine}>{n.line}</p>
                      <p className={styles.detailIngredients}>{n.ingredients}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.mediaCol}>
          <figure className={styles.frame}>
            {needs.map((n, i) => (
              <img
                key={n.id}
                src={adultImages.need(n.id)}
                alt={i === active ? `${n.word} — ${adultProducts[n.product].name}` : ""}
                aria-hidden={i !== active}
                decoding="async"
                className={`${styles.photo} ${i === active ? styles.photoActive : ""} ${
                  i === prev ? styles.photoPrev : ""
                }`}
              />
            ))}
            <figcaption className={styles.caption} key={need.id}>
              <span className={styles.captionName}>{product.name}</span>
              <span className={styles.captionMeta}>
                {product.flavour} · {product.price}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
