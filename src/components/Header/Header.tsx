import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react";
import { gsap } from "../../animations/gsap/gsapConfig";
import { getLenis } from "../../hooks/useLenis";
import { useHideOnScroll } from "../../hooks/useHideOnScroll";
import { useScrolled } from "../../hooks/useScrolled";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { headerContent, type NavItem } from "../../data/headerContent";
import logo from "../../assets/gummyrituallogo.png";
import { ModeToggle } from "./ModeToggle";
import { ShopMegaMenu, IngredientsMenu } from "./DropdownPanels";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

type DropdownKey = "shop" | "ingredients";

export function Header() {
  const hidden = useHideOnScroll();
  const scrolled = useScrolled();
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [openMenu, setOpenMenu] = useState<DropdownKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // One-time floating entrance on mount — the bar drops into place rather
  // than simply appearing, reinforcing that it's a floating element rather
  // than a static page-top bar.
  useGSAP(
    () => {
      if (!headerRef.current) return;
      if (prefersReducedMotion) return;
      gsap.from(headerRef.current, {
        y: -28,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
        // Without this, GSAP leaves an inline transform behind after the
        // tween completes — inline styles beat the .headerHidden CSS
        // class's own transform, which silently broke hide-on-scroll.
        clearProps: "transform,opacity",
      });
    },
    { scope: headerRef }
  );

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const openDropdown = (key: DropdownKey) => {
    cancelClose();
    setOpenMenu(key);
  };

  const toggleDropdown = (key: DropdownKey) => {
    cancelClose();
    setOpenMenu((current) => (current === key ? null : key));
  };

  // Close on outside click/focus and on Escape.
  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    const lenis = getLenis();
    if (mobileOpen) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const renderNavItem = (item: NavItem) => {
    if (!item.dropdown) {
      return (
        <a key={item.label} href={item.href} className={styles.navLink}>
          {item.label}
        </a>
      );
    }

    const key = item.dropdown;
    const isOpen = openMenu === key;

    return (
      <div
        key={item.label}
        className={styles.navItemWrap}
        onMouseEnter={() => openDropdown(key)}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          className={`${styles.navLink} ${styles.navTrigger} ${isOpen ? styles.navTriggerOpen : ""}`}
          aria-expanded={isOpen}
          onClick={() => toggleDropdown(key)}
        >
          {item.label}
          <ChevronDown size={14} strokeWidth={2.25} className={styles.navChevron} />
        </button>
        {isOpen && (
          <div className={`${styles.menuPanel} ${key === "shop" ? styles.menuPanelWide : ""}`}>
            {key === "shop" ? (
              <ShopMegaMenu onNavigate={() => setOpenMenu(null)} />
            ) : (
              <IngredientsMenu onNavigate={() => setOpenMenu(null)} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={`${styles.headerFloat} ${hidden ? styles.headerHidden : ""}`}
        ref={headerRef}
      >
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <a href="/" className={styles.logo}>
            <img src={logo} alt="The Gummy Rituals" className={styles.logoImage} />
          </a>

          <div className={styles.modeToggleSlot}>
            <ModeToggle />
          </div>

          <div className={styles.nav} ref={navRef} aria-label="Primary">
            {headerContent.primaryNav.map(renderNavItem)}
          </div>

          <div className={styles.actions}>
            <div className={styles.iconGroup}>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.searchButton}`}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.accountButton}`}
                aria-label="Account"
              >
                <User size={18} strokeWidth={2} />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Shopping bag">
                <ShoppingBag size={18} strokeWidth={2} />
                <span className={styles.cartCount}>0</span>
              </button>
            </div>
            <a href="/shop" className={styles.ctaButton}>
              Shop Gummies
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        </header>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
