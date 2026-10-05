import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { headerContent } from "../../data/headerContent";
import { products } from "../../data/products";
import { ingredientsContent } from "../../data/ingredientsContent";
import { getProductImage } from "../FeaturedCollection/productImages";
import { getIngredientImage } from "../Ingredients/ingredientImages";
import { headerIconMap } from "./headerIcons";
import styles from "./DropdownPanels.module.css";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Entrance-only reveal, replayed every time a panel mounts (i.e. every
 * time the dropdown opens — there's no exit animation, matching the
 * mount/unmount reveal pattern used elsewhere in this codebase). */
function usePanelReveal(selector: string) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !panelRef.current) return;
      gsap.from(panelRef.current.querySelectorAll(selector), {
        opacity: 0,
        y: 10,
        duration: 0.35,
        ease: "power3.out",
        stagger: 0.035,
      });
    },
    { scope: panelRef, dependencies: [] }
  );

  return panelRef;
}

interface MenuProps {
  onNavigate: () => void;
}

export function ShopMegaMenu({ onNavigate }: MenuProps) {
  const panelRef = usePanelReveal(`.${styles.revealItem}`);
  const { shopMenu } = headerContent;
  const featuredProduct = products.find((product) => product.id === shopMenu.featuredProductId);
  const featuredImage = getProductImage(featuredProduct?.image);

  return (
    <div className={styles.shopPanel} ref={panelRef}>
      <ul className={styles.categoryList}>
        {shopMenu.categories.map((category, index) => {
          const product = products.find((item) => item.id === category.productId);
          const Icon = headerIconMap[category.icon];
          if (!product) return null;
          return (
            <li key={category.productId}>
              <a
                href={`/shop/${product.id}`}
                className={`${styles.categoryLink} ${styles.revealItem} ${
                  index === 0 ? styles.categoryLinkFeatured : ""
                }`}
                onClick={onNavigate}
              >
                <span className={`${styles.categoryIcon} ${styles[`tint${capitalize(product.tint ?? "orange")}`]}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className={styles.categoryText}>
                  <span className={styles.categoryName}>{product.name}</span>
                  <span className={styles.categorySubtitle}>{category.subtitle}</span>
                </span>
                <ArrowRight size={16} strokeWidth={2} className={styles.categoryArrow} />
              </a>
            </li>
          );
        })}
        <li>
          <a
            href="/shop"
            className={`${styles.categoryLink} ${styles.revealItem}`}
            onClick={onNavigate}
          >
            <span className={`${styles.categoryIcon} ${styles.tintNeutral}`}>
              <LayoutGrid size={20} strokeWidth={1.75} />
            </span>
            <span className={styles.categoryText}>
              <span className={styles.categoryName}>{shopMenu.allProductsLabel}</span>
              <span className={styles.categorySubtitle}>{shopMenu.allProductsSubtitle}</span>
            </span>
            <ArrowRight size={16} strokeWidth={2} className={styles.categoryArrow} />
          </a>
        </li>
      </ul>

      <div className={styles.benefitColumn}>
        <p className={`${styles.columnHeading} ${styles.revealItem}`}>{shopMenu.benefitsHeading}</p>
        <ul className={styles.benefitList}>
          {shopMenu.benefits.map((benefit) => {
            const Icon = headerIconMap[benefit.icon];
            return (
              <li key={benefit.label}>
                <a
                  href={`/shop?benefit=${encodeURIComponent(benefit.label)}`}
                  className={`${styles.benefitLink} ${styles.revealItem}`}
                  onClick={onNavigate}
                >
                  <span className={styles.benefitIcon}>
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className={styles.benefitLabel}>{benefit.label}</span>
                  <ArrowRight size={14} strokeWidth={2} className={styles.benefitArrow} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {featuredProduct && (
        <a
          href={`/shop/${featuredProduct.id}`}
          className={`${styles.featuredCard} ${styles.revealItem}`}
          onClick={onNavigate}
        >
          <span className={styles.featuredBadge}>{shopMenu.featuredBadge}</span>
          <span className={styles.featuredName}>{featuredProduct.name}</span>
          <span className={styles.featuredDescription}>{shopMenu.featuredDescription}</span>
          <span className={styles.featuredCta}>
            {shopMenu.featuredCtaLabel}
            <ArrowRight size={14} strokeWidth={2.5} />
          </span>
          {featuredImage && (
            <img src={featuredImage} alt="" className={styles.featuredImage} />
          )}
        </a>
      )}
    </div>
  );
}

const ingredientTints = ["tintOrange", "tintBlue", "tintGreen", "tintPink"];

export function IngredientsMenu({ onNavigate }: MenuProps) {
  const panelRef = usePanelReveal(`.${styles.revealItem}`);

  return (
    <div className={styles.ingredientsPanel} ref={panelRef}>
      <p className={`${styles.columnHeading} ${styles.revealItem}`}>
        {headerContent.ingredientsMenu.heading}
      </p>
      <ul className={styles.ingredientList}>
        {ingredientsContent.ingredients.map((ingredient, index) => {
          const iconSrc = getIngredientImage(ingredient.icon);
          const tintClass = styles[ingredientTints[index % ingredientTints.length]];
          return (
            <li key={ingredient.id}>
              <a
                href={`/ingredients#${ingredient.id}`}
                className={`${styles.ingredientLink} ${styles.revealItem}`}
                onClick={onNavigate}
              >
                <span className={`${styles.ingredientIconWrap} ${tintClass}`}>
                  {iconSrc && <img src={iconSrc} alt="" className={styles.ingredientIcon} />}
                </span>
                <span className={styles.ingredientText}>
                  <span className={styles.ingredientName}>{ingredient.label}</span>
                  <span className={styles.ingredientDescription}>{ingredient.description}</span>
                </span>
                <ArrowRight size={15} strokeWidth={2} className={styles.ingredientArrow} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
