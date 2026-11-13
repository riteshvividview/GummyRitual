import { useEffect, useRef, useState } from "react";
import { adultCollectionContent } from "../../../data/adults/adultSectionsContent";
import { adultProducts, type AdultProductId } from "../../../data/adults/adultProducts";
import { getLenis } from "../../../hooks/useLenis";
import { adultImages } from "../common/adultImages";
import styles from "./TheEdit.module.css";

interface ProductDrawerProps {
  productId: AdultProductId | null;
  onClose: () => void;
}

/**
 * Side sheet with a still life composed from the product cutouts
 * (pouch, sachet, gummies) on the product's own colour.
 */
export function ProductDrawer({ productId, onClose }: ProductDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const stillRef = useRef<HTMLDivElement>(null);
  const open = productId !== null;
  // Keep showing the last product while the drawer slides closed.
  const [shownId, setShownId] = useState<AdultProductId>(productId ?? "essentials");
  if (productId && productId !== shownId) setShownId(productId);
  const product = adultProducts[shownId];
  const copy = adultCollectionContent.drawer;

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus();
    };
  }, [open, onClose]);

  // Gentle pointer parallax on the still life (hover devices only).
  useEffect(() => {
    const el = stillRef.current;
    if (!open || !el || !window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
      el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [open]);

  return (
    <div className={`${styles.drawerRoot} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className={styles.scrim}
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close"
      />
      <aside
        className={styles.drawer}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        style={{ ["--tint" as string]: product.tint, ["--wash" as string]: product.wash, ["--deep" as string]: product.tintDeep }}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <span aria-hidden />
        </button>

        <div ref={stillRef} className={styles.still} key={shownId}>
          <span className={styles.stillDisc} aria-hidden />
          <img className={styles.stillPouch} src={adultImages.pouch(product.id)} alt={product.name} />
          <img className={styles.stillSachet} src={adultImages.sachet(product.id)} alt="" aria-hidden />
          <img className={styles.stillGummies} src={adultImages.gummies(product.id)} alt="" aria-hidden />
        </div>

        <div className={styles.drawerBody} key={`b-${shownId}`}>
          <p className={styles.drawerEyebrow}>
            {product.flavour} · {product.count}
          </p>
          <h3 className={styles.drawerTitle}>{product.name}</h3>
          <p className={styles.drawerDesc}>{product.description}</p>

          <dl className={styles.facts}>
            <div>
              <dt>{copy.benefitsLabel}</dt>
              <dd>{product.benefits.join(" · ")}</dd>
            </div>
            <div>
              <dt>{copy.ingredientsLabel}</dt>
              <dd>
                <ul className={styles.chips}>
                  {product.keyIngredients.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>{copy.ritualLabel}</dt>
              <dd>{copy.ritual}</dd>
            </div>
          </dl>

          <div className={styles.buy}>
            <span className={styles.buyPrice}>{product.price}</span>
            <button type="button" className={styles.buyButton}>
              {adultCollectionContent.addLabel}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
