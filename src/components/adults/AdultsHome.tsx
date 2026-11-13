import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "../../animations/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { AdultHero } from "./Hero/AdultHero";
import { TheEdit } from "./Collection/TheEdit";
import { BodyAsks } from "./Needs/BodyAsks";
import { InsideEveryGummy } from "./Ingredients/InsideEveryGummy";
import { ADayHeldLightly } from "./Day/ADayHeldLightly";
import { BetterTogether } from "./Together/BetterTogether";
import { UpClose } from "./Texture/UpClose";
import { FormulatedWithCare } from "./Trust/FormulatedWithCare";
import { TheLineup } from "./FinalCta/TheLineup";
import styles from "./AdultsHome.module.css";

/**
 * Adults homepage — a separate visual world from Kids (studio stone,
 * plaster and paper; Gloock + Jost). Sections are self-contained so each
 * can become its own Shopify section later.
 *
 * Shared motion: every section headline marked `data-split` rises in
 * word by word from behind a line mask as it scrolls into view.
 */
export function AdultsHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    (_, contextSafe) => {
      if (reduced) return;
      const run = contextSafe!(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]", rootRef.current).forEach((el) => {
          const split = SplitText.create(el, { type: "lines,words", mask: "lines" });
          gsap.from(split.words, {
            yPercent: 135,
            duration: 1.15,
            stagger: 0.06,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
      });
      // Split after the display font loads, or line breaks will be wrong.
      (document.fonts?.ready ?? Promise.resolve()).then(run);
    },
    { scope: rootRef, dependencies: [reduced] }
  );

  return (
    <div ref={rootRef} className={styles.root}>
      <AdultHero />
      <TheEdit />
      <BodyAsks />
      <InsideEveryGummy />
      <ADayHeldLightly />
      <BetterTogether />
      <UpClose />
      <FormulatedWithCare />
      <TheLineup />
    </div>
  );
}
