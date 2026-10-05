import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ChevronDown, Search, User, X } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { headerContent, type NavItem } from "../../data/headerContent";
import { products } from "../../data/products";
import { ingredientsContent } from "../../data/ingredientsContent";
import { headerIconMap } from "./headerIcons";
import logo from "../../assets/gummyrituallogo.png";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<"shop" | "ingredients" | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!open || prefersReducedMotion || !listRef.current) return;
      gsap.from(listRef.current.querySelectorAll(`.${styles.revealItem}`), {
        opacity: 0,
        x: 16,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.05,
      });
    },
    { dependencies: [open], scope: listRef }
  );

  const toggleExpanded = (key: "shop" | "ingredients") => {
    setExpanded((current) => (current === key ? null : key));
  };

  const renderNavItem = (item: NavItem) => {
    if (!item.dropdown) {
      return (
        <li key={item.label} className={styles.revealItem}>
          <a href={item.href} className={styles.navLink} onClick={onClose}>
            {item.label}
          </a>
        </li>
      );
    }

    const isExpanded = expanded === item.dropdown;

    return (
      <li key={item.label} className={styles.revealItem}>
        <button
          type="button"
          className={styles.navLink}
          aria-expanded={isExpanded}
          onClick={() => toggleExpanded(item.dropdown as "shop" | "ingredients")}
        >
          {item.label}
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`${styles.navChevron} ${isExpanded ? styles.navChevronOpen : ""}`}
          />
        </button>
        {isExpanded && (
          <ul className={styles.subList}>
            {item.dropdown === "shop"
              ? products
                  .filter((product) => product.experience === "kids")
                  .map((product) => {
                    const category = headerContent.shopMenu.categories.find(
                      (entry) => entry.productId === product.id
                    );
                    const Icon = category ? headerIconMap[category.icon] : null;
                    return (
                      <li key={product.id}>
                        <a href={`/shop/${product.id}`} className={styles.subLink} onClick={onClose}>
                          {Icon && <Icon size={16} strokeWidth={1.75} />}
                          {product.name}
                        </a>
                      </li>
                    );
                  })
              : ingredientsContent.ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    <a
                      href={`/ingredients#${ingredient.id}`}
                      className={styles.subLink}
                      onClick={onClose}
                    >
                      {ingredient.label}
                    </a>
                  </li>
                ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <div className={styles.drawerHeader}>
          <img src={logo} alt="The Gummy Rituals" className={styles.drawerLogo} />
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <button type="button" className={styles.searchField}>
          <Search size={16} strokeWidth={2} />
          Search
        </button>

        <ul className={styles.navList} ref={listRef}>
          {headerContent.primaryNav.map(renderNavItem)}
        </ul>

        <div className={styles.drawerFooter}>
          <a href="/account" className={`${styles.accountLink} ${styles.revealItem}`} onClick={onClose}>
            <User size={16} strokeWidth={2} />
            My Account
          </a>
          <a href="/shop" className={`${styles.drawerCta} ${styles.revealItem}`} onClick={onClose}>
            Shop Gummies
            <ArrowRight size={16} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </>
  );
}
