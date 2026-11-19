import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Lock, Minus, Plus, RefreshCw, Truck, X } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { catalog, formatINR, getProduct, packPrice, type CatalogProduct } from "../../data/catalog";
import { useCart, type CartLine } from "../../state/CartContext";
import { packImage } from "./shopImages";
import styles from "./CartPage.module.css";

/** Free shipping threshold and flat rate below it (₹). */
const FREE_SHIPPING = 999;
const SHIPPING = 79;

function lineTotals(line: CartLine, p: CatalogProduct) {
  const total = packPrice(p, line.packSize, line.subscribe) * line.quantity;
  const full = (p.compareAt ?? p.price) * line.packSize * line.quantity;
  return { total, full };
}

/**
 * /cart — the bag. Line items you can adjust, a summary with a free-
 * shipping meter, and suggestions to complete the ritual. Checkout is a
 * prototype stop: in production this hands off to Shopify checkout.
 */
export function CartPage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { lines, setQuantity, remove, add, count } = useCart();
  const [checkoutNote, setCheckoutNote] = useState(false);

  const items = lines
    .map((line, index) => ({ line, index, p: getProduct(line.productId) }))
    .filter((i): i is { line: CartLine; index: number; p: CatalogProduct } => Boolean(i.p));

  const subtotal = items.reduce((n, i) => n + lineTotals(i.line, i.p).total, 0);
  const full = items.reduce((n, i) => n + lineTotals(i.line, i.p).full, 0);
  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : SHIPPING;
  const toFree = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING);

  const inBag = new Set(items.map((i) => i.p.id));
  const ranges = new Set(items.map((i) => i.p.range));
  const suggestions = catalog
    .filter((p) => !inBag.has(p.id))
    .sort((a, b) => Number(ranges.has(b.range)) - Number(ranges.has(a.range)))
    .slice(0, 3);

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const q = gsap.utils.selector(ref);
      gsap.from(q("[data-in]"), { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 });
    },
    { scope: ref, dependencies: [reduced, items.length === 0] }
  );

  // Remove with a quick collapse before the line leaves state.
  const removeLine = (index: number, el: HTMLElement | null) => {
    if (!el || reduced) return remove(index);
    gsap.to(el, {
      autoAlpha: 0,
      x: 30,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      duration: 0.45,
      ease: "power3.in",
      onComplete: () => remove(index),
    });
  };

  if (items.length === 0) {
    return (
      <div ref={ref} className={styles.page}>
        <section className={styles.empty}>
          <div className={styles.emptyPacks} data-in aria-hidden>
            {catalog.slice(0, 3).map((p, i) => (
              <img key={p.id} src={packImage(p)} alt="" style={{ ["--i" as string]: i - 1 }} />
            ))}
          </div>
          <h1 className={styles.emptyTitle} data-in>
            Your bag is empty.
          </h1>
          <p className={styles.emptyText} data-in>
            A small ritual is only a gummy away.
          </p>
          <div className={styles.emptyActions} data-in>
            <a href="/shop?range=kids" className={styles.primaryBtn}>
              Shop kids
            </a>
            <a href="/shop?range=adults" className={styles.ghostBtn}>
              Shop adults
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow} data-in>
          Your bag
        </p>
        <h1 className={styles.title} data-in>
          {count} {count === 1 ? "item" : "items"}, ready for their ritual.
        </h1>
      </header>

      <div className={styles.layout}>
        <section aria-label="Items in your bag">
          <div className={styles.meter} data-in>
            <p>
              <Truck size={17} strokeWidth={1.8} />
              {toFree > 0 ? (
                <>
                  You’re <strong>{formatINR(toFree)}</strong> away from free shipping
                </>
              ) : (
                <>
                  <strong>Free shipping</strong> unlocked
                </>
              )}
            </p>
            <span className={styles.meterTrack}>
              <span className={styles.meterFill} style={{ transform: `scaleX(${progress})` }} />
            </span>
          </div>

          <ul className={styles.lines}>
            {items.map(({ line, index, p }) => {
              const { total, full: lineFull } = lineTotals(line, p);
              return (
                <li
                  key={`${p.id}-${line.packSize}-${line.subscribe}`}
                  className={`${styles.line} ${p.range === "kids" ? styles.kids : styles.adults}`}
                  style={{ ["--wash" as string]: p.wash, ["--deep" as string]: p.tintDeep }}
                  data-in
                >
                  <a href={`/shop/${p.id}`} className={styles.thumb}>
                    <img src={packImage(p)} alt="" draggable={false} />
                  </a>
                  <div className={styles.lineInfo}>
                    <span className={styles.lineRange}>{p.range === "kids" ? "Kids" : "Adults"}</span>
                    <a href={`/shop/${p.id}`} className={styles.lineName}>
                      {p.title}
                    </a>
                    <span className={styles.lineDetail}>
                      {line.packSize} {line.packSize > 1 ? "pouches" : "pouch"} · {p.flavour}
                    </span>
                    {line.subscribe && (
                      <span className={styles.lineSub}>
                        <RefreshCw size={12} /> Subscription · every {line.packSize * 30} days
                      </span>
                    )}
                    <div className={styles.lineControls}>
                      <div className={styles.qty} aria-label={`Quantity of ${p.title}`}>
                        <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(index, line.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span aria-live="polite">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(index, line.quantity + 1)}
                          disabled={line.quantity >= 9}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={(e) => removeLine(index, e.currentTarget.closest("li"))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.linePrice}>
                    <strong>{formatINR(total)}</strong>
                    {lineFull > total && <s>{formatINR(lineFull)}</s>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className={styles.summary} aria-label="Order summary" data-in>
          <h2 className={styles.summaryTitle}>Summary</h2>
          <dl className={styles.rows}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(full)}</dd>
            </div>
            {full > subtotal && (
              <div className={styles.saveRow}>
                <dt>Savings</dt>
                <dd>−{formatINR(full - subtotal)}</dd>
              </div>
            )}
            <div>
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <div className={styles.totalRow}>
              <dt>Total</dt>
              <dd>{formatINR(subtotal + shipping)}</dd>
            </div>
          </dl>
          <p className={styles.tax}>Inclusive of all taxes</p>
          <button type="button" className={styles.checkout} onClick={() => setCheckoutNote(true)}>
            <Lock size={16} /> Checkout securely
            <ArrowRight size={16} />
          </button>
          {checkoutNote && (
            <p className={styles.note} role="status">
              This prototype stops here — in the live store, checkout hands off to Shopify with UPI, cards and cash
              on delivery.
              <button type="button" onClick={() => setCheckoutNote(false)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </p>
          )}
          <ul className={styles.pay}>
            <li>UPI</li>
            <li>Cards</li>
            <li>Net banking</li>
            <li>COD</li>
          </ul>
          <a href="/shop" className={styles.continue}>
            Continue shopping
          </a>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className={styles.more}>
          <h2 className={styles.moreTitle}>Complete the ritual</h2>
          <div className={styles.moreGrid}>
            {suggestions.map((p) => (
              <div
                key={p.id}
                className={`${styles.moreCard} ${p.range === "kids" ? styles.kids : styles.adults}`}
                style={{ ["--wash" as string]: p.wash, ["--deep" as string]: p.tintDeep }}
              >
                <a href={`/shop/${p.id}`} className={styles.moreStage}>
                  <img src={packImage(p)} alt="" loading="lazy" draggable={false} />
                </a>
                <div className={styles.moreInfo}>
                  <a href={`/shop/${p.id}`} className={styles.moreName}>
                    {p.title}
                  </a>
                  <span className={styles.morePrice}>{formatINR(p.price)}</span>
                </div>
                <button
                  type="button"
                  className={styles.moreAdd}
                  onClick={() => add({ productId: p.id, packSize: 1, subscribe: false, quantity: 1 })}
                  aria-label={`Add ${p.title} to bag`}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
