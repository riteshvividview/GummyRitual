import { useRef } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import type { Product } from "../../data/products";
import { getProductImage } from "./productImages";
import styles from "./FeaturedCollection.module.css";

const STAR_SLOTS = [0, 1, 2, 3, 4];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function StarRating({ rating }: { rating: number }) {
  const percent = Math.max(0, Math.min(1, rating / 5)) * 100;
  return (
    <span className={styles.stars} aria-hidden="true">
      <span className={styles.starsBase}>
        {STAR_SLOTS.map((slot) => (
          <Star key={slot} size={13} strokeWidth={1.75} />
        ))}
      </span>
      <span className={styles.starsFill} style={{ width: `${percent}%` }}>
        {STAR_SLOTS.map((slot) => (
          <Star key={slot} size={13} strokeWidth={1.75} fill="currentColor" />
        ))}
      </span>
    </span>
  );
}

interface ProductCardProps {
  product: Product;
  isActive: boolean;
  onSelect: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
}

/**
 * A single product's visual + ecommerce info. The circular-disc
 * positioning (translate/scale/rotate/opacity/blur/z-index) is applied
 * imperatively by ProductCarousel via `cardRef` on the card root — the
 * hover lift below targets a nested `.cardInner` wrapper instead of the
 * root, so it composites on top of that positioning rather than fighting
 * it for the same x/y/scale properties (same reasoning as the pill
 * cursor-parallax in WhyGummyRituals.tsx).
 */
export function ProductCard({ product, isActive, onSelect, cardRef }: ProductCardProps) {
  const imageUrl = getProductImage(product.image);
  const innerRef = useRef<HTMLDivElement>(null);
  const hoverTweenRef = useRef<{ y: (v: number) => void; scale: (v: number) => void } | null>(null);
  const tintClass = styles[`tint${capitalize(product.tint ?? "orange")}`];

  function hoverTween() {
    if (!hoverTweenRef.current && innerRef.current) {
      const el = innerRef.current;
      hoverTweenRef.current = {
        y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
        scale: gsap.quickTo(el, "scale", { duration: 0.4, ease: "power3.out" }),
      };
    }
    return hoverTweenRef.current;
  }

  function handlePointerEnter(event: React.PointerEvent) {
    if (event.pointerType === "touch") return;
    const tween = hoverTween();
    tween?.y(-8);
    tween?.scale(1.035);
  }

  function handlePointerLeave() {
    const tween = hoverTween();
    tween?.y(0);
    tween?.scale(1);
  }

  return (
    <div
      ref={cardRef}
      // tintClass also goes on the card root (not just the badge/placeholder
      // below) purely so its --card-tint-fg custom property cascades down
      // to .productName for its hover color/underline.
      className={`${styles.card} ${tintClass}`}
      role="button"
      tabIndex={isActive ? -1 : 0}
      aria-current={isActive ? "true" : undefined}
      aria-label={isActive ? undefined : `Show ${product.name}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className={styles.cardInner} ref={innerRef}>
        <div className={styles.cardMedia}>
          {product.discountLabel && (
            <span className={`${styles.discountBadge} ${tintClass}`}>{product.discountLabel}</span>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={styles.productImage}
              loading={isActive ? "eager" : "lazy"}
              draggable={false}
              onLoad={(event) => event.currentTarget.classList.add("img-fade-loaded")}
            />
          ) : (
            <div className={`${styles.imagePlaceholder} ${tintClass}`}>
              <span>{product.name}</span>
            </div>
          )}
        </div>

        <div className={styles.cardInfo}>
          <p className={styles.productName}>{product.name}</p>

          {product.rating !== undefined && (
            <div className={styles.ratingRow}>
              <StarRating rating={product.rating} />
              {product.reviewCount !== undefined && (
                <span className={styles.reviewCount}>
                  {product.rating.toFixed(1)} ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price}</span>
            {product.originalPrice !== undefined && (
              <span className={styles.originalPrice}>₹{product.originalPrice}</span>
            )}
            {product.discountLabel && (
              <span className={`${styles.discountPill} ${tintClass}`}>{product.discountLabel}</span>
            )}
          </div>

          <button
            type="button"
            className={styles.addToCart}
            onClick={(event) => event.stopPropagation()}
          >
            <ShoppingCart size={16} strokeWidth={2.25} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
