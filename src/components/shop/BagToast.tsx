import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getProduct } from "../../data/catalog";
import { useCart } from "../../state/CartContext";
import { packImage } from "./shopImages";
import styles from "./BagToast.module.css";

/** Quiet "added to bag" confirmation — appears for any add, anywhere. */
export function BagToast() {
  const { lastAdded, count } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const product = lastAdded ? getProduct(lastAdded.line.productId) : undefined;
  if (!product) return null;
  const { packSize, subscribe, quantity } = lastAdded!.line;

  return (
    <div className={`${styles.toast} ${visible ? styles.on : ""}`} role="status" aria-live="polite">
      <img src={packImage(product)} alt="" className={styles.pack} />
      <div className={styles.text}>
        <span className={styles.title}>
          <Check size={14} strokeWidth={2.6} /> Added to bag
        </span>
        <span className={styles.meta}>
          {quantity} × {product.title} · {packSize} {packSize > 1 ? "pouches" : "pouch"}
          {subscribe ? " · subscription" : ""}
          {lastAdded!.extra ? ` + ${lastAdded!.extra} more` : ""}
        </span>
      </div>
      <a href="/cart" className={styles.view} tabIndex={visible ? 0 : -1}>
        View bag <span className={styles.count}>{count}</span>
      </a>
    </div>
  );
}
