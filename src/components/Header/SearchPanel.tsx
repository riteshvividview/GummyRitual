import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { catalog, formatINR } from "../../data/catalog";
import { benefitDetails } from "../../data/benefitsContent";
import { getLenis } from "../../hooks/useLenis";
import { packImage } from "../shop/shopImages";
import styles from "./SearchPanel.module.css";

/**
 * Header search — instant, client-side over the catalogue and benefits.
 * (Shopify's predictive search API replaces the matching later.)
 */
export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const lenis = getLenis();
    lenis?.stop();
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const products = useMemo(
    () =>
      catalog.filter((p) =>
        !q
          ? true
          : [p.name, p.title, p.flavour, p.range, ...p.benefits, ...p.keyIngredients.map((i) => i.name)]
              .join(" ")
              .toLowerCase()
              .includes(q)
      ),
    [q]
  );
  const benefits = useMemo(
    () =>
      q
        ? benefitDetails.filter((b) =>
            [b.label, b.headline, ...b.nutrients.map((n) => n.name)].join(" ").toLowerCase().includes(q)
          )
        : [],
    [q]
  );

  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Search">
        <div className={styles.field}>
          <Search size={20} strokeWidth={1.8} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gummies, benefits, ingredients…"
            aria-label="Search"
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        <div className={styles.results} onClick={(e) => (e.target as Element).closest("a") && onClose()}>
          {benefits.length > 0 && (
            <>
              <p className={styles.group}>Benefits</p>
              <ul className={styles.benefits}>
                {benefits.map((b) => (
                  <li key={b.id}>
                    <a href={`/benefits#${b.id}`} style={{ ["--tint" as string]: b.tint }}>
                      {b.label} <ArrowRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className={styles.group}>{q ? `Products · ${products.length}` : "All products"}</p>
          {products.length === 0 ? (
            <p className={styles.none}>No gummies match “{query}”. Try “immunity”, “calcium” or “gut”.</p>
          ) : (
            <ul className={styles.products}>
              {products.map((p) => (
                <li key={p.id}>
                  <a href={`/shop/${p.id}`} style={{ ["--wash" as string]: p.wash }}>
                    <span className={styles.thumb}>
                      <img src={packImage(p)} alt="" />
                    </span>
                    <span className={styles.text}>
                      <span className={styles.range}>{p.range === "kids" ? "Kids" : "Adults"}</span>
                      <span className={styles.name}>{p.title}</span>
                    </span>
                    <span className={styles.price}>{formatINR(p.price)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
